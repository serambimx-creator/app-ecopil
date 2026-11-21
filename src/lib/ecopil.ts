// Registro del Encuentro (tablas encuentro_*) en la base propia del Encuentro, la misma de `supabase.ts`.
// No usa cuentas: todo pasa por funciones encuentro_* de la base.
export { supabase as ecopil } from './supabase'

export type EstadoRegistro = 'pendiente' | 'aprobado' | 'rechazado'

export interface RegistroEncuentro {
    id: string
    agente_catalogo_id: string | null
    nombre: string
    email: string
    telefono: string
    nodo_id: string
    ciudad: string | null
    foto_url: string
    emergencia_nombre: string
    emergencia_telefono: string
    estado: EstadoRegistro
    grupo: 'A' | 'B' | null
    created_at: string
}

export interface MiRegistro {
    nombre: string
    email: string
    nodo: string
    ciudad: string | null
    foto_url: string
    estado: EstadoRegistro
    grupo: 'A' | 'B' | null
    confirmado_en?: string | null
}

// Enlace personal del agente; también se guarda en el celular para no perderlo.
export const TOKEN_KEY = 'encuentro_registro_token'

export interface Nodo { id: string; nombre: string }
