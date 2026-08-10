// ============================================================
// SISPE - admin.graduados.js
// Gestión de Graduados con PAGINACIÓN
// RUTA: js/modules/admin/admin.graduados.js
// ============================================================

var AdminGraduados = (function() {
    'use strict';

    var paginaActual = 1;

    // ============================================================
    // RENDERIZAR LISTA DE GRADUADOS CON PAGINACIÓN
    // ============================================================
    async function render(pagina) {
        if (!AdminCore.isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        paginaActual = pagina || paginaActual || 1;

        // ============================================================
        // 1. OBTENER TOTAL DE REGISTROS
        // ============================================================
        var countResult = await DBModule.query('SELECT COUNT(*) as total FROM graduados');
        var totalItems = countResult[0]?.total || 0;

        // ============================================================
        // 2. OBTENER DATOS PAGINADOS
        // ============================================================
        var paginacion = PaginacionModule.getPaginacion(paginaActual, totalItems);

        var graduados = await DBModule.query(
            `SELECT g.*, c.nombre as carrera_nombre 
             FROM graduados g 
             LEFT JOIN carreras c ON g.carrera_id = c.id 
             ORDER BY g.anio_graduacion DESC 
             LIMIT ? OFFSET ?`,
            [paginacion.limit, paginacion.offset]
        );

        // ============================================================
        // 3. GENERAR HTML
        // ============================================================
        var html = `
            <div class="page-header">
                <h2><i class="fas fa-user-graduate"></i> Gesti&oacute;n de Graduados</h2>
                <div class="breadcrumb">${totalItems} graduados registrados</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="AdminGraduados.mostrarFormulario()">
                    <i class="fas fa-plus"></i> Nuevo Graduado
                </button>
                <button class="btn btn-secondary" onclick="AdminModule.descargarPlantillaGraduados()">
                    <i class="fas fa-download"></i> Plantilla Excel
                </button>
                <button class="btn btn-success" onclick="document.getElementById('importar-graduados-input').click()">
                    <i class="fas fa-upload"></i> Importar Excel
                </button>
                <input type="file" id="importar-graduados-input" accept=".xlsx,.xls" style="display:none;" onchange="AdminModule.importarGraduados(event)">
                <button class="btn btn-outline" onclick="AdminModule.exportarGraduados()">
                    <i class="fas fa-file-excel"></i> Exportar
                </button>
            </div>

            <div id="formulario-graduado-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Graduados</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Identidad</th>
                                <th>Nombre</th>
                                <th>Carrera</th>
                                <th>A&ntilde;o</th>
                                <th>Logros</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (graduados.length === 0) {
            html += '<tr><td colspan="6" class="text-center text-muted">No hay graduados registrados.</td></tr>';
        } else {
            for (var i = 0; i < graduados.length; i++) {
                var g = graduados[i];
                var logros = '';
                if (g.titulo_oro) logros += '<span class="badge badge-success">🏆 Oro</span> ';
                if (g.graduado_integral) logros += '<span class="badge badge-primary">⭐ Integral</span> ';
                html += '<tr><td><strong>' + g.numero_identidad + '</strong></td>' +
                    '<td>' + g.nombre + ' ' + g.apellidos + '</td>' +
                    '<td>' + (g.carrera_nombre || 'Sin carrera') + '</td>' +
                    '<td>' + g.anio_graduacion + '</td>' +
                    '<td>' + (logros || '<span class="text-muted">-</span>') + '</td>' +
                    '<td>' +
                    '<button class="btn btn-sm btn-secondary" onclick="AdminGraduados.editar(' + g.id + ')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="AdminGraduados.eliminar(' + g.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
                
                <!-- 🔥 CONTROLES DE PAGINACIÓN -->
                <div id="paginacion-graduados-container"></div>
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
                'paginacion-graduados-container'
            );
        }, 50);

        return html;
    }

    // ============================================================
    // FORMULARIO: GRADUADO
    // ============================================================
    function mostrarFormulario(graduadoId) {
        var container = document.getElementById('formulario-graduado-container');
        if (!container) return;

        if (graduadoId) {
            DBModule.query('SELECT * FROM graduados WHERE id = ?', [graduadoId]).then(function(result) {
                if (result.length > 0) {
                    renderForm(result[0]);
                }
            });
        } else {
            renderForm(null);
        }

        function renderForm(graduado) {
            var isEditing = !!graduado;
            var carreras = [];
            DBModule.query('SELECT * FROM carreras ORDER BY nombre').then(function(c) {
                carreras = c;
                container.innerHTML = `
                    <div class="card" style="border:2px solid #2a6b9c;">
                        <div class="card-title"><i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEditing ? 'Editar' : 'Nuevo'} Graduado</div>
                        <form id="form-graduado">
                            ${isEditing ? '<input type="hidden" id="graduado-id" value="' + graduado.id + '">' : ''}
                            <div class="form-row">
                                <div class="form-group">
                                    <label>N&uacute;mero de Identidad <span class="required">*</span></label>
                                    <input type="text" id="graduado-identidad" value="${isEditing ? graduado.numero_identidad : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Nombre <span class="required">*</span></label>
                                    <input type="text" id="graduado-nombre" value="${isEditing ? graduado.nombre : ''}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Apellidos <span class="required">*</span></label>
                                    <input type="text" id="graduado-apellidos" value="${isEditing ? graduado.apellidos : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Carrera <span class="required">*</span></label>
                                    <select id="graduado-carrera" required>
                                        <option value="">Selecciona...</option>
                                        ${carreras.map(function(c) {
                                            var selected = isEditing && graduado.carrera_id === c.id ? 'selected' : '';
                                            return '<option value="' + c.id + '" ' + selected + '>' + c.nombre + '</option>';
                                        }).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>A&ntilde;o de Graduaci&oacute;n <span class="required">*</span></label>
                                    <input type="number" id="graduado-anio" value="${isEditing ? graduado.anio_graduacion : 2024}" required>
                                </div>
                                <div class="form-group">
                                    <label>Email Institucional</label>
                                    <input type="email" id="graduado-email" value="${isEditing ? graduado.email_institucional || '' : ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label><input type="checkbox" id="graduado-titulo-oro" ${isEditing && graduado.titulo_oro ? 'checked' : ''}> T&iacute;tulo de Oro</label>
                                </div>
                                <div class="form-group">
                                    <label><input type="checkbox" id="graduado-integral" ${isEditing && graduado.graduado_integral ? 'checked' : ''}> Graduado Integral</label>
                                </div>
                            </div>
                            <div style="display:flex;gap:12px;margin-top:16px;">
                                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-graduado-container').innerHTML=''">Cancelar</button>
                            </div>
                        </form>
                    </div>
                `;

                document.getElementById('form-graduado').addEventListener('submit', function(e) {
                    e.preventDefault();
                    guardar();
                });
            });
        }
    }

    // ============================================================
    // GUARDAR GRADUADO
    // ============================================================
    async function guardar() {
        var id = document.getElementById('graduado-id')?.value;
        var identidad = document.getElementById('graduado-identidad').value.trim();
        var nombre = document.getElementById('graduado-nombre').value.trim();
        var apellidos = document.getElementById('graduado-apellidos').value.trim();
        var carreraId = parseInt(document.getElementById('graduado-carrera').value);
        var anio = parseInt(document.getElementById('graduado-anio').value);
        var email = document.getElementById('graduado-email').value.trim();
        var tituloOro = document.getElementById('graduado-titulo-oro').checked ? 1 : 0;
        var integral = document.getElementById('graduado-integral').checked ? 1 : 0;

        if (!identidad || !nombre || !apellidos || !carreraId || !anio) {
            await ModalModule.warning('Completa todos los campos requeridos.');
            return;
        }

        try {
            if (id) {
                await DBModule.execute(
                    `UPDATE graduados SET 
                        numero_identidad = ?, 
                        nombre = ?, 
                        apellidos = ?, 
                        carrera_id = ?, 
                        anio_graduacion = ?, 
                        email_institucional = ?, 
                        titulo_oro = ?, 
                        graduado_integral = ? 
                     WHERE id = ?`,
                    [identidad, nombre, apellidos, carreraId, anio, email, tituloOro, integral, id]
                );
                await ModalModule.success('Graduado actualizado correctamente.');
            } else {
                await DBModule.execute(
                    `INSERT INTO graduados 
                        (numero_identidad, nombre, apellidos, carrera_id, anio_graduacion, email_institucional, titulo_oro, graduado_integral) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [identidad, nombre, apellidos, carreraId, anio, email, tituloOro, integral]
                );
                await ModalModule.success('Graduado creado correctamente.');
            }
            document.getElementById('formulario-graduado-container').innerHTML = '';
            render().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(AdminCore.assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al guardar graduado: ' + error.message);
        }
    }

    // ============================================================
    // ELIMINAR GRADUADO
    // ============================================================
    async function eliminar(id) {
        var confirmado = await ModalModule.confirmDelete('&iquest;Est&aacute;s seguro de que quieres eliminar este graduado?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM graduados WHERE id = ?', [id]);
            await ModalModule.success('Graduado eliminado correctamente.');
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

window.AdminGraduados = AdminGraduados;
console.log('✅ AdminGraduados cargado correctamente.');