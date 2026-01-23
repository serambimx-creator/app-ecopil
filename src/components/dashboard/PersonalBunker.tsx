'use client';

import { useState } from 'react';
import { Lock, User, Plus, Check, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { ActivityAssignment, PersonalTask, AgendaActivity } from '@/types/database';

interface PersonalBunkerProps {
    assignments: (ActivityAssignment & { activity_title?: string })[]; // Joined data prepared by parent
    personalTasks: PersonalTask[];
    onAddPrivateTask: (title: string) => void;
    onTogglePrivateTask: (taskId: string) => void;
}

export default function PersonalBunker({
    assignments,
    personalTasks,
    onAddPrivateTask,
    onTogglePrivateTask
}: PersonalBunkerProps) {
    const [activeTab, setActiveTab] = useState<'assignments' | 'private'>('assignments');
    const [newTask, setNewTask] = useState('');

    const handleAddTask = () => {
        if (!newTask.trim()) return;
        onAddPrivateTask(newTask);
        setNewTask('');
    };

    return (
        <div className="glass-card rounded-3xl overflow-hidden flex flex-col h-full min-h-[300px]">
            {/* Header / Tabs */}
            <div className="flex border-b border-white/5 bg-black/20">
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={clsx(
                        "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors",
                        activeTab === 'assignments' ? "text-white bg-white/5" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    <User size={16} /> Mis Tareas
                </button>
                <div className="w-px bg-white/5" />
                <button
                    onClick={() => setActiveTab('private')}
                    className={clsx(
                        "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors",
                        activeTab === 'private' ? "text-status-yellow bg-status-yellow/5" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    <Lock size={16} /> Notas Privadas
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-0 overflow-y-auto bg-dark-surface/50">

                {activeTab === 'assignments' && (
                    <div className="p-4 space-y-3">
                        {assignments.length === 0 && (
                            <div className="text-center py-10 text-gray-500 text-sm">
                                No tienes asignaciones públicas.
                            </div>
                        )}
                        {assignments.map(a => (
                            <div key={a.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-start gap-3">
                                <div className="bg-brand-green/20 p-2 rounded-xl text-brand-green">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{a.activity_title || 'Actividad sin título'}</h4>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Rol: <span className="text-gray-300">{a.role_in_activity || 'Colaborador'}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'private' && (
                    <div className="p-4 flex flex-col h-full">
                        <div className="flex-1 space-y-2 mb-4">
                            {personalTasks.length === 0 && (
                                <div className="text-center py-10 text-gray-500 text-xs italic">
                                    Tus notas son invisibles para los demás.
                                </div>
                            )}
                            {personalTasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => onTogglePrivateTask(task.id)}
                                    className={clsx(
                                        "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                                        task.is_completed
                                            ? "bg-transparent border-transparent opacity-40"
                                            : "bg-status-yellow/5 border-status-yellow/10 hover:bg-status-yellow/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-5 h-5 rounded flex items-center justify-center transition-colors",
                                        task.is_completed ? "bg-status-yellow text-black" : "border-2 border-status-yellow/40 group-hover:border-status-yellow"
                                    )}>
                                        {task.is_completed && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <span className={clsx(
                                        "text-sm font-medium",
                                        task.is_completed ? "line-through text-gray-500" : "text-gray-200"
                                    )}>
                                        {task.title}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Quick Add FAB inside tab */}
                        <div className="relative mt-auto">
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                placeholder="Escribe una nota rápida..."
                                className="w-full bg-black/40 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-status-yellow/50 transition-colors placeholder:text-gray-600"
                            />
                            <button
                                onClick={handleAddTask}
                                className="absolute right-1 top-1 bottom-1 aspect-square bg-status-yellow text-black rounded-full flex items-center justify-center hover:scale-95 transition-transform"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
