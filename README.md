```markdown
# 馃摎 SISPE - Sistema de Preparaci贸n para el Empleo

![SISPE Logo](icon-192.png)

> **Sistema de Gesti贸n de Superaci贸n Profesional para Reci茅n Graduados Universitarios**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/tu-usuario/sispe)
[![PWA](https://img.shields.io/badge/PWA-Instalable-green.svg)](https://github.com/tu-usuario/sispe)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/es/docs/Web/JavaScript)

---

## 馃搵 脥NDICE

- [馃摎 SISPE - Sistema de Preparaci贸n para el Empleo](#-sispe---sistema-de-preparaci贸n-para-el-empleo)
  - [馃搵 脥NDICE](#-铆ndice)
  - [馃幆 DESCRIPCI脫N DEL PROYECTO](#-descripci贸n-del-proyecto)
  - [鉁?CARACTER脥STICAS PRINCIPALES](#-caracter铆sticas-principales)
  - [馃彈锔?ARQUITECTURA](#锔?arquitectura)
  - [馃洜锔?TECNOLOG脥AS UTILIZADAS](#锔?tecnolog铆as-utilizadas)
  - [馃搧 ESTRUCTURA DEL PROYECTO](#-estructura-del-proyecto)
  - [馃殌 INSTALACI脫N Y CONFIGURACI脫N](#-instalaci贸n-y-configuraci贸n)
    - [Requisitos Previos](#requisitos-previos)
    - [Pasos de Instalaci贸n](#pasos-de-instalaci贸n)
  - [馃懃 ROLES DEL SISTEMA](#-roles-del-sistema)
  - [馃攽 USUARIOS DE PRUEBA](#-usuarios-de-prueba)
  - [馃摫 PWA (Aplicaci贸n Web Progresiva)](#-pwa-aplicaci贸n-web-progresiva)
  - [馃搳 BASE DE DATOS](#-base-de-datos)
  - [馃摜 IMPORTACI脫N Y EXPORTACI脫N DE DATOS](#-importaci贸n-y-exportaci贸n-de-datos)
  - [馃摟 CONFIGURACI脫N DE EMAILJS](#-configuraci贸n-de-emailjs)
  - [馃 CONTRIBUIR](#-contribuir)
  - [馃搫 LICENCIA](#-licencia)
  - [馃摓 CONTACTO](#-contacto)

---

## 馃幆 DESCRIPCI脫N DEL PROYECTO

**SISPE** (Sistema de Preparaci贸n para el Empleo) es una **Plataforma Web Progresiva (PWA)** dise帽ada para gestionar la superaci贸n profesional de los reci茅n graduados universitarios durante su etapa de preparaci贸n para el empleo.

Esta aplicaci贸n surge de una **tesis doctoral** en Ciencias Pedag贸gicas y est谩 implementada para la **Universidad de la Isla de la Juventud "Jes煤s Montan茅 Oropesa" (UIJ)** , con el objetivo de fortalecer el v铆nculo universidad-empresa y mejorar la inserci贸n laboral de los egresados.

### 馃帗 Objetivos Principales

- 鉁?Gestionar planes de superaci贸n personalizados para egresados
- 鉁?Facilitar el seguimiento de tutor铆as
- 鉁?Evaluar competencias profesionales
- 鉁?Generar reportes y estad铆sticas
- 鉁?Mantener trazabilidad del progreso
- 鉁?Funcionar sin conexi贸n a internet (offline)
- 鉁?Sincronizar datos con servidor MySQL

---

## 鉁?CARACTER脥STICAS PRINCIPALES

| **Caracter铆stica** | **Descripci贸n** |
|-------------------|-----------------|
| 馃摫 **PWA** | Instalable en m贸viles y funciona offline |
| 馃懃 **5 Roles** | Administrador, Coordinador, Directivo, Tutor, Egresado |
| 馃搳 **Dashboards** | Paneles personalizados seg煤n cada rol |
| 馃搵 **Planes Personalizados** | Planes de superaci贸n adaptados a cada egresado |
| 馃鈥嶐煆?**Tutor铆as** | Registro y seguimiento de tutor铆as |
| 猸?**Evaluaciones** | Evaluaci贸n de competencias (heteroevaluaci贸n y autoevaluaci贸n) |
| 馃搸 **Evidencias** | Subida de certificados, informes y proyectos |
| 馃摜 **Importaci贸n Excel** | Carga masiva de datos desde Excel |
| 馃摛 **Exportaci贸n Excel** | Exportaci贸n de datos a Excel |
| 馃摟 **Notificaciones** | Notificaciones por correo (EmailJS) |
| 馃敀 **Seguridad** | Autenticaci贸n y persistencia de sesi贸n |
| 馃摫 **Responsive** | Adaptable a m贸viles, tablets y escritorio |
| 馃寪 **Offline** | Funciona sin conexi贸n a internet |

---

## 馃彈锔?ARQUITECTURA

### Patr贸n de Dise帽o

La aplicaci贸n sigue el patr贸n **SPA (Single Page Application)** con arquitectura **modular**:

```
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹?                   index.html                       鈹?
鈹?             (Punto de entrada PWA)                 鈹?
鈹溾攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹?                   APP.JS                           鈹?
鈹?           (Controlador Principal)                  鈹?
鈹溾攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? auth.js 鈹? db.js   鈹俢onfig.js 鈹? notifications.js 鈹?
鈹溾攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹?             M脫DULOS DE ROLES                       鈹?
鈹溾攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹俥gresado  鈹? tutor   鈹俢oordinador鈹?  directivo       鈹?
鈹溾攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹?         M脫DULOS DE SOPORTE                         鈹?
鈹溾攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹?reports  鈹?  sync   鈹? admin   鈹?    help          鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹粹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
```

### Flujo de Datos

```
Usuario 鈫?Login 鈫?Autenticaci贸n 鈫?Sesi贸n
                              鈫?
                         Dashboard (seg煤n rol)
                              鈫?
              鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹尖攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
              鈫?              鈫?              鈫?
         Egresado          Tutor         Coordinador
              鈫?              鈫?              鈫?
    Plan/Tutor铆as   Tutorados/Planes   Entidades/Reportes
```

---

## 馃洜锔?TECNOLOG脥AS UTILIZADAS

### Frontend

| **Tecnolog铆a** | **Versi贸n** | **Uso** |
|----------------|-------------|---------|
| HTML5 | - | Estructura de la aplicaci贸n |
| CSS3 | - | Estilos y dise帽o responsive |
| JavaScript (ES6+) | - | L贸gica de la aplicaci贸n |
| Font Awesome | 6.5.1 | Iconos profesionales |
| Google Fonts (Inter) | - | Tipograf铆a moderna |

### Backend / Almacenamiento

| **Tecnolog铆a** | **Versi贸n** | **Uso** |
|----------------|-------------|---------|
| localStorage | - | Base de datos local (principal) |
| SQLite (sql.js) | 1.10.3 | Base de datos local (alternativa) |
| MySQL | 5.7+ | Base de datos en servidor (producci贸n) |

### Librer铆as

| **Librer铆a** | **Versi贸n** | **Uso** |
|--------------|-------------|---------|
| sql.js | 1.10.3 | Base de datos SQLite en navegador |
| jsPDF | 2.5.1 | Generaci贸n de reportes PDF |
| SheetJS (XLSX) | 0.20.1 | Exportaci贸n/Importaci贸n Excel |
| EmailJS | 4.x | Notificaciones por correo |

---

## 馃搧 ESTRUCTURA DEL PROYECTO

```
sispe/
鈹溾攢鈹€ index.html                 # Punto de entrada principal
鈹溾攢鈹€ manifest.json              # Configuraci贸n PWA
鈹溾攢鈹€ sw.js                      # Service Worker (offline)
鈹溾攢鈹€ offline.html               # P谩gina sin conexi贸n
鈹溾攢鈹€ icon-192.png               # Icono PWA 192x192
鈹溾攢鈹€ icon-512.png               # Icono PWA 512x512
鈹溾攢鈹€ icon-maskable-192.png      # Icono m谩scara 192x192
鈹溾攢鈹€ icon-maskable-512.png      # Icono m谩scara 512x512
鈹溾攢鈹€ .htaccess                  # Configuraci贸n servidor (MIME types)
鈹溾攢鈹€ README.md                  # Documentaci贸n del proyecto
鈹?
鈹溾攢鈹€ lib/                       # Librer铆as locales
鈹?  鈹溾攢鈹€ sql-wasm.js            # SQLite (sql.js)
鈹?  鈹溾攢鈹€ sql-wasm.wasm          # WebAssembly SQLite
鈹?  鈹溾攢鈹€ jspdf.umd.min.js       # jsPDF - PDFs
鈹?  鈹溾攢鈹€ xlsx.full.min.js       # SheetJS - Excel
鈹?  鈹斺攢鈹€ email.min.js           # EmailJS - Correos
鈹?
鈹溾攢鈹€ css/
鈹?  鈹斺攢鈹€ style.css              # Estilos globales
鈹?
鈹溾攢鈹€ js/
鈹?  鈹溾攢鈹€ app.js                 # Controlador principal
鈹?  鈹溾攢鈹€ config.js              # Configuraci贸n global
鈹?  鈹?
鈹?  鈹斺攢鈹€ modules/
鈹?      鈹溾攢鈹€ auth.js            # Autenticaci贸n y sesi贸n
鈹?      鈹溾攢鈹€ db.js              # Base de datos
鈹?      鈹溾攢鈹€ help.js            # Sistema de ayuda
鈹?      鈹溾攢鈹€ notifications.js   # Notificaciones y toasts
鈹?      鈹溾攢鈹€ sync.js            # Sincronizaci贸n offline/online
鈹?      鈹溾攢鈹€ reports.js         # Reportes y exportaciones
鈹?      鈹溾攢鈹€ admin.js           # Administraci贸n del sistema
鈹?      鈹溾攢鈹€ register.js        # Registro de usuarios
鈹?      鈹?
鈹?      鈹斺攢鈹€ roles/
鈹?          鈹溾攢鈹€ egresado.js    # M贸dulo del egresado
鈹?          鈹溾攢鈹€ tutor.js       # M贸dulo del tutor
鈹?          鈹溾攢鈹€ coordinador.js # M贸dulo del coordinador
鈹?          鈹斺攢鈹€ directivo.js   # M贸dulo del directivo
鈹?
鈹斺攢鈹€ assets/
    鈹斺攢鈹€ screenshots/
        鈹溾攢鈹€ login.png          # Captura de login
        鈹斺攢鈹€ dashboard.png      # Captura de dashboard
```

---

## 馃殌 INSTALACI脫N Y CONFIGURACI脫N

### Requisitos Previos

- **Servidor Web:** Apache, Nginx o cualquier servidor HTTP
- **Navegador:** Chrome, Edge, Firefox o Safari (versiones modernas)
- **Sistema Operativo:** Windows, Linux o macOS

### Pasos de Instalaci贸n

#### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sispe.git
cd sispe
```

#### 2. Configurar el servidor web

**Para XAMPP (Windows):**
```bash
# Copiar la carpeta sispe a htdocs
C:\xampp\htdocs\sispe\
```

**Para Apache (Linux):**
```bash
# Copiar la carpeta sispe al directorio web
sudo cp -r sispe /var/www/html/
```

#### 3. Descargar las librer铆as

```bash
# Crear la carpeta lib
mkdir lib

# Descargar librer铆as
curl -o lib/sql-wasm.js https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js
curl -o lib/sql-wasm.wasm https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm
curl -o lib/jspdf.umd.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
curl -o lib/xlsx.full.min.js https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
curl -o lib/email.min.js https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js
```

#### 4. Configurar EmailJS

Edita el archivo `js/config.js` con tus credenciales:

```javascript
EMAILJS: {
    PUBLIC_KEY: 'TU_PUBLIC_KEY',
    SERVICE_ID: 'TU_SERVICE_ID',
    TEMPLATE_ID_SISPE: 'TU_TEMPLATE_ID'
}
```

#### 5. Acceder a la aplicaci贸n

```bash
http://localhost/sispe/
```

---

## 馃懃 ROLES DEL SISTEMA

| **ID** | **Rol** | **Descripci贸n** |
|--------|---------|-----------------|
| 1 | **Administrador** | Control total del sistema |
| 2 | **Coordinador** | Gesti贸n de carreras y entidades |
| 3 | **Directivo** | Visualizaci贸n de su entidad |
| 4 | **Tutor** | Gesti贸n de tutorados y planes |
| 5 | **Egresado** | Plan personal y tutor铆as |

---

## 馃攽 USUARIOS DE PRUEBA

| **Rol** | **Usuario** | **Contrase帽a** | **Nombre** |
|---------|-------------|----------------|------------|
| 馃憫 Administrador | `admin` | `admin123` | Administrador |
| 馃懆鈥嶐煄?Egresado | `carlos.p` | `123456` | Carlos P茅rez |
| 馃懇鈥嶐煄?Egresado | `ana.r` | `123456` | Ana Rodr铆guez |
| 馃懆鈥嶐煄?Egresado | `luis.f` | `123456` | Luis Fern谩ndez |
| 馃懇鈥嶐煄?Egresado | `marta.c` | `123456` | Marta Castillo |
| 馃懆鈥嶐煄?Egresado | `jose.m` | `123456` | Jos茅 Mart铆nez |
| 馃懇鈥嶐煄?Egresado | `laura.d` | `123456` | Laura D铆az |
| 馃懆鈥嶐煄?Egresado | `miguel.t` | `123456` | Miguel Torres |
| 馃懇鈥嶐煄?Egresado | `sofia.r` | `123456` | Sof铆a Ramos |
| 馃鈥嶐煆?Tutor | `maria.g` | `123456` | Mar铆a G贸mez |
| 馃鈥嶐煆?Tutor | `pedro.r` | `123456` | Pedro Ram铆rez |
| 馃鈥嶐煆?Tutor | `juan.t` | `123456` | Juan Torres |
| 馃鈥嶐煆?Tutor | `roberto.d` | `123456` | Roberto D铆az |
| 馃鈥嶐煆?Tutor | `elena.s` | `123456` | Elena S谩nchez |
| 馃搵 Coordinador | `coord1` | `123456` | Coordinador Carrera |
| 馃彚 Directivo | `directivo1` | `123456` | Directivo Entidad |
| 馃И Prueba | `test` | `123456` | Usuario Prueba |

---

## 馃摫 PWA (Aplicaci贸n Web Progresiva)

SISPE es una **Aplicaci贸n Web Progresiva (PWA)** que permite:

- 鉁?**Instalaci贸n** en el dispositivo m贸vil como aplicaci贸n nativa
- 鉁?**Funcionamiento offline** sin conexi贸n a internet
- 鉁?**Notificaciones push**
- 鉁?**Icono en pantalla de inicio**
- 鉁?**Actualizaciones autom谩ticas**

### Instalar la PWA

1. **Abrir** `http://localhost/sispe/` en Chrome o Edge
2. **Abrir el men煤** (tres puntos) 鈫?**"Instalar aplicaci贸n"**
3. **Seguir** las instrucciones en pantalla
4. **La aplicaci贸n** aparecer谩 en tu escritorio o pantalla de inicio

---

## 馃搳 BASE DE DATOS

### Esquema Principal

```sql
-- Tabla de Roles
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellidos TEXT,
    rol_id INTEGER NOT NULL,
    activo BOOLEAN DEFAULT 1,
    verificado BOOLEAN DEFAULT 0,
    ultimo_acceso DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- ... (resto de tablas en database/schema.sql)
```

### Tablas del Sistema

| **Tabla** | **Descripci贸n** |
|-----------|-----------------|
| `roles` | Roles del sistema |
| `usuarios` | Usuarios autenticados |
| `entidades` | Empresas/organismos empleadores |
| `carreras` | Carreras universitarias |
| `graduados` | Lista oficial de graduados UIJ |
| `docentes` | Lista oficial de docentes UIJ |
| `egresados` | Perfiles de egresados |
| `tutores` | Perfiles de tutores |
| `coordinadores` | Perfiles de coordinadores |
| `directivos` | Perfiles de directivos |
| `planes_superacion` | Planes personalizados |
| `acciones_plan` | Acciones del plan |
| `tutorias` | Registro de tutor铆as |
| `evaluaciones` | Evaluaciones de competencias |
| `evidencias` | Evidencias subidas |
| `notificaciones` | Notificaciones del sistema |
| `sincronizacion` | Sincronizaci贸n offline/online |

---

## 馃摜 IMPORTACI脫N Y EXPORTACI脫N DE DATOS

### Formatos Soportados

| **Operaci贸n** | **Formato** | **Descripci贸n** |
|---------------|-------------|-----------------|
| Importaci贸n | `.xlsx`, `.xls` | Excel (SheetJS) |
| Exportaci贸n | `.xlsx` | Excel (SheetJS) |
| Exportaci贸n | `.pdf` | PDF (jsPDF) |

### Plantillas Excel Disponibles

| **Plantilla** | **Columnas** | **Uso** |
|---------------|--------------|---------|
| Usuarios | username, password, email, nombre, apellidos, rol_id | Importar usuarios masivamente |
| Graduados | numero_identidad, nombre, apellidos, carrera_id, anio_graduacion | Lista oficial de graduados |
| Docentes | numero_identidad, nombre, apellidos, email_institucional, departamento | Lista oficial de docentes |
| Entidades | nombre, sector, representante, telefono, logo | Empresas y organismos |

---

## 馃摟 CONFIGURACI脫N DE EMAILJS

### Credenciales de Prueba

```javascript
EMAILJS: {
    PUBLIC_KEY: '-lS0TtNoFq0fQwCEF',
    SERVICE_ID: 'service_ud0ryy7',
    TEMPLATE_ID_SISPE: 'template_uf9imjr'
}
```

### Plantilla de Correo

La plantilla `template_uf9imjr` debe tener las siguientes variables:

| **Variable** | **Descripci贸n** |
|--------------|-----------------|
| `{{nombre}}` | Nombre del destinatario |
| `{{asunto}}` | Asunto del correo |
| `{{mensaje}}` | Cuerpo del mensaje |
| `{{url}}` | Enlace a la aplicaci贸n |
| `{{fecha}}` | Fecha del env铆o |
| `{{rol}}` | Rol del usuario |

---

## 馃 CONTRIBUIR

Si deseas contribuir al proyecto SISPE:

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Gu铆a de Estilo de C贸digo

- Usa **JavaScript ES6+**
- Indentaci贸n con **2 espacios**
- Nombres de variables en **camelCase**
- Comentarios en **espa帽ol**
- Mant茅n los archivos **sin acentos** para evitar problemas de codificaci贸n

---

## 馃搫 LICENCIA

Este proyecto est谩 bajo la Licencia **MIT**.

```
MIT License

Copyright (c) 2026 Ricardo Castillo Vald茅s

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 馃摓 CONTACTO

| **Elemento** | **Informaci贸n** |
|--------------|-----------------|
| **Desarrollado por** | Ricardo Castillo Vald茅s |
| **Email** | 3sayricardo@gmail.com |
| **WhatsApp** | +53 55031725 |
| **Instituci贸n** | UIJ - Universidad de la Isla de la Juventud |
| **A帽o** | 2026 |

---

## 馃檹 AGRADECIMIENTOS

- **UIJ - Universidad de la Isla de la Juventud** por el apoyo institucional
- **Ministerio de Educaci贸n Superior (MES)** por los lineamientos y pol铆ticas
- **Tutores y especialistas** que han colaborado en la validaci贸n del sistema
- **Todos los usuarios** que han participado en las pruebas y mejoras

---

## 馃搳 ESTADO DEL PROYECTO

| **M贸dulo** | **Estado** |
|------------|------------|
| Login | 鉁?Completado |
| Egresado | 鉁?Completado |
| Tutor | 鉁?Completado |
| Coordinador | 鉁?Completado |
| Directivo | 鉁?Completado |
| Administrador | 鉁?Completado |
| Importaci贸n Excel | 鉁?Completado |
| Exportaci贸n Excel | 鉁?Completado |
| PWA | 鉁?Completado |
| Registro de Usuarios | 猬?En Desarrollo |
| Reportes PDF | 猬?Planificado |
| Sincronizaci贸n MySQL | 猬?Planificado |

---

## 馃敆 ENLACES 脷TILES

- [Documentaci贸n del Proyecto](DOCUMENTACION.md)
- [Gu铆a de Usuario](GUIA_USUARIO.md)
- [API Reference](API.md)
- [Reporte de Bugs](https://github.com/tu-usuario/sispe/issues)

---

**馃摎 SISPE - Sistema de Preparaci贸n para el Empleo**  
*漏 2026 - Todos los derechos reservados*

---

猸?**Si te gusta este proyecto, no olvides darle una estrella en GitHub!** 猸?
```

---

## 馃搵 **INSTRUCCIONES**

1. **Crea el archivo** `README.md` en la ra铆z del proyecto
2. **Copia y pega** el contenido de arriba
3. **Guarda** el archivo
4. **Sube** a GitHub con:

```bash
git add README.md
git commit -m "馃摑 A帽adir README.md completo"
git push
```

