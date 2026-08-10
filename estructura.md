
## ?? Estructura del Proyecto (v4.0)

sispe/
¦
+-- ?? index.html # Página principal (SPA)
+-- ?? offline.html # Página offline (PWA)
+-- ?? manifest.json # Configuración PWA
+-- ?? sw.js # Service Worker v4.0
+-- ?? .htaccess # Configuración Apache
+-- ?? .gitignore # Archivos ignorados por Git
+-- ?? README.md # Documentación general
¦
+-- ??? icon-192.png # Ícono PWA 192x192
+-- ??? icon-512.png # Ícono PWA 512x512
+-- ??? icon-maskable-192.png # Ícono maskable 192x192
+-- ??? icon-maskable-512.png # Ícono maskable 512x512
+-- ??? favicon16.ico # Favicon 16x16
+-- ??? favicon32.ico # Favicon 32x32
¦
+-- ?? css/
¦ +-- ?? style.css # Estilos globales
¦
+-- ?? js/
¦ +-- ?? app.js # Controlador principal
¦ +-- ?? config.js # Configuración global
¦ +-- ?? emojis.js # Librería de emojis
¦ ¦
¦ +-- ?? modules/
¦ +-- ?? db.js # Capa de base de datos
¦ +-- ?? auth.js # Autenticación
¦ +-- ?? modal.js # Modales personalizados
¦ +-- ?? notifications.js # Notificaciones
¦ +-- ?? help.js # Ayuda
¦ +-- ?? register.js # Registro de usuarios
¦ +-- ?? sync.js # Sincronización offline/online
¦ +-- ?? reports.js # Reportes
¦ +-- ?? loader.js # Gestor de lazy loading
¦ +-- ?? paginacion.js # Paginación
¦ +-- ?? dashboard-graficos.js # Gráficos en tiempo real
¦ +-- ?? chat.js # Chat interno
¦ +-- ?? calendario.js # Calendario
¦ +-- ?? competencias.js # Competencias
¦ +-- ?? cursos.js # Cursos
¦ +-- ?? eventos.js # Eventos
¦ +-- ?? proyecto.js # Proyecto UnivSoc
¦ +-- ?? investigadores.js # Investigadores
¦ ¦
¦ +-- ?? admin/
¦ ¦ +-- ?? index.js # Punto de entrada
¦ ¦ +-- ?? admin.core.js # Núcleo
¦ ¦ +-- ?? admin.usuarios.js # CRUD Usuarios
¦ ¦ +-- ?? admin.graduados.js # CRUD Graduados
¦ ¦ +-- ?? admin.docentes.js # CRUD Docentes
¦ ¦ +-- ?? admin.entidades.js # CRUD Entidades
¦ ¦ +-- ?? admin.carreras.js # CRUD Carreras
¦ ¦ +-- ?? admin.tutores.js # Asignación Tutores
¦ ¦ +-- ?? admin.investigadores.js
¦ ¦ +-- ?? admin.reportes.js
¦ ¦ +-- ?? admin.excel.js # Import/Export
¦ ¦
¦ +-- ?? roles/
¦ +-- ?? egresado.js
¦ +-- ?? tutor.js
¦ +-- ?? coordinador.js
¦ +-- ?? directivo.js
¦
+-- ?? lib/
+-- ?? sql-wasm.js # SQLite WebAssembly
+-- ?? sql-wasm.wasm # Binario SQLite
+-- ?? jspdf.umd.min.js # Generación de PDF
+-- ?? xlsx.full.min.js # Exportación/Importación Excel
+-- ?? email.min.js # EmailJS