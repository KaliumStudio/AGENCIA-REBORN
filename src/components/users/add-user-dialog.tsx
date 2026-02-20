
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
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

interface AddUserDialogProps {
  onUserAdded: () => void;
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    
    if (!formData.email || !formData.password || !formData.displayName) {
      toast({ title: "Error", description: "Todos los campos son obligatorios", variant: "destructive" });
      return;
    }

    if (formData.role === 'client' && !formData.clientId) {
      toast({ title: "Error", description: "Debe seleccionar un cliente para el rol Cliente", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // 1. Crear instancia secundaria para no cerrar la sesión del admin
      const secondaryAppName = `secondary-app-${Date.now()}`;
      const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        formData.email, 
        formData.password
      );
      
      const uid = userCredential.user.uid;

      // 3. Cerrar sesión en la instancia secundaria y limpiarla
      await signOut(secondaryAuth);

      // 4. Guardar perfil en Firestore
      const newUser: UserProfile = {
        uid: uid,
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
      
      toast({ 
        title: "Usuario creado", 
        description: `Se ha creado el acceso para ${formData.displayName} correctamente.` 
      });
      
      setOpen(false);
      setFormData({ email: '', password: '', displayName: '', role: 'editor', clientId: '' });
      onUserAdded();
    } catch (error: any) {
      console.error("Error creating user:", error);
      let message = "No se pudo crear el usuario.";
      if (error.code === 'auth/email-already-in-use') message = "El correo ya está registrado.";
      if (error.code === 'auth/weak-password') message = "La contraseña es muy débil (mínimo 6 caracteres).";
      
      toast({ title: "Error", description: message, variant: "destructive" });
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
            <DialogDescription>Crea un acceso directo (email/password) y su perfil asociado.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre Completo</Label>
              <Input 
                id="displayName" 
                required 
                placeholder="Ej: Juan Pérez"
                className="h-11"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email"
                required 
                placeholder="usuario@creativeflow.com"
                className="h-11"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña (mín. 6 caracteres)</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  required 
                  placeholder="******"
                  className="h-11 pr-10"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 md:h-10" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="h-11 md:h-10">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : "Crear Acceso y Perfil"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
