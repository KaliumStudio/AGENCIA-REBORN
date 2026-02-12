"use client";

import { useEffect, useState } from 'react';
import { batchService } from '@/services/batch.service';
import { userService } from '@/services/user.service';
import { Batch, UserProfile } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, Eye, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [editors, setEditors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedEditors, setSelectedEditors] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      batchService.getAllBatches(),
      userService.getEditors()
    ]).then(([b, e]) => {
      setBatches(b);
      setEditors(e);
      setLoading(false);
    });
  }, []);

  const handleAssign = async () => {
    if (!selectedBatch) return;
    try {
      await batchService.assignEditors(selectedBatch.id, selectedEditors);
      toast({ title: "Editores asignados" });
      setBatches(batches.map(b => b.id === selectedBatch.id ? { ...b, assignedEditorUids: selectedEditors, status: 'in_progress' } : b));
      setSelectedBatch(null);
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Todas las Tandas</h1>
            <p className="text-muted-foreground">Supervisa el flujo de producción de la agencia.</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar tanda..." />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tanda</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Editores</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div className="font-semibold">{batch.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{batch.brief}</div>
                  </TableCell>
                  <TableCell><StatusBadge status={batch.status} /></TableCell>
                  <TableCell className="text-sm">{batch.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {batch.assignedEditorUids.length === 0 ? (
                        <span className="text-xs text-destructive font-medium italic">Sin asignar</span>
                      ) : (
                        batch.assignedEditorUids.map((uid, i) => (
                          <div key={uid} className="w-8 h-8 rounded-full bg-primary border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                            {editors.find(e => e.uid === uid)?.displayName.substring(0, 2).toUpperCase() || '??'}
                          </div>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedBatch(batch);
                            setSelectedEditors(batch.assignedEditorUids);
                          }}>
                            <Users className="mr-2 h-4 w-4" /> Asignar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Asignar Editores a: {batch.title}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            {editors.map((editor) => (
                              <div key={editor.uid} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg transition-colors">
                                <Checkbox 
                                  id={editor.uid} 
                                  checked={selectedEditors.includes(editor.uid)}
                                  onCheckedChange={(checked) => {
                                    if (checked) setSelectedEditors([...selectedEditors, editor.uid]);
                                    else setSelectedEditors(selectedEditors.filter(id => id !== editor.uid));
                                  }}
                                />
                                <Label htmlFor={editor.uid} className="flex-1 cursor-pointer">{editor.displayName}</Label>
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAssign}>Guardar Cambios</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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