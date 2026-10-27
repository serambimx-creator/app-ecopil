import Image from 'next/image';
import { clsx } from 'clsx';

// Mixtli, el cacomixtle de Ecopil. Cada pose tiene su uso:
// asoma → cargas y avisos, lupa → vacíos/búsquedas, pala → portada, sembrando → cierres y CTA.
const POSES = {
    asoma: { src: '/mixtli/mixtli-asoma.webp', w: 261, h: 278 },
    lupa: { src: '/mixtli/mixtli-lupa.webp', w: 800, h: 633 },
    pala: { src: '/mixtli/mixtli-pala.webp', w: 800, h: 763 },
    sembrando: { src: '/mixtli/mixtli-sembrando.webp', w: 371, h: 282 },
} as const;

export type MixtliPose = keyof typeof POSES;

interface MixtliProps {
    pose: MixtliPose;
    /** Alto en px; el ancho sale de la proporción de la imagen */
    height: number;
    className?: string;
    animated?: boolean;
    priority?: boolean;
}

export default function Mixtli({ pose, height, className, animated, priority }: MixtliProps) {
    const p = POSES[pose];
    const width = Math.round((p.w / p.h) * height);
    return (
        <Image
            src={p.src}
            alt="Mixtli, el cacomixtle de Ecopil"
            width={width}
            height={height}
            priority={priority}
            className={clsx('select-none pointer-events-none', animated && 'animate-mixtli', className)}
        />
    );
}

/** Globo de diálogo de Mixtli */
export function MixtliBubble({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={clsx('relative sticker bg-[var(--t-surface)] rounded-2xl px-3 py-2 text-xs font-bold text-[var(--t-text)]', className)}>
            {children}
        </div>
    );
}

/** Sol con rayos y lomas, tomado del logo de Ecopil */
export function SunHills({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 400 200" className={className} aria-hidden="true" preserveAspectRatio="xMidYMax slice">
            <g transform="translate(200 200)">
                <path d="M-150 0 A150 150 0 0 1 150 0 Z" fill="#F9BC3A" />
                {[-70, -40, -12, 15, 42, 70].map((a) => (
                    <line
                        key={a}
                        x1="0"
                        y1="0"
                        x2={150 * Math.sin((a * Math.PI) / 180)}
                        y2={-150 * Math.cos((a * Math.PI) / 180)}
                        stroke="#EE8139"
                        strokeWidth="9"
                    />
                ))}
            </g>
            <path d="M0 150 C 60 95, 110 95, 160 135 S 270 120, 300 105 S 370 90, 400 120" fill="none" stroke="#6BB32E" strokeWidth="5" strokeLinecap="round" />
            <path d="M0 200 L0 175 C 80 150, 140 170, 200 182 S 330 160, 400 172 L400 200 Z" fill="#6BB32E" />
        </svg>
    );
}
