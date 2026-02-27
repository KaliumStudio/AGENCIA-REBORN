
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { userService } from '@/services/user.service';
import { Batch, Client, UserProfile } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, MessageSquare, ArrowLeft, Clock, ShoppingBag, 
  Link as LinkIcon, FileText, Video, User, ShieldCheck, Globe, Info, Building2
} from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function AdminBatchDetailPage() {
  const { id } = useParams();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [clientUser, setClientUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          const batchData = await batchService.getBatch(id as string);
          if (batchData) {
            setBatch(batchData);
            
            // Cargar datos del cliente y usuario en paralelo
            const [clientData, userData] = await Promise.all([
              clientService.getClient(batchData.clientId),
              userService.getProfile(batchData.clientUserUid)
            ]);
            
            setClient(clientData);
            setClientUser(userData);
          }
        } catch (error) {
          console.error("Error loading admin batch detail data:", error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [id]);

  const formatDate = (date: any, formatStr: string) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, formatStr, { locale: es }) : 'N/A';
  };

  if (loading) {
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
                    <p className="text-sm font-medium whitespace-pre-wrap break-words">{batch.referenceLinks}</p>
                  </div>
                </CardContent>
              </Card>
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

            {batch.driveLink && (
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader className="py-4">
                  <CardTitle className="text-green-700 flex items-center gap-2 text-base">
                    Material Entregado
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-between bg-white mx-4 mb-4 rounded-lg border p-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">Google Drive</p>
                    <p className="text-xs text-muted-foreground truncate">{batch.driveLink}</p>
                  </div>
                  <Button asChild size="sm" className="shrink-0 w-full md:w-auto bg-green-600 hover:bg-green-700">
                    <a href={batch.driveLink} target="_blank" rel="noopener noreferrer">
                      Abrir Carpeta <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
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
                          <p className="text-sm font-bold">{client?.name || 'Cargando...'}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{batch.clientId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-bold">{clientUser?.displayName || 'Cargando...'}</p>
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
