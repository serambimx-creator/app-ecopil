'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Info, MapPin, Clock, Star, Bell, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import LocationContext from '@/components/participant/LocationContext';
import { AgendaActivity } from '@/types/database';
import RouteGuard from '@/components/auth/RouteGuard';

// Mock User (Participant)
const USER_ID = 'CURRENT_USER_ID_PLACEHOLDER'; // In real app, auth.getUser()

export default function ParticipantPage() {
    return (
        <RouteGuard requiredRole="volunteer">
            <ParticipantContent />
        </RouteGuard>
    );
}

function ParticipantContent() {
    const [activities, setActivities] = useState<AgendaActivity[]>([]);
    const [assignments, setAssignments] = useState<Set<string>>(new Set());
    const [profile, setProfile] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<AgendaActivity | null>(null);

    useEffect(() => {
        async function loadData() {
            // 1. Profile (Mock fetch or real)
            // For now, let's mock the profile since we don't have Auth fully wired with seeded users
            setProfile({
                full_name: 'Invitado Ecopil',
                node: 'Hidalgo',
                role: 'Voluntario',
                avatar_url: null
            });

            // 2. Fetch Assignments for this user
            const { data: assigns } = await supabase
                .from('activity_assignments')
                .select('activity_id')
                .eq('user_id', USER_ID);

            if (assigns) {
                setAssignments(new Set(assigns.map(a => a.activity_id)));
            }

            // 3. Fetch Validated Activities (Green Only)
            const { data: acts } = await supabase
                .from('agenda_activities')
                .select('*')
                .eq('status', 'green') // Security Filter
                .order('date', { ascending: true }); // By default sort by date (though table is text currently)

            if (acts) {
                // Sort by date properly
                const sorted = acts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setActivities(sorted);
            }

            // 4. Fetch Announcements (Mock for now as table might be empty)
            setAnnouncements([
                { id: 1, title: '¡Bienvenidos!', content: 'Recojan sus kits en el lobby del hotel.', type: 'info' },
                { id: 2, title: 'Cambio de Clima', content: 'Se pronostica lluvia ligera para mañana.', type: 'alert' }
            ]);
        }
        loadData();
    }, []);

    // Helper to group by Day
    const groupedActivities = activities.reduce((acc, curr) => {
        const dateObj = new Date(curr.date);
        const dateStr = dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' }); // "jueves, 18"
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(curr);
        return acc;
    }, {} as Record<string, AgendaActivity[]>);

    return (
        <div className="min-h-screen pb-24 pt-20 bg-black text-white">

            {/* Header: Identity */}
            <div className="pt-8 pb-6 px-6 bg-gradient-to-b from-brand-green/10 to-transparent">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                            <span className="text-xs font-bold text-brand-green uppercase tracking-widest">{profile?.node || 'Visitante'}</span>
                        </div>
                        <h1 className="text-3xl font-black leading-none">{profile?.full_name?.split(' ')[0] || 'Hola'}</h1>
                        <p className="text-gray-400 text-sm mt-1">{profile?.role || 'Participante'}</p>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 p-1">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">Yo</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stories / Announcements */}
            <div className="px-6 mb-8 overflow-x-auto no-scrollbar">
                <div className="flex gap-4">
                    {announcements.map((ann, idx) => (
                        <div key={idx} className="min-w-[200px] h-32 glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden flex-shrink-0 border-white/5">
                            <div className={clsx(
                                "absolute top-0 right-0 p-2 rounded-bl-xl",
                                ann.type === 'alert' ? "bg-status-red text-white" : "bg-brand-green text-black"
                            )}>
                                <Bell size={14} />
                            </div>
                            <h3 className="font-bold text-lg leading-tight mt-2">{ann.title}</h3>
                            <p className="text-xs text-gray-300 line-clamp-2">{ann.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Aesthetic Agenda */}
            <div className="px-6 space-y-8">
                {Object.entries(groupedActivities).map(([dateLabel, acts]) => (
                    <div key={dateLabel} className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <h2 className="text-2xl font-black text-white mb-4 capitalize sticky top-0 bg-black/80 backdrop-blur py-2 z-10">
                            {dateLabel}
                        </h2>
                        <div className="space-y-4">
                            {acts.map((act) => {
                                const isAssigned = assignments.has(act.id);
                                return (
                                    <div
                                        key={act.id}
                                        onClick={() => setSelectedActivity(act)}
                                        className={clsx(
                                            "relative bg-dark-surface rounded-2xl p-0 overflow-hidden border transition-all active:scale-[0.98]",
                                            isAssigned
                                                ? "border-brand-green shadow-[0_0_20px_rgba(0,223,129,0.1)]"
                                                : "border-white/5 hover:border-white/20"
                                        )}
                                    >
                                        {/* Time Strip */}
                                        <div className="absolute left-0 top-0 bottom-0 w-16 bg-white/5 flex flex-col items-center justify-center border-r border-white/5">
                                            <span className="text-lg font-bold text-white">{new Date(act.date).getHours()}:00</span>
                                            <span className="text-[10px] text-gray-500 uppercase">HRS</span>
                                        </div>

                                        <div className="pl-20 pr-4 py-5 min-h-[100px] flex flex-col justify-center">
                                            {isAssigned && (
                                                <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-brand-green mb-1 animate-pulse">
                                                    <Star size={10} fill="currentColor" /> Tu Responsabilidad
                                                </div>
                                            )}

                                            <h3 className="text-white font-bold text-lg leading-snug">{act.title}</h3>

                                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} className={isAssigned ? "text-brand-green" : "text-gray-500"} />
                                                    {act.location ? act.location.split(',')[0] : 'Ubicación pendiente'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 text-gray-500">
                                            <ArrowRight size={24} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Location Context Modal */}
            <LocationContext
                activity={selectedActivity}
                onClose={() => setSelectedActivity(null)}
            />

            {/* Bottom Spacing logic is handled by global layout padding but added here extra margin for safe area */}
            <div className="h-12" />
        </div>
    );
}
