
"use client";

import { useState } from 'react';
import { clientService } from '@/services/client.service';
import { useAuth } from '@/context/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Zap, Image as ImageIcon } from 'lucide-react';

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
    contactEmail: '',
    creativeQuota: 0,
    imageQuota: 0
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await clientService.createClient({ 
        ...formData, 
        creativeQuota: Number(formData.creativeQuota),
        imageQuota: Number(formData.imageQuota),
        createdBy: profile.uid 
      });
      toast({ title: "Cliente creado con éxito" });
      setOpen(false);
      setFormData({ name: '', contact: '', contactEmail: '', creativeQuota: 0, imageQuota: 0 });
      onClientCreated();
    } catch (error) {
      toast({ title: "Error al crear cliente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto h-11 md:h-10"><Plus className="mr-2 h-4 w-4" /> Nuevo Cliente</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <div className="p-6 overflow-y-auto max-h-[90dvh]">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Registrar Nuevo Cliente
            </DialogTitle>
            <DialogDescription>Agrega los datos de la empresa y sus cupos iniciales.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Empresa</Label>
              <Input id="name" required placeholder="Ej: Acme Corp" className="h-11" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Persona de Contacto</Label>
                <Input id="contact" required placeholder="Responsable" className="h-11" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creativeQuota" className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" /> Cupo Creativos
                </Label>
                <Input 
                  id="creativeQuota" 
                  type="number" 
                  min="0"
                  className="h-11 font-bold text-primary" 
                  value={formData.creativeQuota} 
                  onChange={e => setFormData({...formData, creativeQuota: parseInt(e.target.value) || 0})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="imageQuota" className="flex items-center gap-1 text-accent">
                  <ImageIcon className="h-3 w-3" /> Cupo Imágenes IA
                </Label>
                <Input 
                  id="imageQuota" 
                  type="number" 
                  min="0"
                  className="h-11 font-bold text-accent" 
                  value={formData.imageQuota} 
                  onChange={e => setFormData({...formData, imageQuota: parseInt(e.target.value) || 0})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de Contacto</Label>
              <Input id="contactEmail" type="email" placeholder="email@cliente.com" className="h-11" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
            </div>

            <DialogFooter className="flex-col md:flex-row gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setOpen(false)} className="h-11 md:h-10">Cancelar</Button>
              <Button type="submit" disabled={loading} className="h-11 md:h-10">
                {loading ? "Guardando..." : "Crear Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
