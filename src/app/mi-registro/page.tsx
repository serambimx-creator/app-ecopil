'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Check, Clock, XCircle, Copy, Share2 } from 'lucide-react';
import { ecopil, TOKEN_KEY, type MiRegistro } from '@/lib/ecopil';
import Mixtli, { MixtliBubble } from '@/components/brand/Mixtli';

function MiRegistroContenido() {
    const params = useSearchParams();
    const [token, setToken] = useState<string | null>(null);
    const [registro, setRegistro] = useState<MiRegistro | null | undefined>(undefined);
    const [copiado, setCopiado] = useState(false);
    const nuevo = params.get('nuevo') === '1';

    useEffect(() => {
        let t = params.get('t');
        try {
            if (t) localStorage.setItem(TOKEN_KEY, t);
            else t = localStorage.getItem(TOKEN_KEY);
        } catch { /* sin storage */ }
        setToken(t);
        if (!t) return setRegistro(null);
        ecopil.rpc('encuentro_mi_registro', { p_token: t }).then(({ data }) => {
            setRegistro(Array.isArray(data) && data[0] ? (data[0] as MiRegistro) : null);
        });
    }, [params]);

    const enlace = token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/mi-registro?t=${token}` : '';

    const copiar = async () => {
        try { await navigator.clipboard.writeText(enlace); setCopiado(true); } catch { /* sin portapapeles */ }
    };

    if (registro === undefined) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--t-text-faint)]" /></div>;
    }

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

    return (
        <div className="space-y-5">
            {nuevo && (
                <MixtliBubble className="text-sm">¡Listo! Guarda este enlace: es tu acceso a tu perfil del Encuentro.</MixtliBubble>
            )}

            <div className="sticker bg-[var(--t-surface)] p-6 rounded-[32px] space-y-5 text-center">
                <img src={registro.foto_url} alt="" className="sticker w-24 h-24 rounded-full object-cover mx-auto" />
                <div>
                    <p className="font-display text-2xl font-semibold text-[var(--t-text)]">{registro.nombre}</p>
                    <p className="text-sm text-[var(--t-text-muted)]">Nodo {registro.nodo}{registro.ciudad ? ` · ${registro.ciudad}` : ''}</p>
                </div>
                {registro.estado === 'pendiente' && (
                    <div className="rounded-2xl bg-ecopil-sun/25 p-4 flex items-start gap-3 text-left">
                        <Clock className="text-ecopil-orange shrink-0" size={20} />
                        <p className="text-sm text-[var(--t-text-secondary)]">Recibimos tu registro. El staff de Pachuca–Tulancingo lo revisa y aquí verás cuando quede aprobado.</p>
                    </div>
                )}
                {registro.estado === 'aprobado' && (
                    <div className="rounded-2xl bg-ecopil-leaf/40 p-4 flex items-start gap-3 text-left">
                        <Check className="text-brand-green shrink-0" size={20} />
                        <p className="text-sm text-[var(--t-text-secondary)]">
                            ¡Estás dentro! {registro.grupo ? <>Vas en el <b>Grupo {registro.grupo}</b>.</> : 'Pronto te asignamos grupo.'}
                        </p>
                    </div>
                )}
                {registro.estado === 'rechazado' && (
                    <div className="rounded-2xl bg-status-red/10 p-4 flex items-start gap-3 text-left">
                        <XCircle className="text-status-red shrink-0" size={20} />
                        <p className="text-sm text-[var(--t-text-secondary)]">Tu registro no fue aprobado. Si crees que es un error, escribe al staff del Encuentro.</p>
                    </div>
                )}
            </div>

            <div className="border-2 border-dashed border-[var(--t-border)] rounded-3xl p-4 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--t-text-faint)]">Tu enlace personal</p>
                <p className="text-xs text-[var(--t-text-muted)]">Con él entras a tu perfil desde cualquier celular. No lo compartas.</p>
                <div className="flex gap-2">
                    <button onClick={copiar} className="font-futura sticker flex-1 bg-ecopil-sun text-ink font-extrabold py-3 rounded-full text-sm flex items-center justify-center gap-1.5">
                        <Copy size={14} /> {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Mi registro al Encuentro de Nodos 2026: ${enlace}`)}`} target="_blank" rel="noreferrer"
                        className="flex-1 border-2 border-[var(--t-border)] rounded-full py-3 text-sm font-bold text-[var(--t-text-muted)] flex items-center justify-center gap-1.5">
                        <Share2 size={14} /> Mandármelo por WhatsApp
                    </a>
                </div>
            </div>

            <Link href="/guia" className="block text-center text-sm font-bold text-[var(--t-accent)]">Ver la guía del Encuentro</Link>
        </div>
    );
}

export default function MiRegistroPage() {
    return (
        <div className="theme-surface min-h-[80vh] flex flex-col items-center py-8 bg-[var(--t-bg)]">
            <div className="w-full max-w-md">
                <Suspense fallback={null}><MiRegistroContenido /></Suspense>
            </div>
        </div>
    );
}
