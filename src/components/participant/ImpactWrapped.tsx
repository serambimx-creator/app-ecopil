'use client';

import { useState } from 'react';
import { Share, Download, Map, Users, Clock, Leaf } from 'lucide-react';
import { clsx } from 'clsx';

export default function ImpactWrapped() {
    const [isVisible, setIsVisible] = useState(true);

    // Mock Data (In real app, props passed from personalized calc)
    const stats = {
        kilometers: 12.5,
        trees: 50,
        connections: 8,
        hours: 16
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[800] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-sm aspect-[9/16] bg-gradient-to-br from-brand-green via-black to-blue-900 rounded-[40px] relative overflow-hidden shadow-2xl flex flex-col p-8 border border-white/10 animate-in zoom-in duration-500">

                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-brand-green blur-[100px] rounded-full" />
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500 blur-[100px] rounded-full" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col text-center">
                    <div className="mb-8">
                        <div className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 text-white">
                            Ecopil Wrapped 2026
                        </div>
                        <h2 className="text-4xl font-black text-white leading-none">
                            Tu Impacto<br />
                            <span className="text-brand-green">Real</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 flex-1 items-center">
                        <div className="bg-black/40 backdrop-blur p-4 rounded-3xl border border-white/10 flex flex-col items-center justify-center aspect-square">
                            <Map size={32} className="text-blue-400 mb-2" />
                            <span className="text-2xl font-black text-white">{stats.kilometers}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Km Recorridos</span>
                        </div>
                        <div className="bg-black/40 backdrop-blur p-4 rounded-3xl border border-white/10 flex flex-col items-center justify-center aspect-square">
                            <Leaf size={32} className="text-brand-green mb-2" />
                            <span className="text-2xl font-black text-white">{stats.trees}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Acciones Eco</span>
                        </div>
                        <div className="bg-black/40 backdrop-blur p-4 rounded-3xl border border-white/10 flex flex-col items-center justify-center aspect-square">
                            <Users size={32} className="text-status-yellow mb-2" />
                            <span className="text-2xl font-black text-white">{stats.connections}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Nodos Conectados</span>
                        </div>
                        <div className="bg-black/40 backdrop-blur p-4 rounded-3xl border border-white/10 flex flex-col items-center justify-center aspect-square">
                            <Clock size={32} className="text-purple-400 mb-2" />
                            <span className="text-2xl font-black text-white">{stats.hours}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Horas Volunt.</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <button className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            <Share size={20} /> Compartir en Story
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 text-xs hover:text-white transition-colors p-2"
                        >
                            Cerrar y ver Agenda
                        </button>
                    </div>
                </div>

                {/* Ecopil Logo Watermark */}
                <div className="absolute bottom-6 left-0 right-0 text-center opacity-30">
                    <span className="font-bold text-lg tracking-widest text-white">ECOPIL</span>
                </div>
            </div>
        </div>
    );
}
