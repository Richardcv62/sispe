// ============================================================
// SISPE - tutor.js
// Modulo del Tutor - CON EMOJIS DE MENU CORREGIDOS
// RUTA: js/modules/roles/tutor.js
// ============================================================

const TutorModule = (function() {
    'use strict';

    var tutorId = 1;

    function navigate(page, breadcrumb) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = '';

        switch(page) {
            case 'dashboard':
                content = renderDashboard();
                break;
            case 'tutorados':
                content = renderTutorados();
                break;
            case 'registrar-tutoria':
                content = renderRegistrarTutoria();
                break;
            case 'evaluar':
                content = renderEvaluar();
                break;
            case 'asignar-egresados':
                content = renderAsignarEgresados();
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
                var tutorResult = await DBModule.query(
                    'SELECT id FROM tutores WHERE usuario_id = ?',
                    [user.id]
                );
                if (tutorResult.length > 0) {
                    tutorId = tutorResult[0].id;
                }
            }

            var egresados = await DBModule.query(
                'SELECT e.*, u.nombre as nombre_usuario, c.nombre as carrera_nombre, ent.nombre as entidad_nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id JOIN carreras c ON e.carrera_id = c.id JOIN entidades ent ON e.entidad_id = ent.id WHERE e.tutor_id = ?',
                [tutorId]
            );

            var totalEgresados = egresados.length;
            var totalEl = document.getElementById('total-tutorados');
            if (totalEl) totalEl.textContent = totalEgresados;

            var totalNum = document.getElementById('total-tutorados-num');
            if (totalNum) totalNum.textContent = totalEgresados;

            var alto = 0, desarrollo = 0, sinAvance = 0;
            for (var i = 0; i < egresados.length; i++) {
                var eg = egresados[i];
                var acciones = await DBModule.query(
                    'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ?)',
                    [eg.id]
                );
                var total = acciones.length;
                var completadas = acciones.filter(function(a) { return a.estado === 'completado'; }).length;
                var pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
                
                if (pct >= 80) alto++;
                else if (pct > 0) desarrollo++;
                else sinAvance++;
            }

            var altoEl = document.getElementById('alto-progreso');
            if (altoEl) altoEl.textContent = alto;
            var desEl = document.getElementById('en-desarrollo');
            if (desEl) desEl.textContent = desarrollo;
            var sinEl = document.getElementById('sin-avance');
            if (sinEl) sinEl.textContent = sinAvance;

            var listaTutorados = document.getElementById('lista-tutorados');
            if (listaTutorados) {
                if (egresados.length === 0) {
                    listaTutorados.innerHTML = '<p class="text-muted">No tienes egresados asignados.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Entidad</th><th>Progreso</th><th>Acción</th></tr></thead><tbody>';
                    for (var i = 0; i < egresados.length; i++) {
                        var eg = egresados[i];
                        var acciones = await DBModule.query(
                            'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ?)',
                            [eg.id]
                        );
                        var total = acciones.length;
                        var completadas = acciones.filter(function(a) { return a.estado === 'completado'; }).length;
                        var pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
                        var color = pct >= 80 ? 'green' : pct >= 50 ? 'gold' : 'danger';
                        
                        html += '<tr><td><strong>' + (eg.avatar || '') + ' ' + eg.nombre_usuario + '</strong></td>';
                        html += '<td>' + eg.carrera_nombre + '</td>';
                        html += '<td>' + eg.entidad_nombre + '</td>';
                        html += '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + pct + '%;"></div></div><span class="progress-pct">' + pct + '%</span></div></td>';
                        html += '<td><button class="btn btn-sm btn-primary" onclick="TutorModule.verEgresado(' + eg.id + ')"><i class="fas fa-eye"></i> Ver</button></td></tr>';
                    }
                    html += '</tbody></table></div>';
                    listaTutorados.innerHTML = html;
                }
            }

            var listaCompleta = document.getElementById('lista-completa-tutorados');
            if (listaCompleta) {
                if (egresados.length === 0) {
                    listaCompleta.innerHTML = '<p class="text-muted">No tienes egresados asignados.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Egresado</th><th>Carrera</th><th>Entidad</th><th>Plan</th><th>Progreso</th></tr></thead><tbody>';
                    for (var i = 0; i < egresados.length; i++) {
                        var eg = egresados[i];
                        var acciones = await DBModule.query(
                            'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ?)',
                            [eg.id]
                        );
                        var total = acciones.length;
                        var completadas = acciones.filter(function(a) { return a.estado === 'completado'; }).length;
                        var pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
                        var color = pct >= 80 ? 'green' : pct >= 50 ? 'gold' : 'danger';
                        var planActivo = await DBModule.query(
                            'SELECT id FROM planes_superacion WHERE egresado_id = ? AND estado = "activo"',
                            [eg.id]
                        );
                        
                        html += '<tr><td>' + (i + 1) + '</td>';
                        html += '<td><strong>' + (eg.avatar || '') + ' ' + eg.nombre_usuario + '</strong></td>';
                        html += '<td>' + eg.carrera_nombre + '</td>';
                        html += '<td>' + eg.entidad_nombre + '</td>';
                        html += '<td>' + (planActivo.length > 0 ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-danger">Sin plan</span>') + '</td>';
                        html += '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + pct + '%;"></div></div><span class="progress-pct">' + pct + '%</span></div></td></tr>';
                    }
                    html += '</tbody></table></div>';
                    listaCompleta.innerHTML = html;
                }
            }

            var listaEvaluar = document.getElementById('lista-evaluar');
            if (listaEvaluar) {
                if (egresados.length === 0) {
                    listaEvaluar.innerHTML = '<p class="text-muted">No tienes egresados asignados.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Progreso</th><th>Acciones</th></tr></thead><tbody>';
                    for (var i = 0; i < egresados.length; i++) {
                        var eg = egresados[i];
                        var acciones = await DBModule.query(
                            'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ?)',
                            [eg.id]
                        );
                        var total = acciones.length;
                        var completadas = acciones.filter(function(a) { return a.estado === 'completado'; }).length;
                        var pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
                        var color = pct >= 80 ? 'green' : pct >= 50 ? 'gold' : 'danger';
                        
                        var tieneEvaluacion = await DBModule.query(
                            'SELECT COUNT(*) as total FROM evaluaciones WHERE egresado_id = ?',
                            [eg.id]
                        );
                        var tieneEval = (tieneEvaluacion[0]?.total || 0) > 0;
                        
                        html += '<tr><td><strong>' + (eg.avatar || '') + ' ' + eg.nombre_usuario + '</strong></td>';
                        html += '<td>' + eg.carrera_nombre + '</td>';
                        html += '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + pct + '%;"></div></div><span class="progress-pct">' + pct + '%</span></div></td>';
                        html += '<td>';
                        html += '<button class="btn btn-sm btn-primary btn-evaluar" data-id="' + eg.id + '" data-nombre="' + eg.nombre_usuario + '"><i class="fas fa-edit"></i> Evaluar</button> ';
                        if (tieneEval) {
                            html += '<button class="btn btn-sm btn-info" onclick="TutorModule.verEvaluaciones(' + eg.id + ', \'' + eg.nombre_usuario + '\')"><i class="fas fa-eye"></i> Ver</button>';
                        }
                        html += '</td></tr>';
                    }
                    html += '</tbody></table></div>';
                    listaEvaluar.innerHTML = html;
                    
                    document.querySelectorAll('.btn-evaluar').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var id = this.dataset.id;
                            var nombre = this.dataset.nombre;
                            document.getElementById('eval-egresado-id').value = id;
                            document.getElementById('eval-egresado-nombre').textContent = nombre;
                            document.getElementById('formulario-evaluacion').style.display = 'block';
                            document.getElementById('formulario-evaluacion').scrollIntoView({ behavior: 'smooth' });
                        });
                    });
                }
            }

            var ultimasTutorias = document.getElementById('ultimas-tutorias');
            if (ultimasTutorias) {
                var tutorias = await DBModule.query(
                    'SELECT t.*, u.nombre as egresado_nombre FROM tutorias t JOIN egresados e ON t.egresado_id = e.id JOIN usuarios u ON e.usuario_id = u.id WHERE t.tutor_id = ? ORDER BY t.fecha DESC LIMIT 10',
                    [tutorId]
                );
                if (tutorias.length === 0) {
                    ultimasTutorias.innerHTML = '<p class="text-muted">No hay tutorías registradas recientemente.</p>';
                } else {
                    var html = '';
                    tutorias.forEach(function(t) {
                        html += '<div class="timeline-item tutoria-item" style="cursor:pointer;" onclick="TutorModule.verDetalleTutoria(' + t.id + ')">';
                        html += '<div class="timeline-dot done"></div>';
                        html += '<div class="timeline-content">';
                        html += '<div class="title">' + t.egresado_nombre + ' - ' + t.fecha + '</div>';
                        html += '<div class="desc">' + (t.resumen ? t.resumen.substring(0, 80) + (t.resumen.length > 80 ? '...' : '') : 'Sin resumen') + '</div>';
                        if (t.proxima_tutoria) html += '<div class="date">Próxima: ' + t.proxima_tutoria + '</div>';
                        html += '<div style="font-size:11px;color:#4a9ad9;margin-top:4px;"><i class="fas fa-hand-pointer"></i> Clic para ver detalles</div>';
                        html += '</div></div>';
                    });
                    ultimasTutorias.innerHTML = html;
                }
            }

            var historialEvaluaciones = document.getElementById('historial-evaluaciones-tutor');
            if (historialEvaluaciones) {
                var evaluaciones = await DBModule.query(
                    `SELECT e.*, u.nombre as egresado_nombre 
                     FROM evaluaciones e 
                     JOIN egresados eg ON e.egresado_id = eg.id 
                     JOIN usuarios u ON eg.usuario_id = u.id 
                     WHERE e.tutor_id = ? 
                     ORDER BY e.fecha DESC 
                     LIMIT 20`,
                    [tutorId]
                );
                if (evaluaciones.length === 0) {
                    historialEvaluaciones.innerHTML = '<p class="text-muted">No hay evaluaciones registradas.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Dimensión</th><th>Puntaje</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>';
                    evaluaciones.forEach(function(e) {
                        var color = e.puntaje >= 4 ? '#1a8a4a' : e.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
                        html += '<tr>';
                        html += '<td><strong>' + e.egresado_nombre + '</strong></td>';
                        html += '<td>' + e.dimension + '</td>';
                        html += '<td><span style="color:' + color + ';font-weight:700;">' + e.puntaje + '/5</span></td>';
                        html += '<td>' + (e.fecha || e.created_at || 'Sin fecha') + '</td>';
                        html += '<td><button class="btn btn-sm btn-info" onclick="TutorModule.verDetalleEvaluacion(' + e.id + ')"><i class="fas fa-eye"></i> Ver</button></td>';
                        html += '</tr>';
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
                <h2><i class="fas fa-chart-simple"></i> Dashboard del Tutor</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Tutor</div>
            </div>

            <div class="stats-grid">
                <div class="stat-card" style="border-left:4px solid #0a1e3c;">
                    <div class="stat-icon">👥</div>
                    <div class="number" id="total-tutorados">0</div>
                    <div class="label">Egresados a mi cargo</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">⭐</div>
                    <div class="number" id="alto-progreso">0</div>
                    <div class="label">Progreso alto (80%+)</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">📈</div>
                    <div class="number" id="en-desarrollo">0</div>
                    <div class="label">En desarrollo</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #b33a4a;">
                    <div class="stat-icon">⏳</div>
                    <div class="number" id="sin-avance">0</div>
                    <div class="label">Sin avances</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-users"></i> Mis Egresados</div>
                <div id="lista-tutorados">
                    <p class="text-muted">Cargando tutorados...</p>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">
                <div class="card" style="text-align:center;cursor:pointer;" onclick="TutorModule.navigate('registrar-tutoria')">
                    <div style="font-size:40px;">📝</div>
                    <h4>Registrar Tutoría</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="TutorModule.navigate('evaluar')">
                    <div style="font-size:40px;">⭐</div>
                    <h4>Evaluar Egresado</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="TutorModule.navigate('tutorados')">
                    <div style="font-size:40px;">👥</div>
                    <h4>Ver Todos</h4>
                </div>
            </div>
        `;
    }

    // ============================================================
    // TUTORADOS
    // ============================================================
    function renderTutorados() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-users"></i> Mis Tutorados</h2>
                <div class="breadcrumb"><span id="total-tutorados-num">0</span> egresados asignados</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-user-plus"></i> Asignar Egresado</div>
                <form id="form-asignar-egresado">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Egresado <span class="required">*</span></label>
                            <select id="asignar-egresado" required>
                                <option value="">Selecciona un egresado...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Carrera</label>
                            <input type="text" id="asignar-carrera" placeholder="Carrera del egresado" readonly>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> Asignar egresado</button>
                </form>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Egresados</div>
                <div id="lista-completa-tutorados">
                    <p class="text-muted">Cargando...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // REGISTRAR TUTORIA
    // ============================================================
    function renderRegistrarTutoria() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-pen-to-square"></i> Registrar Tutoría</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Tutor</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-plus-circle"></i> Nueva Tutoría</div>
                <form id="form-registrar-tutoria">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Egresado <span class="required">*</span></label>
                            <select id="tutoria-egresado" required>
                                <option value="">Selecciona un egresado...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fecha <span class="required">*</span></label>
                            <input type="date" id="tutoria-fecha" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Resumen de la tutoría <span class="required">*</span></label>
                        <textarea rows="4" id="tutoria-resumen" placeholder="Describe los temas tratados, acuerdos y próximos pasos..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Acuerdos</label>
                        <textarea rows="2" id="tutoria-acuerdos" placeholder="Acuerdos alcanzados durante la tutoría..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Próxima Tutoría</label>
                        <input type="date" id="tutoria-proxima">
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar tutoría</button>
                </form>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-clock-rotate-left"></i> Últimas Tutorías Registradas <span style="font-size:12px;color:#94a3b8;font-weight:400;">(Clic para ver detalles)</span></div>
                <div id="ultimas-tutorias">
                    <p class="text-muted">No hay tutorías registradas recientemente.</p>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-star"></i> Historial de Evaluaciones</div>
                <div id="historial-evaluaciones-tutor">
                    <p class="text-muted">No hay evaluaciones registradas.</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // EVALUAR
    // ============================================================
    function renderEvaluar() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Evaluar Egresado</h2>
                <div class="breadcrumb">Evaluación de competencias</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Seleccionar egresado</div>
                <div id="lista-evaluar">
                    <p class="text-muted">Cargando egresados...</p>
                </div>
            </div>

            <div id="formulario-evaluacion" style="display:none;">
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas fa-edit"></i> Evaluación de <span id="eval-egresado-nombre">Egresado</span></div>
                    <form id="form-evaluacion">
                        <input type="hidden" id="eval-egresado-id">

                        <fieldset>
                            <legend>Competencias Académicas</legend>
                            <div class="form-group">
                                <label>1. Nivel de actualización y dominio <span class="required">*</span></label>
                                <select id="eval-conocimientos" required>
                                    <option value="">Selecciona...</option>
                                    <option value="5">5 - Excelente</option>
                                    <option value="4">4 - Bueno</option>
                                    <option value="3">3 - Regular</option>
                                    <option value="2">2 - Deficiente</option>
                                    <option value="1">1 - Muy deficiente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>2. Habilidades comunicativas <span class="required">*</span></label>
                                <select id="eval-habilidades" required>
                                    <option value="">Selecciona...</option>
                                    <option value="5">5 - Excelente</option>
                                    <option value="4">4 - Bueno</option>
                                    <option value="3">3 - Regular</option>
                                    <option value="2">2 - Deficiente</option>
                                    <option value="1">1 - Muy deficiente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>3. Valores éticos y compromiso <span class="required">*</span></label>
                                <select id="eval-etica" required>
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
                            <legend>Impacto en el Desempeño</legend>
                            <div class="form-group">
                                <label>4. Aplicación de conocimientos <span class="required">*</span></label>
                                <select id="eval-aplicacion" required>
                                    <option value="">Selecciona...</option>
                                    <option value="5">5 - Excelente</option>
                                    <option value="4">4 - Bueno</option>
                                    <option value="3">3 - Regular</option>
                                    <option value="2">2 - Deficiente</option>
                                    <option value="1">1 - Muy deficiente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>5. Autonomía y participación <span class="required">*</span></label>
                                <select id="eval-autonomia" required>
                                    <option value="">Selecciona...</option>
                                    <option value="5">5 - Excelente</option>
                                    <option value="4">4 - Bueno</option>
                                    <option value="3">3 - Regular</option>
                                    <option value="2">2 - Deficiente</option>
                                    <option value="1">1 - Muy deficiente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>6. Adaptación a nuevos entornos <span class="required">*</span></label>
                                <select id="eval-adaptacion" required>
                                    <option value="">Selecciona...</option>
                                    <option value="5">5 - Excelente</option>
                                    <option value="4">4 - Bueno</option>
                                    <option value="3">3 - Regular</option>
                                    <option value="2">2 - Deficiente</option>
                                    <option value="1">1 - Muy deficiente</option>
                                </select>
                            </div>
                        </fieldset>

                        <div class="form-group">
                            <label>Comentarios y recomendaciones</label>
                            <textarea rows="3" id="eval-comentario" placeholder="Observaciones adicionales..."></textarea>
                        </div>

                        <div style="display:flex;gap:12px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar evaluación</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-evaluacion').style.display='none'">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    // ============================================================
    // ASIGNAR EGRESADOS
    // ============================================================
    function renderAsignarEgresados() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-user-plus"></i> Asignar Egresados</h2>
                <div class="breadcrumb">Asignación de egresados a tutores</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Egresados sin tutor</div>
                <div id="egresados-sin-tutor">
                    <p class="text-muted">Cargando...</p>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-users"></i> Mis Egresados Asignados</div>
                <div id="mis-egresados-asignados">
                    <p class="text-muted">Cargando...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // 🔥 VER DETALLES DE EGRESADO (MODAL CORREGIDO)
    // ============================================================
    async function verEgresado(egresadoId) {
        try {
            var egresado = await DBModule.query(
                `SELECT e.*, u.nombre as nombre_usuario, u.email, u.username, 
                        c.nombre as carrera_nombre, ent.nombre as entidad_nombre,
                        tu.nombre as tutor_nombre
                 FROM egresados e 
                 JOIN usuarios u ON e.usuario_id = u.id 
                 JOIN carreras c ON e.carrera_id = c.id 
                 JOIN entidades ent ON e.entidad_id = ent.id 
                 LEFT JOIN tutores t ON e.tutor_id = t.id 
                 LEFT JOIN usuarios tu ON t.usuario_id = tu.id 
                 WHERE e.id = ?`,
                [egresadoId]
            );

            if (egresado.length === 0) {
                await ModalModule.warning('No se encontró el egresado.');
                return;
            }

            var eg = egresado[0];

            var plan = await DBModule.query(
                'SELECT * FROM planes_superacion WHERE egresado_id = ? AND estado = "activo"',
                [egresadoId]
            );

            var acciones = [];
            if (plan.length > 0) {
                acciones = await DBModule.query(
                    'SELECT * FROM acciones_plan WHERE plan_id = ? ORDER BY fecha_limite LIMIT 5',
                    [plan[0].id]
                );
            }

            var evaluaciones = await DBModule.query(
                'SELECT * FROM evaluaciones WHERE egresado_id = ? ORDER BY fecha DESC LIMIT 3',
                [egresadoId]
            );

            var tutorias = await DBModule.query(
                'SELECT * FROM tutorias WHERE egresado_id = ? ORDER BY fecha DESC LIMIT 3',
                [egresadoId]
            );

            var modalContent = `
                <div style="max-height:60vh;overflow-y:auto;padding-right:4px;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <div style="font-size:36px;">${eg.avatar || '👤'}</div>
                        <div>
                            <h4 style="margin:0;color:#0a1e3c;font-size:16px;">${eg.nombre_usuario}</h4>
                            <p style="margin:0;color:#64748b;font-size:13px;">${eg.carrera_nombre}</p>
                            <p style="margin:0;color:#94a3b8;font-size:12px;">${eg.email || eg.username}</p>
                        </div>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Tutor:</span> ${eg.tutor_nombre || 'Sin asignar'}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Entidad:</span> ${eg.entidad_nombre}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Año Grad.:</span> ${eg.anio_graduacion || 'N/A'}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Título Oro:</span> ${eg.titulo_oro ? '✅ Sí' : '❌ No'}
                        </div>
                    </div>

                    ${plan.length > 0 ? `
                        <div style="background:#f8fafc;padding:10px;border-radius:6px;margin-bottom:10px;font-size:13px;">
                            <strong>📋 Plan:</strong> Año ${plan[0].anio_plan || 'N/A'} · 
                            <span style="color:${plan[0].progreso >= 80 ? '#1a8a4a' : plan[0].progreso >= 50 ? '#d48a2a' : '#b33a4a'};font-weight:700;">
                                ${plan[0].progreso || 0}%
                            </span>
                            ${plan[0].observaciones ? `<br><span style="color:#64748b;font-size:12px;">${plan[0].observaciones}</span>` : ''}
                        </div>
                    ` : ''}

                    ${acciones.length > 0 ? `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">📌 Acciones (${acciones.length})</div>
                            ${acciones.map(function(a) {
                                var estadoClass = a.estado === 'completado' ? 'badge-success' : a.estado === 'en_progreso' ? 'badge-warning' : 'badge-danger';
                                return `<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid #e2e8f0;font-size:12px;">
                                    <span>${a.icono || '📌'} ${a.titulo}</span>
                                    <span><span class="badge ${estadoClass}" style="font-size:10px;">${a.estado || 'pendiente'}</span></span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    ${evaluaciones.length > 0 ? `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">⭐ Evaluaciones (${evaluaciones.length})</div>
                            ${evaluaciones.map(function(e) {
                                var color = e.puntaje >= 4 ? '#1a8a4a' : e.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
                                return `<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid #e2e8f0;font-size:12px;">
                                    <span>${e.dimension || 'Evaluación'}</span>
                                    <span style="color:${color};font-weight:700;">${e.puntaje}/5</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    ${tutorias.length > 0 ? `
                        <div>
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">📝 Tutorías (${tutorias.length})</div>
                            ${tutorias.map(function(t) {
                                return `<div style="padding:3px 6px;border-bottom:1px solid #e2e8f0;font-size:12px;">
                                    <strong>${t.fecha}</strong> - ${t.resumen ? t.resumen.substring(0, 50) + (t.resumen.length > 50 ? '...' : '') : 'Sin resumen'}
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            `;

            await ModalModule.showModal({
                title: '👤 Detalles del Egresado',
                message: modalContent,
                icon: '👤',
                type: 'info',
                confirmText: 'Cerrar',
                showCancel: false
            });

        } catch (error) {
            console.error('Error al ver egresado:', error);
            await ModalModule.error('Error al cargar los detalles del egresado.');
        }
    }

    // ============================================================
    // 🔥 VER DETALLES DE TUTORÍA (MODAL CORREGIDO)
    // ============================================================
    async function verDetalleTutoria(tutoriaId) {
        try {
            var tutoria = await DBModule.query(
                `SELECT t.*, u.nombre as egresado_nombre, tu.nombre as tutor_nombre 
                 FROM tutorias t 
                 JOIN egresados e ON t.egresado_id = e.id 
                 JOIN usuarios u ON e.usuario_id = u.id 
                 JOIN tutores tr ON t.tutor_id = tr.id 
                 JOIN usuarios tu ON tr.usuario_id = tu.id 
                 WHERE t.id = ?`,
                [tutoriaId]
            );

            if (tutoria.length === 0) {
                await ModalModule.warning('No se encontró la tutoría.');
                return;
            }

            var t = tutoria[0];

            var modalContent = `
                <div style="max-height:60vh;overflow-y:auto;padding-right:4px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Egresado:</span> ${t.egresado_nombre}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Tutor:</span> ${t.tutor_nombre}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Fecha:</span> ${t.fecha}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Estado:</span> <span class="badge badge-success" style="font-size:11px;">${t.estado || 'Completada'}</span>
                        </div>
                    </div>

                    <div style="margin-bottom:10px;">
                        <div style="font-size:13px;font-weight:600;color:#0a1e3c;">📝 Resumen</div>
                        <div style="background:#f8fafc;padding:10px;border-radius:6px;font-size:13px;line-height:1.5;">
                            ${t.resumen || 'Sin resumen'}
                        </div>
                    </div>

                    ${t.acuerdos ? `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">🤝 Acuerdos</div>
                            <div style="background:#f8fafc;padding:10px;border-radius:6px;font-size:13px;line-height:1.5;">
                                ${t.acuerdos}
                            </div>
                        </div>
                    ` : ''}

                    ${t.proxima_tutoria ? `
                        <div>
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">📅 Próxima Tutoría</div>
                            <div style="background:#f8fafc;padding:10px;border-radius:6px;font-size:13px;">
                                ${t.proxima_tutoria}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;

            await ModalModule.showModal({
                title: '📝 Detalles de la Tutoría',
                message: modalContent,
                icon: '📝',
                type: 'info',
                confirmText: 'Cerrar',
                showCancel: false
            });

        } catch (error) {
            console.error('Error al ver tutoría:', error);
            await ModalModule.error('Error al cargar los detalles de la tutoría.');
        }
    }

    // ============================================================
    // 🔥 VER DETALLES DE EVALUACIÓN (MODAL CORREGIDO)
    // ============================================================
    async function verDetalleEvaluacion(evaluacionId) {
        try {
            var evaluacion = await DBModule.query(
                `SELECT e.*, u.nombre as egresado_nombre, tu.nombre as tutor_nombre 
                 FROM evaluaciones e 
                 JOIN egresados eg ON e.egresado_id = eg.id 
                 JOIN usuarios u ON eg.usuario_id = u.id 
                 LEFT JOIN tutores t ON e.tutor_id = t.id 
                 LEFT JOIN usuarios tu ON t.usuario_id = tu.id 
                 WHERE e.id = ?`,
                [evaluacionId]
            );

            if (evaluacion.length === 0) {
                await ModalModule.warning('No se encontró la evaluación.');
                return;
            }

            var ev = evaluacion[0];
            var color = ev.puntaje >= 4 ? '#1a8a4a' : ev.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
            var estrellas = '⭐'.repeat(Math.min(ev.puntaje, 5)) + '☆'.repeat(Math.max(0, 5 - ev.puntaje));

            var modalContent = `
                <div style="max-height:60vh;overflow-y:auto;padding-right:4px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Egresado:</span> ${ev.egresado_nombre}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Tutor:</span> ${ev.tutor_nombre || 'No especificado'}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Dimensión:</span> ${ev.dimension || 'General'}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Fecha:</span> ${ev.fecha || ev.created_at || 'Sin fecha'}
                        </div>
                    </div>

                    <div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;margin-bottom:12px;">
                        <div style="font-size:36px;font-weight:800;color:${color};">${ev.puntaje}/5</div>
                        <div style="font-size:20px;">${estrellas}</div>
                        <div style="font-size:13px;color:#64748b;">
                            ${ev.puntaje >= 4 ? '✅ Excelente desempeño' : ev.puntaje >= 3 ? '📈 Buen desempeño' : '📉 Áreas de mejora'}
                        </div>
                    </div>

                    ${ev.comentario ? `
                        <div>
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">💬 Comentarios</div>
                            <div style="background:#f8fafc;padding:10px;border-radius:6px;font-size:13px;line-height:1.5;">
                                ${ev.comentario}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;

            await ModalModule.showModal({
                title: '⭐ Detalles de la Evaluación',
                message: modalContent,
                icon: '⭐',
                type: 'info',
                confirmText: 'Cerrar',
                showCancel: false
            });

        } catch (error) {
            console.error('Error al ver evaluación:', error);
            await ModalModule.error('Error al cargar los detalles de la evaluación.');
        }
    }

    // ============================================================
    // 🔥 VER EVALUACIONES DE UN EGRESADO (MODAL CORREGIDO)
    // ============================================================
    async function verEvaluaciones(egresadoId, egresadoNombre) {
        try {
            var evaluaciones = await DBModule.query(
                `SELECT e.* 
                 FROM evaluaciones e 
                 WHERE e.egresado_id = ? 
                 ORDER BY e.fecha DESC`,
                [egresadoId]
            );

            if (evaluaciones.length === 0) {
                await ModalModule.info('Este egresado no tiene evaluaciones registradas.', 'Sin evaluaciones');
                return;
            }

            var modalContent = `
                <div style="max-height:55vh;overflow-y:auto;padding-right:4px;">
                    <p style="color:#64748b;font-size:13px;margin-bottom:10px;">
                        Mostrando <strong>${evaluaciones.length}</strong> evaluaciones de <strong>${egresadoNombre}</strong>
                    </p>
                    ${evaluaciones.map(function(e) {
                        var color = e.puntaje >= 4 ? '#1a8a4a' : e.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
                        var estrellas = '⭐'.repeat(Math.min(e.puntaje, 5)) + '☆'.repeat(Math.max(0, 5 - e.puntaje));
                        return `<div style="background:#f8fafc;padding:10px;border-radius:6px;margin-bottom:8px;border-left:4px solid ${color};">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-weight:600;font-size:14px;">${e.dimension || 'Evaluación'}</div>
                                    <div style="font-size:12px;color:#94a3b8;">${e.fecha || e.created_at || 'Sin fecha'}</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:18px;font-weight:700;color:${color};">${e.puntaje}/5</div>
                                    <div style="font-size:14px;">${estrellas}</div>
                                </div>
                            </div>
                            ${e.comentario ? `<div style="font-size:12px;color:#475569;margin-top:4px;">${e.comentario}</div>` : ''}
                            <button class="btn btn-sm btn-info" style="margin-top:4px;font-size:11px;padding:3px 10px;" onclick="TutorModule.verDetalleEvaluacion(${e.id})">
                                <i class="fas fa-eye"></i> Ver detalle
                            </button>
                        </div>`;
                    }).join('')}
                </div>
            `;

            await ModalModule.showModal({
                title: '⭐ Evaluaciones de ' + egresadoNombre,
                message: modalContent,
                icon: '⭐',
                type: 'info',
                confirmText: 'Cerrar',
                showCancel: false
            });

        } catch (error) {
            console.error('Error al ver evaluaciones:', error);
            await ModalModule.error('Error al cargar las evaluaciones.');
        }
    }

    // ============================================================
    // 🔥 ASIGNAR EGRESADO
    // ============================================================
    async function asignarEgresado(egresadoId) {
        var confirmado = await ModalModule.confirm('¿Deseas asignar a este egresado como tutorado?', 'Asignar Egresado');
        if (!confirmado) return;
        
        try {
            await DBModule.execute(
                'UPDATE egresados SET tutor_id = ? WHERE id = ?',
                [tutorId, egresadoId]
            );
            console.log('✅ Egresado asignado correctamente');
            
            var plan = await DBModule.query(
                'SELECT id FROM planes_superacion WHERE egresado_id = ? AND estado = "activo"',
                [egresadoId]
            );
            
            if (plan.length > 0) {
                await DBModule.execute(
                    'UPDATE planes_superacion SET progreso = 0 WHERE id = ?',
                    [plan[0].id]
                );
                console.log('✅ Progreso inicializado en 0%');
            } else {
                await DBModule.execute(
                    `INSERT INTO planes_superacion (egresado_id, tutor_id, anio_plan, estado, progreso, fecha_inicio) 
                     VALUES (?, ?, strftime('%Y', 'now'), 'activo', 0, date('now'))`,
                    [egresadoId, tutorId]
                );
                console.log('✅ Plan creado con progreso 0%');
            }
            
            await ModalModule.success('Egresado asignado correctamente con progreso 0%.');
            loadData();
            cargarEgresadosSinTutor();
            cargarMisEgresadosAsignados();
        } catch (error) {
            console.error('Error al asignar egresado:', error);
            await ModalModule.error('Error al asignar: ' + error.message);
        }
    }

    // ============================================================
    // 🔥 REMOVER EGRESADO
    // ============================================================
    async function removerEgresado(egresadoId) {
        var confirmado = await ModalModule.confirm('¿Estás seguro de que quieres remover a este egresado de tus tutorados?', 'Remover Egresado');
        if (!confirmado) return;
        
        try {
            await DBModule.execute(
                'UPDATE egresados SET tutor_id = NULL WHERE id = ?',
                [egresadoId]
            );
            console.log('✅ Egresado removido');
            await ModalModule.success('Egresado removido correctamente.');
            loadData();
            cargarEgresadosSinTutor();
            cargarMisEgresadosAsignados();
        } catch (error) {
            console.error('Error al remover egresado:', error);
            await ModalModule.error('Error al remover: ' + error.message);
        }
    }

    // ============================================================
    // 🔥 REGISTRAR TUTORIA
    // ============================================================
    async function registrarTutoria() {
        try {
            var egresadoId = document.getElementById('tutoria-egresado').value;
            var fecha = document.getElementById('tutoria-fecha').value;
            var resumen = document.getElementById('tutoria-resumen').value.trim();
            var acuerdos = document.getElementById('tutoria-acuerdos').value.trim();
            var proxima = document.getElementById('tutoria-proxima').value;

            if (!egresadoId) {
                await ModalModule.warning('Debes seleccionar un egresado.');
                return;
            }
            
            if (!fecha) {
                await ModalModule.warning('Debes seleccionar una fecha para la tutoría.');
                return;
            }
            
            if (!resumen || resumen.length < 5) {
                await ModalModule.warning('El resumen debe tener al menos 5 caracteres.');
                return;
            }

            var user = AuthModule.getCurrentUser();
            if (!user) {
                await ModalModule.error('No se encontró el usuario autenticado.');
                return;
            }

            var tutorResult = await DBModule.query(
                'SELECT id FROM tutores WHERE usuario_id = ?',
                [user.id]
            );

            if (tutorResult.length === 0) {
                await ModalModule.error('No se encontró el perfil de tutor.');
                return;
            }

            var tutorIdActual = tutorResult[0].id;

            var egresado = await DBModule.query(
                'SELECT e.*, u.nombre as egresado_nombre, u.email as egresado_email FROM egresados e JOIN usuarios u ON e.usuario_id = u.id WHERE e.id = ?',
                [egresadoId]
            );

            if (egresado.length === 0) {
                await ModalModule.error('No se encontró el egresado seleccionado.');
                return;
            }

            var egresadoData = egresado[0];

            await DBModule.execute(
                `INSERT INTO tutorias (egresado_id, tutor_id, fecha, resumen, acuerdos, proxima_tutoria, estado, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, 'completada', datetime('now'))`,
                [egresadoId, tutorIdActual, fecha, resumen, acuerdos || null, proxima || null]
            );
            console.log('✅ Tutoría registrada y guardada');

            var tutoriaId = await DBModule.query('SELECT last_insert_rowid() as id');
            if (tutoriaId.length > 0) {
                await DBModule.execute(
                    `INSERT INTO historial_tutorias (tutoria_id, tipo, mensaje, fecha) 
                     VALUES (?, 'registro', ?, datetime('now'))`,
                    [tutoriaId[0].id, 'Tutoría registrada por el tutor: ' + resumen.substring(0, 50)]
                );
                console.log('✅ Historial guardado');
            }

            await actualizarProgresoEgresado(egresadoId);

            if (window.NotificationsModule && egresadoData.egresado_email) {
                try {
                    var asunto = 'Nueva tutoría registrada - SISPE';
                    var mensaje = 'Se ha registrado una tutoría para ti.\n\n' +
                                  'Fecha: ' + fecha + '\n' +
                                  'Resumen: ' + resumen + '\n' +
                                  (acuerdos ? 'Acuerdos: ' + acuerdos + '\n' : '') +
                                  (proxima ? 'Próxima tutoría: ' + proxima + '\n' : '') +
                                  '\nEnlace: ' + window.location.origin + '/sispe/#tutorias';

                    await window.NotificationsModule.sendEmail(
                        egresadoData.egresado_email,
                        egresadoData.egresado_nombre,
                        asunto,
                        mensaje,
                        window.location.origin + '/sispe/#tutorias'
                    );
                } catch (emailError) {
                    console.warn('Error al enviar correo:', emailError);
                }
            }

            try {
                await window.NotificationsModule.createNotification(
                    egresadoData.usuario_id,
                    'tutoria',
                    'Tutoría registrada para el ' + fecha + '. Revisa los detalles.',
                    '#tutorias'
                );
            } catch (notifError) {
                console.warn('Error al crear notificación:', notifError);
            }

            await ModalModule.success('✅ Tutoría registrada correctamente.');

            var formTutoria = document.getElementById('form-registrar-tutoria');
            if (formTutoria) {
                formTutoria.reset();
                document.getElementById('tutoria-fecha').value = new Date().toISOString().split('T')[0];
            }
            
            loadData();
            
        } catch (error) {
            console.error('Error al registrar tutoría:', error);
            await ModalModule.error('Error al registrar tutoría: ' + error.message);
        }
    }

    // ============================================================
    // 🔥 ACTUALIZAR PROGRESO
    // ============================================================
    async function actualizarProgresoEgresado(egresadoId) {
        try {
            var acciones = await DBModule.query(
                'SELECT COUNT(*) as total FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ?)',
                [egresadoId]
            );
            var total = acciones[0]?.total || 0;

            var completadas = await DBModule.query(
                'SELECT COUNT(*) as total FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ?) AND estado = "completado"',
                [egresadoId]
            );
            var completadasTotal = completadas[0]?.total || 0;

            var pct = total > 0 ? Math.round((completadasTotal / total) * 100) : 0;

            await DBModule.execute(
                'UPDATE planes_superacion SET progreso = ? WHERE egresado_id = ? AND estado = "activo"',
                [pct, egresadoId]
            );
            console.log('📊 Progreso actualizado: ' + pct + '%');
            return pct;
        } catch (error) {
            console.error('Error al actualizar progreso:', error);
            return 0;
        }
    }

    // ============================================================
    // 🔥 EVALUAR EGRESADO
    // ============================================================
    async function evaluarEgresado() {
        var egresadoId = document.getElementById('eval-egresado-id').value;
        var conocimientos = parseInt(document.getElementById('eval-conocimientos').value);
        var habilidades = parseInt(document.getElementById('eval-habilidades').value);
        var etica = parseInt(document.getElementById('eval-etica').value);
        var aplicacion = parseInt(document.getElementById('eval-aplicacion').value);
        var autonomia = parseInt(document.getElementById('eval-autonomia').value);
        var adaptacion = parseInt(document.getElementById('eval-adaptacion').value);
        var comentario = document.getElementById('eval-comentario').value.trim();

        if (!conocimientos || !habilidades || !etica || !aplicacion || !autonomia || !adaptacion) {
            await ModalModule.warning('Completa todos los campos.');
            return;
        }

        var promedio = Math.round((conocimientos + habilidades + etica + aplicacion + autonomia + adaptacion) / 6);

        try {
            await DBModule.execute(
                'INSERT INTO evaluaciones (egresado_id, tutor_id, tipo, dimension, puntaje, comentario, fecha) VALUES (?, ?, "heteroevaluacion", "Evaluación Integral", ?, ?, date("now"))',
                [egresadoId, tutorId, promedio, comentario || 'Evaluación completada.']
            );
            console.log('✅ Evaluación guardada');

            try {
                await DBModule.execute(
                    'INSERT INTO historial_evaluaciones (egresado_id, competencia_id, puntuacion_nueva, fecha_cambio, observaciones) VALUES (?, ?, ?, ?, ?)',
                    [egresadoId, 1, promedio, new Date().toISOString(), 'Evaluación integral completada']
                );
                console.log('✅ Historial de evaluación guardado');
            } catch (histError) {
                console.warn('⚠️ No se pudo guardar en historial_evaluaciones:', histError);
            }

            await actualizarProgresoEgresado(egresadoId);

            await ModalModule.success('Evaluación guardada. Puntaje: ' + promedio + '/5. Progreso actualizado.');
            document.getElementById('formulario-evaluacion').style.display = 'none';
            document.getElementById('form-evaluacion').reset();
            loadData();
        } catch (error) {
            console.error('Error al guardar evaluación:', error);
            await ModalModule.error('Error al guardar evaluación: ' + error.message);
        }
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        var formAsignar = document.getElementById('form-asignar-egresado');
        if (formAsignar) {
            formAsignar.addEventListener('submit', async function(e) {
                e.preventDefault();
                var egresadoId = document.getElementById('asignar-egresado').value;
                if (!egresadoId) {
                    await ModalModule.warning('Selecciona un egresado.');
                    return;
                }
                await asignarEgresado(egresadoId);
            });
        }

        var formTutoria = document.getElementById('form-registrar-tutoria');
        if (formTutoria) {
            formTutoria.removeEventListener('submit', registrarTutoria);
            formTutoria.addEventListener('submit', function(e) {
                e.preventDefault();
                registrarTutoria();
            });
        }

        var formEval = document.getElementById('form-evaluacion');
        if (formEval) {
            formEval.removeEventListener('submit', evaluarEgresado);
            formEval.addEventListener('submit', function(e) {
                e.preventDefault();
                evaluarEgresado();
            });
        }

        cargarEgresadosSinTutor();
        cargarMisEgresadosAsignados();
        cargarEgresadosParaSelects();
    }

    // ============================================================
    // CARGAR EGRESADOS PARA SELECTS
    // ============================================================
    async function cargarEgresadosParaSelects() {
        try {
            var sinTutor = await DBModule.query(
                `SELECT e.id, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
                 FROM egresados e 
                 JOIN usuarios u ON e.usuario_id = u.id 
                 JOIN carreras c ON e.carrera_id = c.id 
                 WHERE e.tutor_id IS NULL OR e.tutor_id = 0
                 ORDER BY u.nombre`
            );

            var selectAsignar = document.getElementById('asignar-egresado');
            if (selectAsignar) {
                selectAsignar.innerHTML = '<option value="">Selecciona un egresado...</option>';
                sinTutor.forEach(function(e) {
                    selectAsignar.innerHTML += `<option value="${e.id}">${e.egresado_nombre} (${e.carrera_nombre})</option>`;
                });
            }

            var user = AuthModule.getCurrentUser();
            if (user) {
                var tutorResult = await DBModule.query(
                    'SELECT id FROM tutores WHERE usuario_id = ?',
                    [user.id]
                );
                if (tutorResult.length > 0) {
                    var tutorIdActual = tutorResult[0].id;
                    var misEgresados = await DBModule.query(
                        `SELECT e.id, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
                         FROM egresados e 
                         JOIN usuarios u ON e.usuario_id = u.id 
                         JOIN carreras c ON e.carrera_id = c.id 
                         WHERE e.tutor_id = ?
                         ORDER BY u.nombre`,
                        [tutorIdActual]
                    );

                    var selectTutoria = document.getElementById('tutoria-egresado');
                    if (selectTutoria) {
                        selectTutoria.innerHTML = '<option value="">Selecciona un egresado...</option>';
                        misEgresados.forEach(function(e) {
                            selectTutoria.innerHTML += `<option value="${e.id}">${e.egresado_nombre} (${e.carrera_nombre})</option>`;
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error al cargar egresados para selects:', error);
        }
    }

    async function cargarEgresadosSinTutor() {
        var container = document.getElementById('egresados-sin-tutor');
        if (!container) return;

        var egresados = await DBModule.query(
            `SELECT e.*, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             WHERE e.tutor_id IS NULL OR e.tutor_id = 0
             ORDER BY u.nombre`
        );

        if (egresados.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay egresados sin tutor asignado.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Acción</th></tr></thead><tbody>';
        egresados.forEach(function(e) {
            html += `<tr>
                <td><strong>${e.egresado_nombre}</strong></td>
                <td>${e.carrera_nombre}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="TutorModule.asignarEgresado(${e.id})">
                        <i class="fas fa-user-plus"></i> Asignar
                    </button>
                </td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async function cargarMisEgresadosAsignados() {
        var container = document.getElementById('mis-egresados-asignados');
        if (!container) return;

        var egresados = await DBModule.query(
            `SELECT e.*, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             WHERE e.tutor_id = ?
             ORDER BY u.nombre`,
            [tutorId]
        );

        if (egresados.length === 0) {
            container.innerHTML = '<p class="text-muted">No tienes egresados asignados.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Acción</th></tr></thead><tbody>';
        egresados.forEach(function(e) {
            html += `<tr>
                <td><strong>${e.egresado_nombre}</strong></td>
                <td>${e.carrera_nombre}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="TutorModule.removerEgresado(${e.id})">
                        <i class="fas fa-user-minus"></i> Remover
                    </button>
                </td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    // Exponer funciones
    window.TutorModule = window.TutorModule || {};
    window.TutorModule.verEgresado = verEgresado;
    window.TutorModule.verDetalleTutoria = verDetalleTutoria;
    window.TutorModule.verDetalleEvaluacion = verDetalleEvaluacion;
    window.TutorModule.verEvaluaciones = verEvaluaciones;
    window.TutorModule.asignarEgresado = asignarEgresado;
    window.TutorModule.removerEgresado = removerEgresado;

    return {
        navigate: navigate,
        verEgresado: verEgresado,
        verDetalleTutoria: verDetalleTutoria,
        verDetalleEvaluacion: verDetalleEvaluacion,
        verEvaluaciones: verEvaluaciones,
        registrarTutoria: registrarTutoria,
        asignarEgresado: asignarEgresado,
        removerEgresado: removerEgresado,
        evaluarEgresado: evaluarEgresado
    };

})();

window.TutorModule = TutorModule;
console.log('✅ TutorModule con emojis de menu corregidos cargado correctamente.');
