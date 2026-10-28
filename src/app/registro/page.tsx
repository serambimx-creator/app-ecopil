'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, AlertTriangle, Camera, Phone, MapPin, HeartPulse, User, Check, Clock, XCircle, LogOut } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { ecopil, type Nodo, type RegistroEncuentro } from '@/lib/ecopil';
import Mixtli, { MixtliBubble } from '@/components/brand/Mixtli';

type Paso = 'cargando' | 'correo' | 'codigo' | 'formulario' | 'estado';

interface Form {
    nombre: string;
    telefono: string;
    nodo_id: string;
    ciudad: string;
    emergencia_nombre: string;
    emergencia_telefono: string;
}

const FORM_VACIO: Form = { nombre: '', telefono: '', nodo_id: '', ciudad: '', emergencia_nombre: '', emergencia_telefono: '' };

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
    const [paso, setPaso] = useState<Paso>('cargando');
    const [session, setSession] = useState<Session | null>(null);
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [form, setForm] = useState<Form>(FORM_VACIO);
    const [nodos, setNodos] = useState<Nodo[]>([]);
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoUrl, setFotoUrl] = useState<string>('');
    const [precargado, setPrecargado] = useState(false);
    const [registro, setRegistro] = useState<RegistroEncuentro | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ecopil.rpc('encuentro_nodos').then(({ data }) => setNodos((data as Nodo[]) ?? []));
        ecopil.auth.getSession().then(({ data }) => setSession(data.session));
        const { data: sub } = ecopil.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => sub.subscription.unsubscribe();
    }, []);

    // Con sesión: si ya hay registro se muestra su estado; si no, el formulario precargado.
    useEffect(() => {
        if (session === null) {
            setPaso((p) => (p === 'codigo' ? p : 'correo'));
            return;
        }
        (async () => {
            setPaso('cargando');
            const { data: reg } = await ecopil.from('encuentro_registros').select('*').eq('auth_user_id', session.user.id).maybeSingle();
            if (reg) {
                setRegistro(reg as RegistroEncuentro);
                setPaso('estado');
                return;
            }
            const { data: previo } = await ecopil.rpc('encuentro_perfil_previo');
            const p = Array.isArray(previo) ? previo[0] : null;
            if (p) {
                setForm((f) => ({ ...f, nombre: p.nombre ?? '', telefono: p.telefono ?? '', ciudad: p.ciudad ?? '', nodo_id: p.nodo_id ?? '' }));
                if (p.foto_url) setFotoUrl(p.foto_url);
                setPrecargado(true);
            }
            setPaso('formulario');
        })();
    }, [session]);

    const enviarCorreo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error } = await ecopil.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
            options: { emailRedirectTo: `${window.location.origin}/registro` },
        });
        setLoading(false);
        if (error) return setError(error.message.includes('rate') ? 'Espera un minuto antes de pedir otro código.' : error.message);
        setPaso('codigo');
    };

    const verificarCodigo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error } = await ecopil.auth.verifyOtp({ email: email.trim().toLowerCase(), token: codigo.trim(), type: 'email' });
        setLoading(false);
        if (error) setError('El código no es válido o ya venció. Pide uno nuevo.');
    };

    const elegirFoto = (file: File | undefined) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return setError('La foto debe pesar menos de 5 MB.');
        setError('');
        setFoto(file);
        setFotoUrl(URL.createObjectURL(file));
    };

    const enviarRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;
        if (!fotoUrl) return setError('Agrega una foto de perfil: el staff la usa para reconocerte.');
        if (!form.nodo_id) return setError('Elige tu nodo.');
        setLoading(true);
        setError('');
        try {
            let url = fotoUrl;
            if (foto) {
                const ext = foto.type.split('/')[1] ?? 'jpg';
                const path = `${session.user.id}/perfil-${Date.now()}.${ext}`;
                const { error: upErr } = await ecopil.storage.from('encuentro-fotos').upload(path, foto, { contentType: foto.type });
                if (upErr) throw upErr;
                url = ecopil.storage.from('encuentro-fotos').getPublicUrl(path).data.publicUrl;
            }
            const { data, error } = await ecopil.from('encuentro_registros').insert({
                auth_user_id: session.user.id,
                email: session.user.email,
                nombre: form.nombre.trim(),
                telefono: form.telefono.trim(),
                nodo_id: form.nodo_id,
                ciudad: form.ciudad.trim() || null,
                foto_url: url,
                emergencia_nombre: form.emergencia_nombre.trim(),
                emergencia_telefono: form.emergencia_telefono.trim(),
            }).select().single();
            if (error) throw error;
            setRegistro(data as RegistroEncuentro);
            setPaso('estado');
        } catch (err) {
            setError(`No se pudo guardar tu registro: ${err instanceof Error ? err.message : (err as { message?: string }).message ?? String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const salir = async () => {
        await ecopil.auth.signOut();
        setRegistro(null);
        setForm(FORM_VACIO);
        setFotoUrl('');
        setFoto(null);
        setCodigo('');
        setPaso('correo');
    };

    const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

    const nodoNombre = nodos.find((n) => n.id === registro?.nodo_id)?.nombre;

    return (
        <div className="theme-surface min-h-[80vh] flex flex-col items-center py-8 bg-[var(--t-bg)]">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Mixtli pose={paso === 'estado' ? 'sembrando' : 'lupa'} height={140} className="mx-auto" priority />
                    <h1 className="font-display text-3xl font-semibold text-[var(--t-text)] mt-2">
                        {paso === 'estado' ? 'Tu registro' : 'Regístrate al Encuentro'}
                    </h1>
                    <p className="mt-1 text-sm text-[var(--t-text-muted)]">Hidalgo · 17–21 dic 2026</p>
                </div>

                {error && (
                    <div className="bg-status-red/10 border border-status-red/20 p-3 rounded-xl flex items-center gap-3">
                        <AlertTriangle className="text-status-red shrink-0" size={18} />
                        <p className="text-status-red text-xs font-bold">{error}</p>
                    </div>
                )}

                {paso === 'cargando' && (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[var(--t-text-faint)]" /></div>
                )}

                {paso === 'correo' && (
                    <form onSubmit={enviarCorreo} className="sticker bg-[var(--t-surface)] p-6 rounded-[32px] space-y-5">
                        <p className="text-sm text-[var(--t-text-secondary)]">
                            Escribe tu correo y te mandamos un código para entrar. Si ya usas la app de jornadas, usa el mismo correo y tus datos aparecen solos.
                        </p>
                        <Campo label="Correo" icon={Mail}>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="tu@correo.com" autoComplete="email" />
                        </Campo>
                        <button type="submit" disabled={loading} className={btnCls}>
                            {loading ? <Loader2 className="animate-spin" /> : <>Enviarme el código <ArrowRight size={18} /></>}
                        </button>
                    </form>
                )}

                {paso === 'codigo' && (
                    <form onSubmit={verificarCodigo} className="sticker bg-[var(--t-surface)] p-6 rounded-[32px] space-y-5">
                        <p className="text-sm text-[var(--t-text-secondary)]">
                            Te mandamos un correo a <b>{email}</b>. Escribe el código o abre el enlace desde este mismo celular.
                        </p>
                        <Campo label="Código" icon={Check}>
                            <input inputMode="numeric" autoComplete="one-time-code" required value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 8))} className={`${inputCls} tracking-[0.4em] font-bold`} placeholder="123456" />
                        </Campo>
                        <button type="submit" disabled={loading || codigo.length < 6} className={btnCls}>
                            {loading ? <Loader2 className="animate-spin" /> : <>Entrar <ArrowRight size={18} /></>}
                        </button>
                        <button type="button" onClick={() => { setPaso('correo'); setCodigo(''); }} className="w-full text-xs font-bold text-[var(--t-text-faint)]">
                            Usar otro correo
                        </button>
                    </form>
                )}

                {paso === 'formulario' && (
                    <form onSubmit={enviarRegistro} className="sticker bg-[var(--t-surface)] p-6 rounded-[32px] space-y-5">
                        {precargado && (
                            <MixtliBubble className="text-xs">Te encontré en jornadas y llené lo que ya sabía. Revisa que esté bien.</MixtliBubble>
                        )}

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

                        <button type="submit" disabled={loading} className={btnCls}>
                            {loading ? <Loader2 className="animate-spin" /> : <>Enviar registro <ArrowRight size={18} /></>}
                        </button>
                        <p className="text-center text-xs text-[var(--t-text-faint)]">Entraste como {session?.user.email}</p>
                    </form>
                )}

                {paso === 'estado' && registro && (
                    <div className="sticker bg-[var(--t-surface)] p-6 rounded-[32px] space-y-5 text-center">
                        <img src={registro.foto_url} alt="" className="sticker w-24 h-24 rounded-full object-cover mx-auto" />
                        <div>
                            <p className="font-display text-2xl font-semibold text-[var(--t-text)]">{registro.nombre}</p>
                            <p className="text-sm text-[var(--t-text-muted)]">{nodoNombre ? `Nodo ${nodoNombre}` : ''}</p>
                        </div>
                        {registro.estado === 'pendiente' && (
                            <div className="rounded-2xl bg-ecopil-sun/25 p-4 flex items-start gap-3 text-left">
                                <Clock className="text-ecopil-orange shrink-0" size={20} />
                                <p className="text-sm text-[var(--t-text-secondary)]">Recibimos tu registro. El staff de Pachuca–Tulancingo lo revisa y aquí verás cuando quede aprobado.</p>
                            </div>
                        )}
                        {registro.estado === 'aprobado' && (
                            <div className="rounded-2xl bg-ecopil-leaf/40 p-4 flex items-start gap-3 text-left">
                                <Check className="text-brand-green shrink-0" size={20} />
                                <p className="text-sm text-[var(--t-text-secondary)]">
                                    ¡Estás dentro! {registro.grupo ? <>Vas en el <b>Grupo {registro.grupo}</b>.</> : 'Pronto te asignamos grupo.'}
                                </p>
                            </div>
                        )}
                        {registro.estado === 'rechazado' && (
                            <div className="rounded-2xl bg-status-red/10 p-4 flex items-start gap-3 text-left">
                                <XCircle className="text-status-red shrink-0" size={20} />
                                <p className="text-sm text-[var(--t-text-secondary)]">Tu registro no fue aprobado. Si crees que es un error, escribe al staff del Encuentro.</p>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Link href="/guia" className="font-futura sticker flex-1 bg-ecopil-sun text-ink font-extrabold py-3 rounded-full text-sm">Ver la guía</Link>
                            <button onClick={salir} className="flex-1 border-2 border-[var(--t-border)] rounded-full py-3 text-sm font-bold text-[var(--t-text-muted)] flex items-center justify-center gap-1.5">
                                <LogOut size={14} /> Salir
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
