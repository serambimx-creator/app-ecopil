'use client';

// Resumen de indicadores del Encuentro y descargas CSV para armar el reporte.
import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { useInfoRegistros } from '@/lib/infoRegistros';
import { nombreIndicador, diaCorto, rango, SEDES, type DatosGestion } from '@/lib/encuentro';

type Fila = Record<string, string | number | boolean | null | undefined>;

function descargar(nombre: string, filas: Fila[]) {
    if (!filas.length) return;
    const cols = Object.keys(filas[0]);
    const esc = (v: unknown) => { const t = v == null ? '' : String(v); return /[",\n;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
    const csv = '﻿' + [cols.join(','), ...filas.map((f) => cols.map((c) => esc(f[c])).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `encuentro-${nombre}.csv`; a.click(); URL.revokeObjectURL(a.href);
}

const Dato = ({ n, t }: { n: string | number; t: string }) => (
    <div className="rounded-2xl bg-gray-900 border-2 border-gray-800 p-3">
        <p className="font-display text-2xl font-semibold text-white tabular-nums">{n}</p>
        <p className="text-[11px] text-gray-400">{t}</p>
    </div>
);

export default function Reporte({ d, token }: { d: DatosGestion; token: string }) {
    const { info } = useInfoRegistros(token, d.registros);
    const asis = useMemo(() => d.asistencias ?? [], [d.asistencias]);
    const inds = useMemo(() => d.indicadores ?? [], [d.indicadores]);
    const enc = useMemo(() => d.encuesta ?? [], [d.encuesta]);
    const reg = d.registros;
    const aprobados = reg.filter((r) => r.estado === 'aprobado');
    const actById = useMemo(() => new Map(d.actividades.map((a) => [a.id, a])), [d.actividades]);
    const regById = useMemo(() => new Map(reg.map((r) => [r.id, r])), [reg]);

    const asistieron = new Set(asis.map((a) => a.registro_id)).size;
    const porAct = useMemo(() => {
        const m = new Map<string, number>(); asis.forEach((a) => m.set(a.actividad_id, (m.get(a.actividad_id) ?? 0) + 1));
        return [...m.entries()].map(([id, n]) => ({ a: actById.get(id), n })).filter((x) => x.a).sort((x, y) => (x.a!.dia + x.a!.inicio).localeCompare(y.a!.dia + y.a!.inicio));
    }, [asis, actById]);
    const totales = useMemo(() => {
        const m = new Map<string, { v: number; u: string | null }>();
        inds.forEach((i) => { const t = m.get(i.clave) ?? { v: 0, u: i.unidad }; t.v += Number(i.valor); m.set(i.clave, t); });
        return [...m.entries()];
    }, [inds]);
    const califs = enc.map((e) => e.calificacion).filter((x): x is number => x != null);
    const prom = califs.length ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1) : '–';
    const volverian = enc.filter((e) => e.volveria).length;
    const bit = d.bitacora;

    const descargas: [string, () => Fila[]][] = [
        ['registros', () => reg.map((r) => ({ nombre: r.nombre, nodo: r.nodo, ciudad: r.ciudad, estado: r.estado, grupo: r.grupo, confirmo: !!r.confirmado_en,
            actividades_asistidas: asis.filter((a) => a.registro_id === r.id).length, registrado: r.created_at,
            carta_folio: info?.[r.id]?.folio ?? '', temazcal: info?.[r.id]?.extras?.temazcal ?? '', acampada: info?.[r.id]?.extras?.acampada ?? '', pajareada: info?.[r.id]?.extras?.pajareada ?? '' }))],
        ['asistencia', () => asis.map((a) => { const x = actById.get(a.actividad_id); const r = regById.get(a.registro_id);
            return { dia: x?.dia, hora: x ? rango(x) : '', actividad: x?.titulo, sede: x?.sede ? SEDES[x.sede] : '', persona: r?.nombre, nodo: r?.nodo }; })],
        ['indicadores', () => inds.map((i) => { const x = i.actividad_id ? actById.get(i.actividad_id) : undefined;
            return { dia: i.dia ?? x?.dia, actividad: x?.titulo, sede: x?.sede ? SEDES[x.sede] : '', indicador: nombreIndicador(i.clave), valor: i.valor, unidad: i.unidad, capturo: i.autor }; })],
        ['evidencias', () => (d.evidencias ?? []).map((e) => { const x = e.actividad_id ? actById.get(e.actividad_id) : undefined;
            return { dia: x?.dia, actividad: x?.titulo, foto: e.foto_url, nota: e.nota }; })],
        ['bitacora', () => bit.map((b) => ({ fecha: b.created_at, tipo: b.tipo, gravedad: b.gravedad, texto: b.texto, resuelto: b.resuelto, autor: b.autor,
            actividad: b.actividad_id ? actById.get(b.actividad_id)?.titulo : '' }))],
        ['encuesta', () => enc.map((e) => ({ calificacion: e.calificacion, lo_mejor: e.lo_mejor, mejorar: e.mejorar, compromiso: e.compromiso, volveria: e.volveria, fecha: e.created_at }))],
    ];

    return (
        <section className="space-y-5">
            {!d.asistencias && <p className="rounded-xl bg-ecopil-sun/20 p-3 text-xs text-ecopil-sun">Falta correr indicadores.sql en Supabase para capturar asistencia, indicadores y encuesta.</p>}
            <div className="grid grid-cols-2 gap-2">
                <Dato n={reg.length} t="Registros" />
                <Dato n={aprobados.length} t={`Aprobados · ${reg.filter((r) => r.confirmado_en).length} confirmaron`} />
                <Dato n={new Set(aprobados.map((r) => r.nodo)).size} t="Nodos representados" />
                <Dato n={asistieron} t="Personas con asistencia registrada" />
                {info && <>
                    <Dato n={aprobados.filter((r) => info[r.id]?.folio).length} t="Aprobados con carta compromiso" />
                    <Dato n={aprobados.filter((r) => info[r.id]?.extras?.temazcal).length} t="Aprobados que van al temazcal" />
                    <Dato n={aprobados.filter((r) => info[r.id]?.extras?.acampada).length} t="Aprobados que acampan en Ajolotequio" />
                    <Dato n={aprobados.filter((r) => info[r.id]?.extras?.pajareada).length} t="Aprobados que van a la pajareada" />
                </>}
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Resultados</p>
                {totales.length === 0 && <p className="text-sm text-gray-500">Aún no hay indicadores capturados. Se agregan desde cada actividad del cronograma.</p>}
                <div className="grid grid-cols-2 gap-2">
                    {totales.map(([k, t]) => <Dato key={k} n={`${t.v.toLocaleString('es-MX')}${t.u ? ` ${t.u}` : ''}`} t={nombreIndicador(k)} />)}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Asistencia por actividad</p>
                {porAct.length === 0 && <p className="text-sm text-gray-500">Sin listas todavía.</p>}
                {porAct.map(({ a, n }) => (
                    <div key={a!.id} className="flex items-center gap-2 text-sm">
                        <span className="w-14 shrink-0 text-xs text-gray-500">{diaCorto(a!.dia)}</span>
                        <span className="flex-1 truncate text-white">{a!.titulo}</span>
                        <span className="font-bold text-white tabular-nums">{n}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
                <Dato n={bit.filter((b) => b.tipo === 'incidente').length} t="Incidentes" />
                <Dato n={bit.filter((b) => b.tipo === 'accidente').length} t="Accidentes" />
                <Dato n={(d.evidencias ?? []).length} t="Fotos de evidencia" />
            </div>

            <div className="grid grid-cols-3 gap-2">
                <Dato n={enc.length} t="Encuestas" />
                <Dato n={prom} t="Calificación promedio (1–5)" />
                <Dato n={enc.length ? `${Math.round((volverian / enc.length) * 100)}%` : '–'} t="Volvería" />
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Descargar para el reporte (Excel)</p>
                <div className="grid grid-cols-2 gap-2">
                    {descargas.map(([n, f]) => (
                        <button key={n} onClick={() => descargar(n, f())} className="flex items-center justify-center gap-1.5 rounded-full border-2 border-gray-700 py-2 text-xs font-bold capitalize text-gray-200">
                            <Download size={13} /> {n}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
