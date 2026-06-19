'use client';

import TeamChat from '@/components/chat/TeamChat';
import RouteGuard from '@/components/auth/RouteGuard';

export default function ChatPage() {
    return (
        <RouteGuard requiredRole="volunteer">
            <ChatContent />
        </RouteGuard>
    );
}

function ChatContent() {
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
