sispe/
¦
+-- ?? index.html                      # Página principal de la aplicación
+-- ?? offline.html                    # Página para cuando no hay conexión (PWA)
+-- ?? manifest.json                   # Configuración de la PWA
+-- ?? sw.js                           # Service Worker para caché y modo offline
+-- ?? .htaccess                       # Configuración para servidores Apache
+-- ?? .gitignore                      # Archivos ignorados por Git
+-- ?? README.md                       # Documentación general del proyecto
¦
+-- ??? icon-192.png                    # Ícono PWA (192x192)
+-- ??? icon-512.png                    # Ícono PWA (512x512)
+-- ??? icon-maskable-192.png           # Ícono PWA con máscara (192x192)
+-- ??? icon-maskable-512.png           # Ícono PWA con máscara (512x512)
+-- ??? favicon16.ico                   # Favicon de 16x16
+-- ??? favicon32.ico                   # Favicon de 32x32
¦
+-- ?? css/
¦   +-- ?? style.css                   # Estilos globales de la aplicación
¦
+-- ?? js/
¦   +-- ?? app.js                      # Controlador principal
¦   +-- ?? config.js                   # Configuración global
¦   +-- ?? emojis.js                   # Librería de emojis
¦   ¦
¦   +-- ?? modules/
¦       +-- ?? db.js                   # Capa de base de datos (SQLite + localStorage + IndexedDB)
¦       +-- ?? auth.js                 # Autenticación de usuarios
¦       +-- ?? modal.js                # Sistema de modales personalizados
¦       +-- ?? notifications.js        # Notificaciones (toasts, EmailJS)
¦       +-- ?? admin.js                # Módulo de Administración
¦       +-- ?? competencias.js         # Gestión de competencias profesionales
¦       +-- ?? cursos.js               # Gestión de cursos y capacitaciones
¦       +-- ?? eventos.js              # Gestión de eventos académicos
¦       +-- ?? proyecto.js             # Módulo del Proyecto Universidad-Sociedad
¦       +-- ?? investigadores.js       # Gestión de investigadores
¦       +-- ?? reports.js              # Generación de reportes (PDF, Excel, gráficos)
¦       +-- ?? sync.js                 # Sincronización offline/online
¦       +-- ?? help.js                 # Sistema de ayuda contextual
¦       +-- ?? register.js             # Registro de nuevos usuarios
¦       ¦
¦       +-- ?? roles/
¦           +-- ?? egresado.js         # Módulo del Egresado
¦           +-- ?? tutor.js            # Módulo del Tutor
¦           +-- ?? coordinador.js      # Módulo del Coordinador
¦           +-- ?? directivo.js        # Módulo del Directivo
¦
+-- ?? lib/
¦   +-- ?? sql-wasm.js                 # SQLite en WebAssembly
¦   +-- ?? sql-wasm.wasm               # Binario WebAssembly de SQLite
¦   +-- ?? jspdf.umd.min.js            # Librería para generar PDFs
¦   +-- ?? xlsx.full.min.js            # Librería para exportar/importar Excel
¦   +-- ?? email.min.js                # Librería EmailJS
¦
+-- ?? assets/
    +-- ?? screenshots/
        +-- ??? login.png               # Captura de pantalla del login (para PWA)
        +-- ??? dashboard.png           # Captura de pantalla del dashboard (para PWA)