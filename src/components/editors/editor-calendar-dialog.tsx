
"use client";

import { useState, useEffect } from 'react';
import { batchService } from '@/services/batch.service';
import { Batch } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Layers, CheckCircle2, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EditorCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditorCalendarDialog({ open, onOpenChange }: EditorCalendarDialogProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (open) {
      setLoading(true);
      batchService.getAllBatches().then(data => {
        // Filtrar tandas que tengan fecha de entrega real
        setBatches(data.filter(b => b.deliveredAt));
        setLoading(false);
      });
    }
  }, [open]);

  // Obtener tandas del día seleccionado
  const dayBatches = batches.filter(b => {
    if (!selectedDate || !b.deliveredAt) return false;
    const date = b.deliveredAt.toDate ? b.deliveredAt.toDate() : new Date(b.deliveredAt);
    return isSameDay(date, selectedDate);
  });

  // Calcular total de creativos del día
  const dailyTotal = dayBatches.reduce((acc, b) => acc + (b.creativeCount || 0), 0);

  // Función para destacar días con producción en el calendario
  const modifiers = {
    hasProduction: (date: Date) => batches.some(b => {
      const d = b.deliveredAt.toDate ? b.deliveredAt.toDate() : new Date(b.deliveredAt);
      return isSameDay(d, date);
    })
  };

  const modifiersStyles = {
    hasProduction: {
      fontWeight: 'bold',
      color: 'hsl(var(--primary))',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      borderRadius: '50%'
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-[90dvh] md:h-[600px]">
          {/* Calendario Lateral */}
          <div className="w-full md:w-80 bg-slate-50 border-r p-6 flex flex-col items-center">
            <DialogHeader className="w-full mb-6 text-left">
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" /> Historial de Producción
              </DialogTitle>
              <DialogDescription>Consolidado de entregas diarias.</DialogDescription>
            </DialogHeader>
            
            <div className="bg-white rounded-xl shadow-sm border p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={es}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border-none"
              />
            </div>

            <div className="mt-6 w-full space-y-4">
              <Card className="bg-primary text-white shadow-md border-none">
                <CardContent className="p-4 text-center">
                  <p className="text-[10px] uppercase font-bold opacity-80">Producción del Día</p>
                  <p className="text-3xl font-black">{dailyTotal}</p>
                  <p className="text-[10px] uppercase font-bold opacity-80">Creativos Entregados</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Listado de Entregas */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-6 border-b bg-white sticky top-0 z-10">
              <h3 className="font-bold text-lg">
                {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : 'Selecciona un día'}
              </h3>
              <p className="text-xs text-muted-foreground">Listado de tandas finalizadas en esta fecha.</p>
            </div>

            <ScrollArea className="flex-1 p-6">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : dayBatches.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <Layers className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm font-medium">No se registraron entregas este día.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dayBatches.map((batch) => (
                    <Card key={batch.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-1.5 rounded-full">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{batch.title}</h4>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold uppercase">
                                <Building2 className="h-3 w-3" /> {batch.productName}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="font-black">
                            {batch.creativeCount} Pz
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-2 border-t mt-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mr-2">Editores:</p>
                          {(batch.assignedEditorUids || []).length > 0 ? (
                            <span className="text-[10px] font-medium text-slate-600">
                              {batch.assignedEditorUids.length} profesionales asignados
                            </span>
                          ) : (
                            <span className="text-[10px] italic text-slate-400">Sin datos de editor</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
