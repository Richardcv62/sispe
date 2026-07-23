// ============================================================
// SISPE - tutor.js
// Modulo del Tutor - Version completa con envio de correos
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
            // Obtener el tutor logueado
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

            // Obtener egresados del tutor
            var egresados = await DBModule.query(
                'SELECT e.*, u.nombre as nombre_usuario, c.nombre as carrera_nombre, ent.nombre as entidad_nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id JOIN carreras c ON e.carrera_id = c.id JOIN entidades ent ON e.entidad_id = ent.id WHERE e.tutor_id = ?',
                [tutorId]
            );

            // Actualizar estadisticas
            var totalEgresados = egresados.length;
            var totalEl = document.getElementById('total-tutorados');
            if (totalEl) totalEl.textContent = totalEgresados;

            var totalNum = document.getElementById('total-tutorados-num');
            if (totalNum) totalNum.textContent = totalEgresados;

            // Calcular progreso de cada egresado
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

            // Mostrar lista de tutorados
            var listaTutorados = document.getElementById('lista-tutorados');
            if (listaTutorados) {
                if (egresados.length === 0) {
                    listaTutorados.innerHTML = '<p class="text-muted">No tienes egresados asignados.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Entidad</th><th>Progreso</th><th>Accion</th></tr></thead><tbody>';
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
                        html += '<td><button class="btn btn-sm btn-primary" onclick="TutorModule.verEgresado(' + eg.id + ')">Ver</button></td></tr>';
                    }
                    html += '</tbody></table></div>';
                    listaTutorados.innerHTML = html;
                }
            }

            // Lista completa para tutorados
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

            // Lista para evaluar
            var listaEvaluar = document.getElementById('lista-evaluar');
            if (listaEvaluar) {
                if (egresados.length === 0) {
                    listaEvaluar.innerHTML = '<p class="text-muted">No tienes egresados asignados.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Progreso</th><th>Accion</th></tr></thead><tbody>';
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
                        html += '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + pct + '%;"></div></div><span class="progress-pct">' + pct + '%</span></div></td>';
                        html += '<td><button class="btn btn-sm btn-primary btn-evaluar" data-id="' + eg.id + '" data-nombre="' + eg.nombre_usuario + '">Evaluar</button></td></tr>';
                    }
                    html += '</tbody></table></div>';
                    listaEvaluar.innerHTML = html;
                    
                    // Reasignar eventos de evaluacion
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

            // Ultimas tutorias
            var ultimasTutorias = document.getElementById('ultimas-tutorias');
            if (ultimasTutorias) {
                var tutorias = await DBModule.query(
                    'SELECT t.*, u.nombre as egresado_nombre FROM tutorias t JOIN egresados e ON t.egresado_id = e.id JOIN usuarios u ON e.usuario_id = u.id WHERE t.tutor_id = ? ORDER BY t.fecha DESC LIMIT 5',
                    [tutorId]
                );
                if (tutorias.length === 0) {
                    ultimasTutorias.innerHTML = '<p class="text-muted">No hay tutorias registradas recientemente.</p>';
                } else {
                    var html = '';
                    tutorias.forEach(function(t) {
                        html += '<div class="timeline-item"><div class="timeline-dot done"></div><div class="timeline-content">';
                        html += '<div class="title">' + t.egresado_nombre + ' - ' + t.fecha + '</div>';
                        html += '<div class="desc">' + t.resumen + '</div>';
                        if (t.proxima_tutoria) html += '<div class="date">Proxima: ' + t.proxima_tutoria + '</div>';
                        html += '</div></div>';
                    });
                    ultimasTutorias.innerHTML = html;
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
                    <div class="stat-icon">ðŸ‘¥</div>
                    <div class="number" id="total-tutorados">0</div>
                    <div class="label">Egresados a mi cargo</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">ðŸŒŸ</div>
                    <div class="number" id="alto-progreso">0</div>
                    <div class="label">Progreso alto (80%+)</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">ðŸ“ˆ</div>
                    <div class="number" id="en-desarrollo">0</div>
                    <div class="label">En desarrollo</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #b33a4a;">
                    <div class="stat-icon">âš ï¸</div>
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
                    <div style="font-size:40px;">ðŸ“</div>
                    <h4>Registrar Tutoria</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="TutorModule.navigate('evaluar')">
                    <div style="font-size:40px;">â­</div>
                    <h4>Evaluar Egresado</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="TutorModule.navigate('tutorados')">
                    <div style="font-size:40px;">ðŸ‘¥</div>
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
                                <option value="1">Carlos Perez</option>
                                <option value="2">Ana Rodriguez</option>
                                <option value="3">Luis Fernandez</option>
                                <option value="4">Marta Castillo</option>
                                <option value="5">Jose Martinez</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Carrera</label>
                            <input type="text" id="asignar-carrera" placeholder="Carrera del egresado">
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
    // REGISTRAR TUTORIA (CON FORMULARIO Y ENVIO DE CORREO)
    // ============================================================
    function renderRegistrarTutoria() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-pen-to-square"></i> Registrar Tutoria</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Tutor</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-plus-circle"></i> Nueva Tutoria</div>
                <form id="form-registrar-tutoria">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Egresado <span class="required">*</span></label>
                            <select id="tutoria-egresado" required>
                                <option value="">Selecciona un egresado...</option>
                                <option value="1">Carlos Perez</option>
                                <option value="2">Ana Rodriguez</option>
                                <option value="3">Luis Fernandez</option>
                                <option value="4">Marta Castillo</option>
                                <option value="5">Jose Martinez</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fecha <span class="required">*</span></label>
                            <input type="date" id="tutoria-fecha" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Resumen de la tutoria <span class="required">*</span></label>
                        <textarea rows="4" id="tutoria-resumen" placeholder="Describe los temas tratados, acuerdos y proximos pasos..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Acuerdos</label>
                        <textarea rows="2" id="tutoria-acuerdos" placeholder="Acuerdos alcanzados durante la tutoria..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Proxima Tutoria</label>
                        <input type="date" id="tutoria-proxima">
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar tutoria</button>
                </form>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-clock-rotate-left"></i> Ultimas Tutorias Registradas</div>
                <div id="ultimas-tutorias">
                    <p class="text-muted">No hay tutorias registradas recientemente.</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // EVALUAR (CON FORMULARIO)
    // ============================================================
    function renderEvaluar() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Evaluar Egresado</h2>
                <div class="breadcrumb">Evaluacion de competencias</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Seleccionar egresado</div>
                <div id="lista-evaluar">
                    <p class="text-muted">Cargando egresados...</p>
                </div>
            </div>

            <div id="formulario-evaluacion" style="display:none;">
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas fa-edit"></i> Evaluacion de <span id="eval-egresado-nombre">Egresado</span></div>
                    <form id="form-evaluacion">
                        <input type="hidden" id="eval-egresado-id">

                        <fieldset>
                            <legend>Competencias Academicas</legend>
                            <div class="form-group">
                                <label>1. Nivel de actualizacion y dominio <span class="required">*</span></label>
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
                                <label>3. Valores eticos y compromiso <span class="required">*</span></label>
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
                            <legend>Impacto en el Desempeno</legend>
                            <div class="form-group">
                                <label>4. Aplicacion de conocimientos <span class="required">*</span></label>
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
                                <label>5. Autonomia y participacion <span class="required">*</span></label>
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
                                <label>6. Adaptacion a nuevos entornos <span class="required">*</span></label>
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
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar evaluacion</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-evaluacion').style.display='none'">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    // ============================================================
    // REGISTRAR TUTORIA CON NOTIFICACION AL EGRESADO (reply_to = tutor)
    // ============================================================
    async function registrarTutoria() {
        var egresadoId = document.getElementById('tutoria-egresado').value;
        var fecha = document.getElementById('tutoria-fecha').value;
        var resumen = document.getElementById('tutoria-resumen').value.trim();
        var acuerdos = document.getElementById('tutoria-acuerdos').value.trim();
        var proxima = document.getElementById('tutoria-proxima').value;

        if (!egresadoId || !fecha || !resumen) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showWarning('Completa los campos requeridos.');
            }
            return;
        }

        try {
            // Obtener datos del egresado
            var egresado = await DBModule.query(
                'SELECT e.*, u.nombre as egresado_nombre, u.email as egresado_email FROM egresados e JOIN usuarios u ON e.usuario_id = u.id WHERE e.id = ?',
                [egresadoId]
            );

            // Obtener datos del tutor (para el reply_to)
            var tutorDatos = await DBModule.query(
                'SELECT u.nombre as tutor_nombre, u.email as tutor_email FROM tutores t JOIN usuarios u ON t.usuario_id = u.id WHERE t.id = ?',
                [tutorId]
            );
            var tutorEmail = tutorDatos.length > 0 ? tutorDatos[0].tutor_email : null;
            var tutorNombre = tutorDatos.length > 0 ? tutorDatos[0].tutor_nombre : 'Tutor';

            // Guardar la tutoria
            await DBModule.execute(
                'INSERT INTO tutorias (egresado_id, tutor_id, fecha, resumen, acuerdos, proxima_tutoria, estado) VALUES (?, ?, ?, ?, ?, ?, "completada")',
                [egresadoId, tutorId, fecha, resumen, acuerdos || null, proxima || null]
            );

            // ENVIAR CORREO AL EGRESADO CON reply_to = tutor
            if (window.NotificationsModule && egresado.length > 0) {
                var egresadoData = egresado[0];
                if (egresadoData.egresado_email) {
                    var asunto = 'Nueva tutoria registrada - SISPE';
                    var mensaje = 'Se ha registrado una tutoria para ti.\n\n' +
                                  'Fecha: ' + fecha + '\n' +
                                  'Resumen: ' + resumen + '\n' +
                                  (acuerdos ? 'Acuerdos: ' + acuerdos + '\n' : '') +
                                  (proxima ? 'Proxima tutoria: ' + proxima + '\n' : '') +
                                  '\nSi tienes dudas, responde a este correo para contactar a tu tutor.\n\n' +
                                  'Enlace: ' + window.location.origin + '/sispe/#tutorias';

                    await window.NotificationsModule.sendEmail(
                        egresadoData.egresado_email,
                        egresadoData.egresado_nombre,
                        asunto,
                        mensaje,
                        window.location.origin + '/sispe/#tutorias',
                        tutorEmail || '3sayricardo@gmail.com'
                    );
                }
            }

            // Notificar en el sistema
            if (egresado.length > 0) {
                await window.NotificationsModule.createNotification(
                    egresado[0].usuario_id,
                    'tutoria',
                    'Tutoria registrada para el ' + fecha + '. Revisa los detalles.',
                    '#tutorias'
                );
            }

            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Tutoria registrada correctamente.', 'success');
            }

            var formTutoria = document.getElementById('form-registrar-tutoria');
            if (formTutoria) {
                formTutoria.reset();
                document.getElementById('tutoria-fecha').value = new Date().toISOString().split('T')[0];
            }
            loadData();
        } catch (error) {
            console.error('Error al registrar tutoria:', error);
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al registrar.', 'error');
            }
        }
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        // Formulario: Asignar egresado
        var formAsignar = document.getElementById('form-asignar-egresado');
        if (formAsignar) {
            formAsignar.addEventListener('submit', async function(e) {
                e.preventDefault();
                var egresadoId = document.getElementById('asignar-egresado').value;
                if (!egresadoId) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning('Selecciona un egresado.');
                    }
                    return;
                }

                try {
                    await DBModule.execute(
                        'UPDATE egresados SET tutor_id = ? WHERE id = ?',
                        [tutorId, egresadoId]
                    );
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Egresado asignado correctamente.', 'success');
                    }
                    formAsignar.reset();
                    loadData();
                } catch (error) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Error al asignar.', 'error');
                    }
                }
            });
        }

        // Formulario: Registrar tutoria
        var formTutoria = document.getElementById('form-registrar-tutoria');
        if (formTutoria) {
            formTutoria.removeEventListener('submit', registrarTutoria);
            formTutoria.addEventListener('submit', function(e) {
                e.preventDefault();
                registrarTutoria();
            });
        }

        // Formulario: Evaluacion
        var formEval = document.getElementById('form-evaluacion');
        if (formEval) {
            formEval.addEventListener('submit', async function(e) {
                e.preventDefault();
                var egresadoId = document.getElementById('eval-egresado-id').value;
                var conocimientos = parseInt(document.getElementById('eval-conocimientos').value);
                var habilidades = parseInt(document.getElementById('eval-habilidades').value);
                var etica = parseInt(document.getElementById('eval-etica').value);
                var aplicacion = parseInt(document.getElementById('eval-aplicacion').value);
                var autonomia = parseInt(document.getElementById('eval-autonomia').value);
                var adaptacion = parseInt(document.getElementById('eval-adaptacion').value);

                if (!conocimientos || !habilidades || !etica || !aplicacion || !autonomia || !adaptacion) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning('Completa todos los campos.');
                    }
                    return;
                }

                var promedio = Math.round((conocimientos + habilidades + etica + aplicacion + autonomia + adaptacion) / 6);
                var comentario = document.getElementById('eval-comentario').value.trim();

                try {
                    await DBModule.execute(
                        'INSERT INTO evaluaciones (egresado_id, tutor_id, tipo, dimension, puntaje, comentario, fecha) VALUES (?, ?, "heteroevaluacion", "Evaluacion Integral", ?, ?, date("now"))',
                        [egresadoId, tutorId, promedio, comentario || 'Evaluacion completada.']
                    );
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Evaluacion guardada. Puntaje: ' + promedio + '/5', 'success');
                    }
                    document.getElementById('formulario-evaluacion').style.display = 'none';
                    formEval.reset();
                    loadData();
                } catch (error) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast('Error al guardar evaluacion.', 'error');
                    }
                }
            });
        }
    }

    // Funcion para ver egresado
    window.TutorModule = window.TutorModule || {};
    window.TutorModule.verEgresado = function(id) {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Ver detalles del egresado (en desarrollo)', 'info');
        }
    };

    return {
        navigate: navigate,
        verEgresado: window.TutorModule.verEgresado,
        registrarTutoria: registrarTutoria
    };

})();

window.TutorModule = TutorModule;
console.log('TutorModule con envio de correos cargado correctamente.');
