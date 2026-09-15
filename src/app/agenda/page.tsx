'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AgendaActivity } from '@/types/database';
import { Plus, Loader2, ChevronDown, Route, Lock } from 'lucide-react';
import { ITINERARIO, ACTIVIDAD_EXTRA } from '@/data/itinerario';
import ActivityDrawer from '@/components/dashboard/ActivityDrawer';
import AgendaCalendar from '@/components/dashboard/AgendaCalendar';
import { clsx } from 'clsx';
import { List, Calendar as CalendarIcon } from 'lucide-react';
import RouteGuard from '@/components/auth/RouteGuard';
import { useAuth } from '@/context/AuthContext';

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
        <div className="pb-24 animate-in fade-in duration-500">
            <header className="mb-8 px-4 pt-4 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white mb-1">Agenda Operativa</h1>
                    <p className="text-gray-400 text-sm">
                        {role === 'admin' ? 'Cronograma oficial Pachuca 2026' : 'Adelanto del encuentro'}
                    </p>
                </div>
                {/* Toggle View — solo admin, que es quien ve horarios y edita */}
                {role === 'admin' && (
                    <div className="flex bg-black/40 border border-white/10 rounded-full p-1 shadow-inner">
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-2 rounded-full transition-all text-xs",
                                viewMode === 'list' ? "bg-white/10 text-brand-green shadow-sm" : "text-gray-500 hover:text-white"
                            )}
                            aria-label="Vista de Lista"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={clsx(
                                "p-2 rounded-full transition-all text-xs",
                                viewMode === 'calendar' ? "bg-white/10 text-brand-green shadow-sm" : "text-gray-500 hover:text-white"
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
                    {ITINERARIO.map((bloque) => (
                        <div key={bloque.dia} className="glass-card rounded-3xl border border-white/5 p-5 flex items-center gap-4">
                            <div className="shrink-0 text-center min-w-[52px]">
                                <p className="text-xs font-black text-brand-green uppercase tracking-widest">{bloque.dia}</p>
                            </div>
                            <div className="w-px h-8 bg-white/10 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{bloque.sede}</p>
                                <p className="text-[11px] text-gray-500 mt-1">{bloque.actividades.length} actividades sorpresa</p>
                            </div>
                            <Lock size={16} className="text-gray-500 shrink-0" />
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

                    <p className="text-xs text-gray-500 text-center px-4 pt-2">
                        El itinerario hora por hora se revela para el staff acreditado — ¡prepárate para sorprenderte!
                    </p>
                </div>
            ) : viewMode === 'calendar' ? (
                loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-brand-green" />
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
                    {ITINERARIO.map((bloque) => (
                        <div key={bloque.dia} className="glass-card rounded-3xl border border-white/5 overflow-hidden">
                            <button
                                onClick={() => toggleDay(bloque.dia)}
                                className="w-full flex items-center justify-between p-5 text-left"
                            >
                                <div>
                                    <span className="text-xs font-bold text-brand-green uppercase tracking-widest">
                                        {bloque.dia}
                                    </span>
                                    <p className="text-sm font-bold text-white mt-0.5">{bloque.sede}</p>
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
                                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
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

            {/* FAB — la agenda completa solo la edita un admin. Se coloca arriba del
                asistente flotante (misma esquina) para no encimarse con él. */}
            {role === 'admin' && (
                <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none">
                    <div className="relative w-full app-shell-width h-0">
                        <button
                            onClick={handleCreateClick}
                            className="pointer-events-auto absolute bottom-44 right-6 w-14 h-14 bg-brand-green text-black rounded-full shadow-[0_0_30px_rgba(0,223,129,0.4)] flex items-center justify-center hover:scale-110 hover:shadow-[0_0_50px_rgba(0,223,129,0.6)] transition-all"
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
