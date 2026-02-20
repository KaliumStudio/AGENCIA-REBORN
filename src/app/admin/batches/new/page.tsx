
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { userService } from '@/services/user.service';
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
import { ArrowLeft, Save, Plus, Trash2, Video, Image as ImageIcon, Loader2, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { VideoSpecification, Client, UserProfile } from '@/types';

export default function AdminNewBatchPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientUsers, setClientUsers] = useState<UserProfile[]>([]);
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedUserUid, setSelectedUserUid] = useState('');
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [landingPage, setLandingPage] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [deliveryDeadlineTime, setDeliveryDeadlineTime] = useState('19:00');
  const [videoSpecs, setVideoSpecs] = useState<VideoSpecification[]>([{ format: 'UGC IA' }]);
  
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    clientService.getAllClients().then(data => {
      setClients(data.filter(c => c.active));
      setLoadingClients(false);
    });
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      setLoadingUsers(true);
      userService.getUsersByClient(selectedClientId).then(users => {
        setClientUsers(users);
        if (users.length > 0) setSelectedUserUid(users[0].uid);
        else setSelectedUserUid('');
        setLoadingUsers(false);
      });
    } else {
      setClientUsers([]);
      setSelectedUserUid('');
    }
  }, [selectedClientId]);

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
    if (!profile?.uid) return;

    if (!selectedClientId || !selectedUserUid || !productName || !referenceLinks || !landingPage) {
      toast({ 
        title: "Campos obligatorios", 
        description: "Completa el cliente, usuario responsable, producto, referencias y landing page.", 
        variant: "destructive" 
      });
      return;
    }

    setSubmitting(true);
    try {
      await batchService.createBatch({
        clientId: selectedClientId,
        clientUserUid: selectedUserUid,
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
        brief: `Producto: ${productName}. Landing: ${landingPage}. Referencias: ${referenceLinks}`,
      });
      
      toast({ title: "Tanda creada", description: "La tanda ha sido registrada correctamente." });
      router.push('/admin/batches');
    } catch (error: any) {
      console.error("Create batch error:", error);
      toast({ title: "Error", description: "No se pudo crear la tanda.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const timeOptions = [
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pb-12">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/batches"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Tanda (Admin)</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Building2 className="h-5 w-5 text-primary" /> Asignación de Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Empresa / Cliente <span className="text-destructive">*</span></Label>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={loadingClients ? "Cargando clientes..." : "Seleccionar empresa"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Usuario Responsable <span className="text-destructive">*</span></Label>
                    <Select 
                      value={selectedUserUid} 
                      onValueChange={setSelectedUserUid}
                      disabled={!selectedClientId || loadingUsers}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={loadingUsers ? "Cargando usuarios..." : (clientUsers.length > 0 ? "Seleccionar usuario" : "No hay usuarios")} />
                      </SelectTrigger>
                      <SelectContent>
                        {clientUsers.map(u => (
                          <SelectItem key={u.uid} value={u.uid}>{u.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedClientId && clientUsers.length === 0 && !loadingUsers && (
                      <p className="text-[10px] text-destructive mt-1">Este cliente no tiene usuarios asociados.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Información del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Nombre del Producto <span className="text-destructive">*</span></Label>
                    <Input 
                      id="productName" 
                      placeholder="Ej: Auriculares Bluetooth" 
                      value={productName} 
                      onChange={e => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título de la Tanda</Label>
                    <Input 
                      id="title" 
                      placeholder="Ej: Lanzamiento Junio" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landingPage">Link de Landing Page <span className="text-destructive">*</span></Label>
                  <Input 
                    id="landingPage" 
                    placeholder="https://tienda.com/p/..." 
                    value={landingPage} 
                    onChange={e => setLandingPage(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceLinks">Referencias Visuales <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="referenceLinks" 
                    placeholder="Link de Drive, TikTok, Ads Library..." 
                    value={referenceLinks} 
                    onChange={e => setReferenceLinks(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Horario Límite de Entrega</Label>
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
                  <Video className="h-5 w-5 text-primary" /> Creativos Solicitados
                </h2>
                <Badge variant="secondary" className="px-3 py-1">
                  Total: {videoSpecs.length}
                </Badge>
              </div>

              {videoSpecs.map((spec, index) => (
                <Card key={index} className="relative overflow-hidden border-l-4 border-l-accent">
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
                        <Label>{spec.format === 'IMAGEN' ? 'Detalles de Imagen' : 'Guion / Script'}</Label>
                        <Textarea 
                          placeholder="..." 
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
                          <Label>Nota Opcional</Label>
                          <Input 
                            placeholder="Ej: Música animada" 
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
                <span>Añadir Creativo</span>
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Label htmlFor="additionalNotes">Instrucciones Finales</Label>
                <Textarea 
                  id="additionalNotes" 
                  placeholder="..." 
                  value={additionalNotes} 
                  onChange={e => setAdditionalNotes(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t bg-slate-50 p-6">
                <Button variant="outline" type="button" asChild disabled={submitting}>
                  <Link href="/admin/batches">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={submitting || !selectedUserUid} size="lg" className="px-8">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Crear Tanda</>}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
