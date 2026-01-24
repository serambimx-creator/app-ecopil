'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Leaf, Map, Users, Calendar, Star, Heart, Camera, Loader2, MapPin, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AgendaActivity } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AlliesCarousel from '@/components/public/AlliesCarousel';

export default function LandingPage() {
    const router = useRouter();
    const [activities, setActivities] = useState<AgendaActivity[]>([]);
    const [loading, setLoading] = useState(true);

    const handleLogin = () => {
        // Simple hack to toggle session in parent
        const url = new URL(window.location.href);
        url.searchParams.set('login', 'true');
        window.location.href = url.toString();
    };

    useEffect(() => {
        async function fetchAgenda() {
            try {
                const { data } = await supabase
                    .from('agenda_activities')
                    .select('*')
                    .eq('status', 'green') // Strict: Only GREEN activities
                    .order('date', { ascending: true })
                    .limit(5); // Show top 5 confirmed

                if (data) setActivities(data);
            } catch (error) {
                console.error("Error fetching public agenda", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAgenda();
    }, []);

    // Images from public folder
    const HERO_IMAGE = "/impacto/Jornada Alpura_AeroMexico-061.jpg";

    const GALLERY_IMAGES = [
        { src: "/impacto/Arroyo Moreno-Ecopil-312.jpg", title: "Recuperación de Humedales", loc: "Arroyo Moreno" },
        { src: "/impacto/Jornada Alpura_AeroMexico-204.jpg", title: "Alianzas Corporativas", loc: "Hidalgo" },
        { src: "/impacto/Arroyo Moreno-Ecopil-374.jpg", title: "Educación Ambiental", loc: "Veracruz" },
        { src: "/impacto/Jornada Alpura_AeroMexico-077.jpg", title: "Reforestación Masiva", loc: "Parque Nacional" },
        { src: "/impacto/Arroyo Moreno-Ecopil-416.jpg", title: "Monitoreo de Especies", loc: "Reserva Ecológica" },
        { src: "/impacto/Jornada Alpura_AeroMexico-168.jpg", title: "Voluntariado Corporativo", loc: "Alpura & Aeroméxico" },
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-brand-green selection:text-black font-sans pb-24">

            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-50 px-4 py-3 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/5 transition-all">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center font-black text-black text-xs shadow-[0_0_15px_rgba(0,223,129,0.5)]">E</div>
                    <span className="font-bold tracking-widest text-xs text-white">ECOPIL MX</span>
                </div>
                <button
                    onClick={handleLogin}
                    className="bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                >
                    Entrar
                </button>
            </nav>

            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden pt-12">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 animate-in fade-in duration-1000 zoom-in-105"
                    style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />

                <div className="relative z-10 w-full space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 px-4 break-words">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/20 border border-brand-green/50 text-brand-green text-[10px] font-bold uppercase tracking-[0.2em] mb-2 backdrop-blur-md shadow-[0_0_20px_rgba(0,223,129,0.2)]">
                        <Star size={10} fill="currentColor" /> Pachuca 2026
                    </div>

                    <h1 className="flex flex-col items-center text-3xl font-black leading-tight tracking-tighter md:text-6xl uppercase select-none">
                        <span className="text-gray-300 font-bold mb-2">7mo Encuentro</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">Nacional</span>
                        <span className="text-brand-green mt-2 tracking-widest text-xl md:text-3xl">de Nodos Ecopil</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-200 font-light max-w-xs mx-auto leading-relaxed drop-shadow-sm px-4">
                        Conectando a los líderes que transformarán el futuro ambiental.
                    </p>

                    <div className="pt-4 w-full px-4">
                        <button className="w-full bg-brand-green text-black h-12 rounded-3xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg active:scale-95">
                            Confirmar Asistencia <ArrowRight size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
                    <ArrowRight className="rotate-90" size={20} />
                </div>
            </section>

            {/* IMPACT GALLERY SECTION */}
            <section className="py-12 px-4 bg-dark-surface relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="text-left md:text-center space-y-2">
                        <div className="inline-flex items-center gap-2 text-brand-green font-bold uppercase tracking-widest text-[10px]">
                            <Camera size={12} /> Galería
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white">Impacto Real</h2>
                    </div>

                    {/* Horizontal Scroll Snap for Mobile */}
                    <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory hide-scrollbar pb-4 md:grid md:grid-cols-3 md:space-x-0 md:gap-4 md:overflow-visible md:pb-0">
                        {GALLERY_IMAGES.map((img, idx) => (
                            <div
                                key={idx}
                                className="min-w-[85%] snap-center group relative h-72 rounded-2xl overflow-hidden shadow-sm border border-white/5 active:scale-95 transition-transform"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${encodeURI(img.src)}')` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="text-[10px] text-brand-green font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <MapPin size={10} /> {img.loc}
                                    </div>
                                    <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">{img.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Grid Stats */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-start gap-4">
                        <div className="bg-brand-green/10 p-3 rounded-3xl text-brand-green">
                            <Leaf size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-1">Restauración</h3>
                            <p className="text-sm text-gray-400 font-medium">
                                +<span className="text-white font-bold">50,000 árboles</span> plantados.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-start gap-4">
                        <div className="bg-blue-500/10 p-3 rounded-3xl text-blue-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-1">Comunidad</h3>
                            <p className="text-sm text-gray-400 font-medium">
                                Voluntarios de <span className="text-white font-bold">3 Estados</span>.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-start gap-4">
                        <div className="bg-purple-500/10 p-3 rounded-3xl text-purple-400">
                            <Map size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-1">Territorio</h3>
                            <p className="text-sm text-gray-400 font-medium">
                                Monitoreo <span className="text-white font-bold">Satelital</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agenda Preview Feed */}
            <section className="py-12 px-4 bg-black border-t border-white/5 text-left">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black">Agenda 2026</h2>
                        <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1 rounded-full">Coming Soon</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-12 text-gray-500">
                            <Loader2 className="animate-spin mr-2" /> Cargando...
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activities.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
                                    <Calendar className="mx-auto text-gray-600 mb-2" size={32} />
                                    <h3 className="text-lg font-bold text-white">Preparando actividades</h3>
                                    <p className="text-xs text-gray-500 mt-1">Vuelve pronto para ver la agenda oficial.</p>
                                </div>
                            ) : (
                                activities.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 active:bg-white/10 transition-colors">
                                        {/* Date Box */}
                                        <div className="shrink-0 w-14 h-14 bg-white/5 rounded-3xl flex flex-col items-center justify-center border border-white/10">
                                            <span className="text-xs font-bold text-gray-400 uppercase">
                                                {format(new Date(item.date), "MMM", { locale: es })}
                                            </span>
                                            <span className="text-xl font-black text-white leading-none">
                                                {format(new Date(item.date), "d")}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-white truncate">{item.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(item.date), "HH:mm")}</span>
                                                <span className="flex items-center gap-1 truncate"><MapPin size={12} /> {item.location || 'Pendiente'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Allies Section */}
            <div className="py-8">
                <AlliesCarousel />
            </div>

            {/* Footer */}
            <footer className="py-8 text-center text-gray-600 text-xs border-t border-white/5">
                <p className="mb-4 font-bold opacity-50">© 2026 Ecopil México A.C.</p>
                <div className="flex justify-center gap-6 uppercase tracking-widest font-bold opacity-40">
                    <a href="#" className="hover:text-brand-green">Instagram</a>
                    <a href="#" className="hover:text-brand-green">Facebook</a>
                </div>
            </footer>
        </div>
    );
}
