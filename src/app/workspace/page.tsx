
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
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">Herramientas de Elite</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
          Área de Trabajo
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Acelera tu producción interna y mejora la calidad de tus entregas con nuestra suite de herramientas impulsadas por Inteligencia Artificial.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, idx) => (
          <Card key={idx} className={cn(
            "relative overflow-hidden transition-all duration-500 group flex flex-col border-2",
            tool.status === 'active' 
              ? "hover:shadow-2xl hover:-translate-y-1 border-primary/5 hover:border-primary/20 bg-white" 
              : "opacity-75 grayscale bg-slate-50 border-slate-100"
          )}>
            <div className="absolute top-0 right-0 p-4">
              <Badge variant={tool.status === 'active' ? "default" : "secondary"} className={cn(
                "font-black uppercase text-[9px] tracking-widest",
                tool.status === 'active' ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
              )}>
                {tool.badge}
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500",
                tool.status === 'active' ? "bg-primary/10 text-primary shadow-lg shadow-primary/5" : "bg-slate-200 text-slate-400"
              )}>
                <tool.icon className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">{tool.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[48px] text-sm font-medium leading-relaxed">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-2">
              {tool.status === 'active' ? (
                <div className="flex items-center gap-2 text-[10px] font-black text-primary/60 uppercase tracking-tighter">
                  <Zap className="h-3 w-3 fill-primary/20" /> Potenciado por {tool.provider}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  <Lock className="h-3 w-3" /> Acceso Restringido
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-6 px-6">
              {tool.status === 'active' ? (
                <Button className="w-full group-hover:gap-3 transition-all font-black h-12 shadow-xl shadow-primary/10 rounded-xl" asChild>
                  <Link href={tool.href}>
                    ABRIR HERRAMIENTA <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button className="w-full font-black h-12 rounded-xl" variant="outline" disabled>
                  EN DESARROLLO
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 p-10 bg-slate-900 rounded-[32px] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter leading-none">Modo Producción Interna</h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Estas herramientas son de uso exclusivo para el ecosistema de Agencia AM. Si necesitas soporte técnico sobre cómo integrar los resultados en tus tiendas, consulta la documentación oficial.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" className="font-black h-11 px-8 rounded-xl">Documentación IA</Button>
              <Button variant="ghost" className="font-black h-11 px-8 text-white hover:bg-white/10 rounded-xl">Reportar Bug</Button>
            </div>
          </div>
          <div className="hidden md:flex justify-end">
             <div className="w-48 h-48 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
             <Sparkles className="w-32 h-32 text-primary/20 absolute -rotate-12" />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -mr-48 -mt-48" />
      </div>
    </DashboardLayout>
  );
}
