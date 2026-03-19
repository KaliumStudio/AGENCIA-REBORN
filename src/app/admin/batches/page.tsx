
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { userService } from '@/services/user.service';
import { Batch, Client, UserProfile } from '@/types';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users, Search, RefreshCw, MessageSquare, Trash2, Eye, Plus, Building2, Layers, User, Calendar, Info, Sparkles } from 'lucide-react';
import { AssignEditorsDialog } from '@/components/batches/assign-editors-dialog';
import { EditorCalendarDialog } from '@/components/editors/editor-calendar-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminBatchesPage() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [clients, setClients] = useState<Record<string, string>>({});
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { toast } = useToast();

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const [batchesData, clientsData, usersData] = await Promise.all([
        batchService.getAllBatches(),
        clientService.getAllClients(),
        userService.getAllUsers()
      ]);
      
      const clientMap: Record<string, string> = {};
      clientsData.forEach(c => { clientMap[c.id] = c.name; });
      
      const uMap: Record<string, string> = {};
      usersData.forEach(u => { uMap[u.uid] = u.displayName; });
      
      setUsersMap(uMap);
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
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">Gestión de Tandas</h1>
            <p className="text-gray-400 font-medium mt-2">Supervisión centralizada del flujo creativo de elite.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={() => setIsCalendarOpen(true)} className="h-12 border-white/10 text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest rounded-xl">
              <Calendar className="mr-2 h-4 w-4" /> CALENDARIO
            </Button>
            <Button variant="outline" size="icon" onClick={fetchBatches} disabled={loading} className="h-12 w-12 border-white/10 hover:bg-white/5 rounded-xl">
              <RefreshCw className={`h-5 w-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button asChild className="h-12 bg-primary hover:bg-primary/90 rounded-xl font-black shadow-lg shadow-primary/20 text-[10px] tracking-widest">
              <Link href="/admin/batches/new">
                <Plus className="mr-2 h-4 w-4" /> NUEVA TANDA
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              className="pl-11 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 rounded-2xl focus:border-primary focus:ring-primary/20 transition-all" 
              placeholder="Buscar por título, producto o cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="hidden md:block bg-white/[0.02] backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-6 px-6">Creación</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-6">Tanda / Producto</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-6">Cliente</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-6">Estado</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-6 text-center">Piezas</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-6">Editores</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-6 text-right px-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="px-6"><Skeleton className="h-4 w-24 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10 bg-white/5" /></TableCell>
                    <TableCell className="px-6"><Skeleton className="h-8 w-40 ml-auto bg-white/5" /></TableCell>
                  </TableRow>
                ))
              ) : filteredBatches.length === 0 ? (
                <TableRow className="border-none">
                   <TableCell colSpan={7} className="text-center py-20 text-gray-500 font-medium italic">No se encontraron tandas registradas.</TableCell>
                </TableRow>
              ) : filteredBatches.map((batch) => (
                <TableRow 
                  key={batch.id}
                  className={cn(
                    "transition-all duration-300 border-white/5 hover:bg-white/[0.04] group",
                    batch.status === 'pending_review' && "bg-orange-500/[0.03] border-l-4 border-l-orange-500"
                  )}
                >
                  <TableCell className="text-[11px] font-mono text-gray-500 px-6">{formatDate(batch.createdAt)}</TableCell>
                  <TableCell>
                    <div className="font-bold text-white group-hover:text-primary transition-colors">{batch.title}</div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-tighter mt-0.5">{batch.productName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white/5 rounded-lg">
                        <Building2 className="h-3 w-3 text-gray-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-300">{clients[batch.clientId] || 'Cargando...'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge status={batch.status} className="h-6" />
                      {batch.status === 'pending_review' && (
                        <span className="text-[8px] font-black text-orange-500 animate-pulse uppercase tracking-widest ml-1">ACCIÓN REQUERIDA</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center bg-white/5 rounded-full w-8 h-8 text-xs font-black text-gray-300 border border-white/10">
                      {batch.creativeCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all border border-transparent hover:border-white/10 bg-white/[0.02]">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm font-black text-white">{batch.assignedEditorUids?.length || 0}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3 bg-slate-900 border-white/10 shadow-2xl rounded-2xl">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 mb-2">Editores Asignados</p>
                          {batch.assignedEditorUids && batch.assignedEditorUids.length > 0 ? (
                            batch.assignedEditorUids.map(uid => (
                              <div key={uid} className="flex items-center gap-3 p-2.5 text-xs font-bold text-gray-200 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                                  {usersMap[uid]?.substring(0, 1).toUpperCase()}
                                </div>
                                {usersMap[uid] || 'Cargando...'}
                              </div>
                            ))
                          ) : (
                            <div className="text-[10px] text-center italic text-gray-600 py-4 border-2 border-dashed border-white/5 rounded-xl">Sin editores asignados</div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg" title="Ver detalles">
                        <Link href={`/admin/batches/${batch.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 transition-all" title="Supervisar chat">
                        <Link href={`/admin/batches/${batch.id}/chat`}>
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingBatch(batch); setIsAssignOpen(true); }} className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 transition-all" title="Asignar editores">
                        <Users className="h-4 w-4 text-gray-400" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-red-500/5 hover:bg-red-500 hover:text-white transition-all" title="Eliminar tanda">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-950 border-white/10 text-white rounded-[32px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">¿Eliminar esta tanda?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Esta acción eliminará permanentemente la tanda <span className="text-white font-bold">"{batch.title}"</span> y todos sus mensajes de chat asociados. El borrado es irreversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteBatch(batch.id)} 
                              className="bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold"
                            >
                              Confirmar Eliminación
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

        <div className="md:hidden space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full bg-white/5 rounded-3xl" />)
          ) : filteredBatches.map((batch) => (
            <Card 
              key={batch.id} 
              className={cn(
                "rounded-[32px] border border-white/10 overflow-hidden shadow-2xl transition-all duration-300",
                batch.status === 'pending_review' ? "bg-orange-500/[0.05] ring-1 ring-orange-500/20" : "bg-white/[0.03] backdrop-blur-xl"
              )}
            >
              <CardHeader className="p-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={batch.status} />
                  <div className="text-[10px] font-mono text-gray-500">
                    {formatDate(batch.createdAt)}
                  </div>
                </div>
                <CardTitle className="text-xl font-black text-white leading-none uppercase tracking-tighter mb-2">{batch.title}</CardTitle>
                <div className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="h-3 w-3" /> {clients[batch.clientId]}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-4 space-y-6">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-tighter">{batch.productName}</div>
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    {batch.creativeCount} PZ
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-6 gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl h-11 font-black text-[10px] uppercase tracking-widest border-white/10 hover:bg-white/5" asChild>
                      <Link href={`/admin/batches/${batch.id}`}>DETALLES</Link>
                    </Button>
                    <Button variant="secondary" className="flex-1 rounded-xl h-11 font-black text-[10px] uppercase tracking-widest bg-white/10 text-white border-none" asChild>
                      <Link href={`/admin/batches/${batch.id}/chat`}><MessageSquare className="h-4 w-4" /></Link>
                    </Button>
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

        {isCalendarOpen && (
          <EditorCalendarDialog
            open={isCalendarOpen}
            onOpenChange={setIsCalendarOpen}
          />
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
