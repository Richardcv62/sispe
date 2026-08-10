# ?? SISPE - Sistema de Preparacion para el Empleo

**Version:** v4.0  
**Fecha:** Agosto 2026  
**Institucion:** UIJ - Universidad de la Isla de la Juventud  
**Proyecto:** Universidad-Sociedad (UnivSoc)  
**Jefa del Proyecto:** Dr.C Magdalena Moreno Martinez  
**Desarrollador:** Ricardo Castillo Valdes

---

## ?? Descripcion

SISPE es una **aplicacion web progresiva (PWA)** disenada para gestionar el proceso de superacion profesional de egresados universitarios mediante un sistema de tutorias personalizadas. La plataforma facilita la interaccion entre egresados, tutores, coordinadores y directivos, permitiendo el seguimiento personalizado de cada profesional en su insercion laboral.

El sistema esta alineado con el **Proyecto Universidad-Sociedad** de la UIJ, cuyo objetivo es fortalecer el vinculo entre la universidad y las entidades laborales del territorio para la formacion continua de los profesionales.

---

## ?? Caracteristicas Principales

### ??? Arquitectura y Tecnologia
- **Aplicacion Web Progresiva (PWA)** con soporte offline
- **Lazy Loading** de modulos para carga rapida
- **Persistencia automatica** en 3 niveles (SQLite + localStorage + IndexedDB)
- **Arquitectura modular** y escalable
- **Service Worker** para cache y modo offline

### ?? Gestion de Usuarios
- **5 roles diferenciados**: Administrador, Coordinador, Directivo, Tutor, Egresado
- **Multi-Rol**: Un usuario puede tener multiples roles
- **Selector de roles "inmortal"** en la barra superior
- **Cambio de rol sin recargar** la pagina
- **Login rapido para pruebas** con selector de usuarios
- **Avatares personalizados** (emojis o imagenes)

### ?? Planes y Seguimiento
- **Planes de superacion personalizados** para cada egresado
- **Plan Personal**: Autogestionado por el egresado
- **Plan de Superacion**: Definido por el tutor (solo lectura)
- **Acciones del plan** con seguimiento de progreso
- **Progreso automatico** basado en acciones completadas

### ????? Tutorias y Evaluaciones
- **Sistema de tutorias** con registro y seguimiento
- **Historial de tutorias** con acuerdos y proximas fechas
- **Evaluacion de competencias** (6 dimensiones)
- **Autoevaluacion** del egresado (3 dimensiones)
- **Historial de evaluaciones**

### ?? Comunicacion y Organizacion
- **Chat interno** entre usuarios
- **Notificaciones** en tiempo real
- **Calendario de actividades**
- **Gestion de cursos y eventos**
- **Inscripcion a cursos y eventos**

### ?? Reportes y Estadisticas
- **Graficos en tiempo real** en dashboards
- **Paginacion** en tablas grandes
- **Exportacion de reportes** en PDF y Excel
- **Estadisticas generales** del sistema

### ?? Interfaz de Usuario
- **Diseno responsive** para todos los dispositivos
- **Modo oscuro** persistente
- **Modales personalizados** (sin alert/confirm)
- **Notificaciones toast** con sonidos
- **Emojis** en toda la interfaz
- **Breadcrumb** de navegacion

---

## ?? Usuarios de Prueba (v4.0)

| Usuario | Contrasena | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| carlos.p | 123456 | Egresado |
| ana.r | 123456 | Egresado |
| maria.g | 123456 | Tutor |
| pedro.r | 123456 | Tutor |
| coord1 | 123456 | Coordinador |
| directivo1 | 123456 | Directivo |
| multi_rol | 123456 | ? Tutor + Coordinador |

### ?? Multi-Rol

El usuario `multi_rol` tiene asignados los roles de **Tutor** y **Coordinador**. Al iniciar sesion, aparecera un **selector de roles "inmortal"** en la barra superior que nunca desaparece, permitiendo cambiar entre roles sin recargar la pagina.

### ?? Roles Permitidos para Compartir (Multi-Rol)

| Rol | ID | ?Puede compartirse? |
|-----|----|---------------------|
| Administrador | 1 | ? Si |
| Coordinador | 2 | ? Si |
| Tutor | 4 | ? Si |
| Directivo | 3 | ? No |
| Egresado | 5 | ? No |

---

## ??? Arquitectura del Sistema

### Estructura de Capas

```
¢z¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢{
¢x                    PRESENTACION (UI)                        ¢x
¢x   index.html ¡P style.css ¡P Modales ¡P Notificaciones        ¢x
¢u¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢t
¢x                    CONTROLADOR (app.js)                     ¢x
¢x   Navegacion ¡P Renderizado ¡P Selector "inmortal"           ¢x
¢x   Lazy Loading ¡P Gestion de modulos                        ¢x
¢u¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢t
¢x                  MODULOS DE NEGOCIO                         ¢x
¢x   admin/*.js ¡P roles/*.js ¡P competencias.js               ¢x
¢x   cursos.js ¡P eventos.js ¡P chat.js ¡P calendario.js        ¢x
¢x   dashboard-graficos.js ¡P paginacion.js                   ¢x
¢u¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢t
¢x                    CAPA DE DATOS (db.js)                    ¢x
¢x   SQLite ¡ö localStorage ¡ö IndexedDB                        ¢x
¢|¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢w¢}
```

### Flujo de Datos

```
Usuario ¡÷ Interfaz ¡÷ app.js ¡÷ Modulo especifico
    ¡õ
DBModule.execute() ¡÷ SQLite ¡÷ localStorage ¡÷ IndexedDB
    ¡õ
NotificationsModule ¡÷ Feedback al usuario
    ¡õ
Renderizado de resultados
```

---

## ?? Estructura del Proyecto (v4.0)

```
sispe/
¢x
¢u¢w¢w ?? index.html                      # Pagina principal (SPA)
¢u¢w¢w ?? offline.html                    # Pagina offline (PWA)
¢u¢w¢w ?? manifest.json                   # Configuracion PWA
¢u¢w¢w ?? sw.js                           # Service Worker v4.0
¢u¢w¢w ?? .htaccess                       # Configuracion Apache
¢u¢w¢w ?? .gitignore                      # Archivos ignorados por Git
¢u¢w¢w ?? README.md                       # Documentacion general
¢x
¢u¢w¢w ??? icon-192.png                    # Icono PWA 192x192
¢u¢w¢w ??? icon-512.png                    # Icono PWA 512x512
¢u¢w¢w ??? icon-maskable-192.png           # Icono maskable 192x192
¢u¢w¢w ??? icon-maskable-512.png           # Icono maskable 512x512
¢u¢w¢w ??? favicon16.ico                   # Favicon 16x16
¢u¢w¢w ??? favicon32.ico                   # Favicon 32x32
¢x
¢u¢w¢w ?? css/
¢x   ¢|¢w¢w ?? style.css                   # Estilos globales
¢x
¢u¢w¢w ?? js/
¢x   ¢u¢w¢w ?? app.js                      # Controlador principal
¢x   ¢u¢w¢w ?? config.js                   # Configuracion global
¢x   ¢u¢w¢w ?? emojis.js                   # Libreria de emojis
¢x   ¢x
¢x   ¢|¢w¢w ?? modules/
¢x       ¢u¢w¢w ?? db.js                   # Capa de base de datos
¢x       ¢u¢w¢w ?? auth.js                 # Autenticacion
¢x       ¢u¢w¢w ?? modal.js                # Modales personalizados
¢x       ¢u¢w¢w ?? notifications.js        # Notificaciones
¢x       ¢u¢w¢w ?? help.js                 # Ayuda
¢x       ¢u¢w¢w ?? register.js             # Registro de usuarios
¢x       ¢u¢w¢w ?? sync.js                 # Sincronizacion offline/online
¢x       ¢u¢w¢w ?? reports.js              # Reportes
¢x       ¢u¢w¢w ?? loader.js               # Gestor de lazy loading
¢x       ¢u¢w¢w ?? paginacion.js           # Paginacion
¢x       ¢u¢w¢w ?? dashboard-graficos.js   # Graficos en tiempo real
¢x       ¢u¢w¢w ?? chat.js                 # Chat interno
¢x       ¢u¢w¢w ?? calendario.js           # Calendario
¢x       ¢u¢w¢w ?? competencias.js         # Competencias
¢x       ¢u¢w¢w ?? cursos.js               # Cursos
¢x       ¢u¢w¢w ?? eventos.js              # Eventos
¢x       ¢u¢w¢w ?? proyecto.js             # Proyecto UnivSoc
¢x       ¢u¢w¢w ?? investigadores.js       # Investigadores
¢x       ¢x
¢x       ¢u¢w¢w ?? admin/
¢x       ¢x   ¢u¢w¢w ?? index.js            # Punto de entrada
¢x       ¢x   ¢u¢w¢w ?? admin.core.js       # Nucleo
¢x       ¢x   ¢u¢w¢w ?? admin.usuarios.js   # CRUD Usuarios
¢x       ¢x   ¢u¢w¢w ?? admin.graduados.js  # CRUD Graduados
¢x       ¢x   ¢u¢w¢w ?? admin.docentes.js   # CRUD Docentes
¢x       ¢x   ¢u¢w¢w ?? admin.entidades.js  # CRUD Entidades
¢x       ¢x   ¢u¢w¢w ?? admin.carreras.js   # CRUD Carreras
¢x       ¢x   ¢u¢w¢w ?? admin.tutores.js    # Asignacion Tutores
¢x       ¢x   ¢u¢w¢w ?? admin.investigadores.js
¢x       ¢x   ¢u¢w¢w ?? admin.reportes.js
¢x       ¢x   ¢|¢w¢w ?? admin.excel.js      # Import/Export
¢x       ¢x
¢x       ¢|¢w¢w ?? roles/
¢x           ¢u¢w¢w ?? egresado.js
¢x           ¢u¢w¢w ?? tutor.js
¢x           ¢u¢w¢w ?? coordinador.js
¢x           ¢|¢w¢w ?? directivo.js
¢x
¢|¢w¢w ?? lib/
    ¢u¢w¢w ?? sql-wasm.js                 # SQLite WebAssembly
    ¢u¢w¢w ?? sql-wasm.wasm               # Binario SQLite
    ¢u¢w¢w ?? jspdf.umd.min.js            # Generacion de PDF
    ¢u¢w¢w ?? xlsx.full.min.js            # Exportacion/Importacion Excel
    ¢|¢w¢w ?? email.min.js                # EmailJS
```

---

## ?? Instalacion y Configuracion

### Requisitos previos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (XAMPP, WAMP, etc.) para desarrollo

### Para Desarrollo Local (XAMPP)

```bash
# 1. Clonar el repositorio
git clone https://github.com/richardcv62/sispe.git
cd sispe

# 2. Copiar la carpeta a htdocs de XAMPP
# C:/xampp/htdocs/sispe/

# 3. Abrir la aplicacion
# http://localhost/sispe/index.html
```

**Importante para XAMPP:** El archivo `.htaccess` debe estar en la raiz para soporte de WebAssembly.

### Para GitHub Pages (Produccion)

La aplicacion esta desplegada en: **https://richardcv62.github.io/sispe/**

```bash
# 1. Hacer cambios
# 2. Subir a GitHub
git add .
git commit -m "Descripcion de cambios"
git push origin main

# 3. GitHub Pages actualiza automaticamente
```

### Configuracion de EmailJS

En `js/config.js`:

```javascript
EMAILJS: {
    PUBLIC_KEY: '-lS0TtNoFq0fQwCEF',
    SERVICE_ID: 'service_ud0ryy7',
    TEMPLATE_ID_SISPE: 'template_uf9imjr'
}
```

---

## ?? Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estructura de la aplicacion |
| **CSS3** | Estilos y diseno responsive |
| **JavaScript (ES6+)** | Logica completa de la aplicacion |
| **SQLite (sql.js)** | Base de datos local |
| **PWA** | Aplicacion web progresiva |
| **Chart.js** | Graficos interactivos |
| **EmailJS** | Notificaciones por correo |
| **jsPDF** | Generacion de PDF |
| **SheetJS (XLSX)** | Exportacion/Importacion Excel |
| **Font Awesome 6** | Iconos profesionales |
| **Google Fonts (Inter)** | Tipografia moderna |

---

## ?? REGLAS DE ORO DEL SISTEMA

### ?? Regla 1: Modales Personalizados
**NUNCA** usar `alert()`, `confirm()` o `prompt()` nativos.
**SIEMPRE** usar `ModalModule` o `NotificationsModule`.

```javascript
// ? INCORRECTO
alert('Mensaje');
confirm('?Estas seguro?');

// ? CORRECTO
await ModalModule.alert('Mensaje');
await ModalModule.confirm('?Estas seguro?');
await NotificationsModule.showToast('Mensaje', 'success');
```

### ?? Regla 2: Persistencia de Datos
**TODA** operacion de escritura (INSERT/UPDATE/DELETE) DEBE usar `DBModule.execute()`.
**SOLO** lectura usa `DBModule.query()`.

```javascript
// ? CORRECTO - execute() guarda automaticamente
await DBModule.execute('INSERT INTO ...', [params]);

// ? INCORRECTO - query() NO guarda automaticamente
await DBModule.query('INSERT INTO ...', [params]);
```

### ?? Regla 3: Selector de Roles "Inmortal"
- El selector se mantiene visible siempre gracias a MutationObserver
- Cambio de rol sin recargar la pagina
- Vigilante del selector reconstruye automaticamente si desaparece

### ?? Regla 4: Emojis y Acentos
- Usar entidades HTML para acentos (`&aacute;`, `&eacute;`, `&iacute;`, `&oacute;`, `&uacute;`, `&ntilde;`)
- Usar codigos Unicode para emojis o caracteres directos con fuentes compatibles

---

## ?? Base de Datos (36 tablas)

### Tablas Principales

| # | Tabla | Proposito |
|---|-------|-----------|
| 1 | roles | 5 roles del sistema |
| 2 | usuarios | Usuarios del sistema |
| 3 | usuarios_roles | Asignacion multi-rol |
| 4 | entidades | 29 entidades del territorio |
| 5 | carreras | 7 carreras universitarias |
| 6 | graduados | Lista oficial de graduados UIJ |
| 7 | docentes | Lista oficial de docentes (24 investigadores) |
| 8 | egresados | Perfiles de egresados |
| 9 | tutores | Perfiles de tutores |
| 10 | coordinadores | Coordinadores de carrera |
| 11 | directivos | Directivos de entidad |
| 12 | planes_superacion | Planes personalizados de superacion |
| 13 | acciones_plan | Acciones de cada plan |
| 14 | tutorias | Registro de tutorias |
| 15 | evaluaciones | Evaluaciones de competencias |
| 16 | evidencias | Evidencias subidas por egresados |
| 17 | notificaciones | Notificaciones del sistema |
| 18 | diagnosticos | Diagnosticos de egresados |
| 19 | reportes | Reportes generados |
| 20 | configuracion | Configuracion del sistema |
| 21 | sincronizacion | Sincronizacion offline/online |
| 22 | competencias | 15 competencias profesionales |
| 23 | cursos | 8 cursos de capacitacion |
| 24 | eventos | 6 eventos academicos |
| 25 | egresados_cursos | Relacion egresado-curso |
| 26 | egresados_eventos | Relacion egresado-evento |
| 27 | competencias_evaluadas | Evaluacion de competencias |
| 28 | objetivos_proyecto | 11 objetivos del proyecto |
| 29 | productos_cientificos | Productos cientificos |
| 30 | trabajos_estudiantes | Trabajos de curso y diploma |
| 31 | dimensiones_evaluacion | 3 dimensiones de evaluacion |
| 32 | historial_tutorias | Historial de tutorias |
| 33 | historial_evaluaciones | Historial de evaluaciones |
| 34 | mensajes | Chat interno |
| 35 | conversaciones | Conversaciones del chat |
| 36 | eventos_calendario | Calendario de actividades |

### Indices Creados

```sql
-- Chat
CREATE INDEX idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX idx_mensajes_fecha ON mensajes(fecha_envio);
CREATE INDEX idx_mensajes_leido ON mensajes(leido);

-- Calendario
CREATE INDEX idx_eventos_calendario_fecha ON eventos_calendario(fecha_inicio);
CREATE INDEX idx_eventos_calendario_usuario ON eventos_calendario(usuario_id);

-- Busquedas frecuentes
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_egresados_tutor ON egresados(tutor_id);
CREATE INDEX idx_planes_egresado ON planes_superacion(egresado_id);
CREATE INDEX idx_acciones_plan ON acciones_plan(plan_id);
CREATE INDEX idx_tutorias_egresado ON tutorias(egresado_id);
CREATE INDEX idx_evaluaciones_egresado ON evaluaciones(egresado_id);
```

---

## ?? Funcionalidades por Rol

### ?? Administrador
- Gestion completa de usuarios, graduados, docentes, entidades y carreras
- **Creacion de usuarios con multiples roles** (Multi-Rol)
- Asignacion de tutores a egresados
- Gestion de competencias, cursos y eventos
- Visualizacion de investigadores del proyecto
- Reportes del sistema
- Dashboard con graficos en tiempo real

### ?? Coordinador
- Dashboard con estadisticas generales
- Gestion de planes de superacion
- Visualizacion de entidades vinculadas
- Reportes con graficos (Chart.js)
- Competencias, cursos y eventos

### ??? Directivo
- Dashboard de su entidad
- **Planes de la entidad** (visualizacion y creacion)
- **Competencias** (visualizacion por dimension)
- **Eventos** (visualizacion completa)
- Estadisticas de su entidad

### ????? Tutor
- Gestion de sus egresados asignados
- **Registro de tutorias** con acuerdos y proxima tutoria
- **Evaluacion de egresados** con historial
- **Ver detalles de egresado** (modal completo)
- **Plan de Superacion** del egresado (crear/editar acciones)
- Asignacion de nuevos egresados

### ????? Egresado
- Dashboard personal
- **Plan Personal** (autogestionado)
- **Plan de Superacion** (definido por el tutor - solo lectura)
- Solicitud y visualizacion de tutorias
- Subida de evidencias
- Autoevaluacion
- **Mis Cursos** (inscripcion y visualizacion)
- **Mis Eventos** (registro y visualizacion)

---

## ?? Mejoras Implementadas (v4.0)

| # | Mejora | Descripcion | Beneficio |
|---|--------|-------------|-----------|
| 1 | **Lazy Loading** | Carga bajo demanda de modulos | -70% carga inicial |
| 2 | **Paginacion** | 20 items/pagina en tablas grandes | Mejor rendimiento con miles de registros |
| 3 | **Graficos en Tiempo Real** | Dashboards con actualizacion automatica | Informacion actualizada al instante |
| 4 | **Selector de Roles Movil** | Optimizado para dispositivos moviles | Mejor UX en moviles |
| 5 | **Chat Interno** | Mensajeria entre usuarios | Comunicacion integrada |
| 6 | **Calendario** | Gestion de actividades y eventos | Organizacion visual |
| 7 | **Modo Oscuro** | Persistente en localStorage | Confort visual |
| 8 | **Refactorizacion Admin** | 10 submodulos organizados | Mejor mantenibilidad |
| 9 | **Service Worker Optimizado** | Cache inteligente | Carga mas rapida |
| 10 | **Dashboard Mejorado** | 5 graficos interactivos | Mejor visualizacion de datos |

---

## ?? Proximos Pasos

| Fase | Tarea | Prioridad | Estado |
|------|-------|-----------|--------|
| 1 | Implementar bcrypt para contrasenas | ?? CRITICA | Pendiente |
| 2 | Carga de datos reales (graduados, docentes) | ?? ALTA | Pendiente |
| 3 | Crear planes de superacion personalizados | ?? ALTA | Pendiente |
| 4 | Notificaciones push | ?? MEDIA | Pendiente |
| 5 | Reportes con IA | ?? BAJA | Pendiente |

---

## ?? Licencia

Este proyecto es de uso academico y fue desarrollado como parte del Proyecto Universidad-Sociedad en la Universidad de la Isla de la Juventud.

---

## ????? Desarrollador

**Ricardo Castillo Valdes**

- ?? Email: 3sayricardo@gmail.com
- ?? WhatsApp: +53 55031725
- ?? GitHub: https://github.com/richardcv62

---

## ??? Institucion

**UIJ - Universidad de la Isla de la Juventud**  
*Carretera Aeropuerto Km 3 ?, Isla de la Juventud, Cuba*

---

## ?? Agradecimientos

A la **Dra. C. Magdalena Moreno Martinez**, Jefa del Proyecto Universidad-Sociedad, y a todos los investigadores que han contribuido con su conocimiento y experiencia para el desarrollo de este sistema.

A todos los tutores, coordinadores y egresados que han participado en las pruebas y han aportado sugerencias para mejorar la plataforma.

---

## ?? Referencias

- **Documentacion Tecnica v4.0**: Incluye todos los capitulos, ejemplos, codigo y estructuras
- **Manual de Usuario**: Guia para el uso de la plataforma por cada rol

---

> *SISPE - Sistema de Preparacion para el Empleo*  
> *"Transformando la preparacion profesional de nuestros graduados"*
>
> **Version: v4.0** | **UIJ - 2026**

---

## ?? Estado del Proyecto

| Area | Calificacion | Comentario |
|------|--------------|------------|
| **Arquitectura** | ????? | Excelente separacion de capas |
| **Base de Datos** | ????? | 36 tablas con historiales e indices |
| **Autenticacion** | ????? | Multi-rol funcional, selector "inmortal" |
| **Modulos** | ????? | Todos los roles completos |
| **UI/UX** | ????? | Responsive, modo oscuro, graficos en tiempo real |
| **PWA** | ????? | Service Worker, offline, carga optimizada |
| **Rendimiento** | ???? | Lazy loading, paginacion, cache |
| **Documentacion** | ????? | Tecnica y metodologica completa |
| **Seguridad** | ??? | Contrasenas en texto plano (pendiente bcrypt) |

**Estado General: MUY BUENO - Listo para produccion con datos reales**