
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
import { ArrowLeft, Save, Loader2, Layout, ShoppingBag, Globe, Info, Mail } from 'lucide-react';
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
        <div className="max-w-3xl mx-auto pb-12">
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/client/batches"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">Solicitar Nueva Landing</h1>
              <p className="text-muted-foreground font-medium">Desarrollo personalizado de alta conversión.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="shadow-xl border-t-4 border-t-primary rounded-2xl">
              <CardHeader>
                <CardTitle>1. Plataforma de Venta</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={platform} 
                  onValueChange={(v: any) => setPlatform(v)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="shopify"
                    className={cn(
                      "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                      platform === 'shopify' ? "border-primary bg-primary/5" : ""
                    )}
                  >
                    <RadioGroupItem value="shopify" id="shopify" className="sr-only" />
                    <ShoppingBag className="mb-3 h-8 w-8 text-emerald-600" />
                    <span className="font-bold">SHOPIFY</span>
                  </Label>
                  <Label
                    htmlFor="tiendanube"
                    className={cn(
                      "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                      platform === 'tiendanube' ? "border-primary bg-primary/5" : ""
                    )}
                  >
                    <RadioGroupItem value="tiendanube" id="tiendanube" className="sr-only" />
                    <Layout className="mb-3 h-8 w-8 text-blue-500" />
                    <span className="font-bold">TIENDA NUBE</span>
                  </Label>
                  <Label
                    htmlFor="other"
                    className={cn(
                      "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                      platform === 'other' ? "border-primary bg-primary/5" : ""
                    )}
                  >
                    <RadioGroupItem value="other" id="other" className="sr-only" />
                    <Globe className="mb-3 h-8 w-8 text-slate-500" />
                    <span className="font-bold">OTRO / CODIGO</span>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle>2. Detalles del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="productName">Nombre de tu Producto <span className="text-destructive">*</span></Label>
                  <Input 
                    id="productName" 
                    placeholder="Ej: Smartwatch Serie 9" 
                    value={productName} 
                    onChange={e => setProductName(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bundles">Ofertas / Bundles (Opcional)</Label>
                  <Textarea 
                    id="bundles" 
                    placeholder="Ej: 1 unidad x $15.000, 2 unidades x $25.000 (Envío gratis)" 
                    value={bundles} 
                    onChange={e => setBundles(e.target.value)}
                    className="min-h-[100px] rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driveLink">Link de Drive con Contenido <span className="text-destructive">*</span></Label>
                  <Input 
                    id="driveLink" 
                    placeholder="Link a fotos del producto, videos, logos..." 
                    value={driveLink} 
                    onChange={e => setDriveLink(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" /> Asegúrate de que el acceso sea público o compartido con nosotros.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle>3. Acceso a Plataforma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {platform === 'shopify' ? (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                    <Mail className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-emerald-900 font-bold mb-2">Acceso vía invitación</p>
                      <p className="text-emerald-800 text-sm leading-relaxed">
                        En Shopify no es necesario dar tu contraseña. Ve a <strong>Configuración &gt; Usuarios y Permisos</strong> y envía una invitación de acceso a nuestro correo de desarrollo:
                      </p>
                      <div className="mt-3 bg-white p-3 rounded-lg border border-emerald-200 font-mono text-sm select-all">
                        maurifig100102@gmail.com
                      </div>
                    </div>
                  </div>
                ) : platform === 'tiendanube' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800 flex gap-2">
                      <Info className="h-5 w-5 text-blue-500 shrink-0" />
                      <p>Para Tienda Nube, crea un usuario en configuraciones con un Mail y contraseña temporal y proporciónalos debajo.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="access">Datos de Acceso (Mail y Contraseña)</Label>
                      <Textarea 
                        id="access" 
                        placeholder="Mail: usuario@ejemplo.com / Pass: 123456" 
                        value={accessCredentials} 
                        onChange={e => setAccessCredentials(e.target.value)}
                        className="min-h-[80px] rounded-xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="access">Instrucciones de acceso</Label>
                    <Textarea 
                      id="access" 
                      placeholder="Explícanos cómo acceder a tu plataforma..." 
                      value={accessCredentials} 
                      onChange={e => setAccessCredentials(e.target.value)}
                      className="min-h-[100px] rounded-xl"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle>4. Tiempo de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Fecha Límite Deseada <span className="text-destructive">*</span></Label>
                  <Input 
                    id="deadline" 
                    type="date" 
                    value={deadline} 
                    onChange={e => setDeadline(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Definí tu fecha límite para recibir el trabajo finalizado.</p>
                </div>
              </CardContent>
              <CardFooter className="pt-6 border-t bg-slate-50/50 rounded-b-2xl p-8 flex justify-end gap-4">
                <Button variant="outline" type="button" asChild disabled={loading} className="h-12 px-8 rounded-xl">
                  <Link href="/client/batches">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={loading} size="lg" className="h-12 px-10 rounded-xl font-black shadow-lg">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> ENVIAR SOLICITUD</>}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
