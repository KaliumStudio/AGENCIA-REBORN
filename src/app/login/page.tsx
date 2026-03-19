
"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Home, Sparkles, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      toast({
        title: "Error de acceso",
        description: "Credenciales inválidas. Por favor intenta de nuevo.",
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
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex justify-center">
          <Button variant="ghost" asChild className="gap-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <Link href="/"><Home className="h-4 w-4" /> IR AL INICIO</Link>
          </Button>
        </div>

        <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl shadow-2xl rounded-[32px] overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#05070A] p-4 rounded-2xl flex items-center justify-center text-white font-black text-3xl tracking-tighter shadow-xl">
                  AM
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter text-white uppercase">Portal de Agencia</CardTitle>
            <CardDescription className="text-gray-400 font-medium mt-2">Gestiona tu producción creativa de élite</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 px-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Email Corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@empresa.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 p-8">
              <Button className="w-full h-12 text-base font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl transition-all hover:-translate-y-0.5" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "ACCEDER AL PORTAL"}
              </Button>
              
              <div className="text-center w-full">
                <p className="text-sm text-gray-500 font-medium">
                  ¿Eres un nuevo cliente?{" "}
                  <Link href="/signup" className="text-primary font-black hover:text-primary/80 transition-colors">
                    Crea tu cuenta aquí
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
          <Sparkles className="h-3 w-3" />
          <span>Tecnología IA de Agencia AM</span>
        </div>
      </div>
    </div>
  );
}
