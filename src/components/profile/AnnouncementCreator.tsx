'use client';

import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { supabase } from '@/lib/supabase';
import { Megaphone, Users, Send, Loader2, X } from 'lucide-react';
import { Profile } from '@/types/database';

interface AnnouncementCreatorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AnnouncementCreator({ open, onOpenChange }: AnnouncementCreatorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetType, setTargetType] = useState<'all' | 'role' | 'node' | 'user'>('all');
    const [targetValue, setTargetValue] = useState('');
    const [sending, setSending] = useState(false);

    // Options for Selects
    const [nodes, setNodes] = useState<string[]>([]);
    const [staff, setStaff] = useState<Profile[]>([]);

    useEffect(() => {
        if (open) fetchOptions();
    }, [open]);

    async function fetchOptions() {
        const { data } = await supabase.from('profiles').select('node, id, full_name, role');
        if (data) {
            const uniqueNodes = Array.from(new Set(data.map(p => p.node).filter(Boolean))) as string[];
            setNodes(uniqueNodes);
            setStaff(data as any);
        }
    }

    async function handleSend() {
        if (!title || !content) return;
        setSending(true);

        // Construct final audience string, e.g. "all", "role:coordinator", "node:Hidalgo", "user:UUID"
        let finalAudience = 'all';
        if (targetType === 'role') finalAudience = `role:${targetValue}`;
        if (targetType === 'node') finalAudience = `node:${targetValue}`;
        if (targetType === 'user') finalAudience = `user:${targetValue}`;

        const { error } = await supabase.from('announcements').insert({
            title,
            content,
            target_audience: finalAudience
        });

        setSending(false);
        if (!error) {
            onOpenChange(false);
            setTitle('');
            setContent('');
            setTargetType('all');
            alert('Aviso enviado correctamente');
        } else {
            alert('Error al enviar aviso');
        }
    }

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
                <Drawer.Content className="bg-dark-surface flex flex-col rounded-t-[10px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-50 md:max-w-md md:mx-auto border-t border-white/10 outline-none">

                    <div className="p-4 bg-black/20 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-white font-bold flex items-center gap-2">
                            <Megaphone className="text-status-red" size={20} /> Nuevo Aviso
                        </h2>
                        <button onClick={() => onOpenChange(false)} className="text-gray-400 p-2">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                        {/* Target Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Destinatarios</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setTargetType('all')}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${targetType === 'all' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => { setTargetType('node'); setTargetValue(nodes[0] || ''); }}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${targetType === 'node' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                    Por Nodo
                                </button>
                                <button
                                    onClick={() => { setTargetType('role'); setTargetValue('coordinator'); }}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${targetType === 'role' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                    Por Rol
                                </button>
                                <button
                                    onClick={() => { setTargetType('user'); setTargetValue(staff[0]?.id || ''); }}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${targetType === 'user' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                    Individual
                                </button>
                            </div>

                            {/* Dynamic Sub-selector */}
                            {targetType === 'node' && (
                                <select
                                    value={targetValue}
                                    onChange={e => setTargetValue(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-green outline-none"
                                >
                                    {nodes.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            )}
                            {targetType === 'role' && (
                                <select
                                    value={targetValue}
                                    onChange={e => setTargetValue(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-green outline-none"
                                >
                                    <option value="coordinator">Coordinadores</option>
                                    <option value="volunteer">Staff/Voluntarios</option>
                                    <option value="admin">Administradores</option>
                                </select>
                            )}
                            {targetType === 'user' && (
                                <select
                                    value={targetValue}
                                    onChange={e => setTargetValue(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-green outline-none"
                                >
                                    {staff.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.node})</option>)}
                                </select>
                            )}
                        </div>

                        {/* Content Form */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Título del aviso..."
                                className="w-full bg-transparent border-b border-white/10 pb-2 text-xl font-bold text-white placeholder:text-gray-600 focus:border-brand-green focus:outline-none"
                            />

                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Escribe el mensaje aquí..."
                                className="w-full h-40 bg-white/5 rounded-2xl p-4 text-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-brand-green/50 placeholder:text-white/10"
                            />
                        </div>

                    </div>

                    <div className="p-4 bg-black/40 border-t border-white/10">
                        <button
                            onClick={handleSend}
                            disabled={sending || !title || !content}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {sending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                            Enviar Aviso
                        </button>
                    </div>

                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
