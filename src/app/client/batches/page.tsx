
"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Plus, Eye, MessageSquare, FolderKanban, Loader2, Edit, Layers, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ClientBatchesPage() {
  const { profile, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (profile?.clientId && !fetched.current) {
      fetched.current = true;
      batchService.getBatchesByClient(profile.clientId).then(data => {
        setBatches(data);
        setLoading(false);
      }).catch((err) => {
        console.error("Error fetching client batches:", err);
        setLoading(false);
      });
    } else if (!authLoading && !profile?.clientId) {
      setLoading(false);
    }
  }, [profile, authLoading]);

  const formatDate = (date: any) => {
    if (!date) return 'Pendiente';
    const d = date.toDate ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, 'dd MMM', { locale: es }) : 'Pendiente';
  };

  if (authLoading) return null;

  return (
    <RoleGuard allowedRoles={['client']}>
      <DashboardLayout>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Tandas</h1>
            <p className="text-muted-foreground">Gestiona y revisa tus solicitudes de producción.</p>
          </div>
          <Button asChild>
            <Link href="/client/batches/new">
              <Plus className="mr-2 h-4 w-4" /> Nueva Tanda
            </Link>
          </Button>
        </div>

        <Alert className="mb-8 border-l-4 border-l-amber-500 bg-amber-50 shadow-sm">
          <CalendarClock className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-bold text-amber-900 mb-1">Planificación de Fin de Semana</AlertTitle>
          <AlertDescription className="text-amber-800 text-sm leading-relaxed">
            Recuerda que los <strong>sábados y domingos no se producen creativos</strong>. Te sugerimos realizar tus pedidos con antelación durante la semana para stockearte y contar con material suficiente para el fin de semana.
          </AlertDescription>
        </Alert>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">No tienes tandas todavía</h3>
            <p className="text-muted-foreground mb-6">Comienza creando tu primera solicitud.</p>
            <Button asChild>
              <Link href="/client/batches/new">Crear Tanda</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <Card key={batch.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <StatusBadge status={batch.status} />
                    <span className="text-xs text-muted-foreground">
                      Vence: {formatDate(batch.dueDate)}
                    </span>
                  </div>
                  <CardTitle className="text-xl mt-3 line-clamp-1">{batch.title}</CardTitle>
                  <CardDescription className="mt-1">
                    <span className="font-bold text-slate-900 block truncate">{batch.productName}</span>
                    <span className="flex items-center gap-1 text-primary font-semibold text-xs mt-1 bg-primary/5 w-fit px-2 py-0.5 rounded">
                      <Layers className="h-3 w-3" /> {batch.creativeCount} Creativos
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto pt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 px-0" asChild title="Ver detalles">
                    <Link href={`/client/batches/${batch.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {batch.status !== 'approved' && (
                    <Button variant="outline" size="sm" className="flex-1 px-0" asChild title="Editar">
                      <Link href={`/client/batches/${batch.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" className="flex-1 px-0" asChild title="Chat">
                    <Link href={`/client/batches/${batch.id}/chat`}>
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
