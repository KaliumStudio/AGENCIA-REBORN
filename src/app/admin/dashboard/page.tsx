"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { userService } from '@/services/user.service';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, Users, Building2, TrendingUp, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    batches: 0,
    clients: 0,
    users: 0,
    activeBatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (profile?.role !== 'admin') return;
      
      try {
        const [batches, clients, users] = await Promise.all([
          batchService.getAllBatches(),
          clientService.getAllClients(),
          userService.getAllUsers()
        ]);

        setStats({
          batches: batches.length,
          clients: clients.length,
          users: users.length,
          activeBatches: batches.filter(b => b.status === 'in_progress' || b.status === 'new' || b.status === 'pending_review' || b.status === 'revisions').length
        });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  const cards = [
    { title: "Tandas Totales", value: stats.batches, icon: FolderKanban, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Producción Activa", value: stats.activeBatches, icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10" },
    { title: "Empresas", value: stats.clients, icon: Building2, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Equipo y Usuarios", value: stats.users, icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/20 font-black text-[10px] tracking-[0.2em] px-3 py-1">ADMIN PORTAL</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none">Panel de Control</h1>
          <p className="text-gray-400 mt-4 text-lg font-medium">Monitoreo centralizado de la producción creativa de élite.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-white/5 bg-white/[0.02] shadow-sm h-32 animate-pulse" />
            ))
          ) : (
            cards.map((card, i) => (
              <Card key={i} className="border-white/5 bg-white/[0.03] shadow-2xl hover:bg-white/[0.05] transition-all duration-500 overflow-hidden group rounded-[24px]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{card.title}</CardTitle>
                  <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform shadow-lg`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black tracking-tighter text-white">{card.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-white/5 bg-white/[0.02] shadow-2xl rounded-[40px] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <TrendingUp className="h-48 w-48" />
            </div>
            <CardHeader className="p-10 pb-4 relative z-10">
              <CardTitle className="text-3xl font-black tracking-tighter flex items-center gap-4 text-white">
                <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-xl shadow-primary/10">
                  <Sparkles className="h-7 w-7" />
                </div>
                Gestión de Operaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8 relative z-10">
              <p className="text-gray-400 font-medium leading-relaxed max-w-md text-lg">
                Administra el flujo de trabajo, asigna editores a nuevas tandas y supervisa las solicitudes de landing pages desde un solo lugar.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="rounded-2xl font-black h-14 px-10 shadow-2xl shadow-primary/20 transition-all hover:translate-x-2 bg-primary hover:bg-primary/90">
                  <Link href="/admin/batches" className="flex items-center gap-2">
                    GESTIONAR TANDAS <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl font-black h-14 px-10 border-white/10 hover:bg-white/5 text-white">
                  <Link href="/admin/landings">VER SOLICITUDES WEB</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-2xl bg-slate-900/50 backdrop-blur-xl text-white rounded-[40px] p-10 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
            
            <div>
              <div className="flex justify-between items-start mb-10">
                <div className="p-4 bg-white/5 rounded-[24px] shadow-inner border border-white/5">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[10px] tracking-widest px-3 py-1">SERVER LIVE</Badge>
              </div>
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-4 leading-none">Estado del <br /><span className="text-primary">Ecosistema</span></h3>
              <div className="flex items-center gap-3 text-emerald-400 text-sm font-black tracking-tight">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                FIRESTORE CONECTADO
              </div>
            </div>
            
            <div className="mt-10 pt-10 border-t border-white/5">
              <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                Todos los servicios operan con normalidad. Triggers de notificación activos.
              </p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
