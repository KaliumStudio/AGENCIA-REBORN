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
import { Building2, Search, Edit, Power, PowerOff, RefreshCw } from 'lucide-react';
import { NewClientDialog } from '@/components/clients/new-client-dialog';
import { EditClientDialog } from '@/components/clients/edit-client-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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
      console.error("Error loading clients:", error);
      toast({ 
        title: "Error de carga", 
        description: error.message || "No se pudieron obtener los clientes de Firestore.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleToggleStatus = async (client: Client) => {
    try {
      await clientService.toggleClientStatus(client.id, client.active);
      toast({ title: client.active ? "Cliente desactivado" : "Cliente activado" });
      fetchClients();
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast({ title: "Error al cambiar estado", variant: "destructive" });
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-headline">Clientes</h1>
            <p className="text-muted-foreground">Gestiona las empresas y organizaciones clientes.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchClients} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <NewClientDialog onClientCreated={fetchClients} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9" 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

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
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                    No se encontraron clientes activos o registrados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-semibold text-slate-800">{client.name}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{client.contact}</div>
                      <div className="text-xs text-muted-foreground">{client.contactEmail || "Sin email"}</div>
                    </TableCell>
                    <TableCell>
                      {client.active ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingClient(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={client.active ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-green-600 hover:text-green-600 hover:bg-green-50"}
                          onClick={() => handleToggleStatus(client)}
                        >
                          {client.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
