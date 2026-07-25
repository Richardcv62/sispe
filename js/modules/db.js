// ============================================================
// SISPE - db.js
// Módulo de Base de Datos SQLite (USANDO CDN)
// RUTA: js/modules/db.js
// ============================================================

const DBModule = (function() {
    'use strict';

    // ---- VARIABLES PRIVADAS ----
    let dbInstance = null;
    let SQL = null;
    let dbInitialized = false;
    let dbReady = false;

    // ---- NOMBRES DE TABLAS ----
    const TABLES = {
        ROLES: 'roles',
        USUARIOS: 'usuarios',
        ENTIDADES: 'entidades',
        CARRERAS: 'carreras',
        GRADUADOS: 'graduados',
        DOCENTES: 'docentes',
        EGRESADOS: 'egresados',
        TUTORES: 'tutores',
        COORDINADORES: 'coordinadores',
        DIRECTIVOS: 'directivos',
        PLANES: 'planes_superacion',
        ACCIONES: 'acciones_plan',
        TUTORIAS: 'tutorias',
        EVALUACIONES: 'evaluaciones',
        EVIDENCIAS: 'evidencias',
        NOTIFICACIONES: 'notificaciones',
        DIAGNOSTICOS: 'diagnosticos',
        REPORTES: 'reportes',
        CONFIGURACION: 'configuracion',
        SINCRONIZACION: 'sincronizacion',
        COMPETENCIAS: 'competencias',
        CURSOS: 'cursos',
        EVENTOS: 'eventos',
        EGRESADOS_CURSOS: 'egresados_cursos',
        EGRESADOS_EVENTOS: 'egresados_eventos',
        COMPETENCIAS_EVALUADAS: 'competencias_evaluadas',
        OBJETIVOS_PROYECTO: 'objetivos_proyecto',
        PRODUCTOS_CIENTIFICOS: 'productos_cientificos',
        TRABAJOS_ESTUDIANTES: 'trabajos_estudiantes',
        DIMENSIONES_EVALUACION: 'dimensiones_evaluacion'
    };

    // ============================================================
    // INICIALIZAR SQLITE (DESDE CDN)
    // ============================================================
    function init() {
        return new Promise(function(resolve, reject) {
            if (dbInitialized && dbReady) {
                resolve(true);
                return;
            }

            // Cargar SQLite desde CDN
            loadSQLiteFromCDN()
                .then(function(sqlModule) {
                    SQL = sqlModule;
                    dbInstance = new SQL.Database();
                    dbReady = true;
                    dbInitialized = true;
                    console.log('✅ SQLite inicializado correctamente desde CDN');
                    resolve(true);
                })
                .catch(function(error) {
                    console.error('❌ Error al cargar SQLite:', error);
                    reject(error);
                });
        });
    }

    // ============================================================
    // CARGAR SQLITE DESDE CDN
    // ============================================================
    function loadSQLiteFromCDN() {
        return new Promise(function(resolve, reject) {
            // Verificar si ya está cargado
            if (typeof initSqlJs !== 'undefined') {
                // Usar la versión ya cargada
                initSqlJs({
                    locateFile: function(filename) {
                        return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + filename;
                    }
                })
                .then(resolve)
                .catch(reject);
                return;
            }

            // Cargar desde CDN con script
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
            script.onload = function() {
                if (typeof initSqlJs !== 'undefined') {
                    initSqlJs({
                        locateFile: function(filename) {
                            return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + filename;
                        }
                    })
                    .then(resolve)
                    .catch(reject);
                } else {
                    reject(new Error('initSqlJs no está disponible después de cargar el script'));
                }
            };
            script.onerror = function() {
                reject(new Error('No se pudo cargar SQLite desde CDN'));
            };
            document.head.appendChild(script);
        });
    }

    // ============================================================
    // VERIFICAR SI LA BD ESTÁ LISTA
    // ============================================================
    function isReady() {
        return dbReady && dbInitialized;
    }

    // ============================================================
    // OBTENER CONEXIÓN
    // ============================================================
    function getConnection() {
        return dbInstance;
    }

    // ============================================================
    // EJECUTAR SQL (SIN PARÁMETROS)
    // ============================================================
    function execSQL(sql) {
        return new Promise(function(resolve, reject) {
            if (!dbReady || !dbInstance) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            try {
                dbInstance.run(sql);
                resolve();
            } catch (error) {
                console.error('❌ Error en execSQL:', error);
                reject(error);
            }
        });
    }

    // ============================================================
    // CONSULTAR SQL (SIN PARÁMETROS)
    // ============================================================
    function querySQL(sql) {
        return new Promise(function(resolve, reject) {
            if (!dbReady || !dbInstance) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            try {
                const stmt = dbInstance.prepare(sql);
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                resolve(results);
            } catch (error) {
                console.error('❌ Error en querySQL:', error);
                reject(error);
            }
        });
    }

    // ============================================================
    // EJECUTAR SQL CON PARÁMETROS
    // ============================================================
    function execute(sql, params) {
        return new Promise(function(resolve, reject) {
            if (!dbReady || !dbInstance) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            try {
                let finalSql = sql;
                if (params && params.length > 0) {
                    for (let i = 0; i < params.length; i++) {
                        const value = typeof params[i] === 'string' ? "'" + params[i] + "'" : params[i];
                        finalSql = finalSql.replace('?', value);
                    }
                }
                dbInstance.run(finalSql);
                resolve({ changes: 1 });
            } catch (error) {
                console.error('❌ Error en execute:', error);
                reject(error);
            }
        });
    }

    // ============================================================
    // CONSULTAR SQL CON PARÁMETROS
    // ============================================================
    function query(sql, params) {
        return new Promise(function(resolve, reject) {
            if (!dbReady || !dbInstance) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            try {
                let finalSql = sql;
                if (params && params.length > 0) {
                    for (let i = 0; i < params.length; i++) {
                        const value = typeof params[i] === 'string' ? "'" + params[i] + "'" : params[i];
                        finalSql = finalSql.replace('?', value);
                    }
                }
                const stmt = dbInstance.prepare(finalSql);
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                resolve(results);
            } catch (error) {
                console.error('❌ Error en query:', error);
                reject(error);
            }
        });
    }

    // ============================================================
    // EXPORTAR BD
    // ============================================================
    function exportDB() {
        return new Promise(function(resolve, reject) {
            if (!dbReady || !dbInstance) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            try {
                const data = dbInstance.export();
                const blob = new Blob([data], { type: 'application/x-sqlite3' });
                resolve(blob);
            } catch (error) {
                reject(error);
            }
        });
    }

    // ============================================================
    // DESCARGAR BD
    // ============================================================
    function downloadDB(filename) {
        filename = filename || 'sispe.db';
        return new Promise(function(resolve, reject) {
            if (!dbReady || !dbInstance) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            try {
                const data = dbInstance.export();
                const blob = new Blob([data], { type: 'application/x-sqlite3' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    // ============================================================
    // CREAR BASE DE DATOS (TABLAS Y DATOS INICIALES)
    // ============================================================
    function createDatabase() {
        return new Promise(async function(resolve, reject) {
            if (!dbReady || !dbInstance) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }

            try {
                console.log('📋 Creando tablas...');

                // ============================================================
                // CREAR TABLAS PRINCIPALES
                // ============================================================

                // 1. roles
                await execSQL(`CREATE TABLE IF NOT EXISTS roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT UNIQUE NOT NULL,
                    descripcion TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 2. usuarios
                await execSQL(`CREATE TABLE IF NOT EXISTS usuarios (
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
                );`);

                // 3. entidades
                await execSQL(`CREATE TABLE IF NOT EXISTS entidades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    sector TEXT,
                    direccion TEXT,
                    telefono TEXT,
                    email_contacto TEXT,
                    representante TEXT,
                    logo TEXT,
                    convenio_fecha_inicio DATE,
                    convenio_fecha_fin DATE,
                    convenio_estado TEXT DEFAULT 'activo',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME
                );`);

                // 4. carreras
                await execSQL(`CREATE TABLE IF NOT EXISTS carreras (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT UNIQUE NOT NULL,
                    codigo TEXT UNIQUE,
                    descripcion TEXT,
                    duracion_anios INTEGER DEFAULT 5,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME
                );`);

                // 5. graduados
                await execSQL(`CREATE TABLE IF NOT EXISTS graduados (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numero_identidad TEXT UNIQUE NOT NULL,
                    nombre TEXT NOT NULL,
                    apellidos TEXT NOT NULL,
                    carrera_id INTEGER NOT NULL,
                    anio_graduacion INTEGER NOT NULL,
                    email_institucional TEXT,
                    titulo_oro BOOLEAN DEFAULT 0,
                    graduado_integral BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (carrera_id) REFERENCES carreras(id)
                );`);

                // 6. docentes
                await execSQL(`CREATE TABLE IF NOT EXISTS docentes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numero_identidad TEXT UNIQUE NOT NULL,
                    nombre TEXT NOT NULL,
                    apellidos TEXT NOT NULL,
                    email_institucional TEXT,
                    departamento TEXT,
                    categoria_docente TEXT,
                    categoria_cientifica TEXT,
                    es_investigador_proyecto BOOLEAN DEFAULT 0,
                    rol_proyecto TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 7. tutores
                await execSQL(`CREATE TABLE IF NOT EXISTS tutores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER UNIQUE NOT NULL,
                    docente_id INTEGER,
                    entidad_id INTEGER NOT NULL,
                    categoria TEXT,
                    especialidad TEXT,
                    anios_experiencia INTEGER,
                    max_egresados INTEGER DEFAULT 5,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (docente_id) REFERENCES docentes(id),
                    FOREIGN KEY (entidad_id) REFERENCES entidades(id)
                );`);

                // 8. egresados
                await execSQL(`CREATE TABLE IF NOT EXISTS egresados (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER UNIQUE NOT NULL,
                    carrera_id INTEGER NOT NULL,
                    entidad_id INTEGER NOT NULL,
                    tutor_id INTEGER,
                    anio_graduacion INTEGER,
                    titulo_oro BOOLEAN DEFAULT 0,
                    graduado_integral BOOLEAN DEFAULT 0,
                    proyecto_investigacion TEXT,
                    premios_cientificos TEXT,
                    intereses_profesionales TEXT,
                    areas_mejora TEXT,
                    avatar TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
                    FOREIGN KEY (entidad_id) REFERENCES entidades(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
                );`);

                // 9. coordinadores
                await execSQL(`CREATE TABLE IF NOT EXISTS coordinadores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER UNIQUE NOT NULL,
                    carrera_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (carrera_id) REFERENCES carreras(id)
                );`);

                // 10. directivos
                await execSQL(`CREATE TABLE IF NOT EXISTS directivos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER UNIQUE NOT NULL,
                    entidad_id INTEGER NOT NULL,
                    cargo TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (entidad_id) REFERENCES entidades(id)
                );`);

                // 11. planes_superacion
                await execSQL(`CREATE TABLE IF NOT EXISTS planes_superacion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tutor_id INTEGER,
                    coordinador_id INTEGER,
                    anio_plan INTEGER NOT NULL,
                    estado TEXT DEFAULT 'activo',
                    progreso INTEGER DEFAULT 0,
                    fecha_inicio DATE,
                    fecha_fin_estimada DATE,
                    fecha_fin_real DATE,
                    observaciones TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id),
                    FOREIGN KEY (coordinador_id) REFERENCES coordinadores(id)
                );`);

                // 12. acciones_plan
                await execSQL(`CREATE TABLE IF NOT EXISTS acciones_plan (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    plan_id INTEGER NOT NULL,
                    titulo TEXT NOT NULL,
                    descripcion TEXT,
                    tipo TEXT,
                    estado TEXT DEFAULT 'pendiente',
                    fecha_programada DATE,
                    fecha_limite DATE,
                    fecha_completado DATE,
                    recursos TEXT,
                    icono TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (plan_id) REFERENCES planes_superacion(id)
                );`);

                // 13. tutorias
                await execSQL(`CREATE TABLE IF NOT EXISTS tutorias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tutor_id INTEGER NOT NULL,
                    fecha DATE NOT NULL,
                    resumen TEXT NOT NULL,
                    acuerdos TEXT,
                    proxima_tutoria DATE,
                    estado TEXT DEFAULT 'solicitada',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
                );`);

                // 14. evaluaciones
                await execSQL(`CREATE TABLE IF NOT EXISTS evaluaciones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tutor_id INTEGER,
                    tipo TEXT,
                    dimension TEXT,
                    puntaje INTEGER CHECK (puntaje BETWEEN 1 AND 5),
                    comentario TEXT,
                    fecha DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
                );`);

                // 15. evidencias
                await execSQL(`CREATE TABLE IF NOT EXISTS evidencias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tipo TEXT,
                    titulo TEXT NOT NULL,
                    descripcion TEXT,
                    archivo TEXT,
                    url TEXT,
                    fecha_subida DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id)
                );`);

                // 16. notificaciones
                await execSQL(`CREATE TABLE IF NOT EXISTS notificaciones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    tipo TEXT,
                    mensaje TEXT NOT NULL,
                    leida BOOLEAN DEFAULT 0,
                    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
                    fecha_leida DATETIME,
                    url TEXT,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                );`);

                // 17-26. Resto de tablas
                await execSQL(`CREATE TABLE IF NOT EXISTS diagnosticos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tipo TEXT,
                    datos JSON,
                    fecha_aplicacion DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id)
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS reportes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    tipo TEXT,
                    nombre TEXT NOT NULL,
                    datos JSON,
                    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS configuracion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    clave TEXT UNIQUE NOT NULL,
                    valor TEXT,
                    descripcion TEXT,
                    updated_at DATETIME
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS sincronizacion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tabla TEXT NOT NULL,
                    registro_id INTEGER NOT NULL,
                    operacion TEXT,
                    fecha_sincronizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    sincronizado BOOLEAN DEFAULT 0,
                    uuid TEXT UNIQUE NOT NULL
                );`);

                // Tablas nuevas
                await execSQL(`CREATE TABLE IF NOT EXISTS competencias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    descripcion TEXT,
                    dimension TEXT,
                    categoria TEXT,
                    nivel_esperado INTEGER DEFAULT 3,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS cursos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titulo TEXT NOT NULL,
                    descripcion TEXT,
                    tipo TEXT,
                    modalidad TEXT,
                    duracion_horas INTEGER,
                    nivel TEXT,
                    entidad_organizadora TEXT,
                    fecha_inicio DATE,
                    fecha_fin DATE,
                    competencias_ids TEXT,
                    requisitos TEXT,
                    costo TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS eventos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    descripcion TEXT,
                    tipo TEXT,
                    fecha_inicio DATE,
                    fecha_fin DATE,
                    lugar TEXT,
                    entidad_organizadora TEXT,
                    url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS egresados_cursos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    curso_id INTEGER NOT NULL,
                    fecha_inicio DATE,
                    fecha_fin DATE,
                    estado TEXT DEFAULT 'inscrito',
                    calificacion REAL,
                    certificado_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (curso_id) REFERENCES cursos(id)
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS egresados_eventos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    evento_id INTEGER NOT NULL,
                    rol TEXT,
                    fecha_participacion DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (evento_id) REFERENCES eventos(id)
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS competencias_evaluadas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    competencia_id INTEGER NOT NULL,
                    evaluador_id INTEGER,
                    puntaje INTEGER CHECK (puntaje BETWEEN 1 AND 5),
                    nivel TEXT,
                    evidencia TEXT,
                    fecha_evaluacion DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (competencia_id) REFERENCES competencias(id)
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS objetivos_proyecto (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numero INTEGER NOT NULL,
                    descripcion TEXT NOT NULL,
                    estado TEXT DEFAULT 'pendiente',
                    fecha_inicio DATE,
                    fecha_fin_estimada DATE,
                    fecha_fin_real DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS productos_cientificos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tipo TEXT NOT NULL,
                    titulo TEXT NOT NULL,
                    autores TEXT,
                    revista_evento TEXT,
                    fecha_publicacion DATE,
                    url TEXT,
                    estado TEXT DEFAULT 'en_elaboracion',
                    docente_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (docente_id) REFERENCES docentes(id)
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS trabajos_estudiantes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tipo TEXT NOT NULL,
                    titulo TEXT NOT NULL,
                    egresado_id INTEGER NOT NULL,
                    tutor_id INTEGER,
                    entidad_id INTEGER NOT NULL,
                    carrera_id INTEGER NOT NULL,
                    anio INTEGER NOT NULL,
                    problema_solucionado TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id),
                    FOREIGN KEY (entidad_id) REFERENCES entidades(id),
                    FOREIGN KEY (carrera_id) REFERENCES carreras(id)
                );`);

                await execSQL(`CREATE TABLE IF NOT EXISTS dimensiones_evaluacion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    descripcion TEXT,
                    indicadores TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                console.log('✅ Tablas creadas correctamente');

                // ============================================================
                // INSERTAR DATOS INICIALES
                // ============================================================
                console.log('📝 Insertando datos iniciales...');

                // Roles
                await execSQL(`INSERT OR REPLACE INTO roles (id, nombre, descripcion) VALUES
                    (1, 'administrador', 'Superadministrador del sistema - UIJ'),
                    (2, 'coordinador', 'Coordinador de Carrera'),
                    (3, 'directivo', 'Directivo de Entidad'),
                    (4, 'tutor', 'Tutor de Egresados'),
                    (5, 'egresado', 'Recién Graduado');`);

                // Admin
                await execSQL(`INSERT OR REPLACE INTO usuarios (id, username, password, email, nombre, apellidos, rol_id, activo, verificado) VALUES
                    (1, 'admin', 'admin123', 'admin@sispe.com', 'Administrador', 'Sistema', 1, 1, 1);`);

                // Usuarios de prueba
                await execSQL(`INSERT OR REPLACE INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo, verificado) VALUES
                    ('carlos.p', '123456', 'carlos@sispe.com', 'Carlos', 'Pérez', 5, 1, 1),
                    ('ana.r', '123456', 'ana@sispe.com', 'Ana', 'Rodríguez', 5, 1, 1),
                    ('maria.g', '123456', 'maria@sispe.com', 'María', 'Gómez', 4, 1, 1),
                    ('pedro.r', '123456', 'pedro@sispe.com', 'Pedro', 'Ramírez', 4, 1, 1),
                    ('coord1', '123456', 'coord1@sispe.com', 'Coordinador', 'Carrera', 2, 1, 1),
                    ('directivo1', '123456', 'directivo1@sispe.com', 'Directivo', 'Entidad', 3, 1, 1);`);

                // Entidades (29)
                await execSQL(`INSERT OR REPLACE INTO entidades (id, nombre, sector, logo) VALUES
                    (1, 'Hotel El Colony', 'Turismo', '🏨'),
                    (2, 'Hotel Villa Miramar', 'Turismo', '🏖️'),
                    (3, 'Hotel Internacional', 'Turismo', '🌊'),
                    (4, 'Agencia de Viajes Cubatur', 'Turismo', '✈️'),
                    (5, 'Agencia de Viajes Caracol', 'Turismo', '🚌'),
                    (6, 'Cadena Hotelera Islazul', 'Turismo', '🏝️'),
                    (7, 'Empresa Agroindustrial Jesús Montané Oropesa', 'Agroindustria', '🌾'),
                    (8, 'Empresa Logística Agropecuaria', 'Agroindustria', '🚜'),
                    (9, 'Empresa Municipal de la Industria Alimenticia', 'Industria Alimenticia', '🥫'),
                    (10, 'Empresa Eléctrica OBE', 'Energía', '⚡'),
                    (11, 'ETECSA', 'Comunicaciones', '📡'),
                    (12, 'Desoft', 'Comunicaciones', '💻'),
                    (13, 'UEB Servicios Informáticos EIMAG', 'Comunicaciones', '🖥️'),
                    (14, 'Empresa Geominera', 'Minería', '⛏️'),
                    (15, 'Empresa Pesquera Industrial', 'Pesca', '🐟'),
                    (16, 'Empresa de Recuperación de Materias Primas', 'Reciclaje', '♻️'),
                    (17, 'Labiofam', 'Salud', '💊'),
                    (18, 'U/P Municipal Dirección de Educación', 'Educación', '📚'),
                    (19, 'Universidad de la Isla de la Juventud', 'Educación', '🎓'),
                    (20, 'Tribunal Especial Popular', 'Justicia', '⚖️'),
                    (21, 'Fiscalía Municipal Especial', 'Justicia', '📜'),
                    (22, 'Bufete Colectivo', 'Justicia', '📋'),
                    (23, 'Dirección Municipal de Justicia', 'Justicia', '🏛️'),
                    (24, 'Asociación Nacional de Economistas ANEC', 'Economía', '📊'),
                    (25, 'Dirección Municipal de Finanzas y Precios', 'Economía', '💰'),
                    (26, 'Oficina ONEI', 'Economía', '📈'),
                    (27, 'Dirección Municipal de Comercio', 'Economía', '🛒'),
                    (28, 'Delegación Territorial CITMA', 'Ciencia', '🔬'),
                    (29, 'Contraloría Municipal', 'Control', '🔍');`);

                // Carreras (7)
                await execSQL(`INSERT OR REPLACE INTO carreras (id, nombre, codigo, duracion_anios) VALUES
                    (1, 'Licenciatura en Derecho', 'LDE-5', 5),
                    (2, 'Licenciatura en Contabilidad', 'LCO-4', 4),
                    (3, 'Ingeniería Informática', 'II-5', 5),
                    (4, 'Ingeniería Agrónoma', 'IA-5', 5),
                    (5, 'Licenciatura en Inglés', 'LIN-4', 4),
                    (6, 'Licenciatura en Cultura Física', 'LCF-4', 4),
                    (7, 'Licenciatura en Pedagogía-Psicología', 'LPP-5', 5);`);

                // Investigadores (24) - resumido
                await execSQL(`INSERT OR REPLACE INTO docentes (id, numero_identidad, nombre, apellidos, email_institucional, categoria_cientifica, es_investigador_proyecto, rol_proyecto) VALUES
                    (1, '70010112345', 'Magdalena', 'Moreno Martínez', 'mmorenom@uij.edu.cu', 'Dr.C', 1, 'Jefa del Proyecto'),
                    (2, '71010223456', 'José Rolando', 'Vázquez Labrada', 'jrvazquez@uij.edu.cu', 'Dr.C', 1, 'Investigador'),
                    (3, '72010334567', 'Bárbara Zenaida', 'Pérez Pérez', 'bperez@uij.edu.cu', 'Dr.C', 1, 'Investigadora'),
                    (4, '73010445678', 'María Regla', 'Facenda Suárez', 'mfacenda@uij.edu.cu', 'Dr.C', 1, 'Investigadora'),
                    (5, '74010556789', 'Pastora Marcela', 'Pérez Rodríguez', 'pperez@uij.edu.cu', 'Dr.C', 1, 'Investigadora'),
                    (6, '75010667890', 'Haydee Paula', 'Paz Izquierdo', 'hpaz@uij.edu.cu', 'Dr.C', 1, 'Investigadora'),
                    (7, '76010778901', 'Juan Noel', 'Meléndez Laza', 'jmelendez@uij.edu.cu', 'Ms.C', 1, 'Investigador'),
                    (8, '77010889012', 'Yara Mayra', 'Giraut de la Rosa', 'ygiraut@uij.edu.cu', 'Ms.C', 1, 'Investigadora'),
                    (9, '78010990123', 'Neyvis', 'Corso Naranjo', 'ncorso@uij.edu.cu', 'Ms.C', 1, 'Investigadora'),
                    (10, '79011001234', 'Idalmis', 'Soto Hernández', 'isoto@uij.edu.cu', 'Lic.', 1, 'Investigadora');`);

                // Competencias (15)
                await execSQL(`INSERT OR REPLACE INTO competencias (nombre, descripcion, dimension, categoria, nivel_esperado) VALUES
                    ('Conocimiento de la entidad', 'Conocimiento de la misión, visión y estructura de la entidad laboral', 'Integracion Institucional', 'Conocimientos', 3),
                    ('Adaptación al entorno laboral', 'Capacidad para adaptarse al entorno y cultura organizacional', 'Integracion Institucional', 'Habilidades', 3),
                    ('Relaciones interpersonales', 'Capacidad para establecer relaciones efectivas en el entorno laboral', 'Integracion Institucional', 'Habilidades', 4),
                    ('Sentido de pertenencia', 'Identificación y compromiso con la entidad y su misión', 'Integracion Institucional', 'Valores', 4),
                    ('Trabajo en equipo', 'Capacidad para colaborar efectivamente en equipos de trabajo', 'Integracion Institucional', 'Habilidades', 4),
                    ('Habilidades comunicativas', 'Capacidad para expresarse y comunicarse efectivamente', 'Desarrollo de Competencias', 'Habilidades', 4),
                    ('Valores éticos y compromiso', 'Actuación ética y compromiso con los principios profesionales', 'Desarrollo de Competencias', 'Valores', 5),
                    ('Actualización profesional', 'Capacidad para mantenerse actualizado en su área profesional', 'Desarrollo de Competencias', 'Conocimientos', 4),
                    ('Pensamiento crítico', 'Capacidad para analizar y evaluar información de manera crítica', 'Desarrollo de Competencias', 'Habilidades', 4),
                    ('Aprendizaje autónomo', 'Capacidad para gestionar su propio aprendizaje', 'Desarrollo de Competencias', 'Habilidades', 3),
                    ('Aplicación de conocimientos', 'Capacidad para aplicar conocimientos en la solución de problemas', 'Impacto en el Desempeno', 'Conocimientos', 4),
                    ('Autonomía y participación', 'Capacidad para actuar con autonomía y participar activamente', 'Impacto en el Desempeno', 'Habilidades', 4),
                    ('Innovación y creatividad', 'Capacidad para generar soluciones innovadoras', 'Impacto en el Desempeno', 'Habilidades', 3),
                    ('Orientación a resultados', 'Capacidad para alcanzar resultados en los plazos establecidos', 'Impacto en el Desempeno', 'Actitudes', 4),
                    ('Responsabilidad profesional', 'Asumir responsabilidades y cumplir con los compromisos', 'Impacto en el Desempeno', 'Valores', 5);`);

                // Objetivos del proyecto (11)
                await execSQL(`INSERT OR REPLACE INTO objetivos_proyecto (numero, descripcion, estado) VALUES
                    (1, 'Sistematizar los referentes históricos, teóricos, políticos y legales que sustentan el vínculo universidad-sociedad', 'completado'),
                    (2, 'Elaborar instrumento para estimular la investigación, profundización y difusión en torno al vínculo universidad-sociedad', 'completado'),
                    (3, 'Elaborar las dimensiones e indicadores para la caracterización del vínculo universidad-sociedad', 'completado'),
                    (4, 'Caracterizar a las empresas y sus entidades laborales de base en función de su contribución a la formación del profesional universitario', 'en_progreso'),
                    (5, 'Elaborar Modelo que fortalezca el vínculo universidad-sociedad para la formación del profesional universitario', 'pendiente'),
                    (6, 'Elaborar Metodología para la categorización de los profesionales de la producción y los servicios', 'pendiente'),
                    (7, 'Elaborar Actividades para fortalecer el vínculo universidad-sociedad en los órganos judiciales', 'pendiente'),
                    (8, 'Elaborar Sistema de trabajo para fortalecer el vínculo universidad-sociedad en la Isla de la Juventud', 'pendiente'),
                    (9, 'Elaborar programas de asignaturas para el pregrado que contribuyan a la preparación para el empleo', 'en_progreso'),
                    (10, 'Elaborar programa de posgrado que preparen a los profesionales de la producción y los servicios para su desempeño como tutores', 'en_progreso'),
                    (11, 'Elaborar sitio web para la informatización de los resultados del proyecto', 'en_progreso');`);

                console.log('✅ Datos iniciales insertados correctamente');
                resolve(true);

            } catch (error) {
                console.error('❌ Error al crear base de datos:', error);
                reject(error);
            }
        });
    }

    // ============================================================
    // SEMILLA (crea datos de ejemplo)
    // ============================================================
    function seed() {
        return createDatabase();
    }

    // ============================================================
    // API PÚBLICA
    // ============================================================
    return {
        init: init,
        query: query,
        execute: execute,
        execSQL: execSQL,
        querySQL: querySQL,
        getConnection: getConnection,
        isReady: isReady,
        createDatabase: createDatabase,
        seed: seed,
        exportDB: exportDB,
        downloadDB: downloadDB,
        TABLES: TABLES
    };

})();

window.DBModule = DBModule;
console.log('📦 Módulo de Base de Datos SQLite (CDN) cargado correctamente.');
