'use client';

import TeamChat from '@/components/chat/TeamChat';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="bg-white/5 p-6 rounded-full mb-4">
                    <Lock size={48} className="text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Canal Seguro</h2>
                <p className="text-gray-400 mb-8">Debes ser parte del staff para ver el chat de equipo.</p>
                <Link
                    href="/login"
                    className="bg-brand-green text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                    Identificarse
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-24 animate-in fade-in zoom-in duration-500">
            <header className="mb-4 px-4 pt-4">
                <h1 className="text-3xl font-black text-white mb-1">
                    Comunicaciones
                </h1>
                <p className="text-gray-400 text-sm">Canal Oficial • Staff Nacional</p>
            </header>

            <div className="h-[calc(100vh-180px)] glass-card border border-white/5 rounded-[32px] overflow-hidden bg-black/20 mx-2">
                <TeamChat />
            </div>
        </div>
    );
}
