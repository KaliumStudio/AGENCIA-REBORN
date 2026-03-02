
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
import { ArrowLeft, Save, Plus, Trash2, Video, Loader2, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { VideoSpecification, Batch } from '@/types';

export default function AdminEditBatchPage() {
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
  }, [id]);

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
        description: "Completa el producto, referencias y landing page.", 
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
      }, profile.uid, `${profile.displayName} (Admin)`);
      
      toast({ title: "Tanda actualizada", description: "Los cambios administrativos se han guardado." });
      router.push(`/admin/batches/${id}`);
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
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pb-12">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/batches/${id}`}><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Tanda (Admin)</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <ShieldCheck className="h-3 w-3 text-primary" /> Los cambios se registrarán en el historial.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Nombre del Producto</Label>
                    <Input 
                      id="productName" 
                      value={productName} 
                      onChange={e => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landingPage">Link de Landing Page</Label>
                  <Input 
                    id="landingPage" 
                    value={landingPage} 
                    onChange={e => setLandingPage(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceLinks">Referencias</Label>
                  <Textarea 
                    id="referenceLinks" 
                    value={referenceLinks} 
                    onChange={e => setReferenceLinks(e.target.value)}
                    required
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Horario Límite</Label>
                  <Select value={deliveryDeadlineTime} onValueChange={setDeliveryDeadlineTime}>
                    <SelectTrigger id="deliveryTime">
                      <SelectValue />
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
                  <Video className="h-5 w-5 text-primary" /> Creativos
                </h2>
                <Badge variant="secondary">Total: {videoSpecs.length}</Badge>
              </div>

              {videoSpecs.map((spec, index) => (
                <Card key={index} className="relative overflow-hidden border-l-4 border-l-accent">
                  <CardHeader className="py-4 flex flex-row items-center justify-between bg-slate-50/50">
                    <CardTitle className="text-base flex items-center gap-2">
                      {spec.format === 'IMAGEN' ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      Item #{index + 1}
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
                        <Label>Guion / Detalles</Label>
                        <Textarea 
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
                          <Label>Nota</Label>
                          <Input 
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
                className="w-full border-dashed border-2 py-8"
                onClick={addVideoSpec}
              >
                <Plus className="h-6 w-6 mr-2" /> Añadir Creativo
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Label htmlFor="additionalNotes">Notas Finales</Label>
                <Textarea 
                  id="additionalNotes" 
                  value={additionalNotes} 
                  onChange={e => setAdditionalNotes(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t bg-slate-50 p-6">
                <Button variant="outline" type="button" asChild disabled={saving}>
                  <Link href={`/admin/batches/${id}`}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={saving} size="lg">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar Cambios Administrativos
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
