
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
import { Plus, Eye, MessageSquare, FolderKanban, Loader2, Edit, Layers, CalendarClock, Sparkles, TrendingUp, Zap } from 'lucide-react';
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-10 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Portal Premium</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">
              Mis Proyectos
            </h1>
            <p className="text-muted-foreground mt-3 text-lg font-medium">Gestiona tu producción creativa de alta gama.</p>
          </div>
          <Button asChild size="lg" className="h-16 px-10 rounded-[24px] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 font-black text-lg">
            <Link href="/client/batches/new">
              <Plus className="mr-2 h-6 w-6" /> NUEVA TANDA
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Alert className="lg:col-span-2 border-none bg-white shadow-xl shadow-slate-200/50 rounded-[32px] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
               <CalendarClock className="h-48 w-48 -mr-12 -mt-12 rotate-12" />
            </div>
            <div className="flex items-start gap-6 relative z-10">
              <div className="p-4 bg-amber-50 rounded-[20px] shadow-inner text-amber-600">
                <CalendarClock className="h-8 w-8" />
              </div>
              <div>
                <AlertTitle className="font-black text-slate-900 text-xl uppercase tracking-tight mb-2">Cronograma de Producción</AlertTitle>
                <AlertDescription className="text-slate-500 text-base font-medium leading-relaxed max-w-xl">
                  Recuerda que los <strong>sábados y domingos no se producen creativos</strong>. Realiza tus pedidos con antelación para asegurar tu stock de anuncios el fin de semana.
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <Card className="bg-slate-900 text-white border-none rounded-[32px] shadow-2xl shadow-primary/10 p-8 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex justify-between items-start relative z-10">
              <Badge className="bg-white/10 text-white border-none font-black uppercase text-[10px] tracking-widest px-3">AREA EXCLUSIVA</Badge>
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="mt-6 relative z-10">
              <h3 className="text-2xl font-black leading-tight uppercase mb-3">Escala con IA</h3>
              <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">Accede a herramientas internas para potenciar tu marca.</p>
              <Button variant="secondary" size="lg" asChild className="w-full font-black text-xs h-12 bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-xl">
                <Link href="/workspace">ABRIR ÁREA DE TRABAJO</Link>
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-slate-600" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Historial de Operaciones</h2>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 gap-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" strokeWidth={1} />
              <Zap className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando Portal VIP...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
              <FolderKanban className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Tu portafolio está vacío</h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-10 text-lg font-medium leading-relaxed">Comienza tu primera tanda y deja que el equipo de elite escale tus ventas.</p>
            <Button asChild size="lg" className="rounded-2xl px-12 h-16 font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all">
              <Link href="/client/batches/new">CREAR MI PRIMERA TANDA</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-20">
            {batches.map((batch) => (
              <Card key={batch.id} className="group hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] hover:-translate-y-2 transition-all duration-500 flex flex-col rounded-[40px] border-none shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                <CardHeader className="p-10 pb-4">
                  <div className="flex justify-between items-start mb-8">
                    <StatusBadge status={batch.status} className="px-5 py-2 rounded-full text-[10px] shadow-sm" />
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ENTREGA</p>
                      <span className="text-xs font-bold text-slate-600 mt-1.5 flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg">
                        <CalendarClock className="h-3.5 w-3.5 text-primary" /> {formatDate(batch.dueDate)}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[72px] leading-none">
                    {batch.title}
                  </CardTitle>
                  <CardDescription className="mt-6 p-6 bg-slate-50 rounded-[24px] border border-slate-100/50 group-hover:bg-primary/[0.02] transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Producto de Campaña</span>
                    <span className="font-black text-slate-900 text-lg block truncate">{batch.productName}</span>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100">
                        <Layers className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{batch.creativeCount} Creativos Premium</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto p-10 pt-4 flex gap-4">
                  <Button variant="outline" size="lg" className="flex-1 rounded-2xl h-14 border-slate-100 hover:bg-slate-50 font-black text-xs uppercase tracking-widest" asChild>
                    <Link href={`/client/batches/${batch.id}`}>
                      DETALLES
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1 rounded-2xl h-14 bg-slate-100 hover:bg-primary hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-widest group/btn" asChild>
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
