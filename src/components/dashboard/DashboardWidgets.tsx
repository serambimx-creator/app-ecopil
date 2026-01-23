'use client';

import { Activity, CreditCard, Clock, Map, AlertCircle, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { Project, AgendaActivity, Finance } from '@/types/database';

interface DashboardWidgetsProps {
    projects: Project[];
    activities: AgendaActivity[];
    finances: Finance[];
}

export default function DashboardWidgets({ projects, activities, finances }: DashboardWidgetsProps) {

    // 1. Health Calculation
    const greenCount = activities.filter(a => a.status === 'green').length;
    const yellowCount = activities.filter(a => a.status === 'yellow').length;
    const redCount = activities.filter(a => a.status === 'red').length;
    const totalActivities = activities.length || 1;
    const healthPercent = Math.round((greenCount / totalActivities) * 100);

    // 2. Finance Calculation
    // Mocking Estimated Total (Budget) since we don't have a Budget table yet
    const ESTIMATED_BUDGET = 50000;
    const totalSpent = finances.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const budgetPercent = Math.round((totalSpent / ESTIMATED_BUDGET) * 100);
    const isOverBudget = totalSpent > ESTIMATED_BUDGET;

    // 3. Next Milestone
    // Find closest future activity
    const now = new Date();
    const futureActivities = activities
        .filter(a => a.date && new Date(a.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const nextActivity = futureActivities[0];

    const getTimeRemaining = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`;
    };

    // 4. Geo Impact
    // Count items with coordinates
    const placesCount = activities.filter(a => a.latitude).length + projects.filter(p => p.latitude).length;


    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            {/* Widget 1: Health */}
            <div className="glass-card p-4 rounded-3xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2">
                    <Activity className="text-brand-green" size={20} />
                    <div className="text-xs font-bold text-gray-500">SALUD</div>
                </div>
                <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-black text-white">{healthPercent}%</span>
                    <span className="text-xs text-brand-green mb-1">OK</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(greenCount / totalActivities) * 100}%` }} className="h-full bg-brand-green" />
                    <div style={{ width: `${(yellowCount / totalActivities) * 100}%` }} className="h-full bg-status-yellow" />
                    <div style={{ width: `${(redCount / totalActivities) * 100}%` }} className="h-full bg-status-red" />
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                    {activities.length} actividades totales
                </p>
            </div>

            {/* Widget 2: Finances */}
            <div className={clsx("glass-card p-4 rounded-3xl relative overflow-hidden", isOverBudget && "border-amber-500/50")}>
                <div className="flex justify-between items-start mb-2">
                    <CreditCard className={isOverBudget ? "text-amber-500" : "text-blue-400"} size={20} />
                    <div className="text-xs font-bold text-gray-500">PRESUPUESTO</div>
                </div>
                <div className="flex items-end gap-1 mb-1">
                    <span className="text-2xl font-black text-white">${(totalSpent / 1000).toFixed(1)}k</span>
                    <span className="text-xs text-gray-400 mb-1">/ {ESTIMATED_BUDGET / 1000}k</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                        className={clsx("h-full transition-all", isOverBudget ? "bg-amber-500" : "bg-blue-400")}
                    />
                </div>
                {isOverBudget && <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1"><AlertCircle size={10} /> Alerta de sobregiro</p>}
            </div>

            {/* Widget 3: Milestone */}
            <div className="glass-card p-4 rounded-3xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <Clock className="text-purple-400" size={20} />
                    <div className="text-xs font-bold text-gray-500">PRÓXIMO</div>
                </div>
                {nextActivity ? (
                    <>
                        <div className="text-xl font-bold text-white leading-tight line-clamp-2 h-14">
                            {nextActivity.title}
                        </div>
                        <div className="mt-2 inline-block px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold">
                            {getTimeRemaining(nextActivity.date)}
                        </div>
                    </>
                ) : (
                    <div className="text-sm text-gray-500 mt-2">Todo limpio 🎉</div>
                )}
            </div>

            {/* Widget 4: Geo Impact */}
            <div className="glass-card p-4 rounded-3xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <Map className="text-pink-400" size={20} />
                    <div className="text-xs font-bold text-gray-500">IMPACTO</div>
                </div>
                <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-black text-white">{placesCount}</span>
                    <span className="text-xs text-pink-400 mb-1">Puntos</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                    Territorio validado en Pachuca
                </p>
                <div className="absolute -bottom-4 -right-4 text-pink-500/10">
                    <TrendingUp size={80} />
                </div>
            </div>

        </div>
    );
}
