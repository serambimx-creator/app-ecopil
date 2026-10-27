'use client';

import { useAuth } from '@/context/AuthContext';
import WarRoom from '@/components/dashboard/WarRoom';
import LandingPage from '@/components/landing/LandingPage';
import Mixtli from '@/components/brand/Mixtli';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Mixtli pose="asoma" height={120} animated priority />
        <p className="text-sm font-bold text-white/60">Cargando…</p>
      </div>
    );
  }

  // Switcher Logic
  if (isAuthenticated && user) {
    // Determine Dashboard Mode
    const dashboardRole = user.role === 'admin' ? 'admin' : 'coordinator';
    return <WarRoom role={dashboardRole} />;
  }

  return <LandingPage />;
}
