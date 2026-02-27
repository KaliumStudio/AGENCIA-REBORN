
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { clientService } from '@/services/client.service';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageSquare, FolderKanban, Building2, Layers } from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EditorBatchesPage() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [clients, setClients] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      const loadData = async () => {
        try {
          const [batchesData, clientsData] = await Promise.all([
            batchService.getBatchesByEditor(profile.uid),
            clientService.getAllClients()
          ]);
          
          const clientMap: Record<string, string> = {};
          clientsData.forEach(c => { clientMap[c.id] = c.name; });
          
          setClients(clientMap);
          setBatches(batchesData);
        } catch (error) {
          console.error("Error loading editor batches:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [profile]);

  const formatDate = (date: any) => {
    if (!date) return 'Pendiente';
    const d = date.toDate ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, 'dd MMM', { locale: es }) : 'Inválida';
  };

  return (
    <RoleGuard allowedRoles={['editor']}>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mis Tandas Asignadas</h1>
          <p className="text-muted-foreground">Proyectos creativos en los que estás trabajando.</p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">No tienes tandas asignadas</h3>
            <p className="text-muted-foreground">El administrador te notificará cuando haya nuevo trabajo disponible.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <Card key={batch.id} className="hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
                <CardHeader className="pb-3 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <StatusBadge status={batch.status} />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      {formatDate(batch.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{batch.title}</CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold mt-1">
                    <Building2 className="h-3 w-3" /> {clients[batch.clientId] || 'Cliente'}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    Producto: <span className="font-semibold text-foreground">{batch.productName}</span>
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">
                    <Layers className="h-3 w-3" />
                    {batch.creativeCount} Creativos
                  </div>
                </CardContent>
                <CardFooter className="mt-auto pt-4 flex gap-2 border-t bg-slate-50/30">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/editor/batches/${batch.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> Ver Brief
                    </Link>
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1" asChild>
                    <Link href={`/editor/batches/${batch.id}/chat`}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Chat
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
