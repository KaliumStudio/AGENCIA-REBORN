
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { landingRequestService } from '@/services/landing-request.service';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Layout, ShoppingBag, Globe, Info, Mail, Sparkles, Key, Calendar } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NewLandingRequestPage() {
  const { profile } = useAuth();
  const [platform, setPlatform] = useState<'shopify' | 'tiendanube' | 'other'>('shopify');
  const [productName, setProductName] = useState('');
  const [bundles, setBundles] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [accessCredentials, setAccessCredentials] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.clientId || !profile?.uid) return;

    if (!productName || !driveLink || !deadline) {
      toast({ 
        title: "Campos obligatorios", 
        description: "Completa el nombre del producto, link de drive y fecha límite.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      await landingRequestService.createRequest({
        clientId: profile.clientId,
        clientUserUid: profile.uid,
        platform,
        productName,
        bundles,
        driveLink,
        accessCredentials,
        deadline
      });
      
      toast({ title: "Solicitud enviada", description: "El equipo de Agencia AM revisará tu pedido pronto." });
      router.push('/client/batches');
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo enviar la solicitud.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto pb-24">
          <div className="mb-10 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/10">
              <Link href="/client/batches"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">Solicitar Landing</h1>
              <p className="text-gray-400 mt-2 font-medium">Desarrollo especializado de alta conversión.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <Card className="bg-white/[0.02] backdrop-blur-xl border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" /> 1. Plataforma de Venta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <RadioGroup 
                  value={platform} 
                  onValueChange={(v: any) => setPlatform(v)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <Label
                    htmlFor="shopify"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border-2 border-white/5 bg-white/[0.03] p-6 hover:bg-white/5 cursor-pointer transition-all h-32",
                      platform === 'shopify' ? "border-primary bg-primary/10" : ""
                    )}
                  >
                    <RadioGroupItem value="shopify" id="shopify" className="sr-only" />
                    <ShoppingBag className={cn("mb-3 h-8 w-8", platform === 'shopify' ? "text-primary" : "text-gray-500")} />
                    <span className={cn("font-black uppercase text-xs tracking-widest", platform === 'shopify' ? "text-white" : "text-gray-500")}>SHOPIFY</span>
                  </Label>
                  <Label
                    htmlFor="tiendanube"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border-2 border-white/5 bg-white/[0.03] p-6 hover:bg-white/5 cursor-pointer transition-all h-32",
                      platform === 'tiendanube' ? "border-primary bg-primary/10" : ""
                    )}
                  >
                    <RadioGroupItem value="tiendanube" id="tiendanube" className="sr-only" />
                    <Layout className={cn("mb-3 h-8 w-8", platform === 'tiendanube' ? "text-blue-400" : "text-gray-500")} />
                    <span className={cn("font-black uppercase text-xs tracking-widest", platform === 'tiendanube' ? "text-white" : "text-gray-500")}>TIENDA NUBE</span>
                  </Label>
                  <Label
                    htmlFor="other"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border-2 border-white/5 bg-white/[0.03] p-6 hover:bg-white/5 cursor-pointer transition-all h-32",
                      platform === 'other' ? "border-primary bg-primary/10" : ""
                    )}
                  >
                    <RadioGroupItem value="other" id="other" className="sr-only" />
                    <Globe className={cn("mb-3 h-8 w-8", platform === 'other' ? "text-white" : "text-gray-500")} />
                    <span className={cn("font-black uppercase text-xs tracking-widest", platform === 'other' ? "text-white" : "text-gray-500")}>OTRO / CODIGO</span>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] backdrop-blur-xl border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Layout className="h-5 w-5 text-primary" /> 2. Detalles del Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nombre del Producto *</Label>
                  <Input 
                    id="productName" 
                    placeholder="Ej: Smartwatch Serie 9" 
                    value={productName} 
                    onChange={e => setProductName(e.target.value)}
                    required
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bundles" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Ofertas / Bundles (Opcional)</Label>
                  <Textarea 
                    id="bundles" 
                    placeholder="Ej: 1 unidad x $15.000, 2 unidades x $25.000 (Envío gratis)" 
                    value={bundles} 
                    onChange={e => setBundles(e.target.value)}
                    className="min-h-[100px] bg-white/5 border-white/10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driveLink" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Link de Drive con Contenido *</Label>
                  <Input 
                    id="driveLink" 
                    placeholder="Pega el link con fotos, videos y logos..." 
                    value={driveLink} 
                    onChange={e => setDriveLink(e.target.value)}
                    required
                    className="h-12 bg-white/5 border-white/10 rounded-xl"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase mt-2">
                    <Info className="h-3 w-3 text-primary" /> Asegúrate de que el acceso sea público o compartido.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] backdrop-blur-xl border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary" /> 3. Acceso a Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {platform === 'shopify' ? (
                  <div className="p-8 bg-primary/5 rounded-[24px] border border-primary/10 flex items-start gap-6">
                    <div className="p-3 bg-primary/20 rounded-2xl">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-black uppercase tracking-widest text-sm mb-2">Acceso vía invitación</p>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium">
                        En Shopify no es necesario dar tu contraseña. Ve a <strong>Configuración &gt; Usuarios y Permisos</strong> y envía una invitación de acceso a nuestro correo de desarrollo:
                      </p>
                      <div className="mt-4 bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-sm text-primary select-all text-center">
                        maurifig100102@gmail.com
                      </div>
                    </div>
                  </div>
                ) : platform === 'tiendanube' ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-sm text-gray-400 font-medium leading-relaxed flex gap-4">
                      <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                      <p>Para Tienda Nube, crea un usuario en configuraciones con un Mail y contraseña temporal y proporciónalos debajo.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="access" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Datos de Acceso (Mail y Contraseña)</Label>
                      <Textarea 
                        id="access" 
                        placeholder="Mail: usuario@ejemplo.com / Pass: 123456" 
                        value={accessCredentials} 
                        onChange={e => setAccessCredentials(e.target.value)}
                        className="min-h-[100px] bg-white/5 border-white/10 rounded-xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="access" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Instrucciones de acceso</Label>
                    <Textarea 
                      id="access" 
                      placeholder="Explícanos cómo acceder a tu plataforma o framework..." 
                      value={accessCredentials} 
                      onChange={e => setAccessCredentials(e.target.value)}
                      className="min-h-[100px] bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] backdrop-blur-xl border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" /> 4. Tiempo de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Fecha Límite Deseada *</Label>
                  <Input 
                    id="deadline" 
                    type="date" 
                    value={deadline} 
                    onChange={e => setDeadline(e.target.value)}
                    required
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary text-white"
                  />
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-3">Sujeto a disponibilidad del equipo técnico.</p>
                </div>
              </CardContent>
              <CardFooter className="p-8 border-t border-white/5 bg-transparent flex flex-col sm:flex-row justify-end gap-4 mt-4">
                <Button variant="ghost" type="button" asChild disabled={loading} className="h-14 px-10 rounded-2xl font-black text-gray-500 hover:text-white uppercase tracking-widest text-xs">
                  <Link href="/client/batches">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={loading} size="lg" className="h-14 px-12 rounded-2xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all uppercase tracking-widest text-xs">
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> ENVIAR SOLICITUD WEB</>}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
