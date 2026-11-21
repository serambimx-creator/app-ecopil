// Fondos del juego de Mixtli: cada tramo pasa por un paisaje de Hidalgo.
export type Paisaje = 'matorral' | 'atlantes' | 'mina' | 'montana' | 'bosque' | 'selva' | 'agua';

// Un paisaje por tramo (20 tramos = 4 niveles × 5)
export const RUTA: Paisaje[] = [
    'matorral', 'atlantes', 'matorral', 'atlantes', 'matorral',
    'mina', 'montana', 'mina', 'montana', 'mina',
    'bosque', 'montana', 'bosque', 'montana', 'bosque',
    'selva', 'agua', 'selva', 'agua', 'selva',
];

const LEJOS: Record<Paisaje, [string, number, number]> = {
    // color, altura base, amplitud
    matorral: ['#EADBB4', 40, 14], atlantes: ['#E9CFA6', 36, 10], mina: ['#D8CBBE', 60, 26],
    montana: ['#C3CDBA', 80, 50], bosque: ['#B5D3A8', 66, 22], selva: ['#9ACB8E', 74, 20], agua: ['#C5E2EE', 34, 10],
};

const rnd = (i: number, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };

export function dibujarFondo(c: CanvasRenderingContext2D, p: Paisaje, dist: number, W: number, suelo: number) {
    const [col, base, amp] = LEJOS[p];
    // Capa lejana: lomas
    c.fillStyle = col; c.beginPath(); c.moveTo(0, suelo);
    const o1 = dist * 0.15;
    for (let x = 0; x <= W + 10; x += 10) {
        const t = (x + o1) / 90;
        const yv = p === 'montana' || p === 'mina'
            ? base + amp * Math.abs(Math.sin(t * 0.9)) + amp * 0.3 * Math.sin(t * 2.3)
            : base + amp * Math.sin(t) * 0.6 + amp * 0.4 * Math.sin(t * 2.1);
        c.lineTo(x, suelo - yv);
    }
    c.lineTo(W, suelo); c.closePath(); c.fill();

    // Capa cercana: elementos por mosaico
    const T = 130, o2 = dist * 0.45, i0 = Math.floor(o2 / T) - 1;
    for (let i = i0; i < i0 + W / T + 3; i++) {
        const x = i * T - o2 + rnd(i) * 50, r = rnd(i, 1), h = 0.7 + 0.5 * rnd(i, 2);
        c.save(); c.translate(x, suelo);
        elemento(c, p, r, h, i);
        c.restore();
    }
}

function elemento(c: CanvasRenderingContext2D, p: Paisaje, r: number, h: number, i: number) {
    const f = (col: string) => { c.fillStyle = col; };
    switch (p) {
        case 'matorral':
            if (r < 0.5) { // cardón
                f('#B9CC8F'); c.fillRect(-5, -52 * h, 10, 52 * h); c.fillRect(-16, -34 * h, 7, 18 * h); c.fillRect(9, -40 * h, 7, 20 * h);
                c.fillRect(-16, -20 * h, 14, 5); c.fillRect(2, -24 * h, 14, 5);
            } else { // maguey
                f('#BFD0A8');
                for (const a of [-1, -0.5, 0, 0.5, 1]) { c.beginPath(); c.moveTo(-6, 0); c.lineTo(a * 26 * h, -30 * h * (1 - Math.abs(a) * 0.3)); c.lineTo(6, 0); c.fill(); }
            }
            break;
        case 'atlantes':
            if (i % 3 === 0) { // pirámide escalonada
                f('#DDBF95'); for (let k = 0; k < 4; k++) c.fillRect(-70 + k * 12, -14 - k * 14, 140 - k * 24, 14);
            } else { // atlante
                f('#CBB08C'); c.fillRect(-9, -70, 18, 70); c.fillRect(-11, -84, 22, 14); c.fillRect(-7, -92, 14, 8);
                f('#BFA27C'); c.fillRect(-9, -56, 18, 4); c.fillRect(-9, -30, 18, 4);
            }
            break;
        case 'mina':
            if (r < 0.5) { // castillete
                c.strokeStyle = '#AE9C8C'; c.lineWidth = 4;
                c.beginPath(); c.moveTo(-20, 0); c.lineTo(0, -70); c.lineTo(20, 0); c.moveTo(-12, -30); c.lineTo(12, -30); c.stroke();
                c.beginPath(); c.arc(0, -70, 9, 0, Math.PI * 2); c.stroke();
            } else { // chimenea
                f('#C4A58C'); c.beginPath(); c.moveTo(-9, 0); c.lineTo(-6, -64 * h); c.lineTo(6, -64 * h); c.lineTo(9, 0); c.fill();
            }
            break;
        case 'montana': // peñas
            f('#A9B5A0'); c.beginPath(); c.moveTo(-30, 0); c.lineTo(-14, -60 * h); c.lineTo(-4, -78 * h); c.lineTo(8, -54 * h); c.lineTo(30, 0); c.fill();
            break;
        case 'bosque':
            for (const dx of [-22, 0, 22]) {
                const hh = (50 + 30 * rnd(i, dx)) * h;
                f('#8FBF8A'); c.beginPath(); c.moveTo(dx, -hh); c.lineTo(dx + 14, -8); c.lineTo(dx - 14, -8); c.fill();
                f('#B59C88'); c.fillRect(dx - 2, -8, 4, 8);
            }
            break;
        case 'selva':
            f('#B59C88'); c.fillRect(-4, -60 * h, 8, 60 * h);
            f('#86C27F');
            for (const [dx, dy, rr] of [[-16, -62, 20], [14, -66, 22], [0, -80, 22]]) { c.beginPath(); c.arc(dx, dy * h, rr * h, 0, Math.PI * 2); c.fill(); }
            f('#9BD08F'); c.beginPath(); c.ellipse(30, -8, 16, 8, -0.4, 0, Math.PI * 2); c.fill();
            break;
        case 'agua':
            f('#A8D3E6'); c.fillRect(-70, -12, 140, 12);
            c.strokeStyle = '#86BFD8'; c.lineWidth = 2;
            c.beginPath(); for (let k = -60; k < 60; k += 20) { c.moveTo(k, -6); c.quadraticCurveTo(k + 5, -10, k + 10, -6); } c.stroke();
            if (r < 0.6) { c.strokeStyle = '#9CC28F'; c.lineWidth = 3; c.beginPath(); for (const dx of [-30, -26, -22]) { c.moveTo(dx, -10); c.lineTo(dx + 2, -38 * h); } c.stroke(); }
            break;
    }
}
