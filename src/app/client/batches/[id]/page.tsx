
"use client";

import { useParams } from 'next/navigation';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageSquare, ArrowLeft, Clock, ShoppingBag, Link as LinkIcon, FileText, Video, Edit, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { batchService } from '@/services/batch.service';
import { useToast } from '@/hooks/use-toast';

export default function ClientBatchDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();

  const batchRef = useMemoFirebase(() => {
    return id ? doc(db, 'batches', id as string) : null;
  }, [id]);

  const { data: batch, isLoading } = useDoc<Batch>(batchRef);

  const formatDate = (date: any, formatStr: string) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, formatStr, { locale: es }) : 'N/A';
  };

  const handleApprove = () => {
    if (!batch) return;
    batchService.updateBatchStatus(batch.id, 'approved');
    toast({ 
      title: "Tanda aprobada", 
      description: "¡Excelente! Has marcado este proyecto como finalizado.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!batch) return (
    <DashboardLayout>
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">No se encontró la tanda solicitada.</h2>
        <Button asChild className="mt-4">
          <Link href="/client/batches">Ir a mis tandas</Link>
        </Button>
      </div>
    </DashboardLayout>
  );

  const isEditable = batch.status !== 'approved';
  const showApproveButton = batch.status === 'delivered' || batch.status === 'revisions' || batch.status === 'in_progress';

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/client/batches"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{batch.title}</h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              Producto: <span className="font-semibold text-foreground">{batch.productName}</span> • Creado el {formatDate(batch.createdAt, "PPP")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {showApproveButton && (
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Aprobar Tanda
              </Button>
            )}
            {isEditable && (
              <Button variant="outline" asChild className="flex-1 md:flex-none">
                <Link href={`/client/batches/${batch.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Link>
              </Button>
            )}
            <Button variant="secondary" asChild className="flex-1 md:flex-none">
              <Link href={`/client/batches/${batch.id}/chat`}>
                <MessageSquare className="mr-2 h-4 w-4" /> Ir al Chat
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {batch.status === 'delivered' && (
              <Card className="border-primary bg-primary/5 shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Revisión Final
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">El equipo ha realizado una entrega. Revisa el material en el link de abajo y, si estás conforme, pulsa el botón de aprobar.</p>
                  <Button onClick={handleApprove} className="w-full bg-primary text-white">
                    Confirmar Aprobación de Tanda
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <LinkIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Landing Page</p>
                    <a href={batch.landingPage} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline truncate block text-primary">
                      Abrir enlace <ExternalLink className="inline h-3 w-3 ml-1" />
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Video className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Referencias Visuales</p>
                    <p className="text-sm font-medium whitespace-pre-wrap break-words">{batch.referenceLinks}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">Detalles de los Creativos ({batch.creativeCount})</h2>
              {batch.videoSpecs && batch.videoSpecs.map((spec, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="py-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">Item #{index + 1}</CardTitle>
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
                        <FileText className="h-4 w-4 mt-0.5 text-amber-600" />
                        <span><strong>Nota:</strong> {spec.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {batch.additionalNotes && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Notas Adicionales</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {batch.additionalNotes}
                </CardContent>
              </Card>
            )}

            {batch.driveLink && (
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader className="py-4">
                  <CardTitle className="text-green-700 flex items-center gap-2 text-base">
                    ¡Material Entregado!
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-between bg-white mx-4 mb-4 rounded-lg border p-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">Carpeta de Google Drive</p>
                    <p className="text-xs text-muted-foreground truncate">{batch.driveLink}</p>
                  </div>
                  <Button asChild size="sm" className="shrink-0 w-full md:w-auto bg-green-600 hover:bg-green-700">
                    <a href={batch.driveLink} target="_blank" rel="noopener noreferrer">
                      Ver Material <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Información de Entrega</CardTitle>
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
                
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Estado</p>
                    <div className="mt-1"><StatusBadge status={batch.status} /></div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Editores</p>
                    <p className="text-sm font-medium">{batch.assignedEditorUids?.length > 0 ? `${batch.assignedEditorUids.length} Profesional(es) asignado(s)` : 'Pendiente de asignación'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" /> Detalles de Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Producto</p>
                  <p className="font-semibold text-lg text-primary">{batch.productName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Creativos Solicitados</p>
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
