"use client";

import { useState, useEffect } from 'react';
import { clientService } from '@/services/client.service';
import { Client } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';

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
    contactEmail: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    if (open && client) {
      setFormData({
        name: client.name,
        contact: client.contact,
        contactEmail: client.contactEmail || ''
      });
    }
  }, [open, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clientService.updateClient(client.id, formData);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" /> Editar Cliente
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input 
              id="edit-name" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contact">Contacto</Label>
            <Input 
              id="edit-contact" 
              required 
              value={formData.contact}
              onChange={e => setFormData({...formData, contact: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input 
              id="edit-email" 
              type="email"
              value={formData.contactEmail}
              onChange={e => setFormData({...formData, contactEmail: e.target.value})}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
