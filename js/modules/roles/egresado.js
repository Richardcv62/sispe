// ============================================================
// SISPE - egresado.js
// Modulo del Egresado - CON EMOJIS HTML ENTITIES Y ACENTOS
// RUTA: js/modules/roles/egresado.js
// ============================================================

const EgresadoModule = (function() {
    'use strict';

    var egresadoId = 1;

    function navigate(page, breadcrumb) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = '';

        switch(page) {
            case 'dashboard':
                content = renderDashboard();
                break;
            case 'plan':
                content = renderPlanPersonal();
                break;
            case 'plan-superacion':
                content = renderPlanSuperacion();
                break;
            case 'tutorias':
                content = renderTutorias();
                break;
            case 'evidencias':
                content = renderEvidencias();
                break;
            case 'evaluaciones':
                content = renderEvaluaciones();
                break;
            case 'solicitar-tutor':
                content = renderSolicitarTutor();
                break;
            case 'mis-cursos':
                content = renderMisCursos();
                break;
            case 'mis-eventos':
                content = renderMisEventos();
                break;
            case 'chat':
                if (window.ChatModule && typeof window.ChatModule.navigate === 'function') {
                    window.ChatModule.navigate('chat', breadcrumb);
                    return;
                }
                content = '<p class="text-muted">M&oacute;dulo de Chat no disponible.</p>';
                break;
            case 'calendario':
                if (window.CalendarioModule && typeof window.CalendarioModule.navigate === 'function') {
                    window.CalendarioModule.navigate('calendario', breadcrumb);
                    return;
                }
                content = '<p class="text-muted">M&oacute;dulo de Calendario no disponible.</p>';
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
            var user = AuthModule.getCurrentUser();
            if (user) {
                var egresadoResult = await DBModule.query(
                    'SELECT id FROM egresados WHERE usuario_id = ?',
                    [user.id]
                );
                if (egresadoResult.length > 0) {
                    egresadoId = egresadoResult[0].id;
                }
            }

            var accionesPersonales = await DBModule.query(
                `SELECT a.* FROM acciones_plan a 
                 JOIN planes_superacion p ON a.plan_id = p.id 
                 WHERE p.egresado_id = ? AND p.tipo = 'personal'`,
                [egresadoId]
            );

            var accionesSuperacion = await DBModule.query(
                `SELECT a.* FROM acciones_plan a 
                 JOIN planes_superacion p ON a.plan_id = p.id 
                 WHERE p.egresado_id = ? AND p.tipo = 'superacion' AND p.estado = 'activo'`,
                [egresadoId]
            );

            await actualizarDashboard(accionesPersonales);
            await actualizarPlanPersonal(accionesPersonales);
            await actualizarPlanSuperacion(accionesSuperacion);

            await cargarTutorias();
            await cargarEvaluaciones();
            await cargarEvidencias();
            await cargarMisCursos();
            await cargarMisEventos();

        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    // ============================================================
    // ACTUALIZAR DASHBOARD
    // ============================================================
    async function actualizarDashboard(acciones) {
        var total = acciones.length;
        var completadas = acciones.filter(function(a) { return a.estado === 'completado'; }).length;
        var enProgreso = acciones.filter(function(a) { return a.estado === 'en_progreso'; }).length;
        var pendientes = acciones.filter(function(a) { return a.estado === 'pendiente'; }).length;

        var totalEl = document.getElementById('total-acciones');
        if (totalEl) totalEl.textContent = total;
        var compEl = document.getElementById('completadas');
        if (compEl) compEl.textContent = completadas;
        var progEl = document.getElementById('en-progreso');
        if (progEl) progEl.textContent = enProgreso;
        var pendEl = document.getElementById('pendientes');
        if (pendEl) pendEl.textContent = pendientes;
    }

    // ============================================================
    // ACTUALIZAR PLAN PERSONAL
    // ============================================================
    async function actualizarPlanPersonal(acciones) {
        var container = document.getElementById('lista-acciones-personales');
        if (!container) return;

        if (acciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No tienes acciones en tu plan personal. Crea una nueva acci&oacute;n.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Acci&oacute;n</th><th>Tipo</th><th>Estado</th><th>Fecha</th><th>Acci&oacute;n</th></tr></thead><tbody>';
        acciones.forEach(function(a) {
            var estadoClass = a.estado === 'completado' ? 'success' : a.estado === 'en_progreso' ? 'warning' : 'danger';
            var estadoText = a.estado === 'completado' ? 'Completado' : a.estado === 'en_progreso' ? 'En progreso' : 'Pendiente';
            var icono = a.icono || '&#128203;';
            html += '<tr><td><strong>' + icono + ' ' + a.titulo + '</strong></td>';
            html += '<td><span class="badge badge-info">' + (a.tipo || 'general') + '</span></td>';
            html += '<td><span class="badge badge-' + estadoClass + '">' + estadoText + '</span></td>';
            html += '<td>' + (a.fecha_limite || 'Sin fecha') + '</td>';
            html += '<td>';
            if (a.estado === 'completado') {
                html += '<span class="badge badge-success">&#9989; Hecho</span>';
            } else {
                html += '<button class="btn btn-sm btn-primary" onclick="EgresadoModule.marcarCompletada(' + a.id + ')">&#9989; Marcar</button> ';
                html += '<button class="btn btn-sm btn-danger" onclick="EgresadoModule.eliminarAccion(' + a.id + ')">&#128465; Eliminar</button>';
            }
            html += '</td></tr>';
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    // ============================================================
    // ACTUALIZAR PLAN DE SUPERACI&Oacute;N (SOLO LECTURA)
    // ============================================================
    async function actualizarPlanSuperacion(acciones) {
        var container = document.getElementById('lista-acciones-superacion');
        if (!container) return;

        if (acciones.length === 0) {
            container.innerHTML = '<p class="text-muted">Tu tutor a&uacute;n no ha definido un plan de superaci&oacute;n para ti.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Acci&oacute;n</th><th>Tipo</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>';
        acciones.forEach(function(a) {
            var estadoClass = a.estado === 'completado' ? 'success' : a.estado === 'en_progreso' ? 'warning' : 'danger';
            var estadoText = a.estado === 'completado' ? 'Completado' : a.estado === 'en_progreso' ? 'En progreso' : 'Pendiente';
            var icono = a.icono || '&#128203;';
            html += '<tr><td><strong>' + icono + ' ' + a.titulo + '</strong></td>';
            html += '<td><span class="badge badge-info">' + (a.tipo || 'general') + '</span></td>';
            html += '<td><span class="badge badge-' + estadoClass + '">' + estadoText + '</span></td>';
            html += '<td>' + (a.fecha_limite || 'Sin fecha') + '</td></tr>';
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    // ============================================================
    // DASHBOARD - CON EMOJIS HTML ENTITIES
    // ============================================================
    function renderDashboard() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-chart-pie"></i> Mi Dashboard</h2>
                <div class="breadcrumb">Bienvenido, <span>Egresado</span></div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">&#128203;</div>
                    <div class="number" id="total-acciones">0</div>
                    <div class="label">Total de Acciones</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">&#9989;</div>
                    <div class="number" id="completadas">0</div>
                    <div class="label">Completadas</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">&#128260;</div>
                    <div class="number" id="en-progreso">0</div>
                    <div class="label">En Progreso</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #b33a4a;">
                    <div class="stat-icon">&#9203;</div>
                    <div class="number" id="pendientes">0</div>
                    <div class="label">Pendientes</div>
                </div>
            </div>

            <div class="card" style="border:2px solid #1a8a4a;">
                <div class="card-title"><i class="fas fa-clipboard-list"></i> Mi Plan Personal</div>
                <p style="font-size:13px;color:#64748b;margin-bottom:12px;">T&uacute; defines y gestionas este plan.</p>
                <div id="lista-acciones-personales">
                    <p class="text-muted">Cargando acciones...</p>
                </div>
                <button class="btn btn-primary" onclick="EgresadoModule.mostrarFormularioAccion()" style="margin-top:12px;">
                    <i class="fas fa-plus"></i> Agregar acci&oacute;n
                </button>
            </div>

            <div class="card" style="border:2px solid #2a6b9c;">
                <div class="card-title"><i class="fas fa-star"></i> Plan de Superaci&oacute;n</div>
                <p style="font-size:13px;color:#64748b;margin-bottom:12px;">Plan definido por tu tutor (solo lectura).</p>
                <div id="lista-acciones-superacion">
                    <p class="text-muted">Cargando plan de superaci&oacute;n...</p>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-calendar-alt"></i> Pr&oacute;ximas Actividades</div>
                    <div id="proximas-actividades">
                        <p class="text-muted">Cargando...</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-star"></i> Mis Evaluaciones</div>
                    <div id="mis-evaluaciones">
                        <p class="text-muted">Cargando...</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-chalkboard-user"></i> Tutor&iacute;as Recientes</div>
                <div id="historial-tutorias">
                    <p class="text-muted">Cargando tutor&iacute;as...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // PLAN PERSONAL
    // ============================================================
    function renderPlanPersonal() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-clipboard-list"></i> Mi Plan Personal</h2>
                <div class="breadcrumb">Plan que t&uacute; defines y gestionas</div>
            </div>

            <div class="card" style="border:2px solid #1a8a4a;">
                <div class="card-title"><i class="fas fa-list-check"></i> Mis Acciones</div>
                <div id="lista-acciones-personales">
                    <p class="text-muted">Cargando acciones...</p>
                </div>
                <button class="btn btn-primary" onclick="EgresadoModule.mostrarFormularioAccion()" style="margin-top:12px;">
                    <i class="fas fa-plus"></i> Agregar acci&oacute;n
                </button>
            </div>

            <div class="card" style="border:2px solid #2a6b9c;">
                <div class="card-title"><i class="fas fa-info-circle"></i> &iquest;Qu&eacute; es el Plan Personal?</div>
                <p style="color:#475569;font-size:14px;line-height:1.7;">
                    Tu <strong>Plan Personal</strong> es el espacio donde t&uacute; defines tus propias metas y acciones 
                    de superaci&oacute;n. Este plan es <strong>gestionado por ti</strong> y puedes agregar, editar o 
                    marcar acciones como completadas.
                </p>
                <p style="color:#475569;font-size:14px;line-height:1.7;margin-top:8px;">
                    El <strong>Plan de Superaci&oacute;n</strong> (definido por tu tutor) se muestra en la secci&oacute;n 
                    correspondiente del men&uacute; lateral.
                </p>
            </div>
        `;
    }

    // ============================================================
    // PLAN DE SUPERACI&Oacute;N
    // ============================================================
    function renderPlanSuperacion() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Plan de Superaci&oacute;n</h2>
                <div class="breadcrumb">Plan definido por tu tutor</div>
            </div>

            <div class="card" style="border:2px solid #2a6b9c;background:#f0f7ff;">
                <div class="card-title"><i class="fas fa-info-circle" style="color:#2a6b9c;"></i> Plan definido por tu tutor</div>
                <p style="color:#475569;font-size:14px;line-height:1.7;">
                    Este plan ha sido dise&ntilde;ado por tu tutor para guiar tu superaci&oacute;n profesional. 
                    Las acciones aqu&iacute; listadas son <strong>solo lectura</strong> y no pueden ser 
                    modificadas por ti.
                </p>
                <p style="color:#475569;font-size:14px;line-height:1.7;margin-top:8px;">
                    Puedes consultar este plan para conocer las metas y acciones que tu tutor ha 
                    establecido para tu desarrollo profesional.
                </p>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Acciones del Plan de Superaci&oacute;n</div>
                <div id="lista-acciones-superacion">
                    <p class="text-muted">Cargando plan de superaci&oacute;n...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // MOSTRAR FORMULARIO ACCI&Oacute;N
    // ============================================================
    function mostrarFormularioAccion() {
        var container = document.createElement('div');
        container.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 30, 60, 0.6); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            z-index: 100000; padding: 20px;
        `;
        container.innerHTML = `
            <div style="background:white;border-radius:16px;padding:24px;max-width:480px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:modalSlideIn 0.3s ease;max-height:80vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="margin:0;color:#0a1e3c;font-size:18px;">
                        <i class="fas fa-plus-circle" style="color:#1a8a4a;"></i> Nueva Acci&oacute;n Personal
                    </h3>
                    <button onclick="this.closest('div[style]').remove()" style="background:transparent;border:none;font-size:20px;cursor:pointer;color:#94a3b8;">&times;</button>
                </div>
                <form id="form-accion-personal">
                    <div class="form-group">
                        <label>T&iacute;tulo <span class="required">*</span></label>
                        <input type="text" id="accion-titulo" placeholder="Ej: Curso de Liderazgo" required>
                    </div>
                    <div class="form-group">
                        <label>Tipo</label>
                        <select id="accion-tipo">
                            <option value="curso">&#128218; Curso</option>
                            <option value="taller">&#128295; Taller</option>
                            <option value="entrenamiento">&#127907; Entrenamiento</option>
                            <option value="seminario">&#127908; Seminario</option>
                            <option value="proyecto">&#128193; Proyecto</option>
                            <option value="tutoria">&#128221; Tutor&iacute;a</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fecha l&iacute;mite</label>
                        <input type="date" id="accion-fecha">
                    </div>
                    <div class="form-group">
                        <label>Descripci&oacute;n</label>
                        <textarea rows="2" id="accion-descripcion" placeholder="Breve descripci&oacute;n de la acci&oacute;n..."></textarea>
                    </div>
                    <div style="display:flex;gap:12px;margin-top:16px;">
                        <button type="submit" class="btn btn-primary" style="flex:1;"><i class="fas fa-save"></i> Guardar</button>
                        <button type="button" class="btn btn-outline" style="flex:1;" onclick="this.closest('div[style]').remove()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(container);

        document.getElementById('form-accion-personal').addEventListener('submit', async function(e) {
            e.preventDefault();
            await guardarAccionPersonal();
        });
    }

    // ============================================================
    // GUARDAR ACCI&Oacute;N PERSONAL
    // ============================================================
    async function guardarAccionPersonal() {
        var titulo = document.getElementById('accion-titulo').value.trim();
        var tipo = document.getElementById('accion-tipo').value;
        var fecha = document.getElementById('accion-fecha').value;
        var descripcion = document.getElementById('accion-descripcion').value.trim();

        if (!titulo) {
            await ModalModule.warning('El t&iacute;tulo es obligatorio.');
            return;
        }

        try {
            var plan = await DBModule.query(
                `SELECT id FROM planes_superacion 
                 WHERE egresado_id = ? AND tipo = 'personal' AND estado = 'activo'`,
                [egresadoId]
            );

            var planId;
            if (plan.length === 0) {
                var result = await DBModule.execute(
                    `INSERT INTO planes_superacion (egresado_id, tutor_id, anio_plan, tipo, estado, progreso, fecha_inicio) 
                     VALUES (?, 1, strftime('%Y', 'now'), 'personal', 'activo', 0, date('now'))`,
                    [egresadoId]
                );
                planId = result.lastID;
            } else {
                planId = plan[0].id;
            }

            await DBModule.execute(
                `INSERT INTO acciones_plan (plan_id, titulo, descripcion, tipo, estado, fecha_limite) 
                 VALUES (?, ?, ?, ?, 'pendiente', ?)`,
                [planId, titulo, descripcion, tipo, fecha || null]
            );

            await ModalModule.success('&#9989; Acci&oacute;n agregada a tu plan personal.');
            container.remove();
            loadData();

        } catch (error) {
            console.error('Error al guardar acci&oacute;n:', error);
            await ModalModule.error('Error al guardar acci&oacute;n: ' + error.message);
        }
    }

    // ============================================================
    // ELIMINAR ACCI&Oacute;N PERSONAL
    // ============================================================
    async function eliminarAccion(accionId) {
        var confirmado = await ModalModule.confirmDelete('&iquest;Eliminar esta acci&oacute;n de tu plan personal?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM acciones_plan WHERE id = ?', [accionId]);
            await ModalModule.success('Acci&oacute;n eliminada.');
            loadData();
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // TUTORIAS
    // ============================================================
    function renderTutorias() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-chalkboard-user"></i> Mis Tutor&iacute;as</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Tutor: <span id="nombre-tutor">Cargando...</span></div>
            </div>

            <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-history"></i> Historial de Tutor&iacute;as</div>
                    <div id="historial-tutorias">
                        <p class="text-muted">Cargando historial...</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-pen"></i> Solicitar Tutor&iacute;a</div>
                    <form id="form-solicitar-tutoria">
                        <div class="form-group">
                            <label>Motivo de la tutor&iacute;a <span class="required">*</span></label>
                            <textarea rows="4" id="tutoria-motivo" placeholder="Describe lo que deseas tratar con tu tutor..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Fecha preferida</label>
                            <input type="date" id="tutoria-fecha-pref">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block"><i class="fas fa-paper-plane"></i> Enviar solicitud</button>
                    </form>
                    <div style="margin-top:16px;padding:12px;background:#f1f4f8;border-radius:10px;">
                        <p style="font-size:13px;color:#64748b;"><i class="fas fa-info-circle"></i> &#8505; El tutor recibir&aacute; tu solicitud por correo y te contactar&aacute;.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // EVIDENCIAS
    // ============================================================
    function renderEvidencias() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-upload"></i> Mis Evidencias</h2>
                <div class="breadcrumb">Certificados, informes y proyectos</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-upload"></i> Subir Evidencia</div>
                <form id="form-subir-evidencia">
                    <div class="form-row">
                        <div class="form-group">
                            <label>T&iacute;tulo <span class="required">*</span></label>
                            <input type="text" id="evidencia-titulo" placeholder="Ej: Certificado de Manejo de Plagas" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo <span class="required">*</span></label>
                            <select id="evidencia-tipo" required>
                                <option value="">Selecciona...</option>
                                <option value="certificado">&#128220; Certificado</option>
                                <option value="informe">&#128196; Informe</option>
                                <option value="proyecto">&#128193; Proyecto</option>
                                <option value="evaluacion">&#11088; Evaluaci&oacute;n</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Descripci&oacute;n</label>
                        <textarea rows="2" id="evidencia-descripcion" placeholder="Breve descripci&oacute;n de la evidencia..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Archivo</label>
                        <input type="file" id="evidencia-archivo" accept=".pdf,.doc,.docx,.jpg,.png">
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-upload"></i> Subir evidencia</button>
                </form>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-folder-open"></i> Mis Evidencias</div>
                <div id="lista-evidencias">
                    <p class="text-muted">No has subido ninguna evidencia.</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // EVALUACIONES
    // ============================================================
    function renderEvaluaciones() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Mis Evaluaciones</h2>
                <div class="breadcrumb">Historial de evaluaciones</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-history"></i> Historial de Evaluaciones</div>
                <div id="historial-evaluaciones">
                    <p class="text-muted">Cargando evaluaciones...</p>
                </div>
            </div>

            <div class="card" style="border:2px solid #2a6b9c;">
                <div class="card-title"><i class="fas fa-edit"></i> Autoevaluaci&oacute;n</div>
                <form id="form-autoevaluacion">
                    <div class="form-group">
                        <label>1. Integraci&oacute;n Institucional <span class="required">*</span></label>
                        <select id="autoeval-integracion" required>
                            <option value="">Selecciona...</option>
                            <option value="1">1 - Muy bajo</option>
                            <option value="2">2 - Bajo</option>
                            <option value="3">3 - Adecuado</option>
                            <option value="4">4 - Bueno</option>
                            <option value="5">5 - Excelente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>2. Desarrollo de Competencias <span class="required">*</span></label>
                        <select id="autoeval-competencias" required>
                            <option value="">Selecciona...</option>
                            <option value="1">1 - Muy bajo</option>
                            <option value="2">2 - Bajo</option>
                            <option value="3">3 - Adecuado</option>
                            <option value="4">4 - Bueno</option>
                            <option value="5">5 - Excelente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>3. Impacto en el Desempe&ntilde;o <span class="required">*</span></label>
                        <select id="autoeval-impacto" required>
                            <option value="">Selecciona...</option>
                            <option value="1">1 - Muy bajo</option>
                            <option value="2">2 - Bajo</option>
                            <option value="3">3 - Adecuado</option>
                            <option value="4">4 - Bueno</option>
                            <option value="5">5 - Excelente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Comentarios</label>
                        <textarea rows="3" id="autoeval-comentario" placeholder="Observaciones adicionales..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar autoevaluaci&oacute;n</button>
                </form>
            </div>
        `;
    }

    // ============================================================
    // CARGAR TUTORIAS
    // ============================================================
    async function cargarTutorias() {
        var container = document.getElementById('historial-tutorias');
        if (!container) return;

        var tutorias = await DBModule.query(
            `SELECT t.*, u.nombre as tutor_nombre 
             FROM tutorias t 
             JOIN tutores tr ON t.tutor_id = tr.id 
             JOIN usuarios u ON tr.usuario_id = u.id 
             WHERE t.egresado_id = ? 
             ORDER BY t.fecha DESC`,
            [egresadoId]
        );

        if (tutorias.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay tutor&iacute;as registradas.</p>';
            return;
        }

        var html = '';
        tutorias.forEach(function(t) {
            html += '<div class="timeline-item"><div class="timeline-dot done"></div><div class="timeline-content">';
            html += '<div class="title">&#128221; Tutor&iacute;a con ' + t.tutor_nombre + ' - ' + t.fecha + '</div>';
            html += '<div class="desc">' + t.resumen + '</div>';
            if (t.acuerdos) html += '<div class="desc" style="color:#0a1e3c;"><strong>&#129309; Acuerdos:</strong> ' + t.acuerdos + '</div>';
            if (t.proxima_tutoria) html += '<div class="date">&#128197; Pr&oacute;xima: ' + t.proxima_tutoria + '</div>';
            html += '</div></div>';
        });
        container.innerHTML = html;
    }

    // ============================================================
    // CARGAR EVALUACIONES
    // ============================================================
    async function cargarEvaluaciones() {
        var container = document.getElementById('historial-evaluaciones');
        if (!container) return;

        var evaluaciones = await DBModule.query(
            'SELECT * FROM evaluaciones WHERE egresado_id = ? ORDER BY fecha DESC',
            [egresadoId]
        );

        if (evaluaciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay evaluaciones registradas.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Dimensi&oacute;n</th><th>Puntaje</th><th>Comentario</th><th>Fecha</th></tr></thead><tbody>';
        evaluaciones.forEach(function(e) {
            var color = e.puntaje >= 4 ? '#1a8a4a' : e.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
            html += '<tr><td><strong>&#11088; ' + e.dimension + '</strong></td>';
            html += '<td><span style="color:' + color + ';font-weight:700;">' + e.puntaje + '/5</span></td>';
            html += '<td>' + (e.comentario || 'Sin comentarios') + '</td>';
            html += '<td>' + (e.fecha || e.created_at || 'Sin fecha') + '</td></tr>';
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    // ============================================================
    // CARGAR EVIDENCIAS
    // ============================================================
    async function cargarEvidencias() {
        var container = document.getElementById('lista-evidencias');
        if (!container) return;

        var evidencias = await DBModule.query(
            'SELECT * FROM evidencias WHERE egresado_id = ? ORDER BY created_at DESC',
            [egresadoId]
        );

        if (evidencias.length === 0) {
            container.innerHTML = '<p class="text-muted">No has subido ninguna evidencia.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>T&iacute;tulo</th><th>Tipo</th><th>Fecha</th><th>Acci&oacute;n</th></tr></thead><tbody>';
        evidencias.forEach(function(e) {
            var icono = e.tipo === 'certificado' ? '&#128220;' : e.tipo === 'informe' ? '&#128196;' : e.tipo === 'proyecto' ? '&#128193;' : '&#128206;';
            html += '<tr><td><strong>' + icono + ' ' + e.titulo + '</strong></td>';
            html += '<td><span class="badge badge-info">' + e.tipo + '</span></td>';
            html += '<td>' + (e.fecha_subida || e.created_at || 'Sin fecha') + '</td>';
            html += '<td><button class="btn btn-sm btn-danger" onclick="EgresadoModule.eliminarEvidencia(' + e.id + ')">&#128465; Eliminar</button></td></tr>';
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    // ============================================================
    // MARCAR COMPLETADA
    // ============================================================
    async function marcarCompletada(accionId) {
        try {
            await DBModule.execute(
                'UPDATE acciones_plan SET estado = "completado", fecha_completado = date("now") WHERE id = ?',
                [accionId]
            );
            await ModalModule.success('Acci&oacute;n marcada como completada.');
            loadData();
        } catch (error) {
            await ModalModule.error('Error al marcar acci&oacute;n.');
        }
    }

    // ============================================================
    // ELIMINAR EVIDENCIA
    // ============================================================
    async function eliminarEvidencia(evidenciaId) {
        var confirmado = await ModalModule.confirmDelete('Eliminar esta evidencia?', 'Eliminar Evidencia');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM evidencias WHERE id = ?', [evidenciaId]);
            await ModalModule.success('Evidencia eliminada.');
            loadData();
        } catch (error) {
            await ModalModule.error('Error al eliminar.');
        }
    }

    // ============================================================
    // SOLICITAR TUTOR
    // ============================================================
    function renderSolicitarTutor() {
        var container = document.getElementById('page-container');
        if (!container) return;

        var user = AuthModule.getCurrentUser();
        
        DBModule.query(
            'SELECT e.*, u.nombre as egresado_nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id WHERE e.usuario_id = ?',
            [user.id]
        ).then(function(egresadoResult) {
            if (egresadoResult.length === 0) {
                container.innerHTML = `
                    <div class="page-header">
                        <h2><i class="fas fa-user-tie"></i> Solicitar Tutor</h2>
                        <div class="breadcrumb">Encuentra un tutor para tu superaci&oacute;n</div>
                    </div>
                    <div class="card">
                        <p class="text-muted">No se encontr&oacute; tu perfil de egresado.</p>
                        <p class="text-muted">Contacta al administrador del sistema.</p>
                    </div>
                `;
                return;
            }

            var egresadoData = egresadoResult[0];
            var tieneTutor = egresadoData.tutor_id && egresadoData.tutor_id > 0;

            DBModule.query(
                `SELECT t.*, u.nombre as tutor_nombre, u.email as tutor_email 
                 FROM tutores t 
                 JOIN usuarios u ON t.usuario_id = u.id 
                 WHERE t.id NOT IN (
                     SELECT DISTINCT tutor_id FROM egresados WHERE tutor_id IS NOT NULL
                 )
                 ORDER BY u.nombre`
            ).then(function(tutores) {
                var tutorActual = null;
                if (tieneTutor) {
                    DBModule.query(
                        `SELECT u.nombre as tutor_nombre, u.email as tutor_email 
                         FROM tutores t JOIN usuarios u ON t.usuario_id = u.id 
                         WHERE t.id = ?`,
                        [egresadoData.tutor_id]
                    ).then(function(tutorResult) {
                        if (tutorResult.length > 0) {
                            tutorActual = tutorResult[0];
                        }
                        renderizarSolicitudTutor(egresadoData, tieneTutor, tutores, tutorActual);
                    });
                } else {
                    renderizarSolicitudTutor(egresadoData, tieneTutor, tutores, null);
                }
            });
        });
    }

    function renderizarSolicitudTutor(egresadoData, tieneTutor, tutores, tutorActual) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-user-tie"></i> Solicitar Tutor</h2>
                <div class="breadcrumb">Encuentra un tutor para tu superaci&oacute;n</div>
            </div>

            ${tieneTutor ? `
                <div class="card" style="border:2px solid #1a8a4a;">
                    <div class="card-title"><i class="fas fa-check-circle" style="color:#1a8a4a;"></i> Tu tutor actual</div>
                    <p><strong>Nombre:</strong> ${tutorActual ? tutorActual.tutor_nombre : 'No disponible'}</p>
                    <p><strong>Email:</strong> ${tutorActual ? tutorActual.tutor_email : 'No disponible'}</p>
                    <button class="btn btn-danger" onclick="EgresadoModule.liberarTutor()">
                        <i class="fas fa-times"></i> Liberar tutor
                    </button>
                </div>
            ` : ''}

            <div class="card">
                <div class="card-title"><i class="fas fa-user-plus"></i> Tutores disponibles</div>
                ${tutores.length === 0 ? 
                    '<p class="text-muted">No hay tutores disponibles en este momento.</p>' :
                    `<div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Acci&oacute;n</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tutores.map(function(t) {
                                    return `<tr>
                                        <td><strong>${t.tutor_nombre}</strong></td>
                                        <td>${t.tutor_email || 'No disponible'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-success" onclick="EgresadoModule.solicitarTutor(${t.id})">
                                                <i class="fas fa-handshake"></i> Solicitar
                                            </button>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>`
                }
            </div>
        `;

        container.innerHTML = html;
    }

    // ============================================================
    // SOLICITAR TUTOR
    // ============================================================
    async function solicitarTutor(tutorId) {
        var confirmado = await ModalModule.confirm('Deseas solicitar a este tutor como tu tutor principal?', 'Solicitar Tutor');
        if (!confirmado) return;
        try {
            var user = AuthModule.getCurrentUser();
            var egresado = await DBModule.query(
                'SELECT id FROM egresados WHERE usuario_id = ?',
                [user.id]
            );
            if (egresado.length === 0) {
                await ModalModule.error('No se encontr&oacute; tu perfil.');
                return;
            }

            await DBModule.execute(
                'UPDATE egresados SET tutor_id = ? WHERE id = ?',
                [tutorId, egresado[0].id]
            );

            await NotificationsModule.createNotification(
                tutorId,
                'tutoria',
                'Un egresado te ha solicitado como tutor.',
                '#tutorados'
            );

            await ModalModule.success('Solicitud enviada al tutor.');
            renderSolicitarTutor();
        } catch (error) {
            await ModalModule.error('Error al solicitar tutor: ' + error.message);
        }
    }

    // ============================================================
    // LIBERAR TUTOR
    // ============================================================
    async function liberarTutor() {
        var confirmado = await ModalModule.confirm('Estas seguro de que quieres liberar a tu tutor actual?', 'Liberar Tutor');
        if (!confirmado) return;
        try {
            var user = AuthModule.getCurrentUser();
            var egresado = await DBModule.query(
                'SELECT id FROM egresados WHERE usuario_id = ?',
                [user.id]
            );
            if (egresado.length === 0) {
                await ModalModule.error('No se encontr&oacute; tu perfil.');
                return;
            }

            await DBModule.execute(
                'UPDATE egresados SET tutor_id = NULL WHERE id = ?',
                [egresado[0].id]
            );

            await ModalModule.success('Tutor liberado correctamente.');
            renderSolicitarTutor();
        } catch (error) {
            await ModalModule.error('Error al liberar tutor.');
        }
    }

    // ============================================================
    // SOLICITAR TUTORIA
    // ============================================================
    async function solicitarTutoria() {
        var motivo = document.getElementById('tutoria-motivo').value.trim();
        var fechaPref = document.getElementById('tutoria-fecha-pref').value;

        if (!motivo) {
            await ModalModule.warning('El motivo es obligatorio.');
            return;
        }

        try {
            var egresado = await DBModule.query(
                'SELECT e.*, u.nombre as egresado_nombre, u.email as egresado_email FROM egresados e JOIN usuarios u ON e.usuario_id = u.id WHERE e.id = ?',
                [egresadoId]
            );

            if (egresado.length === 0) {
                throw new Error('Egresado no encontrado.');
            }

            var egresadoData = egresado[0];

            var tutorData = await DBModule.query(
                'SELECT t.*, u.nombre as tutor_nombre, u.email as tutor_email, d.email_institucional as tutor_email_institucional FROM tutores t JOIN usuarios u ON t.usuario_id = u.id LEFT JOIN docentes d ON t.docente_id = d.id WHERE t.id = ?',
                [egresadoData.tutor_id]
            );

            if (tutorData.length === 0) {
                throw new Error('Tutor no encontrado.');
            }

            var tutor = tutorData[0];
            var tutorEmail = tutor.tutor_email || tutor.tutor_email_institucional;

            await DBModule.execute(
                'INSERT INTO tutorias (egresado_id, tutor_id, fecha, resumen, estado) VALUES (?, ?, date("now"), ?, "solicitada")',
                [egresadoId, egresadoData.tutor_id, motivo + (fechaPref ? ' (Fecha preferida: ' + fechaPref + ')' : '')]
            );

            if (NotificationsModule && tutorEmail) {
                var asunto = 'Nueva solicitud de tutor&iacute;a de ' + egresadoData.egresado_nombre;
                var mensaje = 'El egresado ' + egresadoData.egresado_nombre + ' ha solicitado una tutor&iacute;a.\n\n' +
                              'Motivo: ' + motivo + '\n' +
                              (fechaPref ? 'Fecha preferida: ' + fechaPref + '\n' : '') +
                              '\nEnlace: ' + window.location.origin + '/sispe/#tutorados';

                await NotificationsModule.sendEmail(
                    tutorEmail,
                    tutor.tutor_nombre || 'Tutor',
                    asunto,
                    mensaje,
                    window.location.origin + '/sispe/#tutorados',
                    egresadoData.egresado_email
                );

                await ModalModule.success('Solicitud enviada. El tutor recibir&aacute; un correo.');
            } else {
                await ModalModule.success('Solicitud enviada. El tutor la revisar&aacute; pronto.');
            }

            await NotificationsModule.createNotification(
                egresadoData.usuario_id,
                'tutoria',
                'Has solicitado una tutor&iacute;a a ' + tutor.tutor_nombre + '. Espera su respuesta.',
                '#tutorias'
            );

            document.getElementById('tutoria-motivo').value = '';
            document.getElementById('tutoria-fecha-pref').value = '';
            loadData();

        } catch (error) {
            console.error('Error al solicitar tutor&iacute;a:', error);
            await ModalModule.error('Error al enviar la solicitud: ' + error.message);
        }
    }

    // ============================================================
    // MIS CURSOS
    // ============================================================
    function renderMisCursos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-graduation-cap"></i> Mis Cursos</h2>
                <div class="breadcrumb">Cursos en los que estoy inscrito</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="EgresadoModule.mostrarInscripcionCurso()">
                    <i class="fas fa-plus"></i> Inscribirse en Curso
                </button>
            </div>

            <div id="formulario-inscripcion-curso-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Mis Cursos</div>
                <div id="mis-cursos-lista">
                    <p class="text-muted">Cargando tus cursos...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // MIS EVENTOS
    // ============================================================
    function renderMisEventos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-calendar-check"></i> Mis Eventos</h2>
                <div class="breadcrumb">Eventos en los que participo</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="EgresadoModule.mostrarRegistroEvento()">
                    <i class="fas fa-plus"></i> Registrar en Evento
                </button>
            </div>

            <div id="formulario-registro-evento-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Mis Eventos</div>
                <div id="mis-eventos-lista">
                    <p class="text-muted">Cargando tus eventos...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // CARGAR MIS CURSOS
    // ============================================================
    async function cargarMisCursos() {
        var container = document.getElementById('mis-cursos-lista');
        if (!container) return;

        try {
            var cursos = await DBModule.query(
                `SELECT c.*, ec.estado as inscripcion_estado, ec.fecha_inicio, ec.fecha_completado, ec.calificacion
                 FROM egresados_cursos ec
                 JOIN cursos c ON ec.curso_id = c.id
                 WHERE ec.egresado_id = ?
                 ORDER BY ec.fecha_inicio DESC`,
                [egresadoId]
            );

            if (!cursos || cursos.length === 0) {
                container.innerHTML = '<p class="text-muted">No est&aacute;s registrado en ning&uacute;n curso.</p>';
                return;
            }

            var html = '<div class="table-wrap"><table><thead><tr><th>Curso</th><th>Tipo</th><th>Estado</th><th>Calificaci&oacute;n</th><th>Fecha Inicio</th></tr></thead><tbody>';
            cursos.forEach(function(c) {
                var estadoClass = c.inscripcion_estado === 'completado' ? 'success' : c.inscripcion_estado === 'en_curso' ? 'warning' : 'info';
                var estadoText = c.inscripcion_estado === 'completado' ? '&#9989; Completado' : c.inscripcion_estado === 'en_curso' ? '&#128260; En curso' : '&#128221; Inscrito';
                html += '<tr><td><strong>' + c.titulo + '</strong></td>' +
                    '<td><span class="badge badge-info">' + (c.tipo || 'General') + '</span></td>' +
                    '<td><span class="badge badge-' + estadoClass + '">' + estadoText + '</span></td>' +
                    '<td>' + (c.calificacion ? c.calificacion + '/10' : 'Pendiente') + '</td>' +
                    '<td>' + (c.fecha_inicio || 'Sin fecha') + '</td></tr>';
            });
            html += '</tbody></table></div>';
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = '<p class="text-muted">No est&aacute;s registrado en ning&uacute;n curso.</p>';
        }
    }

    // ============================================================
    // CARGAR MIS EVENTOS
    // ============================================================
    async function cargarMisEventos() {
        var container = document.getElementById('mis-eventos-lista');
        if (!container) return;

        try {
            var eventos = await DBModule.query(
                `SELECT e.*, ee.rol as participacion_rol, ee.fecha_participacion
                 FROM egresados_eventos ee
                 JOIN eventos e ON ee.evento_id = e.id
                 WHERE ee.egresado_id = ?
                 ORDER BY e.fecha_inicio DESC`,
                [egresadoId]
            );

            if (!eventos || eventos.length === 0) {
                container.innerHTML = '<p class="text-muted">No est&aacute;s registrado en ning&uacute;n evento.</p>';
                return;
            }

            var html = '<div class="table-wrap"><table><thead><tr><th>Evento</th><th>Tipo</th><th>Rol</th><th>Fecha</th><th>Lugar</th></tr></thead><tbody>';
            eventos.forEach(function(e) {
                var fecha = e.fecha_inicio ? (e.fecha_inicio + (e.fecha_fin ? ' - ' + e.fecha_fin : '')) : 'Sin fecha';
                var rolClass = e.participacion_rol === 'ponente' ? 'warning' : e.participacion_rol === 'organizador' ? 'success' : 'info';
                html += '<tr><td><strong>' + e.nombre + '</strong></td>' +
                    '<td><span class="badge badge-info">' + (e.tipo || 'General') + '</span></td>' +
                    '<td><span class="badge badge-' + rolClass + '">' + (e.participacion_rol || 'Participante') + '</span></td>' +
                    '<td>' + fecha + '</td>' +
                    '<td>' + (e.lugar || 'N/A') + '</td></tr>';
            });
            html += '</tbody></table></div>';
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = '<p class="text-muted">No est&aacute;s registrado en ning&uacute;n evento.</p>';
        }
    }

    // ============================================================
    // MOSTRAR INSCRIPCI&Oacute;N CURSO
    // ============================================================
    function mostrarInscripcionCurso() {
        var container = document.getElementById('formulario-inscripcion-curso-container');
        if (!container) return;

        DBModule.query(`
            SELECT c.id, c.titulo, c.tipo, c.modalidad 
            FROM cursos c
            WHERE c.id NOT IN (
                SELECT curso_id FROM egresados_cursos WHERE egresado_id = ?
            )
            ORDER BY c.titulo
        `, [egresadoId]).then(function(cursos) {
            
            var options = '<option value="">Selecciona un curso...</option>';
            if (!cursos || cursos.length === 0) {
                options += '<option value="" disabled>No hay cursos disponibles</option>';
            } else {
                cursos.forEach(function(c) {
                    options += `<option value="${c.id}">${c.titulo} (${c.tipo || 'General'})</option>`;
                });
            }

            container.innerHTML = `
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas fa-plus-circle"></i> Inscribirse en Curso</div>
                    <form id="form-inscripcion-curso">
                        <div class="form-group">
                            <label>Curso <span class="required">*</span></label>
                            <select id="inscripcion-curso-id" required>
                                ${options}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado de inscripci&oacute;n</label>
                            <select id="inscripcion-curso-estado">
                                <option value="inscrito">Inscrito</option>
                                <option value="en_curso">En curso</option>
                                <option value="completado">Completado</option>
                            </select>
                        </div>
                        <div style="display:flex;gap:12px;margin-top:16px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Inscribirse</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-inscripcion-curso-container').innerHTML=''">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('form-inscripcion-curso').addEventListener('submit', async function(e) {
                e.preventDefault();
                await inscribirCurso();
            });
        });
    }

    // ============================================================
    // INSCRIBIR CURSO
    // ============================================================
    async function inscribirCurso() {
        var cursoId = document.getElementById('inscripcion-curso-id').value;
        var estado = document.getElementById('inscripcion-curso-estado').value;

        if (!cursoId) {
            await ModalModule.warning('Selecciona un curso para inscribirte.');
            return;
        }

        try {
            await DBModule.execute(
                `INSERT INTO egresados_cursos (egresado_id, curso_id, estado, fecha_inicio) 
                 VALUES (?, ?, ?, date('now'))`,
                [egresadoId, cursoId, estado]
            );
            await ModalModule.success('&#9989; Te has inscrito al curso correctamente.');
            document.getElementById('formulario-inscripcion-curso-container').innerHTML = '';
            await cargarMisCursos();
        } catch (error) {
            await ModalModule.error('Error al inscribirte en el curso: ' + error.message);
        }
    }

    // ============================================================
    // MOSTRAR REGISTRO EVENTO
    // ============================================================
    function mostrarRegistroEvento() {
        var container = document.getElementById('formulario-registro-evento-container');
        if (!container) return;

        DBModule.query(`
            SELECT e.id, e.nombre, e.tipo, e.fecha_inicio 
            FROM eventos e
            WHERE e.id NOT IN (
                SELECT evento_id FROM egresados_eventos WHERE egresado_id = ?
            )
            ORDER BY e.fecha_inicio DESC
        `, [egresadoId]).then(function(eventos) {
            
            var options = '<option value="">Selecciona un evento...</option>';
            if (!eventos || eventos.length === 0) {
                options += '<option value="" disabled>No hay eventos disponibles</option>';
            } else {
                eventos.forEach(function(e) {
                    options += `<option value="${e.id}">${e.nombre} (${e.tipo || 'General'})</option>`;
                });
            }

            container.innerHTML = `
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas fa-plus-circle"></i> Registrar en Evento</div>
                    <form id="form-registro-evento">
                        <div class="form-group">
                            <label>Evento <span class="required">*</span></label>
                            <select id="registro-evento-id" required>
                                ${options}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Rol en el evento</label>
                            <select id="registro-evento-rol">
                                <option value="participante">Participante</option>
                                <option value="ponente">Ponente</option>
                                <option value="organizador">Organizador</option>
                            </select>
                        </div>
                        <div style="display:flex;gap:12px;margin-top:16px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Registrar</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-registro-evento-container').innerHTML=''">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('form-registro-evento').addEventListener('submit', async function(e) {
                e.preventDefault();
                await registrarEvento();
            });
        });
    }

    // ============================================================
    // REGISTRAR EVENTO
    // ============================================================
    async function registrarEvento() {
        var eventoId = document.getElementById('registro-evento-id').value;
        var rol = document.getElementById('registro-evento-rol').value;

        if (!eventoId) {
            await ModalModule.warning('Selecciona un evento para registrarte.');
            return;
        }

        try {
            await DBModule.execute(
                `INSERT INTO egresados_eventos (egresado_id, evento_id, rol, fecha_participacion) 
                 VALUES (?, ?, ?, date('now'))`,
                [egresadoId, eventoId, rol]
            );
            await ModalModule.success('&#9989; Te has registrado en el evento correctamente.');
            document.getElementById('formulario-registro-evento-container').innerHTML = '';
            await cargarMisEventos();
        } catch (error) {
            await ModalModule.error('Error al registrarte en el evento: ' + error.message);
        }
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        cargarNombreTutor();

        var formTutoria = document.getElementById('form-solicitar-tutoria');
        if (formTutoria) {
            formTutoria.removeEventListener('submit', solicitarTutoria);
            formTutoria.addEventListener('submit', function(e) {
                e.preventDefault();
                solicitarTutoria();
            });
        }

        var formEvidencia = document.getElementById('form-subir-evidencia');
        if (formEvidencia) {
            formEvidencia.addEventListener('submit', async function(e) {
                e.preventDefault();
                var titulo = document.getElementById('evidencia-titulo').value.trim();
                var tipo = document.getElementById('evidencia-tipo').value;
                if (!titulo || !tipo) {
                    await ModalModule.warning('Completa los campos requeridos.');
                    return;
                }

                try {
                    await DBModule.execute(
                        'INSERT INTO evidencias (egresado_id, tipo, titulo, descripcion, fecha_subida) VALUES (?, ?, ?, ?, date("now"))',
                        [egresadoId, tipo, titulo, document.getElementById('evidencia-descripcion').value.trim()]
                    );
                    await ModalModule.success('Evidencia subida correctamente.');
                    formEvidencia.reset();
                    loadData();
                } catch (error) {
                    await ModalModule.error('Error al subir evidencia.');
                }
            });
        }

        var formAutoeval = document.getElementById('form-autoevaluacion');
        if (formAutoeval) {
            formAutoeval.addEventListener('submit', async function(e) {
                e.preventDefault();
                var integracion = parseInt(document.getElementById('autoeval-integracion').value);
                var competencias = parseInt(document.getElementById('autoeval-competencias').value);
                var impacto = parseInt(document.getElementById('autoeval-impacto').value);

                if (!integracion || !competencias || !impacto) {
                    await ModalModule.warning('Completa todas las preguntas.');
                    return;
                }

                var promedio = Math.round((integracion + competencias + impacto) / 3);
                var comentario = document.getElementById('autoeval-comentario').value.trim();

                try {
                    await DBModule.execute(
                        'INSERT INTO evaluaciones (egresado_id, tipo, dimension, puntaje, comentario, fecha) VALUES (?, "autoevaluacion", "Autoevaluaci&oacute;n Integral", ?, ?, date("now"))',
                        [egresadoId, promedio, comentario || 'Autoevaluaci&oacute;n completada.']
                    );
                    await ModalModule.success('Autoevaluaci&oacute;n guardada. Puntaje: ' + promedio + '/5');
                    formAutoeval.reset();
                    loadData();
                } catch (error) {
                    await ModalModule.error('Error al guardar autoevaluaci&oacute;n.');
                }
            });
        }
    }

    async function cargarNombreTutor() {
        try {
            var user = AuthModule.getCurrentUser();
            if (!user) return;

            var egresado = await DBModule.query(
                'SELECT tutor_id FROM egresados WHERE usuario_id = ?',
                [user.id]
            );

            if (egresado.length > 0 && egresado[0].tutor_id) {
                var tutor = await DBModule.query(
                    'SELECT u.nombre FROM tutores t JOIN usuarios u ON t.usuario_id = u.id WHERE t.id = ?',
                    [egresado[0].tutor_id]
                );
                if (tutor.length > 0) {
                    var nombreEl = document.getElementById('nombre-tutor');
                    if (nombreEl) nombreEl.textContent = tutor[0].nombre;
                }
            }
        } catch (error) {
            console.error('Error al cargar nombre del tutor:', error);
        }
    }

    window.EgresadoModule = window.EgresadoModule || {};
    window.EgresadoModule.marcarCompletada = marcarCompletada;
    window.EgresadoModule.eliminarAccion = eliminarAccion;
    window.EgresadoModule.eliminarEvidencia = eliminarEvidencia;
    window.EgresadoModule.solicitarTutoria = solicitarTutoria;
    window.EgresadoModule.mostrarInscripcionCurso = mostrarInscripcionCurso;
    window.EgresadoModule.mostrarRegistroEvento = mostrarRegistroEvento;
    window.EgresadoModule.mostrarFormularioAccion = mostrarFormularioAccion;

    return {
        navigate: navigate,
        marcarCompletada: marcarCompletada,
        eliminarAccion: eliminarAccion,
        eliminarEvidencia: eliminarEvidencia,
        solicitarTutoria: solicitarTutoria,
        renderSolicitarTutor: renderSolicitarTutor,
        solicitarTutor: solicitarTutor,
        liberarTutor: liberarTutor,
        mostrarInscripcionCurso: mostrarInscripcionCurso,
        mostrarRegistroEvento: mostrarRegistroEvento,
        mostrarFormularioAccion: mostrarFormularioAccion
    };

})();

window.EgresadoModule = EgresadoModule;
console.log('&#9989; EgresadoModule cargado correctamente.');