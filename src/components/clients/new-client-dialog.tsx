"use client";

import { useState } from 'react';
import { clientService } from '@/services/client.service';
import { useAuth } from '@/context/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus } from 'lucide-react';

interface NewClientDialogProps {
  onClientCreated: () => void;
}

export function NewClientDialog({ onClientCreated }: NewClientDialogProps) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    contactEmail: ''
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      await clientService.createClient({
        ...formData,
        createdBy: profile.uid
      });
      toast({ title: "Cliente creado con éxito" });
      setOpen(false);
      setFormData({ name: '', contact: '', contactEmail: '' });
      onClientCreated();
    } catch (error) {
      console.error("Create client failed:", error);
      throw error; // Rethrow the error to be caught by the caller
      toast({ title: "Error al crear cliente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Cliente</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Registrar Nuevo Cliente
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Empresa / Cliente</Label>
            <Input 
              id="name" 
              required 
              placeholder="Ej: Acme Corp"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Persona de Contacto</Label>
            <Input 
              id="contact" 
              required 
              placeholder="Nombre del responsable"
              value={formData.contact}
              onChange={e => setFormData({...formData, contact: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email de Contacto (Opcional)</Label>
            <Input 
              id="contactEmail" 
              type="email"
              placeholder="email@cliente.com"
              value={formData.contactEmail}
              onChange={e => setFormData({...formData, contactEmail: e.target.value})}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
