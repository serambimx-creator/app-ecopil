'use client';

import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Loader2, FileSignature, Download, Check, Eraser } from 'lucide-react';
import { ecopil } from '@/lib/ecopil';
import type { Comprobante } from '@/lib/comprobanteCarta';

interface Carta { version: string; titulo: string; texto: string; hash: string }

export async function bajarComprobante(c: Comprobante) {
    const { descargarComprobante } = await import('@/lib/comprobanteCarta');
    await descargarComprobante(c);
}

// Recuadro para dibujar la firma con el dedo o el mouse (opcional).
function PadFirma({ onCambio }: { onCambio: (png: string | null) => void }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const dibujando = useRef(false);

    useEffect(() => {
        const c = ref.current!;
        const r = window.devicePixelRatio || 1;
        c.width = c.offsetWidth * r; c.height = c.offsetHeight * r;
        const ctx = c.getContext('2d')!;
        ctx.scale(r, r); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#22301B';
    }, []);

    const pos = (e: React.PointerEvent) => { const b = ref.current!.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    const limpiar = () => {
        const c = ref.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); onCambio(null);
    };
    return (
        <div>
            <canvas ref={ref} className="h-32 w-full touch-none rounded-2xl border-2 border-dashed border-[var(--t-border)] bg-white"
                onPointerDown={(e) => { dibujando.current = true; ref.current!.setPointerCapture(e.pointerId); const [x, y] = pos(e); const ctx = ref.current!.getContext('2d')!; ctx.beginPath(); ctx.moveTo(x, y); }}
                onPointerMove={(e) => { if (!dibujando.current) return; const [x, y] = pos(e); const ctx = ref.current!.getContext('2d')!; ctx.lineTo(x, y); ctx.stroke(); }}
                onPointerUp={() => { if (!dibujando.current) return; dibujando.current = false; onCambio(ref.current!.toDataURL('image/png')); }} />
            <button type="button" onClick={limpiar} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--t-text-muted)]"><Eraser size={12} /> Borrar firma</button>
        </div>
    );
}

type Ficha = { alergias: string; padecimientos: string; medicamentos: string; tipo_sangre: string; seguro: string; notas: string };
const FICHA_VACIA: Ficha = { alergias: '', padecimientos: '', medicamentos: '', tipo_sangre: '', seguro: '', notas: '' };
const inp = 'w-full rounded-2xl border-2 border-[var(--t-border)] bg-[var(--t-bg)] px-3 py-2 text-sm text-[var(--t-text)] focus:outline-none focus:border-brand-green';
const caja = 'mt-0.5 h-5 w-5 shrink-0 accent-[#3F7A1A]';
const conDatos = (x: Ficha) => Object.values(x).some((v) => v.trim());

async function guardarFicha(token: string, x: Ficha) {
    const { error } = await ecopil.rpc('encuentro_guardar_ficha', {
        p_token: token, p_consiento: true, p_alergias: x.alergias, p_padecimientos: x.padecimientos, p_medicamentos: x.medicamentos,
        p_tipo_sangre: x.tipo_sangre, p_seguro: x.seguro, p_notas: x.notas,
    });
    if (error) throw new Error(error.message);
}

// Ficha médica: datos de salud (sensibles). Opcional, se puede actualizar; requiere consentimiento expreso.
function CamposFicha({ v, set, consiento, setConsiento }: { v: Ficha; set: (x: Ficha) => void; consiento: boolean; setConsiento: (b: boolean) => void }) {
    const campo = (k: keyof Ficha, ph: string) => <input className={inp} placeholder={ph} value={v[k]} onChange={(e) => set({ ...v, [k]: e.target.value })} />;
    return (
        <div className="space-y-2">
            {campo('alergias', 'Alergias (medicamentos, alimentos, picaduras…)')}
            {campo('padecimientos', 'Padecimientos (asma, diabetes, epilepsia…)')}
            {campo('medicamentos', 'Medicamentos que tomas')}
            <div className="flex gap-2">{campo('tipo_sangre', 'Tipo de sangre')}{campo('seguro', 'Seguro médico (IMSS, ISSSTE…)')}</div>
            {campo('notas', 'Otra cosa que el staff deba saber')}
            {conDatos(v) && (
                <label className="flex gap-2 text-xs"><input type="checkbox" className={caja} checked={consiento} onChange={(e) => setConsiento(e.target.checked)} />
                    Consiento expresamente que Ecopil MX trate estos datos de salud para atenderme en una emergencia, según el aviso de privacidad.</label>
            )}
        </div>
    );
}

function FichaMedica({ token }: { token: string }) {
    const [abierta, setAbierta] = useState(false);
    const [v, setV] = useState<Ficha>(FICHA_VACIA);
    const [consiento, setConsiento] = useState(false);
    const [estado, setEstado] = useState('');
    useEffect(() => {
        ecopil.rpc('encuentro_mi_ficha', { p_token: token }).then(({ data }) => {
            if (!data) return;
            const d = data as Record<string, string | null>;
            setV(Object.fromEntries(Object.keys(FICHA_VACIA).map((k) => [k, d[k] ?? ''])) as Ficha); setConsiento(true);
        });
    }, [token]);
    if (!abierta) return <button onClick={() => setAbierta(true)} className="text-xs font-bold underline text-[var(--t-text-muted)]">{conDatos(v) ? 'Actualizar' : 'Agregar'} ficha médica</button>;
    return (
        <form className="space-y-2" onSubmit={async (e) => {
            e.preventDefault(); setEstado('');
            try { await guardarFicha(token, v); setEstado('Guardada ✓'); } catch (err) { setEstado((err as Error).message); }
        }}>
            <CamposFicha v={v} set={setV} consiento={consiento} setConsiento={setConsiento} />
            <button disabled={conDatos(v) && !consiento} className="font-futura w-full rounded-full bg-brand-green py-2.5 text-sm font-extrabold text-ink disabled:opacity-50">Guardar ficha médica</button>
            {estado && <p className="text-xs font-bold">{estado}</p>}
        </form>
    );
}

export default function CartaCompromiso({ token, nombre, onFirmada }: { token: string; nombre: string; onFirmada?: () => void }) {
    const [comprobante, setComprobante] = useState<Comprobante | null | undefined>(undefined);
    const [carta, setCarta] = useState<Carta | null>(null);
    const [abierta, setAbierta] = useState(false);
    const [leida, setLeida] = useState(false);
    const [f, setF] = useState({ nombre, deslinde: false, privacidad: false, imagen: null as boolean | null, menor: false, tutor: '', parentesco: '' });
    const [ficha, setFicha] = useState<Ficha>(FICHA_VACIA);
    const [consiento, setConsiento] = useState(false);
    const [firma, setFirma] = useState<string | null>(null);
    const [ocupado, setOcupado] = useState(false);
    const [error, setError] = useState('');
    const [bajando, setBajando] = useState(false);
    const texto = useRef<HTMLDivElement>(null);

    // Si el texto cabe sin desplazar, ya se leyó completo.
    useEffect(() => { const t = texto.current; if (t && t.scrollHeight <= t.clientHeight + 12) setLeida(true); }, [carta, abierta]);

    useEffect(() => {
        ecopil.rpc('encuentro_mi_carta', { p_token: token }).then(({ data, error }) => setComprobante(error ? null : (data as Comprobante | null)));
    }, [token]);

    useEffect(() => {
        if (comprobante === null && !carta) ecopil.rpc('encuentro_carta').then(({ data }) => setCarta((data as Carta) ?? null));
    }, [comprobante, carta]);

    if (comprobante === undefined) return null;

    const bajar = async () => { setBajando(true); try { await bajarComprobante(comprobante!); } finally { setBajando(false); } };

    if (comprobante) {
        return (
            <div className="sticker rounded-3xl bg-[var(--t-surface)] p-4 space-y-2">
                <p className="flex items-center gap-2 font-display text-lg font-semibold"><Check size={18} className="text-brand-green" /> Carta compromiso aceptada</p>
                <p className="text-xs text-[var(--t-text-muted)]">Folio {comprobante.folio} · {comprobante.fecha_texto}{comprobante.acepta_imagen ? '' : ' · Sin autorización de imagen'}</p>
                <button onClick={bajar} disabled={bajando} className="font-futura flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--t-border)] py-2.5 text-sm font-bold">
                    {bajando ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Descargar comprobante (PDF)
                </button>
                <FichaMedica token={token} />
            </div>
        );
    }

    const preview = carta?.texto
        .replaceAll('{{NOMBRE}}', f.menor ? `${f.tutor || '[nombre de tu tutor]'} (${f.parentesco || 'parentesco'}), en representación de ${f.nombre || '[tu nombre]'}` : (f.nombre || '[tu nombre completo]'))
        .replaceAll('{{FECHA}}', '[fecha y hora del servidor al aceptar]')
        .replaceAll('{{IMAGEN}}', f.imagen === null ? '[SÍ / NO] AUTORIZO' : f.imagen ? 'SÍ AUTORIZO' : 'NO AUTORIZO');
    const valido = leida && f.deslinde && f.privacidad && f.imagen !== null && f.nombre.trim().length >= 5
        && (!f.menor || (f.tutor.trim().length >= 5 && f.parentesco.trim().length >= 3)) && (!conDatos(ficha) || consiento);

    return (
        <div className="sticker rounded-3xl bg-ecopil-sun p-4 text-ink space-y-3">
            <p className="flex items-center gap-2 font-display text-xl font-semibold"><FileSignature size={20} /> Falta tu carta compromiso</p>
            <p className="text-sm">Antes de que el staff valide tu lugar, lee y acepta la carta. Te toma 2 minutos.</p>
            {!abierta ? (
                <button onClick={() => setAbierta(true)} className="font-futura w-full rounded-full bg-ink py-3 font-extrabold text-white">Leer y firmar</button>
            ) : !carta ? (
                <Loader2 className="mx-auto animate-spin" />
            ) : (
                <form className="space-y-3 rounded-2xl bg-[var(--t-surface)] p-3 text-[var(--t-text)]" onSubmit={async (e) => {
                    e.preventDefault(); if (!valido) return;
                    setOcupado(true); setError('');
                    if (conDatos(ficha)) {
                        try { await guardarFicha(token, ficha); } catch (err) { setOcupado(false); setError((err as Error).message); return; }
                    }
                    const { data, error } = await ecopil.rpc('encuentro_firmar_carta', {
                        p_token: token, p_version: carta.version, p_hash: carta.hash, p_nombre: f.nombre,
                        p_acepta_deslinde: f.deslinde, p_acepta_imagen: f.imagen, p_acepta_privacidad: f.privacidad,
                        p_menor: f.menor, p_tutor_nombre: f.menor ? f.tutor : null, p_tutor_parentesco: f.menor ? f.parentesco : null, p_firma_png: firma,
                    });
                    setOcupado(false);
                    if (error) { setError(error.message); return; }
                    setComprobante(data as Comprobante); onFirmada?.();
                }}>
                    <div ref={texto} className="max-h-72 overflow-y-auto whitespace-pre-line rounded-xl border-2 border-[var(--t-border)] bg-[var(--t-bg)] p-3 text-[13px] leading-relaxed"
                        onScroll={(e) => { const t = e.currentTarget; if (t.scrollTop + t.clientHeight >= t.scrollHeight - 12) setLeida(true); }}>
                        {preview}
                    </div>
                    {!leida && <p className="text-xs text-[var(--t-text-muted)]">Desliza el texto hasta el final para continuar.</p>}
                    <p className="text-[10px] text-[var(--t-text-faint)] break-all">Versión {carta.version} · SHA-256 {carta.hash}</p>

                    <label className="flex gap-2 text-sm"><input type="checkbox" className={caja} checked={f.menor} onChange={(e) => setF({ ...f, menor: e.target.checked })} />
                        Soy menor de 18 años (la carta la acepta mi madre, padre o tutor)</label>
                    {f.menor && (
                        <div className="space-y-2 rounded-xl bg-[var(--t-surface-2)] p-2">
                            <input className={inp} placeholder="Nombre completo de tu madre, padre o tutor" value={f.tutor} onChange={(e) => setF({ ...f, tutor: e.target.value })} />
                            <input className={inp} placeholder="Parentesco (madre, padre, tutor legal…)" value={f.parentesco} onChange={(e) => setF({ ...f, parentesco: e.target.value })} />
                            <p className="text-xs text-[var(--t-text-muted)]">Tu tutor debe ser quien marque las casillas y firme. El staff te pedirá también la carta firmada en papel por tu tutor.</p>
                        </div>
                    )}

                    <label className="block text-sm font-bold">Nombre completo de quien participa
                        <input className={inp} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} autoComplete="name" />
                    </label>

                    <label className={clsx('flex gap-2 text-sm', !leida && 'opacity-50')}><input type="checkbox" disabled={!leida} className={caja} checked={f.privacidad} onChange={(e) => setF({ ...f, privacidad: e.target.checked })} />
                        Leí el aviso de privacidad (punto 1).</label>
                    <label className={clsx('flex gap-2 text-sm', !leida && 'opacity-50')}><input type="checkbox" disabled={!leida} className={caja} checked={f.deslinde} onChange={(e) => setF({ ...f, deslinde: e.target.checked })} />
                        Acepto el reglamento, la confirmación de asistencia y aceptación de riesgos{f.menor ? ', las condiciones para menores' : ''} y la aceptación electrónica (puntos 2, 3, 5 y 6).</label>
                    <div className={clsx(!leida && 'opacity-50')}>
                        <p className="mb-1 text-sm font-bold">Uso de imagen y voz (punto 4, opcional)</p>
                        <div className="flex gap-2">
                            {([[true, 'Sí autorizo'], [false, 'No autorizo']] as const).map(([val, t]) => (
                                <button type="button" key={t} disabled={!leida} onClick={() => setF({ ...f, imagen: val })}
                                    className={clsx('flex-1 rounded-full border-2 py-2 text-sm font-bold', f.imagen === val ? 'sticker bg-ecopil-sun text-ink' : 'border-[var(--t-border)]')}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <details className="rounded-xl border-2 border-[var(--t-border)] p-2">
                        <summary className="cursor-pointer text-sm font-bold">Ficha médica <span className="font-normal text-[var(--t-text-muted)]">(opcional, recomendada)</span></summary>
                        <div className="mt-2"><CamposFicha v={ficha} set={setFicha} consiento={consiento} setConsiento={setConsiento} /></div>
                    </details>

                    <div>
                        <p className="mb-1 text-sm font-bold">Firma con tu dedo <span className="font-normal text-[var(--t-text-muted)]">(opcional; tu nombre escrito ya es tu firma)</span></p>
                        <PadFirma onCambio={setFirma} />
                    </div>

                    <p className="text-[11px] text-[var(--t-text-muted)]">Al aceptar guardamos el texto de la carta, la fecha y hora del servidor, tu dirección IP y tu navegador como evidencia. No se puede modificar después.</p>
                    {error && <p className="rounded-xl bg-status-red/10 p-2 text-sm font-bold text-status-red">{error}</p>}
                    <button disabled={!valido || ocupado} className="font-futura sticker w-full rounded-full bg-brand-green py-3 font-extrabold text-ink disabled:opacity-50">
                        {ocupado ? <Loader2 className="mx-auto animate-spin" /> : 'Acepto y firmo'}
                    </button>
                </form>
            )}
        </div>
    );
}
