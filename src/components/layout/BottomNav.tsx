'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Home, Calendar, BookOpen, Map, User, ClipboardList } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const isLightPage = (pathname === '/' && !user) || pathname === '/login' || pathname === '/registro' || pathname === '/mi-registro' || pathname === '/programa' || pathname === '/guia' || pathname === '/mapa';

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Asistentes y público: mismas pestañas. El panel de gestores vive en /gestion.
    const navItems = useMemo(() => [
        { name: 'Inicio', href: '/', icon: Home },
        { name: 'Programa', href: '/programa', icon: Calendar },
        { name: 'Guía', href: '/guia', icon: BookOpen },
        { name: 'Mapa', href: '/mapa', icon: Map },
        pathname === '/gestion'
            ? { name: 'Gestión', href: '/gestion', icon: ClipboardList }
            : { name: 'Mi registro', href: '/mi-registro', icon: User },
    ], [pathname]);

    if (!isMounted) return null;

    return (
        <nav
            className={clsx(
                "fixed bottom-0 left-1/2 -translate-x-1/2 w-full app-shell-width z-50 border-t backdrop-blur-xl",
                isLightPage
                    ? "bg-[var(--t-surface)]/95 border-[var(--t-border)]"
                    : "glass-card border-white/10"
            )}
        >
            <div className="flex justify-around items-center h-20 pb-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full transition-all duration-200",
                                isActive
                                    ? isLightPage ? "text-[var(--t-accent)]" : "text-brand-green"
                                    : isLightPage
                                        ? "text-[var(--t-text-faint)] hover:text-[var(--t-text)]"
                                        : "text-gray-500 hover:text-white"
                            )}
                        >
                            <div className={clsx(
                                "px-4 py-1 rounded-full transition-all",
                                isActive && (isLightPage ? "bg-ecopil-leaf/60 mb-1" : "bg-brand-green/15 mb-1")
                            )}>
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
