'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, FileText, Trophy, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Profile, PersonalTask, AgendaActivity } from '@/types/database';
import StaffBunker from '@/components/profile/StaffBunker';
import ExecutiveBrief from '@/components/profile/ExecutiveBrief';
import AnnouncementCreator from '@/components/profile/AnnouncementCreator';
import { Megaphone } from 'lucide-react';
import RouteGuard from '@/components/auth/RouteGuard';
import Mixtli from '@/components/brand/Mixtli';

export default function ProfilePage() {
    return (
        <RouteGuard requiredRole="volunteer">
            <ProfileContent />
        </RouteGuard>
    );
}

function ProfileContent() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

    // Data for components
    const [assignments, setAssignments] = useState<any[]>([]);
    const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
    const [allActivities, setAllActivities] = useState<AgendaActivity[]>([]);
    const [agreements, setAgreements] = useState<string[]>([]);

    // ... existing stats logic ...
    const stats = {
        pendingTasks: personalTasks.filter(t => !t.is_completed).length,
        completedTasks: personalTasks.filter(t => t.is_completed).length,
        assignedActivities: assignments.length
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchDashboardData(user.id);
        }
    }, [isAuthenticated, user]);

    // ... existing fetchDashboardData ...

    async function fetchDashboardData(userId: string) {
        try {
            // 1. Fetch Assignments (Staff)
            const { data: assigns } = await supabase
                .from('activity_assignments')
                .select('*, agenda_activities(title)')
                .eq('user_id', userId);

            if (assigns) {
                const formatted = assigns.map((a: any) => ({
                    ...a,
                    activity_title: a.agenda_activities?.title
                }));
                setAssignments(formatted);
            }

            // 2. Fetch Personal Tasks (Staff)
            const { data: tasks } = await supabase
                .from('personal_tasks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (tasks) setPersonalTasks(tasks);

            // 3. Fetch All Activities (National Brief)
            const { data: activities } = await supabase.from('agenda_activities').select('*');
            if (activities) {
                setAllActivities(activities);
                const ags = activities.filter(a => a.agreements).map(a => a.agreements!);
                setAgreements(ags);
            }

        } catch (error) {
            console.error("Dashboard fetch error", error);
        }
    }

    const handleAddTask = (title: string) => {
        // ... handled in subcomponent usually, but keeping context
    };

    const handleToggleTask = (id: string) => {
        setPersonalTasks(prev => prev.map(t =>
            t.id === id ? { ...t, is_completed: !t.is_completed } : t
        ));
    };

    if (isLoading) {
        return <div className="min-h-screen bg-dark-surface flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" /></div>;
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                {/* ... Guest View ... */}
                <Mixtli pose="asoma" height={110} className="mb-4" />
                <h2 className="font-display text-2xl font-semibold text-white mb-2">Modo invitado</h2>
                <p className="text-gray-400 mb-8">Inicia sesión para ver tu perfil y estadísticas.</p>
                <button onClick={() => router.push('/login')} className="font-futura sticker bg-brand-green text-ink px-6 py-3 rounded-full font-bold">Iniciar sesión</button>
            </div>
        );
    }

    const displayProfile: Profile = user;
    const isNational = displayProfile.node === 'Nacional';
    const isAdmin = displayProfile.role === 'admin';

    return (
        <div data-theme="dark" className="pb-24 animate-in fade-in zoom-in duration-500">
            <header className="mb-8 px-4 pt-4 flex justify-between items-end">
                <div>
                    <h1 className="font-display text-3xl font-semibold text-white mb-1">
                        {isNational ? 'Brief Ejecutivo' : 'Mi Búnker'}
                    </h1>
                    <p className="text-gray-400 text-sm">{isNational ? 'Tablero Estratégico' : 'Espacio Personal'}</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsAnnouncementOpen(true)}
                        className="font-futura sticker bg-ecopil-sun text-ink px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                        <Megaphone size={14} /> Aviso
                    </button>
                )}
            </header>

            <div className="px-4 space-y-6">
                {/* ID Card */}
                <div className="glass-card p-6 rounded-[32px] border border-white/10 relative overflow-hidden group">

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-brand-green p-1">
                            <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden relative">
                                {displayProfile.avatar_url ? (
                                    <img src={displayProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500" size={32} />
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="font-display text-2xl font-semibold text-white max-w-[180px] leading-tight mb-1">{displayProfile.full_name}</h2>
                            <div className="flex items-center gap-2 text-brand-green font-mono text-sm">
                                <span className="bg-brand-green/20 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider">
                                    {displayProfile.role === 'admin' ? 'Líder' : 'Staff'}
                                </span>
                                <span>•</span>
                                <span>{displayProfile.node || 'Nodo Nacional'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Tools */}
                {isAdmin && (
                    <section className="space-y-3">
                        <h3 className="font-futura text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Herramientas de Administrador</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => router.push('/admin/reportes')}
                                className="glass-card border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors active:scale-95"
                            >
                                <span className="sticker flex h-9 w-9 items-center justify-center rounded-full bg-ecopil-leaf text-ink"><FileText size={17} /></span>
                                <span className="text-xs font-bold text-gray-300">Reportes</span>
                            </button>
                            <button
                                onClick={() => router.push('/admin/sorteo')}
                                className="glass-card border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors active:scale-95"
                            >
                                <span className="sticker flex h-9 w-9 items-center justify-center rounded-full bg-ecopil-sun text-ink"><Trophy size={17} /></span>
                                <span className="text-xs font-bold text-gray-300">Sorteo</span>
                            </button>
                            <button
                                onClick={() => router.push('/admin/historial')}
                                className="glass-card border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors active:scale-95"
                            >
                                <span className="sticker flex h-9 w-9 items-center justify-center rounded-full bg-mixtli text-ink"><History size={17} /></span>
                                <span className="text-xs font-bold text-gray-300">Historial</span>
                            </button>
                        </div>
                    </section>
                )}

                {/* Smart Dashboard Switch */}
                {isNational ? (
                    <ExecutiveBrief activities={allActivities} agreements={agreements} />
                ) : (
                    <StaffBunker
                        profile={displayProfile}
                        stats={stats}
                        assignments={assignments}
                        personalTasks={personalTasks}
                        onAddTask={handleAddTask}
                        onToggleTask={handleToggleTask}
                    />
                )}

            </div>
            {/* Announcement Modal (Admin) */}
            <AnnouncementCreator open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen} />
        </div>
    );
}
