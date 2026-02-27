
"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { batchService } from '@/services/batch.service';
import { UserProfile, Batch } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface AssignEditorsDialogProps {
  batch: Batch;
  onUpdate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignEditorsDialog({ batch, onUpdate, open, onOpenChange }: AssignEditorsDialogProps) {
  const { profile } = useAuth();
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
    if (!profile) return;
    setLoading(true);
    try {
      await batchService.assignEditors(batch.id, selectedIds, profile.uid, profile.displayName);
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
      <DialogContent className="sm:max-w-[425px] p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Asignar Editores
            </DialogTitle>
            <DialogDescription>Selecciona los profesionales que trabajarán en esta tanda.</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm text-muted-foreground font-medium px-1">
              Proyecto: <span className="text-foreground">{batch.title}</span>
            </p>
            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
              {editors.map((editor) => (
                <div key={editor.uid} className="flex items-center space-x-3 p-3 hover:bg-muted rounded-xl transition-colors border group">
                  <Checkbox 
                    id={`editor-${editor.uid}`}
                    checked={selectedIds.includes(editor.uid)}
                    onCheckedChange={() => toggleEditor(editor.uid)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`editor-${editor.uid}`} className="flex-1 cursor-pointer font-semibold text-sm py-1">
                    {editor.displayName}
                  </Label>
                </div>
              ))}
              {editors.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-xl">No hay editores activos disponibles.</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col md:flex-row gap-2 mt-8">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11 md:h-10 order-2 md:order-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={loading} className="h-11 md:h-10 order-1 md:order-2">
              {loading ? "Guardando..." : "Guardar Asignación"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
