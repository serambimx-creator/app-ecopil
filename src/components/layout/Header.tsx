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

    // Light mode only applies to the public pages (landing, login, guía, mapa; the shell
    // chrome mirrors that here); internal staff/admin screens stay dark.
    const isLightPage = (pathname === '/' && !isAuthenticated) || pathname === '/login' || pathname === '/registro' || pathname === '/mi-registro' || pathname === '/programa' || pathname === '/guia' || pathname === '/mapa';

    // Display the event name on the landing page instead of Panel Principal
    const getTitle = () => {
        if (!isAuthenticated && pathname === '/') return '7º Encuentro Nacional';
        switch (pathname) {
            case '/': return 'Panel Principal';
            case '/agenda': return 'Agenda 2026';
            case '/login': return 'Acceso staff';
            case '/registro': return 'Registro';
            case '/mi-registro': return 'Mi registro';
            case '/programa': return 'Programa';
            case '/gestion': return 'Gestión';
            case '/mapa': return 'Mapa de sedes';
            case '/guia': return 'Guía de sedes';
            case '/perfil': return 'Mi Perfil';
            default: return '7º Encuentro Nacional';
        }
    };

    return (
        <header
            className={clsx(
                "sticky top-0 z-40 w-full backdrop-blur-md border-b transition-all duration-300",
                isLightPage ? "bg-[var(--t-header-bg)] border-[var(--t-border)]" : "bg-black/50 border-white/10"
            )}
        >
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                {/* Left: Logos + Title */}
                <Link href="/" className="flex items-center gap-2.5 min-w-0">
                    <Image
                        src="/mixtli/ecopil-logo.webp"
                        alt="Ecopil"
                        width={40}
                        height={48}
                        className="shrink-0"
                        priority
                    />
                    <div className="min-w-0 leading-none">
                        <p
                            className={clsx(
                                "font-display font-semibold text-[17px] truncate",
                                isLightPage ? "text-[var(--t-text)]" : "text-white"
                            )}
                        >
                            {getTitle()}
                        </p>
                        <p
                            className={clsx(
                                "text-[10px] font-bold uppercase tracking-wider mt-1 truncate",
                                isLightPage ? "text-[var(--t-text-faint)]" : "text-white/50"
                            )}
                        >
                            Ecopil MX · Hidalgo 2026
                        </p>
                    </div>
                    <div className="relative h-7 w-12 shrink-0 ml-1 rounded-lg bg-white px-1">
                        <Image
                            src="/logos/serambi.png"
                            alt="Serambi"
                            fill
                            className="object-contain p-0.5"
                            sizes="48px"
                        />
                    </div>
                </Link>

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
                            href="/gestion"
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
