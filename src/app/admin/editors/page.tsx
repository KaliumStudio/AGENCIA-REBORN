
"use client";

import { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Edit, Scissors, Calendar, CreditCard, Layers, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditEditorDialog } from '@/components/editors/edit-editor-dialog';
import { AssignBatchToEditorDialog } from '@/components/editors/assign-batch-to-editor-dialog';
import { EditorCalendarDialog } from '@/components/editors/editor-calendar-dialog';

export default function AdminEditorsPage() {
  const [editors, setEditors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEditor, setEditingEditor] = useState<UserProfile | null>(null);
  const [assigningToEditor, setAssigningToEditor] = useState<UserProfile | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const fetchEditors = async () => {
    setLoading(true);
    const allUsers = await userService.getAllUsers();
    setEditors(allUsers.filter(u => u.role === 'editor' && u.active));
    setLoading(false);
  };

  useEffect(() => { fetchEditors(); }, []);

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestión de Editores</h1>
            <p className="text-sm md:text-base text-muted-foreground">Administra las capacidades y monitorea la producción de tu equipo.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => setIsCalendarOpen(true)} className="h-11 px-6 border-primary text-primary hover:bg-primary/5 font-bold">
              <Calendar className="mr-2 h-4 w-4" /> Ver Calendario de Editores
            </Button>
            <Button variant="outline" size="icon" onClick={fetchEditors} disabled={loading} className="h-11 w-11">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Editor</TableHead>
                <TableHead>Capacidad / Día</TableHead>
                <TableHead>Formatos</TableHead>
                <TableHead>Contrato / Pago</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead className="text-right">Gestión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : editors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">No hay editores activos registrados.</TableCell>
                </TableRow>
              ) : editors.map((editor) => (
                <TableRow key={editor.uid}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{editor.displayName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{editor.uid}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                      <Layers className="h-4 w-4" /> {editor.editorDetails?.dailyCapacity || '0'} pz/día
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {editor.editorDetails?.specializedFormats?.map(f => (
                        <Badge key={f} variant="outline" className="text-[10px] bg-slate-50">{f}</Badge>
                      )) || <span className="text-xs text-muted-foreground italic">No definido</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold uppercase text-slate-600">{editor.editorDetails?.paymentContract || 'S/D'}</div>
                    <div className="text-xs text-green-600 font-bold">${editor.editorDetails?.payPerCreative || 0} / pz</div>
                  </TableCell>
                  <TableCell>
                    <Badge className="capitalize bg-accent/10 text-accent border-accent/20">{editor.editorDetails?.paymentPeriod || 'No definido'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setAssigningToEditor(editor)} className="bg-primary/5 border-primary/20 text-primary">
                        <PlusCircle className="h-4 w-4 mr-2" /> Asignarle Tanda
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingEditor(editor)}>
                        <Edit className="h-4 w-4 mr-2" /> Perfil
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden space-y-4">
          {editors.map((editor) => (
            <Card key={editor.uid} className="shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="font-bold">{editor.displayName}</div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setAssigningToEditor(editor)} className="text-primary"><PlusCircle className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingEditor(editor)}><Edit className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground font-bold uppercase mb-1">Capacidad</p>
                    <p className="font-bold text-primary">{editor.editorDetails?.dailyCapacity || 0} piezas/día</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-bold uppercase mb-1">Pago</p>
                    <p className="font-bold text-green-600">${editor.editorDetails?.payPerCreative || 0} pz</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingEditor && (
          <EditEditorDialog 
            editor={editingEditor} 
            open={!!editingEditor} 
            onOpenChange={(o) => !o && setEditingEditor(null)} 
            onUpdated={fetchEditors} 
          />
        )}

        {assigningToEditor && (
          <AssignBatchToEditorDialog
            editor={assigningToEditor}
            open={!!assigningToEditor}
            onOpenChange={(o) => !o && setAssigningToEditor(null)}
            onUpdated={fetchEditors}
          />
        )}

        {isCalendarOpen && (
          <EditorCalendarDialog
            open={isCalendarOpen}
            onOpenChange={setIsCalendarOpen}
          />
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
