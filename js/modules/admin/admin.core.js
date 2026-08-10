// ============================================================
// SISPE - admin.core.js
// Núcleo del Módulo de Administración - CON GRÁFICOS MEJORADOS
// RUTA: js/modules/admin/admin.core.js
// ============================================================

var AdminCore = (function() {
    'use strict';

    var graficosIniciados = false;

    // ============================================================
    // DASHBOARD - CON GRÁFICOS EN TIEMPO REAL
    // ============================================================
    function renderDashboard() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        return `
            <div class="page-header">
                <h2><i class="fas fa-cogs"></i> Panel de Administraci&oacute;n</h2>
                <div class="breadcrumb">Control total del sistema</div>
            </div>

            <!-- Estadísticas Rápidas -->
            <div id="estadisticas-admin">
                <p class="text-muted">Cargando estad&iacute;sticas...</p>
            </div>

            <!-- Gráficos en tiempo real -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-bar"></i> Distribuci&oacute;n por Carrera</div>
                    <div style="height:250px;">
                        <canvas id="admin-chart-carreras"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-pie"></i> Estado de Planes</div>
                    <div style="height:250px;">
                        <canvas id="admin-chart-planes"></canvas>
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin:20px 0;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-line"></i> Progreso de Egresados</div>
                    <div style="height:200px;">
                        <canvas id="admin-chart-progreso"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-calendar-alt"></i> Tutor&iacute;as Mensuales</div>
                    <div style="height:200px;">
                        <canvas id="admin-chart-tutorias"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-star"></i> Evaluaciones</div>
                    <div style="height:200px;">
                        <canvas id="admin-chart-evaluaciones"></canvas>
                    </div>
                </div>
            </div>

            <!-- Accesos Rápidos -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(120px, 1fr));gap:12px;margin-top:16px;">
                ${getQuickAccessItems()}
            </div>
        `;
    }

    // ============================================================
    // ACCESOS RÁPIDOS
    // ============================================================
    function getQuickAccessItems() {
        var items = [
            { icon: '👤', label: 'Usuarios', page: 'usuarios' },
            { icon: '👨‍🎓', label: 'Graduados', page: 'graduados' },
            { icon: '👩‍🏫', label: 'Docentes', page: 'docentes' },
            { icon: '🏢', label: 'Entidades', page: 'entidades' },
            { icon: '🎓', label: 'Carreras', page: 'carreras' },
            { icon: '👥', label: 'Asignar Tutores', page: 'asignar-tutores' },
            { icon: '⭐', label: 'Competencias', page: 'competencias' },
            { icon: '📚', label: 'Cursos', page: 'cursos' },
            { icon: '📅', label: 'Eventos', page: 'eventos' },
            { icon: '🔬', label: 'Investigadores', page: 'investigadores' },
            { icon: '📋', label: 'Proyecto', page: 'proyecto' },
            { icon: '📄', label: 'Reportes', page: 'reportes' }
        ];

        return items.map(function(item) {
            return `
                <div class="card" style="text-align:center;cursor:pointer;padding:12px 8px;" onclick="AdminModule.navigate('${item.page}')">
                    <div style="font-size:28px;">${item.icon}</div>
                    <div style="font-size:11px;color:#64748b;margin-top:4px;">${item.label}</div>
                </div>
            `;
        }).join('');
    }

    // ============================================================
    // INICIAR GRÁFICOS DEL DASHBOARD
    // ============================================================
    async function iniciarGraficos() {
        if (graficosIniciados) return;
        if (typeof DashboardGraficos === 'undefined') {
            console.warn('DashboardGraficos no disponible');
            return;
        }

        try {
            console.log('📊 Iniciando gráficos del dashboard...');

            // Gráfico de barras - Distribución por Carrera
            await DashboardGraficos.crearGraficoBarras('admin-chart-carreras');

            // Gráfico de dona - Estado de Planes
            await DashboardGraficos.crearGraficoDona('admin-chart-planes', 'estado-planes');

            // Gráfico de dona - Progreso de Egresados
            await DashboardGraficos.crearGraficoDona('admin-chart-progreso', 'progreso-egresados');

            // Gráfico de líneas - Tutorías Mensuales
            await DashboardGraficos.crearGraficoLineas('admin-chart-tutorias');

            // Gráfico de dona - Evaluaciones
            await DashboardGraficos.crearGraficoDona('admin-chart-evaluaciones', 'evaluaciones');

            // Iniciar actualización en tiempo real (cada 30 segundos)
            DashboardGraficos.iniciarActualizacion(30000);

            graficosIniciados = true;
            console.log('✅ Gráficos del dashboard iniciados correctamente');

        } catch (error) {
            console.error('Error al iniciar gráficos:', error);
        }
    }

    // ============================================================
    // DESTRUIR GRÁFICOS
    // ============================================================
    function destruirGraficos() {
        if (typeof DashboardGraficos !== 'undefined') {
            DashboardGraficos.detenerActualizacion();
            DashboardGraficos.destruirTodos();
        }
        graficosIniciados = false;
    }

    // ============================================================
    // VERIFICAR SI ES ADMIN
    // ============================================================
    function isAdmin() {
        var user = AuthModule.getCurrentUser();
        return user && (user.rol_nombre === 'administrador' || user.rol_id === 1);
    }

    // ============================================================
    // GENERAR BREADCRUMB
    // ============================================================
    function generateBreadcrumb(pageId) {
        // ... (código existente sin cambios)
    }

    // ============================================================
    // ESTADÍSTICAS GENERALES
    // ============================================================
    async function getEstadisticasGenerales() {
        try {
            var usuarios = await DBModule.query('SELECT COUNT(*) as total FROM usuarios');
            var graduados = await DBModule.query('SELECT COUNT(*) as total FROM graduados');
            var docentes = await DBModule.query('SELECT COUNT(*) as total FROM docentes');
            var entidades = await DBModule.query('SELECT COUNT(*) as total FROM entidades');

            return {
                totalUsuarios: usuarios[0]?.total || 0,
                totalGraduados: graduados[0]?.total || 0,
                totalDocentes: docentes[0]?.total || 0,
                totalEntidades: entidades[0]?.total || 0
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return { totalUsuarios: 0, totalGraduados: 0, totalDocentes: 0, totalEntidades: 0 };
        }
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        // Iniciar gráficos después de cargar el dashboard
        setTimeout(function() {
            iniciarGraficos();
        }, 500);
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
        generateBreadcrumb: generateBreadcrumb,
        isAdmin: isAdmin,
        getEstadisticasGenerales: getEstadisticasGenerales,
        renderDashboard: renderDashboard,
        assignEvents: assignEvents,
        iniciarGraficos: iniciarGraficos,
        destruirGraficos: destruirGraficos
    };

})();

window.AdminCore = AdminCore;
console.log('✅ AdminCore con gráficos mejorados cargado correctamente.');