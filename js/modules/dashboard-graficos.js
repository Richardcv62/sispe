// ============================================================
// SISPE - dashboard-graficos.js
// Módulo de Gráficos en Tiempo Real para Dashboards
// RUTA: js/modules/dashboard-graficos.js
// ============================================================

const DashboardGraficos = (function() {
    'use strict';

    var charts = {};
    var intervaloActualizacion = null;

    // ============================================================
    // INICIAR ACTUALIZACIÓN EN TIEMPO REAL
    // ============================================================
    function iniciarActualizacion(intervalo) {
        intervalo = intervalo || 30000; // 30 segundos por defecto
        
        if (intervaloActualizacion) {
            clearInterval(intervaloActualizacion);
        }
        
        intervaloActualizacion = setInterval(function() {
            actualizarTodosLosGraficos();
        }, intervalo);
        
        console.log(`📊 Actualización en tiempo real iniciada (cada ${intervalo/1000}s)`);
    }

    // ============================================================
    // DETENER ACTUALIZACIÓN
    // ============================================================
    function detenerActualizacion() {
        if (intervaloActualizacion) {
            clearInterval(intervaloActualizacion);
            intervaloActualizacion = null;
            console.log('📊 Actualización en tiempo real detenida');
        }
    }

    // ============================================================
    // ACTUALIZAR TODOS LOS GRÁFICOS
    // ============================================================
    async function actualizarTodosLosGraficos() {
        for (var key in charts) {
            if (charts[key] && typeof charts[key].update === 'function') {
                try {
                    await actualizarGrafico(key);
                } catch (error) {
                    console.warn(`Error actualizando gráfico ${key}:`, error);
                }
            }
        }
    }

    // ============================================================
    // ACTUALIZAR UN GRÁFICO ESPECÍFICO
    // ============================================================
    async function actualizarGrafico(key) {
        var chart = charts[key];
        if (!chart) return;

        var data = await obtenerDatosGrafico(key);
        if (data) {
            chart.data = data;
            chart.update();
        }
    }

    // ============================================================
    // OBTENER DATOS PARA GRÁFICO
    // ============================================================
    async function obtenerDatosGrafico(key) {
        try {
            switch(key) {
                case 'distribucion-carreras':
                    return await getDatosCarreras();
                case 'estado-planes':
                    return await getDatosEstadoPlanes();
                case 'progreso-egresados':
                    return await getDatosProgreso();
                case 'tutorias-mensuales':
                    return await getDatosTutorias();
                case 'evaluaciones':
                    return await getDatosEvaluaciones();
                default:
                    return null;
            }
        } catch (error) {
            console.error(`Error obteniendo datos para ${key}:`, error);
            return null;
        }
    }

    // ============================================================
    // DATOS: DISTRIBUCIÓN POR CARRERAS
    // ============================================================
    async function getDatosCarreras() {
        var carreras = await DBModule.query(`
            SELECT c.nombre, COUNT(e.id) as total 
            FROM carreras c 
            LEFT JOIN egresados e ON c.id = e.carrera_id 
            GROUP BY c.id
        `);

        var colores = ['#0a1e3c', '#1a3a6a', '#2a6b9c', '#4a9ad9', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997'];

        return {
            labels: carreras.map(c => c.nombre),
            datasets: [{
                label: 'Egresados por Carrera',
                data: carreras.map(c => c.total),
                backgroundColor: carreras.map((c, i) => colores[i % colores.length]),
                borderColor: '#0a1e3c',
                borderWidth: 1
            }]
        };
    }

    // ============================================================
    // DATOS: ESTADO DE PLANES
    // ============================================================
    async function getDatosEstadoPlanes() {
        var estados = await DBModule.query(`
            SELECT estado, COUNT(*) as total 
            FROM planes_superacion 
            GROUP BY estado
        `);

        var colores = {
            'activo': '#2a6b9c',
            'pendiente': '#d48a2a',
            'completado': '#1a8a4a',
            'cancelado': '#b33a4a'
        };

        return {
            labels: estados.map(e => e.estado || 'Sin estado'),
            datasets: [{
                data: estados.map(e => e.total),
                backgroundColor: estados.map(e => colores[e.estado] || '#94a3b8'),
                borderWidth: 0
            }]
        };
    }

    // ============================================================
    // DATOS: PROGRESO DE EGRESADOS
    // ============================================================
    async function getDatosProgreso() {
        var rangos = [
            { label: 'Progreso Alto (80-100%)', min: 80, max: 100 },
            { label: 'En Desarrollo (50-79%)', min: 50, max: 79 },
            { label: 'Progreso Bajo (1-49%)', min: 1, max: 49 },
            { label: 'Sin Iniciar (0%)', min: 0, max: 0 }
        ];

        var resultados = [];
        for (var i = 0; i < rangos.length; i++) {
            var r = rangos[i];
            var result = await DBModule.query(
                'SELECT COUNT(*) as total FROM planes_superacion WHERE progreso >= ? AND progreso <= ? AND estado = "activo"',
                [r.min, r.max]
            );
            resultados.push(result[0]?.total || 0);
        }

        var colores = ['#1a8a4a', '#4a9ad9', '#d48a2a', '#94a3b8'];

        return {
            labels: rangos.map(r => r.label),
            datasets: [{
                data: resultados,
                backgroundColor: colores,
                borderWidth: 0
            }]
        };
    }

    // ============================================================
    // DATOS: TUTORÍAS MENSUALES
    // ============================================================
    async function getDatosTutorias() {
        var meses = [];
        var datos = [];
        
        for (var i = 5; i >= 0; i--) {
            var fecha = new Date();
            fecha.setMonth(fecha.getMonth() - i);
            var mes = String(fecha.getMonth() + 1).padStart(2, '0');
            var año = fecha.getFullYear();
            var label = fecha.toLocaleString('es', { month: 'short' });
            
            meses.push(label);
            
            var result = await DBModule.query(
                `SELECT COUNT(*) as total FROM tutorias 
                 WHERE strftime('%Y-%m', fecha) = ?`,
                [`${año}-${mes}`]
            );
            datos.push(result[0]?.total || 0);
        }

        return {
            labels: meses,
            datasets: [{
                label: 'Tutorías',
                data: datos,
                borderColor: '#2a6b9c',
                backgroundColor: 'rgba(42, 107, 156, 0.1)',
                fill: true,
                tension: 0.3
            }]
        };
    }

    // ============================================================
    // DATOS: EVALUACIONES
    // ============================================================
    async function getDatosEvaluaciones() {
        var evaluaciones = await DBModule.query(`
            SELECT 
                CASE 
                    WHEN puntaje >= 4 THEN 'Excelente (4-5)'
                    WHEN puntaje >= 3 THEN 'Adecuado (3)'
                    ELSE 'Mejorable (1-2)'
                END as nivel,
                COUNT(*) as total
            FROM evaluaciones 
            GROUP BY nivel
        `);

        var colores = ['#1a8a4a', '#4a9ad9', '#b33a4a'];

        return {
            labels: evaluaciones.map(e => e.nivel),
            datasets: [{
                data: evaluaciones.map(e => e.total),
                backgroundColor: colores.slice(0, evaluaciones.length),
                borderWidth: 0
            }]
        };
    }

    // ============================================================
    // CREAR GRÁFICO
    // ============================================================
    function crearGrafico(elementId, type, data, options) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js no está disponible');
            return null;
        }

        var ctx = document.getElementById(elementId);
        if (!ctx) return null;

        // Destruir gráfico existente
        if (charts[elementId]) {
            charts[elementId].destroy();
            delete charts[elementId];
        }

        var config = {
            type: type,
            data: data,
            options: options || {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
                }
            }
        };

        var chart = new Chart(ctx, config);
        charts[elementId] = chart;
        
        return chart;
    }

    // ============================================================
    // CREAR GRÁFICO DE BARRAS
    // ============================================================
    async function crearGraficoBarras(elementId, label, color) {
        var data = await getDatosCarreras();
        if (!data) return null;

        var options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' egresados';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        };

        return crearGrafico(elementId, 'bar', data, options);
    }

    // ============================================================
    // CREAR GRÁFICO DE DONA
    // ============================================================
    async function crearGraficoDona(elementId, dataKey) {
        var data = await obtenerDatosGrafico(dataKey);
        if (!data) return null;

        var options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
            }
        };

        return crearGrafico(elementId, 'doughnut', data, options);
    }

    // ============================================================
    // CREAR GRÁFICO DE LÍNEAS (Tutorías)
    // ============================================================
    async function crearGraficoLineas(elementId) {
        var data = await getDatosTutorias();
        if (!data) return null;

        var options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        };

        return crearGrafico(elementId, 'line', data, options);
    }

    // ============================================================
    // DESTRUIR TODOS LOS GRÁFICOS
    // ============================================================
    function destruirTodos() {
        for (var key in charts) {
            if (charts[key]) {
                charts[key].destroy();
            }
        }
        charts = {};
    }

    // ============================================================
    // API PÚBLICA
    // ============================================================
    return {
        crearGrafico: crearGrafico,
        crearGraficoBarras: crearGraficoBarras,
        crearGraficoDona: crearGraficoDona,
        crearGraficoLineas: crearGraficoLineas,
        actualizarGrafico: actualizarGrafico,
        actualizarTodosLosGraficos: actualizarTodosLosGraficos,
        iniciarActualizacion: iniciarActualizacion,
        detenerActualizacion: detenerActualizacion,
        destruirTodos: destruirTodos,
        obtenerDatosGrafico: obtenerDatosGrafico,
        getDatosCarreras: getDatosCarreras,
        getDatosEstadoPlanes: getDatosEstadoPlanes,
        getDatosProgreso: getDatosProgreso,
        getDatosTutorias: getDatosTutorias,
        getDatosEvaluaciones: getDatosEvaluaciones
    };

})();

window.DashboardGraficos = DashboardGraficos;
console.log('📊 Módulo de Gráficos en Tiempo Real cargado correctamente.');