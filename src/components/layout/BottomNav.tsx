'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Home, Calendar, BookOpen, Map, User, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const isLightPage = (pathname === '/' && !user) || pathname === '/login';

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const navItems = useMemo(() => {
        const role = user?.role;

        if (!user) {
            return [
                { name: 'Inicio', href: '/', icon: Home },
                { name: 'Guía', href: '/guia', icon: BookOpen },
                { name: 'Mapa', href: '/mapa', icon: Map },
            ];
        }

        const items = [
            { name: 'Inicio', href: '/', icon: Home },
            { name: 'Agenda', href: '/agenda', icon: Calendar },
            { name: 'Guía', href: '/guia', icon: BookOpen },
        ];

        if (role === 'coordinator' || role === 'admin') {
            items.push({ name: 'Chat', href: '/chat', icon: MessageCircle });
        }

        items.push({ name: 'Mapa', href: '/mapa', icon: Map });
        items.push({ name: 'Perfil', href: '/perfil', icon: User });

        return items;
    }, [user]);

    if (!isMounted) return null;

    return (
        <nav
            className={clsx(
                "fixed bottom-0 left-1/2 -translate-x-1/2 w-full app-shell-width z-50 border-t backdrop-blur-xl",
                isLightPage
                    ? "bg-[var(--t-surface-2)]/90 border-[var(--t-border)]"
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
                                    ? "text-brand-green"
                                    : isLightPage
                                        ? "text-[var(--t-text-faint)] hover:text-[var(--t-text)]"
                                        : "text-gray-500 hover:text-white"
                            )}
                        >
                            <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-brand-green/10 mb-1' : ''}`}>
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-medium transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
