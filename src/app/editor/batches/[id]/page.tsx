"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { chatService } from '@/services/chat.service';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, ExternalLink, MessageSquare, Info } from 'lucide-react';
import Link from 'next/link';

export default function EditorBatchDetailPage() {
  const { id } = useParams();
  const { profile, loading: authLoading } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      batchService.getBatch(id as string).then(data => {
        setBatch(data);
        if (data?.driveLink) setDriveLink(data.driveLink);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  const handleDeliver = async () => {
    if (!driveLink.trim().startsWith('https://')) {
      toast({ 
        title: "Link inválido", 
        description: "Debes ingresar una URL válida de Google Drive.", 
        variant: "destructive" 
      });
      return;
    }

    if (!batch || !profile) return;

    setSubmitting(true);
    try {
      await batchService.submitDelivery(batch.id, driveLink, profile.uid);
      
      // Notify via chat
      const chatId = await chatService.getOrCreateChat(batch.id, batch.clientId, batch.assignedEditorUids);
      await chatService.sendMessage(
        chatId, 
        profile.uid, 
        profile.role, 
        'drive_link', 
        `Nueva entrega realizada. Link: ${driveLink}`
      );
      
      toast({ title: "Tanda entregada", description: "El cliente ha sido notificado automáticamente." });
      setBatch(prev => prev ? { ...prev, driveLink, status: 'delivered' } : null);
    } catch (error) {
      toast({ title: "Error en la entrega", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) return <DashboardLayout>Cargando...</DashboardLayout>;
  if (!batch) return <DashboardLayout>No se encontró la tanda.</DashboardLayout>;

  return (
    <RoleGuard allowedRoles={['editor']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/editor/batches"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{batch.title}</h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-muted-foreground mt-1">Límite: {batch.dueDate || 'No definida'}</p>
          </div>
          <Button variant="secondary" asChild>
            <Link href={`/editor/batches/${batch.id}/chat`}>
              <MessageSquare className="mr-2 h-4 w-4" /> Ir al Chat
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones (Brief)</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap leading-relaxed text-slate-700">
                {batch.brief}
              </CardContent>
            </Card>

            <Card className="border-primary shadow-md">
              <CardHeader>
                <CardTitle>Gestión de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="drive">Link de Carpeta Google Drive</Label>
                  <Input 
                    id="drive" 
                    placeholder="https://drive.google.com/drive/folders/..." 
                    value={driveLink} 
                    onChange={e => setDriveLink(e.target.value)}
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 bg-blue-50 p-2 rounded">
                    <Info className="h-3 w-3 text-blue-500" />
                    Asegúrate de que el acceso esté compartido para que el cliente pueda verlo.
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" onClick={handleDeliver} disabled={submitting}>
                  <Send className="mr-2 h-4 w-4" /> 
                  {submitting ? "Procesando..." : "Enviar Entrega y Notificar"}
                </Button>
                {batch.driveLink && (
                  <div className="w-full p-3 bg-muted/50 rounded-lg text-sm flex justify-between items-center border">
                    <span className="truncate max-w-[200px] font-mono text-xs">{batch.driveLink}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={batch.driveLink} target="_blank" rel="noopener noreferrer">
                        Ver Carpeta <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Fecha de Creación</p>
                  <p className="text-sm">
                    {batch.createdAt?.toDate ? batch.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Última Entrega</p>
                  <p className="text-sm">
                    {batch.deliveredAt?.toDate ? batch.deliveredAt.toDate().toLocaleString() : 'Pendiente'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
