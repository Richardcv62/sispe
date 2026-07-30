// ============================================================
// SISPE - Service Worker (PWA)
// RUTA: /sispe/sw.js
// ============================================================

const CACHE_NAME = 'sispe-v3.0.0';
const OFFLINE_URL = 'offline.html';

// ============================================================
// RECURSOS A CACHEAR
// ============================================================
const PRECACHE_ASSETS = [
  // Páginas principales
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  
  // Iconos
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  
  // Estilos
  './css/style.css',
  
  // JavaScript principal
  './js/app.js',
  './js/config.js',
  './js/emojis.js',
  
  // Módulos principales
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
  
  // Módulos de roles
  './js/modules/roles/egresado.js',
  './js/modules/roles/tutor.js',
  './js/modules/roles/coordinador.js',
  './js/modules/roles/directivo.js',
  
  // Librerías (CDN local)
  './lib/sql-wasm.js',
  './lib/sql-wasm.wasm',
  './lib/jspdf.umd.min.js',
  './lib/xlsx.full.min.js',
  './lib/email.min.js'
];

// ============================================================
// RECURSOS EXTERNOS (CDN) - Se cachean en tiempo de ejecución
// ============================================================
const EXTERNAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
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

  // ============================================================
  // ESTRATEGIA 1: Cache First - Recursos estáticos locales
  // ============================================================
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

  // ============================================================
  // ESTRATEGIA 2: Network First - HTML y API
  // ============================================================
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

  // ============================================================
  // ESTRATEGIA 3: Cache First - Recursos externos (CDN)
  // ============================================================
  if (isExternalAsset(request)) {
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
              // Si falla, devolver un error controlado
              return new Response('Recurso no disponible offline', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
    return;
  }

  // ============================================================
  // ESTRATEGIA 4: Network with cache fallback
  // ============================================================
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
  
  // Solo recursos locales (mismo origen)
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

function isExternalAsset(request) {
  var url = new URL(request.url);
  
  // Dominios externos permitidos
  var externalDomains = [
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net',
    'fonts.gstatic.com'
  ];

  return externalDomains.some(function(domain) {
    return url.hostname.includes(domain);
  });
}

// ============================================================
// EVENTO: NOTIFICACIONES PUSH
// ============================================================
self.addEventListener('push', function(event) {
  console.log('?? SW: Notificación push recibida');

  var data = { title: 'SISPE', body: 'Tienes una nueva notificación' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'SISPE', body: event.data.text() };
    }
  }

  var options = {
    body: data.body || 'Tienes una nueva notificación en SISPE',
    icon: './icon-192.png',
    badge: './icon-maskable-192.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      { action: 'open', title: '?? Abrir' },
      { action: 'dismiss', title: '? Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SISPE', options)
  );
});

// ============================================================
// EVENTO: CLIC EN NOTIFICACION
// ============================================================
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/sispe/');
        }
      })
  );
});

// ============================================================
// EVENTO: BACKGROUND SYNC
// ============================================================
self.addEventListener('sync', function(event) {
  if (event.tag === 'sispe-sync') {
    console.log('?? SW: Sincronización en segundo plano');
    event.waitUntil(
      // Aquí se implementaría la lógica de sincronización
      new Promise(function(resolve) {
        console.log('? SW: Sincronización completada');
        resolve();
      })
    );
  }
});

console.log('? Service Worker SISPE v3.0 cargado correctamente.');
console.log('?? Cache:', CACHE_NAME);
console.log('?? Recursos precargados:', PRECACHE_ASSETS.length);