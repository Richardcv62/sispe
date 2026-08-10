// ============================================================
// SISPE - admin.carreras.js
// Gestión de Carreras con PAGINACIÓN
// RUTA: js/modules/admin/admin.carreras.js
// ============================================================

var AdminCarreras = (function() {
    'use strict';

    var paginaActual = 1;

    // ============================================================
    // RENDERIZAR LISTA DE CARRERAS CON PAGINACIÓN
    // ============================================================
    async function render(pagina) {
        if (!AdminCore.isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        paginaActual = pagina || paginaActual || 1;

        // ============================================================
        // 1. OBTENER TOTAL DE REGISTROS
        // ============================================================
        var countResult = await DBModule.query('SELECT COUNT(*) as total FROM carreras');
        var totalItems = countResult[0]?.total || 0;

        // ============================================================
        // 2. OBTENER DATOS PAGINADOS
        // ============================================================
        var paginacion = PaginacionModule.getPaginacion(paginaActual, totalItems);

        var carreras = await DBModule.query(
            'SELECT * FROM carreras ORDER BY nombre LIMIT ? OFFSET ?',
            [paginacion.limit, paginacion.offset]
        );

        // ============================================================
        // 3. GENERAR HTML
        // ============================================================
        var html = `
            <div class="page-header">
                <h2><i class="fas fa-graduation-cap"></i> Gesti&oacute;n de Carreras</h2>
                <div class="breadcrumb">${totalItems} carreras registradas</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="AdminCarreras.mostrarFormulario()">
                    <i class="fas fa-plus"></i> Nueva Carrera
                </button>
            </div>

            <div id="formulario-carrera-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Carreras</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>C&oacute;digo</th>
                                <th>Nombre</th>
                                <th>Duraci&oacute;n</th>
                                <th style="text-align:center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (carreras.length === 0) {
            html += '<tr><td colspan="4" class="text-center text-muted">No hay carreras registradas.</td></tr>';
        } else {
            for (var i = 0; i < carreras.length; i++) {
                var c = carreras[i];
                html += '<tr><td><span class="badge badge-primary">' + (c.codigo || 'N/A') + '</span></td>' +
                    '<td><strong>' + c.nombre + '</strong></td>' +
                    '<td>' + c.duracion_anios + ' a&ntilde;os</td>' +
                    '<td style="text-align:center;">' +
                    '<button class="btn btn-sm btn-secondary" onclick="AdminCarreras.editar(' + c.id + ')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="AdminCarreras.eliminar(' + c.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
                
                <!-- 🔥 CONTROLES DE PAGINACIÓN -->
                <div id="paginacion-carreras-container"></div>
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
                'paginacion-carreras-container'
            );
        }, 50);

        return html;
    }

    // ============================================================
    // FORMULARIO: CARRERA
    // ============================================================
    function mostrarFormulario(carreraId) {
        var container = document.getElementById('formulario-carrera-container');
        if (!container) return;

        if (carreraId) {
            DBModule.query('SELECT * FROM carreras WHERE id = ?', [carreraId]).then(function(result) {
                if (result.length > 0) {
                    renderForm(result[0]);
                }
            });
        } else {
            renderForm(null);
        }

        function renderForm(carrera) {
            var isEditing = !!carrera;
            
            container.innerHTML = `
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEditing ? 'Editar' : 'Nueva'} Carrera</div>
                    <form id="form-carrera">
                        ${isEditing ? '<input type="hidden" id="carrera-id" value="' + carrera.id + '">' : ''}
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nombre <span class="required">*</span></label>
                                <input type="text" id="carrera-nombre" value="${isEditing ? carrera.nombre : ''}" required>
                            </div>
                            <div class="form-group">
                                <label>C&oacute;digo</label>
                                <input type="text" id="carrera-codigo" value="${isEditing ? carrera.codigo || '' : ''}" placeholder="Ej: IA-5">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Duraci&oacute;n (a&ntilde;os)</label>
                                <input type="number" id="carrera-duracion" value="${isEditing ? carrera.duracion_anios || 5 : 5}" min="1" max="6">
                            </div>
                            <div class="form-group">
                                <label>Descripci&oacute;n</label>
                                <input type="text" id="carrera-descripcion" value="${isEditing ? carrera.descripcion || '' : ''}">
                            </div>
                        </div>
                        <div style="display:flex;gap:12px;margin-top:16px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-carrera-container').innerHTML=''">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('form-carrera').addEventListener('submit', function(e) {
                e.preventDefault();
                guardar();
            });
        }
    }

    // ============================================================
    // GUARDAR CARRERA
    // ============================================================
    async function guardar() {
        var id = document.getElementById('carrera-id')?.value;
        var nombre = document.getElementById('carrera-nombre').value.trim();
        var codigo = document.getElementById('carrera-codigo').value.trim();
        var duracion = parseInt(document.getElementById('carrera-duracion').value) || 5;
        var descripcion = document.getElementById('carrera-descripcion').value.trim();

        if (!nombre) {
            await ModalModule.warning('El nombre es obligatorio.');
            return;
        }

        try {
            if (id) {
                await DBModule.execute(
                    `UPDATE carreras SET 
                        nombre = ?, 
                        codigo = ?, 
                        duracion_anios = ?, 
                        descripcion = ? 
                     WHERE id = ?`,
                    [nombre, codigo || null, duracion, descripcion || null, id]
                );
                await ModalModule.success('Carrera actualizada correctamente.');
            } else {
                await DBModule.execute(
                    `INSERT INTO carreras (nombre, codigo, duracion_anios, descripcion) 
                     VALUES (?, ?, ?, ?)`,
                    [nombre, codigo || null, duracion, descripcion || null]
                );
                await ModalModule.success('Carrera creada correctamente.');
            }
            document.getElementById('formulario-carrera-container').innerHTML = '';
            render().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(AdminCore.assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al guardar carrera: ' + error.message);
        }
    }

    // ============================================================
    // ELIMINAR CARRERA
    // ============================================================
    async function eliminar(id) {
        var confirmado = await ModalModule.confirmDelete('&iquest;Est&aacute;s seguro de que quieres eliminar esta carrera?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM carreras WHERE id = ?', [id]);
            await ModalModule.success('Carrera eliminada correctamente.');
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

window.AdminCarreras = AdminCarreras;
console.log('✅ AdminCarreras cargado correctamente.');