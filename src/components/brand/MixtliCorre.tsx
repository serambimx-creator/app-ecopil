'use client';

// Minijuego "Mixtli cruza Hidalgo": Mixtli corre, salta obstáculos de cada región,
// junta Ecopil pesos y cada cierto tramo responde una pregunta. 4 niveles × 5 preguntas.
import { useEffect, useRef, useState } from 'react';
import Mixtli from './Mixtli';
import { NIVELES, type Obstaculo, type Pregunta } from '@/data/juego-mixtli';

type Obs = { x: number; w: number; h: number; tipo: Obstaculo; giro: number };
type Moneda = { x: number; y: number; ok: boolean };
type Fase = 'listo' | 'jugando' | 'pregunta' | 'nivel' | 'fin' | 'gano';

const H = 230, SUELO = 205, GRAV = 0.0026, SALTO = -0.78, MW = 84, MH = 80, MX = 20;
const TRAMO_MS = 60_000; // tiempo de juego entre preguntas
const TAM: Record<Obstaculo, [number, number]> = {
    cactus: [26, 46], maguey: [44, 32], paste: [40, 24], pico: [38, 38], roca: [40, 28], pino: [34, 54], atomo: [50, 50], gota: [28, 40],
};
const RECORD_KEY = 'mixtli_pesos_record';
const INK = '#1C2B20';

function revolver(q: Pregunta) {
    const ops = q.o.map((t, i) => ({ t, ok: i === 0 }));
    for (let i = ops.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ops[i], ops[j]] = [ops[j], ops[i]]; }
    return ops;
}

function dibujar(c: CanvasRenderingContext2D, o: Obs, t: number) {
    const x = o.x, y = SUELO - o.h;
    c.lineWidth = 2.5; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round';
    const rr = (rx: number, ry: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(rx, ry, w, h, r); c.fill(); c.stroke(); };
    switch (o.tipo) {
        case 'cactus':
            c.fillStyle = '#6BB32E';
            rr(x - 2, y + 14, 9, 18, 4); rr(x + o.w - 7, y + 8, 9, 16, 4);
            c.fillRect(x + 2, y + 26, 6, 4); c.fillRect(x + o.w - 8, y + 20, 6, 4);
            rr(x + 7, y, 12, o.h, 6); break;
        case 'maguey':
            c.fillStyle = '#8DB580';
            for (const [dx, tip] of [[-0.5, 0.2], [0.5, 0.2], [-0.25, 0], [0.25, 0], [0, -0.1]] as const) {
                c.beginPath(); c.moveTo(x + o.w / 2 - 6, SUELO); c.lineTo(x + o.w / 2 + dx * o.w, y + tip * o.h); c.lineTo(x + o.w / 2 + 6, SUELO); c.closePath(); c.fill(); c.stroke();
            } break;
        case 'paste':
            c.fillStyle = '#F9BC3A';
            c.beginPath(); c.moveTo(x, SUELO); c.quadraticCurveTo(x + o.w / 2, y - 14, x + o.w, SUELO); c.closePath(); c.fill(); c.stroke();
            c.beginPath(); for (let i = 1; i < 6; i++) { const px = x + (o.w * i) / 6; c.moveTo(px, SUELO - 2); c.lineTo(px, SUELO - 6); } c.stroke(); break;
        case 'pico':
            c.save(); c.translate(x + o.w / 2, y + o.h / 2); c.rotate(-0.5);
            c.fillStyle = '#A68D7B'; rr(-3, -6, 6, o.h * 0.75, 2);
            c.fillStyle = '#9AA3A0'; c.beginPath(); c.moveTo(-o.w / 2, 0); c.quadraticCurveTo(0, -16, o.w / 2, 0); c.quadraticCurveTo(0, -9, -o.w / 2, 0); c.fill(); c.stroke();
            c.restore(); break;
        case 'roca':
            c.fillStyle = '#8A8F86';
            c.beginPath(); c.moveTo(x, SUELO); c.lineTo(x + 6, y + 8); c.lineTo(x + 18, y); c.lineTo(x + 32, y + 6); c.lineTo(x + o.w, SUELO); c.closePath(); c.fill(); c.stroke(); break;
        case 'pino':
            c.fillStyle = '#A68D7B'; rr(x + o.w / 2 - 4, SUELO - 12, 8, 12, 1);
            c.fillStyle = '#2F7D4A';
            for (let k = 0; k < 3; k++) { const ty = y + k * 13; c.beginPath(); c.moveTo(x + o.w / 2, ty); c.lineTo(x + o.w - k, ty + 22); c.lineTo(x + k, ty + 22); c.closePath(); c.fill(); c.stroke(); }
            break;
        case 'gota':
            c.fillStyle = '#5DADE2';
            c.beginPath(); c.moveTo(x + o.w / 2, y); c.bezierCurveTo(x + o.w + 4, y + o.h * 0.6, x + o.w, SUELO, x + o.w / 2, SUELO);
            c.bezierCurveTo(x, SUELO, x - 4, y + o.h * 0.6, x + o.w / 2, y); c.fill(); c.stroke(); break;
        case 'atomo': {
            const cx = x + o.w / 2, cy = y + o.h / 2, r = o.w / 2;
            c.strokeStyle = '#EE8139'; c.lineWidth = 3;
            for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(cx, cy, r, r * 0.32, o.giro + (k * Math.PI) / 3, 0, Math.PI * 2); c.stroke(); }
            c.fillStyle = '#E8434F'; c.strokeStyle = INK; c.lineWidth = 2.5;
            c.beginPath(); c.arc(cx, cy, 7, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#F9BC3A';
            for (let k = 0; k < 3; k++) { const a = t / 300 + (k * 2 * Math.PI) / 3; c.beginPath(); c.arc(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.26, 3.5, 0, Math.PI * 2); c.fill(); }
        }
    }
}

function moneda(c: CanvasRenderingContext2D, m: Moneda, t: number) {
    const s = Math.abs(Math.cos(t / 250 + m.x / 50));
    c.save(); c.translate(m.x, m.y); c.scale(0.35 + 0.65 * s, 1);
    c.fillStyle = '#F9BC3A'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, 10, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = INK; c.font = 'bold 12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('E', 0, 1);
    c.restore();
}

export default function MixtliCorre({ children }: { children?: React.ReactNode }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const [fase, setFase] = useState<Fase>('listo');
    const [pesos, setPesos] = useState(0);
    const [metros, setMetros] = useState(0);
    const [q, setQ] = useState(0);
    const [ops, setOps] = useState<{ t: string; ok: boolean }[]>([]);
    const [resp, setResp] = useState<null | boolean>(null);
    const [record, setRecord] = useState(0);
    const faseR = useRef<Fase>('listo');
    const qR = useRef(0);
    const juego = useRef({ salto: () => {}, reiniciar: () => {}, limpiar: () => {} });

    const cambiar = (f: Fase) => { faseR.current = f; setFase(f); };

    useEffect(() => { setRecord(Number(localStorage.getItem(RECORD_KEY) || 0)); }, []);

    useEffect(() => {
        const cv = ref.current; if (!cv) return;
        const c = cv.getContext('2d')!;
        const img = new Image(); img.src = '/mixtli/mixtli-pala.webp';
        const dpr = window.devicePixelRatio || 1;
        let W = 0;
        const medir = () => { W = cv.clientWidth; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); };
        medir(); window.addEventListener('resize', medir);

        let y = SUELO - MH, vy = 0, obs: Obs[] = [], mon: Moneda[] = [], vel = 0.32, dist = 0, sigO = 600, sigM = 300, prev = 0, raf = 0, pes = 0, jugado = 0;
        juego.current.salto = () => { if (y >= SUELO - MH - 0.5) vy = SALTO; };
        juego.current.limpiar = () => { obs = []; mon = []; sigO = 500; vel = 0.32 + 0.05 * Math.floor(qR.current / 5); };
        juego.current.reiniciar = () => { y = SUELO - MH; vy = 0; dist = 0; pes = 0; jugado = 0; qR.current = 0; juego.current.limpiar(); setPesos(0); setMetros(0); setQ(0); };
        const ajustarPesos = (d: number) => { pes = Math.max(0, pes + d); setPesos(pes); };
        (juego.current as unknown as { pesos: (d: number) => void }).pesos = ajustarPesos;

        const frame = (t: number) => {
            const dt = Math.min(32, prev ? t - prev : 16); prev = t;
            const f = faseR.current, nivel = NIVELES[Math.min(3, Math.floor(qR.current / 5))];
            if (f === 'jugando') {
                vel = Math.min(0.8, vel + dt * 0.00001);
                const antes = Math.floor(dist / 10);
                dist += vel * dt; jugado += dt;
                vy += GRAV * dt; y = Math.min(SUELO - MH, y + vy * dt);
                sigO -= vel * dt; sigM -= vel * dt;
                if (sigO <= 0) {
                    const tipo = nivel.obstaculos[Math.floor(Math.random() * nivel.obstaculos.length)];
                    const [w, h] = TAM[tipo];
                    obs.push({ x: W + 10, w, h, tipo, giro: Math.random() * 3 });
                    sigO = 260 + Math.random() * 320 + vel * 200;
                }
                if (sigM <= 0) {
                    const alto = Math.random() < 0.5;
                    for (let k = 0; k < 3; k++) mon.push({ x: W + 20 + k * 26, y: alto ? SUELO - 120 : SUELO - 22, ok: false });
                    sigM = 380 + Math.random() * 400;
                }
                obs.forEach((o) => { o.x -= vel * dt; o.giro += dt * 0.002; });
                mon.forEach((m) => { m.x -= vel * dt; });
                obs = obs.filter((o) => o.x + o.w > -10);
                mon = mon.filter((m) => m.x > -20 && !m.ok);
                const mx = MX + 18, my = y + 12, mw = MW - 36, mh = MH - 16;
                mon.forEach((m) => { if (m.x > mx - 8 && m.x < mx + mw + 8 && m.y > my - 8 && m.y < my + mh + 8) { m.ok = true; ajustarPesos(1); } });
                const m = Math.floor(dist / 10);
                if (m !== antes) setMetros(m);
                if (obs.some((o) => mx < o.x + o.w - 4 && mx + mw > o.x + 4 && my + mh > SUELO - o.h + 4)) {
                    cambiar('fin');
                    setRecord((r) => { const n = Math.max(r, pes); localStorage.setItem(RECORD_KEY, String(n)); return n; });
                } else if (jugado >= TRAMO_MS) {
                    jugado = 0;
                    setOps(revolver(NIVELES[Math.floor(qR.current / 5)].preguntas[qR.current % 5]));
                    setResp(null); setQ(qR.current); cambiar('pregunta');
                }
            }
            c.clearRect(0, 0, W, H);
            if (f !== 'listo') {
                c.globalAlpha = 0.25; c.fillStyle = nivel.cielo; c.beginPath(); c.arc(W - 50, 70, 34, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
            }
            c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, SUELO); c.lineTo(W, SUELO); c.stroke();
            c.lineWidth = 2; c.beginPath();
            for (let i = 0; i < W / 40 + 1; i++) { const gx = ((i * 40 - dist) % (W + 40) + W + 40) % (W + 40) - 20; c.moveTo(gx, SUELO + 10); c.lineTo(gx + 10, SUELO + 10); }
            c.stroke();
            mon.forEach((mm) => moneda(c, mm, t));
            obs.forEach((o) => dibujar(c, o, t));
            if (img.complete) {
                c.save();
                const bob = f === 'jugando' && y >= SUELO - MH - 0.5 ? Math.sin(t / 60) * 1.5 : 0;
                c.translate(MX + MW / 2, y + MH / 2 + bob); c.scale(-1, 1); c.rotate(vy < 0 ? 0.12 : 0);
                c.drawImage(img, -MW / 2, -MH / 2 - 4, MW, MH * (763 / 800) + 4);
                c.restore();
            }
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', medir); };
    }, []);

    const pesosDelta = (d: number) => (juego.current as unknown as { pesos: (d: number) => void }).pesos(d);

    const empezar = () => { juego.current.reiniciar(); cambiar('nivel'); };
    const tocar = () => {
        const f = faseR.current;
        if (f === 'jugando') juego.current.salto();
        else if (f === 'nivel') cambiar('jugando');
        else if (f === 'fin' || f === 'gano') empezar();
    };

    const responder = (ok: boolean) => {
        if (resp !== null) return;
        setResp(ok); pesosDelta(ok ? 5 : -10);
        setTimeout(() => {
            qR.current += 1;
            if (qR.current >= 20) {
                setRecord((r) => { const n = Math.max(r, pesos + (ok ? 5 : 0)); localStorage.setItem(RECORD_KEY, String(n)); return n; });
                cambiar('gano');
            } else if (qR.current % 5 === 0) { juego.current.limpiar(); setQ(qR.current); cambiar('nivel'); }
            else cambiar('jugando');
        }, ok ? 900 : 2200);
    };

    useEffect(() => {
        const k = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); tocar(); } };
        if (fase === 'jugando' || fase === 'nivel') window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    });

    const nivel = NIVELES[Math.min(3, Math.floor(q / 5))];
    const preg = nivel.preguntas[q % 5];

    return (
        <div className="relative h-[230px] select-none" style={{ touchAction: 'manipulation' }}
            onPointerDown={(e) => { if (fase !== 'listo' && fase !== 'pregunta') { e.preventDefault(); tocar(); } }}>
            <canvas ref={ref} className={`absolute inset-0 block h-[230px] w-full ${fase === 'listo' ? 'invisible' : ''}`}
                aria-label="Juego: Mixtli salta obstáculos y junta Ecopil pesos" />
            {fase === 'listo' ? (
                <>
                    <button type="button" onClick={empezar} aria-label="Jugar con Mixtli" className="absolute bottom-6 right-4">
                        <Mixtli pose="pala" height={200} priority animated />
                    </button>
                    {children}
                    <button type="button" onClick={empezar}
                        className="font-futura sticker absolute bottom-4 left-5 rounded-full bg-ecopil-sun px-4 py-2 text-xs font-extrabold text-ink">
                        Juega: salta con Mixtli
                    </button>
                </>
            ) : (
                <>
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between font-futura text-xs font-bold tabular-nums">
                        <span>{nivel.nombre} · {nivel.lugar}</span>
                        <span className="rounded-full bg-ecopil-sun px-2 py-0.5 text-ink">E$ {pesos}</span>
                    </div>
                    <div className="absolute left-0 top-5 font-futura text-[11px] opacity-70 tabular-nums">
                        {metros} m · pregunta {Math.min(20, q + 1)}/20 · récord E$ {record}
                    </div>
                    {fase === 'nivel' && (
                        <div className="absolute inset-y-0 left-24 right-0 flex flex-col items-center justify-center gap-1 text-center">
                            <p className="font-futura text-xs font-bold uppercase tracking-wider">{nivel.nombre}</p>
                            <p className="font-display text-3xl">{nivel.lugar}</p>
                            <p className="text-xs opacity-80">Junta Ecopil pesos para ayudar a más nodos. Toca para saltar.</p>
                        </div>
                    )}
                    {fase === 'pregunta' && (
                        <div className="sticker absolute inset-x-0 top-8 rounded-2xl bg-[var(--t-surface)] p-3">
                            <p className="mb-2 text-sm font-semibold leading-snug">{preg.p}</p>
                            <div className="grid gap-1.5">
                                {ops.map((op) => (
                                    <button key={op.t} type="button" onClick={() => responder(op.ok)}
                                        className={`rounded-xl border-2 px-3 py-1.5 text-left text-xs font-semibold transition-colors ${
                                            resp === null ? 'border-[var(--t-border)] active:bg-[var(--t-surface-2)]'
                                                : op.ok ? 'border-brand-green bg-brand-green/30' : 'border-[var(--t-border)] opacity-50'}`}>
                                        {op.t}
                                    </button>
                                ))}
                            </div>
                            {resp !== null && (
                                <p className="mt-2 text-xs font-bold">{resp ? '¡Correcto! +5 Ecopil pesos' : 'Uy, no. −10 Ecopil pesos'}</p>
                            )}
                        </div>
                    )}
                    {fase === 'fin' && (
                        <div className="absolute inset-y-0 left-24 right-0 flex flex-col items-center justify-center gap-1 text-center">
                            <p className="font-display text-2xl">Juntaste E$ {pesos}</p>
                            <p className="text-xs opacity-80">Llegaste a {metros} m · toca para intentarlo otra vez</p>
                        </div>
                    )}
                    {fase === 'gano' && (
                        <div className="absolute inset-y-0 left-24 right-0 flex flex-col items-center justify-center gap-1 text-center">
                            <p className="font-display text-2xl">¡Cruzaste Hidalgo!</p>
                            <p className="text-sm">Juntaste E$ {pesos} para ayudar a más nodos.</p>
                            <p className="text-xs opacity-80">Toca para jugar de nuevo</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
