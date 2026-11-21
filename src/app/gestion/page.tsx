'use client';

import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Loader2, CalendarClock, Phone, MessageCircle, NotebookPen, Users, UserCog, Plus, LogOut, WifiOff, AlertTriangle, Check, Megaphone, Search, BarChart3, Trophy } from 'lucide-react';
import Mixtli from '@/components/brand/Mixtli';
import EditorActividad from '@/components/gestion/EditorActividad';
import Reporte from '@/components/gestion/Reporte';
import RankingJuego from '@/components/gestion/RankingJuego';
import TemazcalLista from '@/components/gestion/TemazcalLista';
import { supabase } from '@/lib/supabase';
import { useGestion, ahoraHidalgo, rango, diaCorto, DIAS, DIA_COLOR, SEDES, type ActividadGestion, type Contacto, type EntradaBitacora } from '@/lib/encuentro';

type Tab = 'hoy' | 'directorio' | 'bitacora' | 'registros' | 'reporte' | 'juego' | 'equipo';
const inp = 'w-full rounded-xl bg-gray-900 border-2 border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-green';
const ESTADO_COLOR: Record<string, string> = {
    pendiente: 'bg-gray-700 text-gray-200', en_proceso: 'bg-ecopil-sun text-ink', listo: 'bg-ecopil-leaf text-ink',
    en_curso: 'bg-brand-green text-ink', hecho: 'bg-gray-800 text-gray-500', cancelado: 'bg-ecopil-red/30 text-ecopil-red',
};
const tel = (t: string) => t.replace(/\D/g, '');

function Entrar({ entrar }: { entrar: (n: string, p: string) => Promise<string | null> }) {
    const [nombres, setNombres] = useState<string[]>([]);
    const [nombre, setNombre] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [ocupado, setOcupado] = useState(false);
    useEffect(() => { supabase.rpc('gestores_nombres').then(({ data }) => setNombres((data as string[]) ?? [])); }, []);
    return (
        <div data-theme="dark" className="py-14 max-w-xs mx-auto text-center space-y-4">
            <Mixtli pose="lupa" height={120} className="mx-auto" />
            <p className="font-display text-2xl font-semibold text-white">Panel de gestores</p>
            <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); setOcupado(true); setError((await entrar(nombre, pin)) ?? ''); setOcupado(false); }}>
                <select required className={inp} value={nombre} onChange={(e) => setNombre(e.target.value)}>
                    <option value="">¿Quién eres?</option>
                    {nombres.map((n) => <option key={n}>{n}</option>)}
                </select>
                <input required type="password" className={inp} placeholder="Tu PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
                {error && <p className="text-xs font-bold text-status-red">{error}</p>}
                <button disabled={ocupado} className="font-futura sticker w-full bg-brand-green text-ink font-extrabold py-3 rounded-full">{ocupado ? <Loader2 className="animate-spin mx-auto" /> : 'Entrar'}</button>
            </form>
            <p className="text-xs text-gray-500">¿No tienes PIN? Pídeselo a Luis.</p>
        </div>
    );
}

export default function GestionPage() {
    const g = useGestion();
    const hoy = ahoraHidalgo();
    const [tab, setTab] = useState<Tab>('hoy');
    const [dia, setDia] = useState(DIAS.includes(hoy.dia) ? hoy.dia : DIAS[1]);
    const [editando, setEditando] = useState<string | 'nueva' | null>(null);
    const [busca, setBusca] = useState('');
    const [escaneado, setEscaneado] = useState<string | null>(null);
    useEffect(() => {
        const r = new URLSearchParams(window.location.search).get('r');
        if (r) { setEscaneado(r.toLowerCase()); setTab('registros'); }
    }, []);

    const acts = useMemo(() => g.datos?.actividades ?? [], [g.datos]);
    if (!g.listo) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" /></div>;
    if (!g.token || !g.datos) return <Entrar entrar={g.entrar} />;
    const d = g.datos;
    const editAct = editando === 'nueva' ? { dia, tipo: 'actividad', publica: true, estado: 'pendiente' } as Partial<ActividadGestion> : acts.find((a) => a.id === editando) ?? null;
    const pendientesReg = d.registros.filter((r) => r.estado === 'pendiente').length;
    const abiertos = d.bitacora.filter((b) => !b.resuelto && b.tipo !== 'nota' && b.tipo !== 'observacion').length;

    const TABS: { k: Tab; label: string; icon: typeof Users; badge?: number }[] = [
        { k: 'hoy', label: 'Cronograma', icon: CalendarClock },
        { k: 'directorio', label: 'Directorio', icon: Phone },
        { k: 'bitacora', label: 'Bitácora', icon: NotebookPen, badge: abiertos },
        { k: 'registros', label: 'Asistentes', icon: Users, badge: pendientesReg },
        { k: 'reporte', label: 'Reporte', icon: BarChart3 },
        { k: 'juego', label: 'Juego', icon: Trophy },
        ...(d.yo.rol === 'admin' ? [{ k: 'equipo' as Tab, label: 'Equipo', icon: UserCog }] : []),
    ];

    return (
        <div data-theme="dark" className="pb-28 pt-2 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-500">Hola, {d.yo.nombre.split(' ')[0]}</p>
                    <h1 className="font-display text-2xl font-semibold text-white">Gestión del Encuentro</h1>
                </div>
                <button onClick={g.salir} className="text-gray-500" title="Salir"><LogOut size={18} /></button>
            </div>
            {g.sinConexion && <p className="flex items-center gap-2 text-xs font-bold text-ecopil-sun"><WifiOff size={14} /> Sin señal: datos guardados, no podrás editar.</p>}

            <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4">
                {TABS.map((t) => (
                    <button key={t.k} onClick={() => setTab(t.k)} className={clsx('relative shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-extrabold border-2',
                        tab === t.k ? 'sticker bg-ecopil-sun text-ink' : 'border-gray-700 text-gray-400')}>
                        <t.icon size={14} /> {t.label}
                        {!!t.badge && <span className="ml-0.5 rounded-full bg-ecopil-red px-1.5 text-[10px] text-white">{t.badge}</span>}
                    </button>
                ))}
            </div>

            {tab === 'hoy' && (
                <section className="space-y-3">
                    <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4">
                        {['2026-12-10', ...DIAS].map((x) => (
                            <button key={x} onClick={() => setDia(x)} className={clsx('shrink-0 rounded-xl px-3 py-1.5 text-xs font-extrabold border-2',
                                x === dia ? `${DIA_COLOR[x] ?? 'bg-gray-300'} text-ink border-transparent` : 'border-gray-700 text-gray-400')}>
                                {x === '2026-12-10' ? 'Prep.' : diaCorto(x)}
                            </button>
                        ))}
                    </div>
                    {acts.filter((a) => a.dia === dia).map((a) => {
                        const ahora = a.dia === hoy.dia && a.inicio && a.inicio <= hoy.hm && (!a.fin || a.fin > hoy.hm);
                        const faltan = a.responsables.filter((r) => r.material && !r.material_listo).length;
                        return (
                            <button key={a.id} onClick={() => setEditando(a.id)} className={clsx('w-full text-left rounded-2xl bg-gray-900 border-2 p-3 space-y-1.5',
                                ahora ? 'border-brand-green' : 'border-gray-800', a.estado === 'cancelado' && 'opacity-50')}>
                                <div className="flex items-start gap-2">
                                    <span className="w-16 shrink-0 text-xs font-extrabold text-gray-400">{rango(a)}</span>
                                    <p className="flex-1 font-bold text-white text-sm leading-snug">{a.titulo}{a.grupo && ` (${a.grupo})`}</p>
                                    <span className={clsx('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold', ESTADO_COLOR[a.estado])}>{a.estado.replace('_', ' ')}</span>
                                </div>
                                <div className="pl-[72px] space-y-0.5 text-xs text-gray-400">
                                    {a.sede && <p>{SEDES[a.sede]}</p>}
                                    {a.responsables.length > 0
                                        ? <p className="text-gray-300">{a.responsables.map((r) => r.persona).join(' · ')}</p>
                                        : <p className="text-ecopil-orange font-bold">Sin responsable</p>}
                                    {faltan > 0 && <p className="text-ecopil-sun">{faltan} material(es) por conseguir</p>}
                                    {a.pendientes && <p className="text-gray-500">Pendiente: {a.pendientes}</p>}
                                    {!a.publica && <p className="text-gray-600">Solo gestores</p>}
                                </div>
                            </button>
                        );
                    })}
                    <button onClick={() => setEditando('nueva')} className="w-full rounded-2xl border-2 border-dashed border-gray-700 py-3 text-sm font-bold text-gray-400 flex items-center justify-center gap-1"><Plus size={16} /> Agregar actividad</button>
                </section>
            )}

            {tab === 'directorio' && <Directorio contactos={d.contactos} gestores={d.gestores} busca={busca} setBusca={setBusca} guardar={g.guardarFila} />}
            {tab === 'bitacora' && <Bitacora entradas={d.bitacora} actividades={acts} avisos={d.avisos} guardar={g.guardarFila} borrar={g.borrarFila} />}
            {tab === 'registros' && <TemazcalLista token={g.token} />}
            {tab === 'registros' && <Registros datos={d} rpc={g.rpc} escaneado={escaneado} limpiar={() => setEscaneado(null)} />}
            {tab === 'reporte' && <Reporte d={d} />}
            {tab === 'juego' && <RankingJuego token={g.token} />}
            {tab === 'equipo' && <Equipo gestores={d.gestores} rpc={g.rpc} />}

            {editando && <EditorActividad key={editando} actividad={editAct} onClose={() => setEditando(null)} guardar={g.guardarFila} borrar={g.borrarFila} datos={d} rpc={g.rpc} />}
        </div>
    );
}

function Directorio({ contactos, gestores, busca, setBusca, guardar }: {
    contactos: Contacto[]; gestores: { id: string; nombre: string; telefono: string | null }[]; busca: string; setBusca: (s: string) => void;
    guardar: (t: string, f: Record<string, unknown>) => Promise<unknown>;
}) {
    const [edit, setEdit] = useState<Partial<Contacto> | null>(null);
    const todos = [
        ...gestores.map((x) => ({ id: x.id, nombre: x.nombre, telefono: x.telefono, tipo: 'staff', organizacion: '#NodoPachuca', rol: 'Gestor', sede: null } as Contacto)),
        ...contactos,
    ].filter((c) => !busca || `${c.nombre} ${c.organizacion ?? ''} ${c.rol ?? ''}`.toLowerCase().includes(busca.toLowerCase()));
    return (
        <section className="space-y-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} /><input className={`${inp} pl-9`} placeholder="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
            {todos.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-gray-900 border-2 border-gray-800 p-3">
                    <button className="flex-1 min-w-0 text-left" onClick={() => c.tipo !== 'staff' && setEdit(c)}>
                        <p className="font-bold text-white text-sm truncate">{c.nombre}</p>
                        <p className="text-xs text-gray-400 truncate">{[c.rol, c.organizacion, c.sede && SEDES[c.sede]].filter(Boolean).join(' · ')}</p>
                        {!c.telefono && <p className="text-xs text-ecopil-orange font-bold">Falta teléfono</p>}
                    </button>
                    {c.telefono && <>
                        <a href={`tel:${tel(c.telefono)}`} className="rounded-full bg-gray-800 p-2.5 text-white"><Phone size={16} /></a>
                        <a href={`https://wa.me/52${tel(c.telefono).slice(-10)}`} target="_blank" rel="noreferrer" className="rounded-full bg-brand-green p-2.5 text-ink"><MessageCircle size={16} /></a>
                    </>}
                </div>
            ))}
            <button onClick={() => setEdit({ tipo: 'anfitrion' })} className="w-full rounded-2xl border-2 border-dashed border-gray-700 py-3 text-sm font-bold text-gray-400 flex items-center justify-center gap-1"><Plus size={16} /> Agregar contacto</button>
            {edit && (
                <div className="fixed inset-0 z-[60] bg-black/70 flex items-end justify-center" onClick={() => setEdit(null)}>
                    <form className="w-full max-w-lg rounded-t-3xl bg-gray-950 border-2 border-gray-700 p-5 space-y-2" onClick={(e) => e.stopPropagation()}
                        onSubmit={async (e) => { e.preventDefault(); await guardar('contactos', edit as Record<string, unknown>); setEdit(null); }}>
                        <input required className={inp} placeholder="Nombre" value={edit.nombre ?? ''} onChange={(e) => setEdit({ ...edit, nombre: e.target.value })} />
                        <input className={inp} placeholder="Teléfono" type="tel" value={edit.telefono ?? ''} onChange={(e) => setEdit({ ...edit, telefono: e.target.value })} />
                        <input className={inp} placeholder="Organización" value={edit.organizacion ?? ''} onChange={(e) => setEdit({ ...edit, organizacion: e.target.value })} />
                        <input className={inp} placeholder="Rol" value={edit.rol ?? ''} onChange={(e) => setEdit({ ...edit, rol: e.target.value })} />
                        <div className="grid grid-cols-2 gap-2">
                            <select className={inp} value={edit.tipo} onChange={(e) => setEdit({ ...edit, tipo: e.target.value as Contacto['tipo'] })}>
                                {['anfitrion', 'aliado', 'patrocinador', 'proveedor', 'emergencia', 'otro'].map((t) => <option key={t}>{t}</option>)}
                            </select>
                            <select className={inp} value={edit.sede ?? ''} onChange={(e) => setEdit({ ...edit, sede: e.target.value || null })}>
                                <option value="">Sin sede</option>{Object.entries(SEDES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <textarea className={inp} placeholder="Notas" value={edit.notas ?? ''} onChange={(e) => setEdit({ ...edit, notas: e.target.value })} />
                        <button className="font-futura sticker w-full bg-brand-green text-ink font-extrabold py-3 rounded-full">Guardar</button>
                    </form>
                </div>
            )}
        </section>
    );
}

function Bitacora({ entradas, actividades, avisos, guardar, borrar }: {
    entradas: EntradaBitacora[]; actividades: ActividadGestion[]; avisos: { id: string; texto: string; nivel: string; created_at: string }[];
    guardar: (t: string, f: Record<string, unknown>) => Promise<unknown>; borrar: (t: string, id: string) => Promise<void>;
}) {
    const [n, setN] = useState({ tipo: 'nota', gravedad: '', texto: '', actividad_id: '' });
    const [aviso, setAviso] = useState({ texto: '', nivel: 'info' });
    const hoy = ahoraHidalgo().dia;
    return (
        <section className="space-y-4">
            <form className="rounded-2xl bg-gray-900 border-2 border-gray-800 p-3 space-y-2" onSubmit={async (e) => {
                e.preventDefault();
                await guardar('bitacora', { tipo: n.tipo, gravedad: n.gravedad || null, texto: n.texto, actividad_id: n.actividad_id || null });
                setN({ tipo: 'nota', gravedad: '', texto: '', actividad_id: '' });
            }}>
                <div className="flex flex-wrap gap-1.5">
                    {['nota', 'observacion', 'problema', 'incidente', 'accidente'].map((t) => (
                        <button type="button" key={t} onClick={() => setN({ ...n, tipo: t })} className={clsx('rounded-full px-3 py-1 text-xs font-bold border-2',
                            n.tipo === t ? (t === 'accidente' || t === 'incidente' ? 'bg-ecopil-red text-white border-ecopil-red' : 'bg-ecopil-sun text-ink border-ecopil-sun') : 'border-gray-700 text-gray-400')}>{t}</button>
                    ))}
                </div>
                <textarea required rows={2} className={inp} placeholder="¿Qué pasó?" value={n.texto} onChange={(e) => setN({ ...n, texto: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                    <select className={inp} value={n.actividad_id} onChange={(e) => setN({ ...n, actividad_id: e.target.value })}>
                        <option value="">Sin actividad</option>
                        {actividades.filter((a) => a.dia === hoy || !DIAS.includes(hoy)).map((a) => <option key={a.id} value={a.id}>{diaCorto(a.dia)} {a.inicio?.slice(0, 5)} {a.titulo.slice(0, 30)}</option>)}
                    </select>
                    <select className={inp} value={n.gravedad} onChange={(e) => setN({ ...n, gravedad: e.target.value })}>
                        <option value="">Gravedad</option><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
                    </select>
                </div>
                <button className="font-futura sticker w-full bg-brand-green text-ink font-extrabold py-2.5 rounded-full">Registrar</button>
            </form>

            {entradas.map((b) => (
                <div key={b.id} className={clsx('rounded-2xl border-2 p-3 space-y-1', b.resuelto ? 'border-gray-800 opacity-60' : ['incidente', 'accidente'].includes(b.tipo) ? 'border-ecopil-red' : 'border-gray-800', 'bg-gray-900')}>
                    <div className="flex items-center gap-2 text-xs">
                        {['incidente', 'accidente', 'problema'].includes(b.tipo) && <AlertTriangle size={14} className="text-ecopil-red" />}
                        <span className="font-extrabold uppercase text-gray-300">{b.tipo}</span>
                        {b.gravedad && <span className="text-gray-500">· {b.gravedad}</span>}
                        <span className="ml-auto text-gray-500">{b.autor} · {new Date(b.created_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-white">{b.texto}</p>
                    {b.actividad_id && <p className="text-xs text-gray-500">{actividades.find((a) => a.id === b.actividad_id)?.titulo}</p>}
                    {b.tipo !== 'nota' && b.tipo !== 'observacion' && (
                        <button onClick={() => guardar('bitacora', { id: b.id, resuelto: !b.resuelto })} className="text-xs font-bold text-brand-green flex items-center gap-1"><Check size={12} /> {b.resuelto ? 'Reabrir' : 'Marcar resuelto'}</button>
                    )}
                </div>
            ))}

            <div className="rounded-2xl bg-gray-900 border-2 border-gray-800 p-3 space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-gray-400"><Megaphone size={14} /> Aviso para todos los asistentes</p>
                <textarea rows={2} className={inp} placeholder="Ej. El autobús sale 15 min tarde" value={aviso.texto} onChange={(e) => setAviso({ ...aviso, texto: e.target.value })} />
                <div className="flex gap-2">
                    <select className={inp} value={aviso.nivel} onChange={(e) => setAviso({ ...aviso, nivel: e.target.value })}>
                        <option value="info">Info</option><option value="importante">Importante</option><option value="urgente">Urgente</option>
                    </select>
                    <button disabled={!aviso.texto} onClick={async () => { await guardar('avisos', aviso); setAviso({ texto: '', nivel: 'info' }); }} className="shrink-0 rounded-xl bg-ecopil-sun px-4 text-sm font-extrabold text-ink disabled:opacity-40">Publicar</button>
                </div>
                {avisos.map((a) => (
                    <div key={a.id} className="flex items-start gap-2 text-sm text-gray-300 border-t border-gray-800 pt-2">
                        <p className="flex-1">{a.texto}</p>
                        <button onClick={() => borrar('avisos', a.id)} className="text-xs text-gray-500">Quitar</button>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Registros({ datos, rpc, escaneado, limpiar }: {
    datos: NonNullable<ReturnType<typeof useGestion>['datos']>; rpc: (fn: string, a: Record<string, unknown>) => Promise<unknown>;
    escaneado: string | null; limpiar: () => void;
}) {
    const [filtro, setFiltro] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente');
    const lista = escaneado ? datos.registros.filter((r) => r.email.toLowerCase() === escaneado) : datos.registros.filter((r) => r.estado === filtro);
    const confirmados = datos.registros.filter((r) => r.confirmado_en).length;
    const revisar = (id: string, estado: string | null, grupo: string | null) => rpc('gestor_revisar_registro', { p_id: id, p_estado: estado, p_grupo: grupo });
    // Al escanear un gafete: pasar lista en la actividad que va según la hora
    const ahora = ahoraHidalgo();
    const delDia = datos.actividades.filter((a) => a.dia === (DIAS.includes(ahora.dia) ? ahora.dia : DIAS[1]) && a.tipo !== 'traslado');
    const actual = [...delDia].reverse().find((a) => a.inicio && a.inicio.slice(0, 5) <= ahora.hm) ?? delDia[0];
    const [actId, setActId] = useState<string | undefined>(undefined);
    const enAct = actId ?? actual?.id;
    const presente = (rid: string) => (datos.asistencias ?? []).some((x) => x.actividad_id === enAct && x.registro_id === rid);
    return (
        <section className="space-y-3">
            {escaneado && (
                <button onClick={limpiar} className="w-full rounded-2xl bg-brand-green/15 border-2 border-brand-green p-3 text-sm font-bold text-brand-green">
                    {lista.length ? 'Gafete escaneado ✓' : 'Ese gafete no está en los registros'} · ver todos
                </button>
            )}
            {escaneado && lista[0]?.estado === 'aprobado' && delDia.length > 0 && (
                <div className="rounded-2xl border-2 border-gray-800 bg-gray-900 p-3 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Pasar lista en</p>
                    <select className={inp} value={enAct} onChange={(e) => setActId(e.target.value)}>
                        {delDia.map((a) => <option key={a.id} value={a.id}>{rango(a)} · {a.titulo}</option>)}
                    </select>
                    {presente(lista[0].id) ? (
                        <p className="text-center text-sm font-bold text-brand-green">Asistencia registrada ✓</p>
                    ) : (
                        <button onClick={() => rpc('gestor_asistencia', { p_actividad: enAct, p_registro: lista[0].id, p_presente: true })}
                            className="font-futura sticker w-full rounded-full bg-brand-green py-2.5 text-sm font-extrabold text-ink">Marcar asistencia</button>
                    )}
                </div>
            )}
            <p className="text-sm text-gray-400">{datos.registros.filter((r) => r.estado === 'aprobado').length} aprobados · {confirmados} confirmaron asistencia</p>
            <div className="flex gap-2">
                {(['pendiente', 'aprobado', 'rechazado'] as const).map((f) => (
                    <button key={f} onClick={() => setFiltro(f)} className={clsx('flex-1 rounded-full py-2 text-xs font-extrabold border-2', filtro === f ? 'sticker bg-ecopil-sun text-ink' : 'border-gray-700 text-gray-400')}>
                        {f} ({datos.registros.filter((r) => r.estado === f).length})
                    </button>
                ))}
            </div>
            {lista.map((r) => (
                <div key={r.id} className="rounded-2xl bg-gray-900 border-2 border-gray-800 p-3 space-y-2">
                    <div className="flex gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.foto_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{r.nombre}</p>
                            <p className="text-xs text-gray-400">{r.nodo} · <a href={`tel:${tel(r.telefono)}`}>{r.telefono}</a></p>
                            <p className="text-xs text-gray-500">Emergencia: {r.emergencia_nombre} {r.emergencia_telefono}</p>
                        </div>
                        {r.confirmado_en && <span className="self-start rounded-full bg-ecopil-leaf px-2 text-[10px] font-extrabold text-ink">Confirmó</span>}
                    </div>
                    <div className="flex gap-2">
                        {r.estado !== 'rechazado' && (['A', 'B'] as const).map((gr) => (
                            <button key={gr} onClick={() => revisar(r.id, r.estado === 'pendiente' ? 'aprobado' : null, gr)}
                                className={clsx('w-10 h-10 rounded-full text-sm font-extrabold border-2', r.grupo === gr ? 'sticker bg-ecopil-sun text-ink' : 'border-gray-600 text-gray-300')}>{gr}</button>
                        ))}
                        <div className="flex-1" />
                        {r.estado !== 'aprobado' && <button onClick={() => revisar(r.id, 'aprobado', null)} className="rounded-full bg-brand-green px-4 text-xs font-extrabold text-ink">Aprobar</button>}
                        {r.estado !== 'rechazado' && <button onClick={() => revisar(r.id, 'rechazado', null)} className="rounded-full border-2 border-gray-600 px-3 text-xs font-bold text-gray-300">Rechazar</button>}
                    </div>
                </div>
            ))}
        </section>
    );
}

function Equipo({ gestores, rpc }: { gestores: { id: string; nombre: string; telefono: string | null; rol: string }[]; rpc: (fn: string, a: Record<string, unknown>) => Promise<unknown> }) {
    const [f, setF] = useState({ nombre: '', telefono: '', pin: '' });
    const [msg, setMsg] = useState('');
    return (
        <section className="space-y-3">
            <p className="text-sm text-gray-400">Da de alta a alguien o cámbiale el PIN. Cada persona entra con su nombre y su PIN, y sus cambios quedan registrados con su nombre.</p>
            <form className="rounded-2xl bg-gray-900 border-2 border-gray-800 p-3 space-y-2" onSubmit={async (e) => {
                e.preventDefault();
                try { await rpc('gestor_admin_guardar', { p_nombre: f.nombre, p_telefono: f.telefono, p_rol: null, p_pin: f.pin || null }); setMsg(`Listo: ${f.nombre}`); setF({ nombre: '', telefono: '', pin: '' }); }
                catch (err) { setMsg(err instanceof Error ? err.message : String(err)); }
            }}>
                <input required list="gestores" className={inp} placeholder="Nombre" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
                <datalist id="gestores">{gestores.map((x) => <option key={x.id} value={x.nombre} />)}</datalist>
                <input className={inp} placeholder="Celular" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} />
                <input className={inp} placeholder="PIN nuevo (mínimo 6)" value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value })} />
                <button className="font-futura sticker w-full bg-brand-green text-ink font-extrabold py-2.5 rounded-full">Guardar</button>
                {msg && <p className="text-xs font-bold text-ecopil-sun">{msg}</p>}
            </form>
            {gestores.map((x) => <p key={x.id} className="text-sm text-gray-300">{x.nombre} <span className="text-gray-500">{x.rol === 'admin' ? '· admin' : ''} {x.telefono ?? ''}</span></p>)}
        </section>
    );
}
