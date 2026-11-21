'use client';

// Ranking del juego de Mixtli: mejor partida válida de cada agente registrado (para el regalo del cierre).
import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Fila = {
    registro_id: string; nombre: string; nodo: string; estado: string; pesos: number; metros: number; aciertos: number;
    con_preguntas: boolean; segundos: number; fin: string; partidas: number; sospechosas: number;
};
const min = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function RankingJuego({ token }: { token: string }) {
    const [filas, setFilas] = useState<Fila[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const cargar = useCallback(() => supabase.rpc('gestor_juego', { p_token: token }).then(({ data, error }) => {
        if (error) setError(/gestor_juego/.test(error.message) ? 'Falta correr juego_partidas.sql en Supabase.' : error.message);
        else { setError(null); setFilas((data as Fila[]) ?? []); }
    }), [token]);
    useEffect(() => { cargar(); }, [cargar]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg text-white"><Trophy size={18} className="text-ecopil-sun" /> Juego de Mixtli</h2>
                <button type="button" onClick={cargar} className="rounded-full border-2 border-gray-700 p-1.5 text-gray-300" aria-label="Actualizar"><RefreshCw size={14} /></button>
            </div>
            <p className="text-xs text-gray-400">Mejor partida de cada agente registrado. El servidor mide el tiempo de cada partida y descarta puntajes imposibles; si una persona tiene partidas descartadas aparece marcada para revisarla.</p>
            {error && <p className="rounded-xl bg-ecopil-red/20 p-3 text-sm text-ecopil-red">{error}</p>}
            {!filas && !error && <Loader2 className="mx-auto animate-spin text-gray-400" />}
            {filas && !filas.length && <p className="text-sm text-gray-400">Todavía nadie registrado ha jugado.</p>}
            {filas?.map((f, i) => (
                <div key={f.registro_id} className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${i === 0 ? 'border-ecopil-sun bg-ecopil-sun/10' : 'border-gray-800 bg-gray-900'}`}>
                    <span className="w-7 text-center font-display text-xl text-white tabular-nums">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{f.nombre} <span className="font-normal text-gray-400">· {f.nodo}</span></p>
                        <p className="text-[11px] text-gray-400">
                            {f.metros} m · {f.con_preguntas ? `${f.aciertos} aciertos` : 'sin preguntas'} · duró {min(f.segundos)} · {f.partidas} partidas
                            {f.estado !== 'aprobado' && <span className="text-ecopil-sun"> · registro {f.estado}</span>}
                            {f.sospechosas > 0 && <span className="text-ecopil-red"> · {f.sospechosas} descartadas</span>}
                        </p>
                    </div>
                    <span className="font-display text-xl text-ecopil-sun tabular-nums">E$ {f.pesos}</span>
                </div>
            ))}
        </div>
    );
}
