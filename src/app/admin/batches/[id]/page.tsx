
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { userService } from '@/services/user.service';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/context/auth-context';
import { Batch, Client, UserProfile, BatchStatus } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, MessageSquare, ArrowLeft, Clock, ShoppingBag, 
  Link as LinkIcon, FileText, Video, User, ShieldCheck, Globe, Info, Building2, Send, Loader2, History, Users, Edit, CheckCircle2, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { AssignEditorsDialog } from '@/components/batches/assign-editors-dialog';

export default function AdminBatchDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [clientUser, setClientUser] = useState<UserProfile | null>(null);
  const [assignedEditors, setAssignedEditors] = useState<UserProfile[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [driveLink, setDriveLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const batchRef = useMemoFirebase(() => {
    return id ? doc(db, 'batches', id as string) : null;
  }, [id]);

  const { data: batch, isLoading: loadingBatch } = useDoc<Batch>(batchRef);

  useEffect(() => {
    if (batch) {
      if (batch.driveLink && !driveLink) {
        setDriveLink(batch.driveLink);
      }
      
      const loadExtras = async () => {
        try {
          const [clientData, userData, allUsers] = await Promise.all([
            clientService.getClient(batch.clientId),
            userService.getProfile(batch.clientUserUid),
            userService.getAllUsers()
          ]);
          
          setClient(clientData);
          setClientUser(userData);
          
          if (batch.assignedEditorUids && batch.assignedEditorUids.length > 0) {
            const editors = allUsers.filter(u => batch.assignedEditorUids.includes(u.uid));
            setAssignedEditors(editors);
          } else {
            setAssignedEditors([]);
          }
        } catch (error) {
          console.error("Error loading admin batch detail extras:", error);
        } finally {
          setLoadingExtras(false);
        }
      };

      loadExtras();
    }
  }, [batch]);

  const handleDeliver = async () => {
    if (!driveLink.trim().startsWith('https://')) {
      toast({ 
        title: "Link inválido", 
        description: "Debes ingresar una URL válida de Google Drive.", 
        variant: "destructive" 
      });
      return;
    }

    if (!batch || !profile) return;

    setSubmitting(true);
    
    try {
      await batchService.submitDelivery(batch.id, driveLink, profile.uid, profile.displayName, true);
      
      const chatId = await chatService.getOrCreateChat(
        batch.id, 
        batch.clientId, 
        batch.clientUserUid, 
        batch.assignedEditorUids, 
        profile.uid
      );

      await chatService.sendMessage(
        chatId, 
        profile.uid, 
        profile.role, 
        'drive_link', 
        `Entrega realizada por Administrador. Link: ${driveLink}`
      );
      
      toast({ title: "Tanda entregada", description: "El material ha sido registrado y el cliente notificado." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo procesar la entrega.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveReview = async () => {
    if (!batch || !profile) return;
    setSubmitting(true);
    try {
      await batchService.approveDelivery(batch.id, profile.uid, profile.displayName);
      
      const chatId = await chatService.getOrCreateChat(
        batch.id, 
        batch.clientId, 
        batch.clientUserUid, 
        batch.assignedEditorUids, 
        profile.uid
      );

      await chatService.sendMessage(
        chatId, 
        profile.uid, 
        profile.role, 
        'system', 
        `✅ Entrega Aprobada por Administrador. El material ya está visible para el cliente.`
      );

      toast({ title: "Entrega Aprobada", description: "La tanda ahora es visible para el cliente." });
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectReview = async () => {
    if (!batch || !profile) return;
    setSubmitting(true);
    try {
      await batchService.rejectDelivery(batch.id, profile.uid, profile.displayName);
      
      const chatId = await chatService.getOrCreateChat(
        batch.id, 
        batch.clientId, 
        batch.clientUserUid, 
        batch.assignedEditorUids, 
        profile.uid
      );

      await chatService.sendMessage(
        chatId, 
        profile.uid, 
        profile.role, 
        'revision_request', 
        `❌ Entrega RECHAZADA por Admin. Por favor, revisen el material enviado y vuelvan a entregar.`
      );

      toast({ title: "Entrega Rechazada", description: "Se ha notificado a los editores para corregir." });
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: any, formatStr: string) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, formatStr, { locale: es }) : 'N/A';
  };

  if (loadingBatch) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-muted rounded-full" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!batch) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">No se encontró la tanda</h2>
          <Button asChild className="mt-4">
            <Link href="/admin/batches">Volver al listado</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/batches"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{batch.title}</h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-primary" /> 
              Supervisión de Administrador • Creado el {formatDate(batch.createdAt, "PPPp")}
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" asChild className="flex-1 md:flex-none">
              <Link href={`/admin/batches/${batch.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Editar Brief
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 md:flex-none">
              <Link href={`/admin/batches/${batch.id}/chat`}>
                <MessageSquare className="mr-2 h-4 w-4" /> Supervisar Chat
              </Link>
            </Button>
          </div>
        </div>

        {batch.status === 'pending_review' && (
          <Alert className="mb-8 border-orange-500 bg-orange-500/10 shadow-md animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              <div className="flex items-start gap-3">
                <Info className="h-6 w-6 text-orange-500 mt-1" />
                <div>
                  <AlertTitle className="text-orange-500 font-black text-lg uppercase tracking-tighter">REVISIÓN PENDIENTE</AlertTitle>
                  <AlertDescription className="text-gray-300">
                    Un editor ha enviado material. Revisa el link de Drive y decide si es apto para el cliente.
                  </AlertDescription>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button variant="destructive" onClick={handleRejectReview} disabled={submitting}>
                  <XCircle className="mr-2 h-4 w-4" /> Rechazar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApproveReview} disabled={submitting}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Aprobar y Entregar
                </Button>
              </div>
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/[0.03] border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Landing Page</p>
                    <a href={batch.landingPage} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline truncate block text-primary">
                      {batch.landingPage} <ExternalLink className="inline h-3 w-3 ml-1" />
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/[0.03] border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <LinkIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Referencias Visuales</p>
                    <p className="text-sm font-medium whitespace-pre-wrap break-words">{batch.referenceLinks}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Especificaciones de Creativos</h2>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-none">{batch.creativeCount} Solicitados</Badge>
              </div>
              
              <div className="grid gap-4">
                {batch.videoSpecs && batch.videoSpecs.map((spec, index) => (
                  <Card key={index} className="overflow-hidden border-white/10 bg-white/[0.02] border-l-4 border-l-primary/50">
                    <CardHeader className="py-3 bg-white/[0.03]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {spec.format === 'IMAGEN' ? <FileText className="h-4 w-4 text-accent" /> : <Video className="h-4 w-4 text-primary" />}
                          <CardTitle className="text-sm font-bold text-white">Item #{index + 1}</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-300">{spec.format}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {spec.script && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            {spec.format === 'IMAGEN' ? 'Detalles de Imagen' : 'Guion / Estructura'}
                          </p>
                          <p className="text-sm bg-black/20 p-3 rounded-lg border border-white/5 whitespace-pre-wrap break-words text-gray-300">{spec.script}</p>
                        </div>
                      )}
                      {spec.notes && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-amber-500/5 p-2 rounded border border-amber-500/10">
                          <Info className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                          <span className="break-words"><strong>Nota:</strong> {spec.notes}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {batch.additionalNotes && (
              <Card className="bg-white/[0.02] border-white/10">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-white">Instrucciones Adicionales</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-400 whitespace-pre-wrap break-words">
                  {batch.additionalNotes}
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/30 bg-primary/5 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ExternalLink className="h-5 w-5 text-primary" /> Gestión de Entrega (Admin)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="drive" className="text-gray-300">Link de Carpeta Google Drive</Label>
                  <Input 
                    id="drive" 
                    placeholder="https://drive.google.com/drive/folders/..." 
                    value={driveLink} 
                    onChange={e => setDriveLink(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                  />
                  <div className="flex items-center gap-2 text-xs text-primary/80 mt-2 bg-primary/5 p-2 rounded border border-primary/10">
                    <Info className="h-3 w-3 text-primary" />
                    Como administrador, puedes realizar la entrega directamente si es necesario.
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleDeliver} disabled={submitting || batch.status === 'approved'}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {submitting ? "Procesando..." : "Cargar Entrega y Notificar Cliente"}
                </Button>
                {batch.driveLink && (
                  <div className="w-full p-3 bg-black/20 rounded-lg text-sm flex justify-between items-center border border-white/5">
                    <span className="truncate max-w-[200px] font-mono text-xs text-gray-400">{batch.driveLink}</span>
                    <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/10">
                      <a href={batch.driveLink} target="_blank" rel="noopener noreferrer">
                        Ver Carpeta <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <History className="h-5 w-5 text-gray-500" /> Historial de Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batch.editHistory && batch.editHistory.length > 0 ? (
                    batch.editHistory.slice().reverse().map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm pb-4 border-b border-white/5 last:border-0 last:pb-0">
                        <div className="mt-1 p-1 bg-white/5 rounded-full">
                          <User className="h-3 w-3 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-200">{entry.userName}</span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {formatDate(entry.timestamp, "dd/MM HH:mm")}
                            </span>
                          </div>
                          <p className="text-gray-400 mt-0.5">{entry.action}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">No hay registros de edición todavía.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/[0.03] border-white/10 border-t-4 border-t-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg text-white">Gestión de Tanda</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsAssignOpen(true)} title="Asignar editores" className="text-primary hover:bg-primary/10">
                  <Users className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-full border border-orange-500/20">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Horario Límite</p>
                    <p className="font-bold text-xl text-white">{batch.deliveryDeadlineTime} HS</p>
                  </div>
                </div>
                
                <Separator className="bg-white/5" />

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Estado Actual</p>
                    <StatusBadge status={batch.status} className="text-sm px-3 py-1" />
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Editores Asignados</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                          <Users className="h-4 w-4 text-primary" />
                          {batch.assignedEditorUids?.length > 0 
                            ? `${batch.assignedEditorUids.length} Profesionales` 
                            : 'Sin asignar'}
                        </div>
                        <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold uppercase text-primary" onClick={() => setIsAssignOpen(true)}>
                          {batch.assignedEditorUids?.length > 0 ? 'Cambiar' : 'Asignar ahora'}
                        </Button>
                      </div>
                      
                      {assignedEditors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {assignedEditors.map(ed => (
                            <Badge key={ed.uid} variant="outline" className="text-[9px] h-5 bg-white/10 border-white/10 text-white">
                              {ed.displayName}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Cliente y Solicitante</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate text-gray-200">{loadingExtras ? '...' : (client?.name || 'No encontrado')}</p>
                          <p className="text-[10px] text-gray-500 font-mono truncate">{batch.clientId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate text-gray-200">{loadingExtras ? '...' : (clientUser?.displayName || 'No encontrado')}</p>
                          <p className="text-[10px] text-gray-500 font-mono truncate">{batch.clientUserUid}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" /> Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Nombre del Producto</p>
                  <p className="font-semibold text-lg text-primary">{batch.productName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Piezas</p>
                  <p className="text-3xl font-black">{batch.creativeCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {batch && (
          <AssignEditorsDialog 
            batch={batch} 
            open={isAssignOpen}
            onOpenChange={setIsAssignOpen}
            onUpdate={() => {
              toast({ title: "Asignación actualizada" });
            }} 
          />
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
