'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '@/lib/supabase';
import { STAFF_TASKS } from '@/data/staffTasks';

interface StaffTaskRow {
    id: string;
    title: string;
    responsible: string | null;
    detail: string | null;
    task_date: string | null;
    is_completed: boolean;
}

// Fallback shown if the `staff_tasks` table isn't reachable yet (see create_staff_tasks_table.sql)
const FALLBACK_TASKS: StaffTaskRow[] = STAFF_TASKS.map(t => ({
    id: t.id,
    title: t.titulo,
    responsible: t.responsable ?? null,
    detail: t.detalle ?? null,
    task_date: t.fecha,
    is_completed: false,
}));

export default function StaffTasksCard() {
    const [tasks, setTasks] = useState<StaffTaskRow[]>(FALLBACK_TASKS);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        fetchTasks();

        const channel = supabase
            .channel('public:staff_tasks')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'staff_tasks' },
                () => fetchTasks()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('staff_tasks')
            .select('*')
            .order('sort_order', { ascending: true });

        if (!error && data) {
            setIsLive(true);
            if (data.length > 0) setTasks(data as StaffTaskRow[]);
        }
    };

    const toggle = async (task: StaffTaskRow) => {
        const nextCompleted = !task.is_completed;

        // Optimistic UI
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: nextCompleted } : t));

        if (isLive) {
            await supabase.from('staff_tasks').update({ is_completed: nextCompleted }).eq('id', task.id);
        }
    };

    return (
        <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="text-brand-green" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tareas de Staff · Previo al Encuentro</h3>
                </div>
                {!isLive && (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                        Sin conexión
                    </span>
                )}
            </div>

            <div className="p-4 space-y-2">
                {tasks.map(task => {
                    const isDone = task.is_completed;
                    return (
                        <div
                            key={task.id}
                            onClick={() => toggle(task)}
                            className={clsx(
                                "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                                isDone
                                    ? "bg-transparent border-transparent opacity-40"
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                        >
                            <div className={clsx(
                                "w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 transition-colors",
                                isDone ? "bg-brand-green text-black" : "border-2 border-white/20"
                            )}>
                                {isDone && <Check size={14} strokeWidth={3} />}
                            </div>
                            <div className="min-w-0">
                                <p className={clsx("text-sm font-bold", isDone ? "line-through text-gray-500" : "text-white")}>
                                    {task.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {task.task_date}
                                    {task.responsible && <> · {task.responsible}</>}
                                </p>
                                {task.detail && (
                                    <p className="text-xs text-gray-500 mt-0.5">{task.detail}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
