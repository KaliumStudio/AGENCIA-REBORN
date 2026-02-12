"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { batchService } from '@/services/batch.service';
import { summarizeBrief } from '@/ai/flows/brief-summarization-flow';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageSquare, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ClientBatchDetailPage() {
  const { id } = useParams();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (id) {
      batchService.getBatch(id as string).then(setBatch);
    }
  }, [id]);

  const handleSummarize = async () => {
    if (!batch?.brief) return;
    setSummarizing(true);
    try {
      const result = await summarizeBrief({ brief: batch.brief });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setSummarizing(false);
    }
  };

  const formatDate = (date: any, formatStr: string) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, formatStr, { locale: es }) : 'N/A';
  };

  if (!batch) return null;

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/client/batches"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{batch.title}</h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              Creado el {formatDate(batch.createdAt, "PPP")}
            </p>
          </div>
          <Button asChild>
            <Link href={`/client/batches/${batch.id}/chat`}>
              <MessageSquare className="mr-2 h-4 w-4" /> Ir al Chat
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Brief del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {batch.brief}
              </CardContent>
            </Card>

            {batch.driveLink && (
              <Card className="border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    ¡Entrega Disponible!
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between bg-white m-4 rounded-lg border p-4">
                  <div>
                    <p className="font-semibold">Carpeta de Google Drive</p>
                    <p className="text-sm text-muted-foreground truncate max-w-md">{batch.driveLink}</p>
                  </div>
                  <Button asChild>
                    <a href={batch.driveLink} target="_blank" rel="noopener noreferrer">
                      Abrir Drive <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Resumen IA</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleSummarize} disabled={summarizing}>
                  <Sparkles className={cn("h-4 w-4", summarizing && "animate-spin")} />
                </Button>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <p className="text-sm italic text-muted-foreground leading-relaxed">"{summary}"</p>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">Genera un resumen rápido de los puntos clave.</p>
                    <Button variant="secondary" size="sm" onClick={handleSummarize} disabled={summarizing}>
                      {summarizing ? "Procesando..." : "Resumir Brief"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Fecha de Entrega</p>
                  <p className="font-medium text-lg">{formatDate(batch.dueDate, "PPP")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Editores Asignados</p>
                  <p className="font-medium">{batch.assignedEditorUids.length > 0 ? `${batch.assignedEditorUids.length} Editor(es)` : 'Pendiente de asignación'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
