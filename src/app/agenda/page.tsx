'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AgendaActivity } from '@/types/database';
import { Plus, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
        <div className="pb-24 pt-20 animate-in fade-in duration-500">
            <header className="mb-8 px-4 flex items-end justify-between">
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

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-brand-green" />
                </div>
            ) : viewMode === 'calendar' ? (
                <AgendaCalendar
                    activities={activities}
                    onActivityClick={handleActivityClick}
                    role={role}
                />
            ) : (
                <div className="space-y-4 px-4">
                    {activities.length === 0 && (
                        <div className="text-center py-10 text-gray-500 opacity-50">
                            No hay actividades programadas.
                        </div>
                    )}

                    {activities.map((activity, index) => {
                        const isSameDay = index > 0 &&
                            new Date(activity.date).toDateString() === new Date(activities[index - 1].date).toDateString();

                        return (
                            <div key={activity.id}>
                                {/* Date Divider */}
                                {(!isSameDay || index === 0) && (
                                    <div className="sticky top-20 z-10 py-2 bg-dark-surface/95 backdrop-blur-sm mb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-green/10 px-3 py-1 rounded-full border border-brand-green/20">
                                            {format(new Date(activity.date), "EEEE d 'de' MMMM", { locale: es })}
                                        </span>
                                    </div>
                                )}

                                {/* Activity Card */}
                                <div
                                    onClick={() => handleActivityClick(activity.id)}
                                    className={clsx(
                                        "group relative glass-card p-5 rounded-3xl border border-white/5 transition-all duration-300",
                                        (role === 'admin' || role === 'coordinator') && "hover:bg-white/10 cursor-pointer active:scale-[0.98]"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        {/* Time Column */}
                                        <div className="flex flex-col items-center min-w-[60px] pt-1">
                                            <span className="text-xl font-bold text-white">
                                                {format(new Date(activity.date), "HH:mm")}
                                            </span>
                                            <div className="h-full w-px bg-white/10 my-2 group-last:hidden" />
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-bold text-white leading-tight">
                                                    {activity.title}
                                                </h3>
                                                {/* Status Indicator */}
                                                <div className={clsx(
                                                    "w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_10px]",
                                                    activity.status === 'red' ? "bg-status-red shadow-status-red/50" :
                                                        activity.status === 'green' ? "bg-brand-green shadow-brand-green/50" :
                                                            "bg-status-yellow shadow-status-yellow/50"
                                                )} />
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <MapPin size={14} className="text-gray-500" />
                                                <span className="truncate max-w-[200px]">{activity.location || 'Ubicación por definir'}</span>
                                            </div>

                                            {(role === 'admin' || role === 'coordinator') && (
                                                <div className="pt-2 flex items-center text-xs text-brand-green font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Editar actividad <ChevronRight size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
