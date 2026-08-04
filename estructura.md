sispe/
¦
+-- ?? index.html                    # Página principal
+-- ?? manifest.json                 # Configuración PWA
+-- ?? sw.js                         # Service Worker
+-- ?? offline.html                  # Página sin conexión
+-- ?? .gitignore                    # Archivos ignorados por Git
+-- ?? README.md                     # Documentación
¦
+-- ??? icon-192.png                  # Icono PWA (192x192)
+-- ??? icon-512.png                  # Icono PWA (512x512)
+-- ??? icon-maskable-192.png         # Icono PWA maskable (192x192)
+-- ??? icon-maskable-512.png         # Icono PWA maskable (512x512)
¦
+-- ?? css/
¦   +-- ?? style.css                 # Estilos globales
¦
+-- ?? js/
¦   +-- ?? app.js                    # Controlador principal
¦   +-- ?? config.js                 # Configuración global
¦   +-- ?? emojis.js                 # Librería de emojis
¦   ¦
¦   +-- ?? modules/
¦       +-- ?? db.js                 # Base de datos (SQLite + localStorage)
¦       +-- ?? modal.js              # Modales personalizados
¦       +-- ?? auth.js               # Autenticación
¦       +-- ?? admin.js              # Administración
¦       +-- ?? notifications.js      # Notificaciones
¦       +-- ?? reports.js            # Reportes
¦       +-- ?? sync.js               # Sincronización
¦       +-- ?? register.js           # Registro de usuarios
¦       +-- ?? help.js               # Ayuda
¦       +-- ?? competencias.js       # Gestión de competencias
¦       +-- ?? cursos.js             # Gestión de cursos
¦       +-- ?? eventos.js            # Gestión de eventos
¦       +-- ?? proyecto.js           # Proyecto Universidad-Sociedad
¦       +-- ?? investigadores.js     # Gestión de investigadores
¦       ¦
¦       +-- ?? roles/
¦           +-- ?? egresado.js       # Módulo del egresado
¦           +-- ?? tutor.js          # Módulo del tutor
¦           +-- ?? coordinador.js    # Módulo del coordinador
¦           +-- ?? directivo.js      # Módulo del directivo
¦
+-- ?? lib/
¦   +-- ?? sql-wasm.js               # SQLite WebAssembly
¦   +-- ?? sql-wasm.wasm             # Binario SQLite
¦   +-- ?? jspdf.umd.min.js          # Generación de PDF
¦   +-- ?? xlsx.full.min.js          # Exportación a Excel
¦   +-- ?? email.min.js              # EmailJS
¦
+-- ?? assets/
¦   +-- ?? screenshots/              # Capturas para PWA
¦       +-- ??? login.png
¦       +-- ??? dashboard.png
¦
+-- ?? herramientas/                 # (Opcional - para desarrolladores)
    +-- ?? crearBaseDatosSQLite.html
    +-- ?? gestor-multi-rol.html
    +-- ?? generarDatosPrueba.html