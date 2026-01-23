'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertTriangle, ArrowRight, Lock, Bell } from 'lucide-react';
import { Profile, PersonalTask } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface StaffBunkerProps {
    profile: Profile;
    stats: any;
    assignments: any[];
    personalTasks: PersonalTask[];
    onToggleTask: (id: string) => void;
    onAddTask: (title: string) => void;
}

export default function StaffBunker({ profile, stats, assignments, personalTasks, onToggleTask, onAddTask }: StaffBunkerProps) {
    const [newTask, setNewTask] = useState('');
    const [notices, setNotices] = useState<any[]>([]);

    useEffect(() => {
        fetchNotices();
    }, [profile]);

    async function fetchNotices() {
        // Fetch logic: 
        // 1. target_audience = 'all'
        // 2. target_audience = 'role:myRole'
        // 3. target_audience = 'node:myNode'
        // 4. target_audience = 'user:myId'

        const { data } = await supabase
            .from('announcements')
            .select('*')
            .or(`target_audience.eq.all,target_audience.eq.role:${profile.role},target_audience.eq.node:${profile.node},target_audience.eq.user:${profile.id}`)
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setNotices(data);
    }

    const handleAddTask = () => {
        if (!newTask.trim()) return;
        onAddTask(newTask);
        setNewTask('');
    };

    return (
        <div className="space-y-6">
            {/* 1. Alerts Feed */}
            {notices.length > 0 && (
                <div className="bg-status-red/10 border border-status-red/20 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <div className="bg-status-red/20 p-2 rounded-full text-status-red shrink-0">
                        <Bell size={20} />
                    </div>
                    <div className="w-full">
                        <h3 className="text-status-red font-bold text-sm uppercase tracking-wide mb-2">Avisos del Equipo</h3>
                        <ul className="space-y-2">
                            {notices.map(notice => (
                                <li key={notice.id} className="text-sm text-white/90 pb-2 border-b border-white/5 last:border-0 last:pb-0">
                                    <span className="font-bold block text-white">{notice.title}</span>
                                    <span className="opacity-80">{notice.content}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* 2. My Commitments (Assignments) */}
            <div className="glass-card p-6 rounded-[32px] border border-white/10">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="text-brand-green" size={20} /> Mis Compromisos
                </h3>

                {assignments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tienes actividades asignadas aún.</p>
                ) : (
                    <div className="space-y-3">
                        {assignments.map((assignment: any) => (
                            <div key={assignment.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                <div>
                                    <h4 className="text-white text-sm font-bold">{assignment.activity_title || 'Actividad Sin Título'}</h4>
                                    <p className="text-gray-400 text-xs mt-0.5">Rol: Responsable</p>
                                </div>
                                <ArrowRight size={16} className="text-gray-600 group-hover:text-brand-green transition-colors" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Personal Checklist */}
            <div className="glass-card p-6 rounded-[32px] border border-white/10">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Lock className="text-status-yellow" size={20} /> Checklist Privado
                </h3>

                <div className="space-y-2 mb-4">
                    {personalTasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => onToggleTask(task.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${task.is_completed
                                ? "bg-white/5 border-transparent opacity-50"
                                : "bg-white/5 border-white/5 hover:bg-white/10"
                                }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${task.is_completed ? "bg-status-yellow text-black" : "border-2 border-gray-500"
                                }`}>
                                {task.is_completed && <CheckCircle size={14} strokeWidth={3} />}
                            </div>
                            <span className={`text-sm flex-1 ${task.is_completed ? "line-through text-gray-500" : "text-gray-200"}`}>
                                {task.title}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                    <input
                        type="text"
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                        placeholder="Nueva nota..."
                        className="bg-transparent text-sm w-full focus:outline-none placeholder:text-white/20 text-white"
                    />
                    <button
                        onClick={handleAddTask}
                        className="text-xs bg-status-yellow/10 text-status-yellow px-2 py-1 rounded hover:bg-status-yellow/20 font-bold"
                    >
                        AGREGAR
                    </button>
                </div>
            </div>
        </div>
    );
}
