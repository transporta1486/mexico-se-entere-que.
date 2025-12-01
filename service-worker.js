// Nombre de la caché para esta versión
const CACHE_NAME = 'mx-se-entere-v1';

// Lista de archivos que queremos precargar
const urlsToCache = [
  '/', // El index.html si acceden a la raíz
  '/index.html',
  '/manifest.json',
  '/news_upload_form_spark.html', // Añadimos el formulario de carga
  // Las URLs de las imágenes placeholder también se guardarán en caché automáticamente
  'https://cdn.tailwindcss.com' 
];

// Evento: Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando y precargando recursos...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Fallo al precargar la caché:', error);
      })
  );
});

// Evento: Activación del Service Worker (para limpiar cachés viejas)
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado. Limpiando cachés antiguas.');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento: Fetch (Interceptor de red)
self.addEventListener('fetch', (event) => {
  // Intentar buscar el recurso en la caché
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si el recurso está en caché, lo devuelve
        if (response) {
          return response;
        }
        // Si no está en caché, va a la red
        return fetch(event.request).catch(() => {
          // Si falla la red (modo offline), devolver un fallback si fuera necesario
          // Dado que el index está precargado, se espera que funcione si está offline.
        });
      })
  );
});