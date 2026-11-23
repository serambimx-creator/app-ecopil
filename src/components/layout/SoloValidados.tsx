'use client';

import Link from 'next/link';
import { Loader2, Lock } from 'lucide-react';
import { useAcceso, puedeVerTodo } from '@/context/AccesoContext';
import Mixtli from '@/components/brand/Mixtli';

// Envuelve las secciones que solo ven agentes validados (y gestores).
export default function SoloValidados({ children }: { children: React.ReactNode }) {
    const { acceso, listo } = useAcceso();
    if (!listo) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--t-text-faint)]" /></div>;
    if (puedeVerTodo(acceso)) return <>{children}</>;
    const registrado = acceso === 'pendiente' || acceso === 'rechazado';
    return (
        <div className="theme-surface flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[var(--t-bg)] px-6 py-10 text-center text-[var(--t-text)]">
            <Mixtli pose="lupa" height={120} />
            <p className="font-display flex items-center gap-2 text-2xl font-semibold"><Lock size={20} /> Solo para agentes validados</p>
            <p className="text-sm text-[var(--t-text-muted)]">
                {acceso === 'pendiente'
                    ? 'Tu registro está en revisión. Acepta tu carta compromiso en Mi registro; cuando el staff valide tu lugar se abre el programa, la guía y el mapa.'
                    : acceso === 'rechazado'
                        ? 'Tu registro no fue aprobado. Si crees que es un error, escribe al staff del Encuentro.'
                        : 'El programa, la guía y el mapa se abren cuando te registras y el staff valida tu lugar.'}
            </p>
            <Link href={registrado ? '/mi-registro' : '/registro'} className="font-futura sticker rounded-full bg-brand-green px-6 py-3 font-extrabold text-ink">
                {registrado ? 'Ir a Mi registro' : 'Registrarme'}
            </Link>
            {!registrado && <Link href="/mi-registro" className="text-xs font-bold underline text-[var(--t-text-muted)]">Ya me registré</Link>}
        </div>
    );
}
