'use client';

// Mapa del Encuentro: sedes, ruta por día y "dónde estamos ahora" según la hora.
// Los datos vienen del programa público (mismo que /programa), así que si el
// equipo cambia sedes u horarios en /gestion, el mapa se actualiza solo.
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { Navigation, X, MapPin, Clock } from 'lucide-react';
import { usePublico, ahoraHidalgo, rango, diaCorto, DIAS, SEDES, type Actividad } from '@/lib/encuentro';

// Coordenadas de cada sede (hotel verificado en OpenStreetMap, carretera Jorobas–Tula km 25.8).
const COORD: Record<string, [number, number]> = {
    hotel: [20.0431598, -99.2609751],
    tula: [20.0664861, -99.3358673],
    xoxafi: [20.388324, -99.027607],
    tezontepec: [19.8798145, -98.8192859],
    invictus: [20.07344, -98.81919], // Fundación Invictus, 1 de Mayo 15, El Huixmí (35FJ+98)
    acaxochitlan: [20.1409452, -98.1056043],
    ajolotequio: [20.0843785, -98.3692634],
};
const COLOR_DIA: Record<string, string> = {
    '2026-12-17': '#CBDD8F', '2026-12-18': '#6BB32E', '2026-12-19': '#F9BC3A', '2026-12-20': '#EE8139', '2026-12-21': '#E8434F',
};

const icono = (color: string, n: number | string, ahora: boolean) => L.divIcon({
    className: '',
    html: `<div style="position:relative;width:34px;height:34px">
        ${ahora ? `<div style="position:absolute;inset:-8px;border-radius:50%;background:${color};opacity:.45;animation:ping 1.4s infinite"></div>` : ''}
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};border:3px solid #1C2B20;box-shadow:2px 2px 0 #1C2B20;
        display:flex;align-items:center;justify-content:center;font:800 13px sans-serif;color:#1C2B20">${n}</div></div>`,
    iconSize: [34, 34], iconAnchor: [17, 17],
});

function Encuadre({ puntos }: { puntos: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (puntos.length === 1) map.flyTo(puntos[0], 12, { duration: 0.8 });
        else if (puntos.length > 1) map.flyToBounds(L.latLngBounds(puntos), { padding: [50, 50], duration: 0.8 });
    }, [map, puntos]);
    return null;
}

function MiUbicacion() {
    const map = useMap();
    const [yo, setYo] = useState<[number, number] | null>(null);
    return (
        <>
            {yo && <Marker position={yo} icon={L.divIcon({ className: '', html: '<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 2px #1C2B20"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })} />}
            <button type="button" aria-label="Mi ubicación"
                onClick={() => navigator.geolocation?.getCurrentPosition((p) => { const c: [number, number] = [p.coords.latitude, p.coords.longitude]; setYo(c); map.flyTo(c, 13); })}
                className="sticker absolute bottom-4 right-4 z-[400] rounded-full bg-[var(--t-surface)] p-3 active:scale-95">
                <Navigation size={20} />
            </button>
        </>
    );
}

type Parada = { sede: string; dia: string; acts: Actividad[] };
// Rutas por carretera (calculadas con QGIS + OSRM): public/rutas-encuentro.geojson
type Tramo = { dia: string; de: string; a: string; km: number; min: number; linea: [number, number][] };
const duracion = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);

export default function MainMap() {
    const { datos } = usePublico();
    const { dia: hoy, hm } = ahoraHidalgo();
    const [dia, setDia] = useState<string>(DIAS.includes(hoy) ? hoy : 'todos');
    const [sel, setSel] = useState<Parada | null>(null);
    const [tramos, setTramos] = useState<Tramo[]>([]);
    useEffect(() => {
        fetch('/rutas-encuentro.geojson').then((r) => r.json()).then((g) => setTramos(g.features.map(
            (f: { properties: Omit<Tramo, 'linea'>; geometry: { coordinates: [number, number][] } }) =>
                ({ ...f.properties, linea: f.geometry.coordinates.map(([x, y]) => [y, x] as [number, number]) })))).catch(() => {});
    }, []);

    // Paradas: una por sede y día, en orden del programa
    const paradas = useMemo(() => {
        const out: Parada[] = [];
        for (const a of (datos?.actividades ?? []).filter((x) => x.sede && COORD[x.sede] && x.tipo !== 'preparacion')) {
            const ult = out[out.length - 1];
            if (ult && ult.sede === a.sede && ult.dia === a.dia) ult.acts.push(a);
            else out.push({ sede: a.sede!, dia: a.dia, acts: [a] });
        }
        return out;
    }, [datos]);

    // Sede donde se está ahora (última actividad ya iniciada de hoy)
    const ahora = useMemo(() => {
        let p: Parada | null = null;
        for (const x of paradas) if (x.dia === hoy && x.acts.some((a) => a.inicio && a.inicio.slice(0, 5) <= hm)) p = x;
        return p;
    }, [paradas, hoy, hm]);

    const vis = dia === 'todos' ? paradas : paradas.filter((p) => p.dia === dia);
    const puntos = useMemo(() => vis.map((p) => COORD[p.sede]), [vis]);

    return (
        <div className="relative h-full w-full">
            <style>{'@keyframes ping{75%,100%{transform:scale(1.8);opacity:0}}'}</style>
            <MapContainer center={[20.15, -98.9]} zoom={9} className="h-full w-full" zoomControl={false}>
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                <Encuadre puntos={puntos} />
                {(dia === 'todos' ? DIAS : [dia]).map((d) => {
                    const ts = tramos.filter((t) => t.dia === d);
                    if (ts.length) return ts.map((t, i) => [
                        <Polyline key={`${d}-${i}-b`} positions={t.linea} pathOptions={{ color: '#1C2B20', weight: 7, opacity: 0.8 }} />,
                        <Polyline key={`${d}-${i}`} positions={t.linea} pathOptions={{ color: COLOR_DIA[d], weight: 4, opacity: 1 }} />,
                    ]);
                    const ps = vis.filter((p) => p.dia === d).map((p) => COORD[p.sede]);
                    return ps.length > 1 ? <Polyline key={d} positions={ps} pathOptions={{ color: COLOR_DIA[d], weight: 5, opacity: 0.9, dashArray: '2 10', lineCap: 'round' }} /> : null;
                })}
                {vis.map((p, i) => (
                    <Marker key={`${p.dia}-${p.sede}-${i}`} position={COORD[p.sede]}
                        icon={icono(COLOR_DIA[p.dia], dia === 'todos' ? Number(p.dia.slice(8)) : i + 1, p === ahora)}
                        eventHandlers={{ click: () => setSel(p) }} />
                ))}
                <MiUbicacion />
            </MapContainer>

            {/* Días */}
            <div className="absolute inset-x-3 top-3 z-[400] flex gap-1.5 overflow-x-auto">
                {['todos', ...DIAS].map((d) => (
                    <button key={d} type="button" onClick={() => { setDia(d); setSel(null); }}
                        className={`sticker shrink-0 rounded-full px-3 py-1.5 font-futura text-xs font-extrabold ${dia === d ? 'text-ink' : 'bg-[var(--t-surface)] text-[var(--t-text)]'}`}
                        style={dia === d ? { background: d === 'todos' ? '#CBDD8F' : COLOR_DIA[d] } : undefined}>
                        {d === 'todos' ? 'Todo' : diaCorto(d)}
                    </button>
                ))}
            </div>

            {/* Ahora */}
            {ahora && !sel && (
                <button type="button" onClick={() => setSel(ahora)}
                    className="sticker absolute bottom-4 left-4 right-20 z-[400] rounded-2xl bg-[var(--t-surface)] px-4 py-2 text-left">
                    <p className="font-futura text-[10px] font-extrabold uppercase opacity-70">Ahora estamos en</p>
                    <p className="text-sm font-bold">{SEDES[ahora.sede]}</p>
                </button>
            )}

            {/* Ficha de la sede */}
            {sel && (
                <div className="sticker absolute inset-x-3 bottom-3 z-[500] max-h-[55%] overflow-y-auto rounded-3xl bg-[var(--t-surface)] p-4">
                    <button type="button" onClick={() => setSel(null)} className="absolute right-3 top-3 opacity-60" aria-label="Cerrar"><X size={18} /></button>
                    <p className="font-futura text-[11px] font-extrabold uppercase" style={{ color: COLOR_DIA[sel.dia] }}>{diaCorto(sel.dia)}</p>
                    <h3 className="font-display pr-6 text-xl leading-tight">{SEDES[sel.sede]}</h3>
                    {(() => {
                        const t = tramos.find((x) => x.dia === sel.dia && x.a === sel.sede);
                        return t ? <p className="text-xs opacity-70">Traslado desde {SEDES[t.de]}: {t.km} km · ~{duracion(t.min)}</p> : null;
                    })()}
                    <ul className="mt-2 space-y-1.5">
                        {sel.acts.map((a) => (
                            <li key={a.id} className="flex gap-2 text-sm">
                                <span className="flex w-20 shrink-0 items-center gap-1 tabular-nums opacity-70"><Clock size={12} />{rango(a)}</span>
                                <span>{a.titulo}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 flex gap-2">
                        <a target="_blank" rel="noreferrer"
                            href={sel.acts.find((a) => a.destino_url)?.destino_url
                                ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${COORD[sel.sede][0]},${COORD[sel.sede][1]}`)}`}
                            className="sticker flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-green py-2 font-futura text-xs font-extrabold text-ink">
                            <MapPin size={14} /> Cómo llegar
                        </a>
                        <Link href="/programa" className="sticker flex flex-1 items-center justify-center rounded-full bg-[var(--t-surface)] py-2 font-futura text-xs font-extrabold">
                            Ver programa
                        </Link>
                    </div>
                </div>
            )}

            {datos && paradas.length === 0 && (
                <p className="absolute inset-x-6 top-16 z-[400] rounded-xl bg-[var(--t-surface)] p-3 text-center text-sm">Aún no hay sedes en el programa.</p>
            )}
        </div>
    );
}
