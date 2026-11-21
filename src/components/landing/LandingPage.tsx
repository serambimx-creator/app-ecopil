'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, MapPin, Users, Handshake, Building2, Map, FileText, Phone, Mail, Award, Check, ChevronRight, Clock, Droplets, GraduationCap, TreePine, Briefcase, Globe, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ITINERARIO, ACTIVIDAD_EXTRA } from '@/data/itinerario';
import Mixtli, { MixtliBubble, SunHills } from '@/components/brand/Mixtli';

type ViewType = 'miembros' | 'aliados' | 'patrocinadores' | 'info';


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
        return <div className="font-display text-xl font-semibold text-[var(--t-accent)]">¡En curso!</div>;
    }

    const units = [
        { value: String(timeLeft.days), label: 'días' },
        { value: String(timeLeft.hours).padStart(2, '0'), label: 'horas' },
        { value: String(timeLeft.minutes).padStart(2, '0'), label: 'min' },
    ];

    return (
        <div className="flex items-stretch gap-2">
            {units.map((u) => (
                <div key={u.label} className="sticker bg-[var(--t-surface)] rounded-2xl px-3 py-1.5 min-w-[64px] text-center">
                    <p className="font-display text-2xl font-semibold leading-none text-[var(--t-text)]">{u.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--t-text-faint)] mt-1">{u.label}</p>
                </div>
            ))}
        </div>
    );
}

// Un color del logo de Ecopil por día del encuentro
const DAY_COLORS = ['bg-brand-green', 'bg-ecopil-sun', 'bg-ecopil-orange', 'bg-ecopil-leaf', 'bg-mixtli'];

const TIERS = [
    {
        name: 'PLATINO',
        price: '$15,000+',
        color: '#7A8070',
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
        color: '#E0A21F',
        perks: [
            'Logo en sección de aliados y materiales',
            'Mención en redes sociales',
            'Acceso a talleres del encuentro',
        ]
    },
    {
        name: 'PLATA',
        price: '$3,000',
        color: '#A68D7B',
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
            <h3 className="text-sm font-bold text-[var(--t-text-muted)] uppercase tracking-wider">Contacto directo</h3>
            {CONTACTS.map((c) => (
                <div key={c.initials} className="bg-[var(--t-surface)] border border-[var(--t-border)] rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-green/20 text-[var(--t-accent)] flex items-center justify-center text-sm font-black shrink-0">
                        {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[var(--t-text)] font-bold text-sm">{c.name}</p>
                        <p className="text-[var(--t-text-faint)] text-xs">{c.role}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <a href={`tel:${c.tel}`} className="w-9 h-9 rounded-full bg-[var(--t-overlay-5)] border border-[var(--t-border)] flex items-center justify-center text-[var(--t-text-muted)] hover:text-[var(--t-accent)] hover:border-brand-green/40 transition-colors">
                            <Phone size={14} />
                        </a>
                        <a href={`mailto:${c.email}`} className="w-9 h-9 rounded-full bg-[var(--t-overlay-5)] border border-[var(--t-border)] flex items-center justify-center text-[var(--t-text-muted)] hover:text-[var(--t-accent)] hover:border-brand-green/40 transition-colors">
                            <Mail size={14} />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Para sumar un aliado: logo en public/logos y una línea aquí.
const ALIADOS = [
    { nombre: 'Reciclum', logo: '/logos/reciclum.svg' },
];

const INFO_PRACTICA = [
    { titulo: 'Hospedaje y llegada', icon: MapPin, color: 'bg-ecopil-sun', items: [
        'Llegada el 17 de diciembre. Bienvenida a las 19:30 en el Hotel City Express Tula.',
        'Del 17 al 19 dormimos en el hotel; la noche del 20 acampamos en Ajolotequio (Tulancingo).',
        'El 21 a las 12:00 te llevamos a las terminales para tu regreso.',
    ] },
    { titulo: 'Qué traer', icon: Briefcase, color: 'bg-ecopil-leaf', items: [
        'Ropa de capas: en la sierra amanece entre 2 y 5 °C y al mediodía sube a 18 °C.',
        'Chamarra impermeable, botas con agarre y ropa que se pueda ensuciar.',
        'Linterna o lámpara de cabeza para las grutas, botella de agua y protector solar.',
        'Tienda de campaña y cobija para la noche del 20, si tienes.',
    ] },
    { titulo: 'Dinero y salud', icon: Heart, color: 'bg-ecopil-red', items: [
        'Lleva efectivo: propinas en Xoxafi, compras personales y $30 de entrada al manantial.',
        'Avísanos de alergias o medicamentos en tu registro; tu contacto de emergencia se queda con el staff.',
        'Si te sientes mal en cualquier momento, busca a alguien del staff con playera de #NodoPachuca.',
    ] },
    { titulo: 'Durante el Encuentro', icon: Clock, color: 'bg-mixtli', items: [
        'Te asignamos Grupo A o B: define tu turno de desayuno.',
        'En Programa ves qué sigue según la hora, aunque te quedes sin señal.',
        'Los avisos del staff aparecen arriba del programa.',
    ] },
];

export default function LandingPage() {
    const router = useRouter();
    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const [donationAmount, setDonationAmount] = useState(500);
    const galeriaRef = useRef<HTMLDivElement>(null);

    const handleGaleriaClick = () => {
        galeriaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleLogin = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('login', 'true');
        window.location.href = url.toString();
    };


    const tabs: { key: string; icon: typeof Users; label: string }[] = [
        { key: 'miembros', icon: Users, label: 'Encuentro' },
        { key: 'aliados', icon: Handshake, label: 'Ecopil' },
        { key: 'info', icon: FileText, label: 'Info' },
        { key: 'patrocinadores', icon: Building2, label: 'Apoya' },
    ];
    const ir = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return (
        <div className="theme-surface min-h-screen bg-[var(--t-bg)] text-[var(--t-text)] font-sans">

            {/* ===== HERO: Mixtli frente al sol del logo de Ecopil ===== */}
            <section className="relative -mx-4 overflow-hidden px-5 pt-6">
                <div className="relative z-10 space-y-3">
                    <span className="font-futura sticker inline-flex items-center gap-1.5 rounded-full bg-ecopil-sun px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink">
                        <Star size={10} fill="currentColor" /> Encuentro de Nodos 2026
                    </span>
                    <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-[var(--t-text)]">
                        7º Encuentro Nacional <span className="text-[var(--t-accent)]">Ecopil</span>
                    </h1>
                    <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--t-text-secondary)]">
                        <MapPin size={15} className="text-ecopil-red" /> Hidalgo &middot; 17–21 dic 2026
                    </p>
                    <CountdownTimer />
                    <a
                        href="/registro"
                        className="font-futura sticker inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-3 text-sm font-extrabold text-ink transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                        Voy al Encuentro: registrarme <ArrowRight size={16} />
                    </a>
                </div>

                <div className="relative mt-2 h-[230px]">
                    <SunHills className="absolute inset-x-0 bottom-0 h-[170px] w-full" />
                    <div className="absolute bottom-6 right-4">
                        <Mixtli pose="pala" height={200} priority animated />
                    </div>
                    <MixtliBubble className="absolute left-5 top-8 max-w-[150px]">
                        ¡Hola! Soy Mixtli. Te espero en Hidalgo para sembrar juntos 🌱
                    </MixtliBubble>
                </div>
            </section>

            {/* ===== NAVEGACIÓN: una sola página, anclas ===== */}
            <nav className="sticky top-[62px] z-30 -mx-4 bg-[var(--t-bg)]/95 px-4 py-3 backdrop-blur">
                <div className="flex gap-1 rounded-full bg-[var(--t-surface-2)] p-1">
                    {tabs.map((tab) => (
                        <a key={tab.key} href={`#${tab.key}`}
                            className="font-futura flex-1 flex items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[11px] font-extrabold leading-tight text-[var(--t-text-muted)] hover:text-[var(--t-text)]">
                            <tab.icon size={14} className="shrink-0" />
                            {tab.label}
                        </a>
                    ))}
                </div>
            </nav>

            {/* ===== VIEW: MIEMBROS ===== */}
            {(
                <div id="miembros" className="px-4 pt-10 space-y-8 scroll-mt-28">
                    <p className="font-futura text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--t-accent)]">El Encuentro</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { big: '7mo', small: 'encuentro' },
                            { big: '5 días', small: '17–21 dic' },
                            { big: '5+', small: 'sedes Hidalgo' },
                        ].map((s) => (
                            <div key={s.big} className="sticker bg-[var(--t-surface)] rounded-2xl p-3 text-center">
                                <p className="font-display text-2xl font-semibold text-[var(--t-text)]">{s.big}</p>
                                <p className="text-[10px] text-[var(--t-text-faint)] uppercase tracking-wider mt-1">{s.small}</p>
                            </div>
                        ))}
                    </div>

                    {/* Agenda del encuentro — un adelanto que emociona, no una lista de permisos */}
                    <section className="space-y-4">
                        <h2 className="font-display text-2xl font-semibold">Agenda del encuentro</h2>
                        <div className="space-y-3">
                            {ITINERARIO.map((bloque, i) => {
                                const isExpanded = expandedDay === bloque.dia;
                                const [num, mes] = bloque.dia.split(' ');
                                return (
                                    <button
                                        key={bloque.dia}
                                        onClick={() => setExpandedDay(isExpanded ? null : bloque.dia)}
                                        className="w-full bg-[var(--t-surface)] border-2 border-[var(--t-border)] rounded-3xl p-3 flex items-center gap-3 text-left transition-colors hover:border-[var(--t-ink)]"
                                    >
                                        <div className={clsx("sticker shrink-0 w-14 rounded-2xl py-1.5 text-center text-ink", DAY_COLORS[i % DAY_COLORS.length])}>
                                            <p className="font-display text-2xl font-semibold leading-none">{num}</p>
                                            <p className="text-[9px] font-extrabold tracking-widest mt-0.5">{mes}</p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-1.5">
                                                <MapPin size={12} className="text-ecopil-red shrink-0 mt-1" />
                                                <span className={clsx("text-sm font-extrabold text-[var(--t-text)]", !isExpanded && "truncate")}>
                                                    {bloque.sede}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[var(--t-text-muted)] mt-1 leading-snug">
                                                {bloque.teaser}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-[var(--t-text-faint)] text-center px-4">
                            Cinco días para conectar, aprender y dejar huella — ¡te esperamos!
                        </p>

                        <div className="border-2 border-dashed border-[var(--t-border)] rounded-3xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-ecopil-sun/30 border-2 border-dashed border-ecopil-orange flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-[var(--t-text-muted)]">+</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[var(--t-text-secondary)]">{ACTIVIDAD_EXTRA.titulo}</p>
                                    <span className="text-[9px] font-bold text-[var(--t-text-faint)] uppercase tracking-widest">
                                        Actividad extra · Opcional
                                    </span>
                                    <p className="text-xs text-[var(--t-text-faint)] mt-1">{ACTIVIDAD_EXTRA.descripcion}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/programa')}
                            className="w-full text-center text-xs font-bold text-[var(--t-accent)] hover:underline py-1"
                        >
                            Ver la agenda completa →
                        </button>
                    </section>

                    {/* Accesos rápidos */}
                    <section className="space-y-3">
                        <h2 className="font-display text-2xl font-semibold">Accesos rápidos</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                                onClick={() => router.push('/mapa?mode=recorrido')}
                                className="bg-[var(--t-surface)] border-2 border-[var(--t-border)] rounded-3xl p-4 flex flex-col items-center gap-2 transition-colors hover:border-[var(--t-ink)] active:scale-95"
                            >
                                <span className="sticker flex h-10 w-10 items-center justify-center rounded-full bg-ecopil-sun text-ink"><Map size={18} /></span>
                                <span className="text-xs font-bold text-[var(--t-text-secondary)]">Mapa de sedes</span>
                            </button>

                            <button
                                onClick={handleGaleriaClick}
                                className="bg-[var(--t-surface)] border-2 border-[var(--t-border)] rounded-3xl p-4 flex flex-col items-center gap-2 transition-colors hover:border-[var(--t-ink)] active:scale-95"
                            >
                                <span className="sticker flex h-10 w-10 items-center justify-center rounded-full bg-ecopil-red text-ink"><Heart size={18} /></span>
                                <span className="text-xs font-bold text-[var(--t-text-secondary)]">Galería</span>
                            </button>

                            <button
                                onClick={() => router.push('/programa')}
                                className="bg-[var(--t-surface)] border-2 border-[var(--t-border)] rounded-3xl p-4 flex flex-col items-center gap-2 transition-colors hover:border-[var(--t-ink)] active:scale-95"
                            >
                                <span className="sticker flex h-10 w-10 items-center justify-center rounded-full bg-ecopil-leaf text-ink"><Clock size={18} /></span>
                                <span className="text-xs font-bold text-[var(--t-text-secondary)]">Programa por hora</span>
                            </button>

                            <button
                                onClick={() => router.push('/guia')}
                                className="bg-[var(--t-surface)] border-2 border-[var(--t-border)] rounded-3xl p-4 flex flex-col items-center gap-2 transition-colors hover:border-[var(--t-ink)] active:scale-95"
                            >
                                <span className="sticker flex h-10 w-10 items-center justify-center rounded-full bg-mixtli text-ink"><FileText size={18} /></span>
                                <span className="text-xs font-bold text-[var(--t-text-secondary)]">Ver guía</span>
                            </button>
                        </div>
                    </section>

                    {/* Banner CTA: Mixtli se asoma */}
                    <button
                        onClick={() => ir('patrocinadores')}
                        className="sticker relative w-full overflow-hidden rounded-3xl bg-ecopil-leaf p-5 pr-28 text-left text-ink"
                    >
                        <p className="font-display text-lg font-semibold leading-tight">
                            ¿Conoces a alguien que quiera apoyar?
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold">
                            Ver opciones <ChevronRight size={14} />
                        </span>
                        <Mixtli pose="asoma" height={110} className="absolute -bottom-3 right-2" />
                    </button>
                </div>
            )}

            {/* ===== VIEW: ALIADOS ===== */}
            {(
                <div id="aliados" className="px-4 pt-10 space-y-8 scroll-mt-28">
                    <p className="font-futura text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--t-accent)]">Qué es Ecopil</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { big: '12+', small: 'años' },
                            { big: '22', small: 'ciudades' },
                            { big: '7', small: 'encuentros' },
                        ].map((s) => (
                            <div key={s.big} className="sticker bg-[var(--t-surface)] rounded-2xl p-3 text-center">
                                <p className="font-display text-2xl font-semibold text-[var(--t-text)]">{s.big}</p>
                                <p className="text-[10px] text-[var(--t-text-faint)] uppercase tracking-wider mt-1">{s.small}</p>
                            </div>
                        ))}
                    </div>

                    {/* ¿Qué es Ecopil? */}
                    <section className="space-y-4">
                        <h2 className="font-display text-2xl font-semibold">¿Qué es Ecopil?</h2>
                        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">
                            Asociación Civil mexicana que conecta comunidades, gobierno, academia y sector privado para restaurar ecosistemas y formar líderes ambientales a nivel nacional, desde 2012.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Soluciones basadas en Naturaleza', 'STEAM', 'Acción Climática', 'ODS 2030'].map((tag) => (
                                <span key={tag} className="text-xs rounded-full px-3 py-1 font-bold bg-[var(--t-accent-tint-bg)] text-[var(--t-accent)] border border-[var(--t-accent-tint-border)]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* El Encuentro Nacional Ecopil */}
                    <section className="space-y-6">
                        <h2 className="font-display text-2xl font-semibold">El Encuentro Nacional Ecopil</h2>

                        <div className="bg-[var(--t-surface)] border border-[var(--t-border)] rounded-2xl p-5">
                            <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">
                                Evento anual donde convergen los nodos de toda la república para compartir aprendizajes, capacitarse, ejecutar acciones de restauración y fortalecer la red nacional de jóvenes líderes ambientales. Cada año se realiza en un ecosistema diferente de México. Esta es la 7ma edición nacional y el 2do encuentro en Hidalgo, coordinado por SERAMBI.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                <div key={s.big} className="sticker bg-[var(--t-surface)] rounded-2xl p-3 text-center">
                                    <p className="font-display text-xl font-semibold text-[var(--t-text)]">{s.big}</p>
                                    <p className="text-[10px] text-[var(--t-text-faint)] uppercase tracking-wider mt-1">{s.small}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-display text-lg font-semibold text-[var(--t-text)]">Red de Nodos</h3>
                            <p className="text-xs text-[var(--t-text-faint)]">Grupos juveniles activos en todo el país</p>
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
                                                ? 'bg-[var(--t-accent-tint-bg)] text-[var(--t-accent)] border-[var(--t-accent-tint-border)]'
                                                : 'bg-[var(--t-surface)] text-[var(--t-text-faint)] border-[var(--t-border)]'
                                        )}
                                    >
                                        {nodo.name}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-[var(--t-text-faint-2)] leading-relaxed">
                                El nodo anfitrión es Hidalgo — coordinado por SERAMBI, 2do encuentro presencial en la Sierra Hidalguense.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-display text-lg font-semibold text-[var(--t-text)]">¿Qué aprenden los jóvenes?</h3>
                            <p className="text-xs text-[var(--t-text-faint)]">Estrategia Nacional de Impulso al Talento</p>
                            <div className="space-y-3">
                                {[
                                    { title: 'Modelo de Innovación Ecopil', desc: 'Línea base, Nodos, Restauración, Monitoreo' },
                                    { title: 'Soluciones basadas en la Naturaleza', desc: 'Infraestructura verde, humedales, reforestación' },
                                    { title: 'STEAM ambiental', desc: 'Ciencia y tecnología aplicada a ecosistemas locales' },
                                    { title: 'Acción para el Empoderamiento Climático', desc: 'Marco CMNUCC' },
                                    { title: 'Liderazgo y gestión de nodos', desc: 'Vinculación con sector privado y gobierno' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="w-7 h-7 rounded-full bg-brand-green/15 text-[var(--t-accent)] flex items-center justify-center text-xs font-black shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--t-text)]">{item.title}</p>
                                            <p className="text-xs text-[var(--t-text-faint)] mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {['UNESCO México', 'CMNUCC', 'ODS 2030', 'CEMEFI', 'Pacto Global ONU'].map((tag) => (
                                    <span key={tag} className="text-[9px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 bg-[var(--t-surface)] text-[var(--t-text-faint)] border border-[var(--t-border)]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Cómo trabajamos */}
                    <section className="space-y-4">
                        <h2 className="font-display text-2xl font-semibold">Cómo trabajamos</h2>
                        <div className="space-y-3">
                            {STEPS.map((step, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-brand-green/15 text-[var(--t-accent)] flex items-center justify-center text-xs font-black shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[var(--t-text)]">{step.title}</p>
                                        <p className="text-xs text-[var(--t-text-faint)] mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Galería */}
                    <section className="space-y-3" ref={galeriaRef}>
                        <h2 className="font-display text-2xl font-semibold">Galería</h2>
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
                        <h2 className="font-display text-2xl font-semibold">Reconocimientos</h2>
                        <div className="space-y-2">
                            {RECOGNITIONS.map((r) => (
                                <div key={r} className="flex items-start gap-3">
                                    <Award size={14} className="text-[var(--t-accent)] mt-0.5 shrink-0" />
                                    <p className="text-sm text-[var(--t-text-secondary)]">{r}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ODS */}
                    <section className="space-y-3">
                        <h2 className="font-display text-2xl font-semibold">ODS que impulsamos</h2>
                        <div className="grid grid-cols-4 gap-2">
                            {ODS_LIST.map((ods) => (
                                <div key={ods.num} className="bg-[var(--t-surface)] border border-[var(--t-border)] rounded-xl p-2.5 text-center">
                                    <p className="text-lg font-black text-[var(--t-accent)]">{ods.num}</p>
                                    <p className="text-[9px] text-[var(--t-text-faint)] leading-tight mt-0.5">{ods.label}</p>
                                </div>
                            ))}
                        </div>
                    </section>


                    {/* CTA */}
                    <button
                        onClick={() => ir('patrocinadores')}
                        className="font-futura sticker w-full bg-brand-green text-ink h-12 rounded-full text-sm font-extrabold flex items-center justify-center gap-2 transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                        Quiero ser aliado o patrocinador <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* ===== INFO PRÁCTICA ===== */}
            <div id="info" className="px-4 pt-10 space-y-5 scroll-mt-28">
                <p className="font-futura text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--t-accent)]">Info práctica</p>
                <h2 className="font-display text-2xl font-semibold">Antes de salir de casa</h2>
                <div className="grid gap-3">
                    {INFO_PRACTICA.map((b) => (
                        <div key={b.titulo} className="rounded-3xl bg-[var(--t-surface)] border-2 border-[var(--t-border)] p-4">
                            <p className="flex items-center gap-2 font-bold text-[var(--t-text)]"><span className={clsx('sticker flex h-8 w-8 items-center justify-center rounded-full text-ink', b.color)}><b.icon size={15} /></span>{b.titulo}</p>
                            <ul className="mt-2 space-y-1 text-sm text-[var(--t-text-secondary)]">
                                {b.items.map((i) => <li key={i} className="flex gap-2"><Check size={14} className="mt-1 shrink-0 text-brand-green" />{i}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
                <button onClick={() => router.push('/registro')} className="font-futura sticker w-full bg-brand-green text-ink h-12 rounded-full text-sm font-extrabold flex items-center justify-center gap-2">
                    Registrarme al Encuentro <ArrowRight size={16} />
                </button>
            </div>

            {/* ===== VIEW: PATROCINADORES ===== */}
            {(
                <div id="patrocinadores" className="px-4 pt-10 space-y-8 scroll-mt-28">
                    <p className="font-futura text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--t-accent)]">Patrocinadores y aliados</p>

                    {/* Aliados confirmados del Encuentro 2026 */}
                    <section className="space-y-3">
                        <h2 className="font-display text-2xl font-semibold">Aliados 2026</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {ALIADOS.map((a) => (
                                <div key={a.nombre}
                                    className="sticker flex h-20 items-center justify-center rounded-2xl bg-white p-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={a.logo} alt={a.nombre} className="max-h-full max-w-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </section>

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
                            <h2 className="font-display text-2xl font-semibold">Sé patrocinador</h2>
                            <p className="text-sm text-[var(--t-text-muted)] mt-1">Tu marca junto a 12 años de impacto ambiental en México</p>
                        </div>
                    </section>

                    {/* Tiers */}
                    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:items-start">
                        {TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className="rounded-3xl p-5 space-y-3 bg-[var(--t-surface)] border-2 border-[var(--t-border)]"
                                style={{ borderTop: `6px solid ${tier.color}` }}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: tier.color }}>
                                        {tier.name}
                                    </span>
                                    <span className="font-display text-xl font-semibold text-[var(--t-text)]">{tier.price}</span>
                                </div>
                                <div className="space-y-2">
                                    {tier.perks.map((perk) => (
                                        <div key={perk} className="flex items-start gap-2">
                                            <Check size={14} className="text-[var(--t-accent)] mt-0.5 shrink-0" />
                                            <p className="text-xs text-[var(--t-text-secondary)]">{perk}</p>
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
                            className="font-futura sticker w-full bg-brand-green text-ink h-12 rounded-full text-sm font-extrabold flex items-center justify-center gap-2 transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                            Quiero ser patrocinador <ArrowRight size={16} />
                        </a>
                        <button
                            onClick={() => ir('aliados')}
                            className="w-full h-12 rounded-2xl text-sm font-bold border border-[var(--t-border)] text-[var(--t-text-secondary)] flex items-center justify-center gap-2 hover:bg-[var(--t-overlay-5)] transition-colors active:scale-95"
                        >
                            Ver info de Ecopil primero
                        </button>
                    </div>

                    {/* Decorative image */}
                    <div className="space-y-2">
                        <div className="relative w-full h-32 rounded-xl overflow-hidden">
                            <Image
                                src="/impacto/optimized/Jornada Alpura_AeroMexico-061.webp"
                                alt="Voluntariado corporativo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="text-[10px] text-[var(--t-text-faint)] text-center">Voluntariado corporativo con Alpura & Aeroméxico</p>
                    </div>

                    {/* Donación directa */}
                    <section className="bg-[var(--t-accent-tint-bg)] border-2 border-[var(--t-accent-tint-border)] rounded-3xl p-5 space-y-4">
                        <h3 className="font-display text-xl font-semibold text-[var(--t-text)]">O haz una donación directa</h3>
                        <p className="text-xs text-[var(--t-text-secondary)] leading-relaxed">
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
                                            ? "bg-brand-green text-ink border-2 border-[var(--t-ink)]"
                                            : "bg-[var(--t-overlay-5)] text-[var(--t-text-muted)] border border-[var(--t-border)] hover:bg-[var(--t-overlay-10)]"
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
                                        ? "bg-brand-green text-ink border-2 border-[var(--t-ink)]"
                                        : "bg-[var(--t-overlay-5)] text-[var(--t-text-muted)] border border-[var(--t-border)] hover:bg-[var(--t-overlay-10)]"
                                )}
                            >
                                Otro
                            </button>
                        </div>
                        <button className="w-full bg-[var(--t-overlay-10)] text-[var(--t-text)] h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--t-overlay-15)] transition-colors active:scale-95 border border-[var(--t-border)]">
                            Donar ahora <ArrowRight size={14} />
                        </button>
                    </section>

                    {/* Contacto */}
                    <ContactCards />
                </div>
            )}

            <p className="px-4 pt-8 text-center text-xs text-[var(--t-text-faint)]">¿Eres del staff? <a href="/gestion" className="font-bold underline">Panel de gestores</a></p>

            {/* ===== FOOTER ===== */}
            <footer className="mt-12 -mx-4 border-t-2 border-[var(--t-border)] bg-[var(--t-surface-2)] px-6 pt-6 pb-8 text-center">
                <Mixtli pose="sembrando" height={90} className="mx-auto" />
                <p className="font-display text-base font-semibold text-[var(--t-text)] mt-2">Cinco días para sembrar futuro</p>
                <p className="text-xs text-[var(--t-text-faint)] mt-1">&copy; 2026 Ecopil México A.C. &middot; Nodo Hidalgo / SERAMBI</p>
                <div className="flex justify-center gap-6 mt-4 text-[11px] uppercase tracking-widest font-extrabold text-[var(--t-text-muted)]">
                    <a href="#" className="hover:text-[var(--t-accent)] transition-colors">Instagram</a>
                    <a href="#" className="hover:text-[var(--t-accent)] transition-colors">Facebook</a>
                </div>
            </footer>
        </div>
    );
}
