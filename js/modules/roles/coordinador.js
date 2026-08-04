// ============================================================
// SISPE - coordinador.js
// Modulo del Coordinador - CON EMOJIS Y ACENTOS CORREGIDOS
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
                        var logo = ent.logo || '\uD83C\uDFE2';
                        var count = await DBModule.query('SELECT COUNT(*) as total FROM egresados WHERE entidad_id = ?', [ent.id]);
                        html += '<tr>' +
                            '<td style="font-size:28px;text-align:center;font-family:\'Segoe UI Emoji\',\'Apple Color Emoji\',\'Noto Color Emoji\',sans-serif;line-height:1.4;">' + logo + '</td>' +
                            '<td style="font-weight:600;color:#0a1e3c;">' + ent.nombre + '</td>' +
                            '<td><span class="badge badge-info" style="font-size:13px;">' + (ent.sector || 'Sin sector') + '</span></td>' +
                            '<td>' + (ent.representante || 'Sin representante') + '</td>' +
                            '<td style="text-align:center;"><span class="badge badge-primary">' + (count[0]?.total || 0) + '</span></td>' +
                        '</tr>';
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
                { nombre: 'Turismo', emoji: '\uD83C\uDFE8' },
                { nombre: 'Agroindustria', emoji: '\uD83C\uDF3E' },
                { nombre: 'Industria Alimenticia', emoji: '\uD83E\uDD6B' },
                { nombre: 'Energ\u00EDa', emoji: '\u26A1' },
                { nombre: 'Comunicaciones', emoji: '\uD83D\uDCE1' },
                { nombre: 'Miner\u00EDa', emoji: '\u26CF\uFE0F' },
                { nombre: 'Pesca', emoji: '\uD83D\uDC1F' },
                { nombre: 'Reciclaje', emoji: '\u267B\uFE0F' },
                { nombre: 'Salud', emoji: '\uD83D\uDC8A' },
                { nombre: 'Educaci\u00F3n', emoji: '\uD83D\uDCDA' },
                { nombre: 'Justicia', emoji: '\u2696\uFE0F' },
                { nombre: 'Econom\u00EDa', emoji: '\uD83D\uDCB0' },
                { nombre: 'Ciencia', emoji: '\uD83D\uDD2C' },
                { nombre: 'Control', emoji: '\uD83D\uDD0D' }
            ];
            
            var container = document.getElementById('sectores-container');
            if (!container) return;

            var html = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;">';
            for (var i = 0; i < sectores.length; i++) {
                var count = await DBModule.query(
                    'SELECT COUNT(*) as total FROM entidades WHERE sector = ?',
                    [sectores[i].nombre]
                );
                html += '<div style="background:#f1f4f8;padding:12px;border-radius:10px;text-align:center;">' +
                    '<div style="font-size:28px;font-family:\'Segoe UI Emoji\',\'Apple Color Emoji\',\'Noto Color Emoji\',sans-serif;">' + sectores[i].emoji + '</div>' +
                    '<div style="font-size:20px;font-weight:800;color:#0a1e3c;">' + (count[0]?.total || 0) + '</div>' +
                    '<div style="font-size:11px;color:#64748b;">' + sectores[i].nombre + '</div>' +
                '</div>';
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
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e2e8f0;">' +
                    '<div><strong>' + c.nombre + '</strong> <span style="color:#64748b;font-size:13px;">(' + (count[0]?.total || 0) + ')</span></div>' +
                '</div>';
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
                        <span>\uD83D\uDC65 Total Egresados</span>
                        <span class="badge badge-primary">${egresados[0]?.total || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>\uD83D\uDCCB Planes Activos</span>
                        <span class="badge badge-success">${planes[0]?.total || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>\uD83D\uDCCC Acciones Totales</span>
                        <span class="badge badge-info">${acciones[0]?.total || 0}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;">
                        <span>\uD83D\uDCC8 Progreso General</span>
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
                html += '<tr><td><strong>' + p.egresado_nombre + '</strong></td>' +
                    '<td>' + p.carrera_nombre + '</td>' +
                    '<td>' + p.entidad_nombre + '</td>' +
                    '<td>' + (p.tutor_nombre || 'Sin asignar') + '</td>' +
                    '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + (p.progreso || 0) + '%;"></div></div><span class="progress-pct">' + (p.progreso || 0) + '%</span></div></td></tr>';
            }
            html += '</tbody></table></div>';
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al cargar planes:', error);
        }
    }

    // ============================================================
    // DASHBOARD - CON EMOJIS CORREGIDOS
    // ============================================================
    function renderDashboard() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-gauge-high"></i> Panel de Coordinaci\u00F3n</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Coordinador</div>
            </div>

            <div class="stats-grid">
                <div class="stat-card" style="border-left:4px solid #0a1e3c;">
                    <div class="stat-icon">\uD83D\uDC65</div>
                    <div class="number" id="total-egresados">0</div>
                    <div class="label">Egresados en superaci\u00F3n</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #2a6b9c;">
                    <div class="stat-icon">\uD83C\uDFE2</div>
                    <div class="number" id="total-entidades">0</div>
                    <div class="label">Entidades vinculadas</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">\uD83D\uDCCC</div>
                    <div class="number" id="total-acciones">0</div>
                    <div class="label">Acciones de superaci\u00F3n</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">\uD83D\uDCC8</div>
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
                    <div style="font-size:36px;">\uD83D\uDCCB</div>
                    <h4>Gesti\u00F3n de Planes</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="CoordinadorModule.navigate('entidades')">
                    <div style="font-size:36px;">\uD83C\uDFE2</div>
                    <h4>Entidades</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="CoordinadorModule.navigate('competencias')">
                    <div style="font-size:36px;">\u2B50</div>
                    <h4>Competencias</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="CoordinadorModule.navigate('reportes')">
                    <div style="font-size:36px;">\uD83D\uDCCA</div>
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
                <h2><i class="fas fa-clipboard-check"></i> Gesti\u00F3n de Planes</h2>
                <div class="breadcrumb">Supervisi\u00F3n de planes</div>
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
                <h2><i class="fas fa-building"></i> Gesti\u00F3n de Entidades</h2>
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
                <div class="breadcrumb">Cat\u00E1logo de competencias</div>
            </div>
            <div class="card">
                <p class="text-muted">M\u00F3dulo de competencias. Usa el men\u00FA lateral para acceder a la gesti\u00F3n completa.</p>
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
                <div class="breadcrumb">Cat\u00E1logo de cursos</div>
            </div>
            <div class="card">
                <p class="text-muted">M\u00F3dulo de cursos. Usa el men\u00FA lateral para acceder a la gesti\u00F3n completa.</p>
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
                <div class="breadcrumb">Eventos cient\u00EDficos y acad\u00E9micos</div>
            </div>
            <div class="card">
                <p class="text-muted">M\u00F3dulo de eventos. Usa el men\u00FA lateral para acceder a la gesti\u00F3n completa.</p>
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
                <div class="breadcrumb">Generaci\u00F3n de reportes</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-bar"></i> Reporte General</div>
                    <div id="reporte-general">
                        <p class="text-muted">Cargando estad\u00EDsticas...</p>
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
                <div class="card-title"><i class="fas fa-chart-pie"></i> Gr\u00E1ficos Estad\u00EDsticos</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <div style="background:#f8fafc;border-radius:10px;padding:16px;text-align:center;">
                        <canvas id="chartDistribucion" style="max-height:250px;width:100%;"></canvas>
                        <p style="font-size:13px;color:#64748b;margin-top:8px;">Distribuci\u00F3n por Carrera</p>
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

        var emojis = ['\uD83C\uDFE8', '\uD83C\uDFD6\uFE0F', '\uD83C\uDF0A', '\u2708\uFE0F', '\uD83D\uDE8C', '\uD83C\uDFDD\uFE0F', '\uD83C\uDF3E', '\uD83D\uDE9C', '\uD83E\uDD6B', '\u26A1', '\uD83D\uDCE1', '\uD83D\uDCBB', '\uD83D\uDCBB', '\u26CF\uFE0F', '\uD83D\uDC1F', '\u267B\uFE0F', '\uD83D\uDC8A', '\uD83D\uDCDA', '\uD83C\uDF93', '\u2696\uFE0F', '\uD83D\uDCDC', '\uD83D\uDCCB', '\uD83C\uDFDB\uFE0F', '\uD83D\uDCCA', '\uD83D\uDCB0', '\uD83D\uDCC8', '\uD83D\uDED2', '\uD83D\uDD2C', '\uD83D\uDD0D', '\uD83C\uDFE2', '\uD83C\uDFED', '\uD83C\uDFEA'];

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
                                <option value="Turismo">\uD83C\uDFE8 Turismo</option>
                                <option value="Agroindustria">\uD83C\uDF3E Agroindustria</option>
                                <option value="Industria Alimenticia">\uD83E\uDD6B Industria Alimenticia</option>
                                <option value="Energ\u00EDa">\u26A1 Energ\u00EDa</option>
                                <option value="Comunicaciones">\uD83D\uDCE1 Comunicaciones</option>
                                <option value="Miner\u00EDa">\u26CF\uFE0F Miner\u00EDa</option>
                                <option value="Pesca">\uD83D\uDC1F Pesca</option>
                                <option value="Reciclaje">\u267B\uFE0F Reciclaje</option>
                                <option value="Salud">\uD83D\uDC8A Salud</option>
                                <option value="Educaci\u00F3n">\uD83D\uDCDA Educaci\u00F3n</option>
                                <option value="Justicia">\u2696\uFE0F Justicia</option>
                                <option value="Econom\u00EDa">\uD83D\uDCB0 Econom\u00EDa</option>
                                <option value="Ciencia">\uD83D\uDD2C Ciencia</option>
                                <option value="Control">\uD83D\uDD0D Control</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Representante</label>
                            <input type="text" id="entidad-representante">
                        </div>
                        <div class="form-group">
                            <label>Tel\u00E9fono</label>
                            <input type="text" id="entidad-telefono">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Logo (emoji)</label>
                            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                                <span style="font-size:32px;margin-right:8px;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;" id="logo-preview">\uD83C\uDFE2</span>
                                <input type="text" id="entidad-logo" placeholder="\uD83C\uDFE2" maxlength="2" style="width:60px;text-align:center;font-size:24px;border:1px solid #e2e8f0;border-radius:6px;padding:4px;" value="\uD83C\uDFE2">
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
            document.getElementById('logo-preview').textContent = this.value || '\uD83C\uDFE2';
        });

        document.getElementById('form-entidad').addEventListener('submit', async function(e) {
            e.preventDefault();
            var nombre = document.getElementById('entidad-nombre').value.trim();
            if (!nombre) {
                await ModalModule.warning('El nombre es obligatorio.');
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
                        document.getElementById('entidad-logo').value || '\uD83C\uDFE2'
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
                        <div class="card-title"><i class="fas fa-plus-circle"></i> Nuevo Plan de Superaci\u00F3n</div>
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
                                    <label>A\u00F1o <span class="required">*</span></label>
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
    // FUNCIONES DE EXPORTACI\u00D3N Y REPORTES
    // ============================================================
    function generarPDF() {
        ModalModule.info('Generando PDF... (en desarrollo)', 'Informaci\u00F3n');
    }

    function exportarExcel() {
        ModalModule.info('Exportando Excel... (en desarrollo)', 'Informaci\u00F3n');
    }

    function exportarEgresados() {
        ModalModule.info('Exportando egresados... (en desarrollo)', 'Informaci\u00F3n');
    }

    function exportarPlanes() {
        ModalModule.info('Exportando planes... (en desarrollo)', 'Informaci\u00F3n');
    }

    function exportarEntidades() {
        ModalModule.info('Exportando entidades... (en desarrollo)', 'Informaci\u00F3n');
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        if (document.getElementById('chartDistribucion')) {
            cargarGraficosReportes();
        }
    }

    // ============================================================
    // GR\u00C1FICOS PARA REPORTES
    // ============================================================
    async function cargarGraficosReportes() {
        try {
            var carreras = await DBModule.query(`
                SELECT c.nombre, COUNT(e.id) as total 
                FROM carreras c 
                LEFT JOIN egresados e ON c.id = e.carrera_id 
                GROUP BY c.id
            `);

            var estados = await DBModule.query(`
                SELECT estado, COUNT(*) as total 
                FROM planes_superacion 
                GROUP BY estado
            `);

            if (typeof Chart !== 'undefined') {
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
            console.error('Error al cargar gr\u00E1ficos:', error);
        }
    }

    // ============================================================
    // EXPOSICI\u00D3N P\u00DABLICA
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
console.log('? CoordinadorModule con emojis y acentos corregidos cargado correctamente.');