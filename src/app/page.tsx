
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { profile, loading, user } = useAuth();
  const router = useRouter();
  const redirecting = useRef(false);

  useEffect(() => {
    if (!loading && !redirecting.current) {
      if (!user) {
        redirecting.current = true;
        router.push('/login');
      } else if (profile) {
        redirecting.current = true;
        router.push(`/${profile.role}/batches`);
      }
    }
  }, [loading, user, profile, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-[250px]" />
      </div>
    </div>
  );
}
