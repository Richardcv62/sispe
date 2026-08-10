// ============================================================
// SISPE - loader.js
// Gestor de Lazy Loading para módulos funcionales
// RUTA: js/modules/loader.js
// ============================================================

const ModuleLoader = (function() {
    'use strict';

    var loadedModules = {};
    var loadingModules = {};

    const MODULES = {
        // Módulos funcionales
        'competencias': {
            path: 'js/modules/competencias.js',
            moduleName: 'CompetenciasModule'
        },
        'cursos': {
            path: 'js/modules/cursos.js',
            moduleName: 'CursosModule'
        },
        'eventos': {
            path: 'js/modules/eventos.js',
            moduleName: 'EventosModule'
        },
        'proyecto': {
            path: 'js/modules/proyecto.js',
            moduleName: 'ProyectoModule'
        },
        'investigadores': {
            path: 'js/modules/investigadores.js',
            moduleName: 'InvestigadoresModule'
        },
        'chat': {
            path: 'js/modules/chat.js',
            moduleName: 'ChatModule'
        },
        'calendario': {
            path: 'js/modules/calendario.js',
            moduleName: 'CalendarioModule'
        },
        'reports': {
            path: 'js/modules/reports.js',
            moduleName: 'ReportsModule'
        },
        'sync': {
            path: 'js/modules/sync.js',
            moduleName: 'SyncModule'
        },
        // Roles
        'egresado': {
            path: 'js/modules/roles/egresado.js',
            moduleName: 'EgresadoModule'
        },
        'tutor': {
            path: 'js/modules/roles/tutor.js',
            moduleName: 'TutorModule'
        },
        'coordinador': {
            path: 'js/modules/roles/coordinador.js',
            moduleName: 'CoordinadorModule'
        },
        'directivo': {
            path: 'js/modules/roles/directivo.js',
            moduleName: 'DirectivoModule'
        },
        'admin': {
            path: 'js/modules/admin/index.js',
            moduleName: 'AdminModule'
        }
    };

    // ============================================================
    // CARGAR MÓDULO
    // ============================================================
    function load(moduleKey) {
        return new Promise((resolve, reject) => {
            // Si ya está cargado
            if (loadedModules[moduleKey]) {
                console.log(`✅ Módulo "${moduleKey}" ya cargado`);
                resolve(window[MODULES[moduleKey]?.moduleName]);
                return;
            }

            // Si ya se está cargando, esperar
            if (loadingModules[moduleKey]) {
                console.log(`⏳ Módulo "${moduleKey}" ya se está cargando...`);
                // Esperar a que termine
                const checkInterval = setInterval(() => {
                    if (loadedModules[moduleKey]) {
                        clearInterval(checkInterval);
                        resolve(window[MODULES[moduleKey]?.moduleName]);
                    }
                }, 100);
                return;
            }

            const moduleInfo = MODULES[moduleKey];
            if (!moduleInfo) {
                reject(new Error(`Módulo "${moduleKey}" no encontrado`));
                return;
            }

            loadingModules[moduleKey] = true;
            console.log(`📦 Cargando módulo: ${moduleKey}`);

            const script = document.createElement('script');
            script.src = moduleInfo.path;
            script.async = true;

            script.onload = function() {
                loadedModules[moduleKey] = true;
                loadingModules[moduleKey] = false;
                const module = window[moduleInfo.moduleName];
                if (module) {
                    console.log(`✅ Módulo "${moduleKey}" cargado`);
                    resolve(module);
                } else {
                    reject(new Error(`Módulo "${moduleKey}" no se encontró en window`));
                }
            };

            script.onerror = function() {
                loadingModules[moduleKey] = false;
                reject(new Error(`Error al cargar módulo "${moduleKey}"`));
            };

            document.head.appendChild(script);

            // Timeout
            setTimeout(() => {
                if (!loadedModules[moduleKey]) {
                    loadingModules[moduleKey] = false;
                    reject(new Error(`Timeout cargando módulo "${moduleKey}"`));
                }
            }, 15000);
        });
    }

    // ============================================================
    // PRECARGAR MÓDULOS
    // ============================================================
    function preload(moduleKeys) {
        moduleKeys.forEach(key => {
            if (!loadedModules[key] && !loadingModules[key]) {
                load(key).catch(() => {});
            }
        });
    }

    // ============================================================
    // ESTADO
    // ============================================================
    function getStatus() {
        return {
            loaded: Object.keys(loadedModules),
            loading: Object.keys(loadingModules).filter(k => loadingModules[k])
        };
    }

    // ============================================================
    // API PÚBLICA
    // ============================================================
    return {
        load: load,
        preload: preload,
        getStatus: getStatus,
        isLoaded: function(moduleKey) {
            return !!loadedModules[moduleKey];
        },
        reset: function() {
            loadedModules = {};
            loadingModules = {};
        }
    };

})();

window.ModuleLoader = ModuleLoader;
console.log('📦 ModuleLoader cargado correctamente');