
"use client";

import { useEffect, useState } from 'react';
import { clientService } from '@/services/client.service';
import { Client } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Edit, Power, PowerOff, RefreshCw, Mail, Eye, Zap, Image as ImageIcon } from 'lucide-react';
import { NewClientDialog } from '@/components/clients/new-client-dialog';
import { EditClientDialog } from '@/components/clients/edit-client-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (error: any) {
      toast({ title: "Error de carga", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleToggleStatus = async (client: Client) => {
    try {
      await clientService.toggleClientStatus(client.id, client.active);
      toast({ title: client.active ? "Cliente desactivado" : "Cliente activado" });
      fetchClients();
    } catch (error: any) {
      toast({ title: "Error al cambiar estado", variant: "destructive" });
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">Clientes</h1>
            <p className="text-gray-400 mt-4 font-medium">Gestiona las empresas y su saldo de creativos e imágenes IA de elite.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" size="icon" onClick={fetchClients} disabled={loading} className="h-12 w-12 border-white/10 hover:bg-white/5 rounded-xl">
              <RefreshCw className={`h-5 w-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <NewClientDialog onClientCreated={fetchClients} />
          </div>
        </div>

        <div className="mb-8 relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            className="pl-11 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 rounded-2xl transition-all focus:border-primary" 
            placeholder="Buscar empresa o contacto..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8 px-8">Empresa</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8">Cupo Creativos</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8">Cupo IA</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8">Contacto</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8">Estado</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8 text-right px-8">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={6} className="h-20 animate-pulse bg-white/[0.01]" />
                  </TableRow>
                ))
              ) : filteredClients.length === 0 ? (
                <TableRow className="border-none">
                  <TableCell colSpan={6} className="text-center py-24 text-gray-500 font-black uppercase tracking-widest text-xs opacity-50">No hay clientes activos en la red.</TableCell>
                </TableRow>
              ) : filteredClients.map((client) => (
                <TableRow key={client.id} className="border-white/5 hover:bg-white/[0.04] group transition-all duration-300">
                  <TableCell className="font-black text-white px-8 uppercase tracking-tighter text-lg">{client.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/10">
                        <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                      </div>
                      <span className={cn(
                        "font-black text-base tracking-tighter", 
                        client.creativeQuota && client.creativeQuota <= 5 ? 'text-red-500 animate-pulse' : 'text-primary'
                      )}>
                        {client.creativeQuota || 0} PZ
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-xl border border-accent/10">
                        <ImageIcon className="h-4 w-4 text-accent" />
                      </div>
                      <span className="font-black text-base text-accent tracking-tighter">
                        {client.imageQuota || 0} CR
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-bold text-gray-200">{client.contact}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{client.contactEmail || "Sin email asignado"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "font-black text-[9px] tracking-widest px-3 py-1 rounded-full",
                      client.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-gray-500 border-white/10"
                    )}>
                      {client.active ? "ACTIVO" : "INACTIVO"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition-all shadow-xl" title="Ver historial">
                        <Link href={`/admin/clients/${client.id}`}>
                          <Eye className="h-5 w-5 text-gray-400" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingClient(client)} className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition-all"><Edit className="h-5 w-5 text-gray-400" /></Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-10 w-10 rounded-xl transition-all shadow-xl",
                          client.active ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                        )} 
                        onClick={() => handleToggleStatus(client)}
                      >
                        {client.active ? <PowerOff className="h-5 w-5" /> : <Power className="h-5 w-5" />}
                      </Button>
                    </div>
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
