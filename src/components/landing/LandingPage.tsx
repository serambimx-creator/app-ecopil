'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Leaf, Map, Users, Calendar, Star, Heart, Camera, Loader2 } from 'lucide-react';
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

    // Debug Images
    useEffect(() => {
        GALLERY_IMAGES.forEach(img => {
            const image = new Image();
            image.src = img.src;
            image.onerror = () => console.error(`Error loading image: ${img.src}`);
            image.onload = () => console.log(`Image loaded: ${img.src}`);
        });
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-brand-green selection:text-black font-sans">

            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5 transition-all hover:bg-black/80">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(0,223,129,0.5)]">E</div>
                    <span className="font-bold tracking-widest text-sm text-white">ECOPIL MX</span>
                </div>
                <button
                    onClick={handleLogin}
                    className="bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                >
                    Acceso Organizador
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 animate-in fade-in duration-1000 zoom-in-105"
                    style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />

                <div className="relative z-10 max-w-5xl space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-brand-green/20 border border-brand-green/50 text-brand-green text-xs font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(0,223,129,0.2)]">
                        <Star size={12} fill="currentColor" /> Pachuca 2026
                    </div>

                    <h1 className="flex flex-col items-center font-black leading-[0.9] tracking-tighter drop-shadow-2xl uppercase select-none">
                        <div className="flex items-start gap-2 md:gap-4 translate-x-[-2%]">
                            <span className="text-3xl md:text-5xl mt-2 md:mt-4 text-gray-400 font-bold">7mo</span>
                            <span className="text-6xl md:text-9xl text-white">Encuentro</span>
                        </div>
                        <span className="text-5xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">de nodos Ecopil</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Conectando a los líderes que transformarán el futuro ambiental de México.
                    </p>

                    <div className="pt-8 flex flex-col md:flex-row gap-6 justify-center items-center">
                        <button className="group bg-brand-green text-black px-10 py-5 rounded-full text-lg font-bold flex items-center gap-3 hover:bg-white transition-all shadow-[0_0_50px_rgba(0,223,129,0.5)] hover:shadow-[0_0_80px_rgba(0,223,129,0.8)] hover:scale-105 active:scale-95">
                            Confirmar Asistencia <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
                    <ArrowRight className="rotate-90" size={24} />
                </div>
            </section>

            {/* IMPACT GALLERY SECTION */}
            <section className="py-32 px-4 bg-dark-surface relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 text-brand-green font-bold uppercase tracking-widest text-xs">
                            <Camera size={14} /> Galería Oficial
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white">Nuestro Impacto en Acción</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Cada fotografía cuenta una historia de restauración, comunidad y esperanza.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {GALLERY_IMAGES.map((img, idx) => (
                            <div
                                key={idx}
                                className="group relative h-[400px] rounded-[32px] overflow-hidden cursor-crosshair transform transition-all duration-500 hover:z-10 hover:scale-[1.02] shadow-2xl"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url('${encodeURI(img.src)}')` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="glass-card bg-black/30 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                                        <div className="text-xs text-brand-green font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Map size={10} /> {img.loc}
                                        </div>
                                        <h3 className="text-2xl font-black text-white leading-none">{img.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Grid Stats */}
            <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass-card p-10 rounded-[40px] border border-white/10 bg-white/5 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <Leaf size={48} className="text-brand-green mb-6 group-hover:scale-110 transition-transform duration-300" />
                        <h3 className="text-3xl font-black mb-4">Restauración</h3>
                        <p className="text-gray-400 leading-relaxed font-medium">
                            Más de <span className="text-white font-bold">50,000 árboles</span> plantados en zonas críticas, recuperando pulmones vitales para México.
                        </p>
                    </div>
                    <div className="glass-card p-10 rounded-[40px] border border-white/10 bg-white/5 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <Users size={48} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
                        <h3 className="text-3xl font-black mb-4">Comunidad</h3>
                        <p className="text-gray-400 leading-relaxed font-medium">
                            Voluntarios de <span className="text-white font-bold">Hidalgo, CDMX y Puebla</span> unidos activamente por una misma causa climática.
                        </p>
                    </div>
                    <div className="glass-card p-10 rounded-[40px] border border-white/10 bg-white/5 relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <Map size={48} className="text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
                        <h3 className="text-3xl font-black mb-4">Territorio</h3>
                        <p className="text-gray-400 leading-relaxed font-medium">
                            Monitoreo satelital y <span className="text-white font-bold">validación en campo</span> de cada proyecto de conservación.
                        </p>
                    </div>
                </div>
            </section>

            {/* Agenda Preview */}
            <section className="py-32 px-6 bg-black border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <h2 className="text-5xl font-black mb-4">Agenda Preliminar</h2>
                            <p className="text-gray-500 text-lg">Actividades confirmadas y validadas.</p>
                        </div>
                        <div className="">
                            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-green border border-brand-green rounded-full px-6 py-3 hover:bg-brand-green hover:text-black transition-colors cursor-default">
                                Diciembre 18 - 21
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-20 text-gray-500">
                            <Loader2 className="animate-spin mr-2" /> Cargando actividades...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.length === 0 ? (
                                <div className="glass-card border border-white/10 p-12 rounded-[40px] text-center">
                                    <Calendar className="mx-auto text-gray-600 mb-4" size={48} />
                                    <h3 className="text-2xl font-bold text-white mb-2">Estamos preparando las actividades</h3>
                                    <p className="text-gray-500">Inicia sesión para gestionar o valida nuevas actividades.</p>
                                </div>
                            ) : (
                                activities.map((item) => (
                                    <div key={item.id} className="group flex items-center gap-8 p-8 rounded-[30px] bg-white/5 border border-white/5 hover:border-brand-green/30 hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="text-center min-w-[80px]">
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                                {format(new Date(item.date), "d MMM", { locale: es })}
                                            </div>
                                            <div className="text-2xl text-white font-black">
                                                {format(new Date(item.date), "HH:mm")}
                                            </div>
                                        </div>
                                        <div className="w-px h-12 bg-white/10 group-hover:bg-brand-green/50 transition-colors" />
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-white group-hover:text-brand-green transition-colors leading-tight">{item.title}</h3>
                                            <p className="text-sm text-gray-400 flex items-center gap-2 mt-2 font-medium">
                                                <Map size={14} className="text-gray-500 group-hover:text-brand-green" /> {item.location || 'Ubicación por confirmar'}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-brand-green group-hover:border-brand-green group-hover:scale-110 transition-all opacity-50 group-hover:opacity-100">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Allies Section */}
            <AlliesCarousel />

            {/* Footer */}
            <footer className="py-12 text-center text-gray-600 text-sm border-t border-white/5">
                <p className="mb-4 font-bold text-gray-500">© 2026 Ecopil México A.C.</p>
                <div className="flex justify-center gap-8 text-xs uppercase tracking-widest font-bold opacity-60">
                    <a href="#" className="hover:text-brand-green transition-colors">Instagram</a>
                    <a href="#" className="hover:text-brand-green transition-colors">Facebook</a>
                    <a href="#" className="hover:text-brand-green transition-colors">Contacto</a>
                </div>
            </footer>
        </div>
    );
}
