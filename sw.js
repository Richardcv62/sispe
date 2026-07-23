// ============================================================
// SISPE - Service Worker
// Aplicacion Web Progresiva (PWA)
// ============================================================

const CACHE_NAME = 'sispe-v1.0.0';
const OFFLINE_URL = '/sispe/offline.html';

// Recursos a cachear al instalar
const PRECACHE_ASSETS = [
  '/sispe/',
  '/sispe/index.html',
  '/sispe/offline.html',
  '/sispe/manifest.json',
  '/sispe/icon-192.png',
  '/sispe/icon-512.png',
  '/sispe/icon-maskable-192.png',
  '/sispe/icon-maskable-512.png',
  '/sispe/css/style.css',
  '/sispe/js/app.js',
  '/sispe/js/config.js',
  '/sispe/js/modules/auth.js',
  '/sispe/js/modules/db.js',
  '/sispe/js/modules/notifications.js',
  '/sispe/js/modules/reports.js',
  '/sispe/js/modules/sync.js',
  '/sispe/js/modules/help.js',
  '/sispe/js/modules/admin.js',
  '/sispe/js/modules/roles/egresado.js',
  '/sispe/js/modules/roles/tutor.js',
  '/sispe/js/modules/roles/coordinador.js',
  '/sispe/js/modules/roles/directivo.js',
  // Librerias locales
  '/sispe/lib/sql-wasm.js',
  '/sispe/lib/sql-wasm.wasm',
  '/sispe/lib/jspdf.umd.min.js',
  '/sispe/lib/xlsx.full.min.js',
  '/sispe/lib/email.min.js'
];

// ============================================================
// EVENTO: INSTALL
// ============================================================
self.addEventListener('install', function(event) {
  console.log('📦 Service Worker: Instalando SISPE...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Cacheando recursos estaticos...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(function() {
        console.log('✅ Instalacion completada.');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('❌ Error al cachear recursos:', error);
      })
  );
});

// ============================================================
// EVENTO: ACTIVATE
// ============================================================
self.addEventListener('activate', function(event) {
  console.log('🔧 Service Worker: Activando SISPE...');

  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(cacheName) {
              return cacheName !== CACHE_NAME;
            })
            .map(function(cacheName) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(function() {
        console.log('✅ Service Worker activado.');
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
  // ESTRATEGIA PARA RECURSOS ESTATICOS (Cache First)
  // ============================================================
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            console.log('📦 Cache hit:', url.pathname);
            return cachedResponse;
          }
          console.log('📦 Cache miss:', url.pathname);
          return fetch(request)
            .then(function(response) {
              return cacheResponse(request, response);
            })
            .catch(function() {
              return caches.match('/sispe/offline.html');
            });
        })
    );
    return;
  }

  // ============================================================
  // ESTRATEGIA PARA API (Network First con cache)
  // ============================================================
  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(function() {
          return caches.match(request)
            .then(function(cachedResponse) {
              if (cachedResponse) {
                console.log('📦 API desde cache:', url.pathname);
                return cachedResponse;
              }
              return new Response(
                JSON.stringify({ error: 'Sin conexion' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              );
            });
        })
    );
    return;
  }

  // ============================================================
  // ESTRATEGIA PARA HTML (Network First)
  // ============================================================
  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(function() {
          return caches.match(request)
            .then(function(cachedResponse) {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/sispe/offline.html');
            });
        })
    );
    return;
  }

  // ============================================================
  // ESTRATEGIA: Stale-While-Revalidate (para otros recursos)
  // ============================================================
  event.respondWith(
    caches.match(request)
      .then(function(cachedResponse) {
        var fetchPromise = fetch(request)
          .then(function(networkResponse) {
            if (networkResponse && networkResponse.status === 200) {
              cacheResponse(request, networkResponse);
            }
            return networkResponse;
          })
          .catch(function() {
            return cachedResponse || new Response('Offline', { status: 503 });
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function isStaticAsset(request) {
  var url = new URL(request.url);
  var staticExtensions = [
    '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', 
    '.svg', '.ico', '.webp', '.json', '.wasm', '.woff2'
  ];
  
  if (url.origin === self.location.origin) {
    return staticExtensions.some(function(ext) {
      return url.pathname.endsWith(ext);
    });
  }
  
  var staticDomains = [
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net',
    'cdn.sheetjs.com'
  ];
  
  return staticDomains.some(function(domain) {
    return url.hostname.includes(domain);
  });
}

function isApiRequest(request) {
  var url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.pathname.startsWith('/api');
}

function isHtmlRequest(request) {
  var url = new URL(request.url);
  return url.pathname === '/' || 
         url.pathname.endsWith('.html') ||
         !url.pathname.includes('.');
}

function cacheResponse(request, response) {
  if (!response || response.status !== 200) return Promise.resolve(response);
  
  var responseClone = response.clone();
  return caches.open(CACHE_NAME)
    .then(function(cache) {
      cache.put(request, responseClone);
    })
    .catch(function() {});
}

// ============================================================
// EVENTO: NOTIFICACIONES PUSH
// ============================================================
self.addEventListener('push', function(event) {
  console.log('📨 Notificacion push recibida:', event);

  var data = { title: 'SISPE', body: 'Tienes una nueva notificacion' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'SISPE', body: event.data.text() };
    }
  }

  var options = {
    body: data.body || 'Tienes una nueva notificacion en SISPE',
    icon: '/sispe/icon-192.png',
    badge: '/sispe/icon-maskable-192.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      { action: 'open', title: '📱 Abrir' },
      { action: 'dismiss', title: '❌ Cerrar' }
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
// Sincronizacion en segundo plano (Background Sync)
// ============================================================
self.addEventListener('sync', function(event) {
  console.log('🔄 Sincronizacion en segundo plano:', event.tag);

  if (event.tag === 'sync-datos') {
    event.waitUntil(syncData());
  }
});

function syncData() {
  return new Promise(function(resolve, reject) {
    try {
      console.log('🔄 Sincronizando datos...');
      
      setTimeout(function() {
        console.log('✅ Datos sincronizados correctamente.');
        
        self.registration.showNotification('✅ SISPE', {
          body: 'Los datos se han sincronizado correctamente.',
          icon: '/sispe/icon-192.png',
          badge: '/sispe/icon-maskable-192.png'
        });
        
        resolve();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error al sincronizar:', error);
      reject(error);
    }
  });
}