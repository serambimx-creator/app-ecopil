'use client';

import { useState } from 'react';
import { ClipboardList, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { STAFF_TASKS } from '@/data/staffTasks';

export default function StaffTasksCard() {
    const [done, setDone] = useState<Set<string>>(new Set());

    const toggle = (id: string) => {
        setDone(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                <ClipboardList size={16} className="text-brand-green" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tareas de Staff · Previo al Encuentro</h3>
            </div>

            <div className="p-4 space-y-2">
                {STAFF_TASKS.map(task => {
                    const isDone = done.has(task.id);
                    return (
                        <div
                            key={task.id}
                            onClick={() => toggle(task.id)}
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
                                    {task.titulo}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {task.fecha}
                                    {task.responsable && <> · {task.responsable}</>}
                                </p>
                                {task.detalle && (
                                    <p className="text-xs text-gray-500 mt-0.5">{task.detalle}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
