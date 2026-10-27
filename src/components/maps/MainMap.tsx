'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import { Project, AgendaActivity } from '@/types/database';
import L from 'leaflet';
import { MapPin, ArrowRight, X, Navigation, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/context/ThemeContext';

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
            className="sticker absolute bottom-24 right-4 z-[400] bg-brand-green text-ink p-3 rounded-full active:scale-95 transition-transform"
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
        : `border: 3px solid #22301B; background-color: ${color};`;
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="${borderStyle} width: 24px; height: 24px; border-radius: 50%; box-shadow: 2px 2px 0 #22301B; transition: transform 0.2s;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const STATUS_COLORS: Record<string, string> = {
    red: '#FF4B4B',
    yellow: '#FFD233',
    green: '#6BB32E',
    default: '#3b82f6'
};

// Colores del logo de Ecopil por día del recorrido
const DAY_COLORS: Record<number, string> = {
    18: '#6BB32E',
    19: '#F9BC3A',
    20: '#E8434F',
};

const DAY_LABELS: Record<number, string> = {
    18: '18 DIC',
    19: '19 DIC',
    20: '20–21 DIC',
};

const RECORRIDO_DATA = [
    // Actividades según src/data/itinerario.ts (17–21 dic). El 17 es solo llegada al Hotel City Express Tula.
    { id: 'r1', name: 'Parque Nacional Tula', lat: 20.0664861, lng: -99.3358673, day: 18, activities: ['Heno Motita y Huellas de Fauna', 'Inauguración del encuentro'], tentative: false },
    { id: 'r2', name: 'Grutas de Xoxafi', lat: 20.388324, lng: -99.027607, day: 18, activities: ['Recorrido en grutas', 'Inauguración del mural', 'Feria ambiental', 'Reforestación con maguey'], tentative: false },
    { id: 'r3', name: 'Centro Villa de Tezontepec', lat: 19.8798145, lng: -98.8192859, day: 19, activities: ['Mantenimiento de la reforestación', 'Feria ambiental en el centro'], tentative: false },
    { id: 'r4', name: 'Rocabosque · Mineral del Chico', lat: 20.2150128, lng: -98.7585715, day: 19, activities: ['Capacitación TICs', 'Piñatas Ecopil MX'], tentative: false },
    { id: 'r5', name: 'Cascadas Dos Mundos · Huetziatl', lat: 20.1409452, lng: -98.1056043, day: 20, activities: ['Caminata al manantial', 'Taller de calidad de agua', 'Clausura y sorteo'], tentative: false },
    { id: 'r6', name: 'Ajolotequio · Tulancingo', lat: 20.0843785, lng: -98.3692634, day: 20, activities: ['Tequio (20 dic)', 'Temazcal y campamento', 'Cierre de integración (21 dic)'], tentative: false },
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
    const { theme } = useTheme();
    // Base gris claro u oscura según el tema de la página
    const canvas = theme === 'dark' ? 'Dark_Gray' : 'Light_Gray';
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
                return d.getMonth() === 11 && d.getDate() >= 17 && d.getDate() <= 21;
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
        { key: 'management', label: 'Proyectos', activeClass: 'sticker bg-brand-green text-ink' },
        { key: 'encounter', label: 'Actividades', activeClass: 'sticker bg-ecopil-red text-ink' },
        { key: 'recorrido', label: 'Recorrido', activeClass: 'sticker bg-ecopil-sun text-ink' },
    ];

    return (
        <div className="w-full h-full relative">
            {/* Top Controls */}
            <div className="absolute top-4 left-0 right-0 z-[400] flex flex-col items-center gap-3 px-4 pointer-events-none">
                <div className="flex gap-1.5 pointer-events-auto">
                    {modeButtons.map((btn) => (
                        <button
                            key={btn.key}
                            onClick={() => { setMode(btn.key); setSelectedItem(null); }}
                            className={clsx(
                                "font-futura px-4 py-2 rounded-full text-[11px] font-bold transition-all",
                                mode === btn.key
                                    ? btn.activeClass
                                    : "border-2 border-[var(--t-border)] bg-[var(--t-surface)] text-[var(--t-text)]"
                            )}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {mode === 'management' && (
                    <div className="sticker pointer-events-auto bg-[var(--t-surface)] rounded-full px-4 py-1.5 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <Filter size={12} className="text-[var(--t-text-faint)]" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent text-[var(--t-text)] text-xs font-bold focus:outline-none cursor-pointer appearance-none pr-4"
                            style={{ backgroundImage: 'none' }}
                        >
                            {MONTHS.map((m, idx) => (
                                <option key={idx} value={idx} className="bg-[var(--t-surface)] text-[var(--t-text)]">
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {mode === 'recorrido' && (
                    <div className="pointer-events-auto flex gap-2 animate-in fade-in slide-in-from-top-2">
                        {([18, 19, 20] as const).map((d) => (
                            <span key={d} className="sticker flex items-center gap-1.5 text-[10px] font-bold text-[var(--t-text)] bg-[var(--t-surface)] rounded-full px-3 py-1">
                                <span className="w-2.5 h-2.5 rounded-full border border-ink" style={{ backgroundColor: DAY_COLORS[d] }} />
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
                    <>
                        <TileLayer
                            key={`base-${canvas}`}
                            attribution='&copy; Esri'
                            url={`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${canvas}_Base/MapServer/tile/{z}/{y}/{x}`}
                        />
                        <TileLayer
                            key={`ref-${canvas}`}
                            url={`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${canvas}_Reference/MapServer/tile/{z}/{y}/{x}`}
                        />
                    </>
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
                                <div style={{ fontFamily: 'var(--font-inter), Arial, sans-serif', color: '#22301B', background: '#FBF6EA', margin: '-14px -20px', padding: '16px', borderRadius: '16px', minWidth: '220px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, border: '1.5px solid #22301B' }} />
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#22301B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {DAY_LABELS[point.day]}
                                        </span>
                                        {point.tentative && (
                                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#22301B', background: '#FCE3AE', border: '1px solid #EE8139', padding: '2px 8px', borderRadius: '9999px', marginLeft: 'auto' }}>
                                                TENTATIVO
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ fontFamily: 'var(--font-jost), sans-serif', fontSize: '17px', fontWeight: 600, color: '#22301B', margin: '0 0 10px 0', lineHeight: 1.2 }}>
                                        {point.name}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {point.activities.map((act) => (
                                            <span key={act} style={{ fontSize: '12px', color: '#5F6A52', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ color: '#6BB32E', fontSize: '8px' }}>&#9679;</span> {act}
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
                        pathOptions={{ color: '#F9BC3A', weight: 4, opacity: 0.9, dashArray: '8 6' }}
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
                        <div className="sticker rounded-3xl p-4 relative bg-[var(--t-surface)]">
                            <div className="w-12 h-1 bg-[var(--t-border)] rounded-full mx-auto mb-4" />

                            <div className="flex gap-4">
                                <div className="w-20 h-20 bg-[var(--t-accent-tint-bg)] rounded-2xl flex-shrink-0 relative overflow-hidden flex items-center justify-center text-[var(--t-accent)] border-2 border-[var(--t-accent-tint-border)]">
                                    <MapPin size={24} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-display text-[var(--t-text)] font-semibold text-lg truncate pr-2">
                                            {(selectedItem as any).title || (selectedItem as any).name}
                                        </h3>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                                            className="text-[var(--t-text-faint)] hover:text-[var(--t-text)] bg-[var(--t-overlay-5)] p-1 rounded-full"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <p className="text-[var(--t-text-muted)] text-xs mt-1 truncate">
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

                            <button className="font-futura sticker w-full mt-4 bg-brand-green text-ink font-bold py-3 rounded-full flex items-center justify-center active:scale-[0.98]">
                                Ver Detalles <ArrowRight size={16} className="ml-2" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
