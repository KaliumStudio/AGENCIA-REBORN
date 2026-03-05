
"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { UserProfile, EditorDetails } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Scissors, Layers, CreditCard, Calendar } from 'lucide-react';

interface EditEditorDialogProps {
  editor: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

const FORMATS = ["UGC IA", "CINEMATICO", "POV", "PODCAST", "IMAGEN", "TRADUCCIÓN SIMPLE", "UGC IA + CINEMATICO"];
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function EditEditorDialog({ editor, open, onOpenChange, onUpdated }: EditEditorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<EditorDetails>>({
    dailyCapacity: 0,
    workingDays: [],
    specializedFormats: [],
    payPerCreative: 0,
    paymentContract: 'pago por creativos acumulados',
    paymentPeriod: 'quincenal'
  });

  const { toast } = useToast();

  useEffect(() => {
    if (open && editor.editorDetails) {
      setFormData(editor.editorDetails);
    }
  }, [open, editor]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.updateProfile(editor.uid, {
        editorDetails: formData as EditorDetails
      });
      toast({ title: "Perfil de editor actualizado" });
      onUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error al actualizar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (list: string[], item: string, field: keyof EditorDetails) => {
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setFormData({ ...formData, [field]: newList });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[90dvh]">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" /> Perfil Técnico: {editor.displayName}
            </DialogTitle>
            <DialogDescription>Configura las métricas de producción y condiciones de pago.</DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Producción */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="h-4 w-4" /> Capacidad y Formatos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Creativos por Día</Label>
                  <Input 
                    type="number" 
                    className="h-11" 
                    value={formData.dailyCapacity} 
                    onChange={e => setFormData({...formData, dailyCapacity: parseInt(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Formatos que domina</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {FORMATS.map(f => (
                      <div key={f} className="flex items-center space-x-2 bg-slate-100 px-2 py-1.5 rounded-lg border">
                        <Checkbox 
                          id={`f-${f}`} 
                          checked={formData.specializedFormats?.includes(f)}
                          onCheckedChange={() => toggleItem(formData.specializedFormats || [], f, 'specializedFormats')}
                        />
                        <label htmlFor={`f-${f}`} className="text-xs font-medium cursor-pointer">{f}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Disponibilidad Semanal
              </h3>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <Button 
                    key={day}
                    type="button"
                    variant={formData.workingDays?.includes(day) ? "default" : "outline"}
                    size="sm"
                    className="h-9 text-[10px] md:text-xs"
                    onClick={() => toggleItem(formData.workingDays || [], day, 'workingDays')}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            {/* Pagos */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Condiciones de Pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Valor por Creativo ($)</Label>
                  <Input 
                    type="number" 
                    className="h-11 font-bold text-green-600" 
                    value={formData.payPerCreative} 
                    onChange={e => setFormData({...formData, payPerCreative: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contrato de Pago</Label>
                  <Select value={formData.paymentContract} onValueChange={(v: any) => setFormData({...formData, paymentContract: v})}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pago fijo">Pago Fijo</SelectItem>
                      <SelectItem value="pago por creativos acumulados">Pago por acumulados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Periodo de Pago</Label>
                  <Select value={formData.paymentPeriod} onValueChange={(v: any) => setFormData({...formData, paymentPeriod: v})}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quincenal">Quincenal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 pt-6 border-t gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11 md:h-10">Cancelar</Button>
            <Button onClick={handleSave} disabled={loading} className="h-11 md:h-10 px-8">
              {loading ? "Guardando..." : "Guardar Perfil"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
