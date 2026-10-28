import { createClient } from '@supabase/supabase-js'

// Base compartida de Ecopil (la misma de jornadas): ahí vive el registro del Encuentro
// (tablas encuentro_*). La base de `supabase.ts` sigue
// sirviendo las herramientas del staff.
// El registro no usa cuentas: todo pasa por funciones encuentro_* de la base.
const url = process.env.NEXT_PUBLIC_ECOPIL_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_ECOPIL_SUPABASE_ANON_KEY!

export const ecopil = createClient(url, key, { auth: { persistSession: false } })

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
}

// Enlace personal del agente; también se guarda en el celular para no perderlo.
export const TOKEN_KEY = 'encuentro_registro_token'

export interface Nodo { id: string; nombre: string }
