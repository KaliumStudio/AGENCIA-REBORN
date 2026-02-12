"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { batchService } from '@/services/batch.service';
import { UserProfile, Batch } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

interface AssignEditorsDialogProps {
  batch: Batch;
  onUpdate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignEditorsDialog({ batch, onUpdate, open, onOpenChange }: AssignEditorsDialogProps) {
  const [editors, setEditors] = useState<UserProfile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      userService.getEditors().then(setEditors);
      setSelectedIds(batch.assignedEditorUids || []);
    }
  }, [open, batch]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await batchService.assignEditors(batch.id, selectedIds);
      toast({ title: "Editores asignados correctamente" });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error al asignar editores", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleEditor = (uid: string) => {
    setSelectedIds(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Asignar Editores
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona los editores para trabajar en: <span className="font-bold text-foreground">{batch.title}</span>
          </p>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {editors.map((editor) => (
              <div key={editor.uid} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg transition-colors border">
                <Checkbox 
                  id={`editor-${editor.uid}`}
                  checked={selectedIds.includes(editor.uid)}
                  onCheckedChange={() => toggleEditor(editor.uid)}
                />
                <Label htmlFor={`editor-${editor.uid}`} className="flex-1 cursor-pointer font-medium text-sm">
                  {editor.displayName}
                </Label>
              </div>
            ))}
            {editors.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No hay editores activos disponibles.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Asignación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
