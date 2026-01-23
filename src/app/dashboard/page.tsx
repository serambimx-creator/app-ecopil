'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Project, AgendaActivity, Finance, ActivityAssignment, PersonalTask } from '@/types/database';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';
import PersonalBunker from '@/components/dashboard/PersonalBunker';
import ReportPreview from '@/components/dashboard/ReportPreview';

// Mock User ID (Replace with real Auth later)
const USER_ID = 'CURRENT_USER_ID_PLACEHOLDER';

export default function DashboardPage() {
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
            console.error('Dashboard Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();

        // Optional: Realtime Subscription could go here
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
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando Dashboard...</div>
    }

    return (
        <div className="min-h-screen pb-32 pt-24 px-4 md:pt-32 max-w-7xl mx-auto space-y-6">

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
                <PersonalBunker
                    assignments={assignments}
                    personalTasks={personalTasks}
                    onAddPrivateTask={handleAddPrivateTask}
                    onTogglePrivateTask={handleTogglePrivateTask}
                />

                {/* 3. Report Intelligence or Other Modules */}
                <div className="space-y-6">
                    <ReportPreview
                        projects={projects}
                        activities={activities}
                        finances={finances}
                    />

                    {/* Placeholder for future Modules like "Team Chat" or "Notifications" */}
                    <div className="glass-card rounded-3xl p-6 flex items-center justify-center text-gray-500 border border-white/5 h-[200px]">
                        <p className="text-xs uppercase tracking-widest opacity-50">Próximamente: Chat de Equipo</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
