'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { ChevronDown, Navigation, Map as MapIcon, Check, Sparkles, Backpack, BookOpen, Wifi, Lightbulb } from 'lucide-react';
import Mixtli from '@/components/brand/Mixtli';
import { GUIA, type SedeGuia } from '@/data/guia-sedes';
import { usePublico, ahoraHidalgo } from '@/lib/encuentro';

const DIAS = [17, 18, 19, 20, 21];
const CHECK_KEY = 'guia_checklist';
const TRIVIA_KEY = 'guia_trivia';

function leer<T>(k: string, d: T): T { try { return JSON.parse(localStorage.getItem(k) || '') as T; } catch { return d; } }
function guardar(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin storage */ } }

function Seccion({ titulo, icono: Icono, abierta, toggle, extra, children }: {
    titulo: string; icono: typeof Check; abierta: boolean; toggle: () => void; extra?: React.ReactNode; children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border-2 border-[var(--t-border)] bg-[var(--t-surface)]">
            <button type="button" onClick={toggle} className="flex w-full items-center gap-2 p-3 text-left">
                <Icono size={16} className="text-[var(--t-accent)]" />
                <span className="font-futura flex-1 text-sm font-extrabold">{titulo}</span>
                {extra}
                <ChevronDown size={16} className={clsx('text-[var(--t-text-faint)] transition-transform', abierta && 'rotate-180')} />
            </button>
            {abierta && <div className="px-3 pb-3 text-sm leading-relaxed text-[var(--t-text-secondary)]">{children}</div>}
        </div>
    );
}

function Trivia({ s, hecha, marcar }: { s: SedeGuia; hecha: boolean; marcar: () => void }) {
    const ops = useMemo(() => s.trivia.o.map((t, i) => ({ t, ok: i === 0 })).sort((a, b) => a.t.localeCompare(b.t)), [s]);
    const [elegida, setElegida] = useState<string | null>(null);
    const mostrar = elegida !== null || hecha;
    return (
        <div className="sticker rounded-2xl bg-ecopil-sun p-4 text-ink">
            <p className="font-futura text-[10px] font-extrabold uppercase tracking-wider">Reto de Mixtli</p>
            <p className="mt-1 font-bold leading-snug">{s.trivia.p}</p>
            <div className="mt-2 grid gap-1.5">
                {ops.map((o) => (
                    <button key={o.t} type="button" disabled={mostrar}
                        onClick={() => { setElegida(o.t); if (o.ok) marcar(); }}
                        className={clsx('rounded-xl border-2 border-ink px-3 py-1.5 text-left text-xs font-bold transition-colors',
                            !mostrar ? 'bg-white/70 active:bg-white' : o.ok ? 'bg-brand-green' : elegida === o.t ? 'bg-ecopil-red/40' : 'bg-white/40 opacity-60')}>
                        {o.t}
                    </button>
                ))}
            </div>
            {mostrar && (
                <p className="mt-2 text-xs font-semibold">
                    {elegida && !ops.find((o) => o.t === elegida)?.ok ? 'Casi. ' : '¡Bien! '}{s.trivia.dato}
                </p>
            )}
        </div>
    );
}

function SedeCard({ s, llegar, checks, toggleCheck, triviaHecha, marcarTrivia }: {
    s: SedeGuia; llegar?: string; checks: string[]; toggleCheck: (item: string) => void; triviaHecha: boolean; marcarTrivia: () => void;
}) {
    const [abierta, setAbierta] = useState<string | null>('haremos');
    const t = (k: string) => setAbierta(abierta === k ? null : k);
    const listos = s.llevar.filter((i) => checks.includes(`${s.slug}:${i}`)).length;
    const ciencia = [['Historia', s.historia], ['Rocas y agua', s.geologia], ['Plantas y animales', s.biologia]].filter(([, v]) => v) as [string, string][];
    const serv = [['Baños', s.servicios.banos], ['Señal', s.servicios.senal], ['Comida', s.servicios.comida], ['Acceso', s.servicios.acceso]].filter(([, v]) => v) as [string, string][];
    const mapa = llegar ?? `https://www.google.com/maps/dir/?api=1&destination=${s.coords[0]},${s.coords[1]}`;

    return (
        <article className="overflow-hidden rounded-3xl border-2 border-[var(--t-border)] bg-[var(--t-surface-2)]">
            <div className="relative h-48 bg-[var(--t-accent-tint-bg)]">
                {s.foto ? <Image src={s.foto} alt={s.nombre} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    : s.logo ? <Image src={s.logo} alt={s.nombre} fill sizes="50vw" className="object-contain p-10" /> : null}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                    <h2 className="font-display text-2xl font-semibold leading-tight text-white">{s.nombre}</h2>
                    <p className="font-futura text-[11px] font-bold text-white/85">{s.altitud} · {s.temp} · {s.clima}</p>
                </div>
            </div>

            <div className="space-y-2.5 p-4">
                <p className="text-sm leading-relaxed text-[var(--t-text)]">{s.resumen}</p>
                <div className="flex gap-2">
                    <a href={mapa} target="_blank" rel="noreferrer" className="sticker inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-green px-3 py-2 text-xs font-extrabold text-ink">
                        <Navigation size={14} /> Cómo llegar
                    </a>
                    <a href="/mapa" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-[var(--t-border)] bg-[var(--t-surface)] px-3 py-2 text-xs font-extrabold">
                        <MapIcon size={14} /> Ver en el mapa
                    </a>
                </div>

                <Seccion titulo="Qué haremos" icono={Sparkles} abierta={abierta === 'haremos'} toggle={() => t('haremos')}>
                    <ul className="space-y-1">{s.haremos.map((h) => <li key={h} className="flex gap-2"><span className="text-[var(--t-accent)]">•</span>{h}</li>)}</ul>
                </Seccion>

                <Seccion titulo="Qué llevar" icono={Backpack} abierta={abierta === 'llevar'} toggle={() => t('llevar')}
                    extra={<span className={clsx('rounded-full px-2 text-[10px] font-extrabold', listos === s.llevar.length ? 'bg-brand-green text-ink' : 'bg-[var(--t-surface-2)]')}>{listos}/{s.llevar.length}</span>}>
                    <p className="mb-2 text-xs text-[var(--t-text-muted)]">Palomea lo que ya tienes en la mochila.</p>
                    <ul className="space-y-1.5">
                        {s.llevar.map((i) => {
                            const ok = checks.includes(`${s.slug}:${i}`);
                            return (
                                <li key={i}>
                                    <button type="button" onClick={() => toggleCheck(`${s.slug}:${i}`)} className="flex w-full items-start gap-2 text-left">
                                        <span className={clsx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2', ok ? 'border-brand-green bg-brand-green text-ink' : 'border-[var(--t-border)]')}>
                                            {ok && <Check size={13} strokeWidth={3} />}
                                        </span>
                                        <span className={clsx(ok && 'line-through opacity-60')}>{i}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {s.ojo && <p className="mt-3 rounded-xl border-2 border-ecopil-orange bg-ecopil-sun/25 p-2 text-xs font-semibold text-[var(--t-text)]">Ojo: {s.ojo}</p>}
                </Seccion>

                {serv.length > 0 && (
                    <Seccion titulo="Servicios" icono={Wifi} abierta={abierta === 'serv'} toggle={() => t('serv')}>
                        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">{serv.map(([k, v]) => <Fragment key={k}><dt className="font-bold">{k}</dt><dd>{v}</dd></Fragment>)}</dl>
                    </Seccion>
                )}

                {ciencia.length > 0 && (
                    <Seccion titulo="Para saber más" icono={BookOpen} abierta={abierta === 'ciencia'} toggle={() => t('ciencia')}>
                        <div className="space-y-2">{ciencia.map(([k, v]) => <p key={k}><b className="text-[var(--t-text)]">{k}.</b> {v}</p>)}</div>
                    </Seccion>
                )}

                <Trivia s={s} hecha={triviaHecha} marcar={marcarTrivia} />
            </div>
        </article>
    );
}

export default function GuiaPage() {
    const hoy = Number(ahoraHidalgo().dia.slice(8, 10));
    const enEvento = ahoraHidalgo().dia.startsWith('2026-12') && DIAS.includes(hoy);
    const [dia, setDia] = useState(enEvento ? hoy : 18);
    const [checks, setChecks] = useState<string[]>([]);
    const [trivias, setTrivias] = useState<string[]>([]);
    const { datos } = usePublico();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leer localStorage tras hidratar
    useEffect(() => { setChecks(leer(CHECK_KEY, [])); setTrivias(leer(TRIVIA_KEY, [])); }, []);

    // "Cómo llegar": el enlace que el staff puso en el cronograma, si hay
    const llegar = useMemo(() => {
        const m: Record<string, string> = {};
        (datos?.actividades ?? []).forEach((a) => { if (a.sede && a.destino_url && !m[a.sede]) m[a.sede] = a.destino_url; });
        return m;
    }, [datos]);

    const toggleCheck = (k: string) => setChecks((c) => { const n = c.includes(k) ? c.filter((x) => x !== k) : [...c, k]; guardar(CHECK_KEY, n); return n; });
    const marcarTrivia = (slug: string) => setTrivias((t) => { if (t.includes(slug)) return t; const n = [...t, slug]; guardar(TRIVIA_KEY, n); return n; });
    const sedes = GUIA.filter((s) => s.dias.includes(dia));

    return (
        <div className="theme-surface min-h-screen bg-[var(--t-bg)] pb-28 pt-4 text-[var(--t-text)]">
            <header className="sticker mb-4 flex items-center gap-2 rounded-3xl bg-[var(--t-surface)] p-4 pr-2">
                <div className="flex-1">
                    <h1 className="font-display text-3xl font-semibold leading-none">Guía de sedes</h1>
                    <p className="mt-2 text-sm text-[var(--t-text-muted)]">Qué haremos en cada lugar, qué llevar y cómo llegar. Resuelve los retos de Mixtli.</p>
                    <p className="font-futura mt-2 text-xs font-extrabold text-[var(--t-accent)]">Retos resueltos: {trivias.length}/{GUIA.length}</p>
                </div>
                <Mixtli pose="lupa" height={96} className="shrink-0" />
            </header>

            <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {DIAS.map((d) => (
                    <button key={d} type="button" onClick={() => setDia(d)}
                        className={clsx('font-futura shrink-0 rounded-full border-2 px-5 py-2 text-sm font-bold uppercase tracking-wider',
                            dia === d ? 'sticker bg-brand-green text-ink' : 'border-[var(--t-border)] bg-[var(--t-surface)] text-[var(--t-text-faint)]')}>
                        {d} dic
                    </button>
                ))}
            </div>

            {dia === 17 ? (
                <div className="sticker flex items-center gap-3 rounded-3xl bg-ecopil-leaf p-5 text-ink">
                    <div className="flex-1">
                        <p className="font-display text-xl font-semibold leading-tight">Día de llegada</p>
                        <p className="mt-1 text-sm">Bienvenida a las 19:30 en el Hotel City Express Tula, nuestra base hasta el 20. Las sedes de campo empiezan el 18.</p>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=20.0431598,-99.2609751`} target="_blank" rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-sm font-extrabold underline"><Navigation size={14} /> Cómo llegar al hotel</a>
                    </div>
                    <Mixtli pose="asoma" height={90} className="shrink-0" />
                </div>
            ) : (
                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                    {sedes.map((s) => (
                        <SedeCard key={s.slug} s={s} llegar={llegar[s.slug]} checks={checks} toggleCheck={toggleCheck}
                            triviaHecha={trivias.includes(s.slug)} marcarTrivia={() => marcarTrivia(s.slug)} />
                    ))}
                </div>
            )}

            <p className="mt-6 flex items-start gap-2 text-xs text-[var(--t-text-faint)]"><Lightbulb size={14} className="shrink-0" /> Tu lista y tus retos se guardan en este celular.</p>
        </div>
    );
}
