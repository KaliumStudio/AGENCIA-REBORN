
"use client";

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { clientService } from '@/services/client.service';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast({
        title: "Contraseña corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      // 2. Crear la entidad Cliente (Empresa)
      const clientId = await clientService.createClient({
        name: formData.companyName,
        contact: formData.displayName,
        contactEmail: formData.email,
        creativeQuota: 0,
        createdBy: uid
      });

      // 3. Crear el perfil de usuario vinculado
      await userService.saveProfile({
        uid: uid,
        displayName: formData.displayName,
        role: 'client',
        clientId: clientId,
        active: true,
        notificationPrefs: {
          email: true,
          push: true
        }
      });

      toast({
        title: "¡Bienvenido a Agencia AM!",
        description: "Tu cuenta ha sido creada exitosamente."
      });
      
      router.push('/client/batches');
    } catch (error: any) {
      console.error("Signup error:", error);
      let message = "No se pudo completar el registro.";
      if (error.code === 'auth/email-already-in-use') message = "Este correo ya está registrado.";
      
      toast({
        title: "Error de registro",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center justify-start">
          <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-primary">
            <Link href="/login"><ArrowLeft className="h-4 w-4" /> Volver al login</Link>
          </Button>
        </div>

        <Card className="shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-3 rounded-xl shadow-lg rotate-3">
                <div className="flex items-center justify-center text-white font-black text-2xl tracking-tighter">
                  AM
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Registro de Cliente</CardTitle>
            <CardDescription>Crea tu cuenta corporativa para empezar a solicitar creativos</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" /> Nombre Completo
                  </Label>
                  <Input 
                    id="displayName" 
                    placeholder="Juan Pérez" 
                    value={formData.displayName} 
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Nombre de Empresa
                  </Label>
                  <Input 
                    id="companyName" 
                    placeholder="Mi Tienda Online" 
                    value={formData.companyName} 
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary" /> Email Corporativo
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="ejemplo@agencia.com" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-primary" /> Contraseña
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="h-11"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full h-12 text-base font-bold shadow-md" type="submit" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando registro...</>
                ) : (
                  "Crear mi Cuenta de Agencia"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground px-6">
                Al registrarte, aceptas que el administrador de la agencia verifique tu empresa para habilitar tu cupo de producción.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
