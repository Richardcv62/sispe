// ============================================================
// SISPE - db.js
// Módulo de Base de Datos (USANDO localStorage)
// NO DEPENDE DE SQLite - Funciona siempre
// ============================================================

const DBModule = (function() {
    'use strict';
    
    // ---- VARIABLES PRIVADAS ----
    let isInitialized = false;
    let dbData = {};

    // ---- NOMBRES DE TABLAS ----
    const TABLES = {
        ROLES: 'sispe_roles',
        USUARIOS: 'sispe_usuarios',
        USUARIO_ROLES: 'sispe_usuario_roles',
        ENTIDADES: 'sispe_entidades',
        CARRERAS: 'sispe_carreras',
        GRADUADOS: 'sispe_graduados',
        DOCENTES: 'sispe_docentes',
        EGRESADOS: 'sispe_egresados',
        TUTORES: 'sispe_tutores',
        COORDINADORES: 'sispe_coordinadores',
        DIRECTIVOS: 'sispe_directivos',
        PLANES: 'sispe_planes',
        ACCIONES: 'sispe_acciones',
        TUTORIAS: 'sispe_tutorias',
        EVALUACIONES: 'sispe_evaluaciones',
        EVIDENCIAS: 'sispe_evidencias',
        NOTIFICACIONES: 'sispe_notificaciones'
    };

    // ---- DATOS INICIALES ----
    function getInitialData() {
        return {
            roles: [
                { id: 1, nombre: 'administrador', descripcion: 'Superadministrador del sistema' },
                { id: 2, nombre: 'coordinador', descripcion: 'Coordinador de Carrera' },
                { id: 3, nombre: 'directivo', descripcion: 'Directivo de Entidad' },
                { id: 4, nombre: 'tutor', descripcion: 'Tutor de Egresados' },
                { id: 5, nombre: 'egresado', descripcion: 'Recién Graduado' }
            ],
            usuarios: [
                { id: 1, username: 'admin', password: 'admin123', email: 'admin@sispe.com', nombre: 'Administrador', apellidos: 'Sistema', rol_id: 1, activo: 1, verificado: 1 },
                { id: 2, username: 'carlos.p', password: '123456', email: 'carlos@sispe.com', nombre: 'Carlos', apellidos: 'Pérez', rol_id: 5, activo: 1, verificado: 1 },
                { id: 3, username: 'ana.r', password: '123456', email: 'ana@sispe.com', nombre: 'Ana', apellidos: 'Rodríguez', rol_id: 5, activo: 1, verificado: 1 },
                { id: 4, username: 'maria.g', password: '123456', email: 'maria@sispe.com', nombre: 'María', apellidos: 'Gómez', rol_id: 4, activo: 1, verificado: 1 },
                { id: 5, username: 'pedro.r', password: '123456', email: 'pedro@sispe.com', nombre: 'Pedro', apellidos: 'Ramírez', rol_id: 4, activo: 1, verificado: 1 },
                { id: 6, username: 'coord1', password: '123456', email: 'coord1@sispe.com', nombre: 'Coordinador', apellidos: 'Carrera', rol_id: 2, activo: 1, verificado: 1 },
                { id: 7, username: 'directivo1', password: '123456', email: 'directivo1@sispe.com', nombre: 'Directivo', apellidos: 'Entidad', rol_id: 3, activo: 1, verificado: 1 }
            ],
            entidades: [
                { id: 1, nombre: 'Empresa Citrícola', sector: 'Producción de alimentos', representante: 'Ing. Roberto Méndez', logo: '🍊' },
                { id: 2, nombre: 'Oficina del Turismo', sector: 'Turismo', representante: 'Lic. Mariana Pérez', logo: '🏨' },
                { id: 3, nombre: 'ETECSA', sector: 'Comunicaciones', representante: 'Ing. Carlos Fernández', logo: '📡' },
                { id: 4, nombre: 'Bufete Colectivo', sector: 'Servicios profesionales', representante: 'Dr. Antonio Soto', logo: '⚖️' },
                { id: 5, nombre: 'INDER', sector: 'Servicios profesionales', representante: 'MSc. Luis Herrera', logo: '🏋️' }
            ],
            carreras: [
                { id: 1, nombre: 'Ingeniería Agrónoma', codigo: 'IA-5', duracion_anios: 5 },
                { id: 2, nombre: 'Lic. Contabilidad', codigo: 'LCO-4', duracion_anios: 4 },
                { id: 3, nombre: 'Lic. Derecho', codigo: 'LDE-5', duracion_anios: 5 },
                { id: 4, nombre: 'Ing. Informática', codigo: 'II-5', duracion_anios: 5 },
                { id: 5, nombre: 'Lic. Cultura Física', codigo: 'LCF-4', duracion_anios: 4 },
                { id: 6, nombre: 'Lic. Psicología', codigo: 'LPS-5', duracion_anios: 5 }
            ],
            graduados: [
                { id: 1, numero_identidad: '88010112345', nombre: 'Carlos', apellidos: 'Pérez', carrera_id: 1, anio_graduacion: 2024 },
                { id: 2, numero_identidad: '89020223456', nombre: 'Ana', apellidos: 'Rodríguez', carrera_id: 2, anio_graduacion: 2024 },
                { id: 3, numero_identidad: '90030334567', nombre: 'Luis', apellidos: 'Fernández', carrera_id: 3, anio_graduacion: 2023 }
            ],
            docentes: [
                { id: 1, numero_identidad: '76010112345', nombre: 'María', apellidos: 'Gómez', departamento: 'Ciencias Agrícolas', categoria_docente: 'Principal' },
                { id: 2, numero_identidad: '77020223456', nombre: 'Pedro', apellidos: 'Ramírez', departamento: 'Economía', categoria_docente: 'Auxiliar' }
            ],
            egresados: [
                { id: 1, usuario_id: 2, carrera_id: 1, entidad_id: 1, tutor_id: 1, anio_graduacion: 2024, avatar: '👨‍🌾' },
                { id: 2, usuario_id: 3, carrera_id: 2, entidad_id: 2, tutor_id: 2, anio_graduacion: 2024, avatar: '👩‍💼' }
            ],
            tutores: [
                { id: 1, usuario_id: 4, entidad_id: 1, categoria: 'Principal', anios_experiencia: 15 },
                { id: 2, usuario_id: 5, entidad_id: 2, categoria: 'Auxiliar', anios_experiencia: 8 }
            ],
            planes: [
                { id: 1, egresado_id: 1, tutor_id: 1, anio_plan: 2025, estado: 'activo', progreso: 65 },
                { id: 2, egresado_id: 2, tutor_id: 2, anio_plan: 2025, estado: 'activo', progreso: 80 }
            ],
            acciones: [
                { id: 1, plan_id: 1, titulo: 'Curso de Manejo Integrado de Plagas', estado: 'completado', fecha_limite: '2025-02-28', icono: '🌱' },
                { id: 2, plan_id: 1, titulo: 'Taller de Liderazgo', estado: 'en_progreso', fecha_limite: '2025-03-20', icono: '🤝' },
                { id: 3, plan_id: 2, titulo: 'Curso de Normas Internacionales', estado: 'completado', fecha_limite: '2025-01-28', icono: '📊' }
            ],
            tutorias: [
                { id: 1, egresado_id: 1, tutor_id: 1, fecha: '2025-02-10', resumen: 'Revisión de avances en curso de plagas.' },
                { id: 2, egresado_id: 2, tutor_id: 2, fecha: '2025-02-20', resumen: 'Análisis de dificultades con el sistema contable.' }
            ],
            evaluaciones: [
                { id: 1, egresado_id: 1, tutor_id: 1, dimension: 'Integración Institucional', puntaje: 4, comentario: 'Buena comunicación.' },
                { id: 2, egresado_id: 2, tutor_id: 2, dimension: 'Impacto en Desempeño', puntaje: 5, comentario: 'Excelente aplicación.' }
            ]
        };
    }

    // ---- FUNCIONES PRIVADAS ----
    
    function loadData() {
        try {
            var stored = localStorage.getItem('sispe_db_data');
            if (stored) {
                dbData = JSON.parse(stored);
                console.log('✅ Datos cargados desde localStorage');
                return true;
            }
            return false;
        } catch (e) {
            console.warn('Error al cargar datos:', e);
            return false;
        }
    }

    function saveData() {
        try {
            localStorage.setItem('sispe_db_data', JSON.stringify(dbData));
            return true;
        } catch (e) {
            console.warn('Error al guardar datos:', e);
            return false;
        }
    }

    function initData() {
        dbData = getInitialData();
        saveData();
        console.log('✅ Datos iniciales cargados');
    }

    function getTableData(tableName) {
        if (!dbData[tableName]) {
            dbData[tableName] = [];
        }
        return dbData[tableName];
    }

    function getNextId(tableName) {
        var data = getTableData(tableName);
        if (data.length === 0) return 1;
        var maxId = 0;
        data.forEach(function(item) {
            if (item.id > maxId) maxId = item.id;
        });
        return maxId + 1;
    }

    // ---- API PÚBLICA ----
    
    function init() {
        return new Promise(function(resolve, reject) {
            try {
                if (!loadData()) {
                    initData();
                }
                isInitialized = true;
                console.log('✅ Base de datos (localStorage) inicializada');
                resolve(true);
            } catch (error) {
                reject(new Error('Error al inicializar: ' + error.message));
            }
        });
    }

    function seed() {
        return new Promise(function(resolve, reject) {
            try {
                initData();
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    function query(sql, params) {
        return new Promise(function(resolve, reject) {
            if (!isInitialized) {
                reject(new Error('La base de datos no está inicializada.'));
                return;
            }

            try {
                // Parsear SQL simple para localStorage
                var tableName = null;
                var whereClause = null;
                var whereValue = null;
                var selectAll = false;
                var result = [];

                // Detectar tipo de consulta
                if (sql.toLowerCase().includes('select')) {
                    // SELECT - Extraer nombre de tabla
                    var match = sql.match(/FROM\s+(\w+)/i);
                    if (match) {
                        tableName = match[1];
                    }
                    
                    // Verificar si es SELECT COUNT(*)
                    if (sql.toLowerCase().includes('count(*)')) {
                        var data = getTableData(tableName);
                        resolve([{ total: data.length }]);
                        return;
                    }

                    // Verificar si es SELECT * con WHERE
                    var whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
                    if (whereMatch && params && params.length > 0) {
                        var field = whereMatch[1];
                        var value = params[0];
                        var data = getTableData(tableName);
                        result = data.filter(function(item) {
                            return item[field] == value;
                        });
                        resolve(result);
                        return;
                    }

                    // SELECT * sin WHERE
                    if (tableName) {
                        result = getTableData(tableName);
                        resolve(result);
                        return;
                    }
                }

                // INSERT
                if (sql.toLowerCase().includes('insert')) {
                    // Extraer nombre de tabla
                    var insertMatch = sql.match(/INTO\s+(\w+)/i);
                    if (insertMatch) {
                        tableName = insertMatch[1];
                        // Extraer valores
                        var newItem = {};
                        if (params && params.length > 0) {
                            // Simple: asumir orden de campos
                            var fields = ['id', 'nombre', 'descripcion', 'username', 'password', 'email', 'nombre', 'apellidos', 'rol_id', 'activo', 'verificado'];
                            var data = getTableData(tableName);
                            var id = getNextId(tableName);
                            newItem.id = id;
                            // Mapear parámetros
                            var fieldIndex = 0;
                            for (var key in params) {
                                if (fieldIndex < fields.length) {
                                    newItem[fields[fieldIndex]] = params[key];
                                }
                                fieldIndex++;
                            }
                        }
                        if (Object.keys(newItem).length > 0) {
                            var data = getTableData(tableName);
                            data.push(newItem);
                            saveData();
                            resolve({ lastID: newItem.id, changes: 1 });
                            return;
                        }
                    }
                }

                // UPDATE
                if (sql.toLowerCase().includes('update')) {
                    var updateMatch = sql.match(/UPDATE\s+(\w+)/i);
                    if (updateMatch) {
                        tableName = updateMatch[1];
                        var data = getTableData(tableName);
                        var updated = 0;
                        // Buscar por id (simple)
                        if (params && params.length > 0) {
                            var idToUpdate = params[params.length - 1];
                            var setValues = params.slice(0, -1);
                            data.forEach(function(item) {
                                if (item.id == idToUpdate) {
                                    // Actualizar campos
                                    var fieldIndex = 0;
                                    for (var key in item) {
                                        if (fieldIndex < setValues.length) {
                                            item[key] = setValues[fieldIndex];
                                        }
                                        fieldIndex++;
                                    }
                                    updated++;
                                }
                            });
                        }
                        if (updated > 0) {
                            saveData();
                            resolve({ changes: updated });
                            return;
                        }
                    }
                }

                // DELETE
                if (sql.toLowerCase().includes('delete')) {
                    var deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
                    if (deleteMatch) {
                        tableName = deleteMatch[1];
                        var data = getTableData(tableName);
                        var deleted = 0;
                        if (params && params.length > 0) {
                            var idToDelete = params[0];
                            for (var i = data.length - 1; i >= 0; i--) {
                                if (data[i].id == idToDelete) {
                                    data.splice(i, 1);
                                    deleted++;
                                }
                            }
                        }
                        if (deleted > 0) {
                            saveData();
                            resolve({ changes: deleted });
                            return;
                        }
                    }
                }

                // Si no se procesó nada, devolver array vacío
                resolve([]);

            } catch (error) {
                console.error('Error en query:', error);
                reject(new Error('Error en la consulta: ' + error.message));
            }
        });
    }

    function execute(sql, params) {
        return query(sql, params);
    }

    function isReady() {
        return isInitialized;
    }

    function getConnection() {
        return { db: dbData };
    }

    function exportDB() {
        return new Promise(function(resolve, reject) {
            try {
                var exportData = JSON.stringify(dbData, null, 2);
                resolve(exportData);
            } catch (error) {
                reject(error);
            }
        });
    }

    function importDB(sqlContent) {
        return new Promise(function(resolve, reject) {
            try {
                var data = JSON.parse(sqlContent);
                dbData = data;
                saveData();
                resolve(true);
            } catch (error) {
                reject(new Error('Error al importar: ' + error.message));
            }
        });
    }

    // ---- EXPOSICIÓN ----
    return {
        init: init,
        seed: seed,
        query: query,
        execute: execute,
        getConnection: getConnection,
        isReady: isReady,
        exportDB: exportDB,
        importDB: importDB,
        SCHEMA: '' // Ya no se usa
    };

})();

window.DBModule = DBModule;
console.log('📦 Módulo de Base de Datos (localStorage) cargado correctamente.');
