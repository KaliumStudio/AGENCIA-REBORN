"use client";

import { useEffect, useState } from 'react';
import { batchService } from '@/services/batch.service';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, ExternalLink, Search, RefreshCw } from 'lucide-react';
import { NewBatchDialog } from '@/components/batches/new-batch-dialog';
import { AssignEditorsDialog } from '@/components/batches/assign-editors-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const fetchBatches = async () => {
    setLoading(true);
    const data = await batchService.getAllBatches();
    setBatches(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Tandas</h1>
            <p className="text-muted-foreground">Supervisión centralizada del flujo creativo.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="icon" onClick={fetchBatches} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <NewBatchDialog onBatchCreated={fetchBatches} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9" 
                placeholder="Buscar por título..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tanda / Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Editores</TableHead>
                <TableHead>Entrega (Drive)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No se encontraron tandas.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <div className="font-semibold">{batch.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {batch.brief}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={batch.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{batch.assignedEditorUids.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {batch.driveLink ? (
                        <a 
                          href={batch.driveLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary flex items-center text-sm hover:underline"
                        >
                          Link disponible <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">Sin entrega</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setEditingBatch(batch);
                          setIsAssignOpen(true);
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" /> Asignar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
