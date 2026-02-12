"use client";

import { useState, useEffect } from 'react';
import { clientService } from '@/services/client.service';
import { batchService } from '@/services/batch.service';
import { Client } from '@/types';
import { useAuth } from '@/context/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface NewBatchDialogProps {
  onBatchCreated: () => void;
}

export function NewBatchDialog({ onBatchCreated }: NewBatchDialogProps) {
  const { profile, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    brief: '',
    dueDate: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      clientService.getAllClients().then(setClients);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    if (!formData.clientId) {
      toast({ title: "Error", description: "Selecciona un cliente", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await batchService.createBatch({
        ...formData,
        clientUserUid: profile.uid,
        assignedEditorUids: [],
        createdBy: profile.uid
      });
      toast({ title: "Tanda creada con éxito" });
      setOpen(false);
      setFormData({ clientId: '', title: '', brief: '', dueDate: '' });
      onBatchCreated();
    } catch (error: any) {
      toast({ title: "Error al crear tanda", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={authLoading} className="w-full md:w-auto h-11 md:h-10">
          <Plus className="mr-2 h-4 w-4" /> Nueva Tanda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[90dvh]">
          <DialogHeader className="mb-6">
            <DialogTitle>Nueva Tanda de Producción</DialogTitle>
            <DialogDescription>Completa los detalles para iniciar un nuevo proyecto creativo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Cliente (Empresa)</Label>
              <Select onValueChange={(v) => setFormData({...formData, clientId: v})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                required 
                placeholder="Ej: Pack 10 Reels - Septiembre"
                className="h-11"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brief">Brief / Instrucciones</Label>
              <Textarea 
                id="brief" 
                required 
                placeholder="Instrucciones detalladas..."
                className="min-h-[120px] text-base"
                value={formData.brief}
                onChange={e => setFormData({...formData, brief: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha de Entrega</Label>
              <Input 
                id="dueDate" 
                type="date"
                className="h-11"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            <DialogFooter className="flex-col md:flex-row gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 md:h-10">Cancelar</Button>
              <Button type="submit" disabled={loading} className="h-11 md:h-10">
                {loading ? "Guardando..." : "Crear Tanda"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
