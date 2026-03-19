
"use client";

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LandingBuilderProPage() {
  const [iframeKey, setIframeKey] = useState(0);

  const refreshIframe = () => setIframeKey(prev => prev + 1);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workspace"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">Desarrollar Landings PRO</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-primary" /> Entorno Seguro de Agencia AM • Tienda Nube & Shopify Ready
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshIframe}>
              <RefreshCw className="h-4 w-4 mr-2" /> Recargar
            </Button>
            <Button variant="default" size="sm" asChild>
              <a href="https://am-landing-builder.web.app/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Abrir en nueva pestaña
              </a>
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border-2 shadow-2xl overflow-hidden relative group">
          <iframe 
            key={iframeKey}
            src="https://am-landing-builder.web.app/"
            className="w-full h-full border-none"
            title="AM Landing Builder External"
            allow="clipboard-read; clipboard-write"
          />
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
              <Maximize2 className="h-3 w-3" /> Área de Trabajo Expandida
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
