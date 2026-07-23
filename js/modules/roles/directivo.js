// ============================================================
// SISPE - directivo.js
// Modulo del Directivo - Version completa sin acentos
// ============================================================

const DirectivoModule = (function() {
    'use strict';

    var entidadId = 1;

    function navigate(page) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = '';

        switch(page) {
            case 'dashboard':
                content = renderDashboard();
                break;
            case 'planes':
                content = renderPlanes();
                break;
            case 'estadisticas':
                content = renderEstadisticas();
                break;
            default:
                content = renderDashboard();
        }

        container.innerHTML = content;
        setTimeout(loadData, 200);
    }
	
    // ============================================================
    // CARGAR DATOS DESDE LA BD
    // ============================================================
    async function loadData() {
        try {
            // Obtener el directivo logueado
            var user = AuthModule.getCurrentUser();
            if (user) {
                var directivoResult = await DBModule.query(
                    'SELECT entidad_id FROM directivos WHERE usuario_id = ?',
                    [user.id]
                );
                if (directivoResult.length > 0) {
                    entidadId = directivoResult[0].entidad_id;
                }
            }

            // Obtener datos de la entidad
            var entidad = await DBModule.query(
                'SELECT * FROM entidades WHERE id = ?',
                [entidadId]
            );

            var entidadNombre = entidad.length > 0 ? entidad[0].nombre : 'Sin entidad';
            var entidadLogo = entidad.length > 0 ? (entidad[0].logo || '🏢') : '🏢';

            var nombreEl = document.getElementById('entidad-nombre-display');
            if (nombreEl) nombreEl.textContent = entidadNombre;

            var logoEl = document.getElementById('entidad-logo-display');
            if (logoEl) logoEl.textContent = entidadLogo;

            // Obtener egresados de la entidad
            var egresados = await DBModule.query(
                'SELECT e.*, u.nombre as nombre_usuario, c.nombre as carrera_nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id JOIN carreras c ON e.carrera_id = c.id WHERE e.entidad_id = ?',
                [entidadId]
            );

            // Estadisticas
            var totalEgresados = egresados.length;
            var conPlan = 0;
            var completados = 0;
            var altoProgreso = 0;
            var progresoTotal = 0;

            for (var i = 0; i < egresados.length; i++) {
                var eg = egresados[i];
                var plan = await DBModule.query(
                    'SELECT id, progreso FROM planes_superacion WHERE egresado_id = ? AND estado = "activo"',
                    [eg.id]
                );
                if (plan.length > 0) {
                    conPlan++;
                    var pct = plan[0].progreso || 0;
                    if (pct >= 80) altoProgreso++;
                    if (pct === 100) completados++;
                    progresoTotal += pct;
                }
            }

            var promedio = totalEgresados > 0 ? Math.round(progresoTotal / totalEgresados) : 0;

            var totalEl = document.getElementById('total-egresados');
            if (totalEl) totalEl.textContent = totalEgresados;

            var conPlanEl = document.getElementById('con-plan');
            if (conPlanEl) conPlanEl.textContent = conPlan;

            var completadosEl = document.getElementById('completados');
            if (completadosEl) completadosEl.textContent = completados;

            var promedioEl = document.getElementById('progreso-promedio');
            if (promedioEl) promedioEl.textContent = promedio + '%';

            // Mostrar egresados
            var listaEgresados = document.getElementById('lista-egresados');
            if (listaEgresados) {
                if (egresados.length === 0) {
                    listaEgresados.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay egresados en esta entidad.</td></tr>';
                } else {
                    var html = '';
                    for (var i = 0; i < egresados.length; i++) {
                        var eg = egresados[i];
                        var plan = await DBModule.query(
                            'SELECT id, progreso FROM planes_superacion WHERE egresado_id = ? AND estado = "activo"',
                            [eg.id]
                        );
                        var pct = plan.length > 0 ? (plan[0].progreso || 0) : 0;
                        var color = pct >= 80 ? 'green' : pct >= 50 ? 'gold' : 'danger';
                        var tutor = await DBModule.query(
                            'SELECT u.nombre as tutor_nombre FROM tutores t JOIN usuarios u ON t.usuario_id = u.id WHERE t.id = ?',
                            [eg.tutor_id]
                        );
                        var tutorNombre = tutor.length > 0 ? tutor[0].tutor_nombre : 'Sin asignar';
                        
                        html += '<tr><td><strong>' + (eg.avatar || '') + ' ' + eg.nombre_usuario + '</strong></td>';
                        html += '<td>' + eg.carrera_nombre + '</td>';
                        html += '<td>' + tutorNombre + '</td>';
                        html += '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + pct + '%;"></div></div><span class="progress-pct">' + pct + '%</span></div></td></tr>';
                    }
                    listaEgresados.innerHTML = html;
                }
            }

            // Planes de la entidad
            var listaPlanes = document.getElementById('lista-planes-entidad');
            if (listaPlanes) {
                var planes = [];
                for (var i = 0; i < egresados.length; i++) {
                    var eg = egresados[i];
                    var plan = await DBModule.query(
                        'SELECT * FROM planes_superacion WHERE egresado_id = ? AND estado = "activo"',
                        [eg.id]
                    );
                    if (plan.length > 0) {
                        plan[0].egresado_nombre = eg.nombre_usuario;
                        plan[0].carrera_nombre = eg.carrera_nombre;
                        plan[0].tutor_nombre = 'Sin asignar';
                        // Obtener tutor
                        var tutor = await DBModule.query(
                            'SELECT u.nombre as tutor_nombre FROM tutores t JOIN usuarios u ON t.usuario_id = u.id WHERE t.id = ?',
                            [eg.tutor_id]
                        );
                        if (tutor.length > 0) {
                            plan[0].tutor_nombre = tutor[0].tutor_nombre;
                        }
                        planes.push(plan[0]);
                    }
                }

                if (planes.length === 0) {
                    listaPlanes.innerHTML = '<p class="text-muted">No hay planes activos en esta entidad.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Tutor</th><th>Progreso</th></tr></thead><tbody>';
                    for (var i = 0; i < planes.length; i++) {
                        var p = planes[i];
                        var color = p.progreso >= 80 ? 'green' : p.progreso >= 50 ? 'gold' : 'danger';
                        html += '<tr><td><strong>' + p.egresado_nombre + '</strong></td>';
                        html += '<td>' + p.carrera_nombre + '</td>';
                        html += '<td>' + (p.tutor_nombre || 'Sin asignar') + '</td>';
                        html += '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + (p.progreso || 0) + '%;"></div></div><span class="progress-pct">' + (p.progreso || 0) + '%</span></div></td></tr>';
                    }
                    html += '</tbody></table></div>';
                    listaPlanes.innerHTML = html;
                }
            }

            // Estadisticas
            var estadisticasContainer = document.getElementById('estadisticas-container');
            if (estadisticasContainer) {
                var estadoData = {
                    'Completado (100%)': completados,
                    'Alto (80-99%)': altoProgreso - completados,
                    'Medio (50-79%)': conPlan - altoProgreso,
                    'Bajo (1-49%)': totalEgresados - conPlan
                };

                var html = '<div style="padding:8px 0;">';
                for (var key in estadoData) {
                    html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">';
                    html += '<span>' + key + '</span>';
                    html += '<span class="badge badge-primary">' + estadoData[key] + '</span>';
                    html += '</div>';
                }
                html += '</div>';
                estadisticasContainer.innerHTML = html;
            }

        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    // ============================================================
    // DASHBOARD
    // ============================================================
    function renderDashboard() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-building"></i> Dashboard de la Entidad</h2>
                <div class="breadcrumb"><span id="entidad-logo-display">🏢</span> <span id="entidad-nombre-display">Cargando...</span></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:18px;margin-bottom:24px;">
                <div class="stat-card" style="border-left:4px solid #0a1e3c;">
                    <div class="stat-icon">👥</div>
                    <div class="number" id="total-egresados">0</div>
                    <div class="label">Egresados</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #2a6b9c;">
                    <div class="stat-icon">📋</div>
                    <div class="number" id="con-plan">0</div>
                    <div class="label">Con plan activo</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">✅</div>
                    <div class="number" id="completados">0</div>
                    <div class="label">Plan completado</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">📈</div>
                    <div class="number" id="progreso-promedio">0%</div>
                    <div class="label">Progreso promedio</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-users"></i> Egresados de mi entidad</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Egresado</th>
                                <th>Carrera</th>
                                <th>Tutor</th>
                                <th>Progreso</th>
                            </tr>
                        </thead>
                        <tbody id="lista-egresados">
                            <tr><td colspan="4" class="text-center text-muted">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="card" style="text-align:center;cursor:pointer;" onclick="DirectivoModule.navigate('planes')">
                    <div style="font-size:36px;">📋</div>
                    <h4>Planes de la Entidad</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="DirectivoModule.navigate('estadisticas')">
                    <div style="font-size:36px;">📊</div>
                    <h4>Estadisticas</h4>
                </div>
            </div>
        `;
    }

    // ============================================================
    // PLANES
    // ============================================================
    function renderPlanes() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-clipboard-list"></i> Planes de la Entidad</h2>
                <div class="breadcrumb"><span id="entidad-nombre-display">Cargando...</span></div>
            </div>
            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Planes Activos</div>
                <div id="lista-planes-entidad">
                    <p class="text-muted">Cargando planes...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // ESTADISTICAS
    // ============================================================
    function renderEstadisticas() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-chart-bar"></i> Estadisticas de la Entidad</h2>
                <div class="breadcrumb"><span id="entidad-nombre-display">Cargando...</span></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-user-graduate"></i> Distribucion por Estado</div>
                    <div id="estadisticas-container">
                        <p class="text-muted">Cargando...</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-flag"></i> Resumen General</div>
                    <div style="padding:8px 0;">
                        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                            <span>📊 Progreso Promedio</span>
                            <span class="badge badge-success" id="progreso-promedio">0%</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:6px 0;">
                            <span>👥 Total Egresados</span>
                            <span class="badge badge-primary" id="total-egresados">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    return {
        navigate: navigate
    };

})();

window.DirectivoModule = DirectivoModule;
console.log('DirectivoModule cargado correctamente.');
