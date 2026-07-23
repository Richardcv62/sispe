// ============================================================
// SISPE - egresado.js
// Modulo del Egresado - Version completa sin acentos
// ============================================================

const EgresadoModule = (function() {
    'use strict';

    var egresadoId = 1;

    function navigate(page) {
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
            // Obtener el egresado logueado
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

            // Cargar acciones del plan
            var acciones = await DBModule.query(
                'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ?)',
                [egresadoId]
            );

            // Actualizar estadisticas
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

            // Mostrar acciones en tabla
            var listaAcciones = document.getElementById('lista-acciones');
            if (listaAcciones) {
                if (acciones.length === 0) {
                    listaAcciones.innerHTML = '<p class="text-muted">No tienes acciones asignadas.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Accion</th><th>Tipo</th><th>Estado</th><th>Fecha</th><th>Accion</th></tr></thead><tbody>';
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

            // Cargar tutorias
            var tutorias = await DBModule.query(
                'SELECT * FROM tutorias WHERE egresado_id = ? ORDER BY fecha DESC',
                [egresadoId]
            );

            var historialTutorias = document.getElementById('historial-tutorias');
            if (historialTutorias) {
                if (tutorias.length === 0) {
                    historialTutorias.innerHTML = '<p class="text-muted">No hay tutorias registradas.</p>';
                } else {
                    var html = '';
                    tutorias.forEach(function(t) {
                        html += '<div class="timeline-item"><div class="timeline-dot done"></div><div class="timeline-content">';
                        html += '<div class="title">Tutoria del ' + t.fecha + '</div>';
                        html += '<div class="desc">' + t.resumen + '</div>';
                        if (t.acuerdos) html += '<div class="desc" style="color:#0a1e3c;"><strong>Acuerdos:</strong> ' + t.acuerdos + '</div>';
                        if (t.proxima_tutoria) html += '<div class="date">Proxima: ' + t.proxima_tutoria + '</div>';
                        html += '</div></div>';
                    });
                    historialTutorias.innerHTML = html;
                }
            }

            // Cargar evaluaciones
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

            // Cargar evidencias
            var evidencias = await DBModule.query(
                'SELECT * FROM evidencias WHERE egresado_id = ? ORDER BY created_at DESC',
                [egresadoId]
            );

            var listaEvidencias = document.getElementById('lista-evidencias');
            if (listaEvidencias) {
                if (evidencias.length === 0) {
                    listaEvidencias.innerHTML = '<p class="text-muted">No has subido ninguna evidencia.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Titulo</th><th>Tipo</th><th>Fecha</th><th>Accion</th></tr></thead><tbody>';
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

            // Cargar evaluaciones en historial
            var historialEvaluaciones = document.getElementById('historial-evaluaciones');
            if (historialEvaluaciones) {
                if (evaluaciones.length === 0) {
                    historialEvaluaciones.innerHTML = '<p class="text-muted">No hay evaluaciones registradas.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Dimension</th><th>Puntaje</th><th>Comentario</th><th>Fecha</th></tr></thead><tbody>';
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
                    <div class="stat-icon">📋</div>
                    <div class="number" id="total-acciones">0</div>
                    <div class="label">Total de Acciones</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">✅</div>
                    <div class="number" id="completadas">0</div>
                    <div class="label">Completadas</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">⏳</div>
                    <div class="number" id="en-progreso">0</div>
                    <div class="label">En Progreso</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #b33a4a;">
                    <div class="stat-icon">⏰</div>
                    <div class="number" id="pendientes">0</div>
                    <div class="label">Pendientes</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-tasks"></i> Mi Plan de Superacion</div>
                <div id="lista-acciones">
                    <p class="text-muted">Cargando acciones...</p>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-calendar-alt"></i> Proximas Actividades</div>
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
                <div class="card-title"><i class="fas fa-chalkboard-user"></i> Tutorias Recientes</div>
                <div id="historial-tutorias">
                    <p class="text-muted">Cargando tutorias...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // PLAN DE SUPERACION (CON FORMULARIO)
    // ============================================================
    function renderPlan() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-clipboard-list"></i> Mi Plan de Superacion</h2>
                <div class="breadcrumb">Plan personalizado</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Acciones Programadas</div>
                <div id="lista-acciones">
                    <p class="text-muted">Cargando acciones...</p>
                </div>
            </div>

            <div class="card" style="border:2px solid #2a6b9c;">
                <div class="card-title"><i class="fas fa-plus-circle"></i> Agregar Accion (Solicitar)</div>
                <form id="form-agregar-accion">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Titulo de la accion <span class="required">*</span></label>
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
                                <option value="tutoria">Tutoria</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha limite</label>
                            <input type="date" id="accion-fecha">
                        </div>
                        <div class="form-group">
                            <label>Icono (emoji)</label>
                            <input type="text" id="accion-icono" placeholder="📚" maxlength="2" style="width:60px;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Descripcion</label>
                        <textarea rows="2" id="accion-descripcion" placeholder="Breve descripcion de la accion..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> Agregar accion</button>
                    <span style="font-size:12px;color:#94a3b8;margin-left:12px;">* El tutor debe aprobarla</span>
                </form>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-link"></i> Recursos Disponibles</div>
                    <div id="recursos-lista">
                        <div style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                            <i class="fas fa-file-pdf" style="color:#b33a4a;"></i>
                            <a href="#" style="color:#0a1e3c;text-decoration:none;">Guia de Manejo de Plagas</a>
                        </div>
                        <div style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                            <i class="fas fa-video" style="color:#2a6b9c;"></i>
                            <a href="#" style="color:#0a1e3c;text-decoration:none;">Video: Tecnicas de Liderazgo</a>
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
    // TUTORIAS (CON FORMULARIO)
    // ============================================================
    function renderTutorias() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-chalkboard-user"></i> Mis Tutorias</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Tutor: <span id="nombre-tutor">Dra. Maria Gomez</span></div>
            </div>

            <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-history"></i> Historial de Tutorias</div>
                    <div id="historial-tutorias">
                        <p class="text-muted">Cargando historial...</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-pen"></i> Solicitar Tutoria</div>
                    <form id="form-solicitar-tutoria">
                        <div class="form-group">
                            <label>Motivo de la tutoria <span class="required">*</span></label>
                            <textarea rows="4" id="tutoria-motivo" placeholder="Describe lo que deseas tratar con tu tutor..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Fecha preferida</label>
                            <input type="date" id="tutoria-fecha-pref">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block"><i class="fas fa-paper-plane"></i> Enviar solicitud</button>
                    </form>
                    <div style="margin-top:16px;padding:12px;background:#f1f4f8;border-radius:10px;">
                        <p style="font-size:13px;color:#64748b;"><i class="fas fa-info-circle"></i> El tutor recibira tu solicitud y te contactara.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // EVIDENCIAS (CON FORMULARIO)
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
                            <label>Titulo <span class="required">*</span></label>
                            <input type="text" id="evidencia-titulo" placeholder="Ej: Certificado de Manejo de Plagas" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo <span class="required">*</span></label>
                            <select id="evidencia-tipo" required>
                                <option value="">Selecciona...</option>
                                <option value="certificado">Certificado</option>
                                <option value="informe">Informe</option>
                                <option value="proyecto">Proyecto</option>
                                <option value="evaluacion">Evaluacion</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Descripcion</label>
                        <textarea rows="2" id="evidencia-descripcion" placeholder="Breve descripcion de la evidencia..."></textarea>
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
    // EVALUACIONES (CON FORMULARIO DE AUTOEVALUACION)
    // ============================================================
    function renderEvaluaciones() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Mis Evaluaciones</h2>
                <div class="breadcrumb">Evaluacion de competencias</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Historial de Evaluaciones</div>
                <div id="historial-evaluaciones">
                    <p class="text-muted">Cargando evaluaciones...</p>
                </div>
            </div>

            <div class="card" style="border:2px solid #2a6b9c;">
                <div class="card-title"><i class="fas fa-edit"></i> Autoevaluacion</div>
                <form id="form-autoevaluacion">
                    <fieldset>
                        <legend>Integracion Institucional</legend>
                        <div class="form-group">
                            <label>¿Como valoras la coordinacion entre la UIJ y tu entidad?</label>
                            <select id="autoeval-integracion" required>
                                <option value="">Selecciona...</option>
                                <option value="5">5 - Excelente</option>
                                <option value="4">4 - Bueno</option>
                                <option value="3">3 - Regular</option>
                                <option value="2">2 - Deficiente</option>
                                <option value="1">1 - Muy deficiente</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Desarrollo de Competencias</legend>
                        <div class="form-group">
                            <label>¿Como valoras tu nivel de actualizacion en conocimientos tecnicos?</label>
                            <select id="autoeval-competencias" required>
                                <option value="">Selecciona...</option>
                                <option value="5">5 - Excelente</option>
                                <option value="4">4 - Bueno</option>
                                <option value="3">3 - Regular</option>
                                <option value="2">2 - Deficiente</option>
                                <option value="1">1 - Muy deficiente</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Impacto en el Desempeno</legend>
                        <div class="form-group">
                            <label>¿Aplicas efectivamente lo aprendido en tu trabajo diario?</label>
                            <select id="autoeval-impacto" required>
                                <option value="">Selecciona...</option>
                                <option value="5">5 - Si, completamente</option>
                                <option value="4">4 - Si, en gran medida</option>
                                <option value="3">3 - Parcialmente</option>
                                <option value="2">2 - Muy poco</option>
                                <option value="1">1 - No puedo aplicarlo</option>
                            </select>
                        </div>
                    </fieldset>

                    <div class="form-group">
                        <label>Comentarios adicionales</label>
                        <textarea rows="3" id="autoeval-comentario" placeholder="Reflexiona sobre tu desarrollo profesional..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar autoevaluacion</button>
                </form>
            </div>
        `;
    }

    // ============================================================
    // ACCIONES (GUARDAR EN BD)
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

            await DBModule.execute(
                'INSERT INTO acciones_plan (plan_id, titulo, descripcion, tipo, estado, fecha_limite, icono) VALUES (?, ?, ?, ?, "pendiente", ?, ?)',
                [planId, data.titulo, data.descripcion, data.tipo, data.fecha, data.icono]
            );

            return true;
        } catch (error) {
            console.error('Error al guardar accion:', error);
            return false;
        }
    }

    async function marcarCompletada(accionId) {
        try {
            await DBModule.execute(
                'UPDATE acciones_plan SET estado = "completado", fecha_completado = date("now") WHERE id = ?',
                [accionId]
            );
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Accion marcada como completada.', 'success');
            }
            loadData();
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al marcar accion.', 'error');
            }
        }
    }

    async function eliminarEvidencia(evidenciaId) {
        if (!confirm('¿Eliminar esta evidencia?')) return;
        try {
            await DBModule.execute('DELETE FROM evidencias WHERE id = ?', [evidenciaId]);
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Evidencia eliminada.', 'success');
            }
            loadData();
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al eliminar.', 'error');
            }
        }
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        // Formulario: Agregar accion
        var formAccion = document.getElementById('form-agregar-accion');
        if (formAccion) {
            formAccion.addEventListener('submit', async function(e) {
                e.preventDefault();
                var titulo = document.getElementById('accion-titulo').value.trim();
                if (!titulo) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning('El titulo es obligatorio.');
                    }
                    return;
                }

                var data = {
                    titulo: titulo,
                    descripcion: document.getElementById('accion-descripcion').value.trim(),
                    tipo: document.getElementById('accion-tipo').value,
                    fecha: document.getElementById('accion-fecha').value,
                    icono: document.getElementById('accion-icono').value || '📌'
                };

                var success = await guardarAccion(data);
                if (success) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Accion solicitada. Espera aprobacion del tutor.', 'success');
                    }
                    formAccion.reset();
                    loadData();
                } else {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Error al guardar la accion.', 'error');
                    }
                }
            });
        }

        // Formulario: Solicitar tutoria
        var formTutoria = document.getElementById('form-solicitar-tutoria');
        if (formTutoria) {
            formTutoria.addEventListener('submit', async function(e) {
                e.preventDefault();
                var motivo = document.getElementById('tutoria-motivo').value.trim();
                if (!motivo) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning('El motivo es obligatorio.');
                    }
                    return;
                }

                try {
                    await DBModule.execute(
                        'INSERT INTO tutorias (egresado_id, tutor_id, fecha, resumen) VALUES (?, 1, date("now"), ?)',
                        [egresadoId, motivo]
                    );
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Solicitud de tutoria enviada correctamente.', 'success');
                    }
                    formTutoria.reset();
                    loadData();
                } catch (error) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Error al enviar solicitud.', 'error');
                    }
                }
            });
        }

        // Formulario: Subir evidencia
        var formEvidencia = document.getElementById('form-subir-evidencia');
        if (formEvidencia) {
            formEvidencia.addEventListener('submit', async function(e) {
                e.preventDefault();
                var titulo = document.getElementById('evidencia-titulo').value.trim();
                var tipo = document.getElementById('evidencia-tipo').value;
                if (!titulo || !tipo) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning('Completa los campos requeridos.');
                    }
                    return;
                }

                try {
                    await DBModule.execute(
                        'INSERT INTO evidencias (egresado_id, tipo, titulo, descripcion, fecha_subida) VALUES (?, ?, ?, ?, date("now"))',
                        [egresadoId, tipo, titulo, document.getElementById('evidencia-descripcion').value.trim()]
                    );
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Evidencia subida correctamente.', 'success');
                    }
                    formEvidencia.reset();
                    loadData();
                } catch (error) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Error al subir evidencia.', 'error');
                    }
                }
            });
        }

        // Formulario: Autoevaluacion
        var formAutoeval = document.getElementById('form-autoevaluacion');
        if (formAutoeval) {
            formAutoeval.addEventListener('submit', async function(e) {
                e.preventDefault();
                var integracion = parseInt(document.getElementById('autoeval-integracion').value);
                var competencias = parseInt(document.getElementById('autoeval-competencias').value);
                var impacto = parseInt(document.getElementById('autoeval-impacto').value);

                if (!integracion || !competencias || !impacto) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning('Completa todas las preguntas.');
                    }
                    return;
                }

                var promedio = Math.round((integracion + competencias + impacto) / 3);
                var comentario = document.getElementById('autoeval-comentario').value.trim();

                try {
                    await DBModule.execute(
                        'INSERT INTO evaluaciones (egresado_id, tipo, dimension, puntaje, comentario, fecha) VALUES (?, "autoevaluacion", "Autoevaluacion Integral", ?, ?, date("now"))',
                        [egresadoId, promedio, comentario || 'Autoevaluacion completada.']
                    );
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Autoevaluacion guardada. Puntaje: ' + promedio + '/5', 'success');
                    }
                    formAutoeval.reset();
                    loadData();
                } catch (error) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Error al guardar autoevaluacion.', 'error');
                    }
                }
            });
        }
    }

    // ---- Exponer funciones globales ----
    window.EgresadoModule = window.EgresadoModule || {};
    window.EgresadoModule.marcarCompletada = marcarCompletada;
    window.EgresadoModule.eliminarEvidencia = eliminarEvidencia;

    // ---- API PUBLICA ----
    return {
        navigate: navigate,
        marcarCompletada: marcarCompletada,
        eliminarEvidencia: eliminarEvidencia
    };

})();

window.EgresadoModule = EgresadoModule;
console.log('EgresadoModule cargado correctamente.');
