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
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-[90dvh] md:h-[600px]">
          {/* Calendario Lateral */}
          <div className="w-full md:w-80 bg-slate-50 border-r p-6 flex flex-col">
            <DialogHeader className="w-full mb-6 text-left">
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" /> Historial de Producción
              </DialogTitle>
              <DialogDescription>Consolidado de entregas diarias.</DialogDescription>
            </DialogHeader>
            
            <div className="bg-white rounded-xl shadow-sm border p-2 flex justify-center overflow-hidden">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={es}
                modifiers={modifiers}
                className="rounded-md border-none"
                classNames={{
                  months: "flex flex-col space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative flex-1 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 w-full hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center cursor-pointer",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                  day_today: "bg-accent text-accent-foreground rounded-full",
                  day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
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
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
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
                    <Card key={batch.id} className="overflow-hidden group hover:border-primary/50 transition-colors shadow-sm">
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
                          <Badge variant="secondary" className="font-black bg-primary/10 text-primary border-none">
                            {batch.creativeCount} Pz
                          </Badge>
                        </div>
                        <div className="pt-3 border-t mt-3">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1.5 flex items-center gap-1">
                            <User className="h-3 w-3" /> Editores Responsables:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(batch.assignedEditorUids || []).length > 0 ? (
                              batch.assignedEditorUids.map((uid) => (
                                <Badge key={uid} variant="outline" className="text-[10px] font-bold py-0 h-5 border-slate-200 text-slate-700">
                                  {editorsMap[uid] || 'Editor desconocido'}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-[10px] italic text-slate-400">Sin datos de editor registrados</span>
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
