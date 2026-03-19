
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageSquare, FolderKanban, Building2, Layers, AlertCircle, Scissors, Zap } from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function EditorBatchesPage() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [clients, setClients] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      const loadData = async () => {
        try {
          const [batchesData, clientsData] = await Promise.all([
            batchService.getBatchesByEditor(profile.uid),
            clientService.getAllClients()
          ]);
          
          const clientMap: Record<string, string> = {};
          clientsData.forEach(c => { clientMap[c.id] = c.name; });
          
          setClients(clientMap);
          setBatches(batchesData);
        } catch (error) {
          console.error("Error loading editor batches:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [profile]);

  const formatDate = (date: any) => {
    if (!date) return 'Pendiente';
    const d = date.toDate ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, 'dd MMM', { locale: es }) : 'Inválida';
  };

  return (
    <RoleGuard allowedRoles={['editor']}>
      <DashboardLayout>
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-accent/10 rounded-lg text-accent">
              <Scissors className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Production Mode</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Mis Tandas Asignadas</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Proyectos creativos bajo tu responsabilidad.</p>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-64 border-none shadow-sm animate-pulse bg-white/50 rounded-[32px]" />
            ))}
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-center shadow-sm max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <FolderKanban className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Sin asignaciones activas</h3>
            <p className="text-slate-400 font-medium leading-relaxed">El administrador te notificará cuando se te asigne un nuevo proyecto creativo.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-20">
            {batches.map((batch) => (
              <Card 
                key={batch.id} 
                className={cn(
                  "hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full rounded-[32px] border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white group",
                  batch.status === 'rejected' ? "ring-2 ring-red-500 shadow-red-100" : ""
                )}
              >
                <CardHeader className={cn(
                  "p-8 pb-4",
                  batch.status === 'rejected' ? "bg-red-50/50" : "bg-slate-50/30"
                )}>
                  <div className="flex justify-between items-start mb-6">
                    <StatusBadge status={batch.status} className="px-4 py-1.5 rounded-full text-[9px] shadow-sm" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                      {formatDate(batch.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors leading-none mb-3">
                    {batch.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-primary font-bold bg-primary/5 w-fit px-3 py-1.5 rounded-xl">
                    <Building2 className="h-3.5 w-3.5" /> {clients[batch.clientId] || 'Empresa'}
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-6 flex-1">
                  {batch.status === 'rejected' && (
                    <div className="mb-6 p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 text-xs font-black animate-pulse uppercase tracking-tight shadow-lg shadow-red-200">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      ENTREGA RECHAZADA - REVISAR CHAT
                    </div>
                  )}
                  <p className="text-slate-500 font-medium line-clamp-3 mb-6 leading-relaxed">
                    Producto: <span className="font-black text-slate-900">{batch.productName}</span>
                  </p>
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-tighter shadow-lg shadow-slate-200">
                    <Layers className="h-4 w-4 text-primary" />
                    {batch.creativeCount} Creativos a entregar
                  </div>
                </CardContent>
                <CardFooter className={cn(
                  "mt-auto p-8 pt-4 flex gap-3 border-t border-slate-50",
                  batch.status === 'rejected' ? "bg-red-50/30" : "bg-slate-50/10"
                )}>
                  <Button variant={batch.status === 'rejected' ? "destructive" : "outline"} size="lg" className="flex-1 rounded-xl h-12 font-black text-[10px] uppercase tracking-widest transition-all" asChild>
                    <Link href={`/editor/batches/${batch.id}`}>
                      {batch.status === 'rejected' ? 'REHACER ENTREGA' : 'VER BRIEF'}
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1 rounded-xl h-12 bg-slate-100 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest transition-all group/chat" asChild>
                    <Link href={`/editor/batches/${batch.id}/chat`}>
                      <MessageSquare className="mr-2 h-4 w-4 group-hover/chat:scale-110 transition-transform" /> CHAT
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
