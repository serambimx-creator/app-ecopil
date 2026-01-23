'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface SubBlock {
    id: string;
    activity_id: string;
    title: string;
    description: string | null;
    time_start: string | null; // HH:MM
    time_end: string | null;   // HH:MM
}

interface SubBlocksEditorProps {
    activityId: string;
}

export default function SubBlocksEditor({ activityId }: SubBlocksEditorProps) {
    const [blocks, setBlocks] = useState<SubBlock[]>([]);
    const [loading, setLoading] = useState(true);

    // New Block State
    const [newTitle, setNewTitle] = useState('');
    const [newStart, setNewStart] = useState('');
    const [newEnd, setNewEnd] = useState('');

    useEffect(() => {
        if (activityId) fetchBlocks();
    }, [activityId]);

    const fetchBlocks = async () => {
        const { data } = await supabase
            .from('sub_blocks')
            .select('*')
            .eq('activity_id', activityId)
            .order('time_start', { ascending: true });

        if (data) setBlocks(data);
        setLoading(false);
    };

    const handleAddBlock = async () => {
        if (!newTitle.trim()) return;

        const tempData: Partial<SubBlock> = {
            activity_id: activityId,
            title: newTitle,
            time_start: newStart || null,
            time_end: newEnd || null,
            description: ''
        };

        // Optimistic Update
        const optimisticId = crypto.randomUUID();
        setBlocks(prev => [...prev, { ...tempData, id: optimisticId } as SubBlock].sort((a, b) => (a.time_start || '').localeCompare(b.time_start || '')));

        // Reset Form
        setNewTitle('');
        setNewStart('');
        setNewEnd('');

        // DB Insert
        const { data, error } = await supabase.from('sub_blocks').insert(tempData).select().single();

        if (data) {
            // Replace optimistic with real
            setBlocks(prev => prev.map(b => b.id === optimisticId ? data : b));
        } else if (error) {
            console.error('Error creating sub-block:', error);
            // Revert on error could be added here
        }
    };

    const handleDeleteBlock = async (id: string) => {
        // Optimistic Delete
        setBlocks(prev => prev.filter(b => b.id !== id));

        // DB Delete
        await supabase.from('sub_blocks').delete().eq('id', id);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-green font-medium">
                <Clock size={20} />
                <h3>Itinerario (Minuto a Minuto)</h3>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                {blocks.length === 0 && !loading && (
                    <p className="text-sm text-gray-500 italic text-center py-2">No hay bloques de tiempo definidos.</p>
                )}

                {blocks.map((block) => (
                    <div key={block.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 group">
                        <div className="flex flex-col items-center min-w-[50px]">
                            <span className="text-white font-mono text-sm font-bold">{block.time_start || '--:--'}</span>
                            {block.time_end && <span className="text-gray-500 font-mono text-xs">{block.time_end}</span>}
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex-1">
                            <div className="text-white text-sm font-medium">{block.title}</div>
                        </div>
                        <button
                            onClick={() => handleDeleteBlock(block.id)}
                            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                        >
                            <Trash size={14} />
                        </button>
                    </div>
                ))}

                {/* Add New Block Form */}
                <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Nuevo Bloque</p>
                    <div className="flex gap-2 items-start">
                        <div className="flex flex-col gap-1 w-24">
                            <input
                                type="time"
                                value={newStart}
                                onChange={e => setNewStart(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-green"
                                aria-label="Hora Inicio"
                            />
                            <input
                                type="time"
                                value={newEnd}
                                onChange={e => setNewEnd(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-brand-green"
                                aria-label="Hora Fin (Opcional)"
                            />
                        </div>
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddBlock()}
                                placeholder="Descripción de la actividad..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
                            />
                            <button
                                onClick={handleAddBlock}
                                disabled={!newTitle}
                                className="bg-brand-green text-black p-2 rounded-lg hover:bg-brand-green/80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
