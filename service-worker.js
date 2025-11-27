// Nombre de la caché (incrementa la versión si cambias los archivos)
const CACHE_NAME = 'noticias-pwa-v1.0.1';

// Lista de archivos que se deben precargar y guardar en caché
const urlsToCache = [
  '/', // Esto cachea el index.html
  'index.html',
  'style.css', // Asume que tienes este nombre para el CSS principal
  'script.js',
  // Archivos de manifiesto e iconos (asegúrate de que existan)
  'manifest.json',
  '/images/icons/icon-512x512.png', // Reemplaza con tus rutas reales de iconos
  // Agrega otros recursos críticos como imágenes, fuentes o otros JS si los tienes.
];

// 1. EVENTO DE INSTALACIÓN: Al instalar la PWA, cachea todos los archivos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos estáticos.');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. EVENTO DE FETCH: Intercepta peticiones para servir archivos desde la caché
self.addEventListener('fetch', event => {
  // Evita interceptar peticiones de Firebase/Firestore para que los datos sean siempre frescos
  if (event.request.url.includes('googleapis.com') || event.request.url.includes('gstatic.com') || event.request.url.includes('firebasestorage.googleapis.com')) {
    return fetch(event.request);
  }

  // Estrategia Cache-first para recursos estáticos:
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el archivo está en caché, lo devuelve
        if (response) {
          return response;
        }
        // Si no está, lo solicita a la red
        return fetch(event.request);
      })
  );
});

// 3. EVENTO DE ACTIVACIÓN: Limpia las cachés antiguas para ahorrar espacio
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});