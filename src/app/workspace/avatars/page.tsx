"use client";

import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { generateAvatar } from '@/ai/flows/workspace-avatar-flow';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { clientService } from '@/services/client.service';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client } from '@/types';
import { 
  UserCircle, Sparkles, Loader2, Download, RefreshCw, 
  ArrowLeft, Upload, Image as ImageIcon, Briefcase, 
  MapPin, User, Layout, Layers, Package, Users, MessageCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AvatarGeneratorPage() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    age: '',
    gender: 'sin_especificar',
    country: '',
    holdingProduct: false,
    location: 'casa',
    physicalTraits: '',
    archetype: 'common',
    aspectRatio: '1:1',
    count: 1,
    additionalInstructions: ''
  });

  const [referenceImg, setReferenceImg] = useState<string | null>(null);
  const [productImg, setProductImg] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  
  const refInputRef = useRef<HTMLInputElement>(null);
  const prodInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const whatsappUrl = `https://wa.me/5491167109123?text=Hola! Quiero comprar más cupo de imágenes para la herramienta de Avatares IA.`;

  // Real-time client data to track image quota
  const clientRef = useMemoFirebase(() => {
    return profile?.clientId ? doc(db, 'clients', profile.clientId) : null;
  }, [profile?.clientId]);

  const { data: client, isLoading: loadingClient } = useDoc<Client>(clientRef);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ref' | 'prod') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'ref') setReferenceImg(reader.result as string);
      else setProductImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!client) return;
    
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
      const output = await generateAvatar({
        ...formData,
        archetype: formData.archetype as any,
        aspectRatio: formData.aspectRatio as any,
        gender: formData.gender as any,
        referenceImageDataUri: referenceImg || undefined,
        productImageDataUri: productImg || undefined,
      });
      
      // Deduct quota
      await clientService.deductImageQuota(client.id, formData.count);
      
      setResults(output.images);
      toast({ title: "¡Avatares generados!", description: `Se han utilizado ${formData.count} créditos de tu cupo.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo procesar la generación de imágenes.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `avatar-${Date.now()}-${index}.png`;
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
            <h1 className="text-3xl font-bold tracking-tight">Generador de Avatares Pro</h1>
            <p className="text-muted-foreground">Crea personajes hiperrealistas con Nano Banana IA.</p>
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tu Cupo Disponible</p>
              <p className="text-xl font-black text-primary">{loadingClient ? '...' : (client?.imageQuota || 0)} Imágenes</p>
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
            <p className="text-sm font-bold text-amber-900">Te has quedado sin créditos de IA</p>
            <p className="text-xs text-amber-800">Cada generación consume créditos de tu cupo. Puedes adquirir más por 2 USD la unidad.</p>
          </div>
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Solicitar Carga</a>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Formulario de Configuración */}
        <div className="xl:col-span-5 space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Configuración de Personaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Género y Edad */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Género</Label>
                  <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin_especificar">Aleatorio</SelectItem>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> Edad</Label>
                  <Input 
                    placeholder="Ej: 25 años" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                  />
                </div>
              </div>

              {/* País y Perfil */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> País/Etnia</Label>
                  <Input 
                    placeholder="Ej: Argentina" 
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> Perfil/Rol</Label>
                  <Select value={formData.archetype} onValueChange={v => setFormData({...formData, archetype: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Persona Común</SelectItem>
                      <SelectItem value="authority">Figura de Autoridad</SelectItem>
                      <SelectItem value="sports">Deportista</SelectItem>
                      <SelectItem value="professional">Profesional/Oficina</SelectItem>
                      <SelectItem value="creative">Artista/Creativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ubicación y Rasgos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Lugar</Label>
                  <Select value={formData.location} onValueChange={v => setFormData({...formData, location: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa (General)</SelectItem>
                      <SelectItem value="cocina">Cocina</SelectItem>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="cafe">Cafetería</SelectItem>
                      <SelectItem value="gimnasio">Gimnasio</SelectItem>
                      <SelectItem value="calle">Exterior/Calle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rasgos Físicos</Label>
                  <Input 
                    placeholder="Ej: Pelo rubio, barba..." 
                    value={formData.physicalTraits}
                    onChange={e => setFormData({...formData, physicalTraits: e.target.value})}
                  />
                </div>
              </div>

              {/* Producto */}
              <div className="p-4 rounded-xl border bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> ¿Sostiene un producto?</Label>
                    <p className="text-[10px] text-muted-foreground">Adjunta la imagen para que la IA lo integre.</p>
                  </div>
                  <Switch 
                    checked={formData.holdingProduct} 
                    onCheckedChange={v => setFormData({...formData, holdingProduct: v})} 
                  />
                </div>
                
                {formData.holdingProduct && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95">
                    <input type="file" ref={prodInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'prod')} />
                    <Button 
                      variant="outline" 
                      className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
                      onClick={() => prodInputRef.current?.click()}
                    >
                      {productImg ? (
                        <img src={productImg} className="h-full w-auto object-contain rounded" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-xs">Subir foto del producto</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Referencia Facial */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><UserCircle className="h-4 w-4" /> Imagen de Referencia (Opcional)</Label>
                <input type="file" ref={refInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'ref')} />
                <div 
                  className="h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden"
                  onClick={() => refInputRef.current?.click()}
                >
                  {referenceImg ? (
                    <img src={referenceImg} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground text-center px-4">Referencia de rostro o estilo visual</span>
                    </>
                  )}
                </div>
              </div>

              {/* Configuración de Salida */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Layout className="h-3.5 w-3.5" /> Formato</Label>
                  <Select value={formData.aspectRatio} onValueChange={v => setFormData({...formData, aspectRatio: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Cuadrado (1:1)</SelectItem>
                      <SelectItem value="9:16">Vertical (9:16)</SelectItem>
                      <SelectItem value="16:9">Horizontal (16:9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Cantidad (Máx 4)</Label>
                  <Select value={formData.count.toString()} onValueChange={v => setFormData({...formData, count: parseInt(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Imagen' : 'Imágenes'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-6 flex flex-col gap-4">
              <Button 
                className="w-full h-12 text-lg font-bold shadow-xl" 
                onClick={handleGenerate}
                disabled={generating || !hasCredits}
              >
                {generating ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creando Personajes...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" /> Generar con Nano Banana Pro</>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter">
                Costo: {formData.count} Créditos • Valor unitario sugerido: 2 USD
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Resultados */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col min-h-[600px] border-2 border-primary/5 bg-slate-100/30 overflow-hidden relative">
            <div className="p-4 bg-white border-b flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Mesa de Trabajo</h3>
              {results.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setResults([])} className="text-xs h-8">
                  <RefreshCw className="h-3 w-3 mr-1" /> Limpiar Todo
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {results.length > 0 ? (
                <div className={cn(
                  "grid gap-6",
                  results.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                )}>
                  {results.map((url, idx) => (
                    <div key={idx} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-2xl border border-primary/10 ring-1 ring-black/5">
                        <img 
                          src={url} 
                          alt={`Avatar ${idx + 1}`} 
                          className={cn(
                            "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                            formData.aspectRatio === '9:16' ? 'aspect-[9/16]' : formData.aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-square'
                          )}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 rounded-2xl backdrop-blur-sm">
                        <p className="text-white font-bold text-xs">Variante #{idx + 1}</p>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => downloadImage(url, idx)}>
                            <Download className="h-4 w-4 mr-2" /> Descargar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                  <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                    <UserCircle className="h-12 w-12 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Tu galería creativa está vacía</p>
                    <p className="text-sm">Configura los rasgos a la izquierda para comenzar.</p>
                  </div>
                </div>
              )}

              {generating && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in">
                  <div className="relative w-32 h-32 mb-8">
                    <Loader2 className="absolute inset-0 h-full w-full animate-spin text-primary opacity-20" strokeWidth={1} />
                    <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase text-center px-6">DISEÑANDO AVATARES...</h2>
                  <p className="text-muted-foreground mt-2 animate-pulse font-medium text-center">Nano Banana Pro está consumiendo créditos de tu cupo</p>
                  <div className="mt-8 flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="p-4 bg-primary/20 rounded-2xl">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Estilo Realista iPhone 11</h4>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                  Generación de personajes optimizada para social media. Cada crédito permite descargar una imagen en alta resolución sin marcas de agua.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
