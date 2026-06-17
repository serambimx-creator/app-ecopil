'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import { Project, AgendaActivity } from '@/types/database';
import L from 'leaflet';
import { MapPin, ArrowRight, X, Navigation, Filter } from 'lucide-react';
import { clsx } from 'clsx';

function LocationMarker() {
    const map = useMap();

    const handleLocate = () => {
        map.locate().on("locationfound", function (e) {
            map.flyTo(e.latlng, 14);
        });
    };

    return (
        <button
            onClick={handleLocate}
            className="absolute bottom-24 right-4 z-[400] bg-brand-green/90 text-dark-surface p-3 rounded-full shadow-lg backdrop-blur-sm active:scale-95 transition-transform"
            aria-label="Mi ubicación"
        >
            <Navigation size={24} fill="currentColor" className="opacity-80" />
        </button>
    );
}

function FlyToCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.2 });
    }, [center, zoom, map]);
    return null;
}

const createCustomIcon = (color: string, dashed = false) => {
    const borderStyle = dashed
        ? `border: 3px dashed ${color}; background-color: transparent;`
        : `border: 3px solid white; background-color: ${color};`;
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="${borderStyle} width: 24px; height: 24px; border-radius: 50%; box-shadow: 0 0 10px ${color}; transition: transform 0.2s;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const STATUS_COLORS: Record<string, string> = {
    red: '#FF4B4B',
    yellow: '#FFD233',
    green: '#00DF81',
    default: '#3b82f6'
};

const DAY_COLORS: Record<number, string> = {
    18: '#00DF81',
    19: '#3B82F6',
    20: '#F97316',
};

const DAY_LABELS: Record<number, string> = {
    18: '18 DIC',
    19: '19 DIC',
    20: '20 DIC',
};

const RECORRIDO_DATA = [
    { id: 'r1', name: 'Parque Nacional Tula', lat: 20.0664861, lng: -99.3358673, day: 18, activities: ['Inauguración', 'Taller de henopoita'], tentative: false },
    { id: 'r2', name: 'Grutas de Xoxafi', lat: 20.388324, lng: -99.027607, day: 18, activities: ['Feria ambiental', 'Recorrido'], tentative: false },
    { id: 'r3', name: 'Centro Villa de Tezontepec', lat: 19.8798145, lng: -98.8192859, day: 19, activities: ['Reforestación y mantenimiento', 'Feria ambiental'], tentative: false },
    { id: 'r4', name: 'Rocabosque · Mineral del Chico', lat: 20.2150128, lng: -98.7585715, day: 19, activities: ['Recorrido y capacitación'], tentative: false },
    { id: 'r5', name: 'Cascadas Dos Mundos · Huetziatl', lat: 20.1409452, lng: -98.1056043, day: 20, activities: ['Recorrido en los manantiales', 'Capacitación', 'Feria ambiental'], tentative: false },
    { id: 'r6', name: 'Centro Tulancingo', lat: 20.0843785, lng: -98.3692634, day: 20, activities: ['Visita al ajolotequio'], tentative: true },
];

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

type MapMode = 'management' | 'encounter' | 'recorrido';

interface MainMapProps {
    defaultMode?: MapMode;
}

export default function MainMap({ defaultMode }: MainMapProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activities, setActivities] = useState<AgendaActivity[]>([]);

    const [mode, setMode] = useState<MapMode>(defaultMode || 'management');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedItem, setSelectedItem] = useState<(Project | AgendaActivity) | null>(null);

    useEffect(() => {
        async function fetchData() {
            const { data: projectsData } = await supabase
                .from('projects')
                .select('*')
                .not('latitude', 'is', null);

            const { data: activitiesData } = await supabase
                .from('agenda_activities')
                .select('*')
                .not('latitude', 'is', null);

            if (projectsData) setProjects(projectsData);
            if (activitiesData) setActivities(activitiesData);
        }
        fetchData();
    }, []);

    const filteredItems = useMemo(() => {
        if (mode === 'management') {
            return projects.filter(p => {
                const d = new Date(p.created_at);
                return d.getMonth() === selectedMonth;
            }).map(p => ({ ...p, type: 'project' }));
        } else if (mode === 'encounter') {
            return activities.filter(a => {
                const d = new Date(a.date);
                return d.getMonth() === 11 && d.getDate() >= 18 && d.getDate() <= 21;
            }).map(a => ({ ...a, type: 'activity' }));
        }
        return [];
    }, [mode, selectedMonth, projects, activities]);

    const encounterRoutePositions = useMemo(() => {
        if (mode !== 'encounter') return [];
        const sorted = [...filteredItems].sort((a, b) => {
            const dateA = new Date((a as any).date).getTime();
            const dateB = new Date((b as any).date).getTime();
            return dateA - dateB;
        });
        return sorted.map(item => [item.latitude!, item.longitude!] as [number, number]);
    }, [filteredItems, mode]);

    const recorridoPositions: [number, number][] = RECORRIDO_DATA.map(p => [p.lat, p.lng]);

    const centerDefault: [number, number] = [20.1011, -98.7591];
    const centerRecorrido: [number, number] = [20.15, -98.9];
    const currentCenter = mode === 'recorrido' ? centerRecorrido : centerDefault;
    const currentZoom = mode === 'recorrido' ? 9 : 12;

    const modeButtons: { key: MapMode; label: string; activeClass: string }[] = [
        { key: 'management', label: 'Proyectos', activeClass: 'bg-brand-green/90 border-brand-green text-dark-surface shadow-[0_0_15px_rgba(0,223,129,0.4)]' },
        { key: 'encounter', label: 'Actividades', activeClass: 'bg-status-red/90 border-status-red text-white shadow-[0_0_15px_rgba(255,75,75,0.4)]' },
        { key: 'recorrido', label: 'Recorrido', activeClass: 'bg-orange-500/90 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' },
    ];

    return (
        <div className="w-full h-full relative">
            {/* Top Controls */}
            <div className="absolute top-4 left-0 right-0 z-[400] flex flex-col items-center gap-3 px-4 pointer-events-none">
                <div className="flex gap-1.5 pointer-events-auto shadow-2xl">
                    {modeButtons.map((btn) => (
                        <button
                            key={btn.key}
                            onClick={() => { setMode(btn.key); setSelectedItem(null); }}
                            className={clsx(
                                "px-4 py-2 rounded-full text-[11px] font-bold transition-all border backdrop-blur-md",
                                mode === btn.key
                                    ? btn.activeClass
                                    : "bg-dark-surface/60 border-white/20 text-white hover:bg-dark-surface/80"
                            )}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {mode === 'management' && (
                    <div className="pointer-events-auto bg-dark-surface/60 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                        <Filter size={12} className="text-gray-400" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer appearance-none pr-4"
                            style={{ backgroundImage: 'none' }}
                        >
                            {MONTHS.map((m, idx) => (
                                <option key={idx} value={idx} className="bg-dark-surface text-gray-200">
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {mode === 'recorrido' && (
                    <div className="pointer-events-auto flex gap-2 animate-in fade-in slide-in-from-top-2">
                        {([18, 19, 20] as const).map((d) => (
                            <span key={d} className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-dark-surface/60 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DAY_COLORS[d] }} />
                                {DAY_LABELS[d]}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <MapContainer
                center={currentCenter}
                zoom={currentZoom}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={false}
            >
                {mode === 'recorrido' ? (
                    <TileLayer
                        attribution='&copy; Esri'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                ) : (
                    <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                )}

                <FlyToCenter center={currentCenter} zoom={currentZoom} />
                <LocationMarker />

                {/* Management & Encounter markers */}
                {mode !== 'recorrido' && filteredItems.map((item: any) => {
                    const color = STATUS_COLORS[item.status] || STATUS_COLORS.default;
                    const isSelected = selectedItem?.id === item.id;

                    return (
                        <Marker
                            key={item.id}
                            position={[item.latitude, item.longitude]}
                            icon={createCustomIcon(isSelected ? '#fff' : color)}
                            eventHandlers={{
                                click: () => setSelectedItem(item),
                            }}
                        />
                    );
                })}

                {/* Encounter polyline */}
                {mode === 'encounter' && encounterRoutePositions.length > 1 && (
                    <Polyline
                        positions={encounterRoutePositions}
                        pathOptions={{ color: '#00DF81', weight: 4, opacity: 0.8, dashArray: '8, 8' }}
                    />
                )}

                {/* Recorrido markers */}
                {mode === 'recorrido' && RECORRIDO_DATA.map((point) => {
                    const color = point.tentative ? '#F59E0B' : DAY_COLORS[point.day];
                    return (
                        <Marker
                            key={point.id}
                            position={[point.lat, point.lng]}
                            icon={createCustomIcon(color, point.tentative)}
                        >
                            <Popup className="recorrido-popup" maxWidth={260}>
                                <div style={{ fontFamily: 'system-ui, sans-serif', color: '#fff', background: '#1a1a1a', margin: '-14px -20px', padding: '16px', borderRadius: '12px', minWidth: '220px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {DAY_LABELS[point.day]}
                                        </span>
                                        {point.tentative && (
                                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B', background: '#2a2a1a', padding: '2px 8px', borderRadius: '9999px', marginLeft: 'auto' }}>
                                                TENTATIVO
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', lineHeight: 1.3 }}>
                                        {point.name}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {point.activities.map((act) => (
                                            <span key={act} style={{ fontSize: '12px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: '#00DF81', fontSize: '8px' }}>&#9679;</span> {act}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Recorrido polyline */}
                {mode === 'recorrido' && (
                    <Polyline
                        positions={recorridoPositions}
                        pathOptions={{ color: '#00DF81', weight: 3, opacity: 0.7 }}
                    />
                )}
            </MapContainer>

            {/* Bottom card (management/encounter modes only) */}
            {mode !== 'recorrido' && (
                <div
                    className={clsx(
                        "absolute bottom-0 left-0 right-0 z-[500] p-4 transition-transform duration-500 ease-in-out",
                        selectedItem ? "translate-y-0" : "translate-y-full"
                    )}
                >
                    {selectedItem && (
                        <div className="glass-card rounded-3xl p-4 shadow-2xl border-t border-white/20 relative backdrop-blur-xl bg-dark-surface/90">
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

                            <div className="flex gap-4">
                                <div className="w-20 h-20 bg-white/10 rounded-2xl flex-shrink-0 relative overflow-hidden flex items-center justify-center text-white/20 border border-white/5">
                                    <MapPin size={24} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-white font-bold text-lg truncate pr-2">
                                            {(selectedItem as any).title || (selectedItem as any).name}
                                        </h3>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                                            className="text-gray-400 hover:text-white bg-white/5 p-1 rounded-full"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <p className="text-gray-400 text-xs mt-1 truncate">
                                        {(selectedItem as any).description || "Sin descripción disponible."}
                                    </p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <span className={clsx(
                                            "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold text-dark-surface",
                                            selectedItem.status === 'green' ? 'bg-brand-green' :
                                                selectedItem.status === 'red' ? 'bg-status-red' :
                                                    selectedItem.status === 'yellow' ? 'bg-status-yellow' : 'bg-blue-400'
                                        )}>
                                            {selectedItem.status === 'green' ? 'COMPLETADO' : selectedItem.status === 'red' ? 'PENDIENTE' : selectedItem.status || 'PROYECTO'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-4 bg-white text-dark-surface font-extrabold py-3 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg active:scale-[0.98]">
                                Ver Detalles <ArrowRight size={16} className="ml-2" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
