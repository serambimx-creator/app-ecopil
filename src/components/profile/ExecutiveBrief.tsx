'use client';

import { Activity, AlertTriangle, CheckCircle, TrendingUp, FileText } from 'lucide-react';
import { AgendaActivity } from '@/types/database';

interface ExecutiveBriefProps {
    activities: AgendaActivity[];
    agreements: string[];
}

export default function ExecutiveBrief({ activities, agreements }: ExecutiveBriefProps) {
    // Calculate Stats
    const total = activities.length;
    const completed = activities.filter(a => a.status === 'green').length;
    const pending = activities.filter(a => a.status === 'yellow').length;
    const critical = activities.filter(a => a.status === 'red').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="space-y-6">

            {/* 1. Executive Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-[24px] border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Avance Total</span>
                        <TrendingUp size={16} className="text-brand-green" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white">{progress}%</span>
                        <span className="text-xs text-brand-green font-bold mb-1.5">+12% vs ayer</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-brand-green" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="glass-card p-5 rounded-[24px] border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Riesgo Crítico</span>
                        <AlertTriangle size={16} className="text-status-red" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white">{critical}</span>
                        <span className="text-xs text-gray-400 mb-1.5">procesos en rojo</span>
                    </div>
                    <div className="flex gap-1 mt-3">
                        {/* Mock Mini Dots */}
                        {[...Array(Math.min(critical, 5))].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-status-red" />
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Critical Processes List */}
            {critical > 0 && (
                <div className="bg-status-red/5 border border-status-red/10 rounded-[32px] p-6">
                    <h3 className="text-status-red font-bold text-lg mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} /> Atención Inmediata
                    </h3>
                    <div className="space-y-3">
                        {activities.filter(a => a.status === 'red').slice(0, 3).map(act => (
                            <div key={act.id} className="bg-black/40 p-4 rounded-xl border-l-4 border-status-red flex justify-between items-center">
                                <div>
                                    <h4 className="text-white font-bold text-sm">{act.title}</h4>
                                    <p className="text-gray-400 text-xs">{act.location || 'Sin ubicación'}</p>
                                </div>
                                <button className="text-xs bg-status-red text-white px-3 py-1 rounded-full font-bold">
                                    REVISAR
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Narrative Brief (Agreements) */}
            <div className="glass-card p-6 rounded-[32px] border border-white/10">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText className="text-blue-400" size={20} /> Resumen de Acuerdos
                </h3>

                {agreements.length === 0 ? (
                    <p className="text-gray-500 text-sm">No se han registrado acuerdos estratégicos aún.</p>
                ) : (
                    <ul className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                        {agreements.map((agreement, i) => (
                            <li key={i} className="pl-6 relative">
                                <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-brand-green/20 border border-brand-green rounded-full shadow-[0_0_10px_rgba(0,223,129,0.3)]" />
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {agreement}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="text-center">
                <button className="text-xs text-gray-500 hover:text-white uppercase tracking-widest font-bold transition-colors">
                    Descargar Reporte PDF
                </button>
            </div>
        </div>
    );
}
