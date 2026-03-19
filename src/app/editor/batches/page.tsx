"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, FolderKanban, Building2, Layers, AlertCircle, Scissors, Zap, Loader2 } from 'lucide-react';
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
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-xl text-primary border border-primary/10 shadow-lg shadow-primary/10">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Production Mode</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">Mis Tandas Asignadas</h1>
          <p className="text-gray-400 mt-4 text-xl font-medium">Proyectos creativos bajo tu responsabilidad.</p>
        </div>

        {loading ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-80 border-white/5 bg-white/[0.02] shadow-2xl animate-pulse rounded-[48px]" />
            ))}
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-32 bg-white/[0.02] rounded-[48px] border-2 border-dashed border-white/5 text-center shadow-2xl max-w-3xl mx-auto mt-12">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/5">
              <FolderKanban className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Sin asignaciones activas</h3>
            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm mx-auto">El administrador te notificará cuando se te asigne un nuevo proyecto creativo.</p>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 pb-24">
            {batches.map((batch) => (
              <Card 
                key={batch.id} 
                className={cn(
                  "hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-3 transition-all duration-500 flex flex-col h-full rounded-[48px] border-white/5 shadow-2xl overflow-hidden bg-white/[0.03] backdrop-blur-sm group",
                  batch.status === 'rejected' ? "ring-2 ring-red-500/50 shadow-red-900/20" : ""
                )}
              >
                <CardHeader className={cn(
                  "p-10 pb-6",
                  batch.status === 'rejected' ? "bg-red-500/5" : "bg-white/[0.01]"
                )}>
                  <div className="flex justify-between items-start mb-8">
                    <StatusBadge status={batch.status} className="px-5 py-2 rounded-full text-[10px] font-black shadow-lg" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/5">
                      {formatDate(batch.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tighter text-white group-hover:text-primary transition-colors leading-none mb-6 min-h-[72px]">
                    {batch.title}
                  </CardTitle>
                  <div className="flex items-center gap-3 text-xs text-primary font-black bg-primary/10 w-fit px-4 py-2 rounded-2xl tracking-tight uppercase">
                    <Building2 className="h-4 w-4" /> {clients[batch.clientId] || 'Empresa'}
                  </div>
                </CardHeader>
                
                <CardContent className="p-10 pt-6 flex-1">
                  {batch.status === 'rejected' && (
                    <div className="mb-8 p-5 bg-red-600 text-white rounded-2xl flex items-center gap-4 text-xs font-black animate-pulse uppercase tracking-widest shadow-xl shadow-red-900/40">
                      <AlertCircle className="h-6 w-6 shrink-0" />
                      REVISAR FEEDBACK
                    </div>
                  )}
                  <p className="text-gray-400 font-medium text-lg leading-relaxed mb-8">
                    Producto: <span className="font-black text-white uppercase tracking-tight">{batch.productName}</span>
                  </p>
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/5">
                    <Layers className="h-4 w-4 text-primary" />
                    {batch.creativeCount} Creativos
                  </div>
                </CardContent>
                
                <CardFooter className={cn(
                  "mt-auto p-10 pt-6 flex gap-4 border-t border-white/5",
                  batch.status === 'rejected' ? "bg-red-500/5" : "bg-white/[0.01]"
                )}>
                  <Button variant={batch.status === 'rejected' ? "destructive" : "outline"} size="lg" className="flex-1 rounded-2xl h-14 font-black text-[10px] uppercase tracking-[0.2em] transition-all border-white/10 hover:bg-white/5" asChild>
                    <Link href={`/editor/batches/${batch.id}`}>
                      {batch.status === 'rejected' ? 'REHACER ENTREGA' : 'VER BRIEF'}
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1 rounded-2xl h-14 bg-white/10 text-white hover:bg-primary border-none transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] group/chat" asChild>
                    <Link href={`/editor/batches/${batch.id}/chat`}>
                      <MessageSquare className="mr-2 h-5 w-5 group-hover/chat:scale-110 transition-transform" /> CHAT
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