
"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layout, Sparkles, Store, Globe, ArrowLeft, 
  ExternalLink, Code2, Rocket, ShoppingCart, 
  Settings2, Palette, Zap, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function LandingGeneratorPage() {
  const [storeType, setStoreType] = useState<'tiendanube' | 'shopify'>('tiendanube');
  const [loading, setLoading] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/workspace"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generador de Landing Pages</h1>
          <p className="text-muted-foreground">Crea estructuras de venta optimizadas para tu tienda online.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel de Configuración */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" /> Configuración Inicial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label>Plataforma de Destino</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant={storeType === 'tiendanube' ? 'default' : 'outline'} 
                    onClick={() => setStoreType('tiendanube')}
                    className="flex flex-col h-auto py-4 gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs">Tienda Nube</span>
                  </Button>
                  <Button 
                    variant={storeType === 'shopify' ? 'default' : 'outline'} 
                    onClick={() => setStoreType('shopify')}
                    className="flex flex-col h-auto py-4 gap-2"
                  >
                    <Store className="h-5 w-5" />
                    <span className="text-xs">Shopify</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-url">URL de tu Tienda</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="store-url" className="pl-9" placeholder="mi-tienda.mitiendanube.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">Token de Acceso (API)</Label>
                <div className="relative">
                  <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="api-key" type="password" className="pl-9" placeholder="tiendanube_token_..." />
                </div>
                <p className="text-[10px] text-muted-foreground">Tu token se cifra y solo se usa para publicar la landing.</p>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg font-bold py-6">
                  <Zap className="mr-2 h-5 w-5" /> Conectar y Generar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Palette className="h-4 w-4 text-accent" /> Estilo de Diseño
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['Moderno', 'Minimal', 'Bold'].map((style) => (
                  <Button key={style} variant="outline" size="sm" className="text-[10px] h-8">
                    {style}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Previsualización / Editor */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="builder" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Layout className="h-4 w-4" /> Constructor de Secciones
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" /> Previsualización Real
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="builder">
              <Card className="min-h-[500px] border-dashed border-2 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Aquí aparecerá tu constructor</h3>
                    <p className="text-sm text-muted-foreground">
                      Estamos listos para integrar tu lógica de Tienda Nube. Pega el código de tu proyecto de GitHub para que podamos renderizar los bloques aquí.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Badge variant="outline" className="px-4 py-1 text-xs">Soporta Secciones</Badge>
                    <Badge variant="outline" className="px-4 py-1 text-xs">Inyección de CSS</Badge>
                    <Badge variant="outline" className="px-4 py-1 text-xs">Sync de Productos</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card className="min-h-[500px] overflow-hidden">
                <div className="bg-slate-800 p-2 flex items-center gap-2 px-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="mx-auto bg-slate-700 rounded px-4 py-1 text-[10px] text-slate-300 font-mono">
                    https://preview.agencia-am.com/draft-landing
                  </div>
                </div>
                <CardContent className="flex items-center justify-center py-32 bg-slate-100 italic text-slate-400">
                  Esperando configuración de Tienda Nube...
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Tips de Conversión */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Optimizado SEO</p>
                <p className="text-[10px] text-emerald-700">Meta tags automáticos.</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
              <Rocket className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-900">Carga Rápida</p>
                <p className="text-[10px] text-blue-700">Imágenes WebP nativas.</p>
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
              <Zap className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">Push Directo</p>
                <p className="text-[10px] text-amber-700">Publicación en 1 click.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
