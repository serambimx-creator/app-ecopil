import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Encuentro de Nodos 2026 · Ecopil',
        short_name: 'Encuentro',
        description: 'Programa, sedes y registro del 7º Encuentro Nacional Ecopil, Hidalgo 17–21 dic.',
        start_url: '/programa',
        display: 'standalone',
        background_color: '#FBF6EA',
        theme_color: '#6BB32E',
        icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
    };
}
