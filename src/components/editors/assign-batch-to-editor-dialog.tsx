"use client";

import { useState, useEffect } from 'react';
import { batchService } from '@/services/batch.service';
import { Batch, UserProfile } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Building2, Layers } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface AssignBatchToEditorDialogProps {
  editor: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function AssignBatchToEditorDialog({ editor, open, onOpenChange, onUpdated }: AssignBatchToEditorDialogProps) {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setLoading(true);
      batchService.getAllBatches().then(data => {
        // Mostrar solo tandas que no estén aprobadas y donde el editor no esté ya asignado
        const available = data.filter(b => 
          b.status !== 'approved' && 
          !(b.assignedEditorUids || []).includes(editor.uid)
        );
        setBatches(available);
        setLoading(false);
      });
    }
  }, [open, editor.uid]);

  const handleAssign = async (batch: Batch) => {
    if (!profile) return;
    setSubmittingId(batch.id);
    try {
      const currentEditors = batch.assignedEditorUids || [];
      const newEditors = [...currentEditors, editor.uid];
      
      await batchService.assignEditors(batch.id, newEditors, profile.uid, profile.displayName);
      
      toast({ 
        title: "Tanda asignada", 
        description: `Se ha asignado a ${editor.displayName} a la tanda "${batch.title}".` 
      });
      
      onUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error al asignar", variant: "destructive" });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" /> Asignar Tanda a {editor.displayName}
            </DialogTitle>
            <DialogDescription>Selecciona una tanda activa para este editor.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : batches.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12 border-2 border-dashed rounded-xl">No hay tandas activas disponibles para asignar.</p>
              ) : batches.map((batch) => (
                <div key={batch.id} className="p-4 border rounded-xl hover:bg-slate-50 transition-colors group flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm leading-none">{batch.title}</h4>
                      <p className="text-[10px] text-primary font-bold mt-1 uppercase flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {batch.productName}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{batch.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      <Layers className="h-3 w-3" /> {batch.creativeCount} piezas totales
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleAssign(batch)} 
                      disabled={submittingId === batch.id}
                      className="h-8 text-xs px-4"
                    >
                      {submittingId === batch.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <PlusCircle className="h-3 w-3 mr-2" />}
                      Asignar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">Cancelar</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
