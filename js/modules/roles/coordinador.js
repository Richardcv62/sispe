// ============================================================
// SISPE - coordinador.js
// Modulo del Coordinador - CON MODALES Y PERSISTENCIA
// RUTA: js/modules/roles/coordinador.js
// ============================================================

const CoordinadorModule = (function() {
    'use strict';

    function navigate(page, breadcrumb) {
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
            case 'competencias':
                if (window.CompetenciasModule && typeof window.CompetenciasModule.navigate === 'function') {
                    window.CompetenciasModule.navigate('competencias', breadcrumb);
                    return;
                }
                content = renderCompetencias();
                break;
            case 'cursos':
                if (window.CursosModule && typeof window.CursosModule.navigate === 'function') {
                    window.CursosModule.navigate('cursos', breadcrumb);
                    return;
                }
                content = renderCursos();
                break;
            case 'eventos':
                if (window.EventosModule && typeof window.EventosModule.navigate === 'function') {
                    window.EventosModule.navigate('eventos', breadcrumb);
                    return;
                }
                content = renderEventos();
                break;
            case 'reportes':
                content = renderReportes();
                break;
            default:
                content = renderDashboard();
        }

        if (breadcrumb) {
            container.innerHTML = breadcrumb + content;
        } else {
            container.innerHTML = content;
        }
        setTimeout(assignEvents, 100);
        setTimeout(loadData, 200);
    }

    // ============================================================
    // CARGAR DATOS DESDE LA BD
    // ============================================================
    async function loadData() {
        try {
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

            var entidadesList = await DBModule.query('SELECT * FROM entidades ORDER BY nombre');
            var listaEntidades = document.getElementById('lista-entidades');
            if (listaEntidades) {
                if (entidadesList.length === 0) {
                    listaEntidades.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay entidades registradas.</td></tr>';
                } else {
                    var html = '';
                    for (var i = 0; i < entidadesList.length; i++) {
                        var ent = entidadesList[i];
                        var logo = ent.logo || '??';
                        var count = await DBModule.query('SELECT COUNT(*) as total FROM egresados WHERE entidad_id = ?', [ent.id]);
                        html += `<tr>
                            <td style="font-size:28px;text-align:center;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;line-height:1.4;">${logo}</td>
                            <td style="font-weight:600;color:#0a1e3c;">${ent.nombre}</td>
                            <td><span class="badge badge-info" style="font-size:13px;">${ent.sector || 'Sin sector'}</span></td>
                            <td>${ent.representante || 'Sin representante'}</td>
                            <td style="text-align:center;"><span class="badge badge-primary">${count[0]?.total || 0}</span></td>
                        </tr>`;
                    }
                    listaEntidades.innerHTML = html;
                }
            }

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
            var sectores = [
                { nombre: 'Turismo', emoji: '??' },
                { nombre: 'Agroindustria', emoji: '??' },
                { nombre: 'Industria Alimenticia', emoji: '??' },
                { nombre: 'Energía', emoji: '?' },
                { nombre: 'Comunicaciones', emoji: '??' },
                { nombre: 'Minería', emoji: '??' },
                { nombre: 'Pesca', emoji: '??' },
                { nombre: 'Reciclaje', emoji: '??' },
                { nombre: 'Salud', emoji: '??' },
                { nombre: 'Educación', emoji: '??' },
                { nombre: 'Justicia', emoji: '??' },
                { nombre: 'Economía', emoji: '??' },
                { nombre: 'Ciencia', emoji: '??' },
                { nombre: 'Control', emoji: '??' }
            ];
            
            var container = document.getElementById('sectores-container');
            if (!container) return;

            var html = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;">';
            for (var i = 0; i < sectores.length; i++) {
                var count = await DBModule.query(
                    'SELECT COUNT(*) as total FROM entidades WHERE sector = ?',
                    [sectores[i].nombre]
                );
                html += `<div style="background:#f1f4f8;padding:12px;border-radius:10px;text-align:center;">
                    <div style="font-size:28px;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;">${sectores[i].emoji}</div>
                    <div style="font-size:20px;font-weight:800;color:#0a1e3c;">${count[0]?.total || 0}</div>
                    <div style="font-size:11px;color:#64748b;">${sectores[i].nombre}</div>
                </div>`;
            }
            html += '</div>';
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al cargar sectores:', error);
        }
    }

    async function cargarCarreras() {
        try {
            var carreras = await DBModule.query('SELECT * FROM carreras ORDER BY nombre');
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
                        <span>?? Total Egresados</span>
                        <span class="badge badge-primary">${egresados[0]?.total || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>?? Planes Activos</span>
                        <span class="badge badge-success">${planes[0]?.total || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>?? Acciones Totales</span>
                        <span class="badge badge-info">${acciones[0]?.total || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;">
                        <span>?? Progreso General</span>
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
                `SELECT p.*, u.nombre as egresado_nombre, c.nombre as carrera_nombre, ent.nombre as entidad_nombre, t.nombre as tutor_nombre 
                 FROM planes_superacion p 
                 JOIN egresados e ON p.egresado_id = e.id 
                 JOIN usuarios u ON e.usuario_id = u.id 
                 JOIN carreras c ON e.carrera_id = c.id 
                 JOIN entidades ent ON e.entidad_id = ent.id 
                 LEFT JOIN tutores tu ON p.tutor_id = tu.id 
                 LEFT JOIN usuarios t ON tu.usuario_id = t.id 
                 WHERE p.estado = "activo" 
                 ORDER BY p.anio_plan DESC`
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
                <h2><i class="fas fa-gauge-high"></i> Panel de Coordinación</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Coordinador</div>
            </div>

            <div class="stats-grid">
                <div class="stat-card" style="border-left:4px solid #0a1e3c;">
                    <div class="stat-icon">??</div>
                    <div class="number" id="total-egresados">0</div>
                    <div class="label">Egresados en superación</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #2a6b9c;">
                    <div class="stat-icon">??</div>
                    <div class="number" id="total-entidades">0</div>
                    <div class="label">Entidades vinculadas</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">??</div>
                    <div class="number" id="total-acciones">0</div>
                    <div class="label">Acciones de superación</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">??</div>
                    <div class="number" id="progreso-general">0%</div>
                    <div class="label">Progreso general</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-building"></i> Entidades por Sector</div>
                    <div id="sectores-container">
                        <p class="text-muted">Cargando...</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-graduation-cap"></i> Egresados por Carrera</div>
                    <div id="carreras-container">
                        <p class="text-muted">Cargando...</p>
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-top:16px;">
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="CoordinadorModule.navigate('planes')">
                    <div style="font-size:36px;">??</div>
                    <h4>Gestión de Planes</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="CoordinadorModule.navigate('entidades')">
                    <div style="font-size:36px;">??</div>
                    <h4>Entidades</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="CoordinadorModule.navigate('competencias')">
                    <div style="font-size:36px;">?</div>
                    <h4>Competencias</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="CoordinadorModule.navigate('reportes')">
                    <div style="font-size:36px;">??</div>
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
                <h2><i class="fas fa-clipboard-check"></i> Gestión de Planes</h2>
                <div class="breadcrumb">Supervisión de planes</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="CoordinadorModule.mostrarFormularioPlan()">
                    <i class="fas fa-plus"></i> Nuevo Plan
                </button>
            </div>

            <div id="formulario-plan-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Todos los Planes Activos</div>
                <div id="lista-planes">
                    <p class="text-muted">Cargando planes...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // ENTIDADES
    // ============================================================
    function renderEntidades() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-building"></i> Gestión de Entidades</h2>
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
                                <th style="width:70px;text-align:center;">Logo</th>
                                <th style="text-align:left;">Nombre</th>
                                <th style="text-align:left;">Sector</th>
                                <th style="text-align:left;">Representante</th>
                                <th style="text-align:center;">Egresados</th>
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
    // COMPETENCIAS
    // ============================================================
    function renderCompetencias() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Competencias</h2>
                <div class="breadcrumb">Catálogo de competencias</div>
            </div>
            <div class="card">
                <p class="text-muted">Módulo de competencias. Usa el menú lateral para acceder a la gestión completa.</p>
                <button class="btn btn-primary" onclick="window.CompetenciasModule.navigate('competencias')">
                    <i class="fas fa-arrow-right"></i> Ir a Competencias
                </button>
            </div>
        `;
    }

    // ============================================================
    // CURSOS
    // ============================================================
    function renderCursos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-graduation-cap"></i> Cursos</h2>
                <div class="breadcrumb">Catálogo de cursos</div>
            </div>
            <div class="card">
                <p class="text-muted">Módulo de cursos. Usa el menú lateral para acceder a la gestión completa.</p>
                <button class="btn btn-primary" onclick="window.CursosModule.navigate('cursos')">
                    <i class="fas fa-arrow-right"></i> Ir a Cursos
                </button>
            </div>
        `;
    }

    // ============================================================
    // EVENTOS
    // ============================================================
    function renderEventos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-calendar-alt"></i> Eventos</h2>
                <div class="breadcrumb">Eventos científicos y académicos</div>
            </div>
            <div class="card">
                <p class="text-muted">Módulo de eventos. Usa el menú lateral para acceder a la gestión completa.</p>
                <button class="btn btn-primary" onclick="window.EventosModule.navigate('eventos')">
                    <i class="fas fa-arrow-right"></i> Ir a Eventos
                </button>
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
                <div class="breadcrumb">Generación de reportes</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-bar"></i> Reporte General</div>
                    <div id="reporte-general">
                        <p class="text-muted">Cargando estadísticas...</p>
                    </div>
                    <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;">
                        <button class="btn btn-primary" onclick="CoordinadorModule.generarPDF()"><i class="fas fa-file-pdf"></i> Generar PDF</button>
                        <button class="btn btn-success" onclick="CoordinadorModule.exportarExcel()"><i class="fas fa-file-excel"></i> Exportar Excel</button>
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

            <div class="card" style="margin-top:16px;">
                <div class="card-title"><i class="fas fa-chart-pie"></i> Gráficos Estadísticos</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <div style="background:#f8fafc;border-radius:10px;padding:16px;text-align:center;">
                        <canvas id="chartDistribucion" style="max-height:250px;width:100%;"></canvas>
                        <p style="font-size:13px;color:#64748b;margin-top:8px;">Distribución por Carrera</p>
                    </div>
                    <div style="background:#f8fafc;border-radius:10px;padding:16px;text-align:center;">
                        <canvas id="chartEstado" style="max-height:250px;width:100%;"></canvas>
                        <p style="font-size:13px;color:#64748b;margin-top:8px;">Estado de los Planes</p>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // FORMULARIO: ENTIDAD - CON PERSISTENCIA
    // ============================================================
    function mostrarFormularioEntidad(entidadId) {
        var container = document.getElementById('formulario-entidad-container');
        if (!container) return;

        var emojis = ['??', '???', '??', '??', '??', '???', '??', '??', '??', '?', '??', '??', '???', '??', '??', '??', '??', '??', '??', '??', '??', '??', '???', '??', '??', '??', '??', '??', '??', '??', '??', '??'];

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
                                <option value="Turismo">?? Turismo</option>
                                <option value="Agroindustria">?? Agroindustria</option>
                                <option value="Industria Alimenticia">?? Industria Alimenticia</option>
                                <option value="Energía">? Energía</option>
                                <option value="Comunicaciones">?? Comunicaciones</option>
                                <option value="Minería">?? Minería</option>
                                <option value="Pesca">?? Pesca</option>
                                <option value="Reciclaje">?? Reciclaje</option>
                                <option value="Salud">?? Salud</option>
                                <option value="Educación">?? Educación</option>
                                <option value="Justicia">?? Justicia</option>
                                <option value="Economía">?? Economía</option>
                                <option value="Ciencia">?? Ciencia</option>
                                <option value="Control">?? Control</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Representante</label>
                            <input type="text" id="entidad-representante">
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="text" id="entidad-telefono">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Logo (emoji)</label>
                            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                                <span style="font-size:32px;margin-right:8px;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;" id="logo-preview">??</span>
                                <input type="text" id="entidad-logo" placeholder="??" maxlength="2" style="width:60px;text-align:center;font-size:24px;border:1px solid #e2e8f0;border-radius:6px;padding:4px;" value="??">
                                <span style="font-size:12px;color:#94a3b8;">(Escribe o selecciona abajo)</span>
                            </div>
                            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;padding:6px;background:white;border-radius:6px;border:1px solid #e2e8f0;max-height:80px;overflow-y:auto;">
                                ${emojis.map(e => 
                                    `<span onclick="document.getElementById('entidad-logo').value='${e}';document.getElementById('logo-preview').textContent='${e}';this.style.border='2px solid #0a1e3c';" 
                                          style="font-size:24px;cursor:pointer;padding:2px 4px;border-radius:4px;border:2px solid transparent;transition:all 0.2s;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;"
                                          onmouseover="this.style.border='2px solid #4a9ad9';"
                                          onmouseout="this.style.border='2px solid transparent';">${e}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:12px;margin-top:16px;">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar</button>
                        <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-entidad-container').innerHTML=''">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('entidad-logo').addEventListener('input', function() {
            document.getElementById('logo-preview').textContent = this.value || '??';
        });

        // ?? EVENTO: GUARDAR ENTIDAD CON DBModule.execute()
        document.getElementById('form-entidad').addEventListener('submit', async function(e) {
            e.preventDefault();
            var nombre = document.getElementById('entidad-nombre').value.trim();
            if (!nombre) {
                await ModalModule.warning('El nombre es obligatorio.');
                return;
            }

            try {
                // ?? execute() guarda automáticamente en localStorage
                await DBModule.execute(
                    'INSERT INTO entidades (nombre, sector, representante, telefono, logo) VALUES (?, ?, ?, ?, ?)',
                    [
                        nombre,
                        document.getElementById('entidad-sector').value,
                        document.getElementById('entidad-representante').value.trim(),
                        document.getElementById('entidad-telefono').value.trim(),
                        document.getElementById('entidad-logo').value || '??'
                    ]
                );
                console.log('? Entidad creada y guardada');
                await ModalModule.success('Entidad creada correctamente.');
                container.innerHTML = '';
                loadData();
            } catch (error) {
                console.error('Error al crear entidad:', error);
                await ModalModule.error('Error al crear entidad: ' + error.message);
            }
        });
    }

    // ============================================================
    // FORMULARIO: PLAN - CON PERSISTENCIA
    // ============================================================
    function mostrarFormularioPlan() {
        var container = document.getElementById('formulario-plan-container');
        if (!container) return;

        // Obtener egresados sin plan activo
        DBModule.query(`
            SELECT e.id, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
            FROM egresados e 
            JOIN usuarios u ON e.usuario_id = u.id 
            JOIN carreras c ON e.carrera_id = c.id 
            WHERE e.id NOT IN (SELECT egresado_id FROM planes_superacion WHERE estado = 'activo')
            ORDER BY u.nombre
        `).then(function(egresados) {
            var options = '<option value="">Selecciona un egresado...</option>';
            egresados.forEach(function(e) {
                options += `<option value="${e.id}">${e.egresado_nombre} (${e.carrera_nombre})</option>`;
            });

            // Obtener tutores disponibles
            DBModule.query(`
                SELECT t.id, u.nombre as tutor_nombre 
                FROM tutores t 
                JOIN usuarios u ON t.usuario_id = u.id 
                ORDER BY u.nombre
            `).then(function(tutores) {
                var tutorOptions = '<option value="">Selecciona un tutor...</option>';
                tutores.forEach(function(t) {
                    tutorOptions += `<option value="${t.id}">${t.tutor_nombre}</option>`;
                });

                container.innerHTML = `
                    <div class="card" style="border:2px solid #2a6b9c;">
                        <div class="card-title"><i class="fas fa-plus-circle"></i> Nuevo Plan de Superación</div>
                        <form id="form-plan">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Egresado <span class="required">*</span></label>
                                    <select id="plan-egresado" required>
                                        ${options}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Tutor <span class="required">*</span></label>
                                    <select id="plan-tutor" required>
                                        ${tutorOptions}
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Año <span class="required">*</span></label>
                                    <input type="number" id="plan-anio" value="${new Date().getFullYear()}" required>
                                </div>
                                <div class="form-group">
                                    <label>Estado</label>
                                    <select id="plan-estado">
                                        <option value="activo">Activo</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="completado">Completado</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Observaciones</label>
                                <textarea rows="3" id="plan-observaciones" placeholder="Observaciones sobre el plan..."></textarea>
                            </div>
                            <div style="display:flex;gap:12px;margin-top:16px;">
                                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Crear Plan</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-plan-container').innerHTML=''">Cancelar</button>
                            </div>
                        </form>
                    </div>
                `;

                // ?? EVENTO: CREAR PLAN CON DBModule.execute()
                document.getElementById('form-plan').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    var egresadoId = document.getElementById('plan-egresado').value;
                    var tutorId = document.getElementById('plan-tutor').value;
                    var anio = parseInt(document.getElementById('plan-anio').value);
                    var estado = document.getElementById('plan-estado').value;
                    var observaciones = document.getElementById('plan-observaciones').value.trim();

                    if (!egresadoId || !tutorId || !anio) {
                        await ModalModule.warning('Completa todos los campos requeridos.');
                        return;
                    }

                    try {
                        // ?? execute() guarda automáticamente en localStorage
                        await DBModule.execute(
                            `INSERT INTO planes_superacion (egresado_id, tutor_id, anio_plan, estado, observaciones, fecha_inicio) 
                             VALUES (?, ?, ?, ?, ?, date("now"))`,
                            [egresadoId, tutorId, anio, estado, observaciones]
                        );
                        console.log('? Plan creado y guardado');
                        await ModalModule.success('Plan creado correctamente.');
                        container.innerHTML = '';
                        loadData();
                    } catch (error) {
                        console.error('Error al crear plan:', error);
                        await ModalModule.error('Error al crear plan: ' + error.message);
                    }
                });
            });
        });
    }

    // ============================================================
    // FUNCIONES DE EXPORTACIÓN Y REPORTES
    // ============================================================
    function generarPDF() {
        ModalModule.info('Generando PDF... (en desarrollo)', 'Información');
    }

    function exportarExcel() {
        ModalModule.info('Exportando Excel... (en desarrollo)', 'Información');
    }

    function exportarEgresados() {
        ModalModule.info('Exportando egresados... (en desarrollo)', 'Información');
    }

    function exportarPlanes() {
        ModalModule.info('Exportando planes... (en desarrollo)', 'Información');
    }

    function exportarEntidades() {
        ModalModule.info('Exportando entidades... (en desarrollo)', 'Información');
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        // Cargar gráficos si estamos en reportes
        if (document.getElementById('chartDistribucion')) {
            cargarGraficosReportes();
        }
    }

    // ============================================================
    // GRÁFICOS PARA REPORTES
    // ============================================================
    async function cargarGraficosReportes() {
        try {
            // Datos para distribución por carrera
            var carreras = await DBModule.query(`
                SELECT c.nombre, COUNT(e.id) as total 
                FROM carreras c 
                LEFT JOIN egresados e ON c.id = e.carrera_id 
                GROUP BY c.id
            `);

            // Datos para estado de planes
            var estados = await DBModule.query(`
                SELECT estado, COUNT(*) as total 
                FROM planes_superacion 
                GROUP BY estado
            `);

            if (typeof Chart !== 'undefined') {
                // Gráfico de distribución por carrera
                var ctx1 = document.getElementById('chartDistribucion');
                if (ctx1) {
                    new Chart(ctx1, {
                        type: 'bar',
                        data: {
                            labels: carreras.map(c => c.nombre),
                            datasets: [{
                                label: 'Egresados',
                                data: carreras.map(c => c.total),
                                backgroundColor: ['#0a1e3c', '#1a3a6a', '#2a6b9c', '#4a9ad9', '#28a745', '#ffc107', '#dc3545'],
                                borderColor: '#0a1e3c',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false }
                            },
                            scales: {
                                y: { beginAtZero: true, ticks: { stepSize: 1 } }
                            }
                        }
                    });
                }

                // Gráfico de estado de planes
                var ctx2 = document.getElementById('chartEstado');
                if (ctx2) {
                    var colores = {
                        'activo': '#2a6b9c',
                        'pendiente': '#d48a2a',
                        'completado': '#1a8a4a'
                    };
                    new Chart(ctx2, {
                        type: 'doughnut',
                        data: {
                            labels: estados.map(e => e.estado),
                            datasets: [{
                                data: estados.map(e => e.total),
                                backgroundColor: estados.map(e => colores[e.estado] || '#94a3b8'),
                                borderWidth: 0
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom' }
                            }
                        }
                    });
                }
            } else {
                console.warn('Chart.js no disponible');
            }
        } catch (error) {
            console.error('Error al cargar gráficos:', error);
        }
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
        navigate: navigate,
        mostrarFormularioEntidad: mostrarFormularioEntidad,
        mostrarFormularioPlan: mostrarFormularioPlan,
        generarPDF: generarPDF,
        exportarExcel: exportarExcel,
        exportarEgresados: exportarEgresados,
        exportarPlanes: exportarPlanes,
        exportarEntidades: exportarEntidades
    };

})();

window.CoordinadorModule = CoordinadorModule;
console.log('? CoordinadorModule con persistencia cargado correctamente.');