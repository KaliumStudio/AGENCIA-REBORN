
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { Batch, Client } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Users, Search, RefreshCw, MessageSquare, Trash2, Eye, Plus, Building2, Layers } from 'lucide-react';
import { AssignEditorsDialog } from '@/components/batches/assign-editors-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminBatchesPage() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [clients, setClients] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const { toast } = useToast();

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const [batchesData, clientsData] = await Promise.all([
        batchService.getAllBatches(),
        clientService.getAllClients()
      ]);
      
      const clientMap: Record<string, string> = {};
      clientsData.forEach(c => { clientMap[c.id] = c.name; });
      
      setClients(clientMap);
      setBatches(batchesData);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchBatches();
    }
  }, [profile]);

  const handleDeleteBatch = (id: string) => {
    setBatches(prev => prev.filter(b => b.id !== id));
    batchService.deleteBatch(id);
    toast({ 
      title: "Tanda eliminada", 
      description: "El registro ha sido borrado correctamente del sistema." 
    });
  };

  const filteredBatches = batches.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients[b.clientId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return 'S/D';
    const d = date.toDate ? date.toDate() : new Date(date);
    return format(d, 'dd/MM/yy HH:mm', { locale: es });
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestión de Tandas</h1>
            <p className="text-sm md:text-base text-muted-foreground">Supervisión centralizada del flujo creativo.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="icon" onClick={fetchBatches} disabled={loading} className="h-11 w-11 md:h-10 md:w-10">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button asChild className="h-11 md:h-10">
              <Link href="/admin/batches/new">
                <Plus className="mr-2 h-4 w-4" /> Nueva Tanda
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9 h-11 md:h-10" 
              placeholder="Buscar por título, producto o cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Creación</TableHead>
                <TableHead>Tanda / Producto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Piezas</TableHead>
                <TableHead>Editores</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-40 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredBatches.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No se encontraron tandas.</TableCell>
                </TableRow>
              ) : filteredBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(batch.createdAt)}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{batch.title}</div>
                    <div className="text-xs text-primary font-medium">{batch.productName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{clients[batch.clientId] || 'Cargando...'}</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={batch.status} /></TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center bg-slate-100 rounded-full w-7 h-7 text-xs font-bold text-slate-700">
                      {batch.creativeCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{batch.assignedEditorUids?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild title="Ver detalles">
                        <Link href={`/admin/batches/${batch.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild title="Supervisar chat">
                        <Link href={`/admin/batches/${batch.id}/chat`}>
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setEditingBatch(batch); setIsAssignOpen(true); }} title="Asignar editores">
                        <Users className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" title="Eliminar tanda">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar esta tanda?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente la tanda "{batch.title}" y todos sus mensajes de chat asociados. El borrado es irreversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteBatch(batch.id)} 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar definitivamente
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
          ) : filteredBatches.map((batch) => (
            <Card key={batch.id} className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <StatusBadge status={batch.status} />
                  <div className="text-[10px] text-muted-foreground">
                    {formatDate(batch.createdAt)}
                  </div>
                </div>
                <CardTitle className="text-lg">{batch.title}</CardTitle>
                <div className="text-xs font-bold text-slate-500 mb-1">{clients[batch.clientId]}</div>
                <div className="text-xs text-primary font-bold flex items-center justify-between">
                  <span>{batch.productName}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 flex items-center gap-1">
                    <Layers className="h-3 w-3" /> {batch.creativeCount} piezas
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/batches/${batch.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/batches/${batch.id}/chat`}><MessageSquare className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setEditingBatch(batch); setIsAssignOpen(true); }}>
                      Asignar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar tanda?</AlertDialogTitle>
                          <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteBatch(batch.id)} 
                            className="bg-destructive text-white"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingBatch && (
          <AssignEditorsDialog 
            batch={editingBatch} 
            open={isAssignOpen}
            onOpenChange={setIsAssignOpen}
            onUpdate={fetchBatches} 
          />
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
