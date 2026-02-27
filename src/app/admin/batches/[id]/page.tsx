
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
import { 
  ExternalLink, MessageSquare, ArrowLeft, Clock, ShoppingBag, 
  Link as LinkIcon, FileText, Video, User, ShieldCheck, Globe, Info, Building2, Send, Loader2
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

export default function AdminBatchDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [clientUser, setClientUser] = useState<UserProfile | null>(null);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [driveLink, setDriveLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
          const [clientData, userData] = await Promise.all([
            clientService.getClient(batch.clientId),
            userService.getProfile(batch.clientUserUid)
          ]);
          setClient(clientData);
          setClientUser(userData);
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
      await batchService.submitDelivery(batch.id, driveLink, profile.uid);
      
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
              <Link href={`/admin/batches/${batch.id}/chat`}>
                <MessageSquare className="mr-2 h-4 w-4" /> Supervisar Chat
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-primary/20">
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
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <LinkIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Referencias Visuales</p>
                    <p className="text-sm font-medium whitespace-pre-wrap">{batch.referenceLinks}</p>
                  </div>
                </CardContent>
              </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Especificaciones de Creativos</h2>
                <Badge variant="secondary">{batch.creativeCount} Solicitados</Badge>
              </div>
              
              <div className="grid gap-4">
                {batch.videoSpecs && batch.videoSpecs.map((spec, index) => (
                  <Card key={index} className="overflow-hidden border-l-4 border-l-primary/30">
                    <CardHeader className="py-3 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {spec.format === 'IMAGEN' ? <FileText className="h-4 w-4 text-accent" /> : <Video className="h-4 w-4 text-primary" />}
                          <CardTitle className="text-sm font-bold">Item #{index + 1}</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-white">{spec.format}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {spec.script && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            {spec.format === 'IMAGEN' ? 'Detalles de Imagen' : 'Guion / Estructura'}
                          </p>
                          <p className="text-sm bg-slate-50 p-3 rounded-lg border whitespace-pre-wrap">{spec.script}</p>
                        </div>
                      )}
                      {spec.notes && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-amber-50/50 p-2 rounded">
                          <Info className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                          <span><strong>Nota:</strong> {spec.notes}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {batch.additionalNotes && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Instrucciones Adicionales</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {batch.additionalNotes}
                </CardContent>
              </Card>
            )}

            {/* Nueva sección de entrega para el Administrador */}
            <Card className="border-primary shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" /> Gestión de Entrega (Admin)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="drive">Link de Carpeta Google Drive</Label>
                  <Input 
                    id="drive" 
                    placeholder="https://drive.google.com/drive/folders/..." 
                    value={driveLink} 
                    onChange={e => setDriveLink(e.target.value)}
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 bg-blue-50 p-2 rounded">
                    <Info className="h-3 w-3 text-blue-500" />
                    Como administrador, puedes realizar la entrega directamente si es necesario.
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" onClick={handleDeliver} disabled={submitting || batch.status === 'approved'}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {submitting ? "Procesando..." : "Cargar Entrega y Notificar Cliente"}
                </Button>
                {batch.driveLink && (
                  <div className="w-full p-3 bg-muted/50 rounded-lg text-sm flex justify-between items-center border">
                    <span className="truncate max-w-[200px] font-mono text-xs">{batch.driveLink}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={batch.driveLink} target="_blank" rel="noopener noreferrer">
                        Ver Carpeta <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-t-4 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Gestión de Tanda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Horario Límite</p>
                    <p className="font-bold text-xl">{batch.deliveryDeadlineTime} HS</p>
                  </div>
                </div>
                
                <Separator />

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Estado Actual</p>
                    <StatusBadge status={batch.status} className="text-sm px-3 py-1" />
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Editores Asignados</p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4 text-primary" />
                      {batch.assignedEditorUids?.length > 0 
                        ? `${batch.assignedEditorUids.length} Profesionales` 
                        : 'Sin asignar'}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Cliente y Solicitante</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-bold">{loadingExtras ? '...' : (client?.name || 'No encontrado')}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{batch.clientId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-bold">{loadingExtras ? '...' : (clientUser?.displayName || 'No encontrado')}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{batch.clientUserUid}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" /> Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Nombre del Producto</p>
                  <p className="font-semibold text-lg text-primary">{batch.productName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Piezas</p>
                  <p className="text-3xl font-bold">{batch.creativeCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
