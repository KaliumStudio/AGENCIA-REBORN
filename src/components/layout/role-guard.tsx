
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export const RoleGuard: React.FC<{ children: React.ReactNode; allowedRoles: UserRole[] }> = ({ children, allowedRoles }) => {
  const { profile, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirecting = useRef(false);

  // Convertimos allowedRoles a string para una comparación estable en el useEffect
  const rolesKey = JSON.stringify(allowedRoles);

  useEffect(() => {
    if (!loading && !redirecting.current) {
      if (!user) {
        redirecting.current = true;
        router.push('/login');
      } else if (profile) {
        const isAllowed = allowedRoles.includes(profile.role);
        const targetPath = `/${profile.role}/batches`;
        
        if (!isAllowed && pathname !== targetPath) {
          redirecting.current = true;
          router.push(targetPath);
        }
      }
    }
  }, [loading, user, profile, rolesKey, router, pathname, allowedRoles]);

  const isAllowed = profile && allowedRoles.includes(profile.role);

  if (loading || !profile || !isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 space-y-4 flex-col">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  return <>{children}</>;
};
