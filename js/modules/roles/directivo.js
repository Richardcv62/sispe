// ============================================================
// SISPE - directivo.js
// Modulo del Directivo - CON EMOJIS Y ACENTOS CORREGIDOS
// RUTA: js/modules/roles/directivo.js
// ============================================================

const DirectivoModule = (function() {
    'use strict';

    var entidadId = 1;

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
            case 'competencias':
                content = renderCompetencias();
                break;
            case 'eventos':
                content = renderEventos();
                break;
            case 'estadisticas':
                content = renderEstadisticas();
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
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        // Los eventos se manejan inline
    }

    // ============================================================
    // CARGAR DATOS DESDE LA BD
    // ============================================================
    async function loadData() {
        try {
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

            // Cargar datos del dashboard
            await cargarDashboardData();
            
            // Cargar planes
            await cargarPlanes();
            
            // Cargar competencias
            await cargarCompetencias();
            
            // Cargar eventos
            await cargarEventos();

        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    // ============================================================
    // CARGAR DATOS DEL DASHBOARD
    // ============================================================
    async function cargarDashboardData() {
        try {
            var entidad = await DBModule.query(
                'SELECT * FROM entidades WHERE id = ?',
                [entidadId]
            );

            var entidadNombre = entidad.length > 0 ? entidad[0].nombre : 'Sin entidad';
            var entidadLogo = entidad.length > 0 ? (entidad[0].logo || '\uD83C\uDFE2') : '\uD83C\uDFE2';

            var nombreEl = document.getElementById('entidad-nombre-display');
            if (nombreEl) nombreEl.textContent = entidadNombre;

            var logoEl = document.getElementById('entidad-logo-display');
            if (logoEl) logoEl.textContent = entidadLogo;

            var egresados = await DBModule.query(
                'SELECT e.*, u.nombre as nombre_usuario, c.nombre as carrera_nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id JOIN carreras c ON e.carrera_id = c.id WHERE e.entidad_id = ?',
                [entidadId]
            );

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
                        
                        html += '<tr><td><strong>' + (eg.avatar || '') + ' ' + eg.nombre_usuario + '</strong></td>' +
                            '<td>' + eg.carrera_nombre + '</td>' +
                            '<td>' + tutorNombre + '</td>' +
                            '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + pct + '%;"></div></div><span class="progress-pct">' + pct + '%</span></div></td></tr>';
                    }
                    listaEgresados.innerHTML = html;
                }
            }

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
                    html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">' +
                        '<span>' + key + '</span>' +
                        '<span class="badge badge-primary">' + estadoData[key] + '</span>' +
                    '</div>';
                }
                html += '</div>';
                estadisticasContainer.innerHTML = html;
            }
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
        }
    }

    // ============================================================
    // CARGAR PLANES
    // ============================================================
    async function cargarPlanes() {
        var container = document.getElementById('lista-planes-directivo');
        if (!container) return;

        try {
            var egresados = await DBModule.query(
                'SELECT e.id, u.nombre as egresado_nombre, c.nombre as carrera_nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id JOIN carreras c ON e.carrera_id = c.id WHERE e.entidad_id = ?',
                [entidadId]
            );

            if (egresados.length === 0) {
                container.innerHTML = '<p class="text-muted">No hay egresados en esta entidad.</p>';
                return;
            }

            var planes = [];
            for (var i = 0; i < egresados.length; i++) {
                var eg = egresados[i];
                var plan = await DBModule.query(
                    'SELECT * FROM planes_superacion WHERE egresado_id = ? AND estado = "activo"',
                    [eg.id]
                );
                if (plan.length > 0) {
                    plan[0].egresado_nombre = eg.egresado_nombre;
                    plan[0].carrera_nombre = eg.carrera_nombre;
                    // Obtener tutor
                    var tutor = await DBModule.query(
                        'SELECT u.nombre as tutor_nombre FROM tutores t JOIN usuarios u ON t.usuario_id = u.id WHERE t.id = ?',
                        [plan[0].tutor_id]
                    );
                    plan[0].tutor_nombre = tutor.length > 0 ? tutor[0].tutor_nombre : 'Sin asignar';
                    planes.push(plan[0]);
                }
            }

            if (planes.length === 0) {
                container.innerHTML = '<p class="text-muted">No hay planes activos en esta entidad.</p>';
                return;
            }

            var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Tutor</th><th>Progreso</th></tr></thead><tbody>';
            for (var i = 0; i < planes.length; i++) {
                var p = planes[i];
                var color = p.progreso >= 80 ? 'green' : p.progreso >= 50 ? 'gold' : 'danger';
                html += '<tr><td><strong>' + p.egresado_nombre + '</strong></td>' +
                    '<td>' + p.carrera_nombre + '</td>' +
                    '<td>' + (p.tutor_nombre || 'Sin asignar') + '</td>' +
                    '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + (p.progreso || 0) + '%;"></div></div><span class="progress-pct">' + (p.progreso || 0) + '%</span></div></td></tr>';
            }
            html += '</tbody></table></div>';
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al cargar planes:', error);
            container.innerHTML = '<p class="text-muted">Error al cargar los planes.</p>';
        }
    }

    // ============================================================
    // CARGAR COMPETENCIAS - CON NIVELES NUMÉRICOS
    // ============================================================
    async function cargarCompetencias() {
        var container = document.getElementById('lista-competencias-directivo');
        if (!container) return;

        try {
            var competencias = await DBModule.query(
                'SELECT * FROM competencias ORDER BY dimension, nombre'
            );

            if (competencias.length === 0) {
                container.innerHTML = '<p class="text-muted">No hay competencias registradas.</p>';
                return;
            }

            var dimensiones = {};
            competencias.forEach(function(c) {
                if (!dimensiones[c.dimension]) dimensiones[c.dimension] = [];
                dimensiones[c.dimension].push(c);
            });

            var html = '';
            for (var dim in dimensiones) {
                html += '<h4 style="color:#0a1e3c;margin:12px 0 8px;">' + dim + '</h4>';
                html += '<div class="table-wrap"><table><thead><tr><th>Competencia</th><th>Categor&iacute;a</th><th>Nivel Esperado</th></tr></thead><tbody>';
                dimensiones[dim].forEach(function(c) {
                    var nivel = c.nivel_esperado || 3;
                    // Mostrar nivel como número con texto descriptivo
                    var nivelTexto = '';
                    if (nivel === 1) nivelTexto = '1 - Básico';
                    else if (nivel === 2) nivelTexto = '2 - Intermedio Bajo';
                    else if (nivel === 3) nivelTexto = '3 - Intermedio';
                    else if (nivel === 4) nivelTexto = '4 - Avanzado';
                    else if (nivel === 5) nivelTexto = '5 - Experto';
                    else nivelTexto = nivel + ' - Nivel ' + nivel;
                    
                    html += '<tr><td><strong>' + c.nombre + '</strong><br><span style="font-size:12px;color:#64748b;">' + (c.descripcion || '') + '</span></td>' +
                        '<td><span class="badge badge-info">' + (c.categoria || 'General') + '</span></td>' +
                        '<td><span class="badge badge-primary" style="font-size:14px;font-weight:600;">' + nivelTexto + '</span></td></tr>';
                });
                html += '</tbody></table></div>';
            }
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al cargar competencias:', error);
            container.innerHTML = '<p class="text-muted">Error al cargar las competencias.</p>';
        }
    }

    // ============================================================
    // CARGAR EVENTOS
    // ============================================================
    async function cargarEventos() {
        var container = document.getElementById('lista-eventos-directivo');
        if (!container) return;

        try {
            var eventos = await DBModule.query(
                'SELECT * FROM eventos ORDER BY fecha_inicio DESC'
            );

            if (eventos.length === 0) {
                container.innerHTML = '<p class="text-muted">No hay eventos registrados.</p>';
                return;
            }

            var html = '<div class="table-wrap"><table><thead><tr><th>Evento</th><th>Tipo</th><th>Fecha</th><th>Lugar</th><th>Organizador</th></tr></thead><tbody>';
            eventos.forEach(function(e) {
                var fecha = e.fecha_inicio ? (e.fecha_inicio + (e.fecha_fin ? ' - ' + e.fecha_fin : '')) : 'Sin fecha';
                html += '<tr><td><strong>' + e.nombre + '</strong><br><span style="font-size:12px;color:#64748b;">' + (e.descripcion || '') + '</span></td>' +
                    '<td><span class="badge badge-info">' + (e.tipo || 'General') + '</span></td>' +
                    '<td>' + fecha + '</td>' +
                    '<td>' + (e.lugar || 'N/A') + '</td>' +
                    '<td>' + (e.entidad_organizadora || 'N/A') + '</td></tr>';
            });
            html += '</tbody></table></div>';
            container.innerHTML = html;
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            container.innerHTML = '<p class="text-muted">Error al cargar los eventos.</p>';
        }
    }

    // ============================================================
    // DASHBOARD
    // ============================================================
    function renderDashboard() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-building"></i> Dashboard de la Entidad</h2>
                <div class="breadcrumb"><span id="entidad-logo-display" style="font-size:20px;">\uD83C\uDFE2</span> <span id="entidad-nombre-display">Cargando...</span></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:18px;margin-bottom:24px;">
                <div class="stat-card" style="border-left:4px solid #0a1e3c;">
                    <div class="stat-icon">\uD83D\uDC65</div>
                    <div class="number" id="total-egresados">0</div>
                    <div class="label">Egresados</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #2a6b9c;">
                    <div class="stat-icon">\uD83D\uDCCB</div>
                    <div class="number" id="con-plan">0</div>
                    <div class="label">Con plan activo</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">\u2705</div>
                    <div class="number" id="completados">0</div>
                    <div class="label">Plan completado</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">\uD83D\uDCC8</div>
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

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="DirectivoModule.navigate('planes')">
                    <div style="font-size:36px;">\uD83D\uDCCB</div>
                    <h4>Planes de la Entidad</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="DirectivoModule.navigate('competencias')">
                    <div style="font-size:36px;">\u2B50</div>
                    <h4>Competencias</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="DirectivoModule.navigate('eventos')">
                    <div style="font-size:36px;">\uD83D\uDCC5</div>
                    <h4>Eventos</h4>
                </div>
            </div>
        `;
    }

    // ============================================================
    // PLANES - CON GESTIÓN
    // ============================================================
    function renderPlanes() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-clipboard-list"></i> Planes de la Entidad</h2>
                <div class="breadcrumb">Gesti&oacute;n de planes de superaci&oacute;n</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="DirectivoModule.mostrarFormularioPlan()">
                    <i class="fas fa-plus"></i> Nuevo Plan
                </button>
            </div>

            <div id="formulario-plan-directivo-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Planes Activos</div>
                <div id="lista-planes-directivo">
                    <p class="text-muted">Cargando planes...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // COMPETENCIAS - CON VISUALIZACIÓN Y ADMINISTRACIÓN
    // ============================================================
    function renderCompetencias() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Competencias</h2>
                <div class="breadcrumb">Cat&aacute;logo de competencias profesionales</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="window.CompetenciasModule.navigate('competencias')">
                    <i class="fas fa-edit"></i> Gestionar Competencias
                </button>
                <button class="btn btn-secondary" onclick="window.CompetenciasModule.navigate('evaluar-competencias')">
                    <i class="fas fa-clipboard-check"></i> Evaluar Competencias
                </button>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Competencias</div>
                <div id="lista-competencias-directivo">
                    <p class="text-muted">Cargando competencias...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // EVENTOS - CON VISUALIZACIÓN
    // ============================================================
    function renderEventos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-calendar-alt"></i> Eventos</h2>
                <div class="breadcrumb">Eventos acad&eacute;micos y cient&iacute;ficos</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="window.EventosModule.navigate('eventos')">
                    <i class="fas fa-edit"></i> Gestionar Eventos
                </button>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Eventos</div>
                <div id="lista-eventos-directivo">
                    <p class="text-muted">Cargando eventos...</p>
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
                <h2><i class="fas fa-chart-bar"></i> Estad&iacute;sticas de la Entidad</h2>
                <div class="breadcrumb"><span id="entidad-nombre-display">Cargando...</span></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-user-graduate"></i> Distribuci&oacute;n por Estado</div>
                    <div id="estadisticas-container">
                        <p class="text-muted">Cargando...</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-flag"></i> Resumen General</div>
                    <div style="padding:8px 0;">
                        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                            <span>\uD83D\uDCCA Progreso Promedio</span>
                            <span class="badge badge-success" id="progreso-promedio">0%</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:6px 0;">
                            <span>\uD83D\uDC65 Total Egresados</span>
                            <span class="badge badge-primary" id="total-egresados">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // MOSTRAR FORMULARIO PLAN (Directivo)
    // ============================================================
    function mostrarFormularioPlan() {
        var container = document.getElementById('formulario-plan-directivo-container');
        if (!container) return;

        // Obtener egresados de la entidad sin plan activo
        DBModule.query(`
            SELECT e.id, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
            FROM egresados e 
            JOIN usuarios u ON e.usuario_id = u.id 
            JOIN carreras c ON e.carrera_id = c.id 
            WHERE e.entidad_id = ? 
            AND e.id NOT IN (SELECT egresado_id FROM planes_superacion WHERE estado = 'activo')
            ORDER BY u.nombre
        `, [entidadId]).then(function(egresados) {
            
            var options = '<option value="">Selecciona un egresado...</option>';
            if (egresados.length === 0) {
                options += '<option value="" disabled>No hay egresados sin plan</option>';
            } else {
                egresados.forEach(function(e) {
                    options += `<option value="${e.id}">${e.egresado_nombre} (${e.carrera_nombre})</option>`;
                });
            }

            // Obtener tutores disponibles
            DBModule.query(`
                SELECT t.id, u.nombre as tutor_nombre 
                FROM tutores t 
                JOIN usuarios u ON t.usuario_id = u.id 
                ORDER BY u.nombre
            `).then(function(tutores) {
                var tutorOptions = '<option value="">Selecciona un tutor...</option>';
                if (tutores.length === 0) {
                    tutorOptions += '<option value="" disabled>No hay tutores disponibles</option>';
                } else {
                    tutores.forEach(function(t) {
                        tutorOptions += `<option value="${t.id}">${t.tutor_nombre}</option>`;
                    });
                }

                container.innerHTML = `
                    <div class="card" style="border:2px solid #2a6b9c;">
                        <div class="card-title"><i class="fas fa-plus-circle"></i> Nuevo Plan de Superaci&oacute;n</div>
                        <form id="form-plan-directivo">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Egresado <span class="required">*</span></label>
                                    <select id="plan-dir-egresado" required>
                                        ${options}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Tutor <span class="required">*</span></label>
                                    <select id="plan-dir-tutor" required>
                                        ${tutorOptions}
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>A&ntilde;o <span class="required">*</span></label>
                                    <input type="number" id="plan-dir-anio" value="${new Date().getFullYear()}" required>
                                </div>
                                <div class="form-group">
                                    <label>Estado</label>
                                    <select id="plan-dir-estado">
                                        <option value="activo">Activo</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="completado">Completado</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Observaciones</label>
                                <textarea rows="3" id="plan-dir-observaciones" placeholder="Observaciones sobre el plan..."></textarea>
                            </div>
                            <div style="display:flex;gap:12px;margin-top:16px;">
                                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Crear Plan</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-plan-directivo-container').innerHTML=''">Cancelar</button>
                            </div>
                        </form>
                    </div>
                `;

                document.getElementById('form-plan-directivo').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    await guardarPlanDirectivo();
                });
            });
        }).catch(function(error) {
            console.error('Error al cargar egresados:', error);
            container.innerHTML = '<p class="text-muted">Error al cargar los egresados.</p>';
        });
    }

    // ============================================================
    // GUARDAR PLAN (Directivo) - CON PERSISTENCIA AUTOMÁTICA
    // ============================================================
    async function guardarPlanDirectivo() {
        var egresadoId = document.getElementById('plan-dir-egresado').value;
        var tutorId = document.getElementById('plan-dir-tutor').value;
        var anio = parseInt(document.getElementById('plan-dir-anio').value);
        var estado = document.getElementById('plan-dir-estado').value;
        var observaciones = document.getElementById('plan-dir-observaciones').value.trim();

        if (!egresadoId || !tutorId || !anio) {
            await ModalModule.warning('Completa todos los campos requeridos.');
            return;
        }

        try {
            await DBModule.execute(
                `INSERT INTO planes_superacion (egresado_id, tutor_id, anio_plan, estado, observaciones, fecha_inicio) 
                 VALUES (?, ?, ?, ?, ?, date('now'))`,
                [egresadoId, tutorId, anio, estado, observaciones]
            );
            console.log('? Plan creado y guardado');
            await ModalModule.success('? Plan creado correctamente.');
            
            document.getElementById('formulario-plan-directivo-container').innerHTML = '';
            await cargarPlanes();
            await cargarDashboardData();
        } catch (error) {
            console.error('Error al crear plan:', error);
            await ModalModule.error('Error al crear plan: ' + error.message);
        }
    }

    return {
        navigate: navigate,
        mostrarFormularioPlan: mostrarFormularioPlan
    };

})();

window.DirectivoModule = DirectivoModule;
console.log('? DirectivoModule con funcionalidades completas cargado correctamente.');