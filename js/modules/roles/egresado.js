// ============================================================
// SISPE - egresado.js
// Modulo del Egresado - CON PERSISTENCIA AUTOMÁTICA
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
                content = renderPlan();
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

            var acciones = await DBModule.query(
                'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ?)',
                [egresadoId]
            );

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

            var listaAcciones = document.getElementById('lista-acciones');
            if (listaAcciones) {
                if (acciones.length === 0) {
                    listaAcciones.innerHTML = '<p class="text-muted">No tienes acciones asignadas.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Acción</th><th>Tipo</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>';
                    acciones.forEach(function(a) {
                        var estadoClass = a.estado === 'completado' ? 'success' : a.estado === 'en_progreso' ? 'warning' : 'danger';
                        var estadoText = a.estado === 'completado' ? 'Completado' : a.estado === 'en_progreso' ? 'En progreso' : 'Pendiente';
                        html += '<tr><td><strong>' + (a.icono || '') + ' ' + a.titulo + '</strong></td>';
                        html += '<td><span class="badge badge-info">' + (a.tipo || 'general') + '</span></td>';
                        html += '<td><span class="badge badge-' + estadoClass + '">' + estadoText + '</span></td>';
                        html += '<td>' + (a.fecha_limite || 'Sin fecha') + '</td>';
                        html += '<td>';
                        if (a.estado === 'completado') {
                            html += '<span class="badge badge-success">Hecho</span>';
                        } else {
                            html += '<button class="btn btn-sm btn-primary" onclick="EgresadoModule.marcarCompletada(' + a.id + ')">Marcar</button>';
                        }
                        html += '</td></tr>';
                    });
                    html += '</tbody></table></div>';
                    listaAcciones.innerHTML = html;
                }
            }

            var tutorias = await DBModule.query(
                'SELECT * FROM tutorias WHERE egresado_id = ? ORDER BY fecha DESC',
                [egresadoId]
            );

            var historialTutorias = document.getElementById('historial-tutorias');
            if (historialTutorias) {
                if (tutorias.length === 0) {
                    historialTutorias.innerHTML = '<p class="text-muted">No hay tutorías registradas.</p>';
                } else {
                    var html = '';
                    tutorias.forEach(function(t) {
                        html += '<div class="timeline-item"><div class="timeline-dot done"></div><div class="timeline-content">';
                        html += '<div class="title">Tutoría del ' + t.fecha + '</div>';
                        html += '<div class="desc">' + t.resumen + '</div>';
                        if (t.acuerdos) html += '<div class="desc" style="color:#0a1e3c;"><strong>Acuerdos:</strong> ' + t.acuerdos + '</div>';
                        if (t.proxima_tutoria) html += '<div class="date">Próxima: ' + t.proxima_tutoria + '</div>';
                        if (t.estado) html += '<div class="date">Estado: ' + t.estado + '</div>';
                        html += '</div></div>';
                    });
                    historialTutorias.innerHTML = html;
                }
            }

            var evaluaciones = await DBModule.query(
                'SELECT * FROM evaluaciones WHERE egresado_id = ? ORDER BY fecha DESC',
                [egresadoId]
            );

            var misEvaluaciones = document.getElementById('mis-evaluaciones');
            if (misEvaluaciones) {
                if (evaluaciones.length === 0) {
                    misEvaluaciones.innerHTML = '<p class="text-muted">No hay evaluaciones registradas.</p>';
                } else {
                    var html = '';
                    evaluaciones.forEach(function(e) {
                        var color = e.puntaje >= 4 ? '#1a8a4a' : e.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
                        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e2e8f0;">';
                        html += '<div><div style="font-weight:600;font-size:14px;">' + e.dimension + '</div>';
                        html += '<div style="font-size:13px;color:#64748b;">' + (e.comentario || 'Sin comentarios') + '</div></div>';
                        html += '<div style="font-weight:700;font-size:18px;color:' + color + ';">' + e.puntaje + '/5</div>';
                        html += '</div>';
                    });
                    misEvaluaciones.innerHTML = html;
                }
            }

            var evidencias = await DBModule.query(
                'SELECT * FROM evidencias WHERE egresado_id = ? ORDER BY created_at DESC',
                [egresadoId]
            );

            var listaEvidencias = document.getElementById('lista-evidencias');
            if (listaEvidencias) {
                if (evidencias.length === 0) {
                    listaEvidencias.innerHTML = '<p class="text-muted">No has subido ninguna evidencia.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Título</th><th>Tipo</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>';
                    evidencias.forEach(function(e) {
                        html += '<tr><td><strong>' + e.titulo + '</strong></td>';
                        html += '<td><span class="badge badge-info">' + e.tipo + '</span></td>';
                        html += '<td>' + (e.fecha_subida || e.created_at || 'Sin fecha') + '</td>';
                        html += '<td><button class="btn btn-sm btn-danger" onclick="EgresadoModule.eliminarEvidencia(' + e.id + ')">Eliminar</button></td></tr>';
                    });
                    html += '</tbody></table></div>';
                    listaEvidencias.innerHTML = html;
                }
            }

            var historialEvaluaciones = document.getElementById('historial-evaluaciones');
            if (historialEvaluaciones) {
                if (evaluaciones.length === 0) {
                    historialEvaluaciones.innerHTML = '<p class="text-muted">No hay evaluaciones registradas.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Dimensión</th><th>Puntaje</th><th>Comentario</th><th>Fecha</th></tr></thead><tbody>';
                    evaluaciones.forEach(function(e) {
                        var color = e.puntaje >= 4 ? '#1a8a4a' : e.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
                        html += '<tr><td><strong>' + e.dimension + '</strong></td>';
                        html += '<td><span style="color:' + color + ';font-weight:700;">' + e.puntaje + '/5</span></td>';
                        html += '<td>' + (e.comentario || 'Sin comentarios') + '</td>';
                        html += '<td>' + (e.fecha || e.created_at || 'Sin fecha') + '</td></tr>';
                    });
                    html += '</tbody></table></div>';
                    historialEvaluaciones.innerHTML = html;
                }
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
                <h2><i class="fas fa-chart-pie"></i> Mi Dashboard</h2>
                <div class="breadcrumb">Bienvenido, <span>Egresado</span></div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">??</div>
                    <div class="number" id="total-acciones">0</div>
                    <div class="label">Total de Acciones</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">?</div>
                    <div class="number" id="completadas">0</div>
                    <div class="label">Completadas</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">??</div>
                    <div class="number" id="en-progreso">0</div>
                    <div class="label">En Progreso</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #b33a4a;">
                    <div class="stat-icon">?</div>
                    <div class="number" id="pendientes">0</div>
                    <div class="label">Pendientes</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-tasks"></i> Mi Plan de Superación</div>
                <div id="lista-acciones">
                    <p class="text-muted">Cargando acciones...</p>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-calendar-alt"></i> Próximas Actividades</div>
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
                <div class="card-title"><i class="fas fa-chalkboard-user"></i> Tutorías Recientes</div>
                <div id="historial-tutorias">
                    <p class="text-muted">Cargando tutorías...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // PLAN DE SUPERACION
    // ============================================================
    function renderPlan() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-clipboard-list"></i> Mi Plan de Superación</h2>
                <div class="breadcrumb">Plan personalizado</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Acciones Programadas</div>
                <div id="lista-acciones">
                    <p class="text-muted">Cargando acciones...</p>
                </div>
            </div>

            <div class="card" style="border:2px solid #2a6b9c;">
                <div class="card-title"><i class="fas fa-plus-circle"></i> Agregar Acción (Solicitar)</div>
                <form id="form-agregar-accion">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Título de la acción <span class="required">*</span></label>
                            <input type="text" id="accion-titulo" placeholder="Ej: Curso de Liderazgo" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <select id="accion-tipo">
                                <option value="curso">Curso</option>
                                <option value="taller">Taller</option>
                                <option value="entrenamiento">Entrenamiento</option>
                                <option value="seminario">Seminario</option>
                                <option value="proyecto">Proyecto</option>
                                <option value="tutoria">Tutoría</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha límite</label>
                            <input type="date" id="accion-fecha">
                        </div>
                        <div class="form-group">
                            <label>Icono (emoji)</label>
                            <input type="text" id="accion-icono" placeholder="??" maxlength="2" style="width:60px;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea rows="2" id="accion-descripcion" placeholder="Breve descripción de la acción..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> Agregar acción</button>
                    <span style="font-size:12px;color:#94a3b8;margin-left:12px;">* El tutor debe aprobarla</span>
                </form>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-link"></i> Recursos Disponibles</div>
                    <div id="recursos-lista">
                        <div style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                            <i class="fas fa-file-pdf" style="color:#b33a4a;"></i>
                            <a href="#" style="color:#0a1e3c;text-decoration:none;">Guía de Manejo de Plagas</a>
                        </div>
                        <div style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                            <i class="fas fa-video" style="color:#2a6b9c;"></i>
                            <a href="#" style="color:#0a1e3c;text-decoration:none;">Video: Técnicas de Liderazgo</a>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-lightbulb"></i> Recomendaciones</div>
                    <div id="recomendaciones">
                        <div style="background:#f1f4f8;padding:16px;border-radius:10px;">
                            <p style="font-weight:600;color:#0a1e3c;">Basado en tu progreso:</p>
                            <ul style="list-style:none;padding:0;margin-top:8px;" id="recomendaciones-lista">
                                <li style="padding:4px 0;color:#475569;"><i class="fas fa-clock" style="color:#d48a2a;"></i> Completa las acciones pendientes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // TUTORIAS
    // ============================================================
    function renderTutorias() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-chalkboard-user"></i> Mis Tutorías</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Tutor: <span id="nombre-tutor">Cargando...</span></div>
            </div>

            <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-history"></i> Historial de Tutorías</div>
                    <div id="historial-tutorias">
                        <p class="text-muted">Cargando historial...</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-pen"></i> Solicitar Tutoría</div>
                    <form id="form-solicitar-tutoria">
                        <div class="form-group">
                            <label>Motivo de la tutoría <span class="required">*</span></label>
                            <textarea rows="4" id="tutoria-motivo" placeholder="Describe lo que deseas tratar con tu tutor..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Fecha preferida</label>
                            <input type="date" id="tutoria-fecha-pref">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block"><i class="fas fa-paper-plane"></i> Enviar solicitud</button>
                    </form>
                    <div style="margin-top:16px;padding:12px;background:#f1f4f8;border-radius:10px;">
                        <p style="font-size:13px;color:#64748b;"><i class="fas fa-info-circle"></i> El tutor recibirá tu solicitud por correo y te contactará.</p>
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
                            <label>Título <span class="required">*</span></label>
                            <input type="text" id="evidencia-titulo" placeholder="Ej: Certificado de Manejo de Plagas" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo <span class="required">*</span></label>
                            <select id="evidencia-tipo" required>
                                <option value="">Selecciona...</option>
                                <option value="certificado">Certificado</option>
                                <option value="informe">Informe</option>
                                <option value="proyecto">Proyecto</option>
                                <option value="evaluacion">Evaluación</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea rows="2" id="evidencia-descripcion" placeholder="Breve descripción de la evidencia..."></textarea>
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
                <div class="card-title"><i class="fas fa-edit"></i> Autoevaluación</div>
                <form id="form-autoevaluacion">
                    <div class="form-group">
                        <label>1. Integración Institucional <span class="required">*</span></label>
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
                        <label>3. Impacto en el Desempeño <span class="required">*</span></label>
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
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar autoevaluación</button>
                </form>
            </div>
        `;
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
                        <div class="breadcrumb">Encuentra un tutor para tu superación</div>
                    </div>
                    <div class="card">
                        <p class="text-muted">No se encontró tu perfil de egresado.</p>
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
                <div class="breadcrumb">Encuentra un tutor para tu superación</div>
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
                                    <th>Acción</th>
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
    // ?? SOLICITAR TUTOR - CON PERSISTENCIA AUTOMÁTICA
    // ============================================================
    async function solicitarTutor(tutorId) {
        const confirmado = await ModalModule.confirm('¿Deseas solicitar a este tutor como tu tutor principal?', 'Solicitar Tutor');
        if (!confirmado) return;
        
        try {
            var user = AuthModule.getCurrentUser();
            var egresado = await DBModule.query(
                'SELECT id FROM egresados WHERE usuario_id = ?',
                [user.id]
            );
            if (egresado.length === 0) {
                await ModalModule.error('No se encontró tu perfil.');
                return;
            }

            // ?? execute() guarda automáticamente en localStorage
            await DBModule.execute(
                'UPDATE egresados SET tutor_id = ? WHERE id = ?',
                [tutorId, egresado[0].id]
            );
            console.log('? Tutor asignado y guardado');

            await window.NotificationsModule.createNotification(
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
    // ?? LIBERAR TUTOR - CON PERSISTENCIA AUTOMÁTICA
    // ============================================================
    async function liberarTutor() {
        const confirmado = await ModalModule.confirm('¿Estás seguro de que quieres liberar a tu tutor actual?', 'Liberar Tutor');
        if (!confirmado) return;
        
        try {
            var user = AuthModule.getCurrentUser();
            var egresado = await DBModule.query(
                'SELECT id FROM egresados WHERE usuario_id = ?',
                [user.id]
            );
            if (egresado.length === 0) {
                await ModalModule.error('No se encontró tu perfil.');
                return;
            }

            // ?? execute() guarda automáticamente en localStorage
            await DBModule.execute(
                'UPDATE egresados SET tutor_id = NULL WHERE id = ?',
                [egresado[0].id]
            );
            console.log('? Tutor liberado y guardado');

            await ModalModule.success('Tutor liberado correctamente.');
            renderSolicitarTutor();
        } catch (error) {
            await ModalModule.error('Error al liberar tutor.');
        }
    }

    // ============================================================
    // ?? SOLICITAR TUTORIA - CON PERSISTENCIA AUTOMÁTICA
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

            // ?? execute() guarda automáticamente en localStorage
            await DBModule.execute(
                'INSERT INTO tutorias (egresado_id, tutor_id, fecha, resumen, estado) VALUES (?, ?, date("now"), ?, "solicitada")',
                [egresadoId, egresadoData.tutor_id, motivo + (fechaPref ? ' (Fecha preferida: ' + fechaPref + ')' : '')]
            );
            console.log('? Solicitud de tutoría guardada');

            if (window.NotificationsModule && tutorEmail) {
                var asunto = 'Nueva solicitud de tutoría de ' + egresadoData.egresado_nombre;
                var mensaje = 'El egresado ' + egresadoData.egresado_nombre + ' ha solicitado una tutoría.\n\n' +
                              'Motivo: ' + motivo + '\n' +
                              (fechaPref ? 'Fecha preferida: ' + fechaPref + '\n' : '') +
                              '\nPara responder directamente a ' + egresadoData.egresado_nombre + ', usa el botón "Responder" de tu correo.\n\n' +
                              'Enlace: ' + window.location.origin + '/sispe/#tutorados';

                await window.NotificationsModule.sendEmail(
                    tutorEmail,
                    tutor.tutor_nombre || 'Tutor',
                    asunto,
                    mensaje,
                    window.location.origin + '/sispe/#tutorados',
                    egresadoData.egresado_email
                );

                await ModalModule.success('Solicitud enviada. El tutor recibirá un correo.');
            } else {
                await ModalModule.success('Solicitud enviada. El tutor la revisará pronto.');
            }

            await window.NotificationsModule.createNotification(
                egresadoData.usuario_id,
                'tutoria',
                'Has solicitado una tutoría a ' + tutor.tutor_nombre + '. Espera su respuesta.',
                '#tutorias'
            );

            document.getElementById('tutoria-motivo').value = '';
            document.getElementById('tutoria-fecha-pref').value = '';
            loadData();

        } catch (error) {
            console.error('Error al solicitar tutoría:', error);
            await ModalModule.error('Error al enviar la solicitud: ' + error.message);
        }
    }

    // ============================================================
    // ACCIONES
    // ============================================================
    async function guardarAccion(data) {
        try {
            var plan = await DBModule.query(
                'SELECT id FROM planes_superacion WHERE egresado_id = ? AND estado = "activo"',
                [egresadoId]
            );

            var planId;
            if (plan.length === 0) {
                var result = await DBModule.execute(
                    'INSERT INTO planes_superacion (egresado_id, tutor_id, anio_plan, estado) VALUES (?, 1, strftime("%Y", "now"), "activo")',
                    [egresadoId]
                );
                planId = result.lastID;
            } else {
                planId = plan[0].id;
            }

            // ?? execute() guarda automáticamente en localStorage
            await DBModule.execute(
                'INSERT INTO acciones_plan (plan_id, titulo, descripcion, tipo, estado, fecha_limite, icono) VALUES (?, ?, ?, ?, "pendiente", ?, ?)',
                [planId, data.titulo, data.descripcion, data.tipo, data.fecha, data.icono]
            );
            console.log('? Acción guardada');

            return true;
        } catch (error) {
            console.error('Error al guardar acción:', error);
            return false;
        }
    }

    // ============================================================
    // MARCAR COMPLETADA - CON PERSISTENCIA AUTOMÁTICA
    // ============================================================
    async function marcarCompletada(accionId) {
        try {
            // ?? execute() guarda automáticamente en localStorage
            await DBModule.execute(
                'UPDATE acciones_plan SET estado = "completado", fecha_completado = date("now") WHERE id = ?',
                [accionId]
            );
            console.log('? Acción marcada como completada y guardada');
            await ModalModule.success('Acción marcada como completada.');
            loadData();
        } catch (error) {
            await ModalModule.error('Error al marcar acción.');
        }
    }

    // ============================================================
    // ELIMINAR EVIDENCIA - CON PERSISTENCIA AUTOMÁTICA
    // ============================================================
    async function eliminarEvidencia(evidenciaId) {
        const confirmado = await ModalModule.confirmDelete('¿Eliminar esta evidencia?', 'Eliminar Evidencia');
        if (!confirmado) return;
        
        try {
            // ?? execute() guarda automáticamente en localStorage
            await DBModule.execute('DELETE FROM evidencias WHERE id = ?', [evidenciaId]);
            console.log('? Evidencia eliminada y guardada');
            await ModalModule.success('Evidencia eliminada.');
            loadData();
        } catch (error) {
            await ModalModule.error('Error al eliminar.');
        }
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        var formAccion = document.getElementById('form-agregar-accion');
        if (formAccion) {
            formAccion.addEventListener('submit', async function(e) {
                e.preventDefault();
                var titulo = document.getElementById('accion-titulo').value.trim();
                if (!titulo) {
                    await ModalModule.warning('El título es obligatorio.');
                    return;
                }

                var data = {
                    titulo: titulo,
                    descripcion: document.getElementById('accion-descripcion').value.trim(),
                    tipo: document.getElementById('accion-tipo').value,
                    fecha: document.getElementById('accion-fecha').value,
                    icono: document.getElementById('accion-icono').value || '??'
                };

                var success = await guardarAccion(data);
                if (success) {
                    await ModalModule.success('Acción solicitada. Espera aprobación del tutor.');
                    formAccion.reset();
                    loadData();
                } else {
                    await ModalModule.error('Error al guardar la acción.');
                }
            });
        }

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
                    // ?? execute() guarda automáticamente en localStorage
                    await DBModule.execute(
                        'INSERT INTO evidencias (egresado_id, tipo, titulo, descripcion, fecha_subida) VALUES (?, ?, ?, ?, date("now"))',
                        [egresadoId, tipo, titulo, document.getElementById('evidencia-descripcion').value.trim()]
                    );
                    console.log('? Evidencia subida y guardada');
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
                    // ?? execute() guarda automáticamente en localStorage
                    await DBModule.execute(
                        'INSERT INTO evaluaciones (egresado_id, tipo, dimension, puntaje, comentario, fecha) VALUES (?, "autoevaluacion", "Autoevaluación Integral", ?, ?, date("now"))',
                        [egresadoId, promedio, comentario || 'Autoevaluación completada.']
                    );
                    console.log('? Autoevaluación guardada');
                    await ModalModule.success('Autoevaluación guardada. Puntaje: ' + promedio + '/5');
                    formAutoeval.reset();
                    loadData();
                } catch (error) {
                    await ModalModule.error('Error al guardar autoevaluación.');
                }
            });
        }

        cargarNombreTutor();
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
    window.EgresadoModule.eliminarEvidencia = eliminarEvidencia;
    window.EgresadoModule.solicitarTutoria = solicitarTutoria;

    return {
        navigate: navigate,
        marcarCompletada: marcarCompletada,
        eliminarEvidencia: eliminarEvidencia,
        solicitarTutoria: solicitarTutoria,
        renderSolicitarTutor: renderSolicitarTutor,
        solicitarTutor: solicitarTutor,
        liberarTutor: liberarTutor
    };

})();

window.EgresadoModule = EgresadoModule;
console.log('? EgresadoModule con modales y persistencia cargado correctamente.');