
"use client";

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Image as ImageIcon, Layout, ShoppingBag, ArrowRight, Sparkles, Zap, Lock, Code2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function WorkspaceHubPage() {
  const tools = [
    {
      title: "Retargeting Ads IA",
      description: "Diseña piezas publicitarias de alto impacto optimizadas para re-impactar clientes.",
      icon: ImageIcon,
      href: "/workspace/retargeting",
      status: "active",
      badge: "Operativo",
      provider: "Nano Banana Pro"
    },
    {
      title: "Desarrollar Landings PRO",
      description: "Entorno de desarrollo para Tienda Nube. Crea estructuras de alta conversión con código personalizado.",
      icon: Code2,
      href: "/workspace/builder-pro",
      status: "active",
      badge: "Operativo",
      provider: "AM Landing Tool"
    },
    {
      title: "Generador de Avatares IA",
      description: "Crea personajes y avatares realistas para tus marcas usando Nano Banana Pro.",
      icon: UserCircle,
      href: "/workspace/avatars",
      status: "active",
      badge: "Operativo",
      provider: "Nano Banana Pro"
    },
    {
      title: "E-commerce Optimizer",
      description: "Optimiza tus catálogos de productos para maximizar la conversión.",
      icon: ShoppingBag,
      href: "#",
      status: "coming_soon",
      badge: "Próximamente"
    }
  ];

  return (
    <DashboardLayout>
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-6 shadow-sm border border-primary/5">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Herramientas de Elite</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter flex items-center gap-4 text-slate-900 leading-none">
          Área de Trabajo
        </h1>
        <p className="text-slate-500 mt-4 max-w-2xl text-lg font-medium leading-relaxed">
          Acelera tu producción interna y mejora la calidad de tus entregas con nuestra suite de herramientas impulsadas por Inteligencia Artificial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool, idx) => (
          <Card key={idx} className={cn(
            "relative overflow-hidden transition-all duration-500 group flex flex-col border-none shadow-xl shadow-slate-200/50 rounded-[40px] p-2 bg-white",
            tool.status === 'active' 
              ? "hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-2" 
              : "opacity-75 grayscale bg-slate-50/50"
          )}>
            <div className="absolute top-6 right-6 z-10">
              <Badge variant={tool.status === 'active' ? "default" : "secondary"} className={cn(
                "font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full",
                tool.status === 'active' ? "bg-primary text-white border-none" : "bg-slate-200 text-slate-500 border-none"
              )}>
                {tool.badge}
              </Badge>
            </div>
            
            <div className="p-8 pb-4">
              <div className={cn(
                "w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 transition-all group-hover:scale-110 group-hover:rotate-3 duration-500 shadow-lg",
                tool.status === 'active' ? "bg-primary text-white shadow-primary/20" : "bg-slate-200 text-slate-400 shadow-none"
              )}>
                <tool.icon className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900 mb-3">{tool.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[48px] text-sm font-medium leading-relaxed text-slate-500">
                {tool.description}
              </CardDescription>
            </div>

            <CardContent className="flex-1 pt-4 px-8 pb-2">
              {tool.status === 'active' ? (
                <div className="flex items-center gap-2 text-[10px] font-black text-primary/60 uppercase tracking-widest">
                  <Zap className="h-3.5 w-3.5 fill-primary/20" /> Potenciado por {tool.provider}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Lock className="h-3.5 w-3.5" /> Acceso Restringido
                </div>
              )}
            </CardContent>

            <CardFooter className="p-8 pt-4">
              {tool.status === 'active' ? (
                <Button className="w-full group-hover:gap-4 transition-all font-black h-14 shadow-2xl shadow-primary/20 rounded-2xl bg-slate-900 text-white hover:bg-primary" asChild>
                  <Link href={tool.href}>
                    ABRIR HERRAMIENTA <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button className="w-full font-black h-14 rounded-2xl border-slate-200 text-slate-400" variant="outline" disabled>
                  EN DESARROLLO
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-20 p-12 bg-slate-900 rounded-[48px] text-white relative overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] group">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -ml-32 -mb-32" />
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter leading-none">Ecosistema <br /><span className="text-primary">Producción Interna</span></h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md font-medium">
              Estas herramientas son de uso exclusivo para el entorno de Agencia AM. Si necesitas soporte técnico sobre cómo integrar los resultados, consulta la documentación oficial.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" className="font-black h-12 px-10 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-xl transition-all hover:-translate-y-1">DOCUMENTACIÓN IA</Button>
              <Button variant="ghost" className="font-black h-12 px-8 text-white hover:bg-white/10 rounded-2xl">REPORTAR BUG</Button>
            </div>
          </div>
          <div className="hidden md:flex justify-end relative">
             <div className="w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse" />
             <Sparkles className="w-40 h-40 text-primary/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 animate-pulse" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
