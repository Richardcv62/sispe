# ?? `README.md` - Actualizado para SISPE v4.0

```markdown
# ?? SISPE - Sistema de Preparaci車n para el Empleo

Sistema integral para la superaci車n profesional de reci谷n graduados universitarios, desarrollado como parte del Proyecto Universidad-Sociedad de la Universidad de la Isla de la Juventud.

---

## ?? Descripci車n

SISPE es una aplicaci車n web progresiva (PWA) que permite gestionar el proceso de preparaci車n para el empleo de los egresados universitarios. La plataforma facilita la interacci車n entre egresados, tutores, coordinadores y directivos, permitiendo el seguimiento personalizado de cada profesional en su inserci車n laboral.

### Caracter赤sticas principales

- **Gesti車n de usuarios** con roles diferenciados (Administrador, Coordinador, Directivo, Tutor, Egresado)
- **Multi-Rol**: Un usuario puede tener m迆ltiples roles (ej: Tutor + Coordinador)
- **Selector de roles "inmortal"** en la barra superior (nunca desaparece)
- **Cambio de rol sin recargar** la p芍gina (actualizaci車n din芍mica)
- **Login r芍pido para pruebas** con selector de usuarios
- **Planes de superaci車n personalizados** para cada egresado
- **Sistema de tutor赤as** con seguimiento y evaluaci車n
- **Gesti車n de competencias** profesionales
- **Cat芍logo de cursos y eventos** de capacitaci車n
- **Base de datos SQLite** con soporte offline
- **Exportaci車n de reportes** en PDF y Excel
- **Notificaciones por correo** a trav谷s de EmailJS
- **Dise?o responsive** para dispositivos m車viles y desktop
- **Modales personalizados** (sin alert/confirm)

---

## ??? Contexto del Proyecto

SISPE est芍 alineado con el **Proyecto Universidad-Sociedad** de la UIJ, cuyo objetivo es fortalecer el v赤nculo entre la universidad y las entidades laborales del territorio para la formaci車n continua de los profesionales.

El sistema integra:

- **29 entidades** del territorio (empresas y organismos)
- **7 carreras** universitarias
- **24 investigadores** del proyecto
- **11 objetivos estrat谷gicos** del proyecto
- **15 competencias** profesionales
- **8 cursos** de capacitaci車n
- **6 eventos** acad谷micos
- **3 dimensiones de evaluaci車n**

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

El usuario `multi_rol` tiene asignados los roles de **Tutor** y **Coordinador**. Al iniciar sesi車n, aparecer芍 un **selector de roles "inmortal"** en la barra superior que nunca desaparece, permitiendo cambiar entre roles sin recargar la p芍gina.

### ?? Roles Permitidos para Compartir (Multi-Rol)

| Rol | ID | ?Puede compartirse? |
|-----|----|---------------------|
| Administrador | 1 | ? S赤 |
| Coordinador | 2 | ? S赤 |
| Tutor | 4 | ? S赤 |
| Directivo | 3 | ? No |
| Egresado | 5 | ? No |

---

## ??? Estructura del Proyecto (v4.0)

```
sispe/
念岸岸 index.html                 # P芍gina principal
念岸岸 manifest.json              # Configuraci車n PWA
念岸岸 sw.js                      # Service Worker (v4.0)
念岸岸 offline.html               # P芍gina sin conexi車n
念岸岸 favicon16.ico              # Favicon 16x16
念岸岸 favicon32.ico              # Favicon 32x32
念岸岸 .htaccess                  # Configuraci車n Apache
念岸岸 icon-*.png                 # Iconos de la aplicaci車n
念岸岸 css/
岫   弩岸岸 style.css              # Estilos globales
念岸岸 js/
岫   念岸岸 app.js                 # Controlador principal (v4.0)
岫   念岸岸 config.js              # Configuraci車n global
岫   念岸岸 emojis.js              # Librer赤a de emojis
岫   弩岸岸 modules/
岫       念岸岸 db.js              # Capa de base de datos SQLite
岫       念岸岸 auth.js            # Autenticaci車n (multi-rol)
岫       念岸岸 modal.js           # Modales personalizados
岫       念岸岸 admin.js           # M車dulo de administraci車n (multi-rol)
岫       念岸岸 notifications.js   # Notificaciones (toasts, EmailJS)
岫       念岸岸 reports.js         # Reportes (PDF, Excel, gr芍ficos)
岫       念岸岸 sync.js            # Sincronizaci車n offline
岫       念岸岸 register.js        # Registro de usuarios
岫       念岸岸 help.js            # Ayuda
岫       念岸岸 competencias.js    # Gesti車n de competencias
岫       念岸岸 cursos.js          # Gesti車n de cursos
岫       念岸岸 eventos.js         # Gesti車n de eventos
岫       念岸岸 proyecto.js        # Proyecto Universidad-Sociedad
岫       念岸岸 investigadores.js  # Gesti車n de investigadores
岫       弩岸岸 roles/
岫           念岸岸 egresado.js    # M車dulo del egresado (Mis Cursos, Mis Eventos)
岫           念岸岸 tutor.js       # M車dulo del tutor (ver detalles, historial)
岫           念岸岸 coordinador.js # M車dulo del coordinador (planes, gr芍ficos)
岫           弩岸岸 directivo.js   # M車dulo del directivo (planes, competencias)
念岸岸 lib/
岫   念岸岸 sql-wasm.js            # SQLite WebAssembly
岫   念岸岸 sql-wasm.wasm          # Binario SQLite
岫   念岸岸 jspdf.umd.min.js       # Generaci車n de PDF
岫   念岸岸 xlsx.full.min.js       # Exportaci車n a Excel
岫   弩岸岸 email.min.js           # EmailJS
弩岸岸 README.md
```

---

## ?? Instalaci車n y Configuraci車n

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

# 3. Abrir la aplicaci車n
# http://localhost/sispe/index.html
```

**Importante para XAMPP:** Crear archivo `.htaccess` en la ra赤z para soporte de WebAssembly.

### Para GitHub Pages (Producci車n)

La aplicaci車n est芍 desplegada en: **https://richardcv62.github.io/sispe/**

```bash
# 1. Hacer cambios
# 2. Subir a GitHub
git add .
git commit -m "Descripci車n de cambios"
git push origin main

# 3. GitHub Pages actualiza autom芍ticamente
```

### Configuraci車n de EmailJS

En `js/config.js`:

```javascript
EMAILJS: {
    PUBLIC_KEY: '-ISOTtNoFq0fQwCEF',
    SERVICE_ID: 'service_ud0ryy7',
    TEMPLATE_ID_SISPE: 'template_uf9imjr'
}
```

### Configuraci車n del .htaccess

```apache
# SISPE - Configuraci車n para XAMPP
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

## ??? Tecnolog赤as Utilizadas

| Tecnolog赤a | Descripci車n |
|------------|-------------|
| HTML5 | Estructura de la aplicaci車n |
| CSS3 | Estilos y dise?o responsive |
| JavaScript (ES6+) | L車gica de la aplicaci車n |
| SQLite (sql.js) | Base de datos local |
| PWA | Aplicaci車n web progresiva |
| EmailJS | Env赤o de correos |
| jsPDF | Generaci車n de PDF |
| SheetJS (XLSX) | Exportaci車n/importaci車n Excel |
| Chart.js | Gr芍ficos y visualizaciones |
| Font Awesome 6 | Iconos profesionales |
| Google Fonts (Inter) | Tipograf赤a moderna |

---

## ?? Base de Datos

SISPE utiliza SQLite a trav谷s de la librer赤a sql.js, lo que permite:

- **Base de datos local** en el navegador
- **Funcionamiento offline** sin conexi車n a internet
- **Persistencia** mediante localStorage + IndexedDB
- **35 tablas** que cubren toda la l車gica del sistema

### Principales tablas

| Tabla | Descripci車n |
|-------|-------------|
| roles | Roles del sistema |
| usuarios | Usuarios del sistema |
| usuarios_roles | Asignaci車n de m迆ltiples roles (multi-rol) |
| entidades | Empresas y organismos |
| carreras | Carreras universitarias |
| graduados | Lista oficial de graduados |
| docentes | Lista oficial de docentes |
| egresados | Perfiles de egresados |
| tutores | Perfiles de tutores |
| planes_superacion | Planes personalizados |
| acciones_plan | Acciones de cada plan |
| tutorias | Registro de tutor赤as |
| evaluaciones | Evaluaciones de competencias |
| competencias | Cat芍logo de competencias |
| cursos | Cat芍logo de cursos |
| eventos | Cat芍logo de eventos |
| objetivos_proyecto | Objetivos del proyecto |
| historial_tutorias | Historial de tutor赤as (NUEVO) |
| historial_evaluaciones | Historial de evaluaciones (NUEVO) |

---

## ?? Funcionalidades por Rol

### Administrador
- Gesti車n completa de usuarios, graduados, docentes, entidades y carreras
- **Creaci車n de usuarios con m迆ltiples roles** (Multi-Rol)
- Asignaci車n de tutores a egresados
- Gesti車n de competencias, cursos y eventos
- Visualizaci車n de investigadores del proyecto
- Reportes del sistema

### Coordinador
- Dashboard con estad赤sticas generales
- Gesti車n de planes de superaci車n
- Visualizaci車n de entidades vinculadas
- Reportes con gr芍ficos (Chart.js)
- Competencias, cursos y eventos

### Directivo
- Dashboard de su entidad
- **Planes de la entidad** (visualizaci車n y creaci車n)
- **Competencias** (visualizaci車n por dimensi車n)
- **Eventos** (visualizaci車n completa)
- Estad赤sticas de su entidad

### Tutor
- Gesti車n de sus egresados asignados
- **Registro de tutor赤as** con acuerdos y pr車xima tutor赤a
- **Evaluaci車n de egresados** con historial
- **Ver detalles de egresado** (modal completo)
- **Ver detalles de tutor赤a** (modal con resumen y acuerdos)
- **Ver detalles de evaluaci車n** (modal con puntaje y estrellas)
- Asignaci車n de nuevos egresados

### Egresado
- Dashboard personal
- Visualizaci車n de su plan de superaci車n
- Solicitud y visualizaci車n de tutor赤as
- Subida de evidencias
- Autoevaluaci車n
- **Mis Cursos** (inscripci車n y visualizaci車n) - NUEVO
- **Mis Eventos** (registro y visualizaci車n) - NUEVO

---

## ?? REGLAS DE ORO DEL SISTEMA

1. **NUNCA** usar `alert()`, `confirm()` o `prompt()` nativos
2. **SIEMPRE** usar `ModalModule` o `NotificationsModule`
3. **TODA** operaci車n de escritura (INSERT/UPDATE/DELETE) DEBE usar `await DBModule.execute()`
4. **SOLO** lectura usa `await DBModule.query()`
5. **NO** llamar a `guardarCambios()` despu谷s de execute()
6. Modales con `max-height: 60vh` y `overflow-y: auto`

### REGLA DE ORO PARA PERSISTENCIA

```javascript
// ? CORRECTO - execute() guarda autom芍ticamente
await DBModule.execute('INSERT INTO ...', [params]);

// ? INCORRECTO - query() NO guarda autom芍ticamente
await DBModule.query('INSERT INTO ...', [params]);

// ? NO es necesario llamar a guardarCambios()
// porque execute() ya lo hace autom芍ticamente
```

---

## ?? Historial de Versiones

| Versi車n | Fecha | Cambios Principales |
|---------|-------|---------------------|
| **v1.0** | 2025 | Versi車n inicial con funcionalidades b芍sicas |
| **v2.0** | 2026 | Implementaci車n de multi-rol y selector de roles |
| **v3.0** | 2026 | Persistencia autom芍tica, tablas de historial, mejoras visuales |
| **v4.0** | **Agosto 2026** | Selector "inmortal", cambio de rol sin recarga, login r芍pido, restricci車n de roles |

---

## ?? Pr車ximos Pasos

| Fase | Tarea | Estado |
|------|-------|--------|
| 1 | Carga masiva de datos (graduados y docentes) | Pendiente |
| 2 | Planes de superaci車n personalizados | Pendiente |
| 3 | Sistema de tutor赤as con seguimiento | Pendiente |
| 4 | Evaluaciones y reportes | Pendiente |
| 5 | Funcionalidades avanzadas (notificaciones push, chat) | Pendiente |

---

## ?? Licencia

Este proyecto es de uso acad谷mico y fue desarrollado como parte de la tesis de grado en la Universidad de la Isla de la Juventud.

---

## ????? Desarrollador

**Ricardo Castillo Vald谷s**

- ?? Email: 3sayricardo@gmail.com
- ?? WhatsApp: +53 55031725
- ?? GitHub: https://github.com/richardcv62

---

## ??? Instituci車n

**UIJ - Universidad de la Isla de la Juventud**
*Carretera Aeropuerto Km 3 ?, Isla de la Juventud, Cuba*

---

## ?? Agradecimientos

A la Dra. C. Magdalena Moreno Mart赤nez, Jefa del Proyecto Universidad-Sociedad, y a todos los investigadores que han contribuido con su conocimiento y experiencia para el desarrollo de este sistema.

---

> *SISPE - Sistema de Preparaci車n para el Empleo*  
> *"Transformando la preparaci車n profesional de nuestros graduados"*
>
> **Versi車n: v4.0** | **UIJ - 2026**
```

---

## ?? Resumen de Cambios en el README

| Secci車n | Cambio |
|---------|--------|
| **Usuarios de Prueba** | Agregado `multi_rol` y tabla de roles permitidos |
| **Multi-Rol** | Explicaci車n del selector "inmortal" y cambio sin recarga |
| **Estructura** | Actualizada con favicons, .htaccess y nuevos m車dulos |
| **Instalaci車n** | Agregada configuraci車n para XAMPP y .htaccess |
| **Base de Datos** | Actualizada a 35 tablas con historiales |
| **Reglas de Oro** | Nueva secci車n con reglas de persistencia |
| **Historial de Versiones** | Agregado v4.0 |
| **Funcionalidades** | Actualizadas todas las funcionalidades por rol |
| **Versi車n** | Actualizada de v1.0 a v4.0 |

---

**?README.md actualizado para SISPE v4.0!** ??
