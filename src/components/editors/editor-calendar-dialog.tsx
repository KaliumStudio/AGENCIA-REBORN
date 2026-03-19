
"use client";

import { useState, useEffect } from 'react';
import { batchService } from '@/services/batch.service';
import { userService } from '@/services/user.service';
import { Batch } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Layers, CheckCircle2, Building2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EditorCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditorCalendarDialog({ open, onOpenChange }: EditorCalendarDialogProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [editorsMap, setEditorsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        batchService.getAllBatches(),
        userService.getAllUsers()
      ]).then(([batchesData, usersData]) => {
        // Filtrar tandas que tengan fecha de entrega real
        setBatches(batchesData.filter(b => b.deliveredAt));
        
        // Crear mapa de nombres de editores
        const map: Record<string, string> = {};
        usersData.forEach(u => {
          map[u.uid] = u.displayName;
        });
        setEditorsMap(map);
        
        setLoading(false);
      }).catch(err => {
        console.error("Error cargando datos del calendario:", err);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 border-white/10 text-white">
        <div className="flex flex-col md:flex-row h-[90dvh] md:h-[600px]">
          {/* Calendario Lateral */}
          <div className="w-full md:w-80 bg-white/5 border-r border-white/10 p-6 flex flex-col">
            <DialogHeader className="w-full mb-6 text-left">
              <DialogTitle className="flex items-center gap-2 text-white">
                <CalendarIcon className="h-5 w-5 text-primary" /> Historial de Producción
              </DialogTitle>
              <DialogDescription className="text-gray-400">Consolidado de entregas diarias.</DialogDescription>
            </DialogHeader>
            
            <div className="bg-white/5 rounded-xl shadow-sm border border-white/10 p-2 flex justify-center overflow-hidden">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={es}
                modifiers={modifiers}
                className="rounded-md border-none text-white"
                classNames={{
                  months: "flex flex-col space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative flex-1 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-white/5 [&:has([aria-selected])]:bg-white/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 w-full hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer text-gray-300",
                  day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-full font-black",
                  day_today: "bg-white/10 text-white rounded-full",
                  day_outside: "day-outside text-gray-600 aria-selected:bg-white/5 aria-selected:text-gray-500",
                  day_disabled: "text-gray-700 opacity-50",
                  day_range_middle: "aria-selected:bg-white/5 aria-selected:text-white",
                  day_hidden: "invisible",
                }}
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
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-slate-950 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-white">
                {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : 'Selecciona un día'}
              </h3>
              <p className="text-xs text-gray-400">Listado de tandas finalizadas en esta fecha.</p>
            </div>

            <ScrollArea className="flex-1 p-6">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : dayBatches.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <Layers className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-400">No se registraron entregas este día.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dayBatches.map((batch) => (
                    <Card key={batch.id} className="overflow-hidden group border-white/10 hover:border-primary/50 transition-colors shadow-sm bg-white/[0.02]">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-500/10 p-1.5 rounded-full border border-green-500/20">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">{batch.title}</h4>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 font-bold uppercase">
                                <Building2 className="h-3 w-3" /> {batch.productName}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="font-black bg-primary/20 text-primary border-none">
                            {batch.creativeCount} Pz
                          </Badge>
                        </div>
                        <div className="pt-3 border-t border-white/5 mt-3">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 flex items-center gap-1">
                            <User className="h-3 w-3 text-primary" /> Editores Responsables:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(batch.assignedEditorUids || []).length > 0 ? (
                              batch.assignedEditorUids.map((uid) => (
                                <Badge key={uid} variant="outline" className="text-[10px] font-bold py-0 h-5 border-white/10 bg-white/10 text-white">
                                  {editorsMap[uid] || 'Editor desconocido'}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-[10px] italic text-gray-600">Sin datos de editor registrados</span>
                            )}
                          </div>
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
