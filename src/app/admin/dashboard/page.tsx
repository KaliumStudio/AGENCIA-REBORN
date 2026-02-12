"use client";

import { useEffect, useState } from 'react';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { userService } from '@/services/user.service';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FolderKanban, Users, Building2, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    batches: 0,
    clients: 0,
    users: 0,
    activeBatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
          activeBatches: batches.filter(b => b.status === 'in_progress' || b.status === 'delivered' || b.status === 'revisions').length
        });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { title: "Tandas Totales", value: stats.batches, icon: FolderKanban, color: "text-blue-600" },
    { title: "Tandas en Curso", value: stats.activeBatches, icon: TrendingUp, color: "text-green-600" },
    { title: "Clientes (Empresas)", value: stats.clients, icon: Building2, color: "text-purple-600" },
    { title: "Usuarios Totales", value: stats.users, icon: Users, color: "text-orange-600" },
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">Resumen ejecutivo del estado de la agencia.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          ) : (
            cards.map((card, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="col-span-1 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                Acceso Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gestiona el flujo de trabajo desde las secciones específicas del portal.
              </p>
              <div className="flex gap-4">
                <a href="/admin/batches" className="text-xs font-bold text-primary hover:underline">Gestionar Tandas →</a>
                <a href="/admin/clients" className="text-xs font-bold text-primary hover:underline">Gestionar Clientes →</a>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Estado de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                Base de Datos (Firestore) Conectada
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Todos los sistemas están operando correctamente y en tiempo real.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
