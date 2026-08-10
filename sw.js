// ============================================================
// SISPE - Service Worker (PWA) v4.0
// OPTIMIZADO PARA CARGA RÁPIDA
// ============================================================

const CACHE_NAME = 'sispe-v4.0.1';
const OFFLINE_URL = 'offline.html';

// 🔥 SOLO RECURSOS ESENCIALES - CARGA MÁS RÁPIDA
const PRECACHE_ASSETS = [
  // HTML
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  
  // Favicons
  './favicon16.ico',
  './favicon32.ico',
  
  // Íconos
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  
  // Estilos
  './css/style.css',
  
  // 🔥 JAVASCRIPT - SOLO CRÍTICOS
  './js/config.js',
  './js/modules/db.js',
  './js/modules/modal.js',
  './js/modules/auth.js',
  './js/modules/notifications.js',
  './js/modules/help.js',
  './js/app.js',
  
  // 📦 RECURSOS GRÁFICOS (Cargados después)
  './js/modules/dashboard-graficos.js',
  './js/emojis.js',
  
  // 📦 LIBRERÍAS ESENCIALES
  './lib/sql-wasm.js',
  './lib/sql-wasm.wasm'
];

// ... (resto del sw.js sin cambios)
