"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { batchService } from '@/services/batch.service';
import { Batch } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EditorBatchesPage() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      batchService.getBatchesByEditor(profile.uid).then(data => {
        setBatches(data);
        setLoading(false);
      });
    }
  }, [profile]);

  return (
    <RoleGuard allowedRoles={['editor']}>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mis Tandas Asignadas</h1>
          <p className="text-muted-foreground">Proyectos creativos en los que estás trabajando.</p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
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
              <Card key={batch.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <StatusBadge status={batch.status} />
                    <span className="text-xs text-muted-foreground">
                      Entrega: {format(new Date(batch.dueDate), 'dd MMM', { locale: es })}
                    </span>
                  </div>
                  <CardTitle className="text-xl mt-3 line-clamp-1">{batch.title}</CardTitle>
                  <CardDescription className="line-clamp-3 mt-1 min-h-[4.5rem]">
                    {batch.brief}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto pt-4 flex gap-2">
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

import { FolderKanban } from 'lucide-react';