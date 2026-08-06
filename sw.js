// ============================================================
// SISPE - Service Worker (PWA)
// RUTA: /sispe/sw.js
// ============================================================

const CACHE_NAME = 'sispe-v3.0.0';
const OFFLINE_URL = 'offline.html';

// ============================================================
// RECURSOS A CACHEAR - SOLO ARCHIVOS ESENCIALES
// ============================================================
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  
  // Favicons
  './favicon16.ico',
  './favicon32.ico',
  
  // Íconos PWA
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  
  // Estilos
  './css/style.css',
  
  // JavaScript Principal
  './js/app.js',
  './js/config.js',
  './js/emojis.js',
  
  // Módulos
  './js/modules/db.js',
  './js/modules/modal.js',
  './js/modules/auth.js',
  './js/modules/notifications.js',
  './js/modules/reports.js',
  './js/modules/sync.js',
  './js/modules/help.js',
  './js/modules/admin.js',
  './js/modules/register.js',
  './js/modules/competencias.js',
  './js/modules/cursos.js',
  './js/modules/eventos.js',
  './js/modules/proyecto.js',
  './js/modules/investigadores.js',
  
  // Módulos de Roles
  './js/modules/roles/egresado.js',
  './js/modules/roles/tutor.js',
  './js/modules/roles/coordinador.js',
  './js/modules/roles/directivo.js',
  
  // Librerías
  './lib/sql-wasm.js',
  './lib/sql-wasm.wasm',
  './lib/jspdf.umd.min.js',
  './lib/xlsx.full.min.js',
  './lib/email.min.js'
];

// ============================================================
// EVENTO: INSTALL
// ============================================================
self.addEventListener('install', function(event) {
  console.log('?? SW: Instalando SISPE v3.0...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('?? SW: Cacheando recursos estáticos...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(function() {
        console.log('? SW: Instalación completada.');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('? SW: Error al cachear recursos:', error);
      })
  );
});

// ============================================================
// EVENTO: ACTIVATE
// ============================================================
self.addEventListener('activate', function(event) {
  console.log('?? SW: Activando SISPE v3.0...');

  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(cacheName) {
              return cacheName !== CACHE_NAME;
            })
            .map(function(cacheName) {
              console.log('??? SW: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(function() {
        console.log('? SW: Activado correctamente.');
        return self.clients.claim();
      })
  );
});

// ============================================================
// EVENTO: FETCH
// ============================================================
self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  // ESTRATEGIA 1: Cache First - Recursos estáticos locales
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then(function(response) {
              if (response && response.status === 200) {
                var responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(function() {
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // ESTRATEGIA 2: Network First - HTML y API
  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          if (response && response.status === 200) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(function() {
          return caches.match(request)
            .then(function(cachedResponse) {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // ESTRATEGIA 3: Network with cache fallback
  event.respondWith(
    fetch(request)
      .then(function(response) {
        if (response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(function() {
        return caches.match(request)
          .then(function(cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response('Recurso no disponible offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function isStaticAsset(request) {
  var url = new URL(request.url);
  
  if (url.origin !== self.location.origin) {
    return false;
  }
  
  var staticExtensions = [
    '.css', '.js', '.png', '.jpg', '.jpeg', '.gif',
    '.svg', '.ico', '.webp', '.json', '.wasm', '.woff2'
  ];

  return staticExtensions.some(function(ext) {
    return url.pathname.endsWith(ext);
  });
}

function isHtmlRequest(request) {
  var url = new URL(request.url);
  return url.pathname === '/' ||
         url.pathname.endsWith('.html') ||
         !url.pathname.includes('.');
}

console.log('?? Service Worker SISPE v3.0 cargado correctamente.');
console.log('?? Cache:', CACHE_NAME);
console.log('?? Recursos precargados:', PRECACHE_ASSETS.length);