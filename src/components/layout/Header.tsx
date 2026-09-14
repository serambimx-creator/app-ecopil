'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LogOut, Lock, Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';

export default function Header() {
    const pathname = usePathname();
    const { isAuthenticated, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // Light mode only applies to the public landing page + login (the shell
    // chrome mirrors that here); internal staff/admin screens stay dark.
    const isLightPage = (pathname === '/' && !isAuthenticated) || pathname === '/login';

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
        <header
            className={clsx(
                "sticky top-0 z-40 w-full backdrop-blur-md border-b transition-all duration-300",
                isLightPage ? "bg-[var(--t-header-bg)] border-[var(--t-border)]" : "bg-black/50 border-white/10"
            )}
        >
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

                    <h1
                        className={clsx(
                            "text-lg font-black tracking-wide drop-shadow-md hidden sm:block",
                            isLightPage ? "text-[var(--t-text)]" : "text-white"
                        )}
                    >
                        {getTitle()}
                    </h1>
                </div>

                {/* Right: Access */}
                <div className="flex items-center gap-3">
                    {isLightPage && (
                        <button
                            onClick={toggleTheme}
                            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
                            className="text-[var(--t-icon-muted)] hover:text-[var(--t-text)] transition-colors"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    )}
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
                            className={clsx(
                                "transition-colors",
                                isLightPage ? "text-[var(--t-icon-muted)] hover:text-[var(--t-text)]" : "text-white/70 hover:text-white"
                            )}
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
