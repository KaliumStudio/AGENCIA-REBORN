
"use client";

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Image as ImageIcon, Layout, ShoppingBag, ArrowRight, Sparkles, Zap, Lock } from 'lucide-react';
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
      badge: "Operativo"
    },
    {
      title: "Generador de Avatares IA",
      description: "Crea personajes y avatares realistas para tus marcas usando Nano Banana Pro.",
      icon: UserCircle,
      href: "#",
      status: "coming_soon",
      badge: "En Mantenimiento"
    },
    {
      title: "Landing Pages IA",
      description: "Generación automática de estructuras para Shopify y Tienda Nube.",
      icon: Layout,
      href: "#",
      status: "coming_soon",
      badge: "Próximamente"
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" /> Área de Trabajo
        </h1>
        <p className="text-muted-foreground mt-2">Herramientas creativas impulsadas por IA para acelerar tu producción interna.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, idx) => (
          <Card key={idx} className={cn(
            "relative overflow-hidden transition-all duration-300 group flex flex-col",
            tool.status === 'active' ? "hover:shadow-xl hover:-translate-y-1 border-primary/10" : "opacity-75 grayscale bg-slate-50"
          )}>
            <div className="absolute top-0 right-0 p-4">
              <Badge variant={tool.status === 'active' ? "default" : "secondary"}>{tool.badge}</Badge>
            </div>
            <CardHeader className="pb-2">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
                tool.status === 'active' ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-400"
              )}>
                <tool.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{tool.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[40px]">{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {tool.status === 'active' ? (
                <div className="flex items-center gap-2 text-xs font-bold text-primary/60">
                  <Zap className="h-3 w-3" /> Potenciado por Nano Banana Pro
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Lock className="h-3 w-3" /> Herramienta Deshabilitada
                </div>
              )}
            </CardContent>
            <CardFooter>
              {tool.status === 'active' ? (
                <Button className="w-full group-hover:gap-3 transition-all font-bold" asChild>
                  <Link href={tool.href}>
                    Abrir Herramienta <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button className="w-full font-bold" variant="outline" disabled>
                  No Disponible
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-8 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 uppercase tracking-tighter">Modo Producción Interna</h2>
          <p className="text-slate-400 text-sm max-w-xl mb-6">
            Esta sección es exclusiva para el equipo de Agencia AM. Usa estas herramientas para acelerar el cumplimiento de briefs y mejorar la calidad de las entregas finales.
          </p>
          <Button variant="secondary" className="font-bold">Consultar Documentación IA</Button>
        </div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      </div>
    </DashboardLayout>
  );
}
