// ============================================================
// SISPE - db.js
// Módulo de Base de Datos - IndexedDB + localStorage
// RUTA: js/modules/db.js
// ============================================================

const DBModule = (function() {
    'use strict';

    let dbInstance = null;
    let SQL = null;
    let dbReady = false;
    let dbInitialized = false;

    const STORAGE_KEY = 'sispe_db_data';
    const DB_NAME = 'SISPE_DB';
    const STORE_NAME = 'sqlite';
    const KEY_NAME = 'sispe_db';
    const DB_VERSION = 1;

    // ============================================================
    // ABRIR INDEXEDDB (con creación automática del store)
    // ============================================================
    function abrirIndexedDB() {
        return new Promise(function(resolve, reject) {
            try {
                var request = indexedDB.open(DB_NAME, DB_VERSION);
                
                request.onupgradeneeded = function(event) {
                    var db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME);
                        console.log('✅ Store "sqlite" creado en IndexedDB');
                    }
                };
                
                request.onsuccess = function(event) {
                    var db = event.target.result;
                    resolve(db);
                };
                
                request.onerror = function(event) {
                    reject(new Error('Error al abrir IndexedDB: ' + event.target.error));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // ============================================================
    // INDEXEDDB - GUARDAR
    // ============================================================
    function guardarEnIndexedDB() {
        return new Promise(function(resolve, reject) {
            if (!dbInstance) {
                resolve(false);
                return;
            }
            
            try {
                abrirIndexedDB()
                    .then(function(db) {
                        try {
                            const data = dbInstance.export();
                            const transaction = db.transaction([STORE_NAME], 'readwrite');
                            const store = transaction.objectStore(STORE_NAME);
                            store.put(data, KEY_NAME);
                            
                            transaction.oncomplete = function() {
                                console.log('💾 BD guardada en IndexedDB');
                                resolve(true);
                            };
                            
                            transaction.onerror = function(event) {
                                reject(new Error('Error al guardar: ' + event.target.error));
                            };
                        } catch (error) {
                            reject(error);
                        }
                    })
                    .catch(function(error) {
                        reject(error);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }

    // ============================================================
    // INDEXEDDB - CARGAR
    // ============================================================
    function cargarDesdeIndexedDB() {
        return new Promise(function(resolve, reject) {
            try {
                abrirIndexedDB()
                    .then(function(db) {
                        try {
                            const transaction = db.transaction([STORE_NAME], 'readonly');
                            const store = transaction.objectStore(STORE_NAME);
                            const getRequest = store.get(KEY_NAME);
                            
                            getRequest.onsuccess = function() {
                                const data = getRequest.result;
                                if (data) {
                                    console.log('✅ BD cargada desde IndexedDB');
                                    resolve(data);
                                } else {
                                    resolve(null);
                                }
                            };
                            
                            getRequest.onerror = function(event) {
                                reject(new Error('Error al leer: ' + event.target.error));
                            };
                        } catch (error) {
                            reject(error);
                        }
                    })
                    .catch(function(error) {
                        reject(error);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }

    // ============================================================
    // LOCALSTORAGE - GUARDAR
    // ============================================================
    function guardarEnLocalStorage() {
        try {
            if (!dbInstance) return false;
            const data = dbInstance.export();
            const bytes = new Uint8Array(data);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            localStorage.setItem(STORAGE_KEY, btoa(binary));
            console.log('💾 BD guardada en localStorage');
            return true;
        } catch (e) {
            console.error('❌ Error al guardar en localStorage:', e);
            return false;
        }
    }

    // ============================================================
    // LOCALSTORAGE - CARGAR
    // ============================================================
    function cargarDesdeLocalStorage() {
        try {
            const base64 = localStorage.getItem(STORAGE_KEY);
            if (!base64) return null;
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            console.log('✅ BD cargada desde localStorage');
            return bytes;
        } catch (e) {
            console.error('❌ Error al cargar localStorage:', e);
            return null;
        }
    }

    // ============================================================
    // GUARDAR CAMBIOS
    // ============================================================
    function guardarCambios() {
        return new Promise(function(resolve, reject) {
            if (!dbInstance) {
                resolve(false);
                return;
            }
            try {
                guardarEnLocalStorage();
                guardarEnIndexedDB()
                    .then(function() {
                        console.log('✅ Cambios guardados');
                        resolve(true);
                    })
                    .catch(function(error) {
                        console.warn('⚠️ Error en IndexedDB, pero localStorage guardó:', error);
                        resolve(true);
                    });
            } catch (error) {
                console.error('❌ Error al guardar:', error);
                reject(error);
            }
        });
    }

    // ============================================================
    // RECARGAR DESDE LOCALSTORAGE
    // ============================================================
    function recargarDesdeLocalStorage() {
        return new Promise(function(resolve, reject) {
            try {
                const data = cargarDesdeLocalStorage();
                if (data) {
                    dbInstance = new SQL.Database(data);
                    dbReady = true;
                    dbInitialized = true;
                    guardarEnIndexedDB().catch(function() {});
                    console.log('✅ BD recargada desde localStorage');
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // ============================================================
    // 🔥 VERIFICAR Y CREAR TABLAS DE HISTORIAL AUTOMÁTICAMENTE
    // ============================================================
    async function verificarYCrearTablasHistorial() {
        try {
            console.log('🔍 Verificando tablas de historial...');
            
            // Verificar si existe la tabla historial_evaluaciones
            var result = await query(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='historial_evaluaciones'"
            );
            
            if (result.length === 0) {
                console.log('📋 Creando tabla historial_evaluaciones...');
                await execute(`
                    CREATE TABLE IF NOT EXISTS historial_evaluaciones (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        egresado_id INTEGER,
                        competencia_id INTEGER,
                        puntuacion_anterior INTEGER,
                        puntuacion_nueva INTEGER,
                        fecha_cambio TEXT,
                        observaciones TEXT,
                        FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                        FOREIGN KEY (competencia_id) REFERENCES competencias(id)
                    )
                `);
                console.log('✅ Tabla historial_evaluaciones creada');
            } else {
                console.log('✅ Tabla historial_evaluaciones ya existe');
            }
            
            // Verificar si existe la tabla historial_tutorias
            var result2 = await query(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='historial_tutorias'"
            );
            
            if (result2.length === 0) {
                console.log('📋 Creando tabla historial_tutorias...');
                await execute(`
                    CREATE TABLE IF NOT EXISTS historial_tutorias (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        tutoria_id INTEGER,
                        tipo TEXT,
                        mensaje TEXT,
                        fecha TEXT,
                        FOREIGN KEY (tutoria_id) REFERENCES tutorias(id)
                    )
                `);
                console.log('✅ Tabla historial_tutorias creada');
            } else {
                console.log('✅ Tabla historial_tutorias ya existe');
            }
            
            // Guardar cambios después de crear las tablas
            await guardarCambios();
            console.log('✅ Verificación de tablas de historial completada');
            
        } catch (error) {
            console.warn('⚠️ Error al verificar/crear tablas de historial:', error);
            // No interrumpimos la ejecución
        }
    }

    // ============================================================
    // 🔥 INICIALIZACIÓN
    // ============================================================
    function init() {
        return new Promise(function(resolve, reject) {
            if (dbInitialized && dbReady) {
                resolve(true);
                return;
            }

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
                        reject(new Error('No se pudo cargar SQLite.'));
                    }
                }
                checkInit();
                return;
            }

            doInit();

            function doInit() {
                console.log('📦 Inicializando SQLite...');

                initSqlJs({
                    locateFile: function(filename) {
                        return 'lib/' + filename;
                    }
                }).then(function(sqlModule) {
                    SQL = sqlModule;
                    
                    // 🔥 PRIORIDAD 1: IndexedDB
                    cargarDesdeIndexedDB()
                        .then(async function(data) {
                            if (data) {
                                dbInstance = new SQL.Database(data);
                                dbReady = true;
                                dbInitialized = true;
                                console.log('✅ BD cargada desde IndexedDB');
                                
                                // 🔥 Verificar y crear tablas de historial
                                await verificarYCrearTablasHistorial();
                                
                                resolve(true);
                                return;
                            }
                            
                            // 🔥 PRIORIDAD 2: localStorage
                            var localData = cargarDesdeLocalStorage();
                            if (localData) {
                                dbInstance = new SQL.Database(localData);
                                dbReady = true;
                                dbInitialized = true;
                                console.log('✅ BD cargada desde localStorage');
                                guardarEnIndexedDB().catch(function() {});
                                
                                // 🔥 Verificar y crear tablas de historial
                                await verificarYCrearTablasHistorial();
                                
                                resolve(true);
                                return;
                            }
                            
                            // 🔥 PRIORIDAD 3: Crear BD nueva
                            console.log('⚠️ No hay datos. Creando BD nueva...');
                            dbInstance = new SQL.Database();
                            dbReady = true;
                            dbInitialized = true;
                            await createDatabase();
                            
                            // 🔥 Verificar y crear tablas de historial (ya están en createDatabase)
                            
                            resolve(true);
                        })
                        .catch(async function(error) {
                            console.warn('⚠️ Error al cargar IndexedDB:', error);
                            // Fallback a localStorage
                            var localData = cargarDesdeLocalStorage();
                            if (localData) {
                                dbInstance = new SQL.Database(localData);
                                dbReady = true;
                                dbInitialized = true;
                                console.log('✅ BD cargada desde localStorage (fallback)');
                                guardarEnIndexedDB().catch(function() {});
                                
                                // 🔥 Verificar y crear tablas de historial
                                await verificarYCrearTablasHistorial();
                                
                                resolve(true);
                            } else {
                                // Crear BD nueva
                                dbInstance = new SQL.Database();
                                dbReady = true;
                                dbInitialized = true;
                                await createDatabase();
                                resolve(true);
                            }
                        });
                }).catch(function(error) {
                    console.error('❌ Error al cargar SQLite:', error);
                    reject(error);
                });
            }
        });
    }

    // ============================================================
    // FUNCIONES SQL
    // ============================================================
    function execute(sql, params) {
        return new Promise(async function(resolve, reject) {
            if (!dbInstance) {
                reject(new Error('BD no inicializada'));
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
                
                var lastId = dbInstance.exec('SELECT last_insert_rowid()');
                var lastID = lastId[0]?.values[0]?.[0] || 0;
                
                // Guardar automáticamente
                await guardarCambios();
                
                resolve({ changes: 1, lastID: lastID });
            } catch (error) {
                console.error('❌ Error en execute:', error);
                reject(error);
            }
        });
    }

    function query(sql, params) {
        return new Promise(function(resolve, reject) {
            if (!dbInstance) {
                reject(new Error('BD no inicializada'));
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

    function execSQL(sql) {
        return new Promise(async function(resolve, reject) {
            if (!dbInstance) {
                reject(new Error('BD no inicializada'));
                return;
            }
            try {
                dbInstance.run(sql);
                await guardarCambios();
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    function querySQL(sql) {
        return new Promise(function(resolve, reject) {
            if (!dbInstance) {
                reject(new Error('BD no inicializada'));
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
                reject(error);
            }
        });
    }

    function isReady() {
        return dbReady && dbInitialized;
    }

    function getConnection() {
        return dbInstance;
    }

    // ============================================================
    // CREAR BASE DE DATOS (datos iniciales) - CON TABLAS DE HISTORIAL
    // ============================================================
    function createDatabase() {
        return new Promise(async function(resolve, reject) {
            if (!dbInstance) {
                reject(new Error('BD no inicializada'));
                return;
            }
            try {
                console.log('📋 Creando tablas básicas...');
                
                // ============================================================
                // TABLAS PRINCIPALES
                // ============================================================
                
                // 1. Roles
                await execSQL(`CREATE TABLE IF NOT EXISTS roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT UNIQUE NOT NULL,
                    descripcion TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 2. Usuarios
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

                // 3. Usuarios Roles (multi-rol)
                await execSQL(`CREATE TABLE IF NOT EXISTS usuarios_roles (
                    usuario_id INTEGER,
                    rol_id INTEGER,
                    PRIMARY KEY (usuario_id, rol_id),
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (rol_id) REFERENCES roles(id)
                );`);

                // 4. Entidades
                await execSQL(`CREATE TABLE IF NOT EXISTS entidades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    sector TEXT,
                    representante TEXT,
                    telefono TEXT,
                    email_contacto TEXT,
                    direccion TEXT,
                    logo TEXT,
                    convenio_estado TEXT DEFAULT 'activo',
                    convenio_fecha_inicio DATE,
                    convenio_fecha_fin DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 5. Carreras
                await execSQL(`CREATE TABLE IF NOT EXISTS carreras (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    codigo TEXT,
                    duracion_anios INTEGER DEFAULT 5,
                    descripcion TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 6. Graduados
                await execSQL(`CREATE TABLE IF NOT EXISTS graduados (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numero_identidad TEXT UNIQUE NOT NULL,
                    nombre TEXT NOT NULL,
                    apellidos TEXT NOT NULL,
                    carrera_id INTEGER,
                    anio_graduacion INTEGER,
                    email_institucional TEXT,
                    titulo_oro INTEGER DEFAULT 0,
                    graduado_integral INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (carrera_id) REFERENCES carreras(id)
                );`);

                // 7. Docentes
                await execSQL(`CREATE TABLE IF NOT EXISTS docentes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numero_identidad TEXT UNIQUE NOT NULL,
                    nombre TEXT NOT NULL,
                    apellidos TEXT NOT NULL,
                    email_institucional TEXT,
                    departamento TEXT,
                    categoria_docente TEXT,
                    categoria_cientifica TEXT,
                    es_investigador_proyecto INTEGER DEFAULT 0,
                    rol_proyecto TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 8. Egresados
                await execSQL(`CREATE TABLE IF NOT EXISTS egresados (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    carrera_id INTEGER,
                    entidad_id INTEGER,
                    tutor_id INTEGER,
                    anio_graduacion INTEGER,
                    titulo_oro INTEGER DEFAULT 0,
                    graduado_integral INTEGER DEFAULT 0,
                    avatar TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
                    FOREIGN KEY (entidad_id) REFERENCES entidades(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
                );`);

                // 9. Tutores
                await execSQL(`CREATE TABLE IF NOT EXISTS tutores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    entidad_id INTEGER,
                    docente_id INTEGER,
                    categoria TEXT,
                    anios_experiencia INTEGER DEFAULT 0,
                    max_egresados INTEGER DEFAULT 5,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (entidad_id) REFERENCES entidades(id),
                    FOREIGN KEY (docente_id) REFERENCES docentes(id)
                );`);

                // 10. Coordinadores
                await execSQL(`CREATE TABLE IF NOT EXISTS coordinadores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    carrera_id INTEGER,
                    entidad_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
                    FOREIGN KEY (entidad_id) REFERENCES entidades(id)
                );`);

                // 11. Directivos
                await execSQL(`CREATE TABLE IF NOT EXISTS directivos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    entidad_id INTEGER NOT NULL,
                    cargo TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                    FOREIGN KEY (entidad_id) REFERENCES entidades(id)
                );`);

                // 12. Planes de Superación
                await execSQL(`CREATE TABLE IF NOT EXISTS planes_superacion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tutor_id INTEGER,
                    anio_plan INTEGER,
                    estado TEXT DEFAULT 'activo',
                    progreso INTEGER DEFAULT 0,
                    observaciones TEXT,
                    fecha_inicio DATE,
                    fecha_fin_estimada DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
                );`);

                // 13. Acciones del Plan
                await execSQL(`CREATE TABLE IF NOT EXISTS acciones_plan (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    plan_id INTEGER NOT NULL,
                    titulo TEXT NOT NULL,
                    descripcion TEXT,
                    tipo TEXT,
                    estado TEXT DEFAULT 'pendiente',
                    icono TEXT,
                    fecha_limite DATE,
                    fecha_programada DATE,
                    fecha_completado DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (plan_id) REFERENCES planes_superacion(id)
                );`);

                // 14. Tutorías
                await execSQL(`CREATE TABLE IF NOT EXISTS tutorias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tutor_id INTEGER NOT NULL,
                    fecha DATE NOT NULL,
                    resumen TEXT NOT NULL,
                    acuerdos TEXT,
                    proxima_tutoria DATE,
                    estado TEXT DEFAULT 'completada',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
                );`);

                // 15. Evaluaciones
                await execSQL(`CREATE TABLE IF NOT EXISTS evaluaciones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tutor_id INTEGER,
                    tipo TEXT,
                    dimension TEXT,
                    puntaje INTEGER,
                    comentario TEXT,
                    fecha DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
                );`);

                // 16. Evidencias
                await execSQL(`CREATE TABLE IF NOT EXISTS evidencias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tipo TEXT,
                    titulo TEXT NOT NULL,
                    descripcion TEXT,
                    archivo_nombre TEXT,
                    archivo_url TEXT,
                    fecha_subida DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id)
                );`);

                // 17. Notificaciones
                await execSQL(`CREATE TABLE IF NOT EXISTS notificaciones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    tipo TEXT,
                    mensaje TEXT NOT NULL,
                    url TEXT,
                    leida INTEGER DEFAULT 0,
                    fecha_envio DATETIME,
                    fecha_leida DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                );`);

                // 18. Diagnósticos
                await execSQL(`CREATE TABLE IF NOT EXISTS diagnosticos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tipo TEXT,
                    resultado TEXT,
                    fecha DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id)
                );`);

                // 19. Reportes
                await execSQL(`CREATE TABLE IF NOT EXISTS reportes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER,
                    tipo TEXT,
                    titulo TEXT,
                    contenido TEXT,
                    fecha_generacion DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                );`);

                // 20. Configuración
                await execSQL(`CREATE TABLE IF NOT EXISTS configuracion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    clave TEXT UNIQUE NOT NULL,
                    valor TEXT,
                    descripcion TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 21. Sincronización
                await execSQL(`CREATE TABLE IF NOT EXISTS sincronizacion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tabla TEXT,
                    registro_id INTEGER,
                    operacion TEXT,
                    datos TEXT,
                    estado TEXT DEFAULT 'pendiente',
                    intentos INTEGER DEFAULT 0,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    fecha_sincronizacion DATETIME
                );`);

                // 22. Competencias
                await execSQL(`CREATE TABLE IF NOT EXISTS competencias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    descripcion TEXT,
                    dimension TEXT,
                    categoria TEXT,
                    nivel_esperado INTEGER DEFAULT 3,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 23. Cursos
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
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 24. Eventos
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

                // 25. Egresados Cursos
                await execSQL(`CREATE TABLE IF NOT EXISTS egresados_cursos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    curso_id INTEGER NOT NULL,
                    fecha_inicio DATE,
                    fecha_completado DATE,
                    estado TEXT DEFAULT 'inscrito',
                    calificacion REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (curso_id) REFERENCES cursos(id)
                );`);

                // 26. Egresados Eventos
                await execSQL(`CREATE TABLE IF NOT EXISTS egresados_eventos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    evento_id INTEGER NOT NULL,
                    rol TEXT DEFAULT 'participante',
                    fecha_participacion DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (evento_id) REFERENCES eventos(id)
                );`);

                // 27. Competencias Evaluadas
                await execSQL(`CREATE TABLE IF NOT EXISTS competencias_evaluadas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    competencia_id INTEGER NOT NULL,
                    puntaje INTEGER,
                    nivel TEXT,
                    evidencia TEXT,
                    fecha_evaluacion DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (competencia_id) REFERENCES competencias(id)
                );`);

                // 28. Objetivos Proyecto
                await execSQL(`CREATE TABLE IF NOT EXISTS objetivos_proyecto (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numero INTEGER,
                    descripcion TEXT NOT NULL,
                    estado TEXT DEFAULT 'pendiente',
                    fecha_inicio DATE,
                    fecha_fin_estimada DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // 29. Productos Científicos
                await execSQL(`CREATE TABLE IF NOT EXISTS productos_cientificos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titulo TEXT NOT NULL,
                    tipo TEXT,
                    autor TEXT,
                    docente_id INTEGER,
                    revista_evento TEXT,
                    anio INTEGER,
                    estado TEXT,
                    url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (docente_id) REFERENCES docentes(id)
                );`);

                // 30. Trabajos Estudiantes
                await execSQL(`CREATE TABLE IF NOT EXISTS trabajos_estudiantes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER NOT NULL,
                    tipo TEXT,
                    titulo TEXT NOT NULL,
                    tutor_id INTEGER,
                    fecha_presentacion DATE,
                    calificacion REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
                );`);

                // 31. Dimensiones Evaluación
                await execSQL(`CREATE TABLE IF NOT EXISTS dimensiones_evaluacion (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    descripcion TEXT,
                    peso INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );`);

                // ============================================================
                // 🔥 TABLAS DE HISTORIAL (NUEVAS)
                // ============================================================

                // 32. Historial de Tutorías
                await execSQL(`CREATE TABLE IF NOT EXISTS historial_tutorias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tutoria_id INTEGER,
                    tipo TEXT,
                    mensaje TEXT,
                    fecha TEXT,
                    FOREIGN KEY (tutoria_id) REFERENCES tutorias(id)
                );`);
                console.log('✅ Tabla historial_tutorias creada');

                // 33. Historial de Evaluaciones
                await execSQL(`CREATE TABLE IF NOT EXISTS historial_evaluaciones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    egresado_id INTEGER,
                    competencia_id INTEGER,
                    puntuacion_anterior INTEGER,
                    puntuacion_nueva INTEGER,
                    fecha_cambio TEXT,
                    observaciones TEXT,
                    FOREIGN KEY (egresado_id) REFERENCES egresados(id),
                    FOREIGN KEY (competencia_id) REFERENCES competencias(id)
                );`);
                console.log('✅ Tabla historial_evaluaciones creada');

                // ============================================================
                // DATOS INICIALES
                // ============================================================

                // Roles
                await execSQL(`INSERT OR IGNORE INTO roles (id, nombre, descripcion) VALUES
                    (1, 'administrador', 'Superadministrador del sistema - UIJ'),
                    (2, 'coordinador', 'Coordinador de Carrera'),
                    (3, 'directivo', 'Directivo de Entidad'),
                    (4, 'tutor', 'Tutor de Egresados'),
                    (5, 'egresado', 'Recién Graduado');`);

                // Usuario Admin
                await execSQL(`INSERT OR IGNORE INTO usuarios (id, username, password, email, nombre, apellidos, rol_id, activo, verificado) VALUES
                    (1, 'admin', 'admin123', 'admin@sispe.com', 'Administrador', 'Sistema', 1, 1, 1);`);

                // Usuarios de prueba
                await execSQL(`INSERT OR IGNORE INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo, verificado) VALUES
                    ('carlos.p', '123456', 'carlos@sispe.com', 'Carlos', 'Pérez', 5, 1, 1),
                    ('ana.r', '123456', 'ana@sispe.com', 'Ana', 'Rodríguez', 5, 1, 1),
                    ('maria.g', '123456', 'maria@sispe.com', 'María', 'Gómez', 4, 1, 1),
                    ('pedro.r', '123456', 'pedro@sispe.com', 'Pedro', 'Ramírez', 4, 1, 1),
                    ('coord1', '123456', 'coord@sispe.com', 'Coordinador', 'Principal', 2, 1, 1),
                    ('directivo1', '123456', 'directivo@sispe.com', 'Directivo', 'Principal', 3, 1, 1),
                    ('multi_rol', '123456', 'multirol@sispe.com', 'Multi', 'Rol', 4, 1, 1);`);

                // Asignar roles adicionales a multi_rol
                await execSQL(`INSERT OR IGNORE INTO usuarios_roles (usuario_id, rol_id) VALUES
                    ((SELECT id FROM usuarios WHERE username = 'multi_rol'), 2),
                    ((SELECT id FROM usuarios WHERE username = 'multi_rol'), 3);`);

                // Entidades iniciales
                await execSQL(`INSERT OR IGNORE INTO entidades (id, nombre, sector, logo) VALUES
                    (1, 'Universidad de la Isla de la Juventud', 'Educación', '🎓'),
                    (2, 'Empresa Agroindustrial Jesús Montané Oropesa', 'Agroindustria', '🌾'),
                    (3, 'Hotel El Colony', 'Turismo', '🏨'),
                    (4, 'ETECSA', 'Comunicaciones', '📡'),
                    (5, 'Empresa Eléctrica OBE', 'Energía', '⚡');`);

                // Carreras iniciales
                await execSQL(`INSERT OR IGNORE INTO carreras (id, nombre, codigo, duracion_anios) VALUES
                    (1, 'Ingeniería Agrónoma', 'IA-5', 5),
                    (2, 'Licenciatura en Contabilidad', 'LC-5', 5),
                    (3, 'Licenciatura en Economía', 'LE-5', 5),
                    (4, 'Ingeniería Informática', 'II-5', 5),
                    (5, 'Licenciatura en Derecho', 'LD-5', 5),
                    (6, 'Licenciatura en Psicología', 'LP-5', 5),
                    (7, 'Licenciatura en Educación', 'LED-5', 5);`);

                // Competencias iniciales
                await execSQL(`INSERT OR IGNORE INTO competencias (nombre, descripcion, dimension, categoria, nivel_esperado) VALUES
                    ('Conocimiento de la profesión', 'Dominio de los conocimientos técnicos y teóricos de la profesión', 'Desarrollo de Competencias', 'Conocimientos', 4),
                    ('Habilidades comunicativas', 'Capacidad para comunicarse efectivamente en el entorno laboral', 'Desarrollo de Competencias', 'Habilidades', 4),
                    ('Ética profesional', 'Actuación con valores éticos y responsabilidad profesional', 'Desarrollo de Competencias', 'Valores', 5),
                    ('Trabajo en equipo', 'Capacidad para colaborar y trabajar en equipos multidisciplinarios', 'Desarrollo de Competencias', 'Habilidades', 4),
                    ('Adaptación al cambio', 'Flexibilidad y capacidad de adaptación a nuevos entornos y situaciones', 'Desarrollo de Competencias', 'Actitudes', 4),
                    ('Integración a la entidad', 'Capacidad de integrarse y adaptarse a la cultura organizacional', 'Integración Institucional', 'Actitudes', 4),
                    ('Aportes a la entidad', 'Contribuciones y aportes realizados a la entidad laboral', 'Integración Institucional', 'Actitudes', 3),
                    ('Cumplimiento de metas', 'Capacidad para cumplir con los objetivos y metas establecidos', 'Impacto en el Desempeño', 'Actitudes', 4),
                    ('Iniciativa y autonomía', 'Capacidad para tomar decisiones y actuar con autonomía', 'Impacto en el Desempeño', 'Habilidades', 4),
                    ('Liderazgo', 'Capacidad para guiar y motivar a otros en el entorno laboral', 'Impacto en el Desempeño', 'Habilidades', 3);`);

                // Dimensiones de Evaluación
                await execSQL(`INSERT OR IGNORE INTO dimensiones_evaluacion (nombre, descripcion, peso) VALUES
                    ('Integración Institucional', 'Evaluación del nivel de integración del egresado con la entidad laboral', 1),
                    ('Desarrollo de Competencias', 'Evaluación del desarrollo de competencias profesionales', 1),
                    ('Impacto en el Desempeño', 'Evaluación del impacto del egresado en su desempeño laboral', 1);`);

                await guardarCambios();
                console.log('✅ Base de datos creada con todas las tablas incluyendo historiales');
                resolve(true);
            } catch (error) {
                console.error('❌ Error al crear BD:', error);
                reject(error);
            }
        });
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
        guardarCambios: guardarCambios,
        recargarDesdeLocalStorage: recargarDesdeLocalStorage,
        guardarEnLocalStorage: guardarEnLocalStorage,
        guardarEnIndexedDB: guardarEnIndexedDB,
        cargarDesdeIndexedDB: cargarDesdeIndexedDB,
        verificarYCrearTablasHistorial: verificarYCrearTablasHistorial,
        TABLES: {
            USUARIOS: 'usuarios',
            TUTORES: 'tutores',
            EGRESADOS: 'egresados',
            HISTORIAL_TUTORIAS: 'historial_tutorias',
            HISTORIAL_EVALUACIONES: 'historial_evaluaciones'
        }
    };

})();

window.DBModule = DBModule;
console.log('📦 DB Module con creación automática de tablas de historial cargado correctamente.');
