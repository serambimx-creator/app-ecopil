'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import { Project, AgendaActivity } from '@/types/database';
import L from 'leaflet';
import { Calendar, MapPin, ArrowRight, X, Navigation, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import Image from 'next/image';

// --- Custom Components ---

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

const createCustomIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${color}; transition: transform 0.2s;"></div>`,
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

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

type MapMode = 'management' | 'encounter';

export default function MainMap() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activities, setActivities] = useState<AgendaActivity[]>([]);

    // UI State
    const [mode, setMode] = useState<MapMode>('management');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedItem, setSelectedItem] = useState<(Project | AgendaActivity) | null>(null);

    useEffect(() => {
        async function fetchData() {
            // Fetch Projects (Annual Management)
            const { data: projectsData } = await supabase
                .from('projects')
                .select('*')
                .not('latitude', 'is', null);

            // Fetch Activities (Encounter)
            const { data: activitiesData } = await supabase
                .from('agenda_activities')
                .select('*')
                .not('latitude', 'is', null);

            if (projectsData) setProjects(projectsData);
            if (activitiesData) setActivities(activitiesData);
        }

        fetchData();
    }, []);

    // Filter Logic
    const filteredItems = useMemo(() => {
        if (mode === 'management') {
            // "Modo Gestión Anual: muestra todos los pins de la tabla projects de todo el año"
            // "Agrega una función... 'Visualización Histórica'. Debe permitir filtrar por mes."

            // So: Source = Projects. Filter = selectedMonth (based on Created At or Year?)
            // Projects table has `year` and `created_at`.
            // Let's assume we filter by `created_at` month to show "Tracing".
            // If year matches current year (or we ignore year for simplicity of this View V1).

            return projects.filter(p => {
                const d = new Date(p.created_at);
                return d.getMonth() === selectedMonth;
            }).map(p => ({ ...p, type: 'project' })); // Tag for UI

        } else {
            // "Modo Encuentro: solo muestra las actividades del 18 al 21 de diciembre"
            // Source = Activities.
            return activities.filter(a => {
                const d = new Date(a.date);
                // Month is Dec (11) and Day is [18, 21]
                return d.getMonth() === 11 && d.getDate() >= 18 && d.getDate() <= 21;
            }).map(a => ({ ...a, type: 'activity' }));
        }
    }, [mode, selectedMonth, projects, activities]);

    const routePositions = useMemo(() => {
        if (mode !== 'encounter') return [];
        const sorted = [...filteredItems].sort((a, b) => {
            const dateA = new Date((a as any).date).getTime();
            const dateB = new Date((b as any).date).getTime();
            return dateA - dateB;
        });
        return sorted.map(item => [item.latitude!, item.longitude!] as [number, number]);
    }, [filteredItems, mode]);


    const center: [number, number] = [20.1011, -98.7591]; // Pachuca

    return (
        <div className="w-full h-full relative">
            {/* Top Controls Container */}
            <div className="absolute top-4 left-0 right-0 z-[400] flex flex-col items-center gap-3 px-4 pointer-events-none">

                {/* Mode Switcher */}
                <div className="flex gap-2 pointer-events-auto shadow-2xl">
                    <button
                        onClick={() => { setMode('management'); setSelectedItem(null); }}
                        className={clsx(
                            "px-5 py-2 rounded-full text-xs font-bold transition-all border backdrop-blur-md",
                            mode === 'management'
                                ? "bg-brand-green/90 border-brand-green text-dark-surface shadow-[0_0_15px_rgba(0,223,129,0.4)]"
                                : "bg-dark-surface/60 border-white/20 text-white hover:bg-dark-surface/80"
                        )}
                    >
                        Gestión Anual
                    </button>
                    <button
                        onClick={() => { setMode('encounter'); setSelectedItem(null); }}
                        className={clsx(
                            "px-5 py-2 rounded-full text-xs font-bold transition-all border backdrop-blur-md",
                            mode === 'encounter'
                                ? "bg-status-red/90 border-status-red text-white shadow-[0_0_15px_rgba(255,75,75,0.4)]"
                                : "bg-dark-surface/60 border-white/20 text-white hover:bg-dark-surface/80"
                        )}
                    >
                        Encuentro
                    </button>
                </div>

                {/* Month Selector (Only in Management Mode) */}
                {mode === 'management' && (
                    <div className="pointer-events-auto bg-dark-surface/60 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                        <Filter size={12} className="text-gray-400" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer appearance-none pr-4"
                            style={{ backgroundImage: 'none' }} // Remove default arrow if needed, or keeping generic
                        >
                            {MONTHS.map((m, idx) => (
                                <option key={idx} value={idx} className="bg-dark-surface text-gray-200">
                                    {m}
                                </option>
                            ))}
                        </select>
                        {/* Custom tiny arrow emoji or icon could be added here manually if appearance-none used */}
                    </div>
                )}
            </div>

            <MapContainer
                center={center}
                zoom={12}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <LocationMarker />

                {filteredItems.map((item: any) => {
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

                {mode === 'encounter' && routePositions.length > 1 && (
                    <Polyline
                        positions={routePositions}
                        pathOptions={{ color: '#00DF81', weight: 4, opacity: 0.8, dashArray: '8, 8' }}
                    />
                )}
            </MapContainer>

            {/* Bottom Slide-up Mini Card */}
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
                                {/* Image would go here */}
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
        </div>
    );
}
