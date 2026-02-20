
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { ArrowLeft, Save, Plus, Trash2, Video, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { VideoSpecification, Batch } from '@/types';

export default function EditBatchPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [landingPage, setLandingPage] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [deliveryDeadlineTime, setDeliveryDeadlineTime] = useState('19:00');
  const [videoSpecs, setVideoSpecs] = useState<VideoSpecification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      batchService.getBatch(id as string).then((batch) => {
        if (batch) {
          if (batch.status === 'approved') {
            toast({ title: "No editable", description: "Esta tanda ya ha sido aprobada.", variant: "destructive" });
            router.push(`/client/batches/${id}`);
            return;
          }
          setTitle(batch.title || '');
          setProductName(batch.productName || '');
          setReferenceLinks(batch.referenceLinks || '');
          setLandingPage(batch.landingPage || '');
          setAdditionalNotes(batch.additionalNotes || '');
          setDeliveryDeadlineTime(batch.deliveryDeadlineTime || '19:00');
          setVideoSpecs(batch.videoSpecs || [{ format: 'UGC IA' }]);
        }
        setLoading(false);
      });
    }
  }, [id, router, toast]);

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
    if (!profile?.uid || !id) return;

    if (!productName || !referenceLinks || !landingPage) {
      toast({ 
        title: "Campos obligatorios", 
        description: "Por favor completa el nombre del producto, videos de referencia y landing page.", 
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);
    try {
      batchService.updateBatch(id as string, {
        title: title || `Tanda ${productName}`,
        productName,
        creativeCount: videoSpecs.length,
        videoSpecs,
        referenceLinks,
        landingPage,
        additionalNotes,
        deliveryDeadlineTime,
        // Fallback for old fields
        brief: `Producto: ${productName}. Landing: ${landingPage}. Referencias: ${referenceLinks}`,
      });
      
      toast({ title: "Tanda actualizada", description: "Los cambios se han guardado correctamente." });
      router.push(`/client/batches/${id}`);
    } catch (error: any) {
      console.error("Update batch error:", error);
      toast({ title: "Error", description: "No se pudo actualizar la tanda.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Horarios disponibles desde las 7 PM (19:00) hasta las 11 PM
  const timeOptions = [
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pb-12">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/client/batches/${id}`}><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Editar Solicitud</h1>
          </div>

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
                <Button variant="outline" type="button" asChild disabled={saving}>
                  <Link href={`/client/batches/${id}`}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={saving} size="lg" className="px-8">
                  {saving ? "Guardando..." : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
