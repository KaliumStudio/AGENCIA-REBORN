
"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Layout, Sparkles, ArrowLeft, Settings2, Zap, Monitor, 
  Smartphone, Plus, Trash2, Code2, Copy,
  ChevronUp, ChevronDown, CheckCircle2, Wand2, Loader2,
  Star, Quote
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WIDGET_REGISTRY } from '@/lib/landing-builder/registry';
import { WidgetInstance, WidgetType } from '@/types/landing-builder';
import { exportToTiendaNube } from '@/lib/landing-builder/exporter';
import { generateLandingStructure } from '@/ai/flows/landing-ai-flow';
import { useToast } from '@/hooks/use-toast';

export default function LandingGeneratorPage() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('am-builder-state');
    if (saved) {
      try { setWidgets(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('am-builder-state', JSON.stringify(widgets));
  }, [widgets]);

  const addWidget = (type: WidgetType) => {
    const def = WIDGET_REGISTRY.find(w => w.type === type);
    if (!def) return;
    const newWidget: WidgetInstance = { id: `w-${Date.now()}`, type, props: { ...def.defaultProps } };
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

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const result = await generateLandingStructure({ prompt: aiPrompt });
      const newWidgets = result.widgets.map((w: any) => ({
        id: `w-ai-${Math.random()}`,
        type: w.type as WidgetType,
        props: w.props
      }));
      setWidgets(newWidgets);
      setIsAiWizardOpen(false);
      setAiPrompt('');
      toast({ title: "Landing Generada", description: "La IA ha diseñado una estructura basada en tu idea." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo generar la estructura.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = () => {
    const code = exportToTiendaNube(widgets);
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado", description: "Pégalo en el editor de Tienda Nube." });
  };

  const selectedWidget = widgets.find(w => w.id === selectedId);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workspace"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-xl font-bold tracking-tight">AM Landing Builder</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-primary border-primary/20 bg-primary/5" onClick={() => setIsAiWizardOpen(true)}>
              <Wand2 className="h-4 w-4 mr-2" /> AI Wizard
            </Button>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg ml-4">
              <Button variant={viewMode === 'desktop' ? 'outline' : 'ghost'} size="sm" onClick={() => setViewMode('desktop')}>
                <Monitor className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'mobile' ? 'outline' : 'ghost'} size="sm" onClick={() => setViewMode('mobile')}>
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setWidgets([])}>Limpiar</Button>
            <Button onClick={() => setIsExportOpen(true)} className="bg-primary shadow-md">
              <Code2 className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Sidebar Widgets */}
          <Card className="w-72 flex flex-col shadow-lg">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-xs font-black text-slate-400 uppercase">Widgets</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {WIDGET_REGISTRY.map((def) => (
                  <Button key={def.type} variant="outline" className="w-full justify-start h-12 gap-3" onClick={() => addWidget(def.type)}>
                    <div className="bg-primary/10 p-1.5 rounded text-primary"><def.icon className="h-4 w-4" /></div>
                    <span className="text-sm font-medium">{def.label}</span>
                  </Button>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Estructura</p>
                {widgets.slice().reverse().map((w) => (
                  <div key={w.id} className={cn("flex items-center gap-2 p-2 rounded-lg border text-xs mb-2", selectedId === w.id ? "bg-primary/5 border-primary" : "bg-white")}>
                    <span className="flex-1 truncate" onClick={() => setSelectedId(w.id)}>{WIDGET_REGISTRY.find(d => d.type === w.type)?.label}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveWidget(w.id, 'up')}><ChevronUp className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeWidget(w.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Canvas */}
          <div className="flex-1 flex justify-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-y-auto p-4">
            <div className={cn("bg-white shadow-2xl transition-all duration-500 min-h-[600px]", viewMode === 'desktop' ? "w-full max-w-5xl" : "w-[375px] rounded-[40px] border-[12px] border-slate-900")}>
              {widgets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                  <Layout className="h-16 w-16 mb-4" />
                  <p>Arrastra widgets o usa el AI Wizard</p>
                </div>
              ) : (
                widgets.map((w) => (
                  <div key={w.id} className={cn("relative group border-2 border-transparent", selectedId === w.id ? "border-primary" : "hover:border-primary/20")} onClick={() => setSelectedId(w.id)}>
                    {/* Render Simulado */}
                    {w.type === 'hero' && (
                      <div style={{ background: w.props.bgColor, color: w.props.textColor }} className="p-12 text-center">
                        <h1 className="text-4xl font-black mb-4">{w.props.title}</h1>
                        <p className="opacity-80 mb-8">{w.props.subtitle}</p>
                        <Button style={{ background: w.props.textColor, color: w.props.bgColor }} className="rounded-full">{w.props.buttonText}</Button>
                      </div>
                    )}
                    {w.type === 'benefits' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-slate-50">
                        {w.props.items.map((item: any, i: number) => (
                          <div key={i} className="text-center">
                            <div className="w-10 h-10 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
                            <h4 className="font-bold">{item.title}</h4>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {w.type === 'testimonials' && (
                      <div className="p-12 space-y-6">
                        {w.props.items.map((item: any, i: number) => (
                          <div key={i} className="bg-slate-50 p-6 rounded-xl border">
                            <div className="flex gap-1 mb-2">
                              {Array.from({ length: item.rating }).map((_, r) => <Star key={r} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                            </div>
                            <p className="text-sm italic mb-4">"{item.text}"</p>
                            <p className="text-xs font-bold">{item.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {w.type === 'timer' && (
                      <div style={{ background: w.props.bgColor, color: w.props.textColor }} className="p-6 text-center font-bold">
                        <p className="text-xs uppercase tracking-widest mb-3">{w.props.label}</p>
                        <div className="flex justify-center gap-4 text-2xl font-mono">00:00:00</div>
                      </div>
                    )}
                    {w.type === 'custom_code' && (
                      <div dangerouslySetInnerHTML={{ __html: w.props.html }} className="p-4" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Inspector */}
          <Card className="w-80 flex flex-col shadow-lg">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> Inspector
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              {!selectedWidget ? (
                <div className="p-12 text-center text-muted-foreground opacity-40">Selecciona un elemento</div>
              ) : (
                <div className="p-6 space-y-6">
                  <Badge className="mb-4">{selectedWidget.type.toUpperCase()}</Badge>
                  {selectedWidget.type === 'hero' && (
                    <>
                      <div className="space-y-2"><Label>Título</Label><Input value={selectedWidget.props.title} onChange={e => updateProps(selectedId!, { title: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Fondo</Label><Input type="color" value={selectedWidget.props.bgColor} onChange={e => updateProps(selectedId!, { bgColor: e.target.value })} /></div>
                    </>
                  )}
                  {selectedWidget.type === 'custom_code' && (
                    <div className="space-y-2"><Label>HTML Personalizado</Label><Textarea className="font-mono text-xs h-64" value={selectedWidget.props.html} onChange={e => updateProps(selectedId!, { html: e.target.value })} /></div>
                  )}
                  {selectedWidget.type === 'timer' && (
                    <div className="space-y-2"><Label>Finaliza en</Label><Input type="datetime-local" value={selectedWidget.props.endTime.slice(0, 16)} onChange={e => updateProps(selectedId!, { endTime: e.target.value })} /></div>
                  )}
                  <Separator />
                  <Button variant="destructive" className="w-full" onClick={() => removeWidget(selectedId!)}>Borrar Widget</Button>
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Export Modal */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Código para Tienda Nube</DialogTitle>
            <DialogDescription>Copia este código y pégalo en una sección de código de tu tienda.</DialogDescription>
          </DialogHeader>
          <div className="bg-slate-900 rounded-xl p-4 mt-4 relative">
            <ScrollArea className="h-64 font-mono text-[10px] text-slate-300">
              <pre>{exportToTiendaNube(widgets)}</pre>
            </ScrollArea>
            <Button size="sm" className="absolute top-2 right-2 bg-white/10" onClick={handleCopyCode}><Copy className="h-4 w-4 mr-2" /> Copiar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Wizard Modal */}
      <Dialog open={isAiWizardOpen} onOpenChange={setIsAiWizardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Wizard</DialogTitle>
            <DialogDescription>Describe el producto o negocio y la IA diseñará la estructura completa por ti.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label>¿Qué quieres vender?</Label>
            <Textarea 
              placeholder="Ej: Una landing para vender auriculares gamer con cancelación de ruido, destacar el envío gratis y poner un contador de oferta." 
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              className="h-32"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiWizardOpen(false)}>Cancelar</Button>
            <Button onClick={handleAiGenerate} disabled={generating || !aiPrompt}>
              {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generando...</> : "Generar Estructura"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
