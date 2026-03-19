
"use client";

import { useState, useEffect } from 'react';
import { clientService } from '@/services/client.service';
import { Client } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Edit, Zap, Image as ImageIcon } from 'lucide-react';

interface EditClientDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientUpdated: () => void;
}

export function EditClientDialog({ client, open, onOpenChange, onClientUpdated }: EditClientDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    contactEmail: '',
    creativeQuota: 0,
    imageQuota: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    if (open && client) {
      setFormData({
        name: client.name,
        contact: client.contact,
        contactEmail: client.contactEmail || '',
        creativeQuota: client.creativeQuota || 0,
        imageQuota: client.imageQuota || 0
      });
    }
  }, [open, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clientService.updateClient(client.id, {
        ...formData,
        creativeQuota: Number(formData.creativeQuota),
        imageQuota: Number(formData.imageQuota)
      });
      toast({ title: "Cliente actualizado" });
      onOpenChange(false);
      onClientUpdated();
    } catch (error) {
      toast({ title: "Error al actualizar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" /> Editar Cliente
            </DialogTitle>
            <DialogDescription>Actualiza la información y los cupos de producción e IA.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input id="edit-name" required className="h-11" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Contacto</Label>
                <Input id="edit-contact" required className="h-11" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quota" className="flex items-center gap-1 text-primary">
                  <Zap className="h-3 w-3 text-amber-500" /> Cupo Piezas
                </Label>
                <Input 
                  id="edit-quota" 
                  type="number" 
                  className="h-11 font-bold" 
                  value={formData.creativeQuota} 
                  onChange={e => setFormData({...formData, creativeQuota: parseInt(e.target.value) || 0})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image-quota" className="flex items-center gap-1 text-accent">
                <ImageIcon className="h-3 w-3" /> Cupo Imágenes IA
              </Label>
              <Input 
                id="edit-image-quota" 
                type="number" 
                className="h-11 font-bold text-accent" 
                value={formData.imageQuota} 
                onChange={e => setFormData({...formData, imageQuota: parseInt(e.target.value) || 0})} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" className="h-11" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
            </div>

            <DialogFooter className="flex-col md:flex-row gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="h-11 md:h-10">Cancelar</Button>
              <Button type="submit" disabled={loading} className="h-11 md:h-10">
                {loading ? "Actualizando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
