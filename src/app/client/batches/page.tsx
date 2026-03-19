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
import { Plus, MessageSquare, FolderKanban, Loader2, Layers, CalendarClock, Sparkles, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(41,98,255,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Portal Premium</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
              Mis Proyectos
            </h1>
            <p className="text-gray-400 mt-4 text-xl font-medium">Gestiona tu producción creativa de alta gama.</p>
          </div>
          <Button asChild size="lg" className="h-16 px-12 rounded-[24px] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 font-black text-lg bg-primary hover:bg-primary/90">
            <Link href="/client/batches/new">
              <Plus className="mr-2 h-6 w-6" /> NUEVA TANDA
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Alert className="lg:col-span-2 border-white/5 bg-white/[0.02] shadow-2xl rounded-[40px] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
               <CalendarClock className="h-64 w-64 -mr-16 -mt-16 rotate-12" />
            </div>
            <div className="flex items-start gap-8 relative z-10">
              <div className="p-5 bg-amber-500/10 rounded-[24px] shadow-inner text-amber-500 border border-amber-500/10">
                <CalendarClock className="h-10 w-10" />
              </div>
              <div>
                <AlertTitle className="font-black text-white text-2xl uppercase tracking-tighter mb-3">Cronograma de Producción</AlertTitle>
                <AlertDescription className="text-gray-400 text-lg font-medium leading-relaxed max-w-2xl">
                  Recuerda que los <strong>sábados y domingos no se producen creativos</strong>. Realiza tus pedidos con antelación para asegurar tu stock de anuncios el fin de semana.
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <Card className="bg-slate-900/80 backdrop-blur-xl text-white border-white/5 rounded-[40px] shadow-2xl p-10 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[100px] -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex justify-between items-start relative z-10">
              <Badge className="bg-white/10 text-white border-none font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">AREA EXCLUSIVA</Badge>
              <Sparkles className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div className="mt-8 relative z-10">
              <h3 className="text-3xl font-black leading-none uppercase mb-4 tracking-tighter">Escala <br />con IA</h3>
              <p className="text-base text-gray-400 mb-8 font-medium leading-relaxed">Accede a herramientas internas para potenciar tu marca.</p>
              <Button variant="secondary" size="lg" asChild className="w-full font-black text-xs h-14 bg-white text-slate-900 hover:bg-gray-100 rounded-2xl shadow-2xl transition-all hover:scale-[1.02]">
                <Link href="/workspace">ABRIR ÁREA DE TRABAJO</Link>
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Historial de Operaciones</h2>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-8">
            <div className="relative">
              <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20" strokeWidth={1} />
              <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">Sincronizando Portal VIP...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-32 bg-white/[0.02] rounded-[48px] border-2 border-dashed border-white/5 text-center shadow-2xl">
            <div className="w-28 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/5">
              <FolderKanban className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-4xl font-black text-white tracking-tighter mb-4">Tu portafolio está vacío</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-12 text-xl font-medium leading-relaxed">Comienza tu primera tanda y deja que el equipo de elite escale tus ventas.</p>
            <Button asChild size="lg" className="rounded-2xl px-14 h-16 font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all bg-primary hover:bg-primary/90 text-lg">
              <Link href="/client/batches/new">CREAR MI PRIMERA TANDA</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 pb-24">
            {batches.map((batch) => (
              <Card key={batch.id} className="group hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-3 transition-all duration-500 flex flex-col rounded-[48px] border-white/5 shadow-2xl bg-white/[0.03] overflow-hidden backdrop-blur-sm">
                <CardHeader className="p-12 pb-6">
                  <div className="flex justify-between items-start mb-10">
                    <StatusBadge status={batch.status} className="px-6 py-2.5 rounded-full text-[10px] font-black shadow-lg" />
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">ENTREGA</p>
                      <span className="text-xs font-black text-gray-300 mt-2 flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        <CalendarClock className="h-4 w-4 text-primary" /> {formatDate(batch.dueDate)}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tighter text-white group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[84px] leading-none">
                    {batch.title}
                  </CardTitle>
                  <CardDescription className="mt-8 p-8 bg-white/[0.02] rounded-[32px] border border-white/5 group-hover:bg-white/[0.04] transition-all">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Producto de Campaña</span>
                    <span className="font-black text-white text-xl block truncate uppercase tracking-tight">{batch.productName}</span>
                    <div className="flex items-center gap-4 mt-6">
                      <div className="h-10 w-10 rounded-2xl bg-primary/20 shadow-lg flex items-center justify-center text-primary border border-primary/10">
                        <Layers className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{batch.creativeCount} Creativos Premium</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto p-12 pt-6 flex gap-5">
                  <Button variant="outline" size="lg" className="flex-1 rounded-[20px] h-14 border-white/10 hover:bg-white/5 text-white font-black text-xs uppercase tracking-[0.2em]" asChild>
                    <Link href={`/client/batches/${batch.id}`}>
                      DETALLES
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1 rounded-[20px] h-14 bg-white/10 text-white hover:bg-primary transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] group/btn border-none" asChild>
                    <Link href={`/client/batches/${batch.id}/chat`}>
                      <MessageSquare className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" /> CHAT
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