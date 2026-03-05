
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Save, Plus, Trash2, Video, Image as ImageIcon, Info, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { VideoSpecification } from '@/types';
import { cn } from '@/lib/utils';

export default function NewBatchPage() {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [landingPage, setLandingPage] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [deliveryDeadlineTime, setDeliveryDeadlineTime] = useState('19:00');
  const [videoSpecs, setVideoSpecs] = useState<VideoSpecification[]>([{ format: 'UGC IA' }]);
  
  const [loading, setLoading] = useState(false);
  const [currentHour, setCurrentHour] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Evitar problemas de hidratación obteniendo la hora solo en el cliente
    setCurrentHour(new Date().getHours());
  }, []);

  const addVideoSpec = () => {
    setVideoSpecs([...videoSpecs, { format: 'UGC IA' }]);
  };

  const removeVideoSpec = (index: number) => {
    if (videoSpecs.length === 1) return;
    const newSpecs = [...videoSpecs];
    newSpecs.splice(index, 1);
    setVideoSpecs(newSpecs);
  };

  const updateVideoSpec = (index: number, field: keyof VideoSpecification, value: string) => {
    const newSpecs = [...videoSpecs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setVideoSpecs(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.clientId || !profile?.uid) return;

    if (!productName || !referenceLinks || !landingPage) {
      toast({ 
        title: "Campos obligatorios", 
        description: "Por favor completa el nombre del producto, videos de referencia y landing page.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      await batchService.createBatch({
        clientId: profile.clientId,
        clientUserUid: profile.uid,
        title: title || `Tanda ${productName}`,
        productName,
        creativeCount: videoSpecs.length,
        videoSpecs,
        referenceLinks,
        landingPage,
        additionalNotes,
        deliveryDeadlineTime,
        assignedEditorUids: [],
        createdBy: profile.uid,
        // Fallback for old fields
        brief: `Producto: ${productName}. Landing: ${landingPage}. Referencias: ${referenceLinks}`,
      });
      
      toast({ title: "Tanda creada", description: "El administrador la asignará pronto." });
      router.push('/client/batches');
    } catch (error: any) {
      console.error("Create batch error:", error);
      toast({ title: "Error", description: "No se pudo crear la tanda.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Horarios disponibles desde las 7 PM (19:00) hasta las 11 PM
  const timeOptions = [
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
  ];

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pb-12">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/client/batches"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Solicitud de Producción</h1>
          </div>

          {currentHour !== null && (
            <Alert className={cn(
              "mb-8 border-l-4 shadow-sm",
              currentHour < 10 ? "bg-emerald-50 border-l-emerald-500 text-emerald-900" : "bg-amber-50 border-l-amber-500 text-amber-900"
            )}>
              <div className="flex items-start gap-3">
                <Clock className={cn("h-5 w-5 mt-0.5", currentHour < 10 ? "text-emerald-600" : "text-amber-600")} />
                <div>
                  <AlertTitle className="font-bold mb-1">Información de Tiempos</AlertTitle>
                  <AlertDescription className="text-sm opacity-90 leading-relaxed">
                    {currentHour < 10 
                      ? "Tu solicitud ha ingresado antes de las 10 AM: la tanda se comenzará a trabajar en el mismo día y se entregará al día siguiente."
                      : "Tu solicitud ha ingresado después de las 10 AM: la tanda se va a comenzar a trabajar al día siguiente, y estará lista al otro día siguiente después de comenzarla a trabajar."
                    }
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>Información General del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Nombre del Producto <span className="text-destructive">*</span></Label>
                    <Input 
                      id="productName" 
                      placeholder="Ej: Aspiradora Pro Max" 
                      value={productName} 
                      onChange={e => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título de la Tanda (Opcional)</Label>
                    <Input 
                      id="title" 
                      placeholder="Ej: Campaña Mayo - 5 Videos" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landingPage">Link de Landing Page / Info <span className="text-destructive">*</span></Label>
                  <Input 
                    id="landingPage" 
                    placeholder="https://tu-tienda.com/producto" 
                    value={landingPage} 
                    onChange={e => setLandingPage(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceLinks">Videos / Imágenes de Referencia <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="referenceLinks" 
                    placeholder="Link de Drive, Biblioteca de anuncios, TikTok, etc." 
                    value={referenceLinks} 
                    onChange={e => setReferenceLinks(e.target.value)}
                    required
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Horario Límite de Entrega (Post 7 PM)</Label>
                  <Select value={deliveryDeadlineTime} onValueChange={setDeliveryDeadlineTime}>
                    <SelectTrigger id="deliveryTime">
                      <SelectValue placeholder="Selecciona un horario" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>{time} HS</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" /> Especificaciones de Creativos
                </h2>
                <Badge variant="secondary" className="px-3 py-1">
                  Total: {videoSpecs.length} Creativos
                </Badge>
              </div>

              {videoSpecs.map((spec, index) => (
                <Card key={index} className="relative overflow-hidden group border-l-4 border-l-accent">
                  <CardHeader className="py-4 flex flex-row items-center justify-between bg-slate-50/50">
                    <CardTitle className="text-base flex items-center gap-2">
                      {spec.format === 'IMAGEN' ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      Creativo #{index + 1}
                    </CardTitle>
                    {videoSpecs.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeVideoSpec(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <Label>{spec.format === 'IMAGEN' ? 'Texto / Detalles de Imagen (Opcional)' : 'Guion (Opcional)'}</Label>
                        <Textarea 
                          placeholder={spec.format === 'IMAGEN' ? "Pega aquí el texto, copy o detalles visuales..." : "Pega aquí el guion o estructura..."} 
                          value={spec.script || ''} 
                          onChange={e => updateVideoSpec(index, 'script', e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Formato</Label>
                          <Select 
                            value={spec.format} 
                            onValueChange={(v) => updateVideoSpec(index, 'format', v as any)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UGC IA">UGC IA</SelectItem>
                              <SelectItem value="CINEMATICO">CINEMATICO</SelectItem>
                              <SelectItem value="POV">POV</SelectItem>
                              <SelectItem value="PODCAST">PODCAST</SelectItem>
                              <SelectItem value="IMAGEN">IMAGEN</SelectItem>
                              <SelectItem value="TRADUCCIÓN SIMPLE">TRADUCCIÓN SIMPLE</SelectItem>
                              <SelectItem value="UGC IA + CINEMATICO">UGC IA + CINEMATICO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Nota para este creativo</Label>
                          <Input 
                            placeholder="Ej: Usar colores llamativos" 
                            value={spec.notes || ''} 
                            onChange={e => updateVideoSpec(index, 'notes', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-dashed border-2 py-8 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-all"
                onClick={addVideoSpec}
              >
                <Plus className="h-6 w-6" />
                <span>Agregar otro anuncio a esta tanda</span>
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Label htmlFor="additionalNotes">Nota Opcional Final</Label>
                <Textarea 
                  id="additionalNotes" 
                  placeholder="Instrucciones generales para toda la tanda..." 
                  value={additionalNotes} 
                  onChange={e => setAdditionalNotes(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t bg-slate-50 p-6">
                <Button variant="outline" type="button" asChild disabled={loading}>
                  <Link href="/client/batches">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={loading} size="lg" className="px-8">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Confirmar Solicitud</>}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
