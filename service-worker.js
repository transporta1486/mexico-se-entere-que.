// service-worker.js

// Version de cache
const CACHE_NAME = 'noticias-v1'; 

// Evento 1: INSTALACIÓN
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando.');
    // Forzar activación inmediata para que el nuevo SW tome control.
    self.skipWaiting(); 
});

// Evento 2: ACTIVACIÓN
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando.');
    // Asegurar que todas las pestañas abiertas usen el Service Worker actual.
    event.waitUntil(self.clients.claim());
});

// Evento 3: FETCH (para peticiones de red)
self.addEventListener('fetch', (event) => {
    // Por ahora, simplemente dejamos que todo pase por la red.
    // Esto es temporal hasta que implementes la estrategia de caché.
    event.respondWith(fetch(event.request));
});
