
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
import { ShoppingBag, Layout, Globe, Eye, RefreshCw, Clock, Building2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function AdminLandingsPage() {
  const [requests, setRequests] = useState<LandingRequest[]>([]);
  const [clients, setClients] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      case 'shopify': return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
      case 'tiendanube': return <Layout className="h-4 w-4 text-blue-500" />;
      default: return <Globe className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string, className: string }> = {
      pending: { label: 'PENDIENTE', className: 'bg-white/5 text-gray-400 border-white/10' },
      in_progress: { label: 'EN CURSO', className: 'bg-primary/20 text-primary border-primary/20' },
      delivered: { label: 'ENTREGADA', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
      approved: { label: 'APROBADA', className: 'bg-emerald-500 text-white border-none' },
    };
    const config = configs[status] || { label: status.toUpperCase(), className: 'bg-white/5 text-white border-white/10' };
    return <Badge variant="outline" className={cn("font-black text-[9px] tracking-[0.2em] px-3 py-1 rounded-full", config.className)}>{config.label}</Badge>;
  };

  const filteredRequests = requests.filter(r => 
    r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients[r.clientId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">Solicitudes Web</h1>
            <p className="text-gray-400 font-medium mt-4">Gestión de proyectos de desarrollo de alta conversión.</p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading} className="h-12 w-12 border-white/10 hover:bg-white/5 rounded-xl">
            <RefreshCw className={cn("h-5 w-5 text-gray-400", loading && "animate-spin")} />
          </Button>
        </div>

        <div className="mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              className="pl-11 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 rounded-2xl" 
              placeholder="Buscar por producto o cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8 px-8">Fecha</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8">Cliente</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8">Producto</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8">Plataforma</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8">Límite</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8 text-center">Estado</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8 text-right px-8">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={7} className="h-20 animate-pulse bg-white/[0.01]" />
                  </TableRow>
                ))
              ) : filteredRequests.length === 0 ? (
                <TableRow className="border-none">
                  <TableCell colSpan={7} className="text-center py-24 text-gray-500 font-bold uppercase tracking-widest text-xs opacity-50">
                    No hay solicitudes pendientes en el ecosistema.
                  </TableCell>
                </TableRow>
              ) : filteredRequests.map((req) => (
                <TableRow key={req.id} className="border-white/5 hover:bg-white/[0.04] transition-all group duration-300">
                  <TableCell className="text-[11px] font-mono text-gray-500 px-8">
                    {req.createdAt?.toDate ? format(req.createdAt.toDate(), 'dd/MM/yy', { locale: es }) : '...'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:bg-primary/10 transition-colors">
                        <Building2 className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                      </div>
                      <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{clients[req.clientId] || 'Cargando...'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-white uppercase tracking-tight text-sm">{req.productName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 uppercase text-[10px] font-black tracking-widest text-gray-400">
                      {getPlatformIcon(req.platform)}
                      {req.platform}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[11px] font-black text-orange-500 bg-orange-500/10 w-fit px-3 py-1 rounded-full uppercase tracking-tighter">
                      <Clock className="h-3 w-3" />
                      {req.deadline ? format(new Date(req.deadline + 'T12:00:00'), 'dd MMM', { locale: es }) : 'S/D'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right px-8">
                    <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl group-hover:scale-110">
                      <Link href={`/admin/landings/${req.id}`}><Eye className="h-5 w-5" /></Link>
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
