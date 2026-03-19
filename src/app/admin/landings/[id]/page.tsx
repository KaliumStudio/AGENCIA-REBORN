
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { landingRequestService } from '@/services/landing-request.service';
import { clientService } from '@/services/client.service';
import { LandingRequest, Client, LandingRequestStatus } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, ShoppingBag, Layout, Globe, ExternalLink, 
  Key, Calendar, Building2, User, CheckCircle2, Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminLandingDetailPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<LandingRequest | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      landingRequestService.getRequest(id as string).then(async (req) => {
        if (req) {
          setRequest(req);
          const c = await clientService.getClient(req.clientId);
          setClient(c);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleUpdateStatus = async (status: LandingRequestStatus) => {
    if (!id) return;
    setUpdating(true);
    try {
      await landingRequestService.updateStatus(id as string, status);
      setRequest(prev => prev ? { ...prev, status } : null);
      toast({ title: "Estado actualizado" });
    } catch (error) {
      toast({ title: "Error al actualizar", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  if (!request) return <DashboardLayout><div className="p-8 text-center bg-white rounded-2xl border border-dashed font-bold">Solicitud no encontrada</div></DashboardLayout>;

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pb-12">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/landings"><ArrowLeft className="h-5 w-5" /></Link>
              </Button>
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase">Detalle de Solicitud</h1>
                <p className="text-muted-foreground font-medium">Revisión de parámetros técnicos de la landing.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={updating || request.status === 'in_progress'}
              >
                Mover a En Curso
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => handleUpdateStatus('delivered')}
                disabled={updating || request.status === 'delivered'}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Marcar como Entregada
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <Card className="shadow-lg border-none rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Producto</p>
                      <CardTitle className="text-2xl font-black tracking-tighter">{request.productName}</CardTitle>
                    </div>
                    <Badge className="bg-white text-slate-900 border-none font-black uppercase tracking-tighter">
                      {request.platform}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plataforma</p>
                      <div className="flex items-center gap-3">
                        {request.platform === 'shopify' ? <ShoppingBag className="h-6 w-6 text-emerald-600" /> : <Layout className="h-6 w-6 text-blue-500" />}
                        <span className="font-bold text-lg uppercase">{request.platform}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha Límite</p>
                      <div className="flex items-center gap-3 text-orange-600">
                        <Calendar className="h-6 w-6" />
                        <span className="font-bold text-lg">
                          {request.deadline ? format(new Date(request.deadline + 'T12:00:00'), "dd 'de' MMMM", { locale: es }) : 'Sin fecha'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ofertas y Bundles</p>
                    <div className="bg-slate-50 p-4 rounded-xl border whitespace-pre-wrap text-sm leading-relaxed italic">
                      {request.bundles || 'No se especificaron ofertas.'}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Accesos / Credenciales</p>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                      <Key className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                          {request.platform === 'shopify' 
                            ? 'Revisar invitación en maurifig100102@gmail.com' 
                            : (request.accessCredentials || 'No proporcionado')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 p-6 border-t flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carpeta de Materiales</span>
                  </div>
                  <Button size="sm" asChild className="rounded-lg px-6 font-bold shadow-md">
                    <a href={request.driveLink} target="_blank" rel="noopener noreferrer">ABRIR GOOGLE DRIVE</a>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-lg border-none rounded-2xl overflow-hidden">
                <CardHeader className="bg-primary/5 p-6 border-b">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Empresa</p>
                      <p className="font-bold truncate">{client?.name || 'Cargando...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Solicitado por</p>
                      <p className="font-bold truncate">{client?.contact || '...'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 text-white rounded-2xl border-none p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="font-black tracking-tighter uppercase">Estado del Proyecto</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-xs text-white/60 font-medium">Fecha de Solicitud</span>
                    <span className="text-xs font-bold">
                      {request.createdAt?.toDate ? format(request.createdAt.toDate(), 'dd/MM/yyyy') : '...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-xs text-white/60 font-medium">ID de Pedido</span>
                    <span className="text-[10px] font-mono font-bold uppercase">{request.id.slice(0, 8)}</span>
                  </div>
                  <div className="pt-2 text-center">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">Estado Actual</p>
                    <Badge className="bg-primary text-white font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest animate-pulse">
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
