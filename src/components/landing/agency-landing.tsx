
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, Video, Layout, Image as ImageIcon, 
  Zap, MessageCircle, ArrowRight, CheckCircle2,
  Play, MousePointer2, Smartphone, Globe, Menu, ExternalLink, Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function AgencyLanding() {
  const whatsappNumber = "+542645691416";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=Hola! Vengo desde la web y quiero información sobre sus servicios de creativos IA.`;

  const ugcVideos = [
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F2.mp4?alt=media&token=d6f8ac7c-aece-4b9b-9595-1ce255a1b412",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F1%20(1).mp4?alt=media&token=4e384312-a775-4a85-bfd1-8945f0386056",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F1.mp4?alt=media&token=d7a0cfc4-f63e-43dc-8652-43c0d8af5c72",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F10.mp4?alt=media&token=3e95a7df-48bd-42c7-8307-94ba417023b5",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F2%20(1).mp4?alt=media&token=b77061f6-e9ef-4ae4-b6f8-bedb9dae4f01",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F3.mp4?alt=media&token=3a7f65d8-885a-4932-a63b-47b270441293",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F4.mp4?alt=media&token=b37e8ec3-f6d1-4a30-b635-b45bb10fbfb9",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F5.mp4?alt=media&token=dd0e163b-9bc8-4e69-924b-683147039af9",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F6.mp4?alt=media&token=187ef28f-0ae5-4da2-9f72-9e85c996f01",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2F7.mp4?alt=media&token=ad7ba3a1-c7fe-4dca-b367-e30fed3c3454",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2FCreativo%20n%C2%B08.mp4?alt=media&token=3c929ac1-4194-4a81-a6c5-7886ad92cce8",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Fvideos%2Forden10.mp4?alt=media&token=0cca4e99-e487-42c5-93b1-9351cea6213c"
  ];

  const retargetingAds = [
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F1%20(1).jpeg?alt=media&token=348375f6-71e2-4e26-b4cd-6212ed4e2caa",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F1%20(1).jpg?alt=media&token=17220032-fe33-454a-b601-05a66e8ed474",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F10.jpg?alt=media&token=d8001968-236e-4fb9-bb4c-e793d9bf70c7",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F13.jpg?alt=media&token=4b2dfd94-9b29-4132-8268-31f81544c0f9",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F2%20(1).jpg?alt=media&token=ce666b98-f70e-4a72-b6e1-53daa40f2b3c",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F2%20(2).jpg?alt=media&token=29619455-7484-4804-886a-629455061885",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F2%20(3).jpg?alt=media&token=72ce6d12-d0a4-42a1-8d9d-4843fdb7499b",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F3%20(1).jpeg?alt=media&token=7d29f650-8514-4606-8e1d-2c584724f2f8",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F5.jpg?alt=media&token=64937132-57c3-4ce4-89df-ef767cf59452",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F6.jpg?alt=media&token=3a0e3e2e-a823-431c-bfac-6c69108892b1",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F8%20(1).jpg?alt=media&token=8bd7493c-1b00-465a-ac50-023ef53f4f10",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F8.jpg?alt=media&token=536b310c-7f95-4fa6-8e02-7d36ea42e9d5",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2F9.png?alt=media&token=78b9068b-0ff1-48b9-a50c-ad0e6d6c7685",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2FANGULO%202%20-%20FORMATO%20IMAGEN%20CURIOSA.jpg?alt=media&token=b6984f0b-7cfb-49da-a447-110bc4c0552e",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2FChatGPT%20Image%2015%20nov%202025%2C%2020_32_57.png?alt=media&token=348b6132-663a-478d-841b-09ae6abb31aa",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2FGlucometer_retargeting_ad_image_1efdf32a58.jpeg?alt=media&token=8bed6c65-d536-4836-b699-8ab413a1f2a5",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2FPost%20Promo%C3%A7%C3%A3o%20Sale.png?alt=media&token=b3c6dbfc-f9fe-446a-90e9-6f561fd6de20",
    "https://firebasestorage.googleapis.com/v0/b/studio-7837102107-41ca8.firebasestorage.app/o/multimedia%20landing%20page%20agencia%2Festatico213124.jpg?alt=media&token=840c6965-baa5-4985-ac00-aeef7701a1c8"
  ];

  const landingsPortfolio = [
    {
      name: "La Boutique",
      niche: "Moda y Accesorios",
      platform: "Shopify",
      image: "https://cdn.shopify.com/s/files/1/0750/3832/6831/files/Dos_chicasuna_morocha_y_otra_rubia_argentinas_atra_delpmaspu.jpg?v=1773558824",
      url: "https://laboutique.lat/"
    },
    {
      name: "ZenSleep",
      niche: "Bienestar y Descanso",
      platform: "Shopify",
      image: "https://zensleep.com.ar/cdn/shop/files/unnamed_d5bb83aa-b9f2-4763-bdcf-5f902c56147e.jpg?v=1771029624&width=1100",
      url: "https://zensleep.com.ar/products/ergocountour-pro-almohada-cervical-premium"
    },
    {
      name: "Auren Moda",
      niche: "Moda Femenina",
      platform: "Shopify",
      image: "https://aurenmoda.com/cdn/shop/files/ad-1772945716006.jpg?v=1772945730&width=533",
      url: "https://aurenmoda.com/"
    },
    {
      name: "Lumiere Paris",
      niche: "Cosmética Premium",
      platform: "Shopify",
      image: "https://lumiereparis.com.ar/cdn/shop/files/unnamed_a3371ad4-b9cc-4831-9696-b33f1b932887.jpg?v=1771890045&width=990",
      url: "https://lumiereparis.com.ar/products/lumiere-paris"
    },
    {
      name: "Arcevia Pro",
      niche: "Cuidado Personal",
      platform: "Tienda Nube",
      image: "https://acdn-us.mitiendanube.com/stores/006/390/104/products/unnamed-1-1-39158f2886fa4c731d17701569160960-1024-1024.webp",
      url: "https://arceviashop.com/productos/arcevia-pro-exfoliador-2x1-1eu8z/"
    },
    {
      name: "Nutricats",
      niche: "Suplementos Mascotas",
      platform: "Shopify",
      image: "https://nutricats.com.ar/cdn/shop/files/unnamed_3aee6d77-3101-4e43-ab98-6c16e794d911.jpg?v=1771054730&width=990",
      url: "https://nutricats.com.ar/products/suplemento-de-taurina-para-gatos-frena-la-enfermedad-silenciosa-antes-de-ver-los-sintomas"
    },
    {
      name: "MaxClinic",
      niche: "Belleza y SkinCare",
      platform: "Tienda Nube",
      image: "https://acdn-us.mitiendanube.com/stores/006/390/104/products/unnamed-7defc5253e9840fdf417711214345021-1024-1024.webp",
      url: "https://arceviashop.com/productos/maxclinic-rosa-vitamina-en-espuma-de-aceite-1543d/"
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white overflow-hidden selection:bg-primary/30">
      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(41,98,255,0.4)]">
              AM
            </div>
            <span className="font-black text-xl tracking-tighter hidden sm:block">AGENCIA AM</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
            <a href="#servicios" className="hover:text-white transition-colors">SERVICIOS</a>
            <a href="#videos" className="hover:text-white transition-colors">VIDEOS UGC</a>
            <a href="#portafolio" className="hover:text-white transition-colors">LANDINGS</a>
            <a href="#estaticos" className="hover:text-white transition-colors">ANUNCIOS</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="font-bold text-gray-400 hover:text-white" asChild>
              <Link href="/login">ACCESO CLIENTES</Link>
            </Button>
            <Button className="font-bold bg-primary hover:bg-primary/90" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">EMPEZAR AHORA</a>
            </Button>
          </div>
        </div>
      </header>

      {/* --- HERO --- */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold tracking-widest uppercase">TOP 1 AGENCIA DE IA EN ARGENTINA</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            CREATIVOS QUE <br /> VENDEN EN AUTO.
          </h1>
          
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-12 font-medium">
            Escalá tu e-commerce con anuncios de alto impacto generados por Inteligencia Artificial. Entregas en tiempo récord para que nunca dejes de vender.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg font-black bg-primary hover:bg-primary/90 rounded-2xl shadow-[0_10px_30px_rgba(41,98,255,0.3)] transition-all hover:-translate-y-1" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">QUIERO MI PACK DE VIDEOS</a>
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>ENTREGAS EN 24/48 HS</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES --- */}
      <section id="servicios" className="py-24 bg-white/5 border-y border-white/5">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tighter uppercase">Nuestra Factoría de Ventas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "UGC IA Especializado",
                desc: "Nuestra especialidad. Avatares humanos hiperrealistas creados con IA que hablan directo a tu cliente.",
                icon: Video,
                color: "text-primary",
                bg: "bg-primary/10"
              },
              {
                title: "Retargeting Ads",
                desc: "Imágenes estáticas diseñadas para re-impactar y cerrar la venta de los que se fueron sin comprar.",
                icon: ImageIcon,
                color: "text-accent",
                bg: "bg-accent/10"
              },
              {
                title: "Landings de Código",
                desc: "Páginas de aterrizaje personalizadas en Tienda Nube y Shopify. Optimizadas para velocidad y conversión.",
                icon: Layout,
                color: "text-emerald-400",
                bg: "bg-emerald-400/10"
              }
            ].map((s, idx) => (
              <Card key={idx} className="bg-white/[0.03] border-white/10 hover:border-white/20 transition-all group overflow-hidden">
                <CardContent className="p-8">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", s.bg)}>
                    <s.icon className={cn("h-7 w-7", s.color)} />
                  </div>
                  <h3 className="text-xl font-black mb-4 text-white">{s.title}</h3>
                  <p className="text-gray-300 leading-relaxed font-medium">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- VIDEO CAROUSEL --- */}
      <section id="videos" className="py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">UGC IA en Acción</h2>
              <p className="text-gray-400 font-medium italic">Videos 9:16 diseñados para capturar el scroll infinito de TikTok e Instagram.</p>
            </div>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {ugcVideos.map((url, i) => (
                <CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="aspect-[9/16] relative rounded-3xl overflow-hidden bg-white/5 group border border-white/10 shadow-2xl">
                    <video 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      preload="metadata"
                    >
                      <source src={url} type="video/mp4" />
                    </video>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                        <p className="text-xs font-black uppercase text-primary mb-1">Formato UGC IA</p>
                        <p className="text-[10px] font-medium text-white/80">Demo de producto Real #{i + 1}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex justify-end gap-2 mt-8">
              <CarouselPrevious className="relative static bg-white/5 border-white/10 hover:bg-white/10" />
              <CarouselNext className="relative static bg-white/5 border-white/10 hover:bg-white/10" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* --- LANDINGS PORTFOLIO --- */}
      <section id="portafolio" className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">Portafolio de Landings</h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium">Estructuras personalizadas diseñadas para vender. Sin plantillas genéricas, solo código optimizado para conversión.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {landingsPortfolio.map((landing, idx) => (
              <div key={idx} className="group relative flex flex-col">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 group-hover:border-primary/50 transition-all shadow-2xl">
                  {/* Browser Mockup Header */}
                  <div className="absolute top-0 w-full h-6 bg-white/10 backdrop-blur-md border-b border-white/5 flex items-center px-3 gap-1 z-20">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                  </div>
                  {/* Image with Hover Scroll Effect */}
                  <div className="w-full h-full pt-6 overflow-hidden">
                    <img 
                      src={landing.image} 
                      alt={landing.name}
                      className="w-full transition-transform duration-[5000ms] ease-linear group-hover:-translate-y-[70%]"
                    />
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                    <Button variant="default" className="bg-primary font-bold rounded-full px-6" asChild>
                      <a href={landing.url} target="_blank" rel="noopener noreferrer">VER LANDING VIVA</a>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">{landing.name}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-primary/30 text-primary">
                        {landing.platform}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Nicho: {landing.niche}</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-full text-gray-400 group-hover:text-primary transition-colors">
                    <ExternalLink className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex flex-wrap justify-center gap-8 md:gap-16 opacity-40">
              <div className="flex items-center gap-2 grayscale brightness-200">
                <Globe className="h-6 w-6" /> <span className="font-bold">TIENDA NUBE PRO</span>
              </div>
              <div className="flex items-center gap-2 grayscale brightness-200">
                <Layout className="h-6 w-6" /> <span className="font-bold">SHOPIFY EXPERTS</span>
              </div>
              <div className="flex items-center gap-2 grayscale brightness-200">
                <Zap className="h-6 w-6" /> <span className="font-bold">CONVERSION RATE OPTIMIZATION</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATIC ADS CAROUSEL --- */}
      <section id="estaticos" className="py-24 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">Anuncios de Retargeting</h2>
          <p className="text-gray-400 font-medium mb-12 italic">Piezas estáticas diseñadas para capturar a los usuarios que no compraron a la primera.</p>

          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent className="-ml-4">
              {retargetingAds.map((url, i) => (
                <CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="aspect-square relative rounded-2xl overflow-hidden border border-white/10 group bg-slate-900 flex items-center justify-center shadow-xl">
                    <img 
                      src={url} 
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30"
                      alt=""
                    />
                    <img 
                      src={url} 
                      className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                      alt={`Retargeting Ad ${i + 1}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 z-20 text-left">
                      <p className="text-[10px] font-black text-primary mb-1 uppercase tracking-[0.2em]">Meta Ads Optimization</p>
                      <p className="text-xs font-bold text-white">Creative Variant #{i + 1}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex justify-center gap-4 mt-12">
              <CarouselPrevious className="relative static bg-white/5 border-white/10 hover:bg-white/10" />
              <CarouselNext className="relative static bg-white/5 border-white/10 hover:bg-white/10" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 scale-150" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 uppercase">¿Listo para escalar?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto font-medium">
            No pierdas más tiempo testeando creativos mediocres. Empezá hoy con la tecnología que están usando las marcas que facturan millones.
          </p>
          <Button size="lg" className="h-16 px-12 text-xl font-black bg-white text-black hover:bg-gray-200 rounded-2xl shadow-2xl transition-all" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">HABLAR CON UN ASESOR</a>
          </Button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-sm">AM</div>
            <span className="font-black text-lg tracking-tighter text-gray-400">AGENCIA AM &copy; 2024</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold text-gray-500 uppercase">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="https://instagram.com" target="_blank" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>

      {/* --- FLOATING WHATSAPP --- */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 transition-all animate-bounce group"
      >
        <MessageCircle className="h-8 w-8 text-white fill-white" />
        <div className="absolute right-full mr-4 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
          ¿En qué podemos ayudarte?
        </div>
      </a>
    </div>
  );
}
