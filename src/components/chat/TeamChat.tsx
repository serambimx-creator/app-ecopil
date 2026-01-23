'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types/chat';
import { Send, User, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function TeamChat() {
    const { user, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        fetchMessages();

        // Realtime Subscription
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    console.log('New message received!', payload);
                    // We need to fetch the profile for the new message to display it correctly
                    // Or ideally, we optimistically update if it's us, but for others we need to fetch user details.
                    // For simplicity, we'll just re-fetch all or fetch the single expanded row.
                    fetchMessages();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, profiles(full_name, avatar_url, role)')
            .order('created_at', { ascending: true })
            .limit(50);

        if (data) {
            setMessages(data as any);
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setSending(true);
        const text = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    user_id: user.id,
                    content: text
                });

            if (error) {
                console.error("Error sending message:", error);

                // Demo Fallback: If DB insert fails (e.g. RLS or network), 
                // show it locally just for the demo user
                if (error.message.includes('permission') || error.message.includes('fetch')) {
                    const fakeMsg: Message = {
                        id: Date.now().toString(),
                        user_id: user.id,
                        content: text,
                        created_at: new Date().toISOString(),
                        profiles: {
                            full_name: user.full_name,
                            avatar_url: user.avatar_url,
                            role: user.role
                        }
                    };
                    setMessages(prev => [...prev, fakeMsg]);
                    scrollToBottom();
                }

            }
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No hay mensajes aún.</p>
                        <p className="text-xs">¡Sé el primero en escribir al equipo!</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.user_id === user?.id;
                    return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-shrink-0">
                                {msg.profiles?.avatar_url ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                                        <img src={msg.profiles.avatar_url} alt="Av" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <User size={14} className="text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end flex flex-col' : ''}`}>
                                {!isMe && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-300">{msg.profiles?.full_name || 'Usuario'}</span>
                                        <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-400 uppercase">{msg.profiles?.role || 'Staff'}</span>
                                    </div>
                                )}

                                <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${isMe
                                        ? 'bg-brand-green text-black rounded-tr-sm'
                                        : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                                    }`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-600 block">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 pt-2">
                <div className="glass-card p-1.5 rounded-full flex items-center gap-2 border border-white/10 bg-black/40 backdrop-blur-xl">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-white/10 transition-colors">
                        <span className="text-xl">📎</span>
                    </div>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje al equipo..."
                        className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none px-2"
                        disabled={!user}
                    />

                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="w-10 h-10 rounded-full bg-brand-green text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
