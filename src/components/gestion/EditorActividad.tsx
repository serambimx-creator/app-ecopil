'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { X, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { SEDES, DIAS, diaCorto, type ActividadGestion } from '@/lib/encuentro';

type Guardar = (tabla: string, fila: Record<string, unknown>) => Promise<unknown>;
type Borrar = (tabla: string, id: string) => Promise<void>;

const ESTADOS = [
    ['pendiente', 'Pendiente'], ['en_proceso', 'En proceso'], ['listo', 'Listo'],
    ['en_curso', 'En curso'], ['hecho', 'Hecho'], ['cancelado', 'Cancelado'],
] as const;
const TIPOS = ['actividad', 'comida', 'traslado', 'taller', 'logistica', 'preparacion'] as const;

const inp = 'w-full rounded-xl bg-gray-900 border-2 border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-green';
const lbl = 'block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1';

export default function EditorActividad({ actividad, onClose, guardar, borrar }: {
    actividad: Partial<ActividadGestion> | null; onClose: () => void; guardar: Guardar; borrar: Borrar;
}) {
    const nueva = !actividad?.id;
    const [f, setF] = useState<Partial<ActividadGestion>>(actividad ?? { dia: DIAS[1], tipo: 'actividad', publica: true, estado: 'pendiente' });
    const [nuevoResp, setNuevoResp] = useState({ persona: '', material: '' });
    const [ocupado, setOcupado] = useState(false);
    const [error, setError] = useState('');

    if (!actividad) return null;
    const set = (k: keyof ActividadGestion, v: unknown) => setF({ ...f, [k]: v });

    const run = async (fn: () => Promise<unknown>) => {
        setOcupado(true); setError('');
        try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
        setOcupado(false);
    };

    const guardarActividad = () => run(async () => {
        const { responsables: _r, actualizado_por_nombre: _a, updated_at: _u, ...fila } = f;
        void _r; void _a; void _u;
        const res = await guardar('actividades', { ...fila, inicio: fila.inicio || null, fin: fila.fin || null }) as { id: string };
        if (nueva) setF({ ...f, id: res.id, responsables: [] }); else onClose();
    });

    const responsables = actividad.responsables ?? f.responsables ?? [];

    return (
        <div data-theme="dark" className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-gray-950 border-2 border-gray-700 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <p className="font-display text-xl font-semibold text-white">{nueva ? 'Nueva actividad' : 'Editar actividad'}</p>
                    <button onClick={onClose} className="text-gray-400"><X /></button>
                </div>

                <div><label className={lbl}>Título</label><input className={inp} value={f.titulo ?? ''} onChange={(e) => set('titulo', e.target.value)} /></div>

                <div className="grid grid-cols-3 gap-2">
                    <div><label className={lbl}>Día</label>
                        <select className={inp} value={f.dia} onChange={(e) => set('dia', e.target.value)}>
                            {['2026-12-10', ...DIAS].map((d) => <option key={d} value={d}>{diaCorto(d)}</option>)}
                        </select></div>
                    <div><label className={lbl}>Inicio</label><input type="time" className={inp} value={f.inicio?.slice(0, 5) ?? ''} onChange={(e) => set('inicio', e.target.value)} /></div>
                    <div><label className={lbl}>Fin</label><input type="time" className={inp} value={f.fin?.slice(0, 5) ?? ''} onChange={(e) => set('fin', e.target.value)} /></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Sede</label>
                        <select className={inp} value={f.sede ?? ''} onChange={(e) => set('sede', e.target.value || null)}>
                            <option value="">Sin sede</option>
                            {Object.entries(SEDES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select></div>
                    <div><label className={lbl}>Tipo</label>
                        <select className={inp} value={f.tipo} onChange={(e) => set('tipo', e.target.value)}>
                            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select></div>
                </div>

                <div><label className={lbl}>Estado</label>
                    <div className="flex flex-wrap gap-1.5">
                        {ESTADOS.map(([k, v]) => (
                            <button key={k} onClick={() => set('estado', k)} className={clsx('rounded-full px-3 py-1 text-xs font-bold border-2',
                                f.estado === k ? 'sticker bg-ecopil-sun text-ink' : 'border-gray-700 text-gray-400')}>{v}</button>
                        ))}
                    </div></div>

                <div><label className={lbl}>Lo que ven los asistentes</label><textarea rows={2} className={inp} value={f.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} /></div>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" checked={!!f.publica} onChange={(e) => set('publica', e.target.checked)} /> Visible en el programa de asistentes
                </label>
                <div><label className={lbl}>Notas internas</label><textarea rows={2} className={inp} value={f.notas ?? ''} onChange={(e) => set('notas', e.target.value)} /></div>
                <div><label className={lbl}>Pendientes y permisos</label><textarea rows={2} className={inp} value={f.pendientes ?? ''} onChange={(e) => set('pendientes', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Ubicación (Maps)</label><input className={inp} value={f.destino_url ?? ''} onChange={(e) => set('destino_url', e.target.value)} /></div>
                    <div><label className={lbl}>Presupuesto</label><input type="number" className={inp} value={f.presupuesto ?? ''} onChange={(e) => set('presupuesto', e.target.value ? Number(e.target.value) : null)} /></div>
                </div>
                <div><label className={lbl}>Reconocimientos y kits</label><input className={inp} value={f.reconocimientos ?? ''} onChange={(e) => set('reconocimientos', e.target.value)} /></div>

                {error && <p className="text-xs font-bold text-status-red">{error}</p>}
                <div className="flex gap-2">
                    <button disabled={ocupado || !f.titulo} onClick={guardarActividad} className="font-futura sticker flex-1 bg-brand-green text-ink font-extrabold py-3 rounded-full disabled:opacity-50 flex justify-center">
                        {ocupado ? <Loader2 className="animate-spin" /> : nueva ? 'Crear' : 'Guardar'}
                    </button>
                    {!nueva && (
                        <button disabled={ocupado} onClick={() => confirm('¿Borrar esta actividad?') && run(async () => { await borrar('actividades', f.id!); onClose(); })}
                            className="rounded-full border-2 border-gray-700 px-4 text-gray-400"><Trash2 size={16} /></button>
                    )}
                </div>

                {f.id && (
                    <div className="space-y-2 border-t-2 border-dashed border-gray-800 pt-4">
                        <p className={lbl}>Responsables y materiales</p>
                        {responsables.map((r) => (
                            <div key={r.id} className="flex items-start gap-2 rounded-xl bg-gray-900 p-2.5">
                                <button title="Material listo" onClick={() => run(() => guardar('actividad_responsables', { id: r.id, material_listo: !r.material_listo }))}
                                    className={clsx('mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center', r.material_listo ? 'bg-brand-green border-brand-green text-ink' : 'border-gray-600')}>
                                    {r.material_listo && <Check size={12} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white">{r.persona}{r.detalle ? ` · ${r.detalle}` : ''}</p>
                                    {r.material && <p className="text-xs text-gray-400">{r.material}</p>}
                                    {r.equipo && <p className="text-xs text-gray-500">Equipo: {r.equipo}</p>}
                                </div>
                                <button onClick={() => run(() => borrar('actividad_responsables', r.id))} className="text-gray-600"><X size={14} /></button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <input className={inp} placeholder="Responsable" value={nuevoResp.persona} onChange={(e) => setNuevoResp({ ...nuevoResp, persona: e.target.value })} />
                            <input className={inp} placeholder="Material" value={nuevoResp.material} onChange={(e) => setNuevoResp({ ...nuevoResp, material: e.target.value })} />
                            <button disabled={!nuevoResp.persona || ocupado}
                                onClick={() => run(async () => { await guardar('actividad_responsables', { actividad_id: f.id, persona: nuevoResp.persona, material: nuevoResp.material, orden: responsables.length }); setNuevoResp({ persona: '', material: '' }); })}
                                className="shrink-0 rounded-xl bg-brand-green px-3 text-ink disabled:opacity-40"><Plus size={16} /></button>
                        </div>
                    </div>
                )}
                {!nueva && actividad.actualizado_por_nombre && (
                    <p className="text-[11px] text-gray-600">Último cambio: {actividad.actualizado_por_nombre}</p>
                )}
            </div>
        </div>
    );
}
