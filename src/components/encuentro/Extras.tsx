'use client';

// Actividades extra opcionales: el agente confirma sí o no a cada una al registrarse (o en Mi registro).
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Loader2, Tent } from 'lucide-react';
import { ecopil } from '@/lib/ecopil';

export const EXTRAS = [
    { k: 'temazcal', t: 'Temazcal', d: '21 dic, 8:00 · cupo de 20 lugares' },
    { k: 'acampada', t: 'Acampada en Ajolotequio', d: 'Noche del 20 dic' },
    { k: 'pajareada', t: 'Pajareada', d: '21 dic, en la mañana (para quien acampa)' },
] as const;
export type ClaveExtra = (typeof EXTRAS)[number]['k'];
export type Extras = Record<ClaveExtra, boolean | null>;
export const EXTRAS_VACIO: Extras = { temazcal: null, acampada: null, pajareada: null };
export const extrasCompletos = (x: Extras) => EXTRAS.every((e) => x[e.k] !== null);

export function guardarExtras(token: string, x: Extras) {
    return ecopil.rpc('encuentro_guardar_extras', { p_token: token, p_temazcal: x.temazcal, p_acampada: x.acampada, p_pajareada: x.pajareada });
}

export function SelectorExtras({ v, set }: { v: Extras; set: (x: Extras) => void }) {
    return (
        <div className="space-y-3">
            {EXTRAS.map((e) => (
                <div key={e.k} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--t-text)]">{e.t}</p>
                        <p className="text-xs text-[var(--t-text-muted)]">{e.d}</p>
                    </div>
                    {([[true, 'Sí'], [false, 'No']] as const).map(([val, t]) => (
                        <button type="button" key={t} onClick={() => set({ ...v, [e.k]: val })}
                            className={clsx('w-14 rounded-full border-2 py-1.5 text-sm font-bold', v[e.k] === val ? 'sticker bg-ecopil-sun text-ink' : 'border-[var(--t-border)] text-[var(--t-text-muted)]')}>{t}</button>
                    ))}
                </div>
            ))}
        </div>
    );
}

type Mis = { temazcal: boolean; acampada: boolean; pajareada: boolean; temazcal_lugar: boolean };

// Tarjeta en Mi registro: pide confirmar si falta, o muestra lo elegido con opción de cambiar.
export default function TarjetaExtras({ token, aprobado }: { token: string; aprobado: boolean }) {
    const [mis, setMis] = useState<Mis | null | undefined>(undefined);
    const [editando, setEditando] = useState(false);
    const [v, setV] = useState<Extras>(EXTRAS_VACIO);
    const [ocupado, setOcupado] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        ecopil.rpc('encuentro_mis_extras', { p_token: token }).then(({ data, error }) => setMis(error ? null : ((data as Mis) ?? null)));
    }, [token]);
    if (mis === undefined) return null;

    const abierto = editando || mis === null;
    return (
        <div className={clsx('sticker space-y-3 rounded-3xl p-4', mis === null ? 'bg-ecopil-sun text-ink' : 'bg-[var(--t-surface)]')}>
            <p className="flex items-center gap-2 font-display text-lg font-semibold"><Tent size={18} /> {mis === null ? 'Confirma las actividades extra' : 'Actividades extra'}</p>
            {!abierto && mis ? (
                <>
                    <ul className="space-y-1 text-sm">
                        {EXTRAS.map((e) => (
                            <li key={e.k}><b>{mis[e.k] ? 'Sí' : 'No'}</b> · {e.t}
                                {e.k === 'temazcal' && mis.temazcal && <span className="text-xs text-[var(--t-text-muted)]"> · {mis.temazcal_lugar ? 'lugar apartado' : aprobado ? 'sin lugar: cupo lleno' : 'se aparta al validar tu lugar, si hay cupo'}</span>}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => { setV({ temazcal: mis.temazcal, acampada: mis.acampada, pajareada: mis.pajareada }); setEditando(true); }}
                        className="text-xs font-bold underline text-[var(--t-text-muted)]">Cambiar</button>
                </>
            ) : (
                <form className="space-y-3" onSubmit={async (e) => {
                    e.preventDefault(); if (!extrasCompletos(v)) return;
                    setOcupado(true); setError('');
                    const { data, error } = await guardarExtras(token, v);
                    setOcupado(false);
                    if (error) return setError(error.message);
                    setMis(data as Mis); setEditando(false);
                }}>
                    {mis === null && <p className="text-sm">Son opcionales, pero necesitamos saber quién va para organizar comida, transporte y lugares.</p>}
                    <div className="rounded-2xl bg-[var(--t-surface)] p-3"><SelectorExtras v={v} set={setV} /></div>
                    {error && <p className="text-sm font-bold text-status-red">{error}</p>}
                    <button disabled={!extrasCompletos(v) || ocupado} className="font-futura w-full rounded-full bg-ink py-3 font-extrabold text-white disabled:opacity-50">
                        {ocupado ? <Loader2 className="mx-auto animate-spin" /> : 'Guardar'}
                    </button>
                </form>
            )}
        </div>
    );
}
