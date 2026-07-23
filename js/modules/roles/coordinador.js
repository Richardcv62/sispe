// ============================================================
// SISPE - coordinador.js
// Modulo del Coordinador - Version completa sin acentos
// ============================================================

const CoordinadorModule = (function() {
    'use strict';

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
            case 'entidades':
                content = renderEntidades();
                break;
            case 'reportes':
                content = renderReportes();
                break;
            default:
                content = renderDashboard();
        }

        container.innerHTML = content;
        setTimeout(assignEvents, 100);
        setTimeout(loadData, 200);
    }
	
    // ============================================================
    // CARGAR DATOS DESDE LA BD
    // ============================================================
    async function loadData() {
        try {
            // Estadisticas generales
            var egresados = await DBModule.query('SELECT COUNT(*) as total FROM egresados');
            var totalEgresados = egresados[0]?.total || 0;
            var totalEl = document.getElementById('total-egresados');
            if (totalEl) totalEl.textContent = totalEgresados;

            var entidades = await DBModule.query('SELECT COUNT(*) as total FROM entidades');
            var totalEntidades = entidades[0]?.total || 0;
            var entEl = document.getElementById('total-entidades');
            if (entEl) entEl.textContent = totalEntidades;

            var acciones = await DBModule.query('SELECT COUNT(*) as total FROM acciones_plan');
            var totalAcciones = acciones[0]?.total || 0;
            var accEl = document.getElementById('total-acciones');
            if (accEl) accEl.textContent = totalAcciones;

            var completadas = await DBModule.query('SELECT COUNT(*) as total FROM acciones_plan WHERE estado = "completado"');
            var totalCompletadas = completadas[0]?.total || 0;
            var pct = totalAcciones > 0 ? Math.round((totalCompletadas / totalAcciones) * 100) : 0;
            var pctEl = document.getElementById('progreso-general');
            if (pctEl) pctEl.textContent = pct + '%';

            // Lista de entidades
            var entidadesList = await DBModule.query('SELECT * FROM entidades ORDER BY nombre');
            var listaEntidades = document.getElementById('lista-entidades');
            if (listaEntidades) {
                if (entidadesList.length === 0) {
                    listaEntidades.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay entidades registradas.</td></tr>';
                } else {
                    var html = '';
                    for (var i = 0; i < entidadesList.length; i++) {
                        var ent = entidadesList[i];
                        var count = await DBModule.query('SELECT COUNT(*) as total FROM egresados WHERE entidad_id = ?', [ent.id]);
                        html += '<tr><td style="font-size:28px;">' + (ent.logo || '🏢') + '</td>';
                        html += '<td><strong>' + ent.nombre + '</strong></td>';
                        html += '<td><span class="badge badge-info">' + (ent.sector || 'Sin sector') + '</span></td>';
                        html += '<td>' + (ent.representante || 'Sin representante') + '</td>';
                        html += '<td><span class="badge badge-primary">' + (count[0]?.total || 0) + '</span></td></tr>';
                    }
                    listaEntidades.innerHTML = html;
                }
            }

            // Cargar sectores
            await cargarSectores();
            await cargarCarreras();
            await cargarReporteGeneral();
            await cargarPlanes();

        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    async function cargarSectores() {
        try {
            var sectores = ['Produccion de alimentos', 'Turismo', 'Comunicaciones', 'Servicios profesionales'];
            var ids = ['sector-produccion', 'sector-turismo', 'sector-comunicaciones', 'sector-servicios'];
            
            for (var i = 0; i < sectores.length; i++) {
                var count = await DBModule.query(
                    'SELECT COUNT(*) as total FROM entidades WHERE sector = ?',
                    [sectores[i]]
                );
                var el = document.getElementById(ids[i]);
                if (el) el.textContent = count[0]?.total || 0;
            }
        } catch (error) {
            console.error('Error al cargar sectores:', error);
        }
    }

    async function cargarCarreras() {
        try {
            var carreras = await DBModule.query('SELECT * FROM carreras');
            var container = document.getElementById('carreras-container');
            if (!container) return;

            if (carreras.length === 0) {
                container.innerHTML = '<p class="text-muted">No hay carreras registradas.</p>';
                return;
            }

            var html = '';
            for (var i = 0; i < carreras.length; i++) {
                var c = carreras[i];
                var count = await DBModule.query(
                    'SELECT COUNT(*) as total FROM egresados WHERE carrera_id = ?',
                    [c.id]
                );
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e2e8f0;">';
                html += '<div><strong>' + c.nombre + '</strong> <span style="color:#64748b;font-size:13px;">(' + (count[0]?.total || 0) + ')</span></div>';
                html += '</div>';
            }
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al cargar carreras:', error);
        }
    }

    async function cargarReporteGeneral() {
        try {
            var container = document.getElementById('reporte-general');
            if (!container) return;

            var egresados = await DBModule.query('SELECT COUNT(*) as total FROM egresados');
            var planes = await DBModule.query('SELECT COUNT(*) as total FROM planes_superacion WHERE estado = "activo"');
            var acciones = await DBModule.query('SELECT COUNT(*) as total FROM acciones_plan');
            var completadas = await DBModule.query('SELECT COUNT(*) as total FROM acciones_plan WHERE estado = "completado"');
            var pct = acciones[0]?.total > 0 ? Math.round((completadas[0]?.total || 0) / (acciones[0]?.total || 0) * 100) : 0;

            container.innerHTML = `
                <div style="padding:12px 0;">
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Total Egresados</span>
                        <span class="badge badge-primary">${egresados[0]?.total || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Planes Activos</span>
                        <span class="badge badge-success">${planes[0]?.total || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Acciones Totales</span>
                        <span class="badge badge-info">${acciones[0]?.total || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;">
                        <span>Progreso General</span>
                        <span class="badge ${pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger'}">${pct}%</span>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error al cargar reporte:', error);
        }
    }

    async function cargarPlanes() {
        try {
            var container = document.getElementById('lista-planes');
            if (!container) return;

            var planes = await DBModule.query(
                'SELECT p.*, u.nombre as egresado_nombre, c.nombre as carrera_nombre, ent.nombre as entidad_nombre, t.nombre as tutor_nombre FROM planes_superacion p JOIN egresados e ON p.egresado_id = e.id JOIN usuarios u ON e.usuario_id = u.id JOIN carreras c ON e.carrera_id = c.id JOIN entidades ent ON e.entidad_id = ent.id LEFT JOIN tutores tu ON p.tutor_id = tu.id LEFT JOIN usuarios t ON tu.usuario_id = t.id WHERE p.estado = "activo" ORDER BY p.anio_plan DESC'
            );

            if (planes.length === 0) {
                container.innerHTML = '<p class="text-muted">No hay planes activos.</p>';
                return;
            }

            var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Entidad</th><th>Tutor</th><th>Progreso</th></tr></thead><tbody>';
            for (var i = 0; i < planes.length; i++) {
                var p = planes[i];
                var color = p.progreso >= 80 ? 'green' : p.progreso >= 50 ? 'gold' : 'danger';
                html += '<tr><td><strong>' + p.egresado_nombre + '</strong></td>';
                html += '<td>' + p.carrera_nombre + '</td>';
                html += '<td>' + p.entidad_nombre + '</td>';
                html += '<td>' + (p.tutor_nombre || 'Sin asignar') + '</td>';
                html += '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + (p.progreso || 0) + '%;"></div></div><span class="progress-pct">' + (p.progreso || 0) + '%</span></div></td></tr>';
            }
            html += '</tbody></table></div>';
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al cargar planes:', error);
        }
    }

    // ============================================================
    // DASHBOARD
    // ============================================================
    function renderDashboard() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-gauge-high"></i> Panel de Coordinacion</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Coordinador</div>
            </div>

            <div class="stats-grid">
                <div class="stat-card" style="border-left:4px solid #0a1e3c;">
                    <div class="stat-icon">👨‍🎓</div>
                    <div class="number" id="total-egresados">0</div>
                    <div class="label">Egresados en superacion</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #2a6b9c;">
                    <div class="stat-icon">🏢</div>
                    <div class="number" id="total-entidades">0</div>
                    <div class="label">Entidades vinculadas</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">📋</div>
                    <div class="number" id="total-acciones">0</div>
                    <div class="label">Acciones de superacion</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">📈</div>
                    <div class="number" id="progreso-general">0%</div>
                    <div class="label">Progreso general</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-building"></i> Entidades por Sector</div>
                    <div id="sectores-container">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                            <div style="background:#f1f4f8;padding:16px;border-radius:10px;text-align:center;">
                                <div style="font-size:28px;">🌾</div>
                                <div style="font-size:24px;font-weight:800;color:#0a1e3c;" id="sector-produccion">0</div>
                                <div style="font-size:13px;color:#64748b;">Produccion</div>
                            </div>
                            <div style="background:#f1f4f8;padding:16px;border-radius:10px;text-align:center;">
                                <div style="font-size:28px;">🏨</div>
                                <div style="font-size:24px;font-weight:800;color:#0a1e3c;" id="sector-turismo">0</div>
                                <div style="font-size:13px;color:#64748b;">Turismo</div>
                            </div>
                            <div style="background:#f1f4f8;padding:16px;border-radius:10px;text-align:center;">
                                <div style="font-size:28px;">📡</div>
                                <div style="font-size:24px;font-weight:800;color:#0a1e3c;" id="sector-comunicaciones">0</div>
                                <div style="font-size:13px;color:#64748b;">Comunicaciones</div>
                            </div>
                            <div style="background:#f1f4f8;padding:16px;border-radius:10px;text-align:center;">
                                <div style="font-size:28px;">⚖️</div>
                                <div style="font-size:24px;font-weight:800;color:#0a1e3c;" id="sector-servicios">0</div>
                                <div style="font-size:13px;color:#64748b;">Servicios</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-graduation-cap"></i> Egresados por Carrera</div>
                    <div id="carreras-container">
                        <p class="text-muted">Cargando...</p>
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                <div class="card" style="text-align:center;cursor:pointer;" onclick="CoordinadorModule.navigate('planes')">
                    <div style="font-size:36px;">📋</div>
                    <h4>Gestion de Planes</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="CoordinadorModule.navigate('entidades')">
                    <div style="font-size:36px;">🏢</div>
                    <h4>Entidades</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="CoordinadorModule.navigate('reportes')">
                    <div style="font-size:36px;">📊</div>
                    <h4>Reportes</h4>
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
                <h2><i class="fas fa-clipboard-check"></i> Gestion de Planes</h2>
                <div class="breadcrumb">Supervision de planes</div>
            </div>
            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Todos los Planes Activos</div>
                <div id="lista-planes">
                    <p class="text-muted">Cargando planes...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // ENTIDADES (CON FORMULARIO)
    // ============================================================
    function renderEntidades() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-building"></i> Gestion de Entidades</h2>
                <div class="breadcrumb">Administrar entidades vinculadas</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="CoordinadorModule.mostrarFormularioEntidad()">
                    <i class="fas fa-plus"></i> Nueva Entidad
                </button>
            </div>

            <div id="formulario-entidad-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Entidades</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Logo</th>
                                <th>Nombre</th>
                                <th>Sector</th>
                                <th>Representante</th>
                                <th>Egresados</th>
                            </tr>
                        </thead>
                        <tbody id="lista-entidades">
                            <tr><td colspan="5" class="text-center text-muted">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // ============================================================
    // REPORTES
    // ============================================================
    function renderReportes() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-file-pdf"></i> Reportes</h2>
                <div class="breadcrumb">Generacion de reportes</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-bar"></i> Reporte General</div>
                    <div id="reporte-general">
                        <p class="text-muted">Cargando estadisticas...</p>
                    </div>
                    <div style="display:flex;gap:12px;margin-top:12px;">
                        <button class="btn btn-primary" onclick="CoordinadorModule.generarPDF()"><i class="fas fa-file-pdf"></i> Generar PDF</button>
                        <button class="btn btn-secondary" onclick="CoordinadorModule.exportarExcel()"><i class="fas fa-file-excel"></i> Exportar Excel</button>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-download"></i> Exportar Datos</div>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <button class="btn btn-outline btn-block" onclick="CoordinadorModule.exportarEgresados()"><i class="fas fa-user-graduate"></i> Exportar Egresados</button>
                        <button class="btn btn-outline btn-block" onclick="CoordinadorModule.exportarPlanes()"><i class="fas fa-clipboard-list"></i> Exportar Planes</button>
                        <button class="btn btn-outline btn-block" onclick="CoordinadorModule.exportarEntidades()"><i class="fas fa-building"></i> Exportar Entidades</button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // FORMULARIO ENTIDAD
    // ============================================================
    function mostrarFormularioEntidad(entidadId) {
        var container = document.getElementById('formulario-entidad-container');
        if (!container) return;

        container.innerHTML = `
            <div class="card" style="border:2px solid #2a6b9c;">
                <div class="card-title"><i class="fas fa-plus-circle"></i> Nueva Entidad</div>
                <form id="form-entidad">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nombre <span class="required">*</span></label>
                            <input type="text" id="entidad-nombre" required>
                        </div>
                        <div class="form-group">
                            <label>Sector</label>
                            <select id="entidad-sector">
                                <option value="">Selecciona...</option>
                                <option value="Produccion de alimentos">🌾 Produccion de alimentos</option>
                                <option value="Turismo">🏨 Turismo</option>
                                <option value="Comunicaciones">📡 Comunicaciones</option>
                                <option value="Servicios profesionales">⚖️ Servicios profesionales</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Representante</label>
                            <input type="text" id="entidad-representante">
                        </div>
                        <div class="form-group">
                            <label>Telefono</label>
                            <input type="text" id="entidad-telefono">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Logo (emoji)</label>
                        <input type="text" id="entidad-logo" placeholder="Ej: 🏢" maxlength="2" style="width:60px;">
                    </div>
                    <div style="display:flex;gap:12px;margin-top:16px;">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar</button>
                        <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-entidad-container').innerHTML=''">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('form-entidad').addEventListener('submit', async function(e) {
            e.preventDefault();
            var nombre = document.getElementById('entidad-nombre').value.trim();
            if (!nombre) {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showWarning('El nombre es obligatorio.');
                }
                return;
            }

            try {
                await DBModule.execute(
                    'INSERT INTO entidades (nombre, sector, representante, telefono, logo) VALUES (?, ?, ?, ?, ?)',
                    [
                        nombre,
                        document.getElementById('entidad-sector').value,
                        document.getElementById('entidad-representante').value.trim(),
                        document.getElementById('entidad-telefono').value.trim(),
                        document.getElementById('entidad-logo').value || '🏢'
                    ]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Entidad creada correctamente.', 'success');
                }
                container.innerHTML = '';
                loadData();
            } catch (error) {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al crear entidad.', 'error');
                }
            }
        });
    }

    // ============================================================
    // FUNCIONES DE EXPORTACION (placeholder)
    // ============================================================
    function generarPDF() {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Generando PDF... (en desarrollo)', 'info');
        }
    }

    function exportarExcel() {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportando Excel... (en desarrollo)', 'info');
        }
    }

    function exportarEgresados() {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportando egresados... (en desarrollo)', 'info');
        }
    }

    function exportarPlanes() {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportando planes... (en desarrollo)', 'info');
        }
    }

    function exportarEntidades() {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportando entidades... (en desarrollo)', 'info');
        }
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        // Los eventos se manejan en loadData y en los botones inline
    }

    return {
        navigate: navigate,
        mostrarFormularioEntidad: mostrarFormularioEntidad,
        generarPDF: generarPDF,
        exportarExcel: exportarExcel,
        exportarEgresados: exportarEgresados,
        exportarPlanes: exportarPlanes,
        exportarEntidades: exportarEntidades
    };

})();

window.CoordinadorModule = CoordinadorModule;
console.log('CoordinadorModule cargado correctamente.');
