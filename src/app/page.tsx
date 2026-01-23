'use client';

import { useAuth } from '@/context/AuthContext';
import WarRoom from '@/components/dashboard/WarRoom';
import LandingPage from '@/components/landing/LandingPage';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-green" size={48} />
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
