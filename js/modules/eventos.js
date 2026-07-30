// ============================================================
// SISPE - eventos.js
// Módulo de Gestión de Eventos - CON MODALES
// RUTA: js/modules/eventos.js
// ============================================================

const EventosModule = (function() {
    'use strict';

    function navigate(page, breadcrumb) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = '';

        switch(page) {
            case 'eventos':
                content = renderEventos();
                break;
            case 'mis-eventos':
                content = renderMisEventos();
                break;
            default:
                content = renderEventos();
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
            await cargarEventos();
            await cargarEstadisticas();
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    async function cargarEventos() {
        var container = document.getElementById('lista-eventos');
        if (!container) return;

        var eventos = await DBModule.query(
            'SELECT * FROM eventos ORDER BY fecha_inicio DESC'
        );

        if (eventos.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay eventos registrados.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>Evento</th><th>Tipo</th><th>Fecha</th><th>Lugar</th><th>Organizador</th><th>Acciones</th></tr></thead><tbody>';
        eventos.forEach(e => {
            var fecha = e.fecha_inicio ? (e.fecha_inicio + (e.fecha_fin ? ' - ' + e.fecha_fin : '')) : 'Sin fecha';
            html += `<tr>
                <td><strong>${e.nombre}</strong><br><span style="font-size:12px;color:#64748b;">${e.descripcion || ''}</span></td>
                <td><span class="badge badge-info">${e.tipo || 'General'}</span></td>
                <td>${fecha}</td>
                <td>${e.lugar || 'N/A'}</td>
                <td>${e.entidad_organizadora || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="EventosModule.editarEvento(${e.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="EventosModule.eliminarEvento(${e.id})"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-sm btn-success" onclick="EventosModule.registrarParticipante(${e.id})"><i class="fas fa-user-plus"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async function cargarEstadisticas() {
        try {
            var total = await DBModule.query('SELECT COUNT(*) as total FROM eventos');
            var totalEl = document.getElementById('total-eventos');
            if (totalEl) totalEl.textContent = total[0]?.total || 0;

            var porTipo = await DBModule.query(
                'SELECT tipo, COUNT(*) as total FROM eventos GROUP BY tipo'
            );
            var tipoEl = document.getElementById('eventos-por-tipo');
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

    function renderEventos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-calendar-alt"></i> Gestión de Eventos</h2>
                <div class="breadcrumb">Eventos científicos y académicos</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="EventosModule.mostrarFormulario()">
                    <i class="fas fa-plus"></i> Nuevo Evento
                </button>
            </div>

            <div id="formulario-eventos" style="display:none;"></div>

            <div style="display:grid;grid-template-columns:1fr 3fr;gap:20px;margin-bottom:20px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-pie"></i> Estadísticas</div>
                    <div style="padding:8px 0;">
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;">
                            <span>Total Eventos</span>
                            <span class="badge badge-primary" id="total-eventos">0</span>
                        </div>
                    </div>
                    <div style="margin-top:12px;">
                        <div class="card-title" style="font-size:14px;"><i class="fas fa-layer-group"></i> Por Tipo</div>
                        <div id="eventos-por-tipo"><p class="text-muted">Cargando...</p></div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-list"></i> Lista de Eventos</div>
                    <div id="lista-eventos">
                        <p class="text-muted">Cargando eventos...</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderMisEventos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-calendar-check"></i> Mis Eventos</h2>
                <div class="breadcrumb">Eventos en los que participo</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list-check"></i> Mis Eventos</div>
                <div id="mis-eventos-lista">
                    <p class="text-muted">Cargando tus eventos...</p>
                </div>
            </div>
        `;
    }

    function mostrarFormulario(eventoId) {
        var container = document.getElementById('formulario-eventos');
        if (!container) return;

        container.style.display = 'block';

        if (eventoId) {
            DBModule.query('SELECT * FROM eventos WHERE id = ?', [eventoId])
                .then(function(result) {
                    if (result.length > 0) {
                        renderForm(result[0]);
                    }
                });
        } else {
            renderForm(null);
        }

        function renderForm(evento) {
            var isEditing = !!evento;
            container.innerHTML = `
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEditing ? 'Editar' : 'Nuevo'} Evento</div>
                    <form id="form-evento">
                        ${isEditing ? '<input type="hidden" id="evento-id" value="' + evento.id + '">' : ''}
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nombre <span class="required">*</span></label>
                                <input type="text" id="evento-nombre" value="${isEditing ? evento.nombre : ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Tipo</label>
                                <select id="evento-tipo">
                                    <option value="cientifico" ${isEditing && evento.tipo === 'cientifico' ? 'selected' : ''}>Científico</option>
                                    <option value="academico" ${isEditing && evento.tipo === 'academico' ? 'selected' : ''}>Académico</option>
                                    <option value="cultural" ${isEditing && evento.tipo === 'cultural' ? 'selected' : ''}>Cultural</option>
                                    <option value="deportivo" ${isEditing && evento.tipo === 'deportivo' ? 'selected' : ''}>Deportivo</option>
                                    <option value="social" ${isEditing && evento.tipo === 'social' ? 'selected' : ''}>Social</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Fecha Inicio</label>
                                <input type="date" id="evento-fecha-inicio" value="${isEditing ? evento.fecha_inicio || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Fecha Fin</label>
                                <input type="date" id="evento-fecha-fin" value="${isEditing ? evento.fecha_fin || '' : ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Lugar</label>
                                <input type="text" id="evento-lugar" value="${isEditing ? evento.lugar || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Entidad Organizadora</label>
                                <input type="text" id="evento-organizador" value="${isEditing ? evento.entidad_organizadora || '' : ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>URL (opcional)</label>
                            <input type="url" id="evento-url" value="${isEditing ? evento.url || '' : ''}" placeholder="https://...">
                        </div>
                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea rows="3" id="evento-descripcion">${isEditing ? evento.descripcion || '' : ''}</textarea>
                        </div>
                        <div style="display:flex;gap:12px;margin-top:16px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-eventos').style.display='none'">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('form-evento').addEventListener('submit', function(e) {
                e.preventDefault();
                guardarEvento();
            });
        }
    }

    async function guardarEvento() {
        var id = document.getElementById('evento-id')?.value;
        var nombre = document.getElementById('evento-nombre').value.trim();
        var tipo = document.getElementById('evento-tipo').value;
        var fechaInicio = document.getElementById('evento-fecha-inicio').value;
        var fechaFin = document.getElementById('evento-fecha-fin').value;
        var lugar = document.getElementById('evento-lugar').value.trim();
        var organizador = document.getElementById('evento-organizador').value.trim();
        var url = document.getElementById('evento-url').value.trim();
        var descripcion = document.getElementById('evento-descripcion').value.trim();

        if (!nombre) {
            await ModalModule.warning('El nombre es obligatorio.');
            return;
        }

        try {
            if (id) {
                await DBModule.execute(
                    `UPDATE eventos SET 
                        nombre = ?, tipo = ?, fecha_inicio = ?, fecha_fin = ?, 
                        lugar = ?, entidad_organizadora = ?, url = ?, descripcion = ? 
                     WHERE id = ?`,
                    [nombre, tipo, fechaInicio || null, fechaFin || null, lugar, organizador, url, descripcion, id]
                );
                await ModalModule.success('Evento actualizado.');
            } else {
                await DBModule.execute(
                    `INSERT INTO eventos (nombre, descripcion, tipo, fecha_inicio, fecha_fin, lugar, entidad_organizadora, url) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [nombre, descripcion, tipo, fechaInicio || null, fechaFin || null, lugar, organizador, url]
                );
                await ModalModule.success('Evento creado.');
            }
            document.getElementById('formulario-eventos').style.display = 'none';
            loadData();
        } catch (error) {
            await ModalModule.error('Error: ' + error.message);
        }
    }

    function editarEvento(id) {
        mostrarFormulario(id);
    }

    // ============================================================
    // ELIMINAR EVENTO (CON MODAL)
    // ============================================================
    async function eliminarEvento(id) {
        const confirmado = await ModalModule.confirmDelete('¿Estás seguro de que quieres eliminar este evento?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM eventos WHERE id = ?', [id]);
            await ModalModule.success('Evento eliminado.');
            loadData();
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // REGISTRAR PARTICIPANTE (CON MODAL PERSONALIZADO)
    // ============================================================
    async function registrarParticipante(eventoId) {
        var egresados = await DBModule.query(
            'SELECT e.id, u.nombre FROM egresados e JOIN usuarios u ON e.usuario_id = u.id ORDER BY u.nombre'
        );

        var options = egresados.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');

        var container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 30, 60, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            padding: 20px;
        `;
        container.innerHTML = `
            <div style="background:white;border-radius:16px;padding:30px;max-width:420px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:modalSlideIn 0.3s ease;">
                <h3 style="margin-bottom:16px;color:#0a1e3c;">Registrar Participante</h3>
                <div class="form-group">
                    <label>Seleccionar Egresado</label>
                    <select id="participante-egresado" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">
                        <option value="">Selecciona...</option>
                        ${options}
                    </select>
                </div>
                <div class="form-group">
                    <label>Rol</label>
                    <select id="participante-rol" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">
                        <option value="participante">Participante</option>
                        <option value="ponente">Ponente</option>
                        <option value="organizador">Organizador</option>
                        <option value="invitado">Invitado</option>
                    </select>
                </div>
                <div style="display:flex;gap:12px;margin-top:16px;">
                    <button class="btn btn-primary" id="btn-registrar">Registrar</button>
                    <button class="btn btn-outline" onclick="this.closest('div[style]').remove()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        document.getElementById('btn-registrar').addEventListener('click', async function() {
            var egresadoId = document.getElementById('participante-egresado').value;
            var rol = document.getElementById('participante-rol').value;

            if (!egresadoId) {
                await ModalModule.warning('Selecciona un egresado.');
                return;
            }

            try {
                await DBModule.execute(
                    'INSERT INTO egresados_eventos (egresado_id, evento_id, rol, fecha_participacion) VALUES (?, ?, ?, date("now"))',
                    [egresadoId, eventoId, rol]
                );
                await ModalModule.success('Participante registrado.');
                container.remove();
            } catch (error) {
                await ModalModule.error('Error al registrar.');
            }
        });
    }

    function assignEvents() {}

    return {
        navigate: navigate,
        mostrarFormulario: mostrarFormulario,
        editarEvento: editarEvento,
        eliminarEvento: eliminarEvento,
        registrarParticipante: registrarParticipante
    };

})();

window.EventosModule = EventosModule;
console.log('🎪 Módulo de Eventos cargado correctamente.');