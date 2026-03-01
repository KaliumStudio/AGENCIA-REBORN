
"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { generateAvatar } from '@/ai/flows/workspace-avatar-flow';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Sparkles, Loader2, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AvatarGeneratorPage() {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({ title: "Campo vacío", description: "Por favor describe el avatar.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const output = await generateAvatar({ description });
      setResult(output.imageUrl);
      toast({ title: "¡Avatar generado!", description: "La IA ha creado tu imagen con éxito." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo generar el avatar.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `avatar-${Date.now()}.png`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/workspace"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generador de Avatares IA</h1>
          <p className="text-muted-foreground">Crea rostros profesionales para tus marcas en segundos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Configuración de la IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Descripción Detallada</Label>
                <Textarea 
                  id="desc"
                  placeholder="Ej: Hombre joven de 30 años, emprendedor, estilo minimalista, fondo de oficina desenfocado, alta resolución, profesional..."
                  className="min-h-[150px] text-base"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Tip: Menciona el género, edad, vestimenta y entorno para mejores resultados.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 text-lg font-bold" 
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando Imagen...</> : "Generar Avatar"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-slate-50 border-dashed">
            <CardContent className="p-6 text-sm text-muted-foreground leading-relaxed">
              <h4 className="font-bold text-slate-900 mb-2">Instrucciones de Uso:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Usa adjetivos descriptivos (ej: "vibrante", "cinemático").</li>
                <li>Especifica la iluminación deseada.</li>
                <li>Evita términos ambiguos.</li>
                <li>La generación puede tardar entre 10 y 20 segundos.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex-1 flex flex-col min-h-[400px] overflow-hidden border-2 border-primary/5 bg-slate-100/50">
            <div className="flex-1 flex items-center justify-center p-8 relative">
              {result ? (
                <div className="relative group">
                  <img src={result} alt="Avatar Generado" className="max-w-full rounded-2xl shadow-2xl transition-transform group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
                    <Button variant="secondary" size="sm" onClick={downloadImage}>
                      <Download className="h-4 w-4 mr-2" /> Descargar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-30">
                  <UserCircle className="h-32 w-32 mx-auto" />
                  <p className="font-bold">Tu creación aparecerá aquí</p>
                </div>
              )}
              {generating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="font-black text-primary animate-pulse">CREANDO MAGIA...</p>
                </div>
              )}
            </div>
            {result && (
              <div className="p-4 bg-white border-t flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setResult(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Empezar de nuevo
                </Button>
                <Button className="flex-1" onClick={downloadImage}>
                  <Download className="h-4 w-4 mr-2" /> Guardar Imagen
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
