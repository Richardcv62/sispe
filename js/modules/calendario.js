// ============================================================
// SISPE - calendario.js
// Módulo de Calendario de Actividades
// RUTA: js/modules/calendario.js
// ============================================================

const CalendarioModule = (function() {
    'use strict';

    var mesActual = new Date().getMonth();
    var añoActual = new Date().getFullYear();
    var diaSeleccionado = null;

    // ============================================================
    // NAVEGACIÓN
    // ============================================================
    function navigate(page, breadcrumb) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = renderCalendario();

        if (breadcrumb) {
            container.innerHTML = breadcrumb + content;
        } else {
            container.innerHTML = content;
        }
        setTimeout(loadData, 200);
        setTimeout(assignEvents, 100);
    }

    // ============================================================
    // CARGAR DATOS
    // ============================================================
    async function loadData() {
        try {
            await renderizarCalendario();
            await cargarEventosDelDia();
            await cargarProximosEventos();
        } catch (error) {
            console.error('Error al cargar calendario:', error);
        }
    }

    // ============================================================
    // RENDER: CALENDARIO PRINCIPAL
    // ============================================================
    function renderCalendario() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-calendar-alt"></i> Calendario de Actividades</h2>
                <div class="breadcrumb">Gestiona tus eventos y actividades</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="CalendarioModule.agregarEvento()">
                    <i class="fas fa-plus"></i> Nuevo evento
                </button>
                <button class="btn btn-outline" onclick="CalendarioModule.hoy()">
                    <i class="fas fa-calendar-day"></i> Hoy
                </button>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <!-- Calendario -->
                <div class="card">
                    <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;">
                        <span id="calendario-mes-titulo">${getNombreMes(mesActual)} ${añoActual}</span>
                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-sm btn-outline" onclick="CalendarioModule.mesAnterior()">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="CalendarioModule.mesSiguiente()">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <div id="calendario-grid" style="margin-top:8px;"></div>
                </div>

                <!-- Eventos del día -->
                <div class="card">
                    <div class="card-title">
                        <i class="fas fa-list-check"></i> 
                        Eventos del <span id="calendario-fecha-seleccionada">${new Date().toLocaleDateString('es-CU')}</span>
                    </div>
                    <div id="calendario-eventos-dia">
                        <p class="text-muted">Selecciona un día en el calendario para ver sus eventos.</p>
                    </div>
                </div>
            </div>

            <!-- Próximos eventos -->
            <div class="card" style="margin-top:20px;">
                <div class="card-title"><i class="fas fa-clock"></i> Próximos eventos</div>
                <div id="calendario-proximos-eventos">
                    <p class="text-muted">Cargando próximos eventos...</p>
                </div>
            </div>

            <!-- Formulario para agregar evento (inicialmente oculto) -->
            <div id="calendario-formulario-container" style="display:none;"></div>
        `;
    }

    // ============================================================
    // RENDERIZAR CALENDARIO (GRID DE DÍAS)
    // ============================================================
    async function renderizarCalendario() {
        var container = document.getElementById('calendario-grid');
        if (!container) return;

        var user = AuthModule.getCurrentUser();
        if (!user) {
            container.innerHTML = '<p class="text-muted">No has iniciado sesión.</p>';
            return;
        }

        // Obtener eventos del mes
        var primerDia = new Date(añoActual, mesActual, 1);
        var ultimoDia = new Date(añoActual, mesActual + 1, 0);
        var primerDiaSemana = primerDia.getDay() || 7; // 1=Lun, 7=Dom

        var fechaInicio = `${añoActual}-${String(mesActual+1).padStart(2,'0')}-01`;
        var fechaFin = `${añoActual}-${String(mesActual+1).padStart(2,'0')}-${String(ultimoDia.getDate()).padStart(2,'0')}`;

        var eventos = await DBModule.query(
            `SELECT * FROM eventos_calendario 
             WHERE DATE(fecha_inicio) >= ? AND DATE(fecha_inicio) <= ?
             AND (usuario_id = ? OR egresado_id = (SELECT id FROM egresados WHERE usuario_id = ?) OR tutor_id = (SELECT id FROM tutores WHERE usuario_id = ?))
             ORDER BY fecha_inicio`,
            [fechaInicio, fechaFin, user.id, user.id, user.id]
        );

        // Crear mapa de eventos por día
        var eventosPorDia = {};
        eventos.forEach(function(e) {
            var dia = new Date(e.fecha_inicio).getDate();
            if (!eventosPorDia[dia]) eventosPorDia[dia] = [];
            eventosPorDia[dia].push(e);
        });

        // Días de la semana
        var diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        var html = `
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-weight:600;font-size:12px;color:#94a3b8;padding:4px 0;">
                ${diasSemana.map(d => `<div>${d}</div>`).join('')}
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;">`;

        // Espacios vacíos antes del primer día
        for (var i = 1; i < primerDiaSemana; i++) {
            html += `<div style="padding:8px;color:#e2e8f0;">-</div>`;
        }

        // Días del mes
        var hoy = new Date();
        var hoyDia = hoy.getDate();
        var hoyMes = hoy.getMonth();
        var hoyAño = hoy.getFullYear();

        for (var d = 1; d <= ultimoDia.getDate(); d++) {
            var esHoy = d === hoyDia && mesActual === hoyMes && añoActual === hoyAño;
            var tieneEventos = eventosPorDia[d] && eventosPorDia[d].length > 0;
            var cantidadEventos = tieneEventos ? eventosPorDia[d].length : 0;
            var esSeleccionado = diaSeleccionado === d;

            var estiloFondo = esSeleccionado ? '#0a1e3c' : esHoy ? '#f1f4f8' : 'transparent';
            var estiloColor = esSeleccionado ? 'white' : esHoy ? '#0a1e3c' : '#475569';
            var borde = esHoy && !esSeleccionado ? '2px solid #2a6b9c' : 'none';

            html += `
                <div onclick="CalendarioModule.seleccionarDia(${d})" 
                     style="padding:6px 4px;border-radius:8px;cursor:pointer;background:${estiloFondo};color:${estiloColor};border:${borde};font-size:14px;font-weight:${esHoy ? '700' : '400'};position:relative;transition:all 0.2s;"
                     onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';"
                     onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none';">
                    ${d}
                    ${tieneEventos ? `<span style="position:absolute;bottom:2px;right:4px;font-size:8px;color:#b33a4a;">●</span>` : ''}
                    ${cantidadEventos > 1 ? `<span style="position:absolute;top:2px;right:2px;font-size:8px;background:#b33a4a;color:white;border-radius:50%;padding:0 4px;min-width:14px;">${cantidadEventos}</span>` : ''}
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        // Seleccionar día actual por defecto
        if (!diaSeleccionado) {
            diaSeleccionado = hoyDia;
            await cargarEventosDelDia();
        }

        // Actualizar título del mes
        document.getElementById('calendario-mes-titulo').textContent = getNombreMes(mesActual) + ' ' + añoActual;
    }

    // ============================================================
    // CARGAR EVENTOS DEL DÍA
    // ============================================================
    async function cargarEventosDelDia() {
        var container = document.getElementById('calendario-eventos-dia');
        if (!container) return;

        var user = AuthModule.getCurrentUser();
        if (!user) return;

        var fecha = `${añoActual}-${String(mesActual+1).padStart(2,'0')}-${String(diaSeleccionado).padStart(2,'0')}`;
        var fechaDisplay = new Date(fecha).toLocaleDateString('es-CU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        document.getElementById('calendario-fecha-seleccionada').textContent = fechaDisplay;

        var eventos = await DBModule.query(
            `SELECT e.*, u.nombre as usuario_nombre 
             FROM eventos_calendario e
             LEFT JOIN usuarios u ON e.usuario_id = u.id
             WHERE DATE(e.fecha_inicio) = ?
             AND (e.usuario_id = ? OR e.egresado_id = (SELECT id FROM egresados WHERE usuario_id = ?) OR e.tutor_id = (SELECT id FROM tutores WHERE usuario_id = ?))
             ORDER BY e.fecha_inicio ASC`,
            [fecha, user.id, user.id, user.id]
        );

        if (eventos.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:#94a3b8;">
                    <div style="font-size:32px;margin-bottom:8px;">📅</div>
                    <p>No hay eventos programados para este día.</p>
                    <button class="btn btn-sm btn-primary" onclick="CalendarioModule.agregarEvento('${fecha}')" style="margin-top:8px;">
                        <i class="fas fa-plus"></i> Agregar evento
                    </button>
                </div>
            `;
            return;
        }

        var html = '';
        eventos.forEach(function(e) {
            var hora = new Date(e.fecha_inicio).toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' });
            var color = e.color || '#0a1e3c';
            var estadoText = e.estado === 'completado' ? '✅ Completado' : e.estado === 'cancelado' ? '❌ Cancelado' : '⏳ Pendiente';
            var estadoColor = e.estado === 'completado' ? '#1a8a4a' : e.estado === 'cancelado' ? '#b33a4a' : '#d48a2a';

            html += `
                <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #e2e8f0;border-left:4px solid ${color};padding-left:12px;">
                    <div style="min-width:50px;font-weight:600;color:#0a1e3c;">${hora}</div>
                    <div style="flex:1;">
                        <div style="font-weight:600;">${e.titulo}</div>
                        ${e.descripcion ? `<div style="font-size:13px;color:#64748b;">${e.descripcion}</div>` : ''}
                        ${e.lugar ? `<div style="font-size:12px;color:#94a3b8;">📍 ${e.lugar}</div>` : ''}
                        <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;">
                            <span style="font-size:11px;color:${estadoColor};background:#f8fafc;padding:2px 8px;border-radius:12px;">${estadoText}</span>
                            ${e.tipo ? `<span style="font-size:11px;color:#64748b;background:#f8fafc;padding:2px 8px;border-radius:12px;">${e.tipo}</span>` : ''}
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;flex-shrink:0;">
                        <button class="btn btn-sm btn-outline" onclick="CalendarioModule.editarEvento(${e.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="CalendarioModule.eliminarEvento(${e.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // ============================================================
    // CARGAR PRÓXIMOS EVENTOS
    // ============================================================
    async function cargarProximosEventos() {
        var container = document.getElementById('calendario-proximos-eventos');
        if (!container) return;

        var user = AuthModule.getCurrentUser();
        if (!user) return;

        var hoy = new Date().toISOString().split('T')[0];

        var eventos = await DBModule.query(
            `SELECT e.*, u.nombre as usuario_nombre 
             FROM eventos_calendario e
             LEFT JOIN usuarios u ON e.usuario_id = u.id
             WHERE DATE(e.fecha_inicio) >= ?
             AND (e.usuario_id = ? OR e.egresado_id = (SELECT id FROM egresados WHERE usuario_id = ?) OR e.tutor_id = (SELECT id FROM tutores WHERE usuario_id = ?))
             AND e.estado != 'completado'
             AND e.estado != 'cancelado'
             ORDER BY e.fecha_inicio ASC
             LIMIT 10`,
            [hoy, user.id, user.id, user.id]
        );

        if (eventos.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay eventos próximos.</p>';
            return;
        }

        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        eventos.forEach(function(e) {
            var fecha = new Date(e.fecha_inicio).toLocaleDateString('es-CU', { weekday: 'short', day: 'numeric', month: 'short' });
            var hora = new Date(e.fecha_inicio).toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' });
            var color = e.color || '#0a1e3c';

            html += `
                <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fafc;border-radius:8px;border-left:4px solid ${color};">
                    <div style="min-width:60px;font-size:11px;color:#94a3b8;">
                        <div>${fecha}</div>
                        <div>${hora}</div>
                    </div>
                    <div style="flex:1;font-size:13px;font-weight:500;color:#0a1e3c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${e.titulo}
                    </div>
                    <div onclick="CalendarioModule.verDetalleEvento(${e.id})" style="cursor:pointer;color:#2a6b9c;font-size:12px;">
                        <i class="fas fa-eye"></i>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // ============================================================
    // AGREGAR EVENTO
    // ============================================================
    async function agregarEvento(fecha = null) {
        var container = document.getElementById('calendario-formulario-container');
        if (!container) return;

        var user = AuthModule.getCurrentUser();
        if (!user) return;

        // Si no se especifica fecha, usar la seleccionada
        if (!fecha && diaSeleccionado) {
            fecha = `${añoActual}-${String(mesActual+1).padStart(2,'0')}-${String(diaSeleccionado).padStart(2,'0')}`;
        }
        if (!fecha) {
            fecha = new Date().toISOString().split('T')[0];
        }

        // Obtener colores disponibles
        var colores = ['#0a1e3c', '#2a6b9c', '#4a9ad9', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];

        container.style.display = 'block';
        container.innerHTML = `
            <div class="card" style="border:2px solid #2a6b9c;margin-top:20px;">
                <div class="card-title">
                    <i class="fas fa-plus-circle"></i> Nuevo Evento
                </div>
                <form id="form-evento-calendario">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Título <span class="required">*</span></label>
                            <input type="text" id="evento-titulo" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <select id="evento-tipo">
                                <option value="actividad">Actividad</option>
                                <option value="tutoria">Tutoría</option>
                                <option value="evaluacion">Evaluación</option>
                                <option value="reunion">Reunión</option>
                                <option value="curso">Curso</option>
                                <option value="evento">Evento</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha inicio <span class="required">*</span></label>
                            <input type="datetime-local" id="evento-fecha-inicio" value="${fecha}T09:00" required>
                        </div>
                        <div class="form-group">
                            <label>Fecha fin</label>
                            <input type="datetime-local" id="evento-fecha-fin" value="${fecha}T10:00">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Lugar</label>
                            <input type="text" id="evento-lugar" placeholder="Ubicación del evento">
                        </div>
                        <div class="form-group">
                            <label>Color</label>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;padding:6px 0;">
                                ${colores.map(function(c) {
                                    return `<span onclick="document.getElementById('evento-color').value='${c}';this.style.border='2px solid #0a1e3c';" 
                                              style="width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;border:2px solid transparent;transition:all 0.2s;"
                                              onmouseover="this.style.transform='scale(1.1)';"
                                              onmouseout="this.style.transform='scale(1)';"
                                              onclick="document.querySelectorAll('.color-swatch').forEach(el => el.style.border='2px solid transparent');this.style.border='2px solid #0a1e3c';"></span>`;
                                }).join('')}
                                <input type="hidden" id="evento-color" value="#0a1e3c">
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Estado</label>
                            <select id="evento-estado">
                                <option value="pendiente">⏳ Pendiente</option>
                                <option value="completado">✅ Completado</option>
                                <option value="cancelado">❌ Cancelado</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Notificar</label>
                            <select id="evento-notificar">
                                <option value="1">🔔 Sí, notificar</option>
                                <option value="0">🔕 No notificar</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea id="evento-descripcion" rows="2" placeholder="Descripción del evento..."></textarea>
                    </div>
                    <div style="display:flex;gap:12px;margin-top:16px;">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar evento</button>
                        <button type="button" class="btn btn-outline" onclick="document.getElementById('calendario-formulario-container').style.display='none'">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('form-evento-calendario').addEventListener('submit', function(e) {
            e.preventDefault();
            guardarEvento();
        });
    }

    // ============================================================
    // GUARDAR EVENTO
    // ============================================================
    async function guardarEvento() {
        var titulo = document.getElementById('evento-titulo').value.trim();
        var descripcion = document.getElementById('evento-descripcion').value.trim();
        var fechaInicio = document.getElementById('evento-fecha-inicio').value;
        var fechaFin = document.getElementById('evento-fecha-fin').value || null;
        var lugar = document.getElementById('evento-lugar').value.trim();
        var tipo = document.getElementById('evento-tipo').value;
        var color = document.getElementById('evento-color').value;
        var estado = document.getElementById('evento-estado').value;
        var notificar = parseInt(document.getElementById('evento-notificar').value);

        if (!titulo || !fechaInicio) {
            await ModalModule.warning('Completa los campos requeridos.');
            return;
        }

        var user = AuthModule.getCurrentUser();
        if (!user) return;

        try {
            await DBModule.execute(
                `INSERT INTO eventos_calendario 
                 (titulo, descripcion, fecha_inicio, fecha_fin, lugar, tipo, color, estado, notificar, usuario_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [titulo, descripcion, fechaInicio, fechaFin, lugar, tipo, color, estado, notificar, user.id]
            );

            await ModalModule.success('✅ Evento creado correctamente.');
            document.getElementById('calendario-formulario-container').style.display = 'none';

            // Recargar calendario
            await renderizarCalendario();
            await cargarEventosDelDia();
            await cargarProximosEventos();

        } catch (error) {
            console.error('Error al guardar evento:', error);
            await ModalModule.error('Error al guardar evento: ' + error.message);
        }
    }

    // ============================================================
    // ELIMINAR EVENTO
    // ============================================================
    async function eliminarEvento(eventoId) {
        var confirmado = await ModalModule.confirmDelete('¿Eliminar este evento?');
        if (!confirmado) return;

        try {
            await DBModule.execute('DELETE FROM eventos_calendario WHERE id = ?', [eventoId]);
            await ModalModule.success('Evento eliminado.');
            await renderizarCalendario();
            await cargarEventosDelDia();
            await cargarProximosEventos();
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // FUNCIONES DE NAVEGACIÓN DEL CALENDARIO
    // ============================================================
    function mesAnterior() {
        mesActual--;
        if (mesActual < 0) {
            mesActual = 11;
            añoActual--;
        }
        renderizarCalendario();
        // Mantener la selección del día si es válido
        var ultimoDia = new Date(añoActual, mesActual + 1, 0).getDate();
        if (diaSeleccionado > ultimoDia) {
            diaSeleccionado = ultimoDia;
        }
        cargarEventosDelDia();
    }

    function mesSiguiente() {
        mesActual++;
        if (mesActual > 11) {
            mesActual = 0;
            añoActual++;
        }
        renderizarCalendario();
        var ultimoDia = new Date(añoActual, mesActual + 1, 0).getDate();
        if (diaSeleccionado > ultimoDia) {
            diaSeleccionado = ultimoDia;
        }
        cargarEventosDelDia();
    }

    function hoy() {
        var hoy = new Date();
        mesActual = hoy.getMonth();
        añoActual = hoy.getFullYear();
        diaSeleccionado = hoy.getDate();
        renderizarCalendario();
        cargarEventosDelDia();
        cargarProximosEventos();
    }

    function seleccionarDia(dia) {
        diaSeleccionado = dia;
        renderizarCalendario();
        cargarEventosDelDia();
    }

    function getNombreMes(mes) {
        var nombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return nombres[mes] || '';
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        // Los eventos se manejan inline
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
        navigate: navigate,
        agregarEvento: agregarEvento,
        eliminarEvento: eliminarEvento,
        seleccionarDia: seleccionarDia,
        mesAnterior: mesAnterior,
        mesSiguiente: mesSiguiente,
        hoy: hoy,
        loadData: loadData
    };

})();

window.CalendarioModule = CalendarioModule;
console.log('📅 Módulo de Calendario cargado correctamente.');