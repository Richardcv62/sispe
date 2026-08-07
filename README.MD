# ?? `README.md` - Actualizado para SISPE v4.0

```markdown
# ?? SISPE - Sistema de Preparaci¨®n para el Empleo

Sistema integral para la superaci¨®n profesional de reci¨¦n graduados universitarios, desarrollado como parte del Proyecto Universidad-Sociedad de la Universidad de la Isla de la Juventud.

---

## ?? Descripci¨®n

SISPE es una aplicaci¨®n web progresiva (PWA) que permite gestionar el proceso de preparaci¨®n para el empleo de los egresados universitarios. La plataforma facilita la interacci¨®n entre egresados, tutores, coordinadores y directivos, permitiendo el seguimiento personalizado de cada profesional en su inserci¨®n laboral.

### Caracter¨ªsticas principales

- **Gesti¨®n de usuarios** con roles diferenciados (Administrador, Coordinador, Directivo, Tutor, Egresado)
- **Multi-Rol**: Un usuario puede tener m¨²ltiples roles (ej: Tutor + Coordinador)
- **Selector de roles "inmortal"** en la barra superior (nunca desaparece)
- **Cambio de rol sin recargar** la p¨¢gina (actualizaci¨®n din¨¢mica)
- **Login r¨¢pido para pruebas** con selector de usuarios
- **Planes de superaci¨®n personalizados** para cada egresado
- **Sistema de tutor¨ªas** con seguimiento y evaluaci¨®n
- **Gesti¨®n de competencias** profesionales
- **Cat¨¢logo de cursos y eventos** de capacitaci¨®n
- **Base de datos SQLite** con soporte offline
- **Exportaci¨®n de reportes** en PDF y Excel
- **Notificaciones por correo** a trav¨¦s de EmailJS
- **Dise?o responsive** para dispositivos m¨®viles y desktop
- **Modales personalizados** (sin alert/confirm)

---

## ??? Contexto del Proyecto

SISPE est¨¢ alineado con el **Proyecto Universidad-Sociedad** de la UIJ, cuyo objetivo es fortalecer el v¨ªnculo entre la universidad y las entidades laborales del territorio para la formaci¨®n continua de los profesionales.

El sistema integra:

- **29 entidades** del territorio (empresas y organismos)
- **7 carreras** universitarias
- **24 investigadores** del proyecto
- **11 objetivos estrat¨¦gicos** del proyecto
- **15 competencias** profesionales
- **8 cursos** de capacitaci¨®n
- **6 eventos** acad¨¦micos
- **3 dimensiones de evaluaci¨®n**

---

## ?? Usuarios de Prueba (v4.0)

| Usuario | Contrase?a | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| carlos.p | 123456 | Egresado |
| ana.r | 123456 | Egresado |
| maria.g | 123456 | Tutor |
| pedro.r | 123456 | Tutor |
| coord1 | 123456 | Coordinador |
| directivo1 | 123456 | Directivo |
| multi_rol | 123456 | ? Tutor + Coordinador |

### ? Usuario Multi-Rol

El usuario `multi_rol` tiene asignados los roles de **Tutor** y **Coordinador**. Al iniciar sesi¨®n, aparecer¨¢ un **selector de roles "inmortal"** en la barra superior que nunca desaparece, permitiendo cambiar entre roles sin recargar la p¨¢gina.

### ?? Roles Permitidos para Compartir (Multi-Rol)

| Rol | ID | ?Puede compartirse? |
|-----|----|---------------------|
| Administrador | 1 | ? S¨ª |
| Coordinador | 2 | ? S¨ª |
| Tutor | 4 | ? S¨ª |
| Directivo | 3 | ? No |
| Egresado | 5 | ? No |

---

## ??? Estructura del Proyecto (v4.0)

```
sispe/
©À©¤©¤ index.html                 # P¨¢gina principal
©À©¤©¤ manifest.json              # Configuraci¨®n PWA
©À©¤©¤ sw.js                      # Service Worker (v4.0)
©À©¤©¤ offline.html               # P¨¢gina sin conexi¨®n
©À©¤©¤ favicon16.ico              # Favicon 16x16
©À©¤©¤ favicon32.ico              # Favicon 32x32
©À©¤©¤ .htaccess                  # Configuraci¨®n Apache
©À©¤©¤ icon-*.png                 # Iconos de la aplicaci¨®n
©À©¤©¤ css/
©¦   ©¸©¤©¤ style.css              # Estilos globales
©À©¤©¤ js/
©¦   ©À©¤©¤ app.js                 # Controlador principal (v4.0)
©¦   ©À©¤©¤ config.js              # Configuraci¨®n global
©¦   ©À©¤©¤ emojis.js              # Librer¨ªa de emojis
©¦   ©¸©¤©¤ modules/
©¦       ©À©¤©¤ db.js              # Capa de base de datos SQLite
©¦       ©À©¤©¤ auth.js            # Autenticaci¨®n (multi-rol)
©¦       ©À©¤©¤ modal.js           # Modales personalizados
©¦       ©À©¤©¤ admin.js           # M¨®dulo de administraci¨®n (multi-rol)
©¦       ©À©¤©¤ notifications.js   # Notificaciones (toasts, EmailJS)
©¦       ©À©¤©¤ reports.js         # Reportes (PDF, Excel, gr¨¢ficos)
©¦       ©À©¤©¤ sync.js            # Sincronizaci¨®n offline
©¦       ©À©¤©¤ register.js        # Registro de usuarios
©¦       ©À©¤©¤ help.js            # Ayuda
©¦       ©À©¤©¤ competencias.js    # Gesti¨®n de competencias
©¦       ©À©¤©¤ cursos.js          # Gesti¨®n de cursos
©¦       ©À©¤©¤ eventos.js         # Gesti¨®n de eventos
©¦       ©À©¤©¤ proyecto.js        # Proyecto Universidad-Sociedad
©¦       ©À©¤©¤ investigadores.js  # Gesti¨®n de investigadores
©¦       ©¸©¤©¤ roles/
©¦           ©À©¤©¤ egresado.js    # M¨®dulo del egresado (Mis Cursos, Mis Eventos)
©¦           ©À©¤©¤ tutor.js       # M¨®dulo del tutor (ver detalles, historial)
©¦           ©À©¤©¤ coordinador.js # M¨®dulo del coordinador (planes, gr¨¢ficos)
©¦           ©¸©¤©¤ directivo.js   # M¨®dulo del directivo (planes, competencias)
©À©¤©¤ lib/
©¦   ©À©¤©¤ sql-wasm.js            # SQLite WebAssembly
©¦   ©À©¤©¤ sql-wasm.wasm          # Binario SQLite
©¦   ©À©¤©¤ jspdf.umd.min.js       # Generaci¨®n de PDF
©¦   ©À©¤©¤ xlsx.full.min.js       # Exportaci¨®n a Excel
©¦   ©¸©¤©¤ email.min.js           # EmailJS
©¸©¤©¤ README.md
```

---

## ?? Instalaci¨®n y Configuraci¨®n

### Requisitos previos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (opcional, para desarrollo)

### Para Desarrollo Local (XAMPP)

```bash
# 1. Clonar el repositorio
git clone https://github.com/richardcv62/sispe.git
cd sispe

# 2. Copiar la carpeta a htdocs de XAMPP
# C:/xampp/htdocs/sispe/

# 3. Abrir la aplicaci¨®n
# http://localhost/sispe/index.html
```

**Importante para XAMPP:** Crear archivo `.htaccess` en la ra¨ªz para soporte de WebAssembly.

### Para GitHub Pages (Producci¨®n)

La aplicaci¨®n est¨¢ desplegada en: **https://richardcv62.github.io/sispe/**

```bash
# 1. Hacer cambios
# 2. Subir a GitHub
git add .
git commit -m "Descripci¨®n de cambios"
git push origin main

# 3. GitHub Pages actualiza autom¨¢ticamente
```

### Configuraci¨®n de EmailJS

En `js/config.js`:

```javascript
EMAILJS: {
    PUBLIC_KEY: '-ISOTtNoFq0fQwCEF',
    SERVICE_ID: 'service_ud0ryy7',
    TEMPLATE_ID_SISPE: 'template_uf9imjr'
}
```

### Configuraci¨®n del .htaccess

```apache
# SISPE - Configuraci¨®n para XAMPP
<IfModule mod_mime.c>
    AddType application/wasm .wasm
</IfModule>

<IfModule mod_headers.c>
    <FilesMatch "\.(wasm)$">
        Header set Content-Type "application/wasm"
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>

Options -Indexes
```

---

## ??? Tecnolog¨ªas Utilizadas

| Tecnolog¨ªa | Descripci¨®n |
|------------|-------------|
| HTML5 | Estructura de la aplicaci¨®n |
| CSS3 | Estilos y dise?o responsive |
| JavaScript (ES6+) | L¨®gica de la aplicaci¨®n |
| SQLite (sql.js) | Base de datos local |
| PWA | Aplicaci¨®n web progresiva |
| EmailJS | Env¨ªo de correos |
| jsPDF | Generaci¨®n de PDF |
| SheetJS (XLSX) | Exportaci¨®n/importaci¨®n Excel |
| Chart.js | Gr¨¢ficos y visualizaciones |
| Font Awesome 6 | Iconos profesionales |
| Google Fonts (Inter) | Tipograf¨ªa moderna |

---

## ?? Base de Datos

SISPE utiliza SQLite a trav¨¦s de la librer¨ªa sql.js, lo que permite:

- **Base de datos local** en el navegador
- **Funcionamiento offline** sin conexi¨®n a internet
- **Persistencia** mediante localStorage + IndexedDB
- **35 tablas** que cubren toda la l¨®gica del sistema

### Principales tablas

| Tabla | Descripci¨®n |
|-------|-------------|
| roles | Roles del sistema |
| usuarios | Usuarios del sistema |
| usuarios_roles | Asignaci¨®n de m¨²ltiples roles (multi-rol) |
| entidades | Empresas y organismos |
| carreras | Carreras universitarias |
| graduados | Lista oficial de graduados |
| docentes | Lista oficial de docentes |
| egresados | Perfiles de egresados |
| tutores | Perfiles de tutores |
| planes_superacion | Planes personalizados |
| acciones_plan | Acciones de cada plan |
| tutorias | Registro de tutor¨ªas |
| evaluaciones | Evaluaciones de competencias |
| competencias | Cat¨¢logo de competencias |
| cursos | Cat¨¢logo de cursos |
| eventos | Cat¨¢logo de eventos |
| objetivos_proyecto | Objetivos del proyecto |
| historial_tutorias | Historial de tutor¨ªas (NUEVO) |
| historial_evaluaciones | Historial de evaluaciones (NUEVO) |

---

## ?? Funcionalidades por Rol

### Administrador
- Gesti¨®n completa de usuarios, graduados, docentes, entidades y carreras
- **Creaci¨®n de usuarios con m¨²ltiples roles** (Multi-Rol)
- Asignaci¨®n de tutores a egresados
- Gesti¨®n de competencias, cursos y eventos
- Visualizaci¨®n de investigadores del proyecto
- Reportes del sistema

### Coordinador
- Dashboard con estad¨ªsticas generales
- Gesti¨®n de planes de superaci¨®n
- Visualizaci¨®n de entidades vinculadas
- Reportes con gr¨¢ficos (Chart.js)
- Competencias, cursos y eventos

### Directivo
- Dashboard de su entidad
- **Planes de la entidad** (visualizaci¨®n y creaci¨®n)
- **Competencias** (visualizaci¨®n por dimensi¨®n)
- **Eventos** (visualizaci¨®n completa)
- Estad¨ªsticas de su entidad

### Tutor
- Gesti¨®n de sus egresados asignados
- **Registro de tutor¨ªas** con acuerdos y pr¨®xima tutor¨ªa
- **Evaluaci¨®n de egresados** con historial
- **Ver detalles de egresado** (modal completo)
- **Ver detalles de tutor¨ªa** (modal con resumen y acuerdos)
- **Ver detalles de evaluaci¨®n** (modal con puntaje y estrellas)
- Asignaci¨®n de nuevos egresados

### Egresado
- Dashboard personal
- Visualizaci¨®n de su plan de superaci¨®n
- Solicitud y visualizaci¨®n de tutor¨ªas
- Subida de evidencias
- Autoevaluaci¨®n
- **Mis Cursos** (inscripci¨®n y visualizaci¨®n) - NUEVO
- **Mis Eventos** (registro y visualizaci¨®n) - NUEVO

---

## ?? REGLAS DE ORO DEL SISTEMA

1. **NUNCA** usar `alert()`, `confirm()` o `prompt()` nativos
2. **SIEMPRE** usar `ModalModule` o `NotificationsModule`
3. **TODA** operaci¨®n de escritura (INSERT/UPDATE/DELETE) DEBE usar `await DBModule.execute()`
4. **SOLO** lectura usa `await DBModule.query()`
5. **NO** llamar a `guardarCambios()` despu¨¦s de execute()
6. Modales con `max-height: 60vh` y `overflow-y: auto`

### REGLA DE ORO PARA PERSISTENCIA

```javascript
// ? CORRECTO - execute() guarda autom¨¢ticamente
await DBModule.execute('INSERT INTO ...', [params]);

// ? INCORRECTO - query() NO guarda autom¨¢ticamente
await DBModule.query('INSERT INTO ...', [params]);

// ? NO es necesario llamar a guardarCambios()
// porque execute() ya lo hace autom¨¢ticamente
```

---

## ?? Historial de Versiones

| Versi¨®n | Fecha | Cambios Principales |
|---------|-------|---------------------|
| **v1.0** | 2025 | Versi¨®n inicial con funcionalidades b¨¢sicas |
| **v2.0** | 2026 | Implementaci¨®n de multi-rol y selector de roles |
| **v3.0** | 2026 | Persistencia autom¨¢tica, tablas de historial, mejoras visuales |
| **v4.0** | **Agosto 2026** | Selector "inmortal", cambio de rol sin recarga, login r¨¢pido, restricci¨®n de roles |

---

## ?? Pr¨®ximos Pasos

| Fase | Tarea | Estado |
|------|-------|--------|
| 1 | Carga masiva de datos (graduados y docentes) | Pendiente |
| 2 | Planes de superaci¨®n personalizados | Pendiente |
| 3 | Sistema de tutor¨ªas con seguimiento | Pendiente |
| 4 | Evaluaciones y reportes | Pendiente |
| 5 | Funcionalidades avanzadas (notificaciones push, chat) | Pendiente |

---

## ?? Licencia

Este proyecto es de uso acad¨¦mico y fue desarrollado como parte de la tesis de grado en la Universidad de la Isla de la Juventud.

---

## ????? Desarrollador

**Ricardo Castillo Vald¨¦s**

- ?? Email: 3sayricardo@gmail.com
- ?? WhatsApp: +53 55031725
- ?? GitHub: https://github.com/richardcv62

---

## ??? Instituci¨®n

**UIJ - Universidad de la Isla de la Juventud**
*Carretera Aeropuerto Km 3 ?, Isla de la Juventud, Cuba*

---

## ?? Agradecimientos

A la Dra. C. Magdalena Moreno Mart¨ªnez, Jefa del Proyecto Universidad-Sociedad, y a todos los investigadores que han contribuido con su conocimiento y experiencia para el desarrollo de este sistema.

---

> *SISPE - Sistema de Preparaci¨®n para el Empleo*  
> *"Transformando la preparaci¨®n profesional de nuestros graduados"*
>
> **Versi¨®n: v4.0** | **UIJ - 2026**
```

---

## ?? Resumen de Cambios en el README

| Secci¨®n | Cambio |
|---------|--------|
| **Usuarios de Prueba** | Agregado `multi_rol` y tabla de roles permitidos |
| **Multi-Rol** | Explicaci¨®n del selector "inmortal" y cambio sin recarga |
| **Estructura** | Actualizada con favicons, .htaccess y nuevos m¨®dulos |
| **Instalaci¨®n** | Agregada configuraci¨®n para XAMPP y .htaccess |
| **Base de Datos** | Actualizada a 35 tablas con historiales |
| **Reglas de Oro** | Nueva secci¨®n con reglas de persistencia |
| **Historial de Versiones** | Agregado v4.0 |
| **Funcionalidades** | Actualizadas todas las funcionalidades por rol |
| **Versi¨®n** | Actualizada de v1.0 a v4.0 |

---

**?README.md actualizado para SISPE v4.0!** ??