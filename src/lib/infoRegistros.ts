'use client';

// Carta, ficha médica y actividades extra por asistente, para el panel de gestión.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

export type InfoRegistro = {
    folio: number | null; es_menor: boolean | null; acepta_imagen: boolean | null;
    ficha: Record<string, string | null> | null;
    extras: { temazcal: boolean; acampada: boolean; pajareada: boolean } | null;
};

export function useInfoRegistros(token: string, clave: unknown) {
    const [info, setInfo] = useState<Record<string, InfoRegistro> | null>(null);
    const cargar = useCallback(() => supabase.rpc('gestor_cartas', { p_token: token }).then(({ data, error }) => {
        if (error) return setInfo(null);
        setInfo(Object.fromEntries(((data as (InfoRegistro & { registro_id: string })[]) ?? []).map((c) => [c.registro_id, c])));
    }), [token]);
    useEffect(() => { cargar(); }, [cargar, clave]);
    return { info, recargar: cargar };
}
