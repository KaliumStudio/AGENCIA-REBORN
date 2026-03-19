
"use client";

import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { generateRetargetingImage } from '@/ai/flows/workspace-retargeting-flow';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { clientService } from '@/services/client.service';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client } from '@/types';
import { ImageIcon, Sparkles, Loader2, Download, RefreshCw, ArrowLeft, Zap, Upload, Package, Layers, MessageCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function RetargetingAdPage() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    productName: '',
    offerDetails: '',
    style: 'vibrant',
    count: 1
  });
  const [productImage, setProductImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const whatsappUrl = `https://wa.me/542645691416?text=Hola! Quiero comprar más cupo de imágenes para la herramienta de Retargeting IA.`;

  // Real-time client data to track image quota
  const clientRef = useMemoFirebase(() => {
    return profile?.clientId ? doc(db, 'clients', profile.clientId) : null;
  }, [profile?.clientId]);

  const { data: client, isLoading: loadingClient } = useDoc<Client>(clientRef);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!client) return;

    if (!formData.productName || !formData.offerDetails) {
      toast({ title: "Campos incompletos", description: "Nombre y oferta son requeridos.", variant: "destructive" });
      return;
    }

    if ((client.imageQuota || 0) < formData.count) {
      toast({ 
        title: "Créditos insuficientes", 
        description: "No tienes suficiente cupo para generar esta cantidad de imágenes.", 
        variant: "destructive" 
      });
      return;
    }

    setGenerating(true);
    setResults([]);
    try {
      const output = await generateRetargetingImage({
        ...formData,
        productImageDataUri: productImage || undefined,
      });
      
      // Deduct quota
      await clientService.deductImageQuota(client.id, formData.count);
      
      setResults(output.images);
      toast({ title: "¡Anuncios generados!", description: `Se han utilizado ${formData.count} créditos de tu cupo.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo generar la imagen publicitaria.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ad-retargeting-${Date.now()}-${index}.png`;
    link.click();
  };

  const hasCredits = (client?.imageQuota || 0) > 0;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/workspace"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Retargeting Ads IA</h1>
            <p className="text-muted-foreground">Genera creativos optimizados para conversión con Nano Banana IA.</p>
          </div>
        </div>

        <Card className="bg-accent/5 border-accent/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-accent/10 p-2 rounded-lg">
              <ImageIcon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tu Cupo Disponible</p>
              <p className="text-xl font-black text-accent">{loadingClient ? '...' : (client?.imageQuota || 0)} Imágenes</p>
            </div>
            {!hasCredits && !loadingClient && (
              <Button size="sm" className="bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold text-xs" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-3 w-3 mr-1" /> COMPRAR
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {!hasCredits && !loadingClient && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-2 bg-amber-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">Créditos de IA agotados</p>
            <p className="text-xs text-amber-800">Necesitas saldo en tu cuenta para generar nuevas piezas publicitarias. Cada unidad tiene un valor de 2 USD.</p>
          </div>
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Cargar Saldo</a>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Lateral de Configuración */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-lg border-accent/10">
            <CardHeader className="bg-accent/5 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-accent">
                <Zap className="h-5 w-5" /> Parámetros de Campaña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Carga de Imagen de Producto */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Package className="h-4 w-4" /> Foto del Producto (Opcional)</Label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                <div 
                  className={cn(
                    "h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden",
                    productImage ? "border-accent/50" : "border-slate-200"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {productImage ? (
                    <div className="relative w-full h-full group">
                      <img src={productImage} className="w-full h-full object-contain" alt="Producto" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Cambiar foto</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-xs font-medium">Click para subir foto</p>
                        <p className="text-[10px] text-muted-foreground">JPG, PNG (Máx 5MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Nombre del Producto</Label>
                <Input 
                  id="product"
                  placeholder="Ej: Reloj Inteligente Serie 9"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer">Oferta o Gancho (Hook)</Label>
                <Textarea 
                  id="offer"
                  placeholder="Ej: ¡Última oportunidad! 30% OFF solo por hoy. Envío Gratis."
                  value={formData.offerDetails}
                  onChange={(e) => setFormData({...formData, offerDetails: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estilo Visual</Label>
                  <Select value={formData.style} onValueChange={(v) => setFormData({...formData, style: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimalist">Minimalista</SelectItem>
                      <SelectItem value="vibrant">Vibrante (Pop)</SelectItem>
                      <SelectItem value="dark">Elegante (Dark)</SelectItem>
                      <SelectItem value="lifestyle">Vida Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Cantidad</Label>
                  <Select value={formData.count.toString()} onValueChange={(v) => setFormData({...formData, count: parseInt(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'Anuncio' : 'Anuncios'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-6 flex flex-col gap-4">
              <Button 
                className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 shadow-lg" 
                onClick={handleGenerate}
                disabled={generating || !hasCredits}
              >
                {generating ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Diseñando...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" /> Generar Piezas Publicitarias</>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter">
                Inversión: {formData.count} Créditos IA (Valor Ref: 2 USD c/u)
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Visualización de Resultados */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col min-h-[500px] overflow-hidden border-2 border-accent/5 bg-slate-50/50 relative">
            <div className="p-4 bg-white border-b flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Galería de Creativos</h3>
              {results.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setResults([])} className="text-xs h-8">
                  <RefreshCw className="h-3 w-3 mr-1" /> Limpiar
                </Button>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {results.length > 0 ? (
                <div className={cn(
                  "grid gap-6",
                  results.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                )}>
                  {results.map((url, idx) => (
                    <div key={idx} className="relative group animate-in fade-in zoom-in-95 duration-500">
                      <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-xl border border-accent/10">
                        <img 
                          src={url} 
                          alt={`Ad Variant ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 rounded-2xl backdrop-blur-sm">
                        <p className="text-white font-bold text-xs">Variante #{idx + 1}</p>
                        <Button variant="secondary" size="sm" className="font-bold" onClick={() => downloadImage(url, idx)}>
                          <Download className="h-4 w-4 mr-2" /> Descargar PNG
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Tu mesa de trabajo está lista</p>
                    <p className="text-sm">Configura el producto y la oferta para comenzar.</p>
                  </div>
                </div>
              )}

              {generating && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in">
                  <div className="relative w-32 h-32 mb-8">
                    <Loader2 className="absolute inset-0 h-full w-full animate-spin text-accent opacity-20" strokeWidth={1} />
                    <div className="absolute inset-4 rounded-full bg-accent/10 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-accent animate-pulse" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase text-center">
                    {formData.count > 1 ? `DISEÑANDO ${formData.count} VARIANTES...` : 'DISEÑANDO TU ANUNCIO...'}
                  </h2>
                  <p className="text-muted-foreground mt-2 animate-pulse font-medium text-center px-6">Nano Banana Pro está consumiendo créditos de tu cupo de imágenes</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="p-4 bg-accent/20 rounded-2xl">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Optimizado para Conversión</h4>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                  Nuestra IA analiza los hooks de venta y el estilo seleccionado. Cada generación exitosa descuenta saldo de tu cupo de imágenes IA.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full -mr-16 -mt-16" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
