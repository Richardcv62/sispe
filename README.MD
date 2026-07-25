```markdown
# 📚 SISPE - Sistema de Preparación para el Empleo

Sistema integral para la superación profesional de recién graduados universitarios, desarrollado como parte del Proyecto Universidad-Sociedad de la Universidad de la Isla de la Juventud.

---

## 📋 Descripción

SISPE es una aplicación web progresiva (PWA) que permite gestionar el proceso de preparación para el empleo de los egresados universitarios. La plataforma facilita la interacción entre egresados, tutores, coordinadores y directivos, permitiendo el seguimiento personalizado de cada profesional en su inserción laboral.

### Características principales

- **Gestión de usuarios** con roles diferenciados (Administrador, Coordinador, Directivo, Tutor, Egresado)
- **Planes de superación personalizados** para cada egresado
- **Sistema de tutorías** con seguimiento y evaluación
- **Gestión de competencias** profesionales
- **Catálogo de cursos y eventos** de capacitación
- **Base de datos SQLite** con soporte offline
- **Exportación de reportes** en PDF y Excel
- **Notificaciones por correo** a través de EmailJS
- **Diseño responsive** para dispositivos móviles y desktop

---

## 🏛️ Contexto del Proyecto

SISPE está alineado con el **Proyecto Universidad-Sociedad** de la UIJ, cuyo objetivo es fortalecer el vínculo entre la universidad y las entidades laborales del territorio para la formación continua de los profesionales.

El sistema integra:

- **29 entidades** del territorio (empresas y organismos)
- **7 carreras** universitarias
- **24 investigadores** del proyecto
- **11 objetivos estratégicos** del proyecto
- **15 competencias** profesionales

---

## 🗂️ Estructura del Proyecto

```
sispe/
├── index.html                 # Página principal
├── manifest.json              # Configuración PWA
├── sw.js                      # Service Worker
├── offline.html               # Página sin conexión
├── crearBaseDatosSQLite.html  # Gestor de base de datos
├── icon-*.png                 # Iconos de la aplicación
├── css/
│   └── style.css              # Estilos globales
├── js/
│   ├── app.js                 # Controlador principal
│   ├── config.js              # Configuración global
│   ├── emojis.js              # Librería de emojis
│   └── modules/
│       ├── db.js              # Capa de base de datos SQLite
│       ├── auth.js            # Autenticación
│       ├── admin.js           # Módulo de administración
│       ├── notifications.js   # Notificaciones
│       ├── reports.js         # Reportes
│       ├── sync.js            # Sincronización offline
│       ├── register.js        # Registro de usuarios
│       ├── help.js            # Ayuda
│       ├── competencias.js    # Gestión de competencias
│       ├── cursos.js          # Gestión de cursos
│       ├── eventos.js         # Gestión de eventos
│       ├── proyecto.js        # Proyecto Universidad-Sociedad
│       ├── investigadores.js  # Gestión de investigadores
│       └── roles/
│           ├── egresado.js    # Módulo del egresado
│           ├── tutor.js       # Módulo del tutor
│           ├── coordinador.js # Módulo del coordinador
│           └── directivo.js   # Módulo del directivo
├── lib/
│   ├── sql-wasm.js            # SQLite WebAssembly
│   ├── sql-wasm.wasm          # Binario SQLite
│   ├── jspdf.umd.min.js       # Generación de PDF
│   ├── xlsx.full.min.js       # Exportación a Excel
│   └── email.min.js           # EmailJS
└── README.md
```

---

## 🚀 Instalación y Configuración

### Requisitos previos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (opcional, para desarrollo)

### Pasos de instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/sispe.git
cd sispe
```

2. **Verificar la estructura de archivos**

Asegúrate de que todos los archivos y carpetas estén en su lugar.

3. **Crear la base de datos**

Abre en el navegador el archivo:

```
crearBaseDatosSQLite.html
```

4. **Haz clic en "Limpiar y Recrear BD"**

Espera a que el proceso termine. Esto creará todas las tablas e insertará los datos iniciales.

5. **Descargar el archivo de base de datos**

Haz clic en **"Descargar .db"** y coloca el archivo `sispe.db` en la raíz del proyecto.

6. **Abrir la aplicación**

Abre `index.html` en tu navegador.

---

## 🔑 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| carlos.p | 123456 | Egresado |
| ana.r | 123456 | Egresado |
| maria.g | 123456 | Tutor |
| pedro.r | 123456 | Tutor |
| coord1 | 123456 | Coordinador |
| directivo1 | 123456 | Directivo |

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Descripción |
|------------|-------------|
| HTML5 | Estructura de la aplicación |
| CSS3 | Estilos y diseño responsive |
| JavaScript (ES6+) | Lógica de la aplicación |
| SQLite (sql.js) | Base de datos local |
| Font Awesome | Iconos profesionales |
| Google Fonts (Inter) | Tipografía moderna |
| jsPDF | Generación de PDF |
| SheetJS (XLSX) | Exportación a Excel |
| EmailJS | Envío de correos |
| PWA | Aplicación web progresiva |

---

## 📊 Base de Datos

SISPE utiliza SQLite a través de la librería sql.js, lo que permite:

- **Base de datos local** en el navegador
- **Funcionamiento offline** sin conexión a internet
- **Persistencia** mediante archivo `.db`
- **26 tablas** que cubren toda la lógica del sistema

### Principales tablas

| Tabla | Descripción |
|-------|-------------|
| roles | Roles del sistema |
| usuarios | Usuarios del sistema |
| entidades | Empresas y organismos |
| carreras | Carreras universitarias |
| graduados | Lista oficial de graduados |
| docentes | Lista oficial de docentes |
| egresados | Perfiles de egresados |
| tutores | Perfiles de tutores |
| planes_superacion | Planes personalizados |
| acciones_plan | Acciones de cada plan |
| tutorias | Registro de tutorías |
| evaluaciones | Evaluaciones de competencias |
| competencias | Catálogo de competencias |
| cursos | Catálogo de cursos |
| eventos | Catálogo de eventos |
| objetivos_proyecto | Objetivos del proyecto |

---

## 📱 Funcionalidades por Rol

### Administrador
- Gestión completa de usuarios, graduados, docentes, entidades y carreras
- Asignación de tutores a egresados
- Gestión de competencias, cursos y eventos
- Visualización de investigadores del proyecto
- Reportes del sistema

### Coordinador
- Dashboard con estadísticas generales
- Gestión de planes de superación
- Visualización de entidades vinculadas
- Reportes por carrera y entidad

### Directivo
- Dashboard de su entidad
- Visualización de egresados y planes
- Estadísticas de su entidad

### Tutor
- Gestión de sus egresados asignados
- Registro de tutorías
- Evaluación de egresados
- Asignación de nuevos egresados

### Egresado
- Dashboard personal
- Visualización de su plan de superación
- Solicitud y visualización de tutorías
- Subida de evidencias
- Autoevaluación

---

## 📝 Licencia

Este proyecto es de uso académico y fue desarrollado como parte de la tesis de grado en la Universidad de la Isla de la Juventud.

---

## 👨‍💻 Desarrollador

**Ricardo Castillo Valdés**

- 📧 Email: 3sayricardo@gmail.com
- 📱 WhatsApp: +53 55031725

---

## 🏛️ Institución

**UIJ - Universidad de la Isla de la Juventud**
*Carretera Aeropuerto Km 3 ½, Isla de la Juventud, Cuba*

---

## 📅 Versión

**v1.0** - 2026

---

## 🙏 Agradecimientos

A la Dra. C. Magdalena Moreno Martínez, Jefa del Proyecto Universidad-Sociedad, y a todos los investigadores que han contribuido con su conocimiento y experiencia para el desarrollo de este sistema.

---

> *SISPE - Sistema de Preparación para el Empleo*  
> *"Transformando la preparación profesional de nuestros graduados"*
```

---

## 📋 Resumen del README

| Sección | Contenido |
|---------|-----------|
| Título | Nombre del proyecto con emoji |
| Descripción | Explicación general del sistema |
| Características | Lista de funcionalidades principales |
| Contexto | Relación con el proyecto Universidad-Sociedad |
| Estructura | Árbol de directorios |
| Instalación | Pasos para poner en marcha |
| Usuarios de prueba | Credenciales para probar |
| Tecnologías | Stack tecnológico utilizado |
| Base de datos | Explicación de SQLite y tablas |
| Roles | Funcionalidades por cada rol |
| Licencia | Información legal |
| Desarrollador | Datos de contacto |
| Agradecimientos | Créditos al equipo del proyecto |

