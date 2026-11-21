'use client';

// Minijuego: Mixtli corre por Hidalgo y salta cactus, pastes, picos de minería
// y átomos gigantes. Toca la pantalla (o espacio) para saltar.
import { useEffect, useRef, useState } from 'react';

type Tipo = 'cactus' | 'paste' | 'pico' | 'atomo';
type Obs = { x: number; w: number; h: number; tipo: Tipo; giro: number };

const H = 190, SUELO = 160, GRAV = 0.0026, SALTO = -0.72, MW = 58, MH = 56;
const TAM: Record<Tipo, [number, number]> = { cactus: [26, 46], paste: [40, 24], pico: [38, 38], atomo: [52, 52] };
const RECORD_KEY = 'mixtli_corre_record';

function dibujar(c: CanvasRenderingContext2D, o: Obs, t: number) {
    const x = o.x, y = SUELO - o.h, ink = '#1C2B20';
    c.lineWidth = 2.5; c.strokeStyle = ink; c.lineJoin = 'round'; c.lineCap = 'round';
    if (o.tipo === 'cactus') {
        c.fillStyle = '#6BB32E';
        const r = (rx: number, ry: number, w: number, h: number) => { c.beginPath(); c.roundRect(rx, ry, w, h, w / 2); c.fill(); c.stroke(); };
        r(x - 2, y + 14, 9, 18); r(x + o.w - 7, y + 8, 9, 16);
        c.fillRect(x + 2, y + 26, 6, 4); c.fillRect(x + o.w - 8, y + 20, 6, 4);
        r(x + 7, y, 12, o.h);
    } else if (o.tipo === 'paste') {
        c.fillStyle = '#F9BC3A';
        c.beginPath(); c.moveTo(x, SUELO); c.quadraticCurveTo(x + o.w / 2, y - 14, x + o.w, SUELO); c.closePath(); c.fill(); c.stroke();
        c.beginPath();
        for (let i = 1; i < 6; i++) { const px = x + (o.w * i) / 6; c.moveTo(px, SUELO - 2); c.lineTo(px, SUELO - 6); }
        c.stroke();
    } else if (o.tipo === 'pico') {
        c.save(); c.translate(x + o.w / 2, y + o.h / 2); c.rotate(-0.5);
        c.fillStyle = '#A68D7B'; c.beginPath(); c.roundRect(-3, -6, 6, o.h * 0.75, 2); c.fill(); c.stroke();
        c.fillStyle = '#9AA3A0'; c.beginPath();
        c.moveTo(-o.w / 2, 0); c.quadraticCurveTo(0, -16, o.w / 2, 0); c.quadraticCurveTo(0, -9, -o.w / 2, 0); c.fill(); c.stroke();
        c.restore();
    } else {
        const cx = x + o.w / 2, cy = y + o.h / 2, r = o.w / 2;
        c.strokeStyle = '#EE8139'; c.lineWidth = 3;
        for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(cx, cy, r, r * 0.32, o.giro + (k * Math.PI) / 3, 0, Math.PI * 2); c.stroke(); }
        c.fillStyle = '#E8434F'; c.strokeStyle = ink; c.lineWidth = 2.5;
        c.beginPath(); c.arc(cx, cy, 7, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillStyle = '#F9BC3A';
        for (let k = 0; k < 3; k++) { const a = t / 300 + (k * 2 * Math.PI) / 3; c.beginPath(); c.arc(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.26, 3.5, 0, Math.PI * 2); c.fill(); }
    }
}

export default function MixtliCorre() {
    const ref = useRef<HTMLCanvasElement>(null);
    const [estado, setEstado] = useState<'listo' | 'jugando' | 'fin'>('listo');
    const [puntos, setPuntos] = useState(0);
    const [record, setRecord] = useState(0);
    const salto = useRef<() => void>(() => {});

    useEffect(() => { setRecord(Number(localStorage.getItem(RECORD_KEY) || 0)); }, []);

    useEffect(() => {
        const cv = ref.current; if (!cv) return;
        const c = cv.getContext('2d')!;
        const img = new Image(); img.src = '/mixtli/mixtli-pala.webp';
        const dpr = window.devicePixelRatio || 1;
        let W = 0;
        const medir = () => { W = cv.clientWidth; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
        medir(); window.addEventListener('resize', medir);

        let y = SUELO - MH, vy = 0, obs: Obs[] = [], vel = 0.32, dist = 0, sig = 600, prev = 0, raf = 0, vivo = estado === 'jugando';
        const tipos: Tipo[] = ['cactus', 'paste', 'pico', 'atomo'];
        salto.current = () => { if (y >= SUELO - MH - 0.5) vy = SALTO; };

        const frame = (t: number) => {
            const dt = Math.min(32, prev ? t - prev : 16); prev = t;
            if (vivo) {
                vel = Math.min(0.75, vel + dt * 0.000012);
                dist += vel * dt;
                vy += GRAV * dt; y = Math.min(SUELO - MH, y + vy * dt);
                sig -= vel * dt;
                if (sig <= 0) {
                    const tipo = tipos[Math.floor(Math.random() * (dist > 2500 ? 4 : 3))];
                    const [w, h] = TAM[tipo];
                    obs.push({ x: W + 10, w, h, tipo, giro: Math.random() * 3 });
                    sig = 260 + Math.random() * 320 + vel * 200;
                }
                obs.forEach((o) => { o.x -= vel * dt; o.giro += dt * 0.002; });
                obs = obs.filter((o) => o.x + o.w > -10);
                const mx = 24 + 12, my = y + 10, mw = MW - 26, mh = MH - 14;
                if (obs.some((o) => mx < o.x + o.w - 4 && mx + mw > o.x + 4 && my + mh > SUELO - o.h + 4)) {
                    vivo = false;
                    const p = Math.floor(dist / 10);
                    setPuntos(p); setEstado('fin');
                    setRecord((r) => { const n = Math.max(r, p); localStorage.setItem(RECORD_KEY, String(n)); return n; });
                } else if (Math.floor(dist / 10) !== Math.floor((dist - vel * dt) / 10)) setPuntos(Math.floor(dist / 10));
            }
            c.clearRect(0, 0, W, H);
            c.strokeStyle = '#1C2B20'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, SUELO); c.lineTo(W, SUELO); c.stroke();
            c.lineWidth = 2; c.beginPath();
            for (let i = 0; i < W / 40 + 1; i++) { const gx = ((i * 40 - dist * 0.999) % (W + 40) + W + 40) % (W + 40) - 20; c.moveTo(gx, SUELO + 10); c.lineTo(gx + 10, SUELO + 10); }
            c.stroke();
            obs.forEach((o) => dibujar(c, o, t));
            if (img.complete) {
                c.save();
                const bob = vivo && y >= SUELO - MH - 0.5 ? Math.sin(t / 60) * 1.5 : 0;
                c.translate(24 + MW / 2, y + MH / 2 + bob); c.scale(-1, 1); c.rotate(vy < 0 ? 0.12 : 0);
                c.drawImage(img, -MW / 2, -MH / 2 - 4, MW, MH * (763 / 800) + 4);
                c.restore();
            }
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', medir); };
    }, [estado]);

    const tocar = () => {
        if (estado === 'jugando') salto.current();
        else { setPuntos(0); setEstado('jugando'); }
    };

    useEffect(() => {
        const k = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); tocar(); } };
        if (estado === 'jugando') window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    });

    return (
        <section className="sticker relative select-none overflow-hidden rounded-3xl bg-[var(--t-surface)]"
            onPointerDown={(e) => { e.preventDefault(); tocar(); }} style={{ touchAction: 'manipulation' }}>
            <div className="flex items-center justify-between px-4 pt-3 font-futura text-xs font-bold">
                <span>Mixtli cruza Hidalgo</span>
                <span className="tabular-nums">{puntos} m · récord {record} m</span>
            </div>
            <canvas ref={ref} className="block h-[190px] w-full" aria-label="Juego: Mixtli salta obstáculos" />
            {estado !== 'jugando' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[var(--t-surface)]/70 text-center">
                    <p className="font-display text-2xl">{estado === 'fin' ? `¡Llegaste a ${puntos} m!` : 'Ayuda a Mixtli a cruzar Hidalgo'}</p>
                    <p className="text-xs opacity-80">Salta cactus, pastes, picos mineros y átomos gigantes</p>
                    <span className="font-futura mt-2 rounded-full bg-brand-green px-4 py-1.5 text-sm font-extrabold text-ink">
                        {estado === 'fin' ? 'Otra vez' : 'Toca para jugar'}
                    </span>
                </div>
            )}
        </section>
    );
}
