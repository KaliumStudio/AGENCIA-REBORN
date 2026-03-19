
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
import { Building2, User, Mail, Lock, Loader2, Home, ArrowLeft, Sparkles } from 'lucide-react';
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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      const clientId = await clientService.createClient({
        name: formData.companyName,
        contact: formData.displayName,
        contactEmail: formData.email,
        creativeQuota: 0,
        createdBy: uid
      });

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#05070A] px-4 py-12 relative overflow-hidden">
      {/* Elementos de iluminación de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-xl space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <Link href="/login"><ArrowLeft className="h-4 w-4" /> LOGIN</Link>
          </Button>
          <Button variant="ghost" asChild className="gap-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <Link href="/"><Home className="h-4 w-4" /> IR AL INICIO</Link>
          </Button>
        </div>

        <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl shadow-2xl rounded-[32px] overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#05070A] p-4 rounded-2xl flex items-center justify-center text-white font-black text-3xl tracking-tighter shadow-xl">
                  AM
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter text-white uppercase">Registro de Cliente</CardTitle>
            <CardDescription className="text-gray-400 font-medium mt-2">Empieza a escalar tu marca con creativos de alta gama</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-6 px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Tu Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      id="displayName" 
                      placeholder="Juan Pérez" 
                      value={formData.displayName} 
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      required
                      className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Empresa</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      id="companyName" 
                      placeholder="Mi Marca Pro" 
                      value={formData.companyName} 
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      required
                      className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Email Corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="ejemplo@agencia.com" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 p-8">
              <Button className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 rounded-2xl transition-all hover:-translate-y-1" type="submit" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> PROCESANDO...</>
                ) : (
                  "CREAR MI CUENTA VIP"
                )}
              </Button>
              <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest px-6 leading-relaxed">
                Al registrarte, te unes a una red exclusiva de marcas potenciadas por IA.
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
          <Sparkles className="h-3 w-3" />
          <span>Infraestructura de Grado Agencia</span>
        </div>
      </div>
    </div>
  );
}
