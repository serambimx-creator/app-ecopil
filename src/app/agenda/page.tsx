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

export default function AgendaPage() {
    return (
        <RouteGuard requiredRole="volunteer">
            <AgendaContent />
        </RouteGuard>
    );
}

function AgendaContent() {
    const [activities, setActivities] = useState<AgendaActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(undefined);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [role, setRole] = useState<'admin' | 'coordinator' | 'guest'>('coordinator');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [openDays, setOpenDays] = useState<Set<string>>(new Set(['18 DIC']));

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
        checkRole();
    }, []);

    // Refresh data when drawer closes (in case of edits)
    useEffect(() => {
        if (!isDrawerOpen) fetchActivities();
    }, [isDrawerOpen]);

    async function checkRole() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Check Profile for detailed role/node
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            if (profile) {
                // RULE: National Coordinators (Node National) contain Zuñiga/Dennis -> View Only
                if (profile.node === 'Nacional') {
                    setRole('guest'); // View Only
                    return;
                }

                // Otherwise respect technical role
                if (profile.role === 'admin' || profile.role === 'coordinator') {
                    setRole(profile.role);
                }
            }
        }
    }

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
        // Only Admin/Coordinators can edit
        if (role === 'admin' || role === 'coordinator') {
            setSelectedActivityId(id);
            setIsDrawerOpen(true);
        }
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            <header className="mb-8 px-4 pt-4 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white mb-1">Agenda Operativa</h1>
                    <p className="text-gray-400 text-sm">Cronograma oficial Pachuca 2026</p>
                </div>
                {/* Toggle View */}
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
            </header>

            {viewMode === 'calendar' ? (
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

            {/* FAB for Admin/Coordinator */}
            {(role === 'admin' || role === 'coordinator') && (
                <button
                    onClick={handleCreateClick}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-brand-green text-black rounded-full shadow-[0_0_30px_rgba(0,223,129,0.4)] flex items-center justify-center hover:scale-110 hover:shadow-[0_0_50px_rgba(0,223,129,0.6)] transition-all z-40"
                    aria-label="Nueva Actividad"
                >
                    <Plus size={28} strokeWidth={2.5} />
                </button>
            )}

            {/* Shared Drawer Instance */}
            <ActivityDrawer
                activityId={selectedActivityId}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
            />
        </div>
    );
}
