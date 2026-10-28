import { createClient } from '@supabase/supabase-js'

// Base compartida de Ecopil (la misma de jornadas): ahí viven las cuentas de los agentes
// y el registro del Encuentro (tablas encuentro_*). La base de `supabase.ts` sigue
// sirviendo las herramientas del staff.
const url = process.env.NEXT_PUBLIC_ECOPIL_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_ECOPIL_SUPABASE_ANON_KEY!

export const ecopil = createClient(url, key, {
    auth: { storageKey: 'ecopil-encuentro-auth', persistSession: true },
})

export type EstadoRegistro = 'pendiente' | 'aprobado' | 'rechazado'

export interface RegistroEncuentro {
    id: string
    auth_user_id: string
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

export interface Nodo { id: string; nombre: string }
