'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Bus, Utensils, Sparkles, Wrench, MapPin, Navigation, WifiOff, Megaphone, ChevronDown } from 'lucide-react';
import Mixtli, { MixtliBubble } from '@/components/brand/Mixtli';
import { usePublico, ahoraHidalgo, rango, diaCorto, DIAS, DIA_COLOR, SEDES, type Actividad } from '@/lib/encuentro';

const ICONO = { traslado: Bus, comida: Utensils, taller: Wrench, actividad: Sparkles, logistica: Sparkles, preparacion: Sparkles };

function Ahora({ actividades }: { actividades: Actividad[] }) {
    const { dia, hm } = ahoraHidalgo();
    if (dia < DIAS[0]) {
        const dias = Math.ceil((Date.parse(`${DIAS[0]}T19:30:00-06:00`) - Date.now()) / 86400000);
        return (
            <div className="relative sticker bg-ecopil-sun rounded-3xl p-5 text-ink overflow-hidden">
                <p className="text-xs font-extrabold uppercase tracking-wider">Faltan {dias} días</p>
                <p className="font-display text-2xl font-semibold leading-tight mt-1 max-w-[70%]">Nos vemos el 17 de diciembre, 19:30, en el Hotel City Express Tula</p>
                <Link href="/guia" className="inline-block mt-3 text-sm font-extrabold underline">Revisa qué llevar a cada sede</Link>
                <Mixtli pose="asoma" height={110} className="absolute -right-2 -bottom-2" />
            </div>
        );
    }
    if (dia > DIAS[DIAS.length - 1]) return null;
    const hoy = actividades.filter((a) => a.dia === dia && a.inicio);
    const actual = [...hoy].reverse().find((a) => a.inicio! <= hm && (!a.fin || a.fin > hm));
    const siguiente = hoy.find((a) => a.inicio! > hm);
    return (
        <div className={clsx('sticker rounded-3xl p-5 text-ink space-y-3', DIA_COLOR[dia] ?? 'bg-ecopil-leaf')}>
            <p className="text-xs font-extrabold uppercase tracking-wider">Ahora · {hm}</p>
            {actual ? (
                <div>
                    <p className="font-display text-2xl font-semibold leading-tight">{actual.titulo}</p>
                    <p className="text-sm font-bold">{rango(actual)}{actual.sede ? ` · ${SEDES[actual.sede]}` : ''}</p>
                </div>
            ) : <p className="font-display text-xl font-semibold">Tiempo libre</p>}
            {siguiente && (
                <div className="rounded-2xl bg-white/60 p-3">
                    <p className="text-[11px] font-extrabold uppercase">Sigue a las {siguiente.inicio!.slice(0, 5)}</p>
                    <p className="font-bold">{siguiente.titulo}</p>
                </div>
            )}
        </div>
    );
}

export default function ProgramaPage() {
    const { datos, sinConexion } = usePublico();
    const hoy = ahoraHidalgo().dia;
    const [dia, setDia] = useState(DIAS.includes(hoy) ? hoy : DIAS[1]);
    const [abierta, setAbierta] = useState<string | null>(null);
    const actividades = useMemo(() => datos?.actividades ?? [], [datos]);
    const delDia = actividades.filter((a) => a.dia === dia);

    return (
        <div className="theme-surface min-h-screen bg-[var(--t-bg)] pb-28 pt-4 space-y-5">
            {sinConexion && (
                <p className="flex items-center gap-2 text-xs font-bold text-[var(--t-text-muted)]"><WifiOff size={14} /> Sin señal: mostrando lo último guardado</p>
            )}

            <Ahora actividades={actividades} />

            {datos?.avisos.map((a) => (
                <div key={a.id} className={clsx('rounded-2xl border-2 p-3 flex gap-3 text-sm',
                    a.nivel === 'urgente' ? 'border-ecopil-red bg-ecopil-red/10' : 'border-[var(--t-border)] bg-[var(--t-surface)]')}>
                    <Megaphone size={18} className={a.nivel === 'urgente' ? 'text-ecopil-red' : 'text-ecopil-orange'} />
                    <p className="text-[var(--t-text)]">{a.texto}</p>
                </div>
            ))}

            <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
                {DIAS.map((d) => (
                    <button key={d} onClick={() => setDia(d)}
                        className={clsx('font-futura shrink-0 rounded-2xl px-4 py-2 text-sm font-extrabold border-2',
                            d === dia ? `sticker ${DIA_COLOR[d]} text-ink` : 'border-[var(--t-border)] text-[var(--t-text-muted)]')}>
                        {diaCorto(d)}
                    </button>
                ))}
            </div>

            {!datos && <MixtliBubble>Cargando el programa…</MixtliBubble>}

            <ol className="relative space-y-3 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--t-border)]">
                {delDia.map((a) => {
                    const Icono = ICONO[a.tipo] ?? Sparkles;
                    const open = abierta === a.id;
                    return (
                        <li key={a.id} className="relative flex gap-3">
                            <div className={clsx('z-10 mt-1 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-[var(--t-ink)] text-ink',
                                a.tipo === 'traslado' ? 'bg-[var(--t-surface-2)]' : DIA_COLOR[dia])}>
                                <Icono size={16} />
                                <span className="text-[11px] font-extrabold">{a.inicio?.slice(0, 5) ?? '—'}</span>
                            </div>
                            <button onClick={() => setAbierta(open ? null : a.id)}
                                className="flex-1 text-left rounded-2xl bg-[var(--t-surface)] border-2 border-[var(--t-border)] p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-bold text-[var(--t-text)] leading-snug">{a.titulo}{a.grupo ? <span className="ml-1.5 rounded-full bg-ecopil-sun px-2 text-[10px] font-extrabold text-ink">Grupo {a.grupo}</span> : null}</p>
                                        <p className="text-xs text-[var(--t-text-muted)] mt-0.5">{rango(a)}{a.sede ? ` · ${SEDES[a.sede]}` : ''}</p>
                                    </div>
                                    {(a.descripcion || a.destino_url) && <ChevronDown size={16} className={clsx('shrink-0 text-[var(--t-text-faint)] transition-transform', open && 'rotate-180')} />}
                                </div>
                                {open && (
                                    <div className="mt-2 space-y-2 text-sm text-[var(--t-text-secondary)]">
                                        {a.descripcion && <p>{a.descripcion}</p>}
                                        {a.destino_url && (
                                            <a href={a.destino_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 font-bold text-[var(--t-accent)]"><Navigation size={14} /> Cómo llegar</a>
                                        )}
                                        {a.sede && <Link href="/guia" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 font-bold text-[var(--t-accent)]"><MapPin size={14} /> Ver la sede en la guía</Link>}
                                    </div>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
