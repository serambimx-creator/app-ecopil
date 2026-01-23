'use client';

import { useState } from 'react';
import { FileText, Sparkles, X } from 'lucide-react';
import { Project, AgendaActivity, Finance } from '@/types/database';

interface ReportPreviewProps {
    projects: Project[];
    activities: AgendaActivity[];
    finances: Finance[];
}

export default function ReportPreview({ projects, activities, finances }: ReportPreviewProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Auto-generate summary stats
    const completedActivities = activities.filter(a => a.status === 'green').length;
    const totalSpent = finances.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const mediaCount = 12; // Placeholder until we fetch Evidence count or join it

    const summaryText = `Resumen al día de hoy: Se han completado ${completedActivities} reuniones estratégicas, se ha invertido un total de $${totalSpent.toLocaleString()} MXN y contamos con ${mediaCount} evidencias multimedia listas en la nube.`;

    // Filter agreements
    const agreements = activities
        .filter(a => a.agreements && a.agreements.length > 5)
        .map(a => ({ id: a.id, title: a.title, agreement: a.agreements }));

    return (
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
            <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 text-blue-400 p-3 rounded-2xl">
                    <Sparkles size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">Inteligencia de Reporte</h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-light italic">
                        "{summaryText}"
                    </p>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-white text-dark-surface font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-transform"
                >
                    <FileText size={18} />
                    Generar Corte de Caja
                </button>
            </div>

            {/* Simple Modal for "Corte de Caja" */}
            {isOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-dark-surface border border-white/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-2 mb-6 text-brand-green">
                            <FileText size={24} />
                            <h2 className="text-2xl font-black text-white">Corte de Caja</h2>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2">Acuerdos Registrados</h3>
                            {agreements.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">No hay acuerdos registrados aun en las actividades.</p>
                            ) : (
                                agreements.map(agg => (
                                    <div key={agg.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <h4 className="text-white font-bold text-sm mb-1">{agg.title}</h4>
                                        <p className="text-gray-300 text-sm">{agg.agreement}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-500">
                            Generado automáticamente por Ecopil Assistant
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
