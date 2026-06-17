'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const MainMap = dynamic(() => import('@/components/maps/MainMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-white/50">Cargando mapa...</div>
});

function MapContent() {
    const searchParams = useSearchParams();
    const defaultMode = searchParams.get('mode') === 'recorrido' ? 'recorrido' as const : undefined;

    return (
        <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] w-full rounded-b-3xl overflow-hidden glass-card relative -mt-2">
            <MainMap defaultMode={defaultMode} />
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/50">Cargando mapa...</div>}>
            <MapContent />
        </Suspense>
    );
}
