'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { AgendaActivity } from '@/types/database';
import { clsx } from 'clsx';

interface AgendaCalendarProps {
    activities: AgendaActivity[];
    onActivityClick: (id: string) => void;
    role: 'admin' | 'coordinator' | 'guest';
}

export default function AgendaCalendar({ activities, onActivityClick, role }: AgendaCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 11, 1)); // Default to Dec 2026 for Ecopil MX, or new Date() if preferred
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Generate days for the current month view
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

    // Optional: Padding for the grid (Start day of week)
    const startWeekDay = firstDay.getDay(); // 0 is Sunday
    const paddingDays = Array.from({ length: startWeekDay }).fill(null);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Get activities for a specific day
    const getActivitiesForDay = (day: Date) => {
        return activities.filter(act => isSameDay(new Date(act.date), day));
    };

    const selectedDayActivities = selectedDate ? getActivitiesForDay(selectedDate) : [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Calendar Header */}
            <div className="glass-card rounded-3xl p-4 border border-white/5 mx-4">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-white capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight className="text-white" />
                    </button>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                        <div key={day} className="text-[10px] font-bold text-gray-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {paddingDays.map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {daysInMonth.map(day => {
                        const dayActivities = getActivitiesForDay(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const hasActivities = dayActivities.length > 0;
                        const today = isToday(day);

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={clsx(
                                    "aspect-square flex flex-col items-center justify-center p-1 rounded-xl relative transition-all duration-200",
                                    !isCurrentMonth && "opacity-30",
                                    isSelected ? "bg-white/20 border border-white/40 shadow-inner" : "hover:bg-white/5 border border-transparent",
                                    today && !isSelected && "border-white/20"
                                )}
                            >
                                <span className={clsx(
                                    "text-sm font-medium z-10",
                                    today ? "text-brand-green font-bold" : "text-gray-200",
                                    isSelected && "text-white font-black"
                                )}>
                                    {format(day, 'd')}
                                </span>

                                {/* Status Dots */}
                                {hasActivities && (
                                    <div className="flex gap-0.5 mt-1 z-10">
                                        {dayActivities.slice(0, 3).map((act, i) => (
                                            <div
                                                key={i}
                                                className={clsx(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    act.status === 'red' ? "bg-status-red" :
                                                        act.status === 'green' ? "bg-brand-green" : "bg-status-yellow"
                                                )}
                                            />
                                        ))}
                                        {dayActivities.length > 3 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Details */}
            {selectedDate && (
                <div className="px-4 space-y-4 animate-in slide-in-from-bottom-4">
                    <h3 className="text-sm font-bold text-gray-400 border-b border-white/10 pb-2">
                        {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </h3>

                    {selectedDayActivities.length === 0 ? (
                        <div className="text-center py-8 bg-white/5 rounded-3xl border border-white/5 text-gray-500 text-sm">
                            Sin actividades programadas
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDayActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    onClick={() => onActivityClick(activity.id)}
                                    className={clsx(
                                        "group relative glass-card p-4 rounded-3xl border border-white/5 transition-all text-left w-full",
                                        (role === 'admin' || role === 'coordinator') && "hover:bg-white/10 cursor-pointer active:scale-95"
                                    )}
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 text-center shrink-0">
                                            <span className="text-lg font-bold text-white tracking-tighter">
                                                {format(new Date(activity.date), "HH:mm")}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-bold text-white truncate text-base">{activity.title}</h4>
                                                <div className={clsx(
                                                    "w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px]",
                                                    activity.status === 'red' ? "bg-status-red shadow-status-red" :
                                                        activity.status === 'green' ? "bg-brand-green shadow-brand-green" :
                                                            "bg-status-yellow shadow-status-yellow"
                                                )} />
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                                                <MapPin size={12} className="text-gray-500" />
                                                <span className="truncate">{activity.location || 'Por definir'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
