
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { landingRequestService } from '@/services/landing-request.service';
import { clientService } from '@/services/client.service';
import { LandingRequest, Client } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShoppingBag, Layout, Globe, Eye, RefreshCw, Clock, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminLandingsPage() {
  const [requests, setRequests] = useState<LandingRequest[]>([]);
  const [clients, setClients] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqs, clientsData] = await Promise.all([
        landingRequestService.getAllRequests(),
        clientService.getAllClients()
      ]);
      
      const cMap: Record<string, string> = {};
      clientsData.forEach(c => { cMap[c.id] = c.name; });
      
      setClients(cMap);
      setRequests(reqs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'shopify': return <ShoppingBag className="h-4 w-4 text-emerald-600" />;
      case 'tiendanube': return <Layout className="h-4 w-4 text-blue-500" />;
      default: return <Globe className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string, variant: any }> = {
      pending: { label: 'PENDIENTE', variant: 'outline' },
      in_progress: { label: 'EN CURSO', variant: 'secondary' },
      delivered: { label: 'ENTREGADA', variant: 'default' },
      approved: { label: 'APROBADA', variant: 'default' },
    };
    const config = configs[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant} className="font-black text-[9px] tracking-widest">{config.label}</Badge>;
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">SOLICITUDES DE LANDING PAGE</h1>
            <p className="text-muted-foreground font-medium">Gestión de proyectos de desarrollo web.</p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="h-16 animate-pulse bg-slate-50/50" />
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-muted-foreground font-medium italic">
                    No hay solicitudes de landing page registradas.
                  </TableCell>
                </TableRow>
              ) : requests.map((req) => (
                <TableRow key={req.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-xs text-muted-foreground">
                    {req.createdAt?.toDate ? format(req.createdAt.toDate(), 'dd/MM/yy', { locale: es }) : '...'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      <span className="font-bold text-sm">{clients[req.clientId] || 'Cargando...'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{req.productName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 uppercase text-[10px] font-black tracking-tighter">
                      {getPlatformIcon(req.platform)}
                      {req.platform}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
                      <Clock className="h-3 w-3" />
                      {req.deadline ? format(new Date(req.deadline + 'T12:00:00'), 'dd MMM', { locale: es }) : 'S/D'}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10 hover:text-primary">
                      <Link href={`/admin/landings/${req.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
