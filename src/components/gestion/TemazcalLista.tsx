'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type P = { nombre: string; nodo: string; telefono: string | null; created_at: string };

export default function TemazcalLista({ token }: { token: string }) {
    const [lista, setLista] = useState<P[] | null>(null);
    useEffect(() => { supabase.rpc('gestor_temazcal', { p_token: token }).then(({ data }) => setLista((data as P[]) ?? [])); }, [token]);
    if (!lista) return null;
    return (
        <div className="rounded-2xl border-2 border-gray-800 bg-gray-900 p-3">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><Flame size={16} className="text-ecopil-orange" /> Temazcal 20 dic · {lista.length}/20</p>
            {lista.length === 0 ? <p className="text-xs text-gray-400">Nadie se ha apuntado todavía.</p> : (
                <ol className="space-y-1 text-xs text-gray-300">
                    {lista.map((p, i) => <li key={i}>{i + 1}. {p.nombre} <span className="text-gray-500">· {p.nodo}{p.telefono ? ` · ${p.telefono}` : ''}</span></li>)}
                </ol>
            )}
        </div>
    );
}
