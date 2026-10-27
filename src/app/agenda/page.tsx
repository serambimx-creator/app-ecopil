'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AgendaActivity } from '@/types/database';
import { Plus, Loader2, ChevronDown, Route } from 'lucide-react';
import { ITINERARIO, ACTIVIDAD_EXTRA } from '@/data/itinerario';
import ActivityDrawer from '@/components/dashboard/ActivityDrawer';
import AgendaCalendar from '@/components/dashboard/AgendaCalendar';
import { clsx } from 'clsx';
import { List, Calendar as CalendarIcon } from 'lucide-react';
import RouteGuard from '@/components/auth/RouteGuard';
import { useAuth } from '@/context/AuthContext';
import Mixtli from '@/components/brand/Mixtli';

// Un color del logo de Ecopil por día (mismo orden que la portada)
const DAY_COLORS = ['bg-brand-green', 'bg-ecopil-sun', 'bg-ecopil-orange', 'bg-ecopil-leaf', 'bg-mixtli'];

export default function AgendaPage() {
    return (
        <RouteGuard requiredRole="volunteer">
            <AgendaContent />
        </RouteGuard>
    );
}

function AgendaContent() {
    const { user } = useAuth();
    const [activities, setActivities] = useState<AgendaActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(undefined);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [openDays, setOpenDays] = useState<Set<string>>(new Set(['18 DIC']));

    // La agenda completa (horarios, edición) es exclusiva de admins.
    // Coordinadores nacionales y voluntarios ven el resumen público (crea expectativa, no revela el detalle).
    const role: 'admin' | 'guest' = user?.role === 'admin' && user?.node !== 'Nacional' ? 'admin' : 'guest';

    const toggleDay = (dia: string) => {
        setOpenDays(prev => {
            const next = new Set(prev);
            if (next.has(dia)) next.delete(dia);
            else next.add(dia);
            return next;
        });
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    // Refresh data when drawer closes (in case of edits)
    useEffect(() => {
        if (!isDrawerOpen) fetchActivities();
    }, [isDrawerOpen]);

    async function fetchActivities() {
        setLoading(true);
        const { data } = await supabase
            .from('agenda_activities')
            .select('*')
            .order('date', { ascending: true });

        if (data) setActivities(data);
        setLoading(false);
    }

    const handleCreateClick = () => {
        setSelectedActivityId(undefined); // New Activity
        setIsDrawerOpen(true); // Open Drawer
    };

    const handleActivityClick = (id: string) => {
        // La agenda completa solo la edita un admin
        if (role === 'admin') {
            setSelectedActivityId(id);
            setIsDrawerOpen(true);
        }
    };

    return (
        <div data-theme="dark" className="pb-24 animate-in fade-in duration-500">
            <header className="mb-8 px-4 pt-4 flex items-end justify-between">
                <div>
                    <h1 className="font-display text-3xl font-semibold text-white mb-1">Agenda operativa</h1>
                    <p className="text-gray-400 text-sm">
                        {role === 'admin' ? 'Cronograma oficial Hidalgo 2026' : 'Adelanto del encuentro'}
                    </p>
                </div>
                {/* Toggle View — solo admin, que es quien ve horarios y edita */}
                {role === 'admin' && (
                    <div className="flex bg-black/40 border border-white/10 rounded-full p-1 shadow-inner">
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-2 rounded-full transition-all text-xs",
                                viewMode === 'list' ? "bg-brand-green text-ink" : "text-gray-500 hover:text-white"
                            )}
                            aria-label="Vista de Lista"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={clsx(
                                "p-2 rounded-full transition-all text-xs",
                                viewMode === 'calendar' ? "bg-brand-green text-ink" : "text-gray-500 hover:text-white"
                            )}
                            aria-label="Vista de Calendario"
                        >
                            <CalendarIcon size={18} />
                        </button>
                    </div>
                )}
            </header>

            {role !== 'admin' ? (
                <div className="space-y-3 px-4">
                    {ITINERARIO.map((bloque, i) => {
                        const isExpanded = openDays.has(bloque.dia);
                        const [num, mes] = bloque.dia.split(' ');
                        return (
                            <button
                                key={bloque.dia}
                                onClick={() => toggleDay(bloque.dia)}
                                className="w-full glass-card rounded-3xl border border-white/5 p-5 flex items-center gap-4 text-left transition-colors hover:bg-white/5"
                            >
                                <div className={clsx("sticker shrink-0 w-14 rounded-2xl py-1.5 text-center text-ink", DAY_COLORS[i % DAY_COLORS.length])}>
                                    <p className="font-display text-2xl font-semibold leading-none">{num}</p>
                                    <p className="text-[9px] font-extrabold tracking-widest mt-0.5">{mes}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={clsx("text-sm font-bold text-white", !isExpanded && "truncate")}>{bloque.sede}</p>
                                    <p className="text-xs text-gray-400 mt-1 leading-snug">{bloque.teaser}</p>
                                </div>
                            </button>
                        );
                    })}

                    <div className="border border-dashed border-white/20 rounded-3xl p-5 mt-2">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-gray-400">+</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-300">{ACTIVIDAD_EXTRA.titulo}</p>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    Actividad extra · Opcional
                                </span>
                                <p className="text-xs text-gray-500 mt-1">{ACTIVIDAD_EXTRA.descripcion}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                        <Mixtli pose="sembrando" height={70} />
                        <p className="text-xs text-gray-400 max-w-[180px]">
                            Cinco días para conectar, aprender y dejar huella — ¡te esperamos!
                        </p>
                    </div>
                </div>
            ) : viewMode === 'calendar' ? (
                loading ? (
                    <div className="flex flex-col items-center gap-2 py-16">
                        <Mixtli pose="asoma" height={90} animated />
                        <Loader2 className="animate-spin text-brand-green" size={18} />
                    </div>
                ) : (
                    <AgendaCalendar
                        activities={activities}
                        onActivityClick={handleActivityClick}
                        role={role}
                    />
                )
            ) : (
                <div className="space-y-3 px-4">
                    {ITINERARIO.map((bloque, i) => (
                        <div key={bloque.dia} className="glass-card rounded-3xl border border-white/5 overflow-hidden">
                            <button
                                onClick={() => toggleDay(bloque.dia)}
                                className="w-full flex items-center justify-between p-5 text-left"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={clsx("sticker shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-ink", DAY_COLORS[i % DAY_COLORS.length])}>
                                        {bloque.dia}
                                    </span>
                                    <p className="text-sm font-bold text-white">{bloque.sede}</p>
                                </div>
                                <ChevronDown
                                    size={18}
                                    className={clsx(
                                        "text-gray-400 transition-transform duration-300 shrink-0",
                                        openDays.has(bloque.dia) && "rotate-180"
                                    )}
                                />
                            </button>

                            {openDays.has(bloque.dia) && (
                                <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
                                    {bloque.actividades.map((act, i) => (
                                        <div key={i} className="flex gap-3">
                                            <span className="shrink-0 w-20 flex items-center justify-center pt-0.5">
                                                {act.esTraslado ? (
                                                    <Route size={13} className="text-gray-600" />
                                                ) : act.hora ? (
                                                    <span className="text-xs text-gray-500 font-mono">{act.hora}</span>
                                                ) : (
                                                    <span className="text-brand-green text-lg leading-none">●</span>
                                                )}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {act.esTraslado ? (
                                                        <span className="text-sm text-gray-500">→ {act.titulo}</span>
                                                    ) : (
                                                        <span className="text-sm font-medium text-white">{act.titulo}</span>
                                                    )}
                                                    {act.pendiente && !act.esTraslado && (
                                                        <span className="text-[10px] font-bold text-ecopil-sun bg-ecopil-sun/10 border border-ecopil-sun/30 px-2 py-0.5 rounded-full">
                                                            Pendiente logística
                                                        </span>
                                                    )}
                                                </div>
                                                {act.detalle && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{act.detalle}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="border border-dashed border-white/20 rounded-3xl p-5 mt-2">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-gray-400">+</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-300">{ACTIVIDAD_EXTRA.titulo}</p>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    Actividad extra · Opcional
                                </span>
                                <p className="text-xs text-gray-500 mt-1">{ACTIVIDAD_EXTRA.descripcion}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FAB — la agenda completa solo la edita un admin. */}
            {role === 'admin' && (
                <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none">
                    <div className="relative w-full app-shell-width h-0">
                        <button
                            onClick={handleCreateClick}
                            className="sticker pointer-events-auto absolute bottom-24 right-6 w-14 h-14 bg-brand-green text-ink rounded-full flex items-center justify-center hover:scale-110 transition-all"
                            aria-label="Nueva Actividad"
                        >
                            <Plus size={28} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {/* Shared Drawer Instance — solo admin */}
            {role === 'admin' && (
                <ActivityDrawer
                    activityId={selectedActivityId}
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                />
            )}
        </div>
    );
}
