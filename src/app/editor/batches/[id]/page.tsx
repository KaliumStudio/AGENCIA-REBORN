"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { chatService } from '@/services/chat.service';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Send, ExternalLink, MessageSquare, Info, 
  Clock, ShoppingBag, Link as LinkIcon, FileText, Video, Loader2, AlertCircle, Globe
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export default function EditorBatchDetailPage() {
  const { id } = useParams();
  const { profile, loading: authLoading } = useAuth();
  const [driveLink, setDriveLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const batchRef = useMemoFirebase(() => {
    return id ? doc(db, 'batches', id as string) : null;
  }, [id]);

  const { data: batch, isLoading: loadingBatch } = useDoc<Batch>(batchRef);

  useEffect(() => {
    if (batch?.driveLink) {
      setDriveLink(batch.driveLink);
    }
  }, [batch?.driveLink]);

  const formatDate = (date: any, formatStr: string) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, formatStr, { locale: es }) : 'N/A';
  };

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
      await batchService.submitDelivery(batch.id, driveLink, profile.uid, profile.displayName, false);
      
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
        `Nueva entrega enviada para revisión del administrador. Link: ${driveLink}`
      );
      
      toast({ title: "Entrega enviada", description: "El administrador debe aprobar el material antes de que el cliente lo vea." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo registrar la entrega.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBatch || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!batch) return <DashboardLayout><div className="text-center py-12">No se encontró la tanda.</div></DashboardLayout>;

  const isLocked = batch.status === 'pending_review' || batch.status === 'delivered' || batch.status === 'approved';

  return (
    <RoleGuard allowedRoles={['editor']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/editor/batches"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{batch.title}</h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              Producto: <span className="font-semibold text-gray-200">{batch.productName}</span> • Creado el {formatDate(batch.createdAt, "PPP")}
            </p>
          </div>
          <Button variant="secondary" asChild className="bg-white/10 text-white hover:bg-white/20 border-none">
            <Link href={`/editor/batches/${batch.id}/chat`}>
              <MessageSquare className="mr-2 h-4 w-4" /> Ir al Chat
            </Link>
          </Button>
        </div>

        {batch.status === 'rejected' && (
          <div className="mb-8 p-4 bg-red-600 text-white rounded-xl shadow-xl flex items-center gap-4 animate-in zoom-in-95">
            <div className="p-2 bg-white/20 rounded-full">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Entrega Rechazada</h2>
              <p className="opacity-90 font-medium">El administrador ha rechazado el material. Revisa el chat para conocer los motivos y vuelve a realizar la entrega.</p>
            </div>
          </div>
        )}

        {batch.status === 'pending_review' && (
          <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-xl flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <div>
              <p className="font-bold">Entrega en Revisión Administrativa</p>
              <p className="text-sm text-gray-300">El material está esperando aprobación del administrador. Se te notificará el resultado.</p>
            </div>
          </div>
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
                      Abrir enlace <ExternalLink className="inline h-3 w-3 ml-1" />
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/[0.03] border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Video className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Referencias Visuales</p>
                    <p className="text-sm font-medium whitespace-pre-wrap break-words text-gray-300">{batch.referenceLinks}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Detalles de los Creativos ({batch.creativeCount})</h2>
              {batch.videoSpecs && batch.videoSpecs.map((spec, index) => (
                <Card key={index} className="overflow-hidden border-white/10 bg-white/[0.02]">
                  <CardHeader className="py-3 bg-white/[0.03]">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-white">Item #{index + 1}</CardTitle>
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
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-white/[0.02] p-2 rounded border border-white/5">
                        <FileText className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                        <span className="break-words text-gray-400">{spec.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {batch.additionalNotes && (
              <Card className="bg-white/[0.02] border-white/10">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-white">Notas Adicionales</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-400 whitespace-pre-wrap break-words">
                  {batch.additionalNotes}
                </CardContent>
              </Card>
            )}

            <Card className={cn(
              "border-primary/30 bg-primary/5 shadow-md transition-opacity",
              isLocked && batch.status !== 'rejected' && "opacity-60"
            )}>
              <CardHeader>
                <CardTitle className="text-white">Gestión de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="drive" className="text-gray-300">Link de Carpeta Google Drive</Label>
                  <Input 
                    id="drive" 
                    placeholder="https://drive.google.com/drive/folders/..." 
                    value={driveLink} 
                    onChange={e => setDriveLink(e.target.value)}
                    disabled={isLocked && batch.status !== 'rejected'}
                    className="bg-black/20 border-white/10 text-white"
                  />
                  <div className="flex items-center gap-2 text-xs text-primary/80 mt-2 bg-primary/5 p-2 rounded border border-primary/10">
                    <Info className="h-3 w-3 text-primary" />
                    Asegúrate de que el acceso esté compartido para que el cliente pueda verlo.
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleDeliver} disabled={submitting || (isLocked && batch.status !== 'rejected')}>
                  <Send className="mr-2 h-4 w-4" /> 
                  {submitting ? "Procesando..." : batch.status === 'rejected' ? "Re-Enviar para Revisión" : "Enviar para Revisión del Admin"}
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
          </div>

          <div className="space-y-6">
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">Información de Tiempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-full border border-orange-500/20">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Horario Límite</p>
                    <p className="font-bold text-xl text-white">{batch.deliveryDeadlineTime} HS</p>
                  </div>
                </div>
                
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Estado</p>
                    <div className="mt-1"><StatusBadge status={batch.status} /></div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Última Entrega</p>
                    <p className="text-sm font-medium text-gray-300">
                      {batch.deliveredAt ? formatDate(batch.deliveredAt, "PPpp") : 'Pendiente'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" /> Detalles de Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Producto</p>
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
      </DashboardLayout>
    </RoleGuard>
  );
}
