
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { userService } from '@/services/user.service';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    { title: "Tandas Totales", value: stats.batches, icon: FolderKanban, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Producción Activa", value: stats.activeBatches, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Empresas", value: stats.clients, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Equipo y Usuarios", value: stats.users, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-black text-[10px] tracking-widest px-3">ADMIN PORTAL</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Panel de Control</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Monitoreo centralizado de la producción creativa de élite.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm h-32 animate-pulse bg-white/50" />
            ))
          ) : (
            cards.map((card, i) => (
              <Card key={i} className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.title}</CardTitle>
                  <div className={`p-2 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black tracking-tighter">{card.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-none shadow-2xl shadow-primary/5 bg-white rounded-[32px] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="h-32 w-32" />
            </div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                Gestión de Operaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                Administra el flujo de trabajo, asigna editores a nuevas tandas y supervisa las solicitudes de landing pages desde un solo lugar.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="rounded-2xl font-black h-14 px-8 shadow-xl shadow-primary/20 transition-all hover:gap-4">
                  <Link href="/admin/batches">
                    GESTIONAR TANDAS <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl font-bold h-14 px-8 border-slate-200">
                  <Link href="/admin/landings">VER SOLICITUDES WEB</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-slate-900 text-white rounded-[32px] p-8 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <Badge className="bg-white/10 text-white border-none font-bold">LIVE</Badge>
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Estado del Sistema</h3>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                FIRESTORE CONECTADO
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Todos los servicios de Google Cloud y Firebase operan con normalidad. Los triggers de notificación están activos.
              </p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
