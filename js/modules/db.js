// ============================================================
// SISPE - db.js
// Módulo de Base de Datos SQLite (CON CARGA DE ARCHIVO)
// RUTA: js/modules/db.js
// ============================================================

const DBModule = (function() {
    'use strict';

    // ---- VARIABLES PRIVADAS ----
    let dbInstance = null;
    let SQL = null;
    let dbInitialized = false;
    let dbReady = false;
    let usingFile = false;

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
        COMPETENCIAS_EVALUADAS: 'competencias_evaluadas'
    };

    // ============================================================
    // INICIALIZAR SQLITE (CON CARGA DE ARCHIVO)
    // ============================================================
    function init() {
        return new Promise(function(resolve, reject) {
            // Si ya está inicializado, resolver
            if (dbInitialized && dbReady) {
                resolve(true);
                return;
            }

            // Verificar si existe initSqlJs
            if (typeof initSqlJs === 'undefined') {
                let attempts = 0;
                const maxAttempts = 30;

                function checkInit() {
                    attempts++;
                    if (typeof initSqlJs !== 'undefined') {
                        doInit();
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkInit, 300);
                    } else {
                        reject(new Error('No se pudo cargar SQLite. Verifica que lib/sql-wasm.js existe.'));
                    }
                }
                checkInit();
                return;
            }

            doInit();

            function doInit() {
                console.log('📦 Inicializando SQLite...');

                // Primero cargar la librería
                initSqlJs({
                    locateFile: function(filename) {
                        return 'lib/' + filename;
                    }
                }).then(function(sqlModule) {
                    SQL = sqlModule;
                    
                    // Intentar cargar el archivo sispe.db
                    return cargarArchivoDB();
                }).then(function(data) {
                    // Si se cargó el archivo, usarlo
                    if (data) {
                        dbInstance = new SQL.Database(new Uint8Array(data));
                        usingFile = true;
                        console.log('✅ Base de datos cargada desde archivo sispe.db');
                        console.log('📊 Usando datos persistentes del archivo');
                    } else {
                        // Si no, crear base de datos en memoria
                        dbInstance = new SQL.Database();
                        usingFile = false;
                        console.log('⚠️ No se encontró sispe.db. Creando base de datos en memoria.');
                        console.log('💡 Ejecuta crearBaseDatosSQLite.html para generar el archivo.');
                    }
                    
                    dbReady = true;
                    dbInitialized = true;
                    resolve(true);
                }).catch(function(error) {
                    // Si falla, crear BD en memoria como fallback
                    console.warn('⚠️ Error al cargar archivo, creando BD en memoria:', error);
                    dbInstance = new SQL.Database();
                    dbReady = true;
                    dbInitialized = true;
                    usingFile = false;
                    resolve(true);
                });
            }
        });
    }

    // ============================================================
    // CARGAR ARCHIVO sispe.db
    // ============================================================
    function cargarArchivoDB() {
        return new Promise(function(resolve, reject) {
            // Intentar cargar el archivo desde la raíz
            fetch('sispe.db')
                .then(function(response) {
                    if (response.ok) {
                        return response.arrayBuffer();
                    } else {
                        console.warn('⚠️ No se encontró sispe.db (respuesta: ' + response.status + ')');
                        resolve(null);
                    }
                })
                .then(function(arrayBuffer) {
                    if (arrayBuffer) {
                        resolve(arrayBuffer);
                    } else {
                        resolve(null);
                    }
                })
                .catch(function(error) {
                    console.warn('⚠️ Error al cargar sispe.db:', error.message);
                    resolve(null);
                });
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
    // EXPORTAR BD (descargar)
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
                // CREAR TABLAS (26 tablas)
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

                // 17. diagnosticos
                await execSQL(`CREATE TABLE IF NOT EXISTS diagnosticos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tipo TEXT,
                    datos JSON,
                    fecha_aplicacion DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id)
                );`);

                // 18. reportes
                await execSQL(`CREATE TABLE IF NOT EXISTS reportes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    tipo TEXT,
                    nombre TEXT NOT NULL,
                    datos JSON,
                    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                );`);

                // 19. configuracion
                await execSQL(`CREATE TABLE IF NOT EXISTS configuracion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    clave TEXT UNIQUE NOT NULL,
                    valor TEXT,
                    descripcion TEXT,
                    updated_at DATETIME
                );`);

                // 20. sincronizacion
                await execSQL(`CREATE TABLE IF NOT EXISTS sincronizacion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tabla TEXT NOT NULL,
                    registro_id INTEGER NOT NULL,
                    operacion TEXT,
                    fecha_sincronizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    sincronizado BOOLEAN DEFAULT 0,
                    uuid TEXT UNIQUE NOT NULL
                );`);

                // 21. competencias
                await execSQL(`CREATE TABLE IF NOT EXISTS competencias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    descripcion TEXT,
                    dimension TEXT,
                    categoria TEXT,
                    nivel_esperado INTEGER DEFAULT 3 CHECK (nivel_esperado BETWEEN 1 AND 5),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 22. cursos
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

                // 23. eventos
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

                // 24. egresados_cursos
                await execSQL(`CREATE TABLE IF NOT EXISTS egresados_cursos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    curso_id INTEGER NOT NULL,
                    fecha_inicio DATE,
                    fecha_fin DATE,
                    estado TEXT DEFAULT 'inscrito',
                    calificacion REAL CHECK (calificacion BETWEEN 0 AND 100),
                    certificado_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (curso_id) REFERENCES cursos(id)
                );`);

                // 25. egresados_eventos
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

                // 26. competencias_evaluadas
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

                console.log('✅ Tablas creadas correctamente');

                // ============================================================
                // INSERTAR DATOS INICIALES (si la tabla está vacía)
                // ============================================================
                console.log('📝 Verificando datos iniciales...');

                // Roles
                const rolesExist = await querySQL('SELECT COUNT(*) as total FROM roles');
                if (rolesExist[0].total === 0) {
                    await execSQL(`INSERT INTO roles (id, nombre, descripcion) VALUES
                        (1, 'administrador', 'Superadministrador del sistema - UIJ'),
                        (2, 'coordinador', 'Coordinador de Carrera'),
                        (3, 'directivo', 'Directivo de Entidad'),
                        (4, 'tutor', 'Tutor de Egresados'),
                        (5, 'egresado', 'Recien Graduado');`);
                    console.log('✅ 5 roles insertados');
                }

                // Admin
                const adminExist = await querySQL("SELECT COUNT(*) as total FROM usuarios WHERE username = 'admin'");
                if (adminExist[0].total === 0) {
                    await execSQL(`INSERT INTO usuarios (id, username, password, email, nombre, apellidos, rol_id, activo, verificado) VALUES
                        (1, 'admin', 'admin123', 'admin@sispe.com', 'Administrador', 'Sistema', 1, 1, 1);`);
                    console.log('✅ Usuario admin insertado');
                }

                // Entidades (29 entidades del proyecto)
                const entidadesExist = await querySQL('SELECT COUNT(*) as total FROM entidades');
                if (entidadesExist[0].total < 29) {
                    // Limpiar entidades existentes
                    await execSQL('DELETE FROM entidades');
                    await execSQL("DELETE FROM sqlite_sequence WHERE name='entidades'");
                    
                    await execSQL(`INSERT INTO entidades (id, nombre, sector, representante, logo, direccion, telefono, email_contacto, convenio_estado) VALUES
                        -- === SECTOR TURISMO (6) ===
                        (1, 'Hotel El Colony', 'Turismo', 'Director General', '🏨', 'Isla de la Juventud', '+53 48 123456', 'colony@turismo.cu', 'activo'),
                        (2, 'Hotel Villa Miramar', 'Turismo', 'Director General', '🏖️', 'Isla de la Juventud', '+53 48 234567', 'miramar@turismo.cu', 'activo'),
                        (3, 'Hotel Internacional', 'Turismo', 'Director General', '🌊', 'Isla de la Juventud', '+53 48 345678', 'internacional@turismo.cu', 'activo'),
                        (4, 'Agencia de Viajes Cubatur', 'Turismo', 'Director General', '✈️', 'Isla de la Juventud', '+53 48 456789', 'cubatur@turismo.cu', 'activo'),
                        (5, 'Agencia de Viajes Caracol', 'Turismo', 'Director General', '🚌', 'Isla de la Juventud', '+53 48 567890', 'caracol@turismo.cu', 'activo'),
                        (6, 'Cadena Hotelera Islazul', 'Turismo', 'Director General', '🏝️', 'Isla de la Juventud', '+53 48 678901', 'islazul@turismo.cu', 'activo'),
                        -- === SECTOR AGROINDUSTRIA (2) ===
                        (7, 'Empresa Agroindustrial Jesús Montané Oropesa', 'Agroindustria', 'Director General', '🌾', 'Carretera Abraham Lincoln Km 1 ½', '+53 48 321471', 'agroindustria@uij.co.cu', 'activo'),
                        (8, 'Empresa Logística Agropecuaria', 'Agroindustria', 'Director General', '🚜', 'Calle Aeropuerto Km 4 ½', '+53 48 323293', 'logistica@uij.co.cu', 'activo'),
                        -- === SECTOR INDUSTRIA ALIMENTICIA (1) ===
                        (9, 'Empresa Municipal de la Industria Alimenticia', 'Industria Alimenticia', 'Director General', '🥫', 'Calle 41 No. 5407 % 54 y 56', '+53 48 324893', 'alimenticia@uij.co.cu', 'activo'),
                        -- === SECTOR ENERGÍA (1) ===
                        (10, 'Empresa Eléctrica OBE', 'Energía', 'Director General', '⚡', 'Calle 41 No. 5602 e/56 y 60', '+53 48 324839', 'obe@uij.co.cu', 'activo'),
                        -- === SECTOR COMUNICACIONES (3) ===
                        (11, 'ETECSA', 'Comunicaciones', 'Director General', '📡', 'Calle 41 % 28 y 30', '+53 48 323506', 'etecsa@uij.co.cu', 'activo'),
                        (12, 'Desoft', 'Comunicaciones', 'Director General', '💻', 'Calle 39 % 24 y 26', '+53 48 324381', 'desoft@uij.co.cu', 'activo'),
                        (13, 'UEB Servicios Informáticos EIMAG', 'Comunicaciones', 'Director General', '🖥️', 'Calle 18 % 12 y 14', '+53 48 324853', 'eimag@uij.co.cu', 'activo'),
                        -- === SECTOR MINERÍA (1) ===
                        (14, 'Empresa Geominera', 'Minería', 'Director General', '⛏️', 'Carretera Gerona Beach Km 1 ½', '+53 48 323578', 'geominera@uij.co.cu', 'activo'),
                        -- === SECTOR PESCA (1) ===
                        (15, 'Empresa Pesquera Industrial', 'Pesca', 'Director General', '🐟', 'Calle 31 e/28 y 32 No.3102', '+53 48 322721', 'pesquera@uij.co.cu', 'activo'),
                        -- === SECTOR RECICLAJE (1) ===
                        (16, 'Empresa de Recuperación de Materias Primas', 'Reciclaje', 'Director General', '♻️', 'Carretera Aeropuerto Km 4 ½', '+53 48 323654', 'recuperacion@uij.co.cu', 'activo'),
                        -- === SECTOR SALUD (1) ===
                        (17, 'Labiofam', 'Salud', 'Director General', '💊', 'Calle 33 e/24 y 22', '+53 48 311740', 'labiofam@uij.co.cu', 'activo'),
                        -- === SECTOR EDUCACIÓN (2) ===
                        (18, 'U/P Municipal Dirección de Educación', 'Educación', 'Nuris Peña Rodríguez', '📚', 'Calle 26 No. 3907 e/39 y 41', '+53 48 323218', 'npena@dme.ij.rimed.cu', 'activo'),
                        (19, 'Universidad de la Isla de la Juventud', 'Educación', 'Ms.C Rafael Ernesto Licea Mojena', '🎓', 'Carretera Aeropuerto Km 3 ½', '+53 48 324819', 'rectoria@uij.edu.cu', 'activo'),
                        -- === SECTOR JUSTICIA (4) ===
                        (20, 'Tribunal Especial Popular', 'Justicia', 'Presidente', '⚖️', 'Calle 31 % 24 y 26', '+53 48 323423', 'tribunal@uij.co.cu', 'activo'),
                        (21, 'Fiscalía Municipal Especial', 'Justicia', 'Fiscal Jefe', '📜', 'Calle 24 e/41 y 43 No 4113', '+53 48 324427', 'fiscalia@uij.co.cu', 'activo'),
                        (22, 'Bufete Colectivo', 'Justicia', 'Director', '📋', 'Calle 43 e/22 y 24', '+53 48 324734', 'bufete@uij.co.cu', 'activo'),
                        (23, 'Dirección Municipal de Justicia', 'Justicia', 'Director', '🏛️', 'Calle 41 % 24 y 26 No. 2415', '+53 48 322115', 'justicia@uij.co.cu', 'activo'),
                        -- === SECTOR ECONOMÍA (4) ===
                        (24, 'Asociación Nacional de Economistas ANEC', 'Economía', 'Presidente', '📊', 'Calle 39 Esq. a 36', '+53 48 323192', 'anec@uij.co.cu', 'activo'),
                        (25, 'Dirección Municipal de Finanzas y Precios', 'Economía', 'Director', '💰', 'Calle 39 Esq.38', '+53 48 323192', 'finanzas@uij.co.cu', 'activo'),
                        (26, 'Oficina ONEI', 'Economía', 'Director', '📈', 'Calle 41 e/22 y 24 No 2204', '+53 48 324507', 'onei@uij.co.cu', 'activo'),
                        (27, 'Dirección Municipal de Comercio', 'Economía', 'Director', '🛒', 'Calle 22 No. 3712 e/37 y 39', '+53 48 322206', 'comercio@uij.co.cu', 'activo'),
                        -- === SECTOR CIENCIA Y TECNOLOGÍA (1) ===
                        (28, 'Delegación Territorial CITMA', 'Ciencia', 'Delegado', '🔬', 'Calle 41 No. 4625 e/46 y 54', '+53 48 322122', 'citma@uij.co.cu', 'activo'),
                        -- === SECTOR CONTROL (1) ===
                        (29, 'Contraloría Municipal', 'Control', 'Yasmila Calderón Arguelles', '🔍', 'Calle 39 entre 10 y 12', '+53 48 323275', 'yasmila.calderon@isl.contraloria.gob.cu', 'activo');`);
                    console.log('✅ 29 entidades del proyecto insertadas');
                }

                // Carreras
                const carrerasExist = await querySQL('SELECT COUNT(*) as total FROM carreras');
                if (carrerasExist[0].total === 0) {
                    await execSQL(`INSERT INTO carreras (id, nombre, codigo, descripcion, duracion_anios) VALUES
                        (1, 'Ingeniería Agrónoma', 'IA-5', 'Formación de ingenieros para la producción agrícola sostenible', 5),
                        (2, 'Lic. Contabilidad', 'LCO-4', 'Formación de profesionales en contabilidad y finanzas', 4),
                        (3, 'Lic. Derecho', 'LDE-5', 'Formación de profesionales en ciencias jurídicas', 5),
                        (4, 'Ing. Informática', 'II-5', 'Formación de ingenieros en ciencias de la computación', 5),
                        (5, 'Lic. Cultura Física', 'LCF-4', 'Formación de profesionales en deportes y recreación', 4),
                        (6, 'Lic. Psicología', 'LPS-5', 'Formación de profesionales en psicología', 5),
                        (7, 'Lic. Inglés', 'LIN-4', 'Formación de profesionales en lengua inglesa', 4),
                        (8, 'Lic. Pedagogía-Psicología', 'LPP-5', 'Formación de profesionales en pedagogía y psicología', 5);`);
                    console.log('✅ 8 carreras insertadas');
                }

                // Competencias
                const competenciasExist = await querySQL('SELECT COUNT(*) as total FROM competencias');
                if (competenciasExist[0].total === 0) {
                    await execSQL(`INSERT INTO competencias (nombre, descripcion, dimension, categoria, nivel_esperado) VALUES
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
                    console.log('✅ 15 competencias insertadas');
                }

                // Cursos
                const cursosExist = await querySQL('SELECT COUNT(*) as total FROM cursos');
                if (cursosExist[0].total === 0) {
                    await execSQL(`INSERT INTO cursos (titulo, descripcion, tipo, modalidad, duracion_horas, nivel, entidad_organizadora) VALUES
                        ('Curso de Manejo Integrado de Plagas', 'Capacitación en control biológico y químico de plagas', 'curso', 'presencial', 40, 'intermedio', 'UIJ - Facultad Agronomía'),
                        ('Normas Internacionales de Contabilidad (NIC/NIIF)', 'Actualización en normas internacionales de contabilidad', 'curso', 'presencial', 60, 'avanzado', 'UIJ - Facultad de Economía'),
                        ('Taller de Liderazgo y Gestión', 'Desarrollo de habilidades de liderazgo para jóvenes profesionales', 'taller', 'presencial', 20, 'intermedio', 'UIJ - Extensión Universitaria'),
                        ('Curso de Derecho Laboral', 'Fundamentos del derecho laboral cubano', 'curso', 'presencial', 30, 'intermedio', 'UIJ - Facultad de Derecho'),
                        ('Programación Web con JavaScript', 'Desarrollo de aplicaciones web con JavaScript moderno', 'curso', 'mixto', 50, 'intermedio', 'UIJ - Facultad de Informática'),
                        ('Taller de Investigación Científica', 'Metodología y técnicas de investigación científica', 'taller', 'presencial', 24, 'intermedio', 'UIJ - Dirección de Ciencia y Técnica'),
                        ('Curso de Inglés Técnico', 'Inglés para profesionales en ciencias técnicas', 'curso', 'presencial', 40, 'basico', 'UIJ - Facultad de Humanidades'),
                        ('Seminario de Desarrollo Local', 'Estrategias y proyectos para el desarrollo local', 'seminario', 'presencial', 16, 'intermedio', 'UIJ - Proyecto Universidad-Sociedad');`);
                    console.log('✅ 8 cursos insertados');
                }

                // Eventos
                const eventosExist = await querySQL('SELECT COUNT(*) as total FROM eventos');
                if (eventosExist[0].total === 0) {
                    await execSQL(`INSERT INTO eventos (nombre, descripcion, tipo, fecha_inicio, fecha_fin, lugar, entidad_organizadora) VALUES
                        ('Jornada Científica de la UIJ', 'Evento anual de presentación de resultados científicos', 'cientifico', '2025-10-15', '2025-10-17', 'Universidad de la Isla de la Juventud', 'UIJ'),
                        ('Taller Universidad-Sociedad', 'Intercambio sobre el vínculo universidad-empresa', 'academico', '2025-10-12', '2025-10-12', 'Universidad de la Isla de la Juventud', 'UIJ - Proyecto UII'),
                        ('Evento de Desarrollo Local', 'Presentación de proyectos de desarrollo local', 'academico', '2025-11-20', '2025-11-22', 'Casa de la Cultura', 'Gobierno Municipal'),
                        ('Jornada de Emprendimiento', 'Actividades de fomento al emprendimiento juvenil', 'social', '2025-12-01', '2025-12-03', 'Parque de la Juventud', 'ANEC'),
                        ('Congreso de Contabilidad y Finanzas', 'Encuentro de profesionales de la contabilidad', 'cientifico', '2025-09-10', '2025-09-12', 'Hotel El Colony', 'ANEC'),
                        ('Taller de Innovación Tecnológica', 'Presentación de innovaciones tecnológicas en el territorio', 'academico', '2025-11-05', '2025-11-07', 'Universidad de la Isla de la Juventud', 'CITMA');`);
                    console.log('✅ 6 eventos insertados');
                }

                // Usuarios de prueba
                const usuariosPrueba = await querySQL("SELECT COUNT(*) as total FROM usuarios WHERE username IN ('carlos.p', 'ana.r', 'maria.g', 'pedro.r', 'coord1', 'directivo1')");
                if (usuariosPrueba[0].total < 6) {
                    await execSQL(`INSERT OR IGNORE INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo, verificado) VALUES
                        ('carlos.p', '123456', 'carlos@sispe.com', 'Carlos', 'Perez', 5, 1, 1),
                        ('ana.r', '123456', 'ana@sispe.com', 'Ana', 'Rodriguez', 5, 1, 1),
                        ('maria.g', '123456', 'maria@sispe.com', 'Maria', 'Gomez', 4, 1, 1),
                        ('pedro.r', '123456', 'pedro@sispe.com', 'Pedro', 'Ramirez', 4, 1, 1),
                        ('coord1', '123456', 'coord1@sispe.com', 'Coordinador', 'Carrera', 2, 1, 1),
                        ('directivo1', '123456', 'directivo1@sispe.com', 'Directivo', 'Entidad', 3, 1, 1);`);
                    console.log('✅ 6 usuarios de prueba insertados');
                }

                console.log('✅ Base de datos verificada y completada');
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
        usingFile: function() { return usingFile; },
        SCHEMA: '',
        TABLES: TABLES
    };

})();

// Exportar para uso global
window.DBModule = DBModule;
console.log('📦 Módulo de Base de Datos SQLite (con carga de archivo) cargado correctamente.');