'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { tokensAcceso } from '@/context/AccesoContext';

export type TipoActividad = 'actividad' | 'comida' | 'traslado' | 'taller' | 'logistica' | 'preparacion';
export type EstadoActividad = 'pendiente' | 'en_proceso' | 'listo' | 'en_curso' | 'hecho' | 'cancelado';

export interface Actividad {
    id: string;
    dia: string;
    inicio: string | null;
    fin: string | null;
    titulo: string;
    tipo: TipoActividad;
    descripcion: string | null;
    sede: string | null;
    grupo: 'A' | 'B' | null;
    destino_url: string | null;
    estado: EstadoActividad;
}

export interface Responsable {
    id: string;
    actividad_id: string;
    persona: string;
    detalle: string | null;
    material: string | null;
    material_listo: boolean;
    equipo: string | null;
    orden: number;
}

export interface ActividadGestion extends Actividad {
    publica: boolean;
    notas: string | null;
    origen_url: string | null;
    pendientes: string | null;
    reconocimientos: string | null;
    presupuesto: number | null;
    prioridad: string | null;
    orden: number;
    updated_at: string;
    actualizado_por_nombre: string | null;
    responsables: Responsable[];
}

export interface Contacto {
    id: string;
    nombre: string;
    organizacion: string | null;
    rol: string | null;
    tipo: 'staff' | 'anfitrion' | 'aliado' | 'patrocinador' | 'proveedor' | 'emergencia' | 'otro';
    telefono: string | null;
    sede: string | null;
    notas: string | null;
}

export interface EntradaBitacora {
    id: string;
    actividad_id: string | null;
    tipo: 'nota' | 'observacion' | 'problema' | 'incidente' | 'accidente';
    gravedad: 'baja' | 'media' | 'alta' | null;
    texto: string;
    resuelto: boolean;
    autor: string | null;
    created_at: string;
}

export interface Aviso { id: string; texto: string; nivel: 'info' | 'importante' | 'urgente'; created_at: string; visible_hasta?: string | null }

export interface RegistroGestion {
    id: string; nombre: string; nodo: string; telefono: string; email: string; foto_url: string; ciudad: string | null;
    emergencia_nombre: string; emergencia_telefono: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado'; grupo: 'A' | 'B' | null; confirmado_en: string | null; created_at: string;
}

export interface Gestor { id: string; nombre: string; telefono: string | null; rol: 'gestor' | 'admin' }

export interface DatosPublicos { actividades: Actividad[]; avisos: Aviso[]; generado: string }

export interface Asistencia { actividad_id: string; registro_id: string }
export interface Indicador {
    id: string; actividad_id: string | null; dia: string | null; clave: string; valor: number;
    unidad: string | null; nota: string | null; autor: string | null; created_at: string;
}
export interface Evidencia { id: string; actividad_id: string | null; foto_url: string; nota: string | null; created_at: string }
export interface RespuestaEncuesta {
    calificacion: number | null; lo_mejor: string | null; mejorar: string | null; compromiso: string | null; volveria: boolean | null; created_at: string;
}

export interface DatosGestion {
    yo: Gestor;
    actividades: ActividadGestion[];
    contactos: Contacto[];
    bitacora: EntradaBitacora[];
    avisos: Aviso[];
    gestores: Gestor[];
    registros: RegistroGestion[];
    // Indicadores del reporte (opcionales hasta que se corra indicadores.sql)
    asistencias?: Asistencia[];
    indicadores?: Indicador[];
    evidencias?: Evidencia[];
    encuesta?: RespuestaEncuesta[];
    generado: string;
}

// Indicadores que se capturan por actividad. "otro" deja escribir el nombre.
export const INDICADORES: { clave: string; nombre: string; unidad: string }[] = [
    { clave: 'arboles_plantados', nombre: 'Árboles plantados', unidad: 'piezas' },
    { clave: 'magueyes_plantados', nombre: 'Magueyes plantados', unidad: 'piezas' },
    { clave: 'superficie_intervenida', nombre: 'Superficie intervenida', unidad: 'm²' },
    { clave: 'residuos_recolectados', nombre: 'Residuos recolectados', unidad: 'kg' },
    { clave: 'participantes_comunidad', nombre: 'Personas de la comunidad', unidad: 'personas' },
    { clave: 'comidas_servidas', nombre: 'Comidas servidas', unidad: 'raciones' },
    { clave: 'otro', nombre: 'Otro', unidad: '' },
];
// Los "otros" se guardan como clave 'otro:<nombre>'
export const nombreIndicador = (clave: string) =>
    clave.startsWith('otro:') ? clave.slice(5) : (INDICADORES.find((x) => x.clave === clave)?.nombre ?? clave);

export const SEDES: Record<string, string> = {
    hotel: 'Hotel City Express Tula',
    tula: 'Parque Nacional Tula',
    xoxafi: 'Grutas Xoxafi',
    tezontepec: 'Villa de Tezontepec',
    invictus: 'Invictus · El Huixmi',
    acaxochitlan: 'Acaxochitlán · Cascadas Dos Mundos',
    ajolotequio: 'Los Romeros, Tulancingo · Ajolotequio',
};

export const DIAS = ['2026-12-17', '2026-12-18', '2026-12-19', '2026-12-20', '2026-12-21'];
export const DIA_COLOR: Record<string, string> = {
    '2026-12-17': 'bg-ecopil-leaf',
    '2026-12-18': 'bg-brand-green',
    '2026-12-19': 'bg-ecopil-sun',
    '2026-12-20': 'bg-ecopil-orange',
    '2026-12-21': 'bg-ecopil-red',
};

export const hora = (t: string | null) => (t ? t.slice(0, 5) : '');
export const rango = (a: { inicio: string | null; fin: string | null }) =>
    a.inicio ? (a.fin ? `${hora(a.inicio)}–${hora(a.fin)}` : hora(a.inicio)) : 'Por definir';
export const diaCorto = (d: string) => `${Number(d.slice(8, 10))} dic`;

// Hora actual del Encuentro (Hidalgo, UTC-6) como fecha y HH:MM.
export function ahoraHidalgo(now = new Date()) {
    const local = new Date(now.getTime() - 6 * 3600 * 1000);
    const iso = local.toISOString();
    return { dia: iso.slice(0, 10), hm: iso.slice(11, 16) };
}

function guardar<T>(k: string, v: T) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin storage */ } }
function leer<T>(k: string): T | null { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; } }

// Programa público. Se guarda en el celular para que funcione sin señal en las sedes.
export function usePublico() {
    const [datos, setDatos] = useState<DatosPublicos | null>(null);
    const [sinConexion, setSinConexion] = useState(false);

    const cargar = useCallback(async () => {
        const { agente, gestor } = tokensAcceso();
        const { data, error } = await supabase.rpc('encuentro_publico2', { p_token: agente, p_gestor: gestor });
        if (error) { setSinConexion(true); return; }
        if (!data) { setDatos(null); try { localStorage.removeItem('encuentro_publico'); } catch { /* */ } return; } // sin acceso
        setSinConexion(false);
        setDatos(data as DatosPublicos);
        guardar('encuentro_publico', data);
    }, []);

    useEffect(() => {
        const c = leer<DatosPublicos>('encuentro_publico');
        if (c) setDatos(c);
        cargar();
        const t = setInterval(cargar, 5 * 60 * 1000);
        return () => clearInterval(t);
    }, [cargar]);

    return { datos, sinConexion, recargar: cargar };
}

const TOKEN_GESTOR = 'encuentro_gestor_token';

export function useGestion() {
    const [token, setToken] = useState<string | null>(null);
    const [datos, setDatos] = useState<DatosGestion | null>(null);
    const [listo, setListo] = useState(false);
    const [sinConexion, setSinConexion] = useState(false);

    const cargar = useCallback(async (t: string) => {
        const { data, error } = await supabase.rpc('gestor_datos', { p_token: t });
        if (error) { setSinConexion(true); return; }
        setSinConexion(false);
        if (!data) { setToken(null); setDatos(null); try { localStorage.removeItem(TOKEN_GESTOR); } catch { /* */ } return; }
        setDatos(data as DatosGestion);
        guardar('encuentro_gestion', data);
    }, []);

    useEffect(() => {
        const t = leer<string>(TOKEN_GESTOR);
        if (t) {
            setToken(t);
            const c = leer<DatosGestion>('encuentro_gestion');
            if (c) setDatos(c);
            cargar(t).finally(() => setListo(true));
        } else setListo(true);
    }, [cargar]);

    useEffect(() => {
        if (!token) return;
        const i = setInterval(() => cargar(token), 60 * 1000);
        return () => clearInterval(i);
    }, [token, cargar]);

    const entrar = async (nombre: string, pin: string) => {
        const { data, error } = await supabase.rpc('gestor_entrar', { p_nombre: nombre, p_pin: pin });
        if (error) return error.message;
        if (data?.error) return data.error as string;
        guardar(TOKEN_GESTOR, data.token);
        setToken(data.token);
        await cargar(data.token);
        return null;
    };

    const salir = async () => {
        if (token) await supabase.rpc('gestor_salir', { p_token: token });
        try { localStorage.removeItem(TOKEN_GESTOR); localStorage.removeItem('encuentro_gestion'); } catch { /* */ }
        setToken(null);
        setDatos(null);
    };

    const guardarFila = async (tabla: string, fila: Record<string, unknown>) => {
        const { data, error } = await supabase.rpc('gestor_guardar', { p_token: token, p_tabla: tabla, p_datos: fila });
        if (error) throw new Error(error.message);
        if (token) await cargar(token);
        return data;
    };

    const borrarFila = async (tabla: string, id: string) => {
        const { error } = await supabase.rpc('gestor_borrar', { p_token: token, p_tabla: tabla, p_id: id });
        if (error) throw new Error(error.message);
        if (token) await cargar(token);
    };

    const rpc = async (fn: string, args: Record<string, unknown>) => {
        const { data, error } = await supabase.rpc(fn, { p_token: token, ...args });
        if (error) throw new Error(error.message);
        if (token) await cargar(token);
        return data;
    };

    return { token, datos, listo, sinConexion, entrar, salir, guardarFila, borrarFila, rpc, recargar: () => token && cargar(token) };
}
