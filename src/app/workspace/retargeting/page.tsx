
"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { generateRetargetingImage } from '@/ai/flows/workspace-retargeting-flow';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Sparkles, Loader2, Download, RefreshCw, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

export default function RetargetingAdPage() {
  const [formData, setFormData] = useState({
    productName: '',
    offerDetails: '',
    style: 'vibrant'
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!formData.productName || !formData.offerDetails) {
      toast({ title: "Campos incompletos", description: "Nombre y oferta son requeridos.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const output = await generateRetargetingImage(formData);
      setResult(output.imageUrl);
      toast({ title: "¡Anuncio generado!", description: "La pieza de retargeting está lista." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo generar la imagen publicitaria.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `ad-${Date.now()}.png`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/workspace"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Retargeting Ads IA</h1>
          <p className="text-muted-foreground">Genera creativos optimizados para conversión con Nano Banana IA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="shadow-lg border-accent/10">
            <CardHeader className="bg-accent/5">
              <CardTitle className="text-lg flex items-center gap-2 text-accent">
                <Zap className="h-5 w-5" /> Parámetros de Campaña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
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
                />
              </div>
              <div className="space-y-2">
                <Label>Estilo Visual</Label>
                <Select value={formData.style} onValueChange={(v) => setFormData({...formData, style: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimalist">Minimalista Moderno</SelectItem>
                    <SelectItem value="vibrant">Colores Vibrantes (Pop)</SelectItem>
                    <SelectItem value="dark">Elegante / Dark Mode</SelectItem>
                    <SelectItem value="lifestyle">Uso en la vida real</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90" 
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Diseñando...</> : "Generar Pieza Publicitaria"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex-1 flex flex-col min-h-[450px] overflow-hidden border-2 border-accent/10 bg-slate-50 relative">
            <div className="flex-1 flex items-center justify-center p-6">
              {result ? (
                <img src={result} alt="Ad Result" className="max-w-full rounded-lg shadow-xl" />
              ) : (
                <div className="text-center space-y-4 opacity-20">
                  <ImageIcon className="h-32 w-32 mx-auto" />
                  <p className="font-bold">El diseño publicitario aparecerá aquí</p>
                </div>
              )}
              {generating && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <div className="w-24 h-24 relative mb-4">
                    <Loader2 className="absolute inset-0 h-full w-full animate-spin text-accent" />
                    <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-accent animate-pulse" />
                  </div>
                  <p className="font-black text-accent text-xl tracking-tighter">DISEÑANDO ADS...</p>
                </div>
              )}
            </div>
            {result && (
              <div className="p-4 bg-white border-t flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setResult(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Nueva Prueba
                </Button>
                <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={downloadImage}>
                  <Download className="h-4 w-4 mr-2" /> Exportar para Meta Ads
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
