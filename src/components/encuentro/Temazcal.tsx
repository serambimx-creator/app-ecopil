'use client';

// Apartar lugar en el temazcal del 21 dic (cupo limitado). Solo agentes con registro aprobado.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Loader2 } from 'lucide-react';
import { ecopil, TOKEN_KEY } from '@/lib/ecopil';

type Estado = { apuntado: boolean; ocupados: number; cupo: number; lleno: boolean };

export default function Temazcal({ token: tokenProp }: { token?: string | null }) {
    const [token, setToken] = useState<string | null>(tokenProp ?? null);
    const [e, setE] = useState<Estado | null>(null);
    const [ocupado, setOcupado] = useState(false);

    const pedir = useCallback((t: string, quiero: boolean | null) =>
        ecopil.rpc('encuentro_temazcal', { p_token: t, p_quiero: quiero }).then(({ data }) => { if (data) setE(data as Estado); }), []);

    useEffect(() => {
        let t = tokenProp ?? null;
        if (!t) { try { t = localStorage.getItem(TOKEN_KEY); } catch { /* sin storage */ } }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- token guardado en el celular
        if (t) { setToken(t); pedir(t, null); }
    }, [tokenProp, pedir]);

    const cambiar = async (quiero: boolean) => { if (!token) return; setOcupado(true); await pedir(token, quiero); setOcupado(false); };
    const libres = e ? Math.max(0, e.cupo - e.ocupados) : null;

    return (
        <div className="sticker space-y-2 rounded-3xl bg-ecopil-orange p-4 text-ink">
            <p className="flex items-center gap-2 font-display text-xl font-semibold"><Flame size={20} /> Temazcal · 21 dic, 8:00</p>
            <p className="text-sm">Solo hay 20 lugares. Si te interesa ir, apártalo aquí.</p>
            {!token ? (
                <Link href="/registro" className="font-futura inline-block rounded-full bg-ink px-4 py-2 text-xs font-extrabold text-white">Regístrate para apartar lugar</Link>
            ) : !e ? (
                <p className="text-xs font-semibold">Podrás apartar lugar cuando tu registro esté aprobado.</p>
            ) : (
                <>
                    <p className="font-futura text-xs font-extrabold">{e.apuntado ? '¡Tienes lugar! · ' : ''}Quedan {libres} de {e.cupo} lugares</p>
                    {e.apuntado ? (
                        <button type="button" disabled={ocupado} onClick={() => cambiar(false)} className="font-futura rounded-full border-2 border-ink px-4 py-2 text-xs font-extrabold">
                            {ocupado ? <Loader2 size={14} className="animate-spin" /> : 'Ya no voy, liberar mi lugar'}
                        </button>
                    ) : libres === 0 ? (
                        <p className="text-sm font-bold">Ya se llenó. Si alguien libera su lugar, podrás apartarlo aquí.</p>
                    ) : (
                        <button type="button" disabled={ocupado} onClick={() => cambiar(true)} className="font-futura rounded-full bg-ink px-4 py-2 text-xs font-extrabold text-white">
                            {ocupado ? <Loader2 size={14} className="animate-spin" /> : 'Me interesa, apartar mi lugar'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
