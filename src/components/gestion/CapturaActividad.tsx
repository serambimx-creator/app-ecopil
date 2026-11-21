'use client';

// Captura de indicadores dentro de una actividad: asistencia (pasar lista),
// resultados de campo / comidas, y fotos de evidencia.
import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Check, Plus, X, Camera, Loader2, Users, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INDICADORES, nombreIndicador, type DatosGestion, type ActividadGestion } from '@/lib/encuentro';

type Rpc = (fn: string, a: Record<string, unknown>) => Promise<unknown>;
type Guardar = (tabla: string, fila: Record<string, unknown>) => Promise<unknown>;
type Borrar = (tabla: string, id: string) => Promise<void>;

const inp = 'w-full rounded-xl bg-gray-900 border-2 border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-green';
const lbl = 'block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1';

export default function CapturaActividad({ act, datos, rpc, guardar, borrar }: {
    act: Partial<ActividadGestion> & { id: string }; datos: DatosGestion; rpc: Rpc; guardar: Guardar; borrar: Borrar;
}) {
    const [lista, setLista] = useState(false);
    const [q, setQ] = useState('');
    const [ind, setInd] = useState({ clave: act.tipo === 'comida' ? 'comidas_servidas' : 'arboles_plantados', otro: '', valor: '' });
    const [ocupado, setOcupado] = useState(false);
    const [error, setError] = useState('');

    const presentes = useMemo(() => new Set((datos.asistencias ?? []).filter((a) => a.actividad_id === act.id).map((a) => a.registro_id)), [datos, act.id]);
    const aprobados = datos.registros.filter((r) => r.estado === 'aprobado');
    const filtrados = aprobados.filter((r) => !q || `${r.nombre} ${r.nodo}`.toLowerCase().includes(q.toLowerCase()));
    const misInd = (datos.indicadores ?? []).filter((i) => i.actividad_id === act.id);
    const misFotos = (datos.evidencias ?? []).filter((e) => e.actividad_id === act.id);
    const preset = INDICADORES.find((x) => x.clave === ind.clave)!;

    const run = async (fn: () => Promise<unknown>) => {
        setOcupado(true); setError('');
        try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
        setOcupado(false);
    };

    const subirFoto = (file: File) => run(async () => {
        const ruta = `evidencias/${crypto.randomUUID()}.${file.name.split('.').pop() || 'jpg'}`;
        const { error: e } = await supabase.storage.from('encuentro-fotos').upload(ruta, file, { contentType: file.type });
        if (e) throw new Error(e.message);
        const url = supabase.storage.from('encuentro-fotos').getPublicUrl(ruta).data.publicUrl;
        await guardar('evidencias', { actividad_id: act.id, foto_url: url });
    });

    return (
        <div className="space-y-4 border-t-2 border-dashed border-gray-800 pt-4">
            {/* Asistencia */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <p className={lbl}>Asistencia</p>
                    <span className="text-xs font-bold text-white"><Users size={12} className="mr-1 inline" />{presentes.size} de {aprobados.length}</span>
                </div>
                <button onClick={() => setLista(!lista)} className="w-full rounded-xl border-2 border-gray-700 py-2 text-xs font-bold text-gray-300">
                    {lista ? 'Cerrar lista' : 'Pasar lista'}
                </button>
                <p className="text-[11px] text-gray-500">También puedes escanear el QR del gafete con la cámara del celular.</p>
                {lista && (
                    <div className="space-y-1.5">
                        <div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                            <input className={clsx(inp, 'pl-8')} placeholder="Buscar nombre o nodo" value={q} onChange={(e) => setQ(e.target.value)} /></div>
                        <div className="max-h-64 overflow-y-auto space-y-1">
                            {filtrados.map((r) => {
                                const si = presentes.has(r.id);
                                return (
                                    <button key={r.id} disabled={ocupado} onClick={() => run(() => rpc('gestor_asistencia', { p_actividad: act.id, p_registro: r.id, p_presente: !si }))}
                                        className={clsx('flex w-full items-center gap-2 rounded-xl p-2 text-left', si ? 'bg-brand-green/20' : 'bg-gray-900')}>
                                        <span className={clsx('flex h-5 w-5 items-center justify-center rounded-md border-2', si ? 'border-brand-green bg-brand-green text-ink' : 'border-gray-600')}>{si && <Check size={12} />}</span>
                                        <span className="flex-1 truncate text-sm text-white">{r.nombre}</span>
                                        <span className="text-[11px] text-gray-500">{r.nodo}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Resultados */}
            <div className="space-y-2">
                <p className={lbl}>Resultados e indicadores</p>
                {misInd.map((i) => (
                    <div key={i.id} className="flex items-center gap-2 rounded-xl bg-gray-900 p-2.5 text-sm">
                        <span className="flex-1 text-white">{nombreIndicador(i.clave)}</span>
                        <span className="font-bold text-white tabular-nums">{Number(i.valor).toLocaleString('es-MX')} {i.unidad}</span>
                        <button onClick={() => run(() => borrar('indicadores', i.id))} className="text-gray-600"><X size={14} /></button>
                    </div>
                ))}
                <div className="grid grid-cols-[1fr_90px_auto] gap-2">
                    <select className={inp} value={ind.clave} onChange={(e) => setInd({ ...ind, clave: e.target.value })}>
                        {INDICADORES.map((x) => <option key={x.clave} value={x.clave}>{x.nombre}</option>)}
                    </select>
                    <input type="number" inputMode="decimal" className={inp} placeholder={preset.unidad || 'Cant.'} value={ind.valor} onChange={(e) => setInd({ ...ind, valor: e.target.value })} />
                    <button disabled={!ind.valor || ocupado || (ind.clave === 'otro' && !ind.otro)}
                        onClick={() => run(async () => {
                            await guardar('indicadores', { actividad_id: act.id, dia: act.dia, clave: ind.clave === 'otro' ? `otro:${ind.otro.trim()}` : ind.clave, valor: Number(ind.valor), unidad: preset.unidad || null });
                            setInd({ ...ind, valor: '', otro: '' });
                        })}
                        className="rounded-xl bg-brand-green px-3 text-ink disabled:opacity-40"><Plus size={16} /></button>
                </div>
                {ind.clave === 'otro' && <input className={inp} placeholder="¿Qué se midió? (ej. litros de agua analizada)" value={ind.otro} onChange={(e) => setInd({ ...ind, otro: e.target.value })} />}
            </div>

            {/* Evidencias */}
            <div className="space-y-2">
                <p className={lbl}>Fotos de evidencia</p>
                <div className="grid grid-cols-4 gap-2">
                    {misFotos.map((e) => (
                        <div key={e.id} className="relative aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <a href={e.foto_url} target="_blank" rel="noreferrer"><img src={e.foto_url} alt="" className="h-full w-full rounded-xl object-cover" /></a>
                            <button onClick={() => run(() => borrar('evidencias', e.id))} className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white"><X size={12} /></button>
                        </div>
                    ))}
                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-700 text-gray-500">
                        {ocupado ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) subirFoto(f); e.target.value = ''; }} />
                    </label>
                </div>
            </div>
            {error && <p className="text-xs font-bold text-status-red">{error.includes('does not exist') || error.includes('Could not find') ? 'Falta correr indicadores.sql en Supabase.' : error}</p>}
        </div>
    );
}
