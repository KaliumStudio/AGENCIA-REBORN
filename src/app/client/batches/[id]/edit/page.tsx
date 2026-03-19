
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
import { ArrowLeft, Save, Plus, Trash2, Video, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
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
      await batchService.updateBatch(id as string, {
        title: title || `Tanda ${productName}`,
        productName,
        creativeCount: videoSpecs.length,
        videoSpecs,
        referenceLinks,
        landingPage,
        additionalNotes,
        deliveryDeadlineTime,
        brief: `Producto: ${productName}. Landing: ${landingPage}. Referencias: ${referenceLinks}`,
      }, profile.uid, profile.displayName);
      
      toast({ title: "Tanda actualizada", description: "Los cambios se han guardado correctamente." });
      router.push(`/client/batches/${id}`);
    } catch (error: any) {
      console.error("Update batch error:", error);
      toast({ title: "Error", description: "No se pudo actualizar la tanda.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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
        <div className="max-w-4xl mx-auto pb-24">
          <div className="mb-10 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/10">
              <Link href={`/client/batches/${id}`}><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">Editar Solicitud</h1>
              <p className="text-gray-400 mt-2 font-medium">Actualiza los detalles técnicos de tu tanda.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <Card className="bg-white/[0.02] backdrop-blur-xl border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" /> Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="productName" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nombre del Producto *</Label>
                    <Input 
                      id="productName" 
                      value={productName} 
                      onChange={e => setProductName(e.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Título de la Tanda</Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landingPage" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Link de Landing Page *</Label>
                  <Input 
                    id="landingPage" 
                    value={landingPage} 
                    onChange={e => setLandingPage(e.target.value)}
                    required
                    className="h-12 bg-white/5 border-white/10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceLinks" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Referencias Visuales *</Label>
                  <Textarea 
                    id="referenceLinks" 
                    value={referenceLinks} 
                    onChange={e => setReferenceLinks(e.target.value)}
                    required
                    className="min-h-[100px] bg-white/5 border-white/10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTime" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Horario Límite</Label>
                  <Select value={deliveryDeadlineTime} onValueChange={setDeliveryDeadlineTime}>
                    <SelectTrigger id="deliveryTime" className="h-12 bg-white/5 border-white/10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>{time} HS</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Video className="h-6 w-6 text-primary" /> Creativos
                </h2>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-none font-black px-4 py-1 rounded-full">
                  TOTAL: {videoSpecs.length}
                </Badge>
              </div>

              {videoSpecs.map((spec, index) => (
                <Card key={index} className="bg-white/[0.02] border-white/10 rounded-[32px] overflow-hidden shadow-xl border-l-4 border-l-primary">
                  <CardHeader className="py-4 px-8 bg-white/[0.04] flex flex-row items-center justify-between border-b border-white/5">
                    <CardTitle className="text-sm font-black text-white uppercase tracking-widest">
                      ITEM #{index + 1}
                    </CardTitle>
                    {videoSpecs.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button" 
                        className="text-red-500 hover:bg-red-500/10 rounded-full"
                        onClick={() => removeVideoSpec(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Detalles / Guion</Label>
                        <Textarea 
                          value={spec.script || ''} 
                          onChange={e => updateVideoSpec(index, 'script', e.target.value)}
                          className="min-h-[120px] bg-white/5 border-white/10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Formato</Label>
                          <Select 
                            value={spec.format} 
                            onValueChange={(v) => updateVideoSpec(index, 'format', v as any)}
                          >
                            <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10">
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
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nota</Label>
                          <Input 
                            value={spec.notes || ''} 
                            onChange={e => updateVideoSpec(index, 'notes', e.target.value)}
                            className="h-12 bg-white/5 border-white/10 rounded-xl"
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
                className="w-full border-dashed border-2 border-white/10 py-10 rounded-[32px] bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col gap-3 group"
                onClick={addVideoSpec}
              >
                <div className="p-3 bg-white/5 rounded-full group-hover:scale-110 transition-all">
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-primary" />
                </div>
                <span className="font-black text-xs uppercase tracking-widest text-gray-500">Añadir otro creativo</span>
              </Button>
            </div>

            <Card className="bg-white/[0.02] border-white/10 rounded-[32px] overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <Label htmlFor="additionalNotes" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Instrucciones Adicionales</Label>
                <Textarea 
                  id="additionalNotes" 
                  value={additionalNotes} 
                  onChange={e => setAdditionalNotes(e.target.value)}
                  className="min-h-[100px] bg-white/5 border-white/10 rounded-xl"
                />
              </CardContent>
              <CardFooter className="p-8 pt-0 bg-transparent flex justify-end gap-4 mt-4">
                <Button variant="ghost" type="button" asChild disabled={saving} className="h-14 px-10 rounded-2xl font-black text-gray-500 hover:text-white uppercase tracking-widest text-xs">
                  <Link href={`/client/batches/${id}`}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={saving} size="lg" className="h-14 px-12 rounded-2xl font-black bg-primary hover:bg-primary/90 shadow-2xl transition-all uppercase tracking-widest text-xs">
                  {saving ? "Guardando..." : <><Save className="mr-2 h-5 w-5" /> Guardar Cambios</>}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
