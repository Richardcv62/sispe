// ============================================================
// SISPE - config.js
// Configuración global de la aplicación
// ============================================================

const CONFIG = {
    // ---- DATOS DE LA APLICACIÓN ----
    APP_NAME: 'SISPE',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Sistema de Preparación para el Empleo',
    INSTITUTION: 'UIJ - Universidad de la Isla de la Juventud',
    YEAR: 2025,
    
    // ---- CONFIGURACIÓN DE BASE DE DATOS ----
    DB: {
        NAME: 'sispe.db',
        VERSION: 1,
        STORE_NAME: 'sispe_data'
    },
    
    // ---- CONFIGURACIÓN DE SESIÓN ----
    SESSION: {
        DURATION: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
        STORAGE_KEY: 'sispe_session'
    },
    
    // ---- CONFIGURACIÓN DE EMAILJS ----
    EMAILJS: {
        PUBLIC_KEY: '-lS0TtNoFq0fQwCEF',
        SERVICE_ID: 'service_ud0ryy7',
        TEMPLATE_ID_SISPE: 'template_uf9imjr'
    },
    
    // ---- ROLES DEL SISTEMA ----
    ROLES: {
        ADMINISTRADOR: 1,
        COORDINADOR: 2,
        DIRECTIVO: 3,
        TUTOR: 4,
        EGRESADO: 5
    },
    
    // ---- SECTORES ESTRATÉGICOS ----
    SECTORES: [
        'Producción de alimentos',
        'Turismo',
        'Comunicaciones',
        'Servicios profesionales'
    ],
    
    // ---- TIPOS DE ACCIONES DEL PLAN ----
    TIPOS_ACCION: [
        'curso',
        'taller',
        'entrenamiento',
        'seminario',
        'proyecto',
        'tutoría'
    ],
    
    // ---- ESTADOS DE LAS ACCIONES ----
    ESTADOS_ACCION: [
        'pendiente',
        'en_progreso',
        'completado',
        'cancelado'
    ],
    
    // ---- DIMENSIONES DE EVALUACIÓN (de la tesis) ----
    DIMENSIONES_EVALUACION: [
        'Integración Institucional',
        'Desarrollo de Competencias',
        'Impacto en Desempeño'
    ],
    
    // ---- MENSAJES DEL SISTEMA ----
    MENSAJES: {
        LOGIN_EXITOSO: '✅ Bienvenido al sistema. Has iniciado sesión correctamente.',
        LOGIN_ERROR: '❌ Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.',
        SESION_EXPIRADA: '⏰ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        GUARDADO_EXITOSO: '✅ Datos guardados correctamente.',
        GUARDADO_ERROR: '❌ Error al guardar los datos. Inténtalo de nuevo.',
        ELIMINADO_EXITOSO: '✅ Registro eliminado correctamente.',
        ELIMINADO_ERROR: '❌ Error al eliminar el registro.',
        SIN_CONEXION: '⚠️ No hay conexión a internet. Los datos se guardarán localmente.',
        CONEXION_RESTAURADA: '✅ Conexión restaurada. Sincronizando datos...'
    }
};

// Exportar para uso global
window.CONFIG = CONFIG;

console.log(`📚 ${CONFIG.APP_NAME} - ${CONFIG.APP_DESCRIPTION}`);
console.log(`🏛️ ${CONFIG.INSTITUTION}`);
console.log(`📅 ${CONFIG.YEAR}`);
console.log(`🔧 Configuración cargada correctamente.`);
console.log(`📧 EmailJS Template ID: ${CONFIG.EMAILJS.TEMPLATE_ID_SISPE}`);
