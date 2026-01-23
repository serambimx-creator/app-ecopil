'use client';

import dynamic from 'next/dynamic';

const MainMap = dynamic(() => import('@/components/maps/MainMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-white/50">Cargando mapa...</div>
});

export default function Page() {
    return (
        // Height calculation: Screen - Header (approx 64px) - BottomNav (approx 80px mobile)
        // Adjusting specifically to make it feel "full screen" within the layout
        <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] w-full rounded-b-3xl overflow-hidden glass-card relative -mt-2">
            <MainMap />
        </div>
    );
}
