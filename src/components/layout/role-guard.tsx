"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export const RoleGuard: React.FC<{ children: React.ReactNode; allowedRoles: UserRole[] }> = ({ children, allowedRoles }) => {
  const { profile, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile && !allowedRoles.includes(profile.role)) {
        // Redirect to their respective dashboard if they land in the wrong place
        router.push(`/${profile.role}/batches`);
      }
    }
  }, [loading, user, profile, allowedRoles, router]);

  if (loading || !profile || !allowedRoles.includes(profile.role)) {
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