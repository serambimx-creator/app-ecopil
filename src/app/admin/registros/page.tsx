'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Loader2, Check, X, Phone, HeartPulse, Search, KeyRound } from 'lucide-react';
import { ecopil, type EstadoRegistro, type Nodo, type RegistroEncuentro } from '@/lib/ecopil';
import Mixtli from '@/components/brand/Mixtli';

const FILTROS: { key: EstadoRegistro; label: string }[] = [
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'aprobado', label: 'Aprobados' },
    { key: 'rechazado', label: 'Rechazados' },
];

export default function RegistrosPage() {
    const [pin, setPin] = useState('');
    const [dentro, setDentro] = useState(false);
    const [errorPin, setErrorPin] = useState('');
    const [entrando, setEntrando] = useState(false);
    const [registros, setRegistros] = useState<RegistroEncuentro[]>([]);
    const [nodos, setNodos] = useState<Record<string, string>>({});
    const [filtro, setFiltro] = useState<EstadoRegistro>('pendiente');
    const [busqueda, setBusqueda] = useState('');
    const [guardando, setGuardando] = useState<string | null>(null);

    const cargar = useCallback(async (p: string) => {
        const { data: ok } = await ecopil.rpc('encuentro_pin_ok', { p_pin: p });
        if (!ok) return false;
        const { data } = await ecopil.rpc('encuentro_listar', { p_pin: p });
        setRegistros((data as RegistroEncuentro[]) ?? []);
        return true;
    }, []);

    useEffect(() => {
        ecopil.rpc('encuentro_nodos').then(({ data }) =>
            setNodos(Object.fromEntries(((data as Nodo[]) ?? []).map((x) => [x.id, x.nombre]))));
        // El PIN vive solo en esta pestaña.
        let guardado: string | null = null;
        try { guardado = sessionStorage.getItem('encuentro_staff_pin'); } catch { /* sin storage */ }
        if (guardado) cargar(guardado).then((ok) => { if (ok) { setPin(guardado!); setDentro(true); } });
    }, [cargar]);

    const entrar = async (e: React.FormEvent) => {
        e.preventDefault();
        setEntrando(true);
        setErrorPin('');
        const ok = await cargar(pin);
        setEntrando(false);
        if (!ok) return setErrorPin('PIN incorrecto. Después de 10 intentos fallidos se bloquea 15 minutos.');
        try { sessionStorage.setItem('encuentro_staff_pin', pin); } catch { /* sin storage */ }
        setDentro(true);
    };

    const actualizar = async (id: string, cambios: Partial<Pick<RegistroEncuentro, 'estado' | 'grupo'>>) => {
        setGuardando(id);
        const { data, error } = await ecopil.rpc('encuentro_revisar', {
            p_pin: pin, p_id: id, p_estado: cambios.estado ?? null, p_grupo: cambios.grupo ?? null,
        });
        setGuardando(null);
        if (!error && data && (data as RegistroEncuentro).id) setRegistros((rs) => rs.map((r) => (r.id === id ? (data as RegistroEncuentro) : r)));
    };

    const conteo = useMemo(() => Object.fromEntries(FILTROS.map((f) => [f.key, registros.filter((r) => r.estado === f.key).length])), [registros]);
    const visibles = registros.filter((r) =>
        r.estado === filtro &&
        (!busqueda || `${r.nombre} ${r.email} ${nodos[r.nodo_id] ?? ''}`.toLowerCase().includes(busqueda.toLowerCase()))
    );

    if (!dentro) {
        return (
            <div data-theme="dark" className="py-16 text-center space-y-4 max-w-xs mx-auto">
                <Mixtli pose="lupa" height={130} className="mx-auto" />
                <p className="font-display text-2xl font-semibold text-white">Registros del Encuentro</p>
                <p className="text-sm text-gray-400">Solo para el staff. Escribe el PIN del equipo.</p>
                <form onSubmit={entrar} className="space-y-3">
                    <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input type="password" required value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN"
                            className="w-full rounded-full bg-gray-900 border-2 border-gray-700 py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-green" />
                    </div>
                    {errorPin && <p className="text-xs font-bold text-status-red">{errorPin}</p>}
                    <button disabled={entrando} className="font-futura sticker w-full bg-brand-green text-ink font-extrabold py-3 rounded-full disabled:opacity-50">
                        {entrando ? <Loader2 className="animate-spin mx-auto" /> : 'Entrar'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div data-theme="dark" className="pb-24 space-y-5">
            <div className="flex items-end justify-between pt-2">
                <div>
                    <h1 className="font-display text-3xl font-semibold text-white">Registros</h1>
                    <p className="text-sm text-gray-400">{conteo.aprobado ?? 0} aprobados · {conteo.pendiente ?? 0} por revisar</p>
                </div>
                <Mixtli pose="lupa" height={80} />
            </div>

            <div className="flex gap-2">
                {FILTROS.map((f) => (
                    <button key={f.key} onClick={() => setFiltro(f.key)}
                        className={clsx("font-futura flex-1 rounded-full py-2 text-xs font-extrabold border-2",
                            filtro === f.key ? "sticker bg-ecopil-sun text-ink" : "border-gray-700 text-gray-400")}>
                        {f.label} ({conteo[f.key] ?? 0})
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, correo o nodo"
                    className="w-full rounded-full bg-gray-900 border-2 border-gray-700 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-green" />
            </div>

            {visibles.length === 0 && <p className="text-center text-sm text-gray-500 py-10">No hay registros aquí.</p>}

            <div className="space-y-3">
                {visibles.map((r) => (
                    <div key={r.id} className="rounded-3xl bg-gray-900 border-2 border-gray-700 p-4 space-y-3">
                        <div className="flex gap-3">
                            <img src={r.foto_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-gray-600 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-white truncate">{r.nombre}</p>
                                <p className="text-xs text-gray-400 truncate">{nodos[r.nodo_id] ?? 'Nodo ?'}{r.ciudad ? ` · ${r.ciudad}` : ''}</p>
                                <p className="text-xs text-gray-500 truncate">{r.email}</p>
                            </div>
                            {r.agente_catalogo_id && <span className="self-start text-[10px] font-extrabold uppercase rounded-full bg-ecopil-leaf text-ink px-2 py-0.5">Jornadas</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                            <a href={`tel:${r.telefono}`} className="flex items-center gap-1"><Phone size={12} /> {r.telefono}</a>
                            <span className="flex items-center gap-1"><HeartPulse size={12} /> {r.emergencia_nombre} · {r.emergencia_telefono}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {r.estado !== 'rechazado' && (['A', 'B'] as const).map((g) => (
                                <button key={g} disabled={guardando === r.id} onClick={() => actualizar(r.id, { grupo: g, ...(r.estado === 'pendiente' ? { estado: 'aprobado' as const } : {}) })}
                                    className={clsx("w-10 h-10 rounded-full text-sm font-extrabold border-2",
                                        r.grupo === g ? "sticker bg-ecopil-sun text-ink" : "border-gray-600 text-gray-300")}>
                                    {g}
                                </button>
                            ))}
                            <div className="flex-1" />
                            {guardando === r.id && <Loader2 className="animate-spin text-gray-400" size={18} />}
                            {r.estado !== 'aprobado' && (
                                <button disabled={guardando === r.id} onClick={() => actualizar(r.id, { estado: 'aprobado' })}
                                    className="font-futura sticker bg-brand-green text-ink rounded-full px-4 py-2 text-xs font-extrabold flex items-center gap-1"><Check size={14} /> Aprobar</button>
                            )}
                            {r.estado !== 'rechazado' && (
                                <button disabled={guardando === r.id} onClick={() => actualizar(r.id, { estado: 'rechazado' })}
                                    className="rounded-full border-2 border-gray-600 text-gray-300 px-3 py-2 text-xs font-bold flex items-center gap-1"><X size={14} /> Rechazar</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-center text-[11px] text-gray-600">Tocar A o B aprueba y asigna grupo en un paso.</p>
        </div>
    );
}
