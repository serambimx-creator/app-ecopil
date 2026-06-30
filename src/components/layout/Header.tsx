'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Lock } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const { isAuthenticated, signOut } = useAuth();

    // Display Ecopil MX on landing page instead of Panel Principal
    const getTitle = () => {
        if (!isAuthenticated && pathname === '/') return 'Ecopil MX';
        switch (pathname) {
            case '/': return 'Panel Principal';
            case '/agenda': return 'Agenda 2026';
            case '/mapa': return 'Mapa Operativo';
            case '/perfil': return 'Mi Perfil';
            default: return 'Ecopil Org';
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full bg-black/50 backdrop-blur-md border-b border-white/10 transition-all duration-300">
            <div className="flex items-center justify-between px-4 py-2">
                {/* Left: Logos + Title */}
                <div className="flex items-center gap-2">
                    <div className="relative h-11 w-24 flex items-center justify-center">
                        <div className="absolute inset-0 scale-110 bg-white rounded-full blur-md opacity-90 z-0" />
                        <Image
                            src="/logos/ecopil.png"
                            alt="Ecopil Logo"
                            fill
                            className="object-contain drop-shadow-lg relative z-10"
                            sizes="96px"
                            priority
                        />
                    </div>

                    <div className="relative h-9 w-16 flex items-center justify-center">
                        <div className="absolute inset-0 scale-110 bg-white rounded-full blur-md opacity-90 z-0" />
                        <Image
                            src="/logos/serambi.png"
                            alt="Serambi Logo"
                            fill
                            className="object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-lg relative z-10"
                            sizes="64px"
                        />
                    </div>

                    <h1 className="text-lg font-black text-white tracking-wide drop-shadow-md hidden sm:block">
                        {getTitle()}
                    </h1>
                </div>

                {/* Right: Access */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <button
                            onClick={signOut}
                            className="bg-status-red text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-status-red/80 transition-colors shadow-lg flex items-center gap-2"
                        >
                            <LogOut size={14} /> SALIR
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="text-white/70 hover:text-white transition-colors"
                            aria-label="Iniciar sesión"
                        >
                            <Lock size={22} />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
