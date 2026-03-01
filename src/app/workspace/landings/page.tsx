
"use client";

import { useState, useEffect, useRef } from 'react';
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
  Layers, Box, Save, Upload, Bot, Download, Info
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WIDGET_REGISTRY } from '@/lib/landing-builder/registry';
import { WidgetInstance, WidgetType } from '@/types/landing-builder';
import { generateExport } from '@/lib/landing-builder/exporter';
import { generateLandingStructure } from '@/ai/flows/landing-ai-flow';
import { useToast } from '@/hooks/use-toast';

type AppMode = 'builder' | 'skinner';

export default function LandingGeneratorPage() {
  const [appMode, setAppMode] = useState<AppMode>('builder');
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [skinnerWidget, setSkinnerWidget] = useState<WidgetInstance>(() => ({
    id: 'skinner-instance',
    type: 'BUNDLE_SKINNER',
    props: WIDGET_REGISTRY.find(w => w.type === 'BUNDLE_SKINNER')?.defaultProps || {}
  }));
  
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [exportCode, setExportCode] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Persistence
  useEffect(() => {
    const savedBuilder = localStorage.getItem('tn-builder-data');
    if (savedBuilder) {
      try { setWidgets(JSON.parse(savedBuilder)); } catch (e) {}
    }
    const savedSkinner = localStorage.getItem('tn-skinner-data');
    if (savedSkinner) {
      try { setSkinnerWidget(JSON.parse(savedSkinner)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tn-builder-data', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem('tn-skinner-data', JSON.stringify(skinnerWidget));
  }, [skinnerWidget]);

  const addWidget = (type: WidgetType) => {
    const def = WIDGET_REGISTRY.find(w => w.type === type);
    if (!def) return;
    const newWidget: WidgetInstance = { id: `w-${Date.now()}`, type, props: { ...def.defaultProps } };
    setWidgets([...widgets, newWidget]);
    setSelectedId(newWidget.id);
  };

  const updateWidget = (id: string, newProps: any) => {
    if (appMode === 'builder') {
      setWidgets(widgets.map(w => w.id === id ? { ...w, props: { ...w.props, ...newProps } } : w));
    } else {
      setSkinnerWidget({ ...skinnerWidget, props: { ...skinnerWidget.props, ...newProps } });
    }
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

  const handleExport = () => {
    const code = appMode === 'builder' ? generateExport(widgets) : generateExport([skinnerWidget]);
    setExportCode(code);
    setIsExportOpen(true);
  };

  const handleSaveProject = () => {
    const dataStr = JSON.stringify(appMode === 'builder' ? widgets : skinnerWidget, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `am-project-${Date.now()}.json`;
    link.click();
    toast({ title: "Proyecto Guardado", description: "El archivo JSON se ha descargado." });
  };

  const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(loadedData)) {
          setWidgets(loadedData);
          setAppMode('builder');
        } else if (loadedData.type === 'BUNDLE_SKINNER') {
          setSkinnerWidget(loadedData);
          setAppMode('skinner');
        }
        toast({ title: "Proyecto Cargado" });
      } catch (err) {
        toast({ title: "Error al cargar", variant: "destructive" });
      }
    };
    reader.readAsText(file);
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
      toast({ title: "Landing Generada", description: "Estructura creada por la IA de Agencia AM." });
    } catch (error) {
      toast({ title: "Error en IA", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const selectedWidget = appMode === 'builder' ? widgets.find(w => w.id === selectedId) : skinnerWidget;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* --- Header ToolBar --- */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workspace"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-xl font-bold tracking-tight">AM Landing Builder</h1>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setAppMode('builder')}
                className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all", appMode === 'builder' ? "bg-primary text-white shadow" : "text-slate-500 hover:text-slate-900")}
              >
                Visual Builder
              </button>
              <button 
                onClick={() => setAppMode('skinner')}
                className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all", appMode === 'skinner' ? "bg-primary text-white shadow" : "text-slate-500 hover:text-slate-900")}
              >
                Bundle Skinner
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-primary border-primary/20 bg-primary/5" onClick={() => setIsAiWizardOpen(true)}>
              <Bot className="h-4 w-4 mr-2" /> WIDGET IA
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleLoadProject} />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Cargar JSON"><Upload className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={handleSaveProject} title="Guardar JSON"><Save className="h-4 w-4" /></Button>
            <Button onClick={handleExport} className="bg-slate-900 shadow-md">
              <Code2 className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* --- Sidebar (Solo en modo builder) --- */}
          {appMode === 'builder' && (
            <Card className="w-72 flex flex-col shadow-lg">
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-xs font-black text-slate-400 uppercase">Widgets</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4 space-y-2">
                {WIDGET_REGISTRY.filter(w => w.type !== 'BUNDLE_SKINNER').map((def) => (
                  <Button key={def.type} variant="outline" className="w-full justify-start h-12 gap-3" onClick={() => addWidget(def.type)}>
                    <div className="bg-primary/10 p-1.5 rounded text-primary"><def.icon className="h-4 w-4" /></div>
                    <span className="text-sm font-medium">{def.label}</span>
                  </Button>
                ))}
                <Separator className="my-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Capas</p>
                {widgets.slice().reverse().map((w) => (
                  <div key={w.id} className={cn("flex items-center gap-2 p-2 rounded-lg border text-xs mb-2 cursor-pointer", selectedId === w.id ? "bg-primary/5 border-primary" : "bg-white")} onClick={() => setSelectedId(w.id)}>
                    <span className="flex-1 truncate">{WIDGET_REGISTRY.find(d => d.type === w.type)?.label}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveWidget(w.id, 'up'); }}><ChevronUp className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); removeWidget(w.id); }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}

          {/* --- Canvas --- */}
          <div className="flex-1 flex flex-col bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden">
            <div className="h-10 bg-white border-b flex items-center justify-center gap-4">
              <button onClick={() => setViewMode('desktop')} className={cn("p-1.5 rounded transition-colors", viewMode === 'desktop' ? "text-primary" : "text-slate-400")}><Monitor className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('mobile')} className={cn("p-1.5 rounded transition-colors", viewMode === 'mobile' ? "text-primary" : "text-slate-400")}><Smartphone className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
              <div className={cn("bg-white shadow-2xl transition-all duration-500 min-h-[600px]", viewMode === 'desktop' ? "w-full max-w-5xl" : "w-[375px] rounded-[40px] border-[12px] border-slate-900 overflow-hidden")}>
                {appMode === 'builder' ? (
                  widgets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40 min-h-[400px]">
                      <Layout className="h-16 w-16 mb-4" />
                      <p className="font-bold">El lienzo está vacío</p>
                      <p className="text-sm">Agrega widgets o usa el Wizard IA</p>
                    </div>
                  ) : (
                    widgets.map((w) => {
                      const def = WIDGET_REGISTRY.find(d => d.type === w.type);
                      return (
                        <div key={w.id} className={cn("relative group border-2 border-transparent", selectedId === w.id ? "border-primary" : "hover:border-primary/20")} onClick={() => setSelectedId(w.id)}>
                          {def?.render(w.props, true)}
                        </div>
                      );
                    })
                  )
                ) : (
                  <div className="p-12">
                    <h2 className="text-center font-bold text-lg mb-8">Vista Previa de Skinner</h2>
                    {WIDGET_REGISTRY.find(w => w.type === 'BUNDLE_SKINNER')?.render(skinnerWidget.props, true)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- Inspector --- */}
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
                  <Badge className="mb-4">{selectedWidget.type}</Badge>
                  {WIDGET_REGISTRY.find(w => w.type === selectedWidget.type)?.controls.map((ctrl) => (
                    <div key={ctrl.name} className="space-y-2">
                      <Label>{ctrl.label}</Label>
                      {ctrl.type === 'text' && (
                        <Input 
                          value={selectedWidget.props[ctrl.name]} 
                          onChange={e => updateWidget(selectedWidget.id, { [ctrl.name]: e.target.value })} 
                        />
                      )}
                      {ctrl.type === 'textarea' && (
                        <Textarea 
                          value={selectedWidget.props[ctrl.name]} 
                          onChange={e => updateWidget(selectedWidget.id, { [ctrl.name]: e.target.value })} 
                        />
                      )}
                      {ctrl.type === 'color' && (
                        <Input 
                          type="color"
                          value={selectedWidget.props[ctrl.name]} 
                          onChange={e => updateWidget(selectedWidget.id, { [ctrl.name]: e.target.value })} 
                        />
                      )}
                    </div>
                  ))}
                  <Separator />
                  {appMode === 'builder' && (
                    <Button variant="destructive" className="w-full" onClick={() => removeWidget(selectedId!)}>Borrar Widget</Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* --- Modals --- */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Código para Tienda Nube</DialogTitle>
            <DialogDescription>
              {appMode === 'builder' 
                ? 'Pegar en: Descripción del producto (botón <>).' 
                : 'Pegar en: Configuración > Códigos de Tracking > Body.'}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-900 rounded-xl p-4 mt-4 relative">
            <ScrollArea className="h-64 font-mono text-[10px] text-slate-300">
              <pre>{exportCode}</pre>
            </ScrollArea>
            <Button size="sm" className="absolute top-2 right-2 bg-white/10" onClick={() => {
              navigator.clipboard.writeText(exportCode);
              toast({ title: "Copiado", description: "Código listo para usar." });
            }}>
              <Copy className="h-4 w-4 mr-2" /> Copiar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAiWizardOpen} onOpenChange={setIsAiWizardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Wizard</DialogTitle>
            <DialogDescription>Describe el producto y la IA diseñará la estructura por ti.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label>Instrucciones para la IA</Label>
            <Textarea 
              placeholder="Ej: Una landing para un smartwatch con tabla de beneficios y testimonios..." 
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
