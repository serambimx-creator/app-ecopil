'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Calendar, BookOpen, Map, User, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const navItems = [
        { name: 'Inicio', href: '/', icon: Home },
        { name: 'Agenda', href: '/agenda', icon: Calendar },
        { name: 'Guía', href: '/guia', icon: BookOpen },
        { name: 'Mapa', href: '/mapa', icon: Map },
        { name: 'Perfil', href: '/perfil', icon: User },
    ];

    if (!isMounted) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10">
            <div className="flex justify-around items-center h-20 pb-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${isActive ? 'text-brand-green' : 'text-gray-500 hover:text-white'
                                }`}
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
