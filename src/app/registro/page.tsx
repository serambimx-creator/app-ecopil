'use client';

import { comprimirFoto, FOTO_PERFIL } from '@/lib/comprimir';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Loader2, AlertTriangle, Camera, Phone, MapPin, HeartPulse, User } from 'lucide-react';
import { ecopil, TOKEN_KEY, type Nodo } from '@/lib/ecopil';
import Mixtli from '@/components/brand/Mixtli';
import { SelectorExtras, EXTRAS_VACIO, extrasCompletos, guardarExtras, type Extras } from '@/components/encuentro/Extras';

interface Form {
    email: string;
    nombre: string;
    telefono: string;
    nodo_id: string;
    ciudad: string;
    emergencia_nombre: string;
    emergencia_telefono: string;
}


const inputCls = "w-full rounded-2xl py-3.5 pl-11 pr-4 bg-[var(--t-surface-2)] border-2 border-[var(--t-border)] text-[var(--t-text)] placeholder-[var(--t-text-faint)] focus:outline-none focus:border-brand-green transition-colors";
const labelCls = "block text-xs font-extrabold uppercase tracking-wider mb-2 pl-4 text-[var(--t-text-faint)]";
const btnCls = "font-futura sticker w-full bg-brand-green text-ink font-extrabold py-4 rounded-full flex items-center justify-center gap-2 transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";

function Campo({ label, icon: Icon, children }: { label: string; icon: typeof Mail; children: React.ReactNode }) {
    return (
        <div>
            <label className={labelCls}>{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--t-text-faint)] pointer-events-none" size={18} />
                {children}
            </div>
        </div>
    );
}

export default function RegistroPage() {
    const router = useRouter();
    const [form, setForm] = useState<Form>({ email: '', nombre: '', telefono: '', nodo_id: '', ciudad: '', emergencia_nombre: '', emergencia_telefono: '' });
    const [nodos, setNodos] = useState<Nodo[]>([]);
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [tokenGuardado, setTokenGuardado] = useState<string | null>(null);
    const [extras, setExtras] = useState<Extras>(EXTRAS_VACIO);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ecopil.rpc('encuentro_nodos').then(({ data }) => setNodos((data as Nodo[]) ?? []));
        try { setTokenGuardado(localStorage.getItem(TOKEN_KEY)); } catch { /* sin storage */ }
    }, []);

    const elegirFoto = async (original: File | undefined) => {
        if (!original) return;
        const file = await comprimirFoto(original, FOTO_PERFIL); // ~512 px, unos 50 KB
        if (file.size > 5 * 1024 * 1024) return setError('La foto debe pesar menos de 5 MB.');
        setError('');
        setFoto(file);
        setFotoUrl(URL.createObjectURL(file));
    };

    const enviar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!foto) return setError('Agrega una foto de perfil: el staff la usa para reconocerte.');
        if (!form.nodo_id) return setError('Elige tu nodo.');
        if (!extrasCompletos(extras)) return setError('Responde sí o no a cada actividad extra.');
        setLoading(true);
        setError('');
        try {
            const ext = foto.type.split('/')[1] ?? 'jpg';
            const path = `registros/${crypto.randomUUID()}.${ext}`;
            const { error: upErr } = await ecopil.storage.from('encuentro-fotos').upload(path, foto, { contentType: foto.type });
            if (upErr) throw upErr;
            const url = ecopil.storage.from('encuentro-fotos').getPublicUrl(path).data.publicUrl;
            const { data: token, error } = await ecopil.rpc('encuentro_registrar', {
                p_nombre: form.nombre,
                p_email: form.email,
                p_telefono: form.telefono,
                p_nodo_id: form.nodo_id,
                p_ciudad: form.ciudad,
                p_foto_url: url,
                p_emergencia_nombre: form.emergencia_nombre,
                p_emergencia_telefono: form.emergencia_telefono,
            });
            if (error) throw error;
            try { localStorage.setItem(TOKEN_KEY, token as string); } catch { /* sin storage */ }
            await guardarExtras(token as string, extras); // si falla, Mi registro vuelve a pedirlo
            router.push(`/mi-registro?t=${token}&nuevo=1`);
        } catch (err) {
            setError(`No se pudo guardar tu registro: ${err instanceof Error ? err.message : (err as { message?: string }).message ?? String(err)}`);
            setLoading(false);
        }
    };

    const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

    return (
        <div className="theme-surface min-h-[80vh] flex flex-col items-center py-8 bg-[var(--t-bg)]">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Mixtli pose="lupa" height={140} className="mx-auto" priority />
                    <h1 className="font-display text-3xl font-semibold text-[var(--t-text)] mt-2">Regístrate al Encuentro</h1>
                    <p className="mt-1 text-sm text-[var(--t-text-muted)]">Hidalgo · 17–21 dic 2026</p>
                </div>

                {tokenGuardado && (
                    <Link href={`/mi-registro?t=${tokenGuardado}`} className="sticker bg-ecopil-leaf text-ink rounded-2xl p-4 flex items-center justify-between font-bold text-sm">
                        Ya te registraste desde este celular. Ver mi registro <ArrowRight size={16} />
                    </Link>
                )}

                {error && (
                    <div className="bg-status-red/10 border border-status-red/20 p-3 rounded-xl flex items-center gap-3">
                        <AlertTriangle className="text-status-red shrink-0" size={18} />
                        <p className="text-status-red text-xs font-bold">{error}</p>
                    </div>
                )}

                <form onSubmit={enviar} className="sticker bg-[var(--t-surface)] p-6 rounded-[32px] space-y-5">
                    <div className="flex flex-col items-center gap-2">
                        <button type="button" onClick={() => fileRef.current?.click()} className="sticker relative w-28 h-28 rounded-full bg-[var(--t-surface-2)] overflow-hidden flex items-center justify-center">
                            {fotoUrl
                                ? <img src={fotoUrl} alt="Tu foto" className="w-full h-full object-cover" />
                                : <Camera className="text-[var(--t-text-faint)]" size={30} />}
                        </button>
                        <span className="text-xs font-bold text-[var(--t-text-muted)]">{fotoUrl ? 'Cambiar foto' : 'Agrega tu foto de perfil'}</span>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => elegirFoto(e.target.files?.[0])} />
                    </div>

                    <Campo label="Nombre completo" icon={User}>
                        <input required value={form.nombre} onChange={set('nombre')} className={inputCls} autoComplete="name" />
                    </Campo>
                    <Campo label="Correo" icon={Mail}>
                        <input required type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="tu@correo.com" autoComplete="email" />
                    </Campo>
                    <Campo label="Celular (WhatsApp)" icon={Phone}>
                        <input required type="tel" value={form.telefono} onChange={set('telefono')} className={inputCls} placeholder="10 dígitos" autoComplete="tel" />
                    </Campo>
                    <Campo label="Nodo" icon={MapPin}>
                        <select required value={form.nodo_id} onChange={set('nodo_id')} className={`${inputCls} appearance-none`}>
                            <option value="">Elige tu nodo</option>
                            {nodos.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                        </select>
                    </Campo>
                    <Campo label="Ciudad" icon={MapPin}>
                        <input value={form.ciudad} onChange={set('ciudad')} className={inputCls} placeholder="Opcional" />
                    </Campo>

                    <div className="pt-2 border-t-2 border-dashed border-[var(--t-border)] space-y-5">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--t-text-faint)] pt-3">Contacto de emergencia</p>
                        <Campo label="Nombre" icon={HeartPulse}>
                            <input required value={form.emergencia_nombre} onChange={set('emergencia_nombre')} className={inputCls} />
                        </Campo>
                        <Campo label="Teléfono" icon={Phone}>
                            <input required type="tel" value={form.emergencia_telefono} onChange={set('emergencia_telefono')} className={inputCls} />
                        </Campo>
                    </div>

                    <div className="pt-2 border-t-2 border-dashed border-[var(--t-border)] space-y-3">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--t-text-faint)] pt-3">Actividades extra (opcionales)</p>
                        <p className="text-xs text-[var(--t-text-muted)]">Confirma si irás. Puedes cambiarlo después en Mi registro.</p>
                        <SelectorExtras v={extras} set={setExtras} />
                    </div>

                    <button type="submit" disabled={loading} className={btnCls}>
                        {loading ? <Loader2 className="animate-spin" /> : <>Enviar registro <ArrowRight size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
