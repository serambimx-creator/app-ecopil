'use client';

// Quién puede ver programa, guía y mapa: agentes con su lugar validado y gestores.
// La base también lo exige (encuentro_publico2); esto solo decide qué se muestra.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TOKEN_KEY } from '@/lib/ecopil';

export type Acceso = 'gestor' | 'aprobado' | 'pendiente' | 'rechazado' | null;
const CACHE = 'encuentro_acceso';

export function tokensAcceso() {
    let agente: string | null = null, gestor: string | null = null;
    try {
        agente = localStorage.getItem(TOKEN_KEY);
        const g = localStorage.getItem('encuentro_gestor_token');
        gestor = g ? (JSON.parse(g) as string) : null;
    } catch { /* sin storage */ }
    return { agente, gestor };
}

const Ctx = createContext<{ acceso: Acceso; listo: boolean; recargar: () => void }>({ acceso: null, listo: false, recargar: () => {} });

export function AccesoProvider({ children }: { children: ReactNode }) {
    const [acceso, setAcceso] = useState<Acceso>(null);
    const [listo, setListo] = useState(false);
    const pathname = usePathname();

    const recargar = useCallback(async () => {
        const { agente, gestor } = tokensAcceso();
        if (!agente && !gestor) { setAcceso(null); setListo(true); try { localStorage.removeItem(CACHE); } catch { /* */ } return; }
        const { data, error } = await supabase.rpc('encuentro_acceso', { p_token: agente, p_gestor: gestor });
        if (error) {
            // Sin señal: se usa el último estado conocido para que el programa siga funcionando offline.
            try { setAcceso((localStorage.getItem(CACHE) as Acceso) ?? null); } catch { /* */ }
        } else {
            setAcceso((data as Acceso) ?? null);
            try { if (data) localStorage.setItem(CACHE, data as string); else localStorage.removeItem(CACHE); } catch { /* */ }
        }
        setListo(true);
    }, []);

    // Se revisa al cambiar de página (p. ej. después de registrarse o entrar a /gestion).
    useEffect(() => { const t = setTimeout(recargar, 0); return () => clearTimeout(t); }, [recargar, pathname]);

    return <Ctx.Provider value={{ acceso, listo, recargar }}>{children}</Ctx.Provider>;
}

export const useAcceso = () => useContext(Ctx);
export const puedeVerTodo = (a: Acceso) => a === 'aprobado' || a === 'gestor';
