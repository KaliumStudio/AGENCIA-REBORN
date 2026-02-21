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
import { Search, Edit, Power, PowerOff, RefreshCw, Mail, Eye } from 'lucide-react';
import { NewClientDialog } from '@/components/clients/new-client-dialog';
import { EditClientDialog } from '@/components/clients/edit-client-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-sm md:text-base text-muted-foreground">Gestiona las empresas y organizaciones clientes.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="icon" onClick={fetchClients} disabled={loading} className="h-11 w-11 md:h-10 md:w-10">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <NewClientDialog onClientCreated={fetchClients} />
          </div>
        </div>

        <div className="mb-6 relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 h-11 md:h-10" 
            placeholder="Buscar cliente..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-semibold">{client.name}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{client.contact}</div>
                    <div className="text-xs text-muted-foreground">{client.contactEmail || "Sin email"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.active ? "default" : "secondary"}>{client.active ? "Activo" : "Inactivo"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild title="Ver historial">
                        <Link href={`/admin/clients/${client.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingClient(client)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className={client.active ? "text-destructive" : "text-green-600"} onClick={() => handleToggleStatus(client)}>
                        {client.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : filteredClients.map((client) => (
            <Card key={client.id} className="shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{client.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Mail className="h-3 w-3" /> {client.contactEmail || 'Sin email'}
                    </div>
                  </div>
                  <Badge variant={client.active ? "default" : "secondary"}>{client.active ? "Activo" : "Inactivo"}</Badge>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-sm font-medium text-slate-600">{client.contact}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/clients/${client.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingClient(client)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" className={client.active ? "text-destructive" : "text-green-600"} onClick={() => handleToggleStatus(client)}>
                      {client.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingClient && (
          <EditClientDialog 
            client={editingClient} 
            open={!!editingClient} 
            onOpenChange={(open) => !open && setEditingClient(null)} 
            onClientUpdated={fetchClients} 
          />
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
