"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { clientService } from '@/services/client.service';
import { Client, UserRole, UserProfile } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

interface AddUserDialogProps {
  onUserAdded: () => void;
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [formData, setFormData] = useState({
    uid: '',
    displayName: '',
    role: 'editor' as UserRole,
    clientId: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      clientService.getAllClients().then(setClients);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.uid || !formData.displayName) {
      toast({ title: "Error", description: "Todos los campos son obligatorios", variant: "destructive" });
      return;
    }

    if (formData.role === 'client' && !formData.clientId) {
      toast({ title: "Error", description: "Debe seleccionar un cliente para el rol Cliente", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const newUser: UserProfile = {
        uid: formData.uid,
        displayName: formData.displayName,
        role: formData.role,
        active: true,
        notificationPrefs: {
          email: true,
          push: true
        }
      };

      if (formData.role === 'client') {
        newUser.clientId = formData.clientId;
      }

      await userService.saveProfile(newUser);
      
      toast({ title: "Usuario creado", description: "El perfil ha sido registrado correctamente." });
      setOpen(false);
      setFormData({ uid: '', displayName: '', role: 'editor', clientId: '' });
      onUserAdded();
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo crear el perfil", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto h-11 md:h-10">
          <UserPlus className="mr-2 h-4 w-4" /> Agregar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[90dvh]">
          <DialogHeader className="mb-6">
            <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
            <DialogDescription>Crea un perfil de usuario vinculado a un ID de autenticación.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="uid">UID de Firebase (Auth)</Label>
              <Input 
                id="uid" 
                required 
                placeholder="Pegar el UID desde el panel de Firebase Auth"
                className="h-11"
                value={formData.uid}
                onChange={e => setFormData({...formData, uid: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre Completo</Label>
              <Input 
                id="displayName" 
                required 
                placeholder="Nombre del usuario"
                className="h-11"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Rol del Sistema</Label>
              <Select value={formData.role} onValueChange={(v: UserRole) => setFormData({...formData, role: v})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'client' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label>Vincular a Empresa / Cliente</Label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="flex-col md:flex-row gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 md:h-10">Cancelar</Button>
              <Button type="submit" disabled={loading} className="h-11 md:h-10">
                {loading ? "Registrando..." : "Crear Perfil"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
