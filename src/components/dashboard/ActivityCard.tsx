'use client';

import { useState } from 'react';
import { MapPin, Calendar, FileText } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ActivityDrawer from './ActivityDrawer';
import SemaphoreSelector from './SemaphoreSelector';
import type { AgendaActivity, Status } from '@/types/database';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function ActivityCard({ activity: initialActivity }: { activity: AgendaActivity }) {
    const [activity, setActivity] = useState(initialActivity);
    const [status, setStatus] = useState<Status>(initialActivity.status || 'yellow');

    const handleStatusChange = async (newStatus: Status) => {
        setStatus(newStatus);

        // Update DB
        await supabase
            .from('agenda_activities')
            .update({ status: newStatus })
            .eq('id', activity.id);
    };

    const statusStyles = {
        red: "border-status-red/50 shadow-[0_0_20px_rgba(255,75,75,0.15)] bg-status-red/5",
        yellow: "border-status-yellow/50 shadow-[0_0_20px_rgba(255,210,51,0.15)] bg-status-yellow/5",
        green: "border-brand-green/50 shadow-[0_0_20px_rgba(0,223,129,0.15)] bg-brand-green/5"
    };

    return (
        <ActivityDrawer
            activityId={activity.id}
            trigger={
                <div className={cn(
                    "group relative rounded-3xl p-5 border cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                    statusStyles[status] || "border-white/10 glass-card"
                )}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-white/70">
                            {activity.date ? new Date(activity.date).toLocaleDateString() : 'Fecha pendiente'}
                        </div>
                        <SemaphoreSelector
                            currentStatus={status}
                            onStatusChange={handleStatusChange}
                            size="sm"
                        />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                        {activity.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className={cn("transition-colors",
                                status === 'green' ? "text-brand-green" :
                                    status === 'yellow' ? "text-status-yellow" :
                                        status === 'red' ? "text-status-red" : "text-gray-500"
                            )} />
                            <span className="truncate">{activity.location || 'Sin ubicación'}</span>
                        </div>
                    </div>
                </div>
            }
        />
    );
}
