'use client';

import SoloValidados from '@/components/layout/SoloValidados';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const MainMap = dynamic(() => import('@/components/maps/MainMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-[var(--t-text-faint)]">Cargando mapa...</div>
});

function MapContent() {
    return (
        <div className="theme-surface h-[calc(100vh-150px)] md:h-[calc(100vh-110px)] w-full mt-3 rounded-3xl overflow-hidden sticker bg-[var(--t-surface)] relative">
            <MainMap />
        </div>
    );
}

function PageContenido() {
    return (
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[var(--t-text-faint)]">Cargando mapa...</div>}>
            <MapContent />
        </Suspense>
    );
}

export default function Page() {
    return <SoloValidados><PageContenido /></SoloValidados>;
}
