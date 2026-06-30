'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, MapPin, Users, Handshake, Building2, Map, MessageCircle, FileText, Phone, Mail, Award, Check, ChevronRight, ChevronDown, Route, Clock, Droplets, GraduationCap, TreePine, Briefcase, Globe, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AlliesCarousel from '@/components/public/AlliesCarousel';
import { ITINERARIO, ACTIVIDAD_EXTRA } from '@/data/itinerario';

type ViewType = 'miembros' | 'aliados' | 'patrocinadores';


const EVIDENCE_IMAGES = [
    { src: '/impacto/optimized/Jornada Alpura_AeroMexico-077.webp', label: 'Reforestación masiva' },
    { src: '/impacto/optimized/Arroyo Moreno-Ecopil-312.webp', label: 'Recuperación de humedales' },
    { src: '/impacto/optimized/Arroyo Moreno-Ecopil-374.webp', label: 'Educación ambiental' },
    { src: '/impacto/optimized/Arroyo Moreno-Ecopil-416.webp', label: 'Monitoreo de especies' },
];

const ODS_LIST = [
    { num: 13, label: 'Acción climática' },
    { num: 15, label: 'Ecosistemas' },
    { num: 11, label: 'Comunidades' },
    { num: 4, label: 'Educación' },
    { num: 17, label: 'Alianzas' },
    { num: 6, label: 'Agua limpia' },
    { num: 12, label: 'Consumo resp.' },
    { num: 8, label: 'Trabajo decente' },
];

const CONTACTS = [
    { initials: 'KU', name: 'Karla Uribe', role: 'SERAMBI · Ecopil Hidalgo', tel: '7717741409', email: 'karlauv28@gmail.com' },
    { initials: 'LB', name: 'Luis Balderas', role: 'SERAMBI · Ecopil Hidalgo', tel: '7713300261', email: 'jorgeluis55245@gmail.com' },
];

function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; started: boolean } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const targetDate = new Date(2026, 11, 18, 9, 0, 0);
            targetDate.setHours(targetDate.getHours() - 6);
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, started: true });
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft({ days, hours, minutes, started: false });
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!timeLeft) return null;

    if (timeLeft.started) {
        return <div className="text-lg font-bold text-brand-green">¡En curso!</div>;
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <div className="bg-[#1a2a1a] border border-[#2a3a2a] rounded-xl px-4 py-2">
                <p className="text-xl font-bold text-brand-green">{timeLeft.days}</p>
                <p className="text-xs text-gray-500 uppercase">días</p>
            </div>
            <span className="text-brand-green font-bold">:</span>
            <div className="bg-[#1a2a1a] border border-[#2a3a2a] rounded-xl px-4 py-2">
                <p className="text-xl font-bold text-brand-green">{String(timeLeft.hours).padStart(2, '0')}</p>
                <p className="text-xs text-gray-500 uppercase">horas</p>
            </div>
            <span className="text-brand-green font-bold">:</span>
            <div className="bg-[#1a2a1a] border border-[#2a3a2a] rounded-xl px-4 py-2">
                <p className="text-xl font-bold text-brand-green">{String(timeLeft.minutes).padStart(2, '0')}</p>
                <p className="text-xs text-gray-500 uppercase">minutos</p>
            </div>
        </div>
    );
}

const TIERS = [
    {
        name: 'PLATINO',
        price: '$15,000+',
        border: '#aaa',
        bg: '#1a1a1a',
        perks: [
            'Logo principal en landing y materiales',
            'Mención en inauguración y cierre',
            'Voluntariado corporativo incluido',
            'Neutralización de huella de carbono',
            'Informe de impacto RSE',
        ]
    },
    {
        name: 'ORO',
        price: '$8,000',
        border: '#DAA520',
        bg: '#1a1800',
        perks: [
            'Logo en sección de aliados y materiales',
            'Mención en redes sociales',
            'Acceso a talleres del encuentro',
        ]
    },
    {
        name: 'PLATA',
        price: '$3,000',
        border: '#666',
        bg: '#171717',
        perks: [
            'Logo en materiales impresos',
            'Mención digital',
        ]
    },
];

const STEPS = [
    { title: 'Estudio de línea base', desc: 'Diagnóstico participativo, cartografía, actores clave' },
    { title: 'Capacitación y Nodos', desc: 'Grupos juveniles formados como agentes de innovación' },
    { title: 'Restauración ambiental', desc: 'Reforestación, limpieza, infraestructura verde' },
    { title: 'Monitoreo y evaluación', desc: 'Métricas de impacto científico y participativo' },
];

const RECOGNITIONS = [
    'Great Place to Work 2021',
    'Premio Razón de Ser · Fundación Merced (Jóvenes Emprendedores 2020)',
    'Mejor lugar para hacer voluntariado · CEMEFI 2020',
    'Transparencia nivel óptimo · CEMEFI',
];

function ContactCards({ onSwitchView }: { onSwitchView?: (v: ViewType) => void }) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contacto directo</h3>
            {CONTACTS.map((c) => (
                <div key={c.initials} className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center text-sm font-black shrink-0">
                        {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{c.name}</p>
                        <p className="text-gray-500 text-xs">{c.role}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <a href={`tel:${c.tel}`} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand-green hover:border-brand-green/40 transition-colors">
                            <Phone size={14} />
                        </a>
                        <a href={`mailto:${c.email}`} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand-green hover:border-brand-green/40 transition-colors">
                            <Mail size={14} />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function LandingPage() {
    const router = useRouter();
    const [activeView, setActiveView] = useState<ViewType>('miembros');
    const [openDay, setOpenDay] = useState<string | null>(null);
    const [donationAmount, setDonationAmount] = useState(500);
    const galeriaRef = useRef<HTMLDivElement>(null);

    const handleGaleriaClick = () => {
        setActiveView('aliados');
        setTimeout(() => {
            galeriaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleLogin = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('login', 'true');
        window.location.href = url.toString();
    };


    const tabs: { key: ViewType; icon: typeof Users; label: string }[] = [
        { key: 'miembros', icon: Users, label: 'Miembros Ecopil' },
        { key: 'aliados', icon: Handshake, label: 'Nuevos aliados' },
        { key: 'patrocinadores', icon: Building2, label: 'Patrocinar / donar' },
    ];

    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans pb-32">

            {/* ===== HERO ===== */}
            <section className="relative min-h-[60vh] flex flex-col items-center justify-end text-center overflow-hidden pb-8 -mx-4">
                <Image
                    src="/impacto/optimized/hero-ecopil.webp"
                    alt="Encuentro Ecopil"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 100%)' }} />

                <div className="relative z-10 w-full space-y-5 px-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/15 border border-brand-green/40 text-brand-green text-[10px] font-bold uppercase tracking-wider">
                        <Star size={10} fill="currentColor" /> 7mo Encuentro Nacional &middot; Hidalgo 2026
                    </div>

                    <CountdownTimer />

                    <h1 className="text-2xl font-black leading-tight tracking-tight">
                        Innovación Social <span className="text-brand-green">&</span> Gestión Ambiental
                    </h1>

                    <p className="text-sm text-gray-300 flex items-center justify-center gap-1.5">
                        <MapPin size={14} className="text-brand-green" /> Pachuca &middot; 18–20 dic 2026
                    </p>
                </div>
            </section>

            {/* ===== TAB BAR ===== */}
            <nav className="sticky top-[56px] z-30 bg-[#0d0d0d] border-b border-[#252525] -mx-4">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveView(tab.key)}
                            className={clsx(
                                "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors",
                                activeView === tab.key
                                    ? "text-brand-green border-b-2 border-brand-green"
                                    : "text-gray-500 border-b-2 border-transparent"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* ===== VIEW: MIEMBROS ===== */}
            {activeView === 'miembros' && (
                <div className="px-4 pt-6 space-y-8">

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { big: '7mo', small: 'encuentro' },
                            { big: '3 días', small: '18–20 dic' },
                            { big: '5+', small: 'sedes Hidalgo' },
                        ].map((s) => (
                            <div key={s.big} className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4 text-center">
                                <p className="text-xl font-black text-white">{s.big}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.small}</p>
                            </div>
                        ))}
                    </div>

                    {/* Agenda del encuentro */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-black">Agenda del encuentro</h2>
                        <div className="space-y-2">
                            {ITINERARIO.map((bloque) => {
                                const isOpen = openDay === bloque.dia;
                                return (
                                    <div key={bloque.dia} className="bg-[#1a1a1a] border border-[#252525] rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setOpenDay(isOpen ? null : bloque.dia)}
                                            className="w-full flex items-center gap-4 p-4 text-left"
                                        >
                                            <div className="shrink-0 text-center min-w-[52px]">
                                                <p className="text-xs font-black text-brand-green">{bloque.dia}</p>
                                            </div>
                                            <div className="w-px h-8 bg-white/10 shrink-0" />
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                <MapPin size={12} className="text-gray-500 shrink-0" />
                                                <span className="text-sm font-medium text-white truncate">{bloque.sede}</span>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={clsx(
                                                    "text-gray-500 shrink-0 transition-transform duration-200",
                                                    isOpen && "rotate-180"
                                                )}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div className="bg-[#0d0d0d] px-4 pb-4">
                                                {bloque.actividades.map((act, i) => (
                                                    <div
                                                        key={i}
                                                        className={clsx(
                                                            "flex gap-3 py-2.5",
                                                            i < bloque.actividades.length - 1 && "border-b border-[#1e1e1e]"
                                                        )}
                                                    >
                                                        <span className="shrink-0 w-16 flex items-center justify-center pt-0.5">
                                                            {act.esTraslado ? (
                                                                <Route size={12} className="text-gray-600" />
                                                            ) : act.hora ? (
                                                                <span className="text-[10px] text-gray-500 font-mono">{act.hora}</span>
                                                            ) : (
                                                                <span className="text-brand-green text-lg leading-none">●</span>
                                                            )}
                                                        </span>
                                                        <div className="flex-1 flex items-start gap-2 flex-wrap">
                                                            {act.esTraslado ? (
                                                                <span className="text-sm text-gray-500">→ {act.titulo}</span>
                                                            ) : (
                                                                <span className="text-sm text-white">{act.titulo}</span>
                                                            )}
                                                            {act.pendiente && !act.esTraslado && (
                                                                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                                    Pendiente logística
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border border-dashed border-white/20 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-gray-400">+</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-300">{ACTIVIDAD_EXTRA.titulo}</p>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                        Actividad extra · Opcional
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">{ACTIVIDAD_EXTRA.descripcion}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/agenda')}
                            className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-colors py-1"
                        >
                            Ver también en /agenda →
                        </button>
                    </section>

                    {/* Accesos rápidos */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-black">Accesos rápidos</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => router.push('/mapa?mode=recorrido')}
                                className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors hover:bg-white/5 active:scale-95"
                            >
                                <Map size={20} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-300">Mapa de sedes</span>
                            </button>

                            <button
                                onClick={handleGaleriaClick}
                                className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors hover:bg-white/5 active:scale-95"
                            >
                                <Heart size={20} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-300">Galería</span>
                            </button>

                            <button
                                onClick={() => router.push('/chat')}
                                className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors hover:bg-white/5 active:scale-95"
                            >
                                <MessageCircle size={20} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-300">Chat del equipo</span>
                            </button>

                            <button
                                onClick={() => router.push('/guia')}
                                className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors hover:bg-white/5 active:scale-95"
                            >
                                <FileText size={20} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-300">Ver guía</span>
                            </button>
                        </div>
                    </section>

                    {/* Banner CTA */}
                    <div
                        className="bg-brand-green/10 border border-brand-green/20 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-brand-green/15 transition-colors"
                        onClick={() => setActiveView('patrocinadores')}
                    >
                        <p className="text-sm font-bold text-white">
                            ¿Conoces a alguien que quiera apoyar?
                        </p>
                        <span className="text-brand-green text-xs font-bold flex items-center gap-1 shrink-0">
                            Ver opciones <ChevronRight size={14} />
                        </span>
                    </div>
                </div>
            )}

            {/* ===== VIEW: ALIADOS ===== */}
            {activeView === 'aliados' && (
                <div className="px-4 pt-6 space-y-8">

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { big: '12+', small: 'años' },
                            { big: '22', small: 'ciudades' },
                            { big: '7', small: 'encuentros' },
                        ].map((s) => (
                            <div key={s.big} className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4 text-center">
                                <p className="text-xl font-black text-white">{s.big}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.small}</p>
                            </div>
                        ))}
                    </div>

                    {/* ¿Qué es Ecopil? */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-black">¿Qué es Ecopil?</h2>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Asociación Civil mexicana que conecta comunidades, gobierno, academia y sector privado para restaurar ecosistemas y formar líderes ambientales a nivel nacional, desde 2012.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Soluciones basadas en Naturaleza', 'STEAM', 'Acción Climática', 'ODS 2030'].map((tag) => (
                                <span key={tag} className="text-xs rounded-full px-3 py-1 font-medium bg-[#1a2a1a] text-[#00DF81] border border-brand-green/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* El Encuentro Nacional Ecopil */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-black">El Encuentro Nacional Ecopil</h2>

                        <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-5">
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Evento anual donde convergen los nodos de toda la república para compartir aprendizajes, capacitarse, ejecutar acciones de restauración y fortalecer la red nacional de jóvenes líderes ambientales. Cada año se realiza en un ecosistema diferente de México. Esta es la 7ma edición nacional y el 2do encuentro en Hidalgo, coordinado por SERAMBI.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { title: 'Encuentro', desc: 'Jóvenes de 22 ciudades comparten experiencias', img: '/impacto/optimized/hero-ecopil.webp' },
                                { title: 'Capacitación', desc: 'Talleres STEAM, SbN y liderazgo ambiental', img: '/impacto/optimized/Arroyo Moreno-Ecopil-374.webp' },
                                { title: 'Restauración', desc: 'Reforestación y monitoreo en campo', img: '/impacto/optimized/Jornada Alpura_AeroMexico-077.webp' },
                                { title: 'Innovación', desc: 'Soluciones basadas en la naturaleza', img: '/impacto/optimized/Arroyo Moreno-Ecopil-416.webp' },
                            ].map((pilar) => (
                                <div key={pilar.title} className="relative rounded-xl overflow-hidden h-28">
                                    <Image src={pilar.img} alt={pilar.title} fill className="object-cover opacity-40" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-xs font-black text-white">{pilar.title}</p>
                                        <p className="text-[10px] text-gray-300 leading-tight mt-0.5">{pilar.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { big: '22,765', small: 'personas beneficiadas' },
                                { big: '90+', small: 'agentes de cambio' },
                                { big: '2do', small: 'encuentro en Hidalgo' },
                            ].map((s) => (
                                <div key={s.big} className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4 text-center">
                                    <p className="text-xl font-black text-white">{s.big}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.small}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-white">Red de Nodos</h3>
                            <p className="text-xs text-gray-500">Grupos juveniles activos en todo el país</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { name: 'Hidalgo', host: true },
                                    { name: 'CDMX' }, { name: 'Edo. México' }, { name: 'Jalisco' },
                                    { name: 'Querétaro' }, { name: 'Veracruz' }, { name: 'Monterrey' }, { name: 'Morelos' },
                                    { name: 'Puebla' }, { name: 'Oaxaca' }, { name: 'Mérida' }, { name: 'Coahuila' },
                                ].map((nodo) => (
                                    <div
                                        key={nodo.name}
                                        className={clsx(
                                            'text-[10px] font-bold text-center py-1.5 px-1 rounded-lg border',
                                            nodo.host
                                                ? 'bg-[#1a2a1a] text-[#00DF81] border-[#2a3a2a]'
                                                : 'bg-[#1a1a1a] text-[#666] border-[#252525]'
                                        )}
                                    >
                                        {nodo.name}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-600 leading-relaxed">
                                El nodo anfitrión es Hidalgo — coordinado por SERAMBI, 2do encuentro presencial en la Sierra Hidalguense.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-white">¿Qué aprenden los jóvenes?</h3>
                            <p className="text-xs text-gray-500">Estrategia Nacional de Impulso al Talento</p>
                            <div className="space-y-3">
                                {[
                                    { title: 'Modelo de Innovación Ecopil', desc: 'Línea base, Nodos, Restauración, Monitoreo' },
                                    { title: 'Soluciones basadas en la Naturaleza', desc: 'Infraestructura verde, humedales, reforestación' },
                                    { title: 'STEAM ambiental', desc: 'Ciencia y tecnología aplicada a ecosistemas locales' },
                                    { title: 'Acción para el Empoderamiento Climático', desc: 'Marco CMNUCC' },
                                    { title: 'Liderazgo y gestión de nodos', desc: 'Vinculación con sector privado y gobierno' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="w-7 h-7 rounded-full bg-brand-green/15 text-[#00DF81] flex items-center justify-center text-xs font-black shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{item.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {['UNESCO México', 'CMNUCC', 'ODS 2030', 'CEMEFI', 'Pacto Global ONU'].map((tag) => (
                                    <span key={tag} className="text-[9px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 bg-[#1a1a1a] text-gray-500 border border-[#252525]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Cómo trabajamos */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-black">Cómo trabajamos</h2>
                        <div className="space-y-3">
                            {STEPS.map((step, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-brand-green/15 text-brand-green flex items-center justify-center text-xs font-black shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{step.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Galería */}
                    <section className="space-y-3" ref={galeriaRef}>
                        <h2 className="text-lg font-black">Galería</h2>
                        <div className="flex overflow-x-auto gap-3 snap-x snap-mandatory pb-2 -mx-4 px-4">
                            {EVIDENCE_IMAGES.map((img) => (
                                <div key={img.src} className="snap-center shrink-0">
                                    <div className="relative w-40 h-28 rounded-xl overflow-hidden">
                                        <Image src={img.src} alt={img.label} fill className="object-cover" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Reconocimientos */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-black">Reconocimientos</h2>
                        <div className="space-y-2">
                            {RECOGNITIONS.map((r) => (
                                <div key={r} className="flex items-start gap-3">
                                    <Award size={14} className="text-brand-green mt-0.5 shrink-0" />
                                    <p className="text-sm text-gray-300">{r}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ODS */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-black">ODS que impulsamos</h2>
                        <div className="grid grid-cols-4 gap-2">
                            {ODS_LIST.map((ods) => (
                                <div key={ods.num} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-2.5 text-center">
                                    <p className="text-lg font-black text-brand-green">{ods.num}</p>
                                    <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{ods.label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Allies Carousel */}
                    <AlliesCarousel />

                    {/* Contacto */}
                    <ContactCards />

                    {/* CTA */}
                    <button
                        onClick={() => setActiveView('patrocinadores')}
                        className="w-full bg-brand-green text-black h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-green/90 transition-colors active:scale-95"
                    >
                        Quiero ser aliado o patrocinador <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* ===== VIEW: PATROCINADORES ===== */}
            {activeView === 'patrocinadores' && (
                <div className="px-4 pt-6 space-y-8">

                    {/* Sé patrocinador */}
                    <section className="space-y-4 relative overflow-hidden rounded-2xl p-5">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/impacto/optimized/Jornada Alpura_AeroMexico-204.webp"
                                alt=""
                                fill
                                className="object-cover opacity-15"
                            />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-lg font-black">Sé patrocinador</h2>
                            <p className="text-sm text-gray-400 mt-1">Tu marca junto a 12 años de impacto ambiental en México</p>
                        </div>
                    </section>

                    {/* Tiers */}
                    <div className="space-y-4">
                        {TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className="rounded-2xl p-5 space-y-3"
                                style={{ backgroundColor: tier.bg, border: `1px solid ${tier.border}40` }}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: tier.border }}>
                                        {tier.name}
                                    </span>
                                    <span className="text-lg font-black text-white">{tier.price}</span>
                                </div>
                                <div className="space-y-2">
                                    {tier.perks.map((perk) => (
                                        <div key={perk} className="flex items-start gap-2">
                                            <Check size={14} className="text-brand-green mt-0.5 shrink-0" />
                                            <p className="text-xs text-gray-300">{perk}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <a
                            href="mailto:karlauv28@gmail.com?subject=Patrocinio Encuentro Ecopil 2026"
                            className="w-full bg-brand-green text-black h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-green/90 transition-colors active:scale-95"
                        >
                            Quiero ser patrocinador <ArrowRight size={16} />
                        </a>
                        <button
                            onClick={() => setActiveView('aliados')}
                            className="w-full h-12 rounded-2xl text-sm font-bold border border-[#252525] text-gray-300 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors active:scale-95"
                        >
                            Ver info de Ecopil primero
                        </button>
                    </div>

                    {/* Decorative image */}
                    <div className="space-y-2">
                        <div className="relative w-full h-32 rounded-xl overflow-hidden">
                            <Image
                                src="/impacto/optimized/Jornada Alpura_AeroMexico-168.webp"
                                alt="Voluntariado corporativo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 text-center">Voluntariado corporativo con Alpura & Aeroméxico</p>
                    </div>

                    {/* Donación directa */}
                    <section className="bg-brand-green/10 border border-brand-green/20 rounded-2xl p-5 space-y-4">
                        <h3 className="text-base font-black text-white">O haz una donación directa</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Financia traslados, materiales y talleres para los nodos comunitarios de Hidalgo.
                        </p>
                        <div className="flex gap-2">
                            {[200, 500, 1000].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setDonationAmount(amount)}
                                    className={clsx(
                                        "flex-1 py-2 rounded-xl text-sm font-bold transition-colors",
                                        donationAmount === amount
                                            ? "bg-brand-green text-black"
                                            : "bg-white/5 text-gray-400 border border-[#252525] hover:bg-white/10"
                                    )}
                                >
                                    ${amount}
                                </button>
                            ))}
                            <button
                                onClick={() => setDonationAmount(0)}
                                className={clsx(
                                    "flex-1 py-2 rounded-xl text-sm font-bold transition-colors",
                                    donationAmount === 0
                                        ? "bg-brand-green text-black"
                                        : "bg-white/5 text-gray-400 border border-[#252525] hover:bg-white/10"
                                )}
                            >
                                Otro
                            </button>
                        </div>
                        <button className="w-full bg-white/10 text-white h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/15 transition-colors active:scale-95 border border-white/10">
                            Donar ahora <ArrowRight size={14} />
                        </button>
                    </section>

                    {/* Contacto */}
                    <ContactCards />
                </div>
            )}

            {/* ===== FOOTER ===== */}
            <footer className="mt-12 py-8 text-center text-gray-600 text-xs border-t border-[#252525]">
                <p className="mb-4 font-bold opacity-50">&copy; 2026 Ecopil México A.C.</p>
                <div className="flex justify-center gap-6 uppercase tracking-widest font-bold opacity-40">
                    <a href="#" className="hover:text-brand-green transition-colors">Instagram</a>
                    <a href="#" className="hover:text-brand-green transition-colors">Facebook</a>
                </div>
            </footer>
        </div>
    );
}
