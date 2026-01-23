'use client';

import { X, Map, CloudSun, MapPin, ExternalLink } from 'lucide-react';
import { Shirt, Sun } from 'lucide-react';
import { AgendaActivity } from '@/types/database';
import { Drawer } from 'vaul';

interface LocationContextProps {
    activity: AgendaActivity | null;
    onClose: () => void;
}

export default function LocationContext({ activity, onClose }: LocationContextProps) {
    if (!activity) return null;

    // Mock Data based on location (Pachuca vs El Chico)
    const isForest = activity.location?.toLowerCase().includes('chico') || activity.location?.toLowerCase().includes('bosque');

    const contextData = isForest ? {
        weather: '8°C - Frío y Húmedo',
        clothing: 'Botas de montaña, chamarra impermeable, capas térmicas.',
        security: 'Zona con presencia de fauna silvestre. No separarse del grupo. Llevar silbato de emergencia.',
        history: 'El Parque Nacional El Chico es una de las áreas protegidas más antiguas de México, decretado en 1898. Famoso por sus formaciones rocosas y bosques de oyamel.',
        tips: ['No hay señal de celular en algunas zonas.', 'Lleva termo con agua.', 'Respeta los senderos marcados.']
    } : {
        weather: '18°C - Templado',
        clothing: 'Casual / Formal para reuniones. Zapatos cómodos.',
        security: 'Zona urbana segura. Mantener objetos de valor guardados en eventos masivos.',
        history: 'Pachuca, "La Bella Airosa", es conocida por su legado minero y su Reloj Monumental. Centro neurálgico de la administración estatal.',
        tips: ['El estacionamiento en el centro es limitado.', 'Usa transporte compartido si es posible.', 'El viento aumenta por la tarde.']
    };

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location || '')}`;

    return (
        <Drawer.Root open={!!activity} onOpenChange={(open) => !open && onClose()} shouldScaleBackground>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[700] backdrop-blur-sm" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[700] mt-24 flex h-[85%] flex-col rounded-t-[20px] bg-dark-surface outline-none border-t border-white/20 shadow-2xl">

                    {/* Header Image (Mock) */}
                    <div className="h-48 w-full bg-gray-800 relative rounded-t-[20px] overflow-hidden">
                        <img
                            src={isForest ? "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop" : "https://images.unsplash.com/photo-1518182170546-07fa6ebcb849?q=80&w=1000&auto=format&fit=crop"}
                            alt="Location Context"
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-surface to-transparent" />

                        <div className="absolute bottom-4 left-6 right-6">
                            <h2 className="text-3xl font-black text-white leading-tight drop-shadow-lg">{activity.location || "Ubicación General"}</h2>
                            <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                                <MapPin size={16} /> Pachuca de Soto, Hgo.
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors backdrop-blur-md"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* Weather & Clothing */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                <Sun size={32} className="text-brand-green mb-2" />
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Clima</span>
                                <span className="text-white font-bold">{contextData.weather}</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                <Shirt size={32} className="text-blue-400 mb-2" />
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Vestimenta</span>
                                <span className="text-white font-bold text-sm">{contextData.clothing}</span>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-status-red/10 border border-status-red/20 rounded-2xl p-5 flex items-start gap-4">
                            <div className="bg-status-red/20 p-2 rounded-full text-status-red">
                                <Map size={20} />
                            </div>
                            <div>
                                <h3 className="text-status-red font-bold mb-1 text-sm uppercase tracking-wide">Seguridad</h3>
                                <p className="text-gray-300 text-sm">{contextData.security}</p>
                            </div>
                        </div>

                        {/* History */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-green rounded-full" /> Historia del Lugar
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-sm">
                                {contextData.history}
                            </p>
                        </div>

                        {/* Tips */}
                        <div className="bg-status-yellow/10 border border-status-yellow/20 rounded-2xl p-5">
                            <h3 className="text-status-yellow font-bold mb-3 text-sm uppercase tracking-wide">Tips Operativos</h3>
                            <ul className="space-y-2">
                                {contextData.tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                        <span className="text-status-yellow font-bold">•</span> {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action */}
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-blue-600 text-white font-bold text-center py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <MapPin size={20} />
                            Abrir en Google Maps
                            <ExternalLink size={16} className="opacity-50" />
                        </a>

                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
