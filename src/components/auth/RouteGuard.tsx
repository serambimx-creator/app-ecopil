'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types/database';

const ROLE_LEVEL: Record<Role, number> = {
  volunteer: 1,
  coordinator: 2,
  admin: 3,
};

interface RouteGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
}

export default function RouteGuard({ requiredRole, children }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user || ROLE_LEVEL[user.role] < ROLE_LEVEL[requiredRole]) {
      const timer = setTimeout(() => router.push('/'), 100);
      return () => clearTimeout(timer);
    }

    setAuthorized(true);
  }, [user, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
