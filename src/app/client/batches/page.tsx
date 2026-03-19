
"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Plus, Eye, MessageSquare, FolderKanban, Loader2, Edit, Layers, CalendarClock, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ClientBatchesPage() {
  const { profile, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (profile?.clientId && !fetched.current) {
      fetched.current = true;
      batchService.getBatchesByClient(profile.clientId).then(data => {
        setBatches(data);
        setLoading(false);
      }).catch((err) => {
        console.error("Error fetching client batches:", err);
        setLoading(false);
      });
    } else if (!authLoading && !profile?.clientId) {
      setLoading(false);
    }
  }, [profile, authLoading]);

  const formatDate = (date: any) => {
    if (!date) return 'Pendiente';
    const d = date.toDate ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, 'dd MMM', { locale: es }) : 'Pendiente';
  };

  if (authLoading) return null;

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-10 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Portal Premium</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
              Mis Tandas
            </h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">Gestiona y revisa tus solicitudes de producción de alta gama.</p>
          </div>
          <Button asChild size="lg" className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1 font-black text-base">
            <Link href="/client/batches/new">
              <Plus className="mr-2 h-5 w-5" /> NUEVA TANDA
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Alert className="lg:col-span-2 border-none bg-amber-50 shadow-inner rounded-[24px] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <CalendarClock className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
            </div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600">
                <CalendarClock className="h-6 w-6" />
              </div>
              <div>
                <AlertTitle className="font-black text-amber-900 text-lg uppercase tracking-tight mb-1">Planificación de Producción</AlertTitle>
                <AlertDescription className="text-amber-800/80 text-sm font-medium leading-relaxed">
                  Recuerda que los <strong>sábados y domingos no se producen creativos</strong>. Realiza tus pedidos con antelación durante la semana para stockearte y contar con material suficiente para el fin de semana.
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <Card className="bg-primary text-white border-none rounded-[24px] shadow-2xl shadow-primary/20 p-6 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex justify-between items-start relative z-10">
              <p className="text-xs font-black uppercase tracking-widest opacity-80">Área Exclusiva</p>
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            <div className="mt-4 relative z-10">
              <h3 className="text-xl font-black leading-tight uppercase mb-2">Potencia tus ventas con IA</h3>
              <p className="text-xs opacity-70 mb-4 font-medium">Usa nuestras herramientas internas para diseñar piezas únicas.</p>
              <Button variant="secondary" size="sm" asChild className="font-black text-[10px] h-8 bg-white text-primary hover:bg-white/90 rounded-lg">
                <Link href="/workspace">ABRIR ÁREA DE TRABAJO</Link>
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">Historial de Proyectos</h2>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" strokeWidth={1} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando portal...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[32px] border-2 border-dashed border-slate-100 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FolderKanban className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No tienes tandas todavía</h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-8 font-medium">Empieza ahora mismo y deja que nuestro equipo creativo escale tu marca.</p>
            <Button asChild size="lg" className="rounded-xl px-10 font-black shadow-lg">
              <Link href="/client/batches/new text-white">CREAR PRIMERA TANDA</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <Card key={batch.id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col rounded-[32px] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-6">
                    <StatusBadge status={batch.status} className="px-4 py-1.5 rounded-full text-[9px]" />
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Entrega Estimada</p>
                      <span className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1.5">
                        <CalendarClock className="h-3 w-3" /> {formatDate(batch.dueDate)}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[64px]">
                    {batch.title}
                  </CardTitle>
                  <CardDescription className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Producto</span>
                    <span className="font-bold text-slate-900 text-sm block truncate">{batch.productName}</span>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Layers className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-black text-primary uppercase">{batch.creativeCount} Creativos Premium</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto p-8 pt-4 flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1 rounded-xl h-12 border-slate-100 hover:bg-slate-50 font-bold" asChild>
                    <Link href={`/client/batches/${batch.id}`}>
                      DETALLES
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1 rounded-xl h-12 bg-slate-100 hover:bg-primary hover:text-white transition-all duration-300 font-bold group/btn" asChild>
                    <Link href={`/client/batches/${batch.id}/chat`}>
                      <MessageSquare className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" /> CHAT
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
