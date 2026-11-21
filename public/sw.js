// Funciona sin señal: guarda las pantallas y archivos que ya se abrieron.
// Navegación: red primero, caché si no hay señal. Archivos estáticos: caché primero.
const CACHE = 'encuentro-v1';
const PRECACHE = ['/', '/programa', '/guia', '/mapa', '/mi-registro', '/registro', '/gestion'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    const url = new URL(req.url);
    if (req.method !== 'GET' || url.origin !== self.location.origin) return;
    if (req.mode === 'navigate') {
        e.respondWith(fetch(req).then((res) => {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
            return res;
        }).catch(() => caches.match(req).then((r) => r || caches.match('/programa'))));
        return;
    }
    if (url.pathname.startsWith('/_next/static') || /\.(webp|png|svg|jpg|woff2?)$/.test(url.pathname)) {
        e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
            return res;
        })));
    }
});
