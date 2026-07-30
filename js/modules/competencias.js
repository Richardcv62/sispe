// ============================================================
// SISPE - competencias.js
// Módulo de Gestión de Competencias - CON MODALES
// RUTA: js/modules/competencias.js
// ============================================================

const CompetenciasModule = (function() {
    'use strict';

    function navigate(page, breadcrumb) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = '';

        switch(page) {
            case 'competencias':
                content = renderCompetencias();
                break;
            case 'evaluar-competencias':
                content = renderEvaluarCompetencias();
                break;
            default:
                content = renderCompetencias();
        }

        if (breadcrumb) {
            container.innerHTML = breadcrumb + content;
        } else {
            container.innerHTML = content;
        }
        setTimeout(loadData, 200);
        setTimeout(assignEvents, 100);
    }

    async function loadData() {
        try {
            await cargarCompetencias();
            await cargarEstadisticas();
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    async function cargarCompetencias() {
        var container = document.getElementById('lista-competencias');
        if (!container) return;

        var competencias = await DBModule.query(
            'SELECT * FROM competencias ORDER BY dimension, nombre'
        );

        if (competencias.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay competencias registradas.</p>';
            return;
        }

        var dimensiones = {};
        competencias.forEach(c => {
            if (!dimensiones[c.dimension]) dimensiones[c.dimension] = [];
            dimensiones[c.dimension].push(c);
        });

        var html = '';
        for (var dim in dimensiones) {
            html += `<h4 style="color:#0a1e3c;margin:16px 0 8px;">${dim}</h4>`;
            html += '<div class="table-wrap"><table><thead><tr><th>Competencia</th><th>Categoría</th><th>Nivel Esperado</th><th>Acciones</th></tr></thead><tbody>';
            dimensiones[dim].forEach(c => {
                var nivel = c.nivel_esperado || 3;
                var estrellas = '⭐'.repeat(nivel) + '☆'.repeat(5 - nivel);
                html += `<tr>
                    <td><strong>${c.nombre}</strong><br><span style="font-size:12px;color:#64748b;">${c.descripcion || ''}</span></td>
                    <td><span class="badge badge-info">${c.categoria || 'General'}</span></td>
                    <td>${estrellas}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="CompetenciasModule.editarCompetencia(${c.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="CompetenciasModule.eliminarCompetencia(${c.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            });
            html += '</tbody></table></div>';
        }
        container.innerHTML = html;
    }

    async function cargarEstadisticas() {
        try {
            var total = await DBModule.query('SELECT COUNT(*) as total FROM competencias');
            var totalEl = document.getElementById('total-competencias');
            if (totalEl) totalEl.textContent = total[0]?.total || 0;

            var porDimension = await DBModule.query(
                'SELECT dimension, COUNT(*) as total FROM competencias GROUP BY dimension'
            );
            var dimEl = document.getElementById('competencias-por-dimension');
            if (dimEl) {
                var html = '';
                porDimension.forEach(d => {
                    html += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;">
                        <span>${d.dimension}</span>
                        <span class="badge badge-primary">${d.total}</span>
                    </div>`;
                });
                dimEl.innerHTML = html || '<p class="text-muted">Sin datos</p>';
            }
        } catch (error) {
            console.error('Error en estadísticas:', error);
        }
    }

    function renderCompetencias() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-star"></i> Gestión de Competencias</h2>
                <div class="breadcrumb">Catálogo de competencias profesionales</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="CompetenciasModule.mostrarFormulario()">
                    <i class="fas fa-plus"></i> Nueva Competencia
                </button>
            </div>

            <div id="formulario-competencias" style="display:none;"></div>

            <div style="display:grid;grid-template-columns:1fr 3fr;gap:20px;margin-bottom:20px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-pie"></i> Estadísticas</div>
                    <div style="padding:8px 0;">
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;">
                            <span>Total Competencias</span>
                            <span class="badge badge-primary" id="total-competencias">0</span>
                        </div>
                    </div>
                    <div style="margin-top:12px;">
                        <div class="card-title" style="font-size:14px;"><i class="fas fa-layer-group"></i> Por Dimensión</div>
                        <div id="competencias-por-dimension"><p class="text-muted">Cargando...</p></div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-list"></i> Lista de Competencias</div>
                    <div id="lista-competencias">
                        <p class="text-muted">Cargando competencias...</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderEvaluarCompetencias() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-clipboard-check"></i> Evaluar Competencias</h2>
                <div class="breadcrumb">Evaluación de competencias de egresados</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-user-graduate"></i> Seleccionar Egresado</div>
                <form id="form-seleccionar-egresado">
                    <div class="form-group">
                        <label>Egresado</label>
                        <select id="eval-egresado" required>
                            <option value="">Selecciona un egresado...</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i> Cargar Competencias</button>
                </form>
            </div>

            <div id="evaluacion-container" style="display:none;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-star"></i> Evaluación de <span id="eval-nombre-egresado">Egresado</span></div>
                    <form id="form-evaluar-competencias">
                        <div id="competencias-evaluar"></div>
                        <div style="margin-top:16px;">
                            <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> Guardar Evaluación</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('evaluacion-container').style.display='none'">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-history"></i> Evaluaciones Realizadas</div>
                <div id="historial-evaluaciones">
                    <p class="text-muted">No hay evaluaciones registradas.</p>
                </div>
            </div>
        `;
    }

    function mostrarFormulario(competenciaId) {
        var container = document.getElementById('formulario-competencias');
        if (!container) return;

        container.style.display = 'block';

        if (competenciaId) {
            DBModule.query('SELECT * FROM competencias WHERE id = ?', [competenciaId])
                .then(function(result) {
                    if (result.length > 0) {
                        renderForm(result[0]);
                    }
                });
        } else {
            renderForm(null);
        }

        function renderForm(competencia) {
            var isEditing = !!competencia;
            container.innerHTML = `
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEditing ? 'Editar' : 'Nueva'} Competencia</div>
                    <form id="form-competencia">
                        ${isEditing ? '<input type="hidden" id="competencia-id" value="' + competencia.id + '">' : ''}
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nombre <span class="required">*</span></label>
                                <input type="text" id="comp-nombre" value="${isEditing ? competencia.nombre : ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Dimensión <span class="required">*</span></label>
                                <select id="comp-dimension" required>
                                    <option value="">Selecciona...</option>
                                    <option value="Integracion Institucional" ${isEditing && competencia.dimension === 'Integracion Institucional' ? 'selected' : ''}>Integración Institucional</option>
                                    <option value="Desarrollo de Competencias" ${isEditing && competencia.dimension === 'Desarrollo de Competencias' ? 'selected' : ''}>Desarrollo de Competencias</option>
                                    <option value="Impacto en el Desempeno" ${isEditing && competencia.dimension === 'Impacto en el Desempeno' ? 'selected' : ''}>Impacto en el Desempeño</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Categoría</label>
                                <select id="comp-categoria">
                                    <option value="Conocimientos" ${isEditing && competencia.categoria === 'Conocimientos' ? 'selected' : ''}>Conocimientos</option>
                                    <option value="Habilidades" ${isEditing && competencia.categoria === 'Habilidades' ? 'selected' : ''}>Habilidades</option>
                                    <option value="Valores" ${isEditing && competencia.categoria === 'Valores' ? 'selected' : ''}>Valores</option>
                                    <option value="Actitudes" ${isEditing && competencia.categoria === 'Actitudes' ? 'selected' : ''}>Actitudes</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Nivel Esperado</label>
                                <select id="comp-nivel">
                                    <option value="1" ${isEditing && competencia.nivel_esperado === 1 ? 'selected' : ''}>1 - Básico</option>
                                    <option value="2" ${isEditing && competencia.nivel_esperado === 2 ? 'selected' : ''}>2 - Intermedio Bajo</option>
                                    <option value="3" ${isEditing && competencia.nivel_esperado === 3 ? 'selected' : ''}>3 - Intermedio</option>
                                    <option value="4" ${isEditing && competencia.nivel_esperado === 4 ? 'selected' : ''}>4 - Avanzado</option>
                                    <option value="5" ${isEditing && competencia.nivel_esperado === 5 ? 'selected' : ''}>5 - Experto</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea rows="3" id="comp-descripcion">${isEditing ? competencia.descripcion || '' : ''}</textarea>
                        </div>
                        <div style="display:flex;gap:12px;margin-top:16px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-competencias').style.display='none'">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('form-competencia').addEventListener('submit', function(e) {
                e.preventDefault();
                guardarCompetencia();
            });
        }
    }

    async function guardarCompetencia() {
        var id = document.getElementById('competencia-id')?.value;
        var nombre = document.getElementById('comp-nombre').value.trim();
        var dimension = document.getElementById('comp-dimension').value;
        var categoria = document.getElementById('comp-categoria').value;
        var nivel = parseInt(document.getElementById('comp-nivel').value);
        var descripcion = document.getElementById('comp-descripcion').value.trim();

        if (!nombre || !dimension) {
            await ModalModule.warning('Completa los campos requeridos.');
            return;
        }

        try {
            if (id) {
                await DBModule.execute(
                    'UPDATE competencias SET nombre = ?, dimension = ?, categoria = ?, nivel_esperado = ?, descripcion = ? WHERE id = ?',
                    [nombre, dimension, categoria, nivel, descripcion, id]
                );
                await ModalModule.success('Competencia actualizada.');
            } else {
                await DBModule.execute(
                    'INSERT INTO competencias (nombre, descripcion, dimension, categoria, nivel_esperado) VALUES (?, ?, ?, ?, ?)',
                    [nombre, descripcion, dimension, categoria, nivel]
                );
                await ModalModule.success('Competencia creada.');
            }
            document.getElementById('formulario-competencias').style.display = 'none';
            loadData();
        } catch (error) {
            await ModalModule.error('Error: ' + error.message);
        }
    }

    function editarCompetencia(id) {
        mostrarFormulario(id);
    }

    // ============================================================
    // ELIMINAR COMPETENCIA (CON MODAL)
    // ============================================================
    async function eliminarCompetencia(id) {
        const confirmado = await ModalModule.confirmDelete('¿Estás seguro de que quieres eliminar esta competencia?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM competencias WHERE id = ?', [id]);
            await ModalModule.success('Competencia eliminada.');
            loadData();
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    function assignEvents() {
        var select = document.getElementById('eval-egresado');
        if (select) {
            DBModule.query(
                'SELECT e.id, u.nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id ORDER BY u.nombre'
            ).then(function(egresados) {
                select.innerHTML = '<option value="">Selecciona un egresado...</option>' +
                    egresados.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
            });
        }

        var form = document.getElementById('form-seleccionar-egresado');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                cargarCompetenciasParaEvaluar();
            });
        }

        var formEval = document.getElementById('form-evaluar-competencias');
        if (formEval) {
            formEval.addEventListener('submit', function(e) {
                e.preventDefault();
                guardarEvaluacionCompetencias();
            });
        }
    }

    async function cargarCompetenciasParaEvaluar() {
        var egresadoId = document.getElementById('eval-egresado').value;
        if (!egresadoId) {
            await ModalModule.warning('Selecciona un egresado.');
            return;
        }

        var egresado = await DBModule.query(
            'SELECT u.nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id WHERE e.id = ?',
            [egresadoId]
        );
        document.getElementById('eval-nombre-egresado').textContent = egresado[0]?.nombre || 'Egresado';

        var competencias = await DBModule.query('SELECT * FROM competencias ORDER BY dimension, nombre');
        var container = document.getElementById('competencias-evaluar');
        container.innerHTML = '';

        var dimensiones = {};
        competencias.forEach(c => {
            if (!dimensiones[c.dimension]) dimensiones[c.dimension] = [];
            dimensiones[c.dimension].push(c);
        });

        for (var dim in dimensiones) {
            container.innerHTML += `<h5 style="margin:12px 0 8px;color:#0a1e3c;">${dim}</h5>`;
            dimensiones[dim].forEach(c => {
                container.innerHTML += `
                    <div style="display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid #f1f5f9;">
                        <div style="flex:1;">
                            <strong>${c.nombre}</strong>
                            <span style="font-size:12px;color:#64748b;display:block;">${c.descripcion || ''}</span>
                        </div>
                        <div>
                            <select id="eval-puntaje-${c.id}" style="padding:4px 8px;border:2px solid #e2e8f0;border-radius:6px;">
                                <option value="">Nivel</option>
                                <option value="1">1 - Muy bajo</option>
                                <option value="2">2 - Bajo</option>
                                <option value="3">3 - Adecuado</option>
                                <option value="4">4 - Bueno</option>
                                <option value="5">5 - Excelente</option>
                            </select>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML += `
            <div style="margin-top:16px;">
                <div class="form-group">
                    <label>Evidencias (observaciones)</label>
                    <textarea rows="3" id="eval-evidencias" placeholder="Describe las evidencias observadas..."></textarea>
                </div>
                <input type="hidden" id="eval-egresado-id" value="${egresadoId}">
            </div>
        `;

        document.getElementById('evaluacion-container').style.display = 'block';
        document.getElementById('evaluacion-container').scrollIntoView({ behavior: 'smooth' });
    }

    // ============================================================
    // GUARDAR EVALUACIÓN DE COMPETENCIAS (CON MODAL)
    // ============================================================
    async function guardarEvaluacionCompetencias() {
        var egresadoId = document.getElementById('eval-egresado-id').value;
        var evidencias = document.getElementById('eval-evidencias').value.trim();

        var competencias = await DBModule.query('SELECT id FROM competencias');
        var puntajes = [];
        var total = 0;
        var count = 0;

        competencias.forEach(c => {
            var select = document.getElementById(`eval-puntaje-${c.id}`);
            if (select && select.value) {
                var puntaje = parseInt(select.value);
                puntajes.push({ competencia_id: c.id, puntaje: puntaje });
                total += puntaje;
                count++;
            }
        });

        if (count === 0) {
            await ModalModule.warning('Evalúa al menos una competencia.');
            return;
        }

        var promedio = Math.round(total / count);
        var nivel = promedio >= 4 ? 'alto' : promedio >= 3 ? 'medio' : 'bajo';

        const confirmado = await ModalModule.confirm(
            '¿Guardar evaluación con promedio ' + promedio + '/5 (' + nivel + ')?',
            'Confirmar evaluación'
        );
        if (!confirmado) return;

        try {
            for (var i = 0; i < puntajes.length; i++) {
                await DBModule.execute(
                    'INSERT INTO competencias_evaluadas (egresado_id, competencia_id, puntaje, nivel, evidencia, fecha_evaluacion) VALUES (?, ?, ?, ?, ?, date("now"))',
                    [egresadoId, puntajes[i].competencia_id, puntajes[i].puntaje, nivel, evidencias || null]
                );
            }

            var user = AuthModule.getCurrentUser();
            await DBModule.execute(
                'INSERT INTO evaluaciones (egresado_id, tutor_id, tipo, dimension, puntaje, comentario, fecha) VALUES (?, ?, "evaluacion_competencias", "Competencias", ?, ?, date("now"))',
                [egresadoId, user ? user.id : null, promedio, 'Evaluación de competencias: ' + nivel]
            );

            await ModalModule.success('✅ Evaluación guardada. Promedio: ' + promedio + '/5 (' + nivel + ')');

            document.getElementById('evaluacion-container').style.display = 'none';
            document.getElementById('form-seleccionar-egresado').reset();
            cargarHistorialEvaluaciones();

        } catch (error) {
            await ModalModule.error('Error al guardar: ' + error.message);
        }
    }

    async function cargarHistorialEvaluaciones() {
        var container = document.getElementById('historial-evaluaciones');
        if (!container) return;

        var evaluaciones = await DBModule.query(
            `SELECT ce.*, u.nombre as egresado_nombre, c.nombre as competencia_nombre 
             FROM competencias_evaluadas ce 
             JOIN egresados e ON ce.egresado_id = e.id 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN competencias c ON ce.competencia_id = c.id 
             ORDER BY ce.fecha_evaluacion DESC 
             LIMIT 20`
        );

        if (evaluaciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay evaluaciones registradas.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Egresado</th><th>Competencia</th><th>Puntaje</th><th>Nivel</th><th>Fecha</th></tr></thead><tbody>';
        evaluaciones.forEach(e => {
            var color = e.puntaje >= 4 ? '#1a8a4a' : e.puntaje >= 3 ? '#d48a2a' : '#b33a4a';
            html += `<tr>
                <td><strong>${e.egresado_nombre}</strong></td>
                <td>${e.competencia_nombre}</td>
                <td style="color:${color};font-weight:700;">${e.puntaje}/5</td>
                <td><span class="badge badge-${e.nivel === 'alto' ? 'success' : e.nivel === 'medio' ? 'warning' : 'danger'}">${e.nivel || 'N/A'}</span></td>
                <td>${e.fecha_evaluacion || e.created_at || 'Sin fecha'}</td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    return {
        navigate: navigate,
        mostrarFormulario: mostrarFormulario,
        editarCompetencia: editarCompetencia,
        eliminarCompetencia: eliminarCompetencia
    };

})();

window.CompetenciasModule = CompetenciasModule;
console.log('📊 Módulo de Competencias cargado correctamente.');