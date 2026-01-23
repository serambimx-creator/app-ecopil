'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Project, AgendaActivity, Finance, ActivityAssignment, PersonalTask } from '@/types/database';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';
import PersonalBunker from '@/components/dashboard/PersonalBunker';
import ReportPreview from '@/components/dashboard/ReportPreview';
import TeamChat from '@/components/chat/TeamChat';

// Mock User ID (Replace with real Auth later - passed as prop ideally, or context)
const USER_ID = 'CURRENT_USER_ID_PLACEHOLDER';

interface WarRoomProps {
    role?: 'admin' | 'coordinator';
}

export default function WarRoom({ role = 'admin' }: WarRoomProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activities, setActivities] = useState<AgendaActivity[]>([]);
    const [finances, setFinances] = useState<Finance[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        setLoading(true);
        try {
            // 1. Fetch Global Data
            const { data: proj } = await supabase.from('projects').select('*');
            const { data: act } = await supabase.from('agenda_activities').select('*');
            const { data: fin } = await supabase.from('finances').select('*');

            if (proj) setProjects(proj);
            if (act) setActivities(act);
            if (fin) setFinances(fin);

            // 2. Fetch User Specific Data
            const { data: tasks } = await supabase
                .from('personal_tasks')
                .select('*')
                .eq('user_id', USER_ID)
                .order('created_at', { ascending: false });
            if (tasks) setPersonalTasks(tasks);

            const { data: assigns } = await supabase
                .from('activity_assignments')
                .select('*, agenda_activities(title)')
                .eq('user_id', USER_ID);

            if (assigns) {
                // Flatten structure for easier consumption
                const formatted = assigns.map((a: any) => ({
                    ...a,
                    activity_title: a.agenda_activities?.title
                }));
                setAssignments(formatted);
            }

        } catch (error) {
            console.error('WarRoom Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers for Bunker
    const handleAddPrivateTask = async (title: string) => {
        const newTask = {
            id: crypto.randomUUID(),
            user_id: USER_ID,
            title,
            is_completed: false,
            created_at: new Date().toISOString()
        };

        // Optimistic UI
        setPersonalTasks([newTask, ...personalTasks]);

        // DB Call
        // await supabase.from('personal_tasks').insert(newTask); 
    };

    const handleTogglePrivateTask = async (taskId: string) => {
        setPersonalTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
        ));

        // DB Call
        // await supabase.from('personal_tasks').update({ is_completed: ... }).eq('id', taskId);
    };

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando War Room...</div>
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-24">

            <header className="mb-6">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                    War Room
                </h1>
                <p className="text-gray-400 font-medium">Panel de Control Estratégico</p>
            </header>

            {/* 1. Widgets Grid */}
            <DashboardWidgets
                projects={projects}
                activities={activities}
                finances={finances}
            />

            <div className="grid md:grid-cols-2 gap-6 h-[500px] md:h-auto">
                {/* 2. Personal Bunker */}
                {/* 2. Personal Bunker (Admin Only) */}
                {role === 'admin' ? (
                    <PersonalBunker
                        assignments={assignments}
                        personalTasks={personalTasks}
                        onAddPrivateTask={handleAddPrivateTask}
                        onTogglePrivateTask={handleTogglePrivateTask}
                    />
                ) : (
                    <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 border border-white/5">
                        <h3 className="text-2xl font-bold text-white">Vista de Coordinación</h3>
                        <p className="text-gray-400 max-w-xs">Tienes acceso de visualización a los avances del Encuentro.</p>
                    </div>
                )}

                {/* 3. Report Intelligence or Other Modules */}
                <div className="space-y-6">
                    <ReportPreview
                        projects={projects}
                        activities={activities}
                        finances={finances}
                    />

                    {/* Team Chat Module */}
                    <div className="glass-card rounded-3xl border border-white/5 h-[400px] overflow-hidden flex flex-col bg-black/20">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Chat de Equipo</h3>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <TeamChat />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
