// ============================================================
// SISPE - tutor.js
// Modulo del Tutor - CON EMOJIS HTML ENTITIES Y ACENTOS
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
            case 'plan-superacion-egresado':
                content = renderPlanSuperacionEgresado();
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
            case 'evaluar-competencias':
                if (window.CompetenciasModule && typeof window.CompetenciasModule.navigate === 'function') {
                    window.CompetenciasModule.navigate('evaluar-competencias', breadcrumb);
                    return;
                }
                content = '<p class="text-muted">M&oacute;dulo de Competencias no disponible.</p>';
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
                var tutorResult = await DBModule.query(
                    'SELECT id FROM tutores WHERE usuario_id = ?',
                    [user.id]
                );
                if (tutorResult.length > 0) {
                    tutorId = tutorResult[0].id;
                }
            }

            await cargarDashboardData();
            await cargarTutorados();
            await cargarEgresadosParaSelects();
            await cargarUltimasTutorias();
            await cargarHistorialEvaluaciones();

            var egresadoId = document.getElementById('plan-superacion-egresado-select')?.value;
            if (egresadoId) {
                await cargarPlanSuperacionEgresado(egresadoId);
            }

        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    // ============================================================
    // CARGAR DASHBOARD
    // ============================================================
    async function cargarDashboardData() {
        var egresados = await DBModule.query(
            'SELECT e.*, u.nombre as nombre_usuario FROM egresados e JOIN usuarios u ON e.usuario_id = u.id WHERE e.tutor_id = ?',
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
                'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ? AND tipo = "superacion")',
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
    }

    // ============================================================
    // RENDER DASHBOARD - CON EMOJIS HTML ENTITIES
    // ============================================================
    function renderDashboard() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-chart-simple"></i> Dashboard del Tutor</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Tutor</div>
            </div>

            <div class="stats-grid">
                <div class="stat-card" style="border-left:4px solid #0a1e3c;">
                    <div class="stat-icon">&#128101;</div>
                    <div class="number" id="total-tutorados">0</div>
                    <div class="label">Egresados a mi cargo</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #1a8a4a;">
                    <div class="stat-icon">&#128200;</div>
                    <div class="number" id="alto-progreso">0</div>
                    <div class="label">Progreso alto (80%+)</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d48a2a;">
                    <div class="stat-icon">&#128202;</div>
                    <div class="number" id="en-desarrollo">0</div>
                    <div class="label">En desarrollo</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #b33a4a;">
                    <div class="stat-icon">&#128198;</div>
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

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;">
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="TutorModule.navigate('tutorados')">
                    <div style="font-size:36px;">&#128101;</div>
                    <h4>Mis Tutorados</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="TutorModule.navigate('plan-superacion-egresado')">
                    <div style="font-size:36px;">&#128203;</div>
                    <h4>Plan de Superaci&oacute;n</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="TutorModule.navigate('registrar-tutoria')">
                    <div style="font-size:36px;">&#128221;</div>
                    <h4>Registrar Tutor&iacute;a</h4>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="TutorModule.navigate('evaluar')">
                    <div style="font-size:36px;">&#11088;</div>
                    <h4>Evaluar</h4>
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
                <div class="card-title"><i class="fas fa-list"></i> Lista de Egresados</div>
                <div id="lista-completa-tutorados">
                    <p class="text-muted">Cargando...</p>
                </div>
            </div>
        `;
    }

    // ============================================================
    // PLAN DE SUPERACI&Oacute;N DEL EGRESADO
    // ============================================================
    function renderPlanSuperacionEgresado() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Plan de Superaci&oacute;n del Egresado</h2>
                <div class="breadcrumb">Definir plan de superaci&oacute;n para tus egresados</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-user-graduate"></i> Seleccionar Egresado</div>
                <div class="form-group">
                    <label>Egresado <span class="required">*</span></label>
                    <select id="plan-superacion-egresado-select" onchange="TutorModule.cargarPlanSuperacionEgresado(this.value)" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">
                        <option value="">-- Selecciona un egresado --</option>
                    </select>
                </div>
            </div>

            <div id="plan-superacion-container"></div>
        `;
    }

    // ============================================================
    // CARGAR PLAN DE SUPERACI&Oacute;N DEL EGRESADO
    // ============================================================
    async function cargarPlanSuperacionEgresado(egresadoId) {
        var container = document.getElementById('plan-superacion-container');
        if (!container) return;

        if (!egresadoId) {
            container.innerHTML = '<p class="text-muted">Selecciona un egresado para ver o definir su plan de superaci&oacute;n.</p>';
            return;
        }

        var egresado = await DBModule.query(
            `SELECT e.*, u.nombre as egresado_nombre, u.email, c.nombre as carrera_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             WHERE e.id = ?`,
            [egresadoId]
        );

        if (egresado.length === 0) {
            container.innerHTML = '<p class="text-muted">Egresado no encontrado.</p>';
            return;
        }

        var eg = egresado[0];

        var plan = await DBModule.query(
            `SELECT * FROM planes_superacion 
             WHERE egresado_id = ? AND tipo = 'superacion' AND estado = 'activo'`,
            [egresadoId]
        );

        var acciones = [];
        if (plan.length > 0) {
            acciones = await DBModule.query(
                'SELECT * FROM acciones_plan WHERE plan_id = ? ORDER BY fecha_limite',
                [plan[0].id]
            );
        }

        var html = `
            <div class="card" style="border:2px solid #2a6b9c;margin-top:16px;">
                <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div>
                        <i class="fas fa-star" style="color:#2a6b9c;"></i> 
                        Plan de Superaci&oacute;n de <strong>${eg.egresado_nombre}</strong>
                        <span style="font-size:12px;color:#94a3b8;font-weight:400;margin-left:8px;">${eg.carrera_nombre}</span>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary" onclick="TutorModule.mostrarFormularioPlanSuperacion(${egresadoId})">
                            <i class="fas fa-edit"></i> ${plan.length > 0 ? 'Editar Plan' : 'Crear Plan'}
                        </button>
                    </div>
                </div>

                ${plan.length > 0 ? `
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;padding:12px;background:#f8fafc;border-radius:8px;">
                        <div>
                            <div style="font-size:11px;color:#94a3b8;">Estado</div>
                            <div><span class="badge badge-${plan[0].estado === 'activo' ? 'success' : 'warning'}">${plan[0].estado || 'Activo'}</span></div>
                        </div>
                        <div>
                            <div style="font-size:11px;color:#94a3b8;">Progreso</div>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <div class="progress-track" style="max-width:100px;"><div class="progress-fill green" style="width:${plan[0].progreso || 0}%;"></div></div>
                                <span style="font-weight:700;font-size:14px;">${plan[0].progreso || 0}%</span>
                            </div>
                        </div>
                        <div>
                            <div style="font-size:11px;color:#94a3b8;">Fecha inicio</div>
                            <div>${plan[0].fecha_inicio || 'No definida'}</div>
                        </div>
                        <div>
                            <div style="font-size:11px;color:#94a3b8;">Fecha fin estimada</div>
                            <div>${plan[0].fecha_fin_estimada || 'No definida'}</div>
                        </div>
                    </div>
                ` : ''}

                <div class="card-title" style="font-size:14px;margin-top:8px;"><i class="fas fa-list-check"></i> Acciones del Plan</div>
                ${acciones.length === 0 ? '<p class="text-muted">No hay acciones definidas en este plan.</p>' : `
                    <div class="table-wrap">
                        <table>
                            <thead><tr><th>Acci&oacute;n</th><th>Tipo</th><th>Estado</th><th>Fecha L&iacute;mite</th></tr></thead>
                            <tbody>
                                ${acciones.map(function(a) {
                                    var estadoClass = a.estado === 'completado' ? 'success' : a.estado === 'en_progreso' ? 'warning' : 'danger';
                                    var estadoText = a.estado === 'completado' ? '&#9989; Completado' : a.estado === 'en_progreso' ? '&#128260; En progreso' : '&#9203; Pendiente';
                                    return `<tr>
                                        <td><strong>${a.titulo}</strong>${a.descripcion ? '<br><span style="font-size:12px;color:#64748b;">' + a.descripcion + '</span>' : ''}</td>
                                        <td><span class="badge badge-info">${a.tipo || 'General'}</span></td>
                                        <td><span class="badge badge-${estadoClass}">${estadoText}</span></td>
                                        <td>${a.fecha_limite || 'Sin fecha'}</td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
                ${plan.length > 0 ? `<button class="btn btn-sm btn-outline" onclick="TutorModule.mostrarFormularioAccionPlan(${plan[0].id})" style="margin-top:8px;"><i class="fas fa-plus"></i> Agregar acci&oacute;n</button>` : ''}
            </div>
        `;

        container.innerHTML = html;
    }

    // ============================================================
    // MOSTRAR FORMULARIO PLAN DE SUPERACI&Oacute;N
    // ============================================================
    function mostrarFormularioPlanSuperacion(egresadoId) {
        var container = document.createElement('div');
        container.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 30, 60, 0.6); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            z-index: 100000; padding: 20px;
        `;

        DBModule.query(
            `SELECT u.nombre as egresado_nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id WHERE e.id = ?`,
            [egresadoId]
        ).then(function(result) {
            var nombre = result.length > 0 ? result[0].egresado_nombre : 'Egresado';

            DBModule.query(
                `SELECT * FROM planes_superacion WHERE egresado_id = ? AND tipo = 'superacion' AND estado = 'activo'`,
                [egresadoId]
            ).then(function(planResult) {
                var plan = planResult.length > 0 ? planResult[0] : null;

                container.innerHTML = `
                    <div style="background:white;border-radius:16px;padding:24px;max-width:560px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:modalSlideIn 0.3s ease;max-height:85vh;overflow-y:auto;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <h3 style="margin:0;color:#0a1e3c;font-size:18px;">
                                <i class="fas fa-star" style="color:#2a6b9c;"></i> 
                                Plan de Superaci&oacute;n de ${nombre}
                            </h3>
                            <button onclick="this.closest('div[style]').remove()" style="background:transparent;border:none;font-size:20px;cursor:pointer;color:#94a3b8;">&times;</button>
                        </div>
                        <form id="form-plan-superacion">
                            <input type="hidden" id="plan-superacion-egresado-id" value="${egresadoId}">
                            ${plan ? `<input type="hidden" id="plan-superacion-id" value="${plan.id}">` : ''}

                            <div class="form-group">
                                <label>T&iacute;tulo del plan <span class="required">*</span></label>
                                <input type="text" id="plan-superacion-titulo" value="${plan ? plan.observaciones || 'Plan de Superaci&oacute;n Profesional' : 'Plan de Superaci&oacute;n Profesional'}" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Fecha de inicio</label>
                                    <input type="date" id="plan-superacion-fecha-inicio" value="${plan ? plan.fecha_inicio || '' : ''}">
                                </div>
                                <div class="form-group">
                                    <label>Fecha de finalizaci&oacute;n estimada</label>
                                    <input type="date" id="plan-superacion-fecha-fin" value="${plan ? plan.fecha_fin_estimada || '' : ''}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Objetivos del plan</label>
                                <textarea rows="3" id="plan-superacion-objetivos" placeholder="Describe los objetivos del plan de superaci&oacute;n...">${plan ? plan.observaciones || '' : ''}</textarea>
                            </div>
                            <div style="display:flex;gap:12px;margin-top:16px;">
                                <button type="submit" class="btn btn-primary" style="flex:1;"><i class="fas fa-save"></i> ${plan ? 'Actualizar Plan' : 'Crear Plan'}</button>
                                <button type="button" class="btn btn-outline" style="flex:1;" onclick="this.closest('div[style]').remove()">Cancelar</button>
                            </div>
                        </form>
                    </div>
                `;

                document.body.appendChild(container);

                document.getElementById('form-plan-superacion').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    await guardarPlanSuperacion();
                });
            });
        });
    }

    // ============================================================
    // GUARDAR PLAN DE SUPERACI&Oacute;N
    // ============================================================
    async function guardarPlanSuperacion() {
        var egresadoId = document.getElementById('plan-superacion-egresado-id').value;
        var planId = document.getElementById('plan-superacion-id')?.value;
        var titulo = document.getElementById('plan-superacion-titulo').value.trim();
        var fechaInicio = document.getElementById('plan-superacion-fecha-inicio').value;
        var fechaFin = document.getElementById('plan-superacion-fecha-fin').value;
        var objetivos = document.getElementById('plan-superacion-objetivos').value.trim();

        if (!titulo) {
            await ModalModule.warning('El t&iacute;tulo es obligatorio.');
            return;
        }

        try {
            if (planId) {
                await DBModule.execute(
                    `UPDATE planes_superacion SET 
                        observaciones = ?, 
                        fecha_inicio = ?, 
                        fecha_fin_estimada = ? 
                     WHERE id = ?`,
                    [objetivos || titulo, fechaInicio || null, fechaFin || null, planId]
                );
                await ModalModule.success('&#9989; Plan de superaci&oacute;n actualizado.');
            } else {
                var result = await DBModule.execute(
                    `INSERT INTO planes_superacion 
                        (egresado_id, tutor_id, anio_plan, tipo, estado, observaciones, fecha_inicio, fecha_fin_estimada, progreso) 
                     VALUES (?, ?, strftime('%Y', 'now'), 'superacion', 'activo', ?, ?, ?, 0)`,
                    [egresadoId, tutorId, objetivos || titulo, fechaInicio || null, fechaFin || null]
                );
                await ModalModule.success('&#9989; Plan de superaci&oacute;n creado.');
            }

            var modal = document.querySelector('div[style*="position: fixed"]');
            if (modal) modal.remove();

            var select = document.getElementById('plan-superacion-egresado-select');
            if (select) {
                await cargarPlanSuperacionEgresado(select.value);
            }
            loadData();

        } catch (error) {
            console.error('Error al guardar plan de superaci&oacute;n:', error);
            await ModalModule.error('Error al guardar plan: ' + error.message);
        }
    }

    // ============================================================
    // MOSTRAR FORMULARIO ACCI&Oacute;N DEL PLAN
    // ============================================================
    function mostrarFormularioAccionPlan(planId) {
        var container = document.createElement('div');
        container.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 30, 60, 0.6); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            z-index: 100000; padding: 20px;
        `;
        container.innerHTML = `
            <div style="background:white;border-radius:16px;padding:24px;max-width:480px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:modalSlideIn 0.3s ease;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="margin:0;color:#0a1e3c;font-size:18px;">
                        <i class="fas fa-plus-circle" style="color:#2a6b9c;"></i> Nueva Acci&oacute;n del Plan
                    </h3>
                    <button onclick="this.closest('div[style]').remove()" style="background:transparent;border:none;font-size:20px;cursor:pointer;color:#94a3b8;">&times;</button>
                </div>
                <form id="form-accion-plan-superacion">
                    <input type="hidden" id="accion-plan-id" value="${planId}">
                    <div class="form-group">
                        <label>T&iacute;tulo <span class="required">*</span></label>
                        <input type="text" id="accion-plan-titulo" placeholder="Ej: Curso de Liderazgo" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo</label>
                            <select id="accion-plan-tipo">
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
                            <input type="date" id="accion-plan-fecha">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Descripci&oacute;n</label>
                        <textarea rows="2" id="accion-plan-descripcion" placeholder="Breve descripci&oacute;n de la acci&oacute;n..."></textarea>
                    </div>
                    <div style="display:flex;gap:12px;margin-top:16px;">
                        <button type="submit" class="btn btn-primary" style="flex:1;"><i class="fas fa-save"></i> Guardar</button>
                        <button type="button" class="btn btn-outline" style="flex:1;" onclick="this.closest('div[style]').remove()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(container);

        document.getElementById('form-accion-plan-superacion').addEventListener('submit', async function(e) {
            e.preventDefault();
            await guardarAccionPlanSuperacion();
        });
    }

    // ============================================================
    // GUARDAR ACCI&Oacute;N DEL PLAN DE SUPERACI&Oacute;N
    // ============================================================
    async function guardarAccionPlanSuperacion() {
        var planId = document.getElementById('accion-plan-id').value;
        var titulo = document.getElementById('accion-plan-titulo').value.trim();
        var tipo = document.getElementById('accion-plan-tipo').value;
        var fecha = document.getElementById('accion-plan-fecha').value;
        var descripcion = document.getElementById('accion-plan-descripcion').value.trim();

        if (!titulo) {
            await ModalModule.warning('El t&iacute;tulo es obligatorio.');
            return;
        }

        try {
            await DBModule.execute(
                `INSERT INTO acciones_plan (plan_id, titulo, descripcion, tipo, estado, fecha_limite) 
                 VALUES (?, ?, ?, ?, 'pendiente', ?)`,
                [planId, titulo, descripcion, tipo, fecha || null]
            );

            await ModalModule.success('&#9989; Acci&oacute;n agregada al plan de superaci&oacute;n.');
            var modal = document.querySelector('div[style*="position: fixed"]');
            if (modal) modal.remove();

            var select = document.getElementById('plan-superacion-egresado-select');
            if (select) {
                await cargarPlanSuperacionEgresado(select.value);
            }
            loadData();

        } catch (error) {
            console.error('Error al guardar acci&oacute;n:', error);
            await ModalModule.error('Error al guardar acci&oacute;n: ' + error.message);
        }
    }

    // ============================================================
    // CARGAR EGRESADOS PARA EL PLAN DE SUPERACI&Oacute;N
    // ============================================================
    async function cargarEgresadosPlanSuperacion() {
        var select = document.getElementById('plan-superacion-egresado-select');
        if (!select) return;

        var egresados = await DBModule.query(
            `SELECT e.id, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             WHERE e.tutor_id = ?
             ORDER BY u.nombre`,
            [tutorId]
        );

        select.innerHTML = '<option value="">-- Selecciona un egresado --</option>';
        egresados.forEach(function(e) {
            select.innerHTML += `<option value="${e.id}">${e.egresado_nombre} (${e.carrera_nombre})</option>`;
        });
    }

    // ============================================================
    // CARGAR TUTORADOS
    // ============================================================
    async function cargarTutorados() {
        var container = document.getElementById('lista-tutorados');
        if (!container) return;

        var egresados = await DBModule.query(
            `SELECT e.*, u.nombre as nombre_usuario, c.nombre as carrera_nombre, ent.nombre as entidad_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             JOIN entidades ent ON e.entidad_id = ent.id 
             WHERE e.tutor_id = ?`,
            [tutorId]
        );

        if (egresados.length === 0) {
            container.innerHTML = '<p class="text-muted">No tienes egresados asignados.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Entidad</th><th>Progreso</th><th>Acci&oacute;n</th></tr></thead><tbody>';
        for (var i = 0; i < egresados.length; i++) {
            var eg = egresados[i];
            var acciones = await DBModule.query(
                'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ? AND tipo = "superacion")',
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
        container.innerHTML = html;

        var listaCompleta = document.getElementById('lista-completa-tutorados');
        if (listaCompleta) {
            var htmlCompleta = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Egresado</th><th>Carrera</th><th>Entidad</th><th>Plan</th><th>Progreso</th></tr></thead><tbody>';
            for (var i = 0; i < egresados.length; i++) {
                var eg = egresados[i];
                var acciones = await DBModule.query(
                    'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ? AND tipo = "superacion")',
                    [eg.id]
                );
                var total = acciones.length;
                var completadas = acciones.filter(function(a) { return a.estado === 'completado'; }).length;
                var pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
                var color = pct >= 80 ? 'green' : pct >= 50 ? 'gold' : 'danger';
                var planActivo = await DBModule.query(
                    'SELECT id FROM planes_superacion WHERE egresado_id = ? AND tipo = "superacion" AND estado = "activo"',
                    [eg.id]
                );
                
                htmlCompleta += '<tr><td>' + (i + 1) + '</td>';
                htmlCompleta += '<td><strong>' + (eg.avatar || '') + ' ' + eg.nombre_usuario + '</strong></td>';
                htmlCompleta += '<td>' + eg.carrera_nombre + '</td>';
                htmlCompleta += '<td>' + eg.entidad_nombre + '</td>';
                htmlCompleta += '<td>' + (planActivo.length > 0 ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-danger">Sin plan</span>') + '</td>';
                htmlCompleta += '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + pct + '%;"></div></div><span class="progress-pct">' + pct + '%</span></div></td></tr>';
            }
            htmlCompleta += '</tbody></table></div>';
            listaCompleta.innerHTML = htmlCompleta;
        }
    }

    // ============================================================
    // REGISTRAR TUTORIA - CON EMOJIS HTML ENTITIES
    // ============================================================
    function renderRegistrarTutoria() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-pen-to-square"></i> Registrar Tutor&iacute;a</h2>
                <div class="breadcrumb"><i class="fas fa-user-tie"></i> Tutor</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-plus-circle"></i> Nueva Tutor&iacute;a</div>
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
                        <label>Resumen de la tutor&iacute;a <span class="required">*</span></label>
                        <textarea rows="4" id="tutoria-resumen" placeholder="Describe los temas tratados, acuerdos y pr&oacute;ximos pasos..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Acuerdos</label>
                        <textarea rows="2" id="tutoria-acuerdos" placeholder="Acuerdos alcanzados durante la tutor&iacute;a..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Pr&oacute;xima Tutor&iacute;a</label>
                        <input type="date" id="tutoria-proxima">
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar tutor&iacute;a</button>
                </form>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-clock-rotate-left"></i> &Uacute;ltimas Tutor&iacute;as Registradas <span style="font-size:12px;color:#94a3b8;font-weight:400;">(Clic para ver detalles)</span></div>
                <div id="ultimas-tutorias">
                    <p class="text-muted">No hay tutor&iacute;as registradas recientemente.</p>
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
    // CARGAR &Uacute;LTIMAS TUTOR&Iacute;AS
    // ============================================================
    async function cargarUltimasTutorias() {
        var container = document.getElementById('ultimas-tutorias');
        if (!container) return;

        var tutorias = await DBModule.query(
            `SELECT t.*, u.nombre as egresado_nombre 
             FROM tutorias t 
             JOIN egresados e ON t.egresado_id = e.id 
             JOIN usuarios u ON e.usuario_id = u.id 
             WHERE t.tutor_id = ? 
             ORDER BY t.fecha DESC 
             LIMIT 10`,
            [tutorId]
        );

        if (tutorias.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay tutor&iacute;as registradas recientemente.</p>';
            return;
        }

        var html = '';
        tutorias.forEach(function(t) {
            html += '<div class="timeline-item tutoria-item" style="cursor:pointer;" onclick="TutorModule.verDetalleTutoria(' + t.id + ')">';
            html += '<div class="timeline-dot done"></div>';
            html += '<div class="timeline-content">';
            html += '<div class="title">' + t.egresado_nombre + ' - ' + t.fecha + '</div>';
            html += '<div class="desc">' + (t.resumen ? t.resumen.substring(0, 80) + (t.resumen.length > 80 ? '...' : '') : 'Sin resumen') + '</div>';
            if (t.proxima_tutoria) html += '<div class="date">Pr&oacute;xima: ' + t.proxima_tutoria + '</div>';
            html += '<div style="font-size:11px;color:#4a9ad9;margin-top:4px;"><i class="fas fa-hand-pointer"></i> Clic para ver detalles</div>';
            html += '</div></div>';
        });
        container.innerHTML = html;
    }

    // ============================================================
    // CARGAR HISTORIAL DE EVALUACIONES
    // ============================================================
    async function cargarHistorialEvaluaciones() {
        var container = document.getElementById('historial-evaluaciones-tutor');
        if (!container) return;

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
            container.innerHTML = '<p class="text-muted">No hay evaluaciones registradas.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Dimensi&oacute;n</th><th>Puntaje</th><th>Fecha</th><th>Acci&oacute;n</th></tr></thead><tbody>';
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
        container.innerHTML = html;
    }

    // ============================================================
    // EVALUAR EGRESADO
    // ============================================================
    function renderEvaluar() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Evaluar Egresado</h2>
                <div class="breadcrumb">Evaluaci&oacute;n de competencias</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Seleccionar egresado</div>
                <div id="lista-evaluar">
                    <p class="text-muted">Cargando egresados...</p>
                </div>
            </div>

            <div id="formulario-evaluacion" style="display:none;">
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas fa-edit"></i> Evaluaci&oacute;n de <span id="eval-egresado-nombre">Egresado</span></div>
                    <form id="form-evaluacion">
                        <input type="hidden" id="eval-egresado-id">

                        <fieldset>
                            <legend>Competencias Acad&eacute;micas</legend>
                            <div class="form-group">
                                <label>1. Nivel de actualizaci&oacute;n y dominio <span class="required">*</span></label>
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
                                <label>3. Valores &eacute;ticos y compromiso <span class="required">*</span></label>
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
                            <legend>Impacto en el Desempe&ntilde;o</legend>
                            <div class="form-group">
                                <label>4. Aplicaci&oacute;n de conocimientos <span class="required">*</span></label>
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
                                <label>5. Autonom&iacute;a y participaci&oacute;n <span class="required">*</span></label>
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
                                <label>6. Adaptaci&oacute;n a nuevos entornos <span class="required">*</span></label>
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
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar evaluaci&oacute;n</button>
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
                <div class="breadcrumb">Asignaci&oacute;n de egresados a tutores</div>
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
    // CARGAR EGRESADOS PARA SELECTS
    // ============================================================
    async function cargarEgresadosParaSelects() {
        try {
            var misEgresados = await DBModule.query(
                `SELECT e.id, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
                 FROM egresados e 
                 JOIN usuarios u ON e.usuario_id = u.id 
                 JOIN carreras c ON e.carrera_id = c.id 
                 WHERE e.tutor_id = ?
                 ORDER BY u.nombre`,
                [tutorId]
            );

            var selectTutoria = document.getElementById('tutoria-egresado');
            if (selectTutoria) {
                selectTutoria.innerHTML = '<option value="">Selecciona un egresado...</option>';
                misEgresados.forEach(function(e) {
                    selectTutoria.innerHTML += `<option value="${e.id}">${e.egresado_nombre} (${e.carrera_nombre})</option>`;
                });
            }

            var selectEvaluar = document.getElementById('lista-evaluar');
            if (selectEvaluar) {
                if (misEgresados.length === 0) {
                    selectEvaluar.innerHTML = '<p class="text-muted">No tienes egresados asignados.</p>';
                } else {
                    var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Progreso</th><th>Acciones</th></tr></thead><tbody>';
                    for (var i = 0; i < misEgresados.length; i++) {
                        var eg = misEgresados[i];
                        var acciones = await DBModule.query(
                            'SELECT * FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ? AND tipo = "superacion")',
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
                        
                        html += '<tr><td><strong>' + eg.egresado_nombre + '</strong></td>';
                        html += '<td>' + eg.carrera_nombre + '</td>';
                        html += '<td><div class="progress-bar"><div class="progress-track"><div class="progress-fill ' + color + '" style="width:' + pct + '%;"></div></div><span class="progress-pct">' + pct + '%</span></div></td>';
                        html += '<td>';
                        html += '<button class="btn btn-sm btn-primary btn-evaluar" data-id="' + eg.id + '" data-nombre="' + eg.egresado_nombre + '"><i class="fas fa-edit"></i> Evaluar</button> ';
                        if (tieneEval) {
                            html += '<button class="btn btn-sm btn-info" onclick="TutorModule.verEvaluaciones(' + eg.id + ', \'' + eg.egresado_nombre + '\')"><i class="fas fa-eye"></i> Ver</button>';
                        }
                        html += '</td></tr>';
                    }
                    html += '</tbody></table></div>';
                    selectEvaluar.innerHTML = html;
                    
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

            await cargarEgresadosPlanSuperacion();
            await cargarEgresadosSinTutor();
            await cargarMisEgresadosAsignados();

        } catch (error) {
            console.error('Error al cargar egresados para selects:', error);
        }
    }

    // ============================================================
    // CARGAR EGRESADOS SIN TUTOR
    // ============================================================
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

        var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Acci&oacute;n</th></tr></thead><tbody>';
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

    // ============================================================
    // CARGAR MIS EGRESADOS ASIGNADOS
    // ============================================================
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

        var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Carrera</th><th>Acci&oacute;n</th></tr></thead><tbody>';
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

    // ============================================================
    // ASIGNAR EGRESADO
    // ============================================================
    async function asignarEgresado(egresadoId) {
        var confirmado = await ModalModule.confirm('&#10067;Deseas asignar a este egresado como tutorado?', 'Asignar Egresado');
        if (!confirmado) return;
        try {
            await DBModule.execute(
                'UPDATE egresados SET tutor_id = ? WHERE id = ?',
                [tutorId, egresadoId]
            );

            var plan = await DBModule.query(
                'SELECT id FROM planes_superacion WHERE egresado_id = ? AND tipo = "superacion" AND estado = "activo"',
                [egresadoId]
            );
            
            if (plan.length === 0) {
                await DBModule.execute(
                    `INSERT INTO planes_superacion (egresado_id, tutor_id, anio_plan, tipo, estado, progreso, fecha_inicio) 
                     VALUES (?, ?, strftime('%Y', 'now'), 'superacion', 'activo', 0, date('now'))`,
                    [egresadoId, tutorId]
                );
            } else {
                await DBModule.execute(
                    'UPDATE planes_superacion SET progreso = 0 WHERE id = ?',
                    [plan[0].id]
                );
            }
            
            await ModalModule.success('&#9989; Egresado asignado correctamente con progreso 0%.');
            loadData();
            cargarEgresadosSinTutor();
            cargarMisEgresadosAsignados();
        } catch (error) {
            await ModalModule.error('Error al asignar: ' + error.message);
        }
    }

    // ============================================================
    // REMOVER EGRESADO
    // ============================================================
    async function removerEgresado(egresadoId) {
        var confirmado = await ModalModule.confirm('&#10067;Est&aacute;s seguro de que quieres remover a este egresado de tus tutorados?', 'Remover Egresado');
        if (!confirmado) return;
        try {
            await DBModule.execute(
                'UPDATE egresados SET tutor_id = NULL WHERE id = ?',
                [egresadoId]
            );
            await ModalModule.success('&#9989; Egresado removido correctamente.');
            loadData();
            cargarEgresadosSinTutor();
            cargarMisEgresadosAsignados();
        } catch (error) {
            await ModalModule.error('Error al remover: ' + error.message);
        }
    }

    // ============================================================
    // REGISTRAR TUTORIA
    // ============================================================
    async function registrarTutoria() {
        try {
            var egresadoId = document.getElementById('tutoria-egresado').value;
            var fecha = document.getElementById('tutoria-fecha').value;
            var resumen = document.getElementById('tutoria-resumen').value.trim();
            var acuerdos = document.getElementById('tutoria-acuerdos').value.trim();
            var proxima = document.getElementById('tutoria-proxima').value;

            if (!egresadoId || !fecha || !resumen || resumen.length < 5) {
                await ModalModule.warning('Completa todos los campos requeridos.');
                return;
            }

            var user = AuthModule.getCurrentUser();
            var tutorResult = await DBModule.query(
                'SELECT id FROM tutores WHERE usuario_id = ?',
                [user.id]
            );
            if (tutorResult.length === 0) {
                await ModalModule.error('No se encontr&oacute; el perfil de tutor.');
                return;
            }
            var tutorIdActual = tutorResult[0].id;

            var egresado = await DBModule.query(
                'SELECT e.*, u.nombre as egresado_nombre, u.email as egresado_email FROM egresados e JOIN usuarios u ON e.usuario_id = u.id WHERE e.id = ?',
                [egresadoId]
            );
            if (egresado.length === 0) {
                await ModalModule.error('No se encontr&oacute; el egresado.');
                return;
            }
            var egresadoData = egresado[0];

            await DBModule.execute(
                `INSERT INTO tutorias (egresado_id, tutor_id, fecha, resumen, acuerdos, proxima_tutoria, estado, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, 'completada', datetime('now'))`,
                [egresadoId, tutorIdActual, fecha, resumen, acuerdos || null, proxima || null]
            );

            var tutoriaId = await DBModule.query('SELECT last_insert_rowid() as id');
            if (tutoriaId.length > 0) {
                await DBModule.execute(
                    `INSERT INTO historial_tutorias (tutoria_id, tipo, mensaje, fecha) 
                     VALUES (?, 'registro', ?, datetime('now'))`,
                    [tutoriaId[0].id, 'Tutor&iacute;a registrada por el tutor: ' + resumen.substring(0, 50)]
                );
            }

            await actualizarProgresoEgresado(egresadoId);

            if (NotificationsModule && egresadoData.egresado_email) {
                try {
                    var asunto = 'Nueva tutor&iacute;a registrada - SISPE';
                    var mensaje = 'Se ha registrado una tutor&iacute;a para ti.\n\n' +
                                  'Fecha: ' + fecha + '\n' +
                                  'Resumen: ' + resumen + '\n' +
                                  (acuerdos ? 'Acuerdos: ' + acuerdos + '\n' : '') +
                                  (proxima ? 'Pr&oacute;xima tutor&iacute;a: ' + proxima + '\n' : '') +
                                  '\nEnlace: ' + window.location.origin + '/sispe/#tutorias';
                    await NotificationsModule.sendEmail(
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

            await NotificationsModule.createNotification(
                egresadoData.usuario_id,
                'tutoria',
                'Tutor&iacute;a registrada para el ' + fecha + '. Revisa los detalles.',
                '#tutorias'
            );

            await ModalModule.success('&#9989; Tutor&iacute;a registrada correctamente.');

            var formTutoria = document.getElementById('form-registrar-tutoria');
            if (formTutoria) {
                formTutoria.reset();
                document.getElementById('tutoria-fecha').value = new Date().toISOString().split('T')[0];
            }
            loadData();
        } catch (error) {
            console.error('Error al registrar tutor&iacute;a:', error);
            await ModalModule.error('Error al registrar tutor&iacute;a: ' + error.message);
        }
    }

    // ============================================================
    // ACTUALIZAR PROGRESO
    // ============================================================
    async function actualizarProgresoEgresado(egresadoId) {
        try {
            var acciones = await DBModule.query(
                'SELECT COUNT(*) as total FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ? AND tipo = "superacion")',
                [egresadoId]
            );
            var total = acciones[0]?.total || 0;

            var completadas = await DBModule.query(
                'SELECT COUNT(*) as total FROM acciones_plan WHERE plan_id IN (SELECT id FROM planes_superacion WHERE egresado_id = ? AND tipo = "superacion") AND estado = "completado"',
                [egresadoId]
            );
            var completadasTotal = completadas[0]?.total || 0;

            var pct = total > 0 ? Math.round((completadasTotal / total) * 100) : 0;

            await DBModule.execute(
                'UPDATE planes_superacion SET progreso = ? WHERE egresado_id = ? AND tipo = "superacion" AND estado = "activo"',
                [pct, egresadoId]
            );
            return pct;
        } catch (error) {
            console.error('Error al actualizar progreso:', error);
            return 0;
        }
    }

    // ============================================================
    // EVALUAR EGRESADO
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
                'INSERT INTO evaluaciones (egresado_id, tutor_id, tipo, dimension, puntaje, comentario, fecha) VALUES (?, ?, "heteroevaluacion", "Evaluaci&oacute;n Integral", ?, ?, date("now"))',
                [egresadoId, tutorId, promedio, comentario || 'Evaluaci&oacute;n completada.']
            );

            try {
                await DBModule.execute(
                    'INSERT INTO historial_evaluaciones (egresado_id, competencia_id, puntuacion_nueva, fecha_cambio, observaciones) VALUES (?, ?, ?, ?, ?)',
                    [egresadoId, 1, promedio, new Date().toISOString(), 'Evaluaci&oacute;n integral completada']
                );
            } catch (histError) {
                console.warn('&#9888; No se pudo guardar en historial_evaluaciones:', histError);
            }

            await actualizarProgresoEgresado(egresadoId);

            await ModalModule.success('Evaluaci&oacute;n guardada. Puntaje: ' + promedio + '/5. Progreso actualizado.');
            document.getElementById('formulario-evaluacion').style.display = 'none';
            document.getElementById('form-evaluacion').reset();
            loadData();
        } catch (error) {
            console.error('Error al guardar evaluaci&oacute;n:', error);
            await ModalModule.error('Error al guardar evaluaci&oacute;n: ' + error.message);
        }
    }

    // ============================================================
    // VER EGRESADO (MODAL)
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
                await ModalModule.warning('No se encontr&oacute; el egresado.');
                return;
            }

            var eg = egresado[0];

            var plan = await DBModule.query(
                'SELECT * FROM planes_superacion WHERE egresado_id = ? AND tipo = "superacion" AND estado = "activo"',
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
                <div style="max-height:55vh;overflow-y:auto;padding-right:4px;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <div style="font-size:36px;">${eg.avatar || '&#128101;'}</div>
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
                    </div>

                    ${plan.length > 0 ? `
                        <div style="background:#f8fafc;padding:10px;border-radius:6px;margin-bottom:10px;font-size:13px;">
                            <strong>&#128203; Plan de Superaci&oacute;n:</strong> 
                            <span style="color:${plan[0].progreso >= 80 ? '#1a8a4a' : plan[0].progreso >= 50 ? '#d48a2a' : '#b33a4a'};font-weight:700;">
                                ${plan[0].progreso || 0}%
                            </span>
                            ${plan[0].observaciones ? `<br><span style="color:#64748b;font-size:12px;">${plan[0].observaciones}</span>` : ''}
                        </div>
                    ` : ''}

                    ${acciones.length > 0 ? `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">&#128203; Acciones (${acciones.length})</div>
                            ${acciones.map(function(a) {
                                var estadoClass = a.estado === 'completado' ? 'badge-success' : a.estado === 'en_progreso' ? 'badge-warning' : 'badge-danger';
                                return `<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid #e2e8f0;font-size:12px;">
                                    <span>${a.icono || '&#128203;'} ${a.titulo}</span>
                                    <span><span class="badge ${estadoClass}" style="font-size:10px;">${a.estado || 'pendiente'}</span></span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    ${evaluaciones.length > 0 ? `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">&#11088; Evaluaciones (${evaluaciones.length})</div>
                            ${evaluaciones.map(function(e) {
                                var color = e.puntaje >= 4 ? '#1a8a4a' : e.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
                                return `<div style="display:flex;justify-content:space-between;padding:3px 6px;border-bottom:1px solid #e2e8f0;font-size:12px;">
                                    <span>${e.dimension || 'Evaluaci&oacute;n'}</span>
                                    <span style="color:${color};font-weight:700;">${e.puntaje}/5</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    ${tutorias.length > 0 ? `
                        <div>
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">&#128221; Tutor&iacute;as (${tutorias.length})</div>
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
                title: '&#128101; Detalles del Egresado',
                message: modalContent,
                icon: '&#128101;',
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
    // VER DETALLES DE TUTOR&Iacute;A (MODAL)
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
                await ModalModule.warning('No se encontr&oacute; la tutor&iacute;a.');
                return;
            }

            var t = tutoria[0];

            var modalContent = `
                <div style="max-height:55vh;overflow-y:auto;padding-right:4px;">
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
                        <div style="font-size:13px;font-weight:600;color:#0a1e3c;">&#128221; Resumen</div>
                        <div style="background:#f8fafc;padding:10px;border-radius:6px;font-size:13px;line-height:1.5;">
                            ${t.resumen || 'Sin resumen'}
                        </div>
                    </div>

                    ${t.acuerdos ? `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">&#129309; Acuerdos</div>
                            <div style="background:#f8fafc;padding:10px;border-radius:6px;font-size:13px;line-height:1.5;">
                                ${t.acuerdos}
                            </div>
                        </div>
                    ` : ''}

                    ${t.proxima_tutoria ? `
                        <div>
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">&#128197; Pr&oacute;xima Tutor&iacute;a</div>
                            <div style="background:#f8fafc;padding:10px;border-radius:6px;font-size:13px;">
                                ${t.proxima_tutoria}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;

            await ModalModule.showModal({
                title: '&#128221; Detalles de la Tutor&iacute;a',
                message: modalContent,
                icon: '&#128221;',
                type: 'info',
                confirmText: 'Cerrar',
                showCancel: false
            });

        } catch (error) {
            console.error('Error al ver tutor&iacute;a:', error);
            await ModalModule.error('Error al cargar los detalles de la tutor&iacute;a.');
        }
    }

    // ============================================================
    // VER DETALLES DE EVALUACI&Oacute;N (MODAL)
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
                await ModalModule.warning('No se encontr&oacute; la evaluaci&oacute;n.');
                return;
            }

            var ev = evaluacion[0];
            var color = ev.puntaje >= 4 ? '#1a8a4a' : ev.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
            var estrellas = '&#11088;'.repeat(Math.min(ev.puntaje, 5)) + '&#9734;'.repeat(Math.max(0, 5 - ev.puntaje));

            var modalContent = `
                <div style="max-height:55vh;overflow-y:auto;padding-right:4px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Egresado:</span> ${ev.egresado_nombre}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Tutor:</span> ${ev.tutor_nombre || 'No especificado'}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Dimensi&oacute;n:</span> ${ev.dimension || 'General'}
                        </div>
                        <div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:13px;">
                            <span style="color:#94a3b8;">Fecha:</span> ${ev.fecha || ev.created_at || 'Sin fecha'}
                        </div>
                    </div>

                    <div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;margin-bottom:12px;">
                        <div style="font-size:36px;font-weight:800;color:${color};">${ev.puntaje}/5</div>
                        <div style="font-size:20px;">${estrellas}</div>
                        <div style="font-size:13px;color:#64748b;">
                            ${ev.puntaje >= 4 ? '&#127942; Excelente desempe&ntilde;o' : ev.puntaje >= 3 ? '&#128221; Buen desempe&ntilde;o' : '&#128680; &Aacute;reas de mejora'}
                        </div>
                    </div>

                    ${ev.comentario ? `
                        <div>
                            <div style="font-size:13px;font-weight:600;color:#0a1e3c;">&#128221; Comentarios</div>
                            <div style="background:#f8fafc;padding:10px;border-radius:6px;font-size:13px;line-height:1.5;">
                                ${ev.comentario}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;

            await ModalModule.showModal({
                title: '&#11088; Detalles de la Evaluaci&oacute;n',
                message: modalContent,
                icon: '&#11088;',
                type: 'info',
                confirmText: 'Cerrar',
                showCancel: false
            });

        } catch (error) {
            console.error('Error al ver evaluaci&oacute;n:', error);
            await ModalModule.error('Error al cargar los detalles de la evaluaci&oacute;n.');
        }
    }

    // ============================================================
    // VER EVALUACIONES DE UN EGRESADO
    // ============================================================
    async function verEvaluaciones(egresadoId, egresadoNombre) {
        try {
            var evaluaciones = await DBModule.query(
                'SELECT * FROM evaluaciones WHERE egresado_id = ? ORDER BY fecha DESC',
                [egresadoId]
            );

            if (evaluaciones.length === 0) {
                await ModalModule.info('Este egresado no tiene evaluaciones registradas.', 'Sin evaluaciones');
                return;
            }

            var modalContent = `
                <div style="max-height:50vh;overflow-y:auto;padding-right:4px;">
                    <p style="color:#64748b;font-size:13px;margin-bottom:10px;">
                        Mostrando <strong>${evaluaciones.length}</strong> evaluaciones de <strong>${egresadoNombre}</strong>
                    </p>
                    ${evaluaciones.map(function(e) {
                        var color = e.puntaje >= 4 ? '#1a8a4a' : e.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
                        var estrellas = '&#11088;'.repeat(Math.min(e.puntaje, 5)) + '&#9734;'.repeat(Math.max(0, 5 - e.puntaje));
                        return `<div style="background:#f8fafc;padding:10px;border-radius:6px;margin-bottom:8px;border-left:4px solid ${color};">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-weight:600;font-size:14px;">${e.dimension || 'Evaluaci&oacute;n'}</div>
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
                title: '&#11088; Evaluaciones de ' + egresadoNombre,
                message: modalContent,
                icon: '&#11088;',
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
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
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

        var selectPlan = document.getElementById('plan-superacion-egresado-select');
        if (selectPlan) {
            selectPlan.addEventListener('change', function() {
                if (this.value) {
                    cargarPlanSuperacionEgresado(this.value);
                } else {
                    document.getElementById('plan-superacion-container').innerHTML = '<p class="text-muted">Selecciona un egresado para ver o definir su plan de superaci&oacute;n.</p>';
                }
            });
        }
    }

    window.TutorModule = window.TutorModule || {};
    window.TutorModule.verEgresado = verEgresado;
    window.TutorModule.verDetalleTutoria = verDetalleTutoria;
    window.TutorModule.verDetalleEvaluacion = verDetalleEvaluacion;
    window.TutorModule.verEvaluaciones = verEvaluaciones;
    window.TutorModule.asignarEgresado = asignarEgresado;
    window.TutorModule.removerEgresado = removerEgresado;
    window.TutorModule.cargarPlanSuperacionEgresado = cargarPlanSuperacionEgresado;
    window.TutorModule.mostrarFormularioPlanSuperacion = mostrarFormularioPlanSuperacion;
    window.TutorModule.mostrarFormularioAccionPlan = mostrarFormularioAccionPlan;

    return {
        navigate: navigate,
        verEgresado: verEgresado,
        verDetalleTutoria: verDetalleTutoria,
        verDetalleEvaluacion: verDetalleEvaluacion,
        verEvaluaciones: verEvaluaciones,
        registrarTutoria: registrarTutoria,
        asignarEgresado: asignarEgresado,
        removerEgresado: removerEgresado,
        evaluarEgresado: evaluarEgresado,
        cargarPlanSuperacionEgresado: cargarPlanSuperacionEgresado,
        mostrarFormularioPlanSuperacion: mostrarFormularioPlanSuperacion,
        mostrarFormularioAccionPlan: mostrarFormularioAccionPlan
    };

})();

window.TutorModule = TutorModule;
console.log('&#9989; TutorModule cargado correctamente.');