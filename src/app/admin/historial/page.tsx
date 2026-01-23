'use client';

import { useState, useEffect } from 'react';
import { getAuditHistory } from '@/lib/reports';
import { Clock, User, FileText, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HistorialPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [filterUser, setFilterUser] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getAuditHistory();
            setLogs(data || []);
            setLoading(false);
        }
        load();
    }, []);

    const filteredLogs = filterUser
        ? logs.filter(l => l.profiles?.full_name.toLowerCase().includes(filterUser.toLowerCase()))
        : logs;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 pt-24 md:pt-32 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-2">Historial Operativo</h1>
                    <p className="text-gray-400">Bitácora técnica de todas las acciones del sistema.</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full md:w-auto">
                    <Filter size={16} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Filtrar por usuario..."
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                        className="bg-transparent text-sm focus:outline-none placeholder:text-gray-600 w-full"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 py-20">Cargando registros...</div>
            ) : (
                <div className="relative border-l border-white/10 ml-4 space-y-8">
                    {filteredLogs.length === 0 && <div className="pl-8 text-gray-500 italic">No hay registros.</div>}

                    {filteredLogs.map((log) => (
                        <div key={log.id} className="relative pl-8 group">
                            {/* Dot */}
                            <div className={clsx(
                                "absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-black transition-colors",
                                log.action === 'INSERT' ? "bg-brand-green" :
                                    log.action === 'UPDATE' ? "bg-status-yellow" : "bg-status-red"
                            )} />

                            {/* Content */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-colors hover:bg-white/10">
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={clsx(
                                            "uppercase text-[10px] font-bold px-2 py-0.5 rounded",
                                            log.action === 'INSERT' ? "bg-brand-green/20 text-brand-green" :
                                                log.action === 'UPDATE' ? "bg-status-yellow/20 text-status-yellow" : "bg-status-red/20 text-status-red"
                                        )}>
                                            {log.action}
                                        </div>
                                        <span className="text-sm font-bold text-gray-300 font-mono">
                                            {log.table_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock size={12} />
                                        {format(new Date(log.created_at), "d MMM, HH:mm", { locale: es })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                    <User size={12} />
                                    Por: <span className="text-white font-medium">{log.profiles?.full_name || 'Sistema / IA'}</span>
                                </div>

                                {/* Diff Summary (Simplified) */}
                                <div className="bg-black/40 rounded-lg p-3 text-xs font-mono text-gray-400 overflow-x-auto">
                                    {log.action === 'UPDATE' && (
                                        <div className="flex gap-4">
                                            <div className="text-status-red line-through opacity-50">
                                                {JSON.stringify(log.old_data).slice(0, 50)}...
                                            </div>
                                            <div className="text-brand-green">
                                                {JSON.stringify(log.new_data).slice(0, 50)}...
                                            </div>
                                        </div>
                                    )}
                                    {log.action === 'INSERT' && (
                                        <div className="text-brand-green">
                                            + {JSON.stringify(log.new_data).slice(0, 80)}...
                                        </div>
                                    )}
                                    {log.action === 'DELETE' && (
                                        <div className="text-status-red">
                                            - Registro eliminado
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
