'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Clock, MapPin, WifiOff, Megaphone, Lightbulb } from 'lucide-react';
import Mixtli, { MixtliBubble } from '@/components/brand/Mixtli';
import { usePublico, ahoraHidalgo, diaCorto, DIAS, DIA_COLOR, SEDES } from '@/lib/encuentro';
import { PROGRAMA, type Bloque } from '@/data/programa-agentes';
import Temazcal from '@/components/encuentro/Temazcal';

const diasParaEmpezar = () => Math.ceil((Date.parse(`${DIAS[0]}T19:30:00-06:00`) - Date.now()) / 86400000);

function momentoDe(hm: string): Bloque['momento'] { return hm < '12:00' ? 'Mañana' : hm < '19:00' ? 'Tarde' : 'Noche'; }

function Ahora() {
    const { dia, hm } = ahoraHidalgo();
    if (dia < DIAS[0]) {
        const dias = diasParaEmpezar();
        return (
            <div className="relative sticker bg-ecopil-sun rounded-3xl p-5 text-ink overflow-hidden">
                <p className="text-xs font-extrabold uppercase tracking-wider">Faltan {dias} días</p>
                <p className="font-display text-2xl font-semibold leading-tight mt-1 max-w-[70%]">Nos vemos el 17 de diciembre, 19:30, en el Hotel City Express Tula</p>
                <Link href="/guia" className="inline-block mt-3 text-sm font-extrabold underline">Revisa qué llevar a cada sede</Link>
                <Mixtli pose="asoma" height={110} className="absolute -right-2 -bottom-2" />
            </div>
        );
    }
    const hoy = PROGRAMA.find((p) => p.dia === dia);
    if (!hoy) return null;
    // Sin horas exactas: solo el momento del día y la próxima hora clave.
    const m = momentoDe(hm);
    const bloque = hoy.bloques.find((b) => b.momento === m) ?? hoy.bloques[hoy.bloques.length - 1];
    const sigue = hoy.horas.find((h) => !h.aprox && h.hora > hm);
    return (
        <div className={clsx('sticker rounded-3xl p-5 text-ink space-y-3', DIA_COLOR[dia] ?? 'bg-ecopil-leaf')}>
            <p className="text-xs font-extrabold uppercase tracking-wider">Hoy · {hoy.titulo}</p>
            <div>
                <p className="font-display text-2xl font-semibold leading-tight">Esta {m.toLowerCase()}</p>
                <p className="text-sm font-semibold">{bloque.texto}</p>
            </div>
            {sigue && (
                <div className="rounded-2xl bg-white/60 p-3">
                    <p className="text-[11px] font-extrabold uppercase">Ten presente</p>
                    <p className="font-bold">{sigue.hora} · {sigue.que}</p>
                </div>
            )}
        </div>
    );
}

export default function ProgramaPage() {
    const { datos, sinConexion } = usePublico();
    const hoy = ahoraHidalgo().dia;
    const [dia, setDia] = useState(DIAS.includes(hoy) ? hoy : DIAS[1]);
    const p = PROGRAMA.find((x) => x.dia === dia)!;

    return (
        <div className="theme-surface min-h-screen bg-[var(--t-bg)] pb-28 pt-4 space-y-5">
            {sinConexion && (
                <p className="flex items-center gap-2 text-xs font-bold text-[var(--t-text-muted)]"><WifiOff size={14} /> Sin señal: mostrando lo último guardado</p>
            )}

            <Ahora />

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

            <section className="space-y-4">
                <div>
                    <h2 className="font-display text-2xl font-semibold text-[var(--t-text)] leading-tight">{p.titulo}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-1 text-xs font-bold text-[var(--t-text-muted)]">
                        <MapPin size={13} /> {p.sedes.map((k) => SEDES[k]).join(' · ')}
                    </p>
                </div>

                <div className="rounded-2xl border-2 border-[var(--t-border)] bg-[var(--t-surface)] p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--t-text-muted)]"><Clock size={14} /> Horas para organizarte</p>
                    <ul className="space-y-1.5">
                        {p.horas.map((h) => (
                            <li key={h.hora + h.que} className="flex gap-3 text-sm text-[var(--t-text)]">
                                <span className="w-16 shrink-0 font-extrabold tabular-nums">{h.aprox ? `~${h.hora}` : h.hora}</span>
                                <span>{h.que}{h.aprox ? ' (aprox.)' : ''}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <ol className="space-y-3">
                    {p.bloques.map((b) => (
                        <li key={b.momento} className="flex gap-3">
                            <span className={clsx('font-futura mt-0.5 h-fit w-20 shrink-0 text-center rounded-full border-2 border-[var(--t-ink)] px-3 py-1 text-xs font-extrabold text-ink', DIA_COLOR[dia])}>{b.momento}</span>
                            <p className="text-sm leading-relaxed text-[var(--t-text-secondary)]">{b.texto}</p>
                        </li>
                    ))}
                </ol>

                {dia === '2026-12-20' && <Temazcal />}

                {p.tip && (
                    <p className="flex gap-2 rounded-2xl bg-[var(--t-surface-2)] p-3 text-sm text-[var(--t-text)]"><Lightbulb size={18} className="shrink-0 text-ecopil-orange" /> {p.tip}</p>
                )}

                <MixtliBubble>Los horarios pueden moverse un poco; si algo cambia, te avisamos aquí arriba.</MixtliBubble>
                <Link href="/guia" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--t-accent)]"><MapPin size={14} /> Qué llevar y cómo es cada sede</Link>
            </section>
        </div>
    );
}
