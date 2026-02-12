"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { chatService } from '@/services/chat.service';
import { generateCreativeConcepts } from '@/ai/flows/ai-creative-concept-generation';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Sparkles, ExternalLink, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function EditorBatchDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [concepts, setConcepts] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      batchService.getBatch(id as string).then(setBatch);
    }
  }, [id]);

  const handleDeliver = async () => {
    if (!driveLink.includes('drive.google.com')) {
      toast({ title: "Link inválido", description: "Debes ingresar un link de Google Drive.", variant: "destructive" });
      return;
    }

    try {
      await batchService.updateDriveLink(batch!.id, driveLink);
      // Trigger chat notification
      const chatId = await chatService.getOrCreateChat(batch!.id, batch!.clientId, batch!.assignedEditorUids);
      await chatService.sendMessage(chatId, profile!.uid, profile!.role, 'drive_link', `He entregado los creativos. Link: ${driveLink}`);
      
      toast({ title: "Tanda entregada", description: "El cliente ha sido notificado." });
      setBatch(prev => prev ? { ...prev, driveLink, status: 'delivered' } : null);
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const getConcepts = async () => {
    setLoadingAI(true);
    try {
      const result = await generateCreativeConcepts({ brief: batch!.brief, references: "Sin referencias adicionales." });
      setConcepts(result.concepts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  if (!batch) return null;

  return (
    <RoleGuard allowedRoles={['editor']}>
      <DashboardLayout>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/editor/batches"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{batch.title}</h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-muted-foreground mt-1">Fecha de entrega: {batch.dueDate}</p>
          </div>
          <Button variant="secondary" asChild>
            <Link href={`/editor/batches/${batch.id}/chat`}>Ir al Chat</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Requisitos del Brief</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap leading-relaxed">
                {batch.brief}
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Entrega de Resultados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="drive">Link de Carpeta Google Drive</Label>
                  <Input 
                    id="drive" 
                    placeholder="https://drive.google.com/..." 
                    value={driveLink} 
                    onChange={e => setDriveLink(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Asegúrate de que el acceso esté compartido con el cliente.</p>
                </div>
                <Button className="w-full" onClick={handleDeliver}>
                  <Send className="mr-2 h-4 w-4" /> Entregar y Notificar Cliente
                </Button>
              </CardContent>
              {batch.driveLink && (
                <CardFooter className="bg-muted/30 pt-4 text-sm flex justify-between">
                  <span>Entrega actual: {batch.driveLink}</span>
                  <a href={batch.driveLink} target="_blank" className="text-primary hover:underline flex items-center">
                    Ver <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </CardFooter>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" /> Ideas Creativas IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {concepts.length > 0 ? (
                  <ul className="space-y-3">
                    {concepts.map((c, i) => (
                      <li key={i} className="text-sm bg-white p-3 rounded-lg border shadow-sm border-accent/10">
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <Sparkles className="h-10 w-10 text-accent/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">¿Bloqueado? Genera conceptos basados en el brief.</p>
                    <Button variant="accent" size="sm" onClick={getConcepts} disabled={loadingAI}>
                      {loadingAI ? "Ideando..." : "Generar Inspiración"}
                    </Button>
                  </div>
                )}
              </CardContent>
              {concepts.length > 0 && (
                 <CardFooter className="pt-0">
                    <Button variant="ghost" size="xs" onClick={getConcepts} className="mx-auto text-xs opacity-50">
                      Recargar Ideas
                    </Button>
                 </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}