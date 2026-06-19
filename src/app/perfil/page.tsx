'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Profile, PersonalTask, AgendaActivity } from '@/types/database';
import StaffBunker from '@/components/profile/StaffBunker';
import ExecutiveBrief from '@/components/profile/ExecutiveBrief';
import AnnouncementCreator from '@/components/profile/AnnouncementCreator';
import { Megaphone } from 'lucide-react';
import RouteGuard from '@/components/auth/RouteGuard';

export default function ProfilePage() {
    return (
        <RouteGuard requiredRole="volunteer">
            <ProfileContent />
        </RouteGuard>
    );
}

function ProfileContent() {
    const router = useRouter();
    const { user, isAuthenticated, signOut, isLoading } = useAuth();
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

    const handleLogout = () => {
        signOut();
        router.push('/login');
    };

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
                <div className="bg-white/5 p-6 rounded-full mb-4">
                    <User size={48} className="text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Modo Invitado</h2>
                <p className="text-gray-400 mb-8">Inicia sesión para ver tu perfil y estadísticas.</p>
                <button onClick={() => router.push('/login')} className="bg-brand-green text-black px-6 py-3 rounded-xl font-bold">Inicio</button>
            </div>
        );
    }

    const displayProfile: Profile = user;
    const isNational = displayProfile.node === 'Nacional';
    const isAdmin = displayProfile.role === 'admin';

    return (
        <div className="pb-24 pt-20 animate-in fade-in zoom-in duration-500">
            <header className="mb-8 px-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white mb-1">
                        {isNational ? 'Brief Ejecutivo' : 'Mi Búnker'}
                    </h1>
                    <p className="text-gray-400 text-sm">{isNational ? 'Tablero Estratégico' : 'Espacio Personal'}</p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => setIsAnnouncementOpen(true)}
                            className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <Megaphone size={14} /> Aviso
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="bg-status-red/10 text-status-red px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-status-red/20 transition-colors flex items-center gap-2"
                    >
                        <LogOut size={14} /> Salir
                    </button>
                </div>
            </header>

            <div className="px-4 space-y-6">
                {/* ID Card */}
                <div className="glass-card p-6 rounded-[32px] border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

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
                            <h2 className="text-2xl font-bold text-white max-w-[180px] leading-tight mb-1">{displayProfile.full_name}</h2>
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
