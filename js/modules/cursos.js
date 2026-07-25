// ============================================================
// SISPE - cursos.js
// Módulo de Gestión de Cursos
// RUTA: js/modules/cursos.js
// ============================================================

const CursosModule = (function() {
    'use strict';

    function navigate(page, breadcrumb) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = '';

        switch(page) {
            case 'cursos':
                content = renderCursos();
                break;
            case 'mis-cursos':
                content = renderMisCursos();
                break;
            default:
                content = renderCursos();
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
            await cargarCursos();
            await cargarEstadisticas();
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    async function cargarCursos() {
        var container = document.getElementById('lista-cursos');
        if (!container) return;

        var cursos = await DBModule.query(
            'SELECT * FROM cursos ORDER BY titulo'
        );

        if (cursos.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay cursos registrados.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Título</th><th>Tipo</th><th>Modalidad</th><th>Duración</th><th>Nivel</th><th>Acciones</th></tr></thead><tbody>';
        cursos.forEach(c => {
            html += `<tr>
                <td><strong>${c.titulo}</strong><br><span style="font-size:12px;color:#64748b;">${c.descripcion || ''}</span></td>
                <td><span class="badge badge-info">${c.tipo || 'General'}</span></td>
                <td>${c.modalidad || 'Presencial'}</td>
                <td>${c.duracion_horas || 'N/A'} hrs</td>
                <td><span class="badge ${c.nivel === 'avanzado' ? 'badge-success' : c.nivel === 'intermedio' ? 'badge-warning' : 'badge-info'}">${c.nivel || 'Básico'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="CursosModule.editarCurso(${c.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="CursosModule.eliminarCurso(${c.id})"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-sm btn-success" onclick="CursosModule.inscribirEgresado(${c.id})"><i class="fas fa-user-plus"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async function cargarEstadisticas() {
        try {
            var total = await DBModule.query('SELECT COUNT(*) as total FROM cursos');
            var totalEl = document.getElementById('total-cursos');
            if (totalEl) totalEl.textContent = total[0]?.total || 0;

            var porTipo = await DBModule.query(
                'SELECT tipo, COUNT(*) as total FROM cursos GROUP BY tipo'
            );
            var tipoEl = document.getElementById('cursos-por-tipo');
            if (tipoEl) {
                var html = '';
                porTipo.forEach(t => {
                    html += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;">
                        <span>${t.tipo || 'General'}</span>
                        <span class="badge badge-primary">${t.total}</span>
                    </div>`;
                });
                tipoEl.innerHTML = html || '<p class="text-muted">Sin datos</p>';
            }
        } catch (error) {
            console.error('Error en estadísticas:', error);
        }
    }

    function renderCursos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-graduation-cap"></i> Gestión de Cursos</h2>
                <div class="breadcrumb">Catálogo de cursos y capacitaciones</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="CursosModule.mostrarFormulario()">
                    <i class="fas fa-plus"></i> Nuevo Curso
                </button>
            </div>

            <div id="formulario-cursos" style="display:none;"></div>

            <div style="display:grid;grid-template-columns:1fr 3fr;gap:20px;margin-bottom:20px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-pie"></i> Estadísticas</div>
                    <div style="padding:8px 0;">
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;">
                            <span>Total Cursos</span>
                            <span class="badge badge-primary" id="total-cursos">0</span>
                        </div>
                    </div>
                    <div style="margin-top:12px;">
                        <div class="card-title" style="font-size:14px;"><i class="fas fa-layer-group"></i> Por Tipo</div>
                        <div id="cursos-por-tipo"><p class="text-muted">Cargando...</p></div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-list"></i> Lista de Cursos</div>
                    <div id="lista-cursos">
                        <p class="text-muted">Cargando cursos...</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderMisCursos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-book-open"></i> Mis Cursos</h2>
                <div class="breadcrumb">Cursos en los que estoy inscrito</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Mis Cursos</div>
                <div id="mis-cursos-lista">
                    <p class="text-muted">Cargando tus cursos...</p>
                </div>
            </div>
        `;
    }

    function mostrarFormulario(cursoId) {
        var container = document.getElementById('formulario-cursos');
        if (!container) return;

        container.style.display = 'block';

        if (cursoId) {
            DBModule.query('SELECT * FROM cursos WHERE id = ?', [cursoId])
                .then(function(result) {
                    if (result.length > 0) {
                        renderForm(result[0]);
                    }
                });
        } else {
            renderForm(null);
        }

        function renderForm(curso) {
            var isEditing = !!curso;
            container.innerHTML = `
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEditing ? 'Editar' : 'Nuevo'} Curso</div>
                    <form id="form-curso">
                        ${isEditing ? '<input type="hidden" id="curso-id" value="' + curso.id + '">' : ''}
                        <div class="form-row">
                            <div class="form-group">
                                <label>Título <span class="required">*</span></label>
                                <input type="text" id="curso-titulo" value="${isEditing ? curso.titulo : ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Tipo</label>
                                <select id="curso-tipo">
                                    <option value="curso" ${isEditing && curso.tipo === 'curso' ? 'selected' : ''}>Curso</option>
                                    <option value="taller" ${isEditing && curso.tipo === 'taller' ? 'selected' : ''}>Taller</option>
                                    <option value="seminario" ${isEditing && curso.tipo === 'seminario' ? 'selected' : ''}>Seminario</option>
                                    <option value="entrenamiento" ${isEditing && curso.tipo === 'entrenamiento' ? 'selected' : ''}>Entrenamiento</option>
                                    <option value="diplomado" ${isEditing && curso.tipo === 'diplomado' ? 'selected' : ''}>Diplomado</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Modalidad</label>
                                <select id="curso-modalidad">
                                    <option value="presencial" ${isEditing && curso.modalidad === 'presencial' ? 'selected' : ''}>Presencial</option>
                                    <option value="virtual" ${isEditing && curso.modalidad === 'virtual' ? 'selected' : ''}>Virtual</option>
                                    <option value="mixto" ${isEditing && curso.modalidad === 'mixto' ? 'selected' : ''}>Mixto</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Duración (horas)</label>
                                <input type="number" id="curso-duracion" value="${isEditing ? curso.duracion_horas || '' : ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nivel</label>
                                <select id="curso-nivel">
                                    <option value="basico" ${isEditing && curso.nivel === 'basico' ? 'selected' : ''}>Básico</option>
                                    <option value="intermedio" ${isEditing && curso.nivel === 'intermedio' ? 'selected' : ''}>Intermedio</option>
                                    <option value="avanzado" ${isEditing && curso.nivel === 'avanzado' ? 'selected' : ''}>Avanzado</option>
                                    <option value="especializado" ${isEditing && curso.nivel === 'especializado' ? 'selected' : ''}>Especializado</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Entidad Organizadora</label>
                                <input type="text" id="curso-organizador" value="${isEditing ? curso.entidad_organizadora || '' : ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Fecha Inicio</label>
                                <input type="date" id="curso-fecha-inicio" value="${isEditing ? curso.fecha_inicio || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Fecha Fin</label>
                                <input type="date" id="curso-fecha-fin" value="${isEditing ? curso.fecha_fin || '' : ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea rows="3" id="curso-descripcion">${isEditing ? curso.descripcion || '' : ''}</textarea>
                        </div>
                        <div style="display:flex;gap:12px;margin-top:16px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-cursos').style.display='none'">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('form-curso').addEventListener('submit', function(e) {
                e.preventDefault();
                guardarCurso();
            });
        }
    }

    async function guardarCurso() {
        var id = document.getElementById('curso-id')?.value;
        var titulo = document.getElementById('curso-titulo').value.trim();
        var tipo = document.getElementById('curso-tipo').value;
        var modalidad = document.getElementById('curso-modalidad').value;
        var duracion = parseInt(document.getElementById('curso-duracion').value) || null;
        var nivel = document.getElementById('curso-nivel').value;
        var organizador = document.getElementById('curso-organizador').value.trim();
        var fechaInicio = document.getElementById('curso-fecha-inicio').value;
        var fechaFin = document.getElementById('curso-fecha-fin').value;
        var descripcion = document.getElementById('curso-descripcion').value.trim();

        if (!titulo) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showWarning('El título es obligatorio.');
            }
            return;
        }

        try {
            if (id) {
                await DBModule.execute(
                    `UPDATE cursos SET 
                        titulo = ?, tipo = ?, modalidad = ?, duracion_horas = ?, 
                        nivel = ?, entidad_organizadora = ?, fecha_inicio = ?, 
                        fecha_fin = ?, descripcion = ? 
                     WHERE id = ?`,
                    [titulo, tipo, modalidad, duracion, nivel, organizador, fechaInicio || null, fechaFin || null, descripcion, id]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Curso actualizado.', 'success');
                }
            } else {
                await DBModule.execute(
                    `INSERT INTO cursos (titulo, descripcion, tipo, modalidad, duracion_horas, nivel, entidad_organizadora, fecha_inicio, fecha_fin) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [titulo, descripcion, tipo, modalidad, duracion, nivel, organizador, fechaInicio || null, fechaFin || null]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Curso creado.', 'success');
                }
            }
            document.getElementById('formulario-cursos').style.display = 'none';
            loadData();
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error: ' + error.message, 'error');
            }
        }
    }

    function editarCurso(id) {
        mostrarFormulario(id);
    }

    async function eliminarCurso(id) {
        if (!confirm('¿Eliminar este curso?')) return;
        try {
            await DBModule.execute('DELETE FROM cursos WHERE id = ?', [id]);
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Curso eliminado.', 'success');
            }
            loadData();
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al eliminar.', 'error');
            }
        }
    }

    async function inscribirEgresado(cursoId) {
        var egresados = await DBModule.query(
            'SELECT e.id, u.nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id ORDER BY u.nombre'
        );

        var options = egresados.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');

        var container = document.createElement('div');
        container.innerHTML = `
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;">
                <div style="background:white;border-radius:16px;padding:30px;max-width:400px;width:100%;">
                    <h3 style="margin-bottom:16px;">Inscribir Egresado</h3>
                    <div class="form-group">
                        <label>Seleccionar Egresado</label>
                        <select id="inscripcion-egresado" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;">
                            <option value="">Selecciona...</option>
                            ${options}
                        </select>
                    </div>
                    <div style="display:flex;gap:12px;margin-top:16px;">
                        <button class="btn btn-primary" id="btn-inscribir">Inscribir</button>
                        <button class="btn btn-outline" onclick="this.closest('div[style]').remove()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        document.getElementById('btn-inscribir').addEventListener('click', async function() {
            var egresadoId = document.getElementById('inscripcion-egresado').value;
            if (!egresadoId) {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showWarning('Selecciona un egresado.');
                }
                return;
            }

            try {
                await DBModule.execute(
                    'INSERT INTO egresados_cursos (egresado_id, curso_id, fecha_inicio, estado) VALUES (?, ?, date("now"), "inscrito")',
                    [egresadoId, cursoId]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Egresado inscrito correctamente.', 'success');
                }
                container.remove();
            } catch (error) {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al inscribir.', 'error');
                }
            }
        });
    }

    function assignEvents() {}

    return {
        navigate: navigate,
        mostrarFormulario: mostrarFormulario,
        editarCurso: editarCurso,
        eliminarCurso: eliminarCurso,
        inscribirEgresado: inscribirEgresado
    };

})();

window.CursosModule = CursosModule;
console.log('📚 Módulo de Cursos cargado correctamente.');