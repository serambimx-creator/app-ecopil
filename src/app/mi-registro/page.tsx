'use client';

import Temazcal from '@/components/encuentro/Temazcal';
import CartaCompromiso from '@/components/encuentro/CartaCompromiso';
import { Suspense, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { Loader2, Check, Clock, XCircle, Copy, Share2, CalendarDays, Map, BookOpen, Star, ChevronDown } from 'lucide-react';
import { ecopil, TOKEN_KEY, type MiRegistro } from '@/lib/ecopil';
import { ahoraHidalgo, diaCorto } from '@/lib/encuentro';
import Mixtli, { MixtliBubble } from '@/components/brand/Mixtli';

const ESTADO = {
    pendiente: { t: 'En revisión', c: 'bg-ecopil-sun text-ink', i: Clock },
    aprobado: { t: 'Aprobado', c: 'bg-brand-green text-ink', i: Check },
    rechazado: { t: 'No aprobado', c: 'bg-status-red text-white', i: XCircle },
} as const;

// La encuesta se abre el último día del Encuentro o en cuanto la persona tenga asistencias.
const ENCUESTA_DESDE = '2026-12-20';

function Encuesta({ token, previa, listo }: { token: string; previa: MiRegistro['encuesta']; listo: () => void }) {
    const [f, setF] = useState({ calificacion: previa?.calificacion ?? 0, lo_mejor: previa?.lo_mejor ?? '', mejorar: previa?.mejorar ?? '', compromiso: previa?.compromiso ?? '', volveria: previa?.volveria ?? null as boolean | null });
    const [ocupado, setOcupado] = useState(false);
    const ta = 'w-full rounded-2xl border-2 border-[var(--t-border)] bg-[var(--t-bg)] px-3 py-2 text-sm text-[var(--t-text)] focus:outline-none focus:border-brand-green';
    return (
        <form className="space-y-3" onSubmit={async (e) => {
            e.preventDefault(); setOcupado(true);
            await ecopil.rpc('encuentro_encuesta', { p_token: token, p_calificacion: f.calificacion || null, p_lo_mejor: f.lo_mejor, p_mejorar: f.mejorar, p_compromiso: f.compromiso, p_volveria: f.volveria });
            setOcupado(false); listo();
        }}>
            <div>
                <p className="mb-1 text-sm font-bold">¿Cómo calificas el Encuentro?</p>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button type="button" key={n} onClick={() => setF({ ...f, calificacion: n })} aria-label={`${n} estrellas`}>
                            <Star size={30} className={n <= f.calificacion ? 'fill-ecopil-sun text-ink' : 'text-[var(--t-border)]'} />
                        </button>
                    ))}
                </div>
            </div>
            <label className="block text-sm font-bold">¿Qué fue lo mejor?<textarea rows={2} className={ta} value={f.lo_mejor} onChange={(e) => setF({ ...f, lo_mejor: e.target.value })} /></label>
            <label className="block text-sm font-bold">¿Qué mejorarías?<textarea rows={2} className={ta} value={f.mejorar} onChange={(e) => setF({ ...f, mejorar: e.target.value })} /></label>
            <label className="block text-sm font-bold">¿Qué te llevas para aplicar en tu nodo?<textarea rows={2} className={ta} value={f.compromiso} onChange={(e) => setF({ ...f, compromiso: e.target.value })} /></label>
            <div>
                <p className="mb-1 text-sm font-bold">¿Volverías al próximo Encuentro?</p>
                <div className="flex gap-2">
                    {([[true, 'Sí'], [false, 'No']] as const).map(([v, t]) => (
                        <button type="button" key={t} onClick={() => setF({ ...f, volveria: v })}
                            className={clsx('flex-1 rounded-full border-2 py-2 text-sm font-bold', f.volveria === v ? 'sticker bg-ecopil-sun text-ink' : 'border-[var(--t-border)]')}>{t}</button>
                    ))}
                </div>
            </div>
            <button disabled={ocupado || !f.calificacion} className="font-futura sticker w-full rounded-full bg-brand-green py-3 font-extrabold text-ink disabled:opacity-50">
                {ocupado ? <Loader2 className="mx-auto animate-spin" /> : previa ? 'Actualizar respuestas' : 'Enviar'}
            </button>
        </form>
    );
}

function MiRegistroContenido() {
    const params = useSearchParams();
    const [token, setToken] = useState<string | null>(null);
    const [registro, setRegistro] = useState<MiRegistro | null | undefined>(undefined);
    const [copiado, setCopiado] = useState(false);
    const [qr, setQr] = useState('');
    const [verEncuesta, setVerEncuesta] = useState(false);
    const nuevo = params.get('nuevo') === '1';

    const cargar = async (t: string) => {
        const r3 = await ecopil.rpc('encuentro_mi_registro3', { p_token: t });
        if (!r3.error) return setRegistro((r3.data as MiRegistro) ?? null);
        const r2 = await ecopil.rpc('encuentro_mi_registro2', { p_token: t }); // antes de indicadores.sql
        setRegistro(Array.isArray(r2.data) && r2.data[0] ? (r2.data[0] as MiRegistro) : null);
    };

    // QR del gafete: al escanearlo, el staff abre a esta persona en su panel y pasa lista.
    useEffect(() => {
        if (registro?.estado !== 'aprobado') return;
        QRCode.toDataURL(`${window.location.origin}/gestion?r=${encodeURIComponent(registro.email)}`, { margin: 1, width: 360 }).then(setQr);
    }, [registro]);

    useEffect(() => {
        let t = params.get('t');
        try {
            if (t) localStorage.setItem(TOKEN_KEY, t);
            else t = localStorage.getItem(TOKEN_KEY);
        } catch { /* sin storage */ }
        setToken(t);
        if (!t) { setRegistro(null); return; }
        cargar(t);
    }, [params]);

    const enlace = token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/mi-registro?t=${token}` : '';
    const copiar = async () => { try { await navigator.clipboard.writeText(enlace); setCopiado(true); } catch { /* sin portapapeles */ } };

    if (registro === undefined) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--t-text-faint)]" /></div>;

    if (registro === null) {
        return (
            <div className="text-center space-y-4 py-10">
                <Mixtli pose="lupa" height={130} className="mx-auto" />
                <p className="font-display text-2xl font-semibold text-[var(--t-text)]">No encontré tu registro</p>
                <p className="text-sm text-[var(--t-text-muted)] px-6">Abre el enlace personal que guardaste al registrarte, o regístrate si aún no lo haces.</p>
                <Link href="/registro" className="font-futura sticker inline-block bg-brand-green text-ink font-extrabold px-6 py-3 rounded-full">Registrarme</Link>
            </div>
        );
    }

    const est = ESTADO[registro.estado];
    const aprobado = registro.estado === 'aprobado';
    const asis = registro.asistencias ?? [];
    const encuestaAbierta = aprobado && token && (ahoraHidalgo().dia >= ENCUESTA_DESDE || asis.length > 0);

    return (
        <div className="space-y-4 text-[var(--t-text)]">
            {nuevo && <MixtliBubble className="text-sm">¡Listo! Guarda este enlace: es tu acceso a tu perfil del Encuentro. Falta un paso: acepta tu carta compromiso aquí abajo.</MixtliBubble>}

            {/* Encabezado */}
            <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={registro.foto_url} alt="" className="sticker h-20 w-20 shrink-0 rounded-full object-cover" />
                <div className="min-w-0">
                    <p className="font-display text-2xl font-semibold leading-tight text-[var(--t-text)]">{registro.nombre}</p>
                    <p className="text-sm text-[var(--t-text-muted)]">Nodo {registro.nodo}{registro.ciudad ? ` · ${registro.ciudad}` : ''}</p>
                    <span className={clsx('font-futura mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold', est.c)}>
                        <est.i size={12} /> {est.t}{aprobado && registro.grupo ? ` · Grupo ${registro.grupo}` : ''}
                    </span>
                </div>
            </div>

            {registro.estado === 'pendiente' && (
                <div className="sticker rounded-3xl bg-[var(--t-surface)] p-4 text-sm text-[var(--t-text-secondary)]">
                    Recibimos tu registro. El staff de Pachuca–Tulancingo lo valida en cuanto aceptes tu carta compromiso; aquí verás cuando quede aprobado.
                </div>
            )}
            {registro.estado !== 'rechazado' && token && <CartaCompromiso token={token} nombre={registro.nombre} />}
            {registro.estado === 'rechazado' && (
                <div className="sticker rounded-3xl bg-[var(--t-surface)] p-4 text-sm text-[var(--t-text-secondary)]">
                    Tu registro no fue aprobado. Si crees que es un error, escribe al staff del Encuentro.
                </div>
            )}

            {aprobado && !registro.confirmado_en && (
                <div className="sticker rounded-3xl bg-ecopil-sun p-4 text-ink space-y-2">
                    <p className="font-display text-xl font-semibold">¿Nos vemos en Hidalgo?</p>
                    <p className="text-sm">Confírmalo para que contemos tu lugar, comidas y traslados.</p>
                    <button onClick={async () => {
                        const { data } = await ecopil.rpc('encuentro_confirmar', { p_token: token });
                        if (data) setRegistro({ ...registro, confirmado_en: new Date().toISOString() });
                    }} className="font-futura w-full rounded-full bg-ink py-3 font-extrabold text-white">Confirmo que voy</button>
                </div>
            )}

            {/* Gafete */}
            {qr && (
                <div className="sticker relative overflow-hidden rounded-[28px] bg-brand-green p-5 text-ink">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-futura text-[10px] font-extrabold uppercase tracking-[0.2em]">Gafete · Encuentro Nacional 2026</p>
                            <p className="font-display mt-1 text-2xl font-semibold leading-tight">{registro.nombre}</p>
                            <p className="text-sm font-bold">Nodo {registro.nodo}{registro.grupo ? ` · Grupo ${registro.grupo}` : ''}</p>
                            {registro.confirmado_en && <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 text-[11px] font-extrabold"><Check size={12} /> Asistencia confirmada</p>}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qr} alt="Código QR del gafete" className="h-28 w-28 shrink-0 rounded-2xl border-2 border-ink bg-white p-1" />
                    </div>
                    <p className="mt-3 text-xs font-semibold">Muestra el QR al staff en cada actividad para pasar lista.</p>
                </div>
            )}

            {/* Accesos */}
            {aprobado && (
                <div className="grid grid-cols-3 gap-2">
                    {[['/programa', 'Programa', CalendarDays], ['/mapa', 'Mapa', Map], ['/guia', 'Guía', BookOpen]].map(([href, t, I]) => {
                        const Icon = I as typeof Map;
                        return (
                            <Link key={href as string} href={href as string} className="sticker flex flex-col items-center gap-1 rounded-2xl bg-[var(--t-surface)] py-3 text-xs font-bold">
                                <Icon size={20} /> {t as string}
                            </Link>
                        );
                    })}
                </div>
            )}

            {aprobado && token && <Temazcal token={token} />}

            {/* Pasaporte: actividades con asistencia */}
            {aprobado && asis.length > 0 && (
                <div className="sticker rounded-3xl bg-[var(--t-surface)] p-4 space-y-2">
                    <p className="font-futura text-[11px] font-extrabold uppercase tracking-wider text-[var(--t-text-faint)]">Tu pasaporte · {asis.length} actividades</p>
                    <div className="flex flex-wrap gap-1.5">
                        {asis.map((a, i) => (
                            <span key={i} className="rounded-full bg-ecopil-leaf/50 px-2.5 py-1 text-xs font-semibold text-[var(--t-text)]">{diaCorto(a.dia)} · {a.titulo}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Encuesta */}
            {encuestaAbierta && (
                <div className="sticker rounded-3xl bg-[var(--t-surface)] p-4 space-y-3">
                    <button onClick={() => setVerEncuesta(!verEncuesta)} className="flex w-full items-center justify-between text-left">
                        <span>
                            <span className="font-display block text-xl font-semibold">Cuéntanos cómo te fue</span>
                            <span className="text-xs text-[var(--t-text-muted)]">{registro.encuesta ? 'Ya respondiste, gracias. Puedes corregir.' : '1 minuto. Nos ayuda a mejorar el próximo Encuentro.'}</span>
                        </span>
                        <ChevronDown className={clsx('transition-transform', verEncuesta && 'rotate-180')} />
                    </button>
                    {verEncuesta && <Encuesta token={token!} previa={registro.encuesta} listo={() => { setVerEncuesta(false); cargar(token!); }} />}
                </div>
            )}

            {/* Enlace personal */}
            <details className="rounded-3xl border-2 border-dashed border-[var(--t-border)] p-4">
                <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-wider text-[var(--t-text-faint)]">Tu enlace personal</summary>
                <p className="mt-2 text-xs text-[var(--t-text-muted)]">Con él entras a tu perfil desde cualquier celular. No lo compartas.</p>
                <div className="mt-3 flex gap-2">
                    <button onClick={copiar} className="font-futura sticker flex-1 bg-ecopil-sun text-ink font-extrabold py-2.5 rounded-full text-sm flex items-center justify-center gap-1.5">
                        <Copy size={14} /> {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Mi registro al Encuentro Nacional de Innovación Social y Liderazgo Ambiental 2026: ${enlace}`)}`} target="_blank" rel="noreferrer"
                        className="flex-1 border-2 border-[var(--t-border)] rounded-full py-2.5 text-sm font-bold text-[var(--t-text-muted)] flex items-center justify-center gap-1.5">
                        <Share2 size={14} /> WhatsApp
                    </a>
                </div>
            </details>
        </div>
    );
}

export default function MiRegistroPage() {
    return (
        <div className="theme-surface min-h-[80vh] flex flex-col items-center py-6 bg-[var(--t-bg)]">
            <div className="w-full max-w-md">
                <Suspense fallback={null}><MiRegistroContenido /></Suspense>
            </div>
        </div>
    );
}
