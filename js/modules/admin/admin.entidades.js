// ============================================================
// SISPE - admin.entidades.js
// Gestión de Entidades con PAGINACIÓN
// RUTA: js/modules/admin/admin.entidades.js
// ============================================================

var AdminEntidades = (function() {
    'use strict';

    var paginaActual = 1;
    var EMOJIS = ['🏢', '🏨', '🏛️', '🏭', '🏪', '🏫', '🏬', '🏣', '🏦', '🏩', '🏪', '🏨', '🏛️'];

    // ============================================================
    // RENDERIZAR LISTA DE ENTIDADES CON PAGINACIÓN
    // ============================================================
    async function render(pagina) {
        if (!AdminCore.isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        paginaActual = pagina || paginaActual || 1;

        // ============================================================
        // 1. OBTENER TOTAL DE REGISTROS
        // ============================================================
        var countResult = await DBModule.query('SELECT COUNT(*) as total FROM entidades');
        var totalItems = countResult[0]?.total || 0;

        // ============================================================
        // 2. OBTENER DATOS PAGINADOS
        // ============================================================
        var paginacion = PaginacionModule.getPaginacion(paginaActual, totalItems);

        var entidades = await DBModule.query(
            'SELECT * FROM entidades ORDER BY nombre LIMIT ? OFFSET ?',
            [paginacion.limit, paginacion.offset]
        );

        // ============================================================
        // 3. GENERAR HTML
        // ============================================================
        function mostrarLogo(logo) {
            if (!logo) return '🏢';
            return logo;
        }

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-building"></i> Gesti&oacute;n de Entidades</h2>
                <div class="breadcrumb">${totalItems} entidades registradas</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="AdminEntidades.mostrarFormulario()">
                    <i class="fas fa-plus"></i> Nueva Entidad
                </button>
                <button class="btn btn-secondary" onclick="AdminModule.descargarPlantillaEntidades()">
                    <i class="fas fa-download"></i> Plantilla Excel
                </button>
                <button class="btn btn-success" onclick="document.getElementById('importar-entidades-input').click()">
                    <i class="fas fa-upload"></i> Importar Excel
                </button>
                <input type="file" id="importar-entidades-input" accept=".xlsx,.xls" style="display:none;" onchange="AdminModule.importarEntidades(event)">
                <button class="btn btn-outline" onclick="AdminModule.exportarEntidades()">
                    <i class="fas fa-file-excel"></i> Exportar
                </button>
            </div>

            <div id="formulario-entidad-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Entidades (${totalItems})</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th style="width:70px;text-align:center;">Logo</th>
                                <th style="text-align:left;">Nombre</th>
                                <th style="text-align:left;">Sector</th>
                                <th style="text-align:left;">Representante</th>
                                <th style="text-align:center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (entidades.length === 0) {
            html += '<tr><td colspan="5" class="text-center text-muted">No hay entidades registradas.</td></tr>';
        } else {
            for (var i = 0; i < entidades.length; i++) {
                var ent = entidades[i];
                var logo = mostrarLogo(ent.logo);
                html += `<tr>
                    <td style="font-size:32px;text-align:center;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;line-height:1.4;">${logo}</td>
                    <td style="font-weight:600;color:#0a1e3c;">${ent.nombre}</td>
                    <td><span class="badge badge-info" style="font-size:13px;">${ent.sector || 'Sin sector'}</span></td>
                    <td>${ent.representante || 'Sin representante'}</td>
                    <td style="text-align:center;white-space:nowrap;">
                        <button class="btn btn-sm btn-secondary" onclick="AdminEntidades.editar(${ent.id})" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="AdminEntidades.eliminar(${ent.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
                
                <!-- 🔥 CONTROLES DE PAGINACIÓN -->
                <div id="paginacion-entidades-container"></div>
            </div>
        `;

        // ============================================================
        // 4. RENDERIZAR PAGINACIÓN
        // ============================================================
        setTimeout(function() {
            PaginacionModule.renderizar(
                paginaActual,
                totalItems,
                function(nuevaPagina) {
                    paginaActual = nuevaPagina;
                    render(nuevaPagina).then(function(html) {
                        document.getElementById('page-container').innerHTML = html;
                        setTimeout(AdminCore.assignEvents, 100);
                    });
                },
                'paginacion-entidades-container'
            );
        }, 50);

        return html;
    }

    // ============================================================
    // FORMULARIO: ENTIDAD
    // ============================================================
    function mostrarFormulario(entidadId) {
        var container = document.getElementById('formulario-entidad-container');
        if (!container) return;

        if (entidadId) {
            DBModule.query('SELECT * FROM entidades WHERE id = ?', [entidadId]).then(function(result) {
                if (result.length > 0) {
                    renderForm(result[0]);
                }
            });
        } else {
            renderForm(null);
        }

        function renderForm(entidad) {
            var isEditing = !!entidad;
            var logoActual = isEditing ? (entidad.logo || '🏢') : '🏢';
            
            container.innerHTML = `
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEditing ? 'Editar' : 'Nueva'} Entidad</div>
                    <form id="form-entidad">
                        ${isEditing ? '<input type="hidden" id="entidad-id" value="' + entidad.id + '">' : ''}
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nombre <span class="required">*</span></label>
                                <input type="text" id="entidad-nombre" value="${isEditing ? entidad.nombre : ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Sector</label>
                                <select id="entidad-sector">
                                    <option value="">Selecciona...</option>
                                    <option value="Turismo" ${isEditing && entidad.sector === 'Turismo' ? 'selected' : ''}>🏨 Turismo</option>
                                    <option value="Agroindustria" ${isEditing && entidad.sector === 'Agroindustria' ? 'selected' : ''}>🌾 Agroindustria</option>
                                    <option value="Industria Alimenticia" ${isEditing && entidad.sector === 'Industria Alimenticia' ? 'selected' : ''}>🥫 Industria Alimenticia</option>
                                    <option value="Energ&iacute;a" ${isEditing && entidad.sector === 'Energ&iacute;a' ? 'selected' : ''}>⚡ Energ&iacute;a</option>
                                    <option value="Comunicaciones" ${isEditing && entidad.sector === 'Comunicaciones' ? 'selected' : ''}>📡 Comunicaciones</option>
                                    <option value="Miner&iacute;a" ${isEditing && entidad.sector === 'Miner&iacute;a' ? 'selected' : ''}>⛏️ Miner&iacute;a</option>
                                    <option value="Pesca" ${isEditing && entidad.sector === 'Pesca' ? 'selected' : ''}>🐟 Pesca</option>
                                    <option value="Reciclaje" ${isEditing && entidad.sector === 'Reciclaje' ? 'selected' : ''}>♻️ Reciclaje</option>
                                    <option value="Salud" ${isEditing && entidad.sector === 'Salud' ? 'selected' : ''}>💊 Salud</option>
                                    <option value="Educaci&oacute;n" ${isEditing && entidad.sector === 'Educaci&oacute;n' ? 'selected' : ''}>📚 Educaci&oacute;n</option>
                                    <option value="Justicia" ${isEditing && entidad.sector === 'Justicia' ? 'selected' : ''}>⚖️ Justicia</option>
                                    <option value="Econom&iacute;a" ${isEditing && entidad.sector === 'Econom&iacute;a' ? 'selected' : ''}>💰 Econom&iacute;a</option>
                                    <option value="Ciencia" ${isEditing && entidad.sector === 'Ciencia' ? 'selected' : ''}>🔬 Ciencia</option>
                                    <option value="Control" ${isEditing && entidad.sector === 'Control' ? 'selected' : ''}>🔍 Control</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Representante</label>
                                <input type="text" id="entidad-representante" value="${isEditing ? entidad.representante || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Tel&eacute;fono</label>
                                <input type="text" id="entidad-telefono" value="${isEditing ? entidad.telefono || '' : ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email de Contacto</label>
                                <input type="email" id="entidad-email" value="${isEditing ? entidad.email_contacto || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Direcci&oacute;n</label>
                                <input type="text" id="entidad-direccion" value="${isEditing ? entidad.direccion || '' : ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Logo (emoji)</label>
                                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                                    <span style="font-size:32px;margin-right:8px;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;" id="logo-preview">${logoActual}</span>
                                    <input type="text" id="entidad-logo" value="${logoActual}" maxlength="2" style="width:60px;text-align:center;font-size:24px;border:1px solid #e2e8f0;border-radius:6px;padding:4px;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;">
                                    <span style="font-size:12px;color:#94a3b8;">(Escribe o selecciona abajo)</span>
                                </div>
                                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;padding:6px;background:white;border-radius:6px;border:1px solid #e2e8f0;max-height:80px;overflow-y:auto;">
                                    ${EMOJIS.map(e => 
                                        `<span onclick="document.getElementById('entidad-logo').value='${e}';document.getElementById('logo-preview').textContent='${e}';this.style.border='2px solid #0a1e3c';" 
                                              style="font-size:24px;cursor:pointer;padding:2px 4px;border-radius:4px;border:2px solid transparent;transition:all 0.2s;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;"
                                              onmouseover="this.style.border='2px solid #4a9ad9';"
                                              onmouseout="this.style.border='2px solid transparent';">${e}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Estado del Convenio</label>
                                <select id="entidad-convenio">
                                    <option value="activo" ${isEditing && entidad.convenio_estado === 'activo' ? 'selected' : ''}>✅ Activo</option>
                                    <option value="vencido" ${isEditing && entidad.convenio_estado === 'vencido' ? 'selected' : ''}>❌ Vencido</option>
                                    <option value="renovado" ${isEditing && entidad.convenio_estado === 'renovado' ? 'selected' : ''}>🔄 Renovado</option>
                                    <option value="sin convenio" ${isEditing && entidad.convenio_estado === 'sin convenio' ? 'selected' : ''}>📋 Sin convenio</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Fecha Inicio Convenio</label>
                                <input type="date" id="entidad-convenio-inicio" value="${isEditing ? entidad.convenio_fecha_inicio || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Fecha Fin Convenio</label>
                                <input type="date" id="entidad-convenio-fin" value="${isEditing ? entidad.convenio_fecha_fin || '' : ''}">
                            </div>
                        </div>
                        <div style="display:flex;gap:12px;margin-top:16px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-entidad-container').innerHTML=''">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('entidad-logo').addEventListener('input', function() {
                document.getElementById('logo-preview').textContent = this.value || '🏢';
            });

            document.getElementById('form-entidad').addEventListener('submit', function(e) {
                e.preventDefault();
                guardar();
            });
        }
    }

    // ============================================================
    // GUARDAR ENTIDAD
    // ============================================================
    async function guardar() {
        var id = document.getElementById('entidad-id')?.value;
        var nombre = document.getElementById('entidad-nombre').value.trim();
        var sector = document.getElementById('entidad-sector').value;
        var representante = document.getElementById('entidad-representante').value.trim();
        var telefono = document.getElementById('entidad-telefono').value.trim();
        var email = document.getElementById('entidad-email').value.trim();
        var direccion = document.getElementById('entidad-direccion').value.trim();
        var logo = document.getElementById('entidad-logo').value.trim() || '🏢';
        var convenioEstado = document.getElementById('entidad-convenio').value;
        var convenioInicio = document.getElementById('entidad-convenio-inicio').value;
        var convenioFin = document.getElementById('entidad-convenio-fin').value;

        if (!nombre) {
            await ModalModule.warning('El nombre es obligatorio.');
            return;
        }

        try {
            if (id) {
                await DBModule.execute(
                    `UPDATE entidades SET 
                        nombre = ?, 
                        sector = ?, 
                        representante = ?, 
                        telefono = ?, 
                        email_contacto = ?, 
                        direccion = ?, 
                        logo = ?, 
                        convenio_estado = ?, 
                        convenio_fecha_inicio = ?, 
                        convenio_fecha_fin = ? 
                     WHERE id = ?`,
                    [nombre, sector, representante, telefono, email, direccion, logo, convenioEstado, convenioInicio || null, convenioFin || null, id]
                );
                await ModalModule.success('Entidad actualizada correctamente.');
            } else {
                await DBModule.execute(
                    `INSERT INTO entidades 
                        (nombre, sector, representante, telefono, email_contacto, direccion, logo, convenio_estado, convenio_fecha_inicio, convenio_fecha_fin) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [nombre, sector, representante, telefono, email, direccion, logo, convenioEstado, convenioInicio || null, convenioFin || null]
                );
                await ModalModule.success('Entidad creada correctamente.');
            }
            document.getElementById('formulario-entidad-container').innerHTML = '';
            render().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(AdminCore.assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al guardar entidad: ' + error.message);
        }
    }

    // ============================================================
    // ELIMINAR ENTIDAD
    // ============================================================
    async function eliminar(id) {
        var confirmado = await ModalModule.confirmDelete('&iquest;Est&aacute;s seguro de que quieres eliminar esta entidad?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM entidades WHERE id = ?', [id]);
            await ModalModule.success('Entidad eliminada correctamente.');
            render().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(AdminCore.assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
        render: render,
        mostrarFormulario: mostrarFormulario,
        guardar: guardar,
        editar: mostrarFormulario,
        eliminar: eliminar
    };

})();

window.AdminEntidades = AdminEntidades;
console.log('✅ AdminEntidades cargado correctamente.');