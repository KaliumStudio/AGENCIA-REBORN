"use client";

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Image as ImageIcon, ArrowRight, Sparkles, Zap, Lock, Code2 } from 'lucide-react';
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
    }
  ];

  return (
    <DashboardLayout>
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary mb-8 shadow-2xl border border-primary/20 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Herramientas de Elite</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter flex items-center gap-6 text-white leading-none">
          Área de Trabajo
        </h1>
        <p className="text-gray-400 mt-6 max-w-3xl text-xl font-medium leading-relaxed">
          Acelera tu producción interna y mejora la calidad de tus entregas con nuestra suite de herramientas impulsadas por Inteligencia Artificial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {tools.map((tool, idx) => (
          <Card key={idx} className={cn(
            "relative overflow-hidden transition-all duration-500 group flex flex-col border-white/5 shadow-2xl rounded-[48px] p-2 bg-white/[0.03] backdrop-blur-sm",
            tool.status === 'active' 
              ? "hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-3 hover:bg-white/[0.05]" 
              : "opacity-75 grayscale"
          )}>
            <div className="absolute top-8 right-8 z-10">
              <Badge variant={tool.status === 'active' ? "default" : "secondary"} className={cn(
                "font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full border-none shadow-lg",
                tool.status === 'active' ? "bg-primary text-white" : "bg-white/10 text-gray-500"
              )}>
                {tool.badge}
              </Badge>
            </div>
            
            <div className="p-10 pb-6">
              <div className={cn(
                "w-20 h-20 rounded-[28px] flex items-center justify-center mb-10 transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 shadow-2xl",
                tool.status === 'active' ? "bg-primary text-white shadow-primary/30" : "bg-white/5 text-gray-600"
              )}>
                <tool.icon className="h-10 w-10" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tighter text-white mb-4 leading-none">{tool.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[56px] text-base font-medium leading-relaxed text-gray-400">
                {tool.description}
              </CardDescription>
            </div>

            <CardContent className="flex-1 pt-4 px-10 pb-2">
              {tool.status === 'active' ? (
                <div className="flex items-center gap-2 text-[10px] font-black text-primary/80 uppercase tracking-[0.2em] bg-primary/5 w-fit px-4 py-1.5 rounded-full border border-primary/10">
                  <Zap className="h-3.5 w-3.5 fill-primary/40" /> Potenciado por {tool.provider}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                  <Lock className="h-3.5 w-3.5" /> Acceso Restringido
                </div>
              )}
            </CardContent>

            <CardFooter className="p-10 pt-6">
              {tool.status === 'active' ? (
                <Button className="w-full group-hover:gap-6 transition-all font-black h-16 shadow-2xl shadow-primary/20 rounded-[20px] bg-white text-black hover:bg-primary hover:text-white text-base tracking-widest" asChild>
                  <Link href={tool.href} className="flex items-center justify-center gap-2 uppercase">
                    ABRIR HERRAMIENTA <ArrowRight className="h-6 w-6" />
                  </Link>
                </Button>
              ) : (
                <Button className="w-full font-black h-16 rounded-[20px] border-white/10 text-gray-600 bg-white/5" variant="outline" disabled>
                  EN DESARROLLO
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-24 p-16 bg-[#030406] rounded-[64px] text-white relative overflow-hidden shadow-[0_64px_120px_-15px_rgba(0,0,0,0.8)] group border border-white/5">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full -mr-64 -mt-64 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 blur-[120px] rounded-full -ml-40 -mb-40" />
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter leading-[0.9]">Ecosistema <br /><span className="text-primary">Producción <br />Interna</span></h2>
            <p className="text-gray-400 text-xl leading-relaxed mb-12 max-w-md font-medium">
              Estas herramientas son de uso exclusivo para el entorno de Agencia AM. Si necesitas soporte técnico, consulta la documentación oficial.
            </p>
            <div className="flex flex-wrap gap-6">
              <Button variant="secondary" className="font-black h-14 px-12 rounded-2xl bg-white text-black hover:bg-primary hover:text-white shadow-2xl transition-all hover:-translate-y-1 uppercase tracking-widest text-xs">DOCUMENTACIÓN IA</Button>
              <Button variant="ghost" className="font-black h-14 px-10 text-white hover:bg-white/10 rounded-2xl uppercase tracking-widest text-xs border border-white/10">REPORTAR BUG</Button>
            </div>
          </div>
          <div className="hidden md:flex justify-end relative">
             <div className="w-80 h-80 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
             <Sparkles className="w-56 h-56 text-primary/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 animate-pulse" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}