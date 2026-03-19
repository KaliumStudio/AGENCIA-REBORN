
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AgencyLanding } from '@/components/landing/agency-landing';

export default function HomePage() {
  const { profile, loading, user } = useAuth();
  const router = useRouter();
  const redirecting = useRef(false);

  useEffect(() => {
    // Solo redirigir si el usuario está autenticado y tenemos su perfil
    if (!loading && user && profile && !redirecting.current) {
      redirecting.current = true;
      router.push(`/${profile.role}/batches`);
    }
  }, [loading, user, profile, router]);

  // Si está cargando el estado inicial, mostramos un esqueleto para evitar saltos bruscos
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05070A]">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-primary/20 animate-pulse rounded-full mx-auto" />
          <div className="h-4 w-48 bg-white/5 animate-pulse rounded mx-auto" />
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostramos la landing page por defecto
  if (!user) {
    return <AgencyLanding />;
  }

  // Fallback mientras se procesa la redirección para usuarios autenticados
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#05070A]">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 bg-primary animate-spin rounded-xl mx-auto" />
        <p className="text-gray-500 font-bold tracking-widest text-xs uppercase">Entrando al Portal...</p>
      </div>
    </div>
  );
}
