
"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, Header, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { 
  Layout, Sparkles, Store, ArrowLeft, 
  Settings2, Zap, Monitor, Smartphone, 
  Plus, Trash2, Copy, Download, Code2,
  ChevronUp, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WIDGET_REGISTRY } from '@/lib/landing-builder/registry';
import { WidgetInstance, WidgetType } from '@/types/landing-builder';
import { exportToTiendaNube } from '@/lib/landing-builder/exporter';
import { useToast } from '@/hooks/use-toast';

export default function LandingGeneratorPage() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { toast } = useToast();

  // Cargar desde localStorage al inicio
  useEffect(() => {
    const saved = localStorage.getItem('am-builder-state');
    if (saved) {
      try { setWidgets(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Guardar en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('am-builder-state', JSON.stringify(widgets));
  }, [widgets]);

  const addWidget = (type: WidgetType) => {
    const def = WIDGET_REGISTRY.find(w => w.type === type);
    if (!def) return;

    const newWidget: WidgetInstance = {
      id: `w-${Date.now()}`,
      type,
      props: { ...def.defaultProps }
    };

    setWidgets([...widgets, newWidget]);
    setSelectedId(newWidget.id);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const idx = widgets.findIndex(w => w.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === widgets.length - 1) return;

    const newWidgets = [...widgets];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newWidgets[idx], newWidgets[targetIdx]] = [newWidgets[targetIdx], newWidgets[idx]];
    setWidgets(newWidgets);
  };

  const updateProps = (id: string, newProps: any) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, props: { ...w.props, ...newProps } } : w));
  };

  const selectedWidget = widgets.find(w => w.id === selectedId);

  const handleCopyCode = () => {
    const code = exportToTiendaNube(widgets);
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado", description: "Ya puedes pegarlo en el administrador de Tienda Nube." });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Barra superior del editor */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workspace"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Tienda Nube Landing Builder</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <Button 
              variant={viewMode === 'desktop' ? 'white' : 'ghost'} 
              size="sm" 
              className={cn("h-8 px-3", viewMode === 'desktop' && "shadow-sm bg-white")}
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="h-4 w-4 mr-2" /> Escritorio
            </Button>
            <Button 
              variant={viewMode === 'mobile' ? 'white' : 'ghost'} 
              size="sm" 
              className={cn("h-8 px-3", viewMode === 'mobile' && "shadow-sm bg-white")}
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="h-4 w-4 mr-2" /> Móvil
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setWidgets([]); setSelectedId(null); }}>
              Limpiar
            </Button>
            <Button onClick={() => setIsExportOpen(true)} className="bg-primary hover:bg-primary/90 shadow-md">
              <Code2 className="mr-2 h-4 w-4" /> Exportar Código
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Sidebar Izquierdo: Librería de Widgets */}
          <Card className="w-72 flex flex-col shadow-lg border-primary/5">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Librería de Componentes</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {WIDGET_REGISTRY.map((def) => (
                  <Button
                    key={def.type}
                    variant="outline"
                    className="w-full justify-start h-12 gap-3 hover:border-primary/50 transition-colors"
                    onClick={() => addWidget(def.type)}
                  >
                    <div className="bg-primary/10 p-1.5 rounded text-primary">
                      <def.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{def.label}</span>
                    <Plus className="h-3 w-3 ml-auto opacity-30" />
                  </Button>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="p-4">
                <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Capas (Orden)</CardTitle>
                <div className="space-y-2">
                  {widgets.length === 0 ? (
                    <p className="text-[10px] text-center text-muted-foreground py-4">Arrastra o pulsa un widget para comenzar</p>
                  ) : widgets.slice().reverse().map((w) => (
                    <div 
                      key={w.id} 
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all",
                        selectedId === w.id ? "bg-primary/5 border-primary ring-1 ring-primary/20" : "bg-white hover:bg-slate-50"
                      )}
                      onClick={() => setSelectedId(w.id)}
                    >
                      <span className="font-bold text-primary opacity-50">#</span>
                      <span className="flex-1 truncate font-medium">
                        {WIDGET_REGISTRY.find(d => d.type === w.type)?.label}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveWidget(w.id, 'up'); }}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); removeWidget(w.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </Card>

          {/* Canvas Central */}
          <div className="flex-1 flex justify-center items-start p-4 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-y-auto">
            <div 
              className={cn(
                "bg-white shadow-2xl transition-all duration-500 overflow-hidden relative min-h-[600px]",
                viewMode === 'desktop' ? "w-full max-w-5xl" : "w-[375px] rounded-[40px] border-[12px] border-slate-900"
              )}
            >
              {widgets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Tu Canvas está listo</h3>
                    <p className="text-sm text-muted-foreground">
                      Añade widgets desde la librería de la izquierda para empezar a construir tu landing optimizada para Tienda Nube.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {widgets.map((w) => (
                    <div 
                      key={w.id} 
                      className={cn(
                        "relative group cursor-pointer border-2 border-transparent transition-all",
                        selectedId === w.id ? "border-primary" : "hover:border-primary/30"
                      )}
                      onClick={() => setSelectedId(w.id)}
                    >
                      {/* Renderizado simplificado para el canvas */}
                      {w.type === 'hero' && (
                        <div style={{ background: w.props.bgColor, color: w.props.textColor }} className="p-12 text-center">
                          <h1 className="text-4xl font-black mb-4 leading-tight">{w.props.title}</h1>
                          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">{w.props.subtitle}</p>
                          <Button style={{ background: w.props.textColor, color: w.props.bgColor }} className="rounded-full h-12 px-8 font-black shadow-lg">
                            {w.props.buttonText}
                          </Button>
                        </div>
                      )}
                      {w.type === 'benefits' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-slate-50">
                          {w.props.items.map((item: any, i: number) => (
                            <div key={i} className="text-center flex flex-col items-center">
                              <div className="w-12 h-12 bg-primary/10 rounded-full mb-4 flex items-center justify-center text-primary">
                                <CheckCircle2 className="h-6 w-6" />
                              </div>
                              <h4 className="font-bold mb-1">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {w.type === 'timer' && (
                        <div style={{ background: w.props.bgColor, color: w.props.textColor }} className="p-6 text-center">
                          <p className="text-xs font-bold tracking-widest mb-3">{w.props.label}</p>
                          <div className="flex justify-center gap-6 font-mono text-2xl">
                            <div>00<small className="block text-[10px]">DÍAS</small></div>
                            <div>00<small className="block text-[10px]">HS</small></div>
                            <div>00<small className="block text-[10px]">MIN</small></div>
                            <div>00<small className="block text-[10px]">SEG</small></div>
                          </div>
                        </div>
                      )}
                      {w.type === 'cta' && (
                        <div className="p-12 flex flex-col items-center text-center">
                          <Button style={{ background: w.props.bgColor }} className="h-16 px-12 text-xl font-black rounded-xl shadow-xl hover:scale-105 transition-transform mb-4">
                            {w.props.text}
                          </Button>
                          <p className="text-sm text-muted-foreground italic">{w.props.subtext}</p>
                        </div>
                      )}
                      {/* Badge de selección rápida */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="bg-white/90 shadow-sm border">{w.type.toUpperCase()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Inspector Derecho: Propiedades del Widget */}
          <Card className="w-80 flex flex-col shadow-lg border-primary/5">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> Inspector de Propiedades
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              {!selectedWidget ? (
                <div className="p-12 text-center text-muted-foreground space-y-4 opacity-40">
                  <Monitor className="h-12 w-12 mx-auto" />
                  <p className="text-sm">Selecciona un elemento para editarlo.</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 mb-4">
                    <p className="text-[10px] font-black text-primary uppercase mb-1">Editando</p>
                    <p className="text-sm font-bold">{WIDGET_REGISTRY.find(d => d.type === selectedWidget.type)?.label}</p>
                  </div>

                  {selectedWidget.type === 'hero' && (
                    <>
                      <div className="space-y-2">
                        <Label>Título Principal</Label>
                        <Input value={selectedWidget.props.title} onChange={e => updateProps(selectedId!, { title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Input value={selectedWidget.props.subtitle} onChange={e => updateProps(selectedId!, { subtitle: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Texto del Botón</Label>
                        <Input value={selectedWidget.props.buttonText} onChange={e => updateProps(selectedId!, { buttonText: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Fondo</Label>
                          <Input type="color" value={selectedWidget.props.bgColor} onChange={e => updateProps(selectedId!, { bgColor: e.target.value })} className="h-10 p-1" />
                        </div>
                        <div className="space-y-2">
                          <Label>Texto</Label>
                          <Input type="color" value={selectedWidget.props.textColor} onChange={e => updateProps(selectedId!, { textColor: e.target.value })} className="h-10 p-1" />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedWidget.type === 'timer' && (
                    <>
                      <div className="space-y-2">
                        <Label>Etiqueta</Label>
                        <Input value={selectedWidget.props.label} onChange={e => updateProps(selectedId!, { label: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Finaliza el (ISO Date)</Label>
                        <Input type="datetime-local" value={selectedWidget.props.endTime.substring(0, 16)} onChange={e => updateProps(selectedId!, { endTime: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Color Fondo</Label>
                        <Input type="color" value={selectedWidget.props.bgColor} onChange={e => updateProps(selectedId!, { bgColor: e.target.value })} className="h-10 p-1" />
                      </div>
                    </>
                  )}

                  {selectedWidget.type === 'cta' && (
                    <>
                      <div className="space-y-2">
                        <Label>Texto Botón</Label>
                        <Input value={selectedWidget.props.text} onChange={e => updateProps(selectedId!, { text: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtexto</Label>
                        <Input value={selectedWidget.props.subtext} onChange={e => updateProps(selectedId!, { subtext: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>URL Destino</Label>
                        <Input value={selectedWidget.props.url} onChange={e => updateProps(selectedId!, { url: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Color de Botón</Label>
                        <Input type="color" value={selectedWidget.props.bgColor} onChange={e => updateProps(selectedId!, { bgColor: e.target.value })} className="h-10 p-1" />
                      </div>
                    </>
                  )}

                  <Separator />
                  <Button variant="destructive" className="w-full h-10 shadow-md" onClick={() => removeWidget(selectedId!)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Widget
                  </Button>
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Modal de Exportación */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-2xl">
          <Header>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Exportar para Tienda Nube
            </DialogTitle>
            <DialogDescription>
              Copia el siguiente código y pégalo en una "Sección de Código" o en el editor HTML de tu Tienda Nube.
            </DialogDescription>
          </Header>
          <div className="bg-slate-900 rounded-xl p-4 mt-4 relative group">
            <ScrollArea className="h-64 font-mono text-[10px] text-slate-300 leading-relaxed">
              <pre className="whitespace-pre-wrap">{exportToTiendaNube(widgets)}</pre>
            </ScrollArea>
            <Button 
              size="sm" 
              className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white border-none" 
              onClick={handleCopyCode}
            >
              <Copy className="h-4 w-4 mr-2" /> Copiar Código
            </Button>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-4 space-y-2">
            <p className="text-xs font-bold text-blue-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" /> Notas Técnicas:
            </p>
            <ul className="text-[10px] text-blue-700 list-disc pl-4 space-y-1">
              <li>El código usa <strong>CSS Inline</strong> para máxima compatibilidad.</li>
              <li>Los iconos se inyectan vía JS para evitar que Tienda Nube los bloquee.</li>
              <li>No requiere bibliotecas externas pesadas.</li>
            </ul>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>Cerrar</Button>
            <Button onClick={handleCopyCode} className="bg-primary text-white">
              Copiar y Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
