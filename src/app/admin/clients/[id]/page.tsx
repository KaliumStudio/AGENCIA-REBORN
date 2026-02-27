
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { clientService } from '@/services/client.service';
import { batchService } from '@/services/batch.service';
import { Client, Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, Building2, Mail, User, Calendar, 
  FolderKanban, Eye, MessageSquare, Loader2, Zap 
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          const [clientData, batchesData] = await Promise.all([
            clientService.getClient(id as string),
            batchService.getBatchesByClient(id as string)
          ]);
          setClient(clientData);
          setBatches(batchesData);
        } catch (error) {
          console.error("Error loading client details:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id]);

  const formatDate = (date: any) => {
    if (!date) return 'S/D';
    const d = date.toDate ? date.toDate() : new Date(date);
    return format(d, 'dd/MM/yyyy HH:mm', { locale: es });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">No se encontró el cliente</h2>
          <Button asChild className="mt-4">
            <Link href="/admin/clients">Volver a clientes</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/clients"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{client.name}</h1>
              <Badge variant={client.active ? "default" : "secondary"}>
                {client.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Building2 className="h-3 w-3" /> Perfil de Empresa • ID: {client.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> Saldo de Piezas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-primary">{client.creativeQuota || 0}</div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Piezas de cupo disponibles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Responsable</p>
                    <p className="font-medium">{client.contact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                    <p className="font-medium truncate">{client.contactEmail || 'No asignado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Fecha de Registro</p>
                    <p className="font-medium">{formatDate(client.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <FolderKanban className="h-5 w-5" /> Resumen de Actividad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Tandas Totales</p>
                    <p className="text-3xl font-bold">{batches.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">En Progreso</p>
                    <p className="text-3xl font-bold text-primary">
                      {batches.filter(b => b.status === 'in_progress' || b.status === 'new').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" /> Historial de Tandas
              </h2>
              <Badge variant="outline">{batches.length} registros</Badge>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tanda / Producto</TableHead>
                    <TableHead>Piezas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                        Este cliente aún no ha solicitado ninguna tanda.
                      </TableCell>
                    </TableRow>
                  ) : batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(batch.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">{batch.title}</div>
                        <div className="text-[10px] text-primary uppercase font-bold">{batch.productName}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-slate-600">{batch.creativeCount} pz</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={batch.status} className="text-[10px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link href={`/admin/batches/${batch.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link href={`/admin/batches/${batch.id}/chat`}>
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
