"use client";

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewBatchPage() {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.clientId) return;

    setLoading(true);
    try {
      await batchService.createBatch({
        clientId: profile.clientId,
        title,
        brief,
        dueDate,
        assignedEditorUids: [],
        createdBy: profile.uid,
      });
      toast({ title: "Tanda creada", description: "El administrador la asignará pronto." });
      router.push('/client/batches');
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear la tanda.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/client/batches"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Solicitud</h1>
          </div>

          <Card className="shadow-lg">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Detalles de la Tanda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Proyecto</Label>
                  <Input 
                    id="title" 
                    placeholder="Ej: Campaña Verano 2024 - Pack 10 Videos" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brief">Brief / Instrucciones Detalladas</Label>
                  <Textarea 
                    id="brief" 
                    className="min-h-[200px]"
                    placeholder="Describe los requisitos, referencias y objetivos..." 
                    value={brief} 
                    onChange={e => setBrief(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha de Entrega Deseada</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-6">
                <Button variant="outline" type="button" asChild disabled={loading}>
                  <Link href="/client/batches">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creando..." : <><Save className="mr-2 h-4 w-4" /> Crear Tanda</>}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}