// ============================================================
// SISPE - admin.docentes.js
// Gestión de Docentes con PAGINACIÓN
// RUTA: js/modules/admin/admin.docentes.js
// ============================================================

var AdminDocentes = (function() {
    'use strict';

    var paginaActual = 1;

    // ============================================================
    // RENDERIZAR LISTA DE DOCENTES CON PAGINACIÓN
    // ============================================================
    async function render(pagina) {
        if (!AdminCore.isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        paginaActual = pagina || paginaActual || 1;

        // ============================================================
        // 1. OBTENER TOTAL DE REGISTROS
        // ============================================================
        var countResult = await DBModule.query('SELECT COUNT(*) as total FROM docentes');
        var totalItems = countResult[0]?.total || 0;

        // ============================================================
        // 2. OBTENER DATOS PAGINADOS
        // ============================================================
        var paginacion = PaginacionModule.getPaginacion(paginaActual, totalItems);

        var docentes = await DBModule.query(
            'SELECT * FROM docentes ORDER BY nombre ASC LIMIT ? OFFSET ?',
            [paginacion.limit, paginacion.offset]
        );

        // ============================================================
        // 3. GENERAR HTML
        // ============================================================
        var html = `
            <div class="page-header">
                <h2><i class="fas fa-chalkboard-teacher"></i> Gesti&oacute;n de Docentes</h2>
                <div class="breadcrumb">${totalItems} docentes registrados</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="AdminDocentes.mostrarFormulario()">
                    <i class="fas fa-plus"></i> Nuevo Docente
                </button>
                <button class="btn btn-secondary" onclick="AdminModule.descargarPlantillaDocentes()">
                    <i class="fas fa-download"></i> Plantilla Excel
                </button>
                <button class="btn btn-success" onclick="document.getElementById('importar-docentes-input').click()">
                    <i class="fas fa-upload"></i> Importar Excel
                </button>
                <input type="file" id="importar-docentes-input" accept=".xlsx,.xls" style="display:none;" onchange="AdminModule.importarDocentes(event)">
                <button class="btn btn-outline" onclick="AdminModule.exportarDocentes()">
                    <i class="fas fa-file-excel"></i> Exportar
                </button>
            </div>

            <div id="formulario-docente-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Docentes</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Identidad</th>
                                <th>Nombre</th>
                                <th>Departamento</th>
                                <th>Categor&iacute;a</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (docentes.length === 0) {
            html += '<tr><td colspan="6" class="text-center text-muted">No hay docentes registrados.</td></tr>';
        } else {
            for (var i = 0; i < docentes.length; i++) {
                var d = docentes[i];
                html += '<tr><td><strong>' + d.numero_identidad + '</strong></td>' +
                    '<td>' + d.nombre + ' ' + d.apellidos + '</td>' +
                    '<td>' + (d.departamento || 'Sin asignar') + '</td>' +
                    '<td><span class="badge badge-info">' + (d.categoria_docente || 'Sin categor&iacute;a') + '</span></td>' +
                    '<td>' + (d.email_institucional || '-') + '</td>' +
                    '<td>' +
                    '<button class="btn btn-sm btn-secondary" onclick="AdminDocentes.editar(' + d.id + ')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="AdminDocentes.eliminar(' + d.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
                
                <!-- 🔥 CONTROLES DE PAGINACIÓN -->
                <div id="paginacion-docentes-container"></div>
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
                'paginacion-docentes-container'
            );
        }, 50);

        return html;
    }

    // ============================================================
    // FORMULARIO: DOCENTE
    // ============================================================
    function mostrarFormulario(docenteId) {
        var container = document.getElementById('formulario-docente-container');
        if (!container) return;

        if (docenteId) {
            DBModule.query('SELECT * FROM docentes WHERE id = ?', [docenteId]).then(function(result) {
                if (result.length > 0) {
                    renderForm(result[0]);
                }
            });
        } else {
            renderForm(null);
        }

        function renderForm(docente) {
            var isEditing = !!docente;
            
            container.innerHTML = `
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEditing ? 'Editar' : 'Nuevo'} Docente</div>
                    <form id="form-docente">
                        ${isEditing ? '<input type="hidden" id="docente-id" value="' + docente.id + '">' : ''}
                        <div class="form-row">
                            <div class="form-group">
                                <label>N&uacute;mero de Identidad <span class="required">*</span></label>
                                <input type="text" id="docente-identidad" value="${isEditing ? docente.numero_identidad : ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Nombre <span class="required">*</span></label>
                                <input type="text" id="docente-nombre" value="${isEditing ? docente.nombre : ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Apellidos <span class="required">*</span></label>
                                <input type="text" id="docente-apellidos" value="${isEditing ? docente.apellidos : ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Email Institucional <span class="required">*</span></label>
                                <input type="email" id="docente-email" value="${isEditing ? docente.email_institucional || '' : ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Departamento</label>
                                <input type="text" id="docente-departamento" value="${isEditing ? docente.departamento || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Categor&iacute;a Docente</label>
                                <select id="docente-categoria">
                                    <option value="">Selecciona...</option>
                                    <option value="Principal" ${isEditing && docente.categoria_docente === 'Principal' ? 'selected' : ''}>Principal</option>
                                    <option value="Auxiliar" ${isEditing && docente.categoria_docente === 'Auxiliar' ? 'selected' : ''}>Auxiliar</option>
                                    <option value="Asistente" ${isEditing && docente.categoria_docente === 'Asistente' ? 'selected' : ''}>Asistente</option>
                                    <option value="Instructor" ${isEditing && docente.categoria_docente === 'Instructor' ? 'selected' : ''}>Instructor</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:flex;gap:12px;margin-top:16px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-docente-container').innerHTML=''">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('form-docente').addEventListener('submit', function(e) {
                e.preventDefault();
                guardar();
            });
        }
    }

    // ============================================================
    // GUARDAR DOCENTE
    // ============================================================
    async function guardar() {
        var id = document.getElementById('docente-id')?.value;
        var identidad = document.getElementById('docente-identidad').value.trim();
        var nombre = document.getElementById('docente-nombre').value.trim();
        var apellidos = document.getElementById('docente-apellidos').value.trim();
        var email = document.getElementById('docente-email').value.trim();
        var departamento = document.getElementById('docente-departamento').value.trim();
        var categoria = document.getElementById('docente-categoria').value;

        if (!identidad || !nombre || !apellidos || !email) {
            await ModalModule.warning('Completa todos los campos requeridos.');
            return;
        }

        try {
            if (id) {
                await DBModule.execute(
                    `UPDATE docentes SET 
                        numero_identidad = ?, 
                        nombre = ?, 
                        apellidos = ?, 
                        email_institucional = ?, 
                        departamento = ?, 
                        categoria_docente = ? 
                     WHERE id = ?`,
                    [identidad, nombre, apellidos, email, departamento, categoria, id]
                );
                await ModalModule.success('Docente actualizado correctamente.');
            } else {
                await DBModule.execute(
                    `INSERT INTO docentes 
                        (numero_identidad, nombre, apellidos, email_institucional, departamento, categoria_docente) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [identidad, nombre, apellidos, email, departamento, categoria]
                );
                await ModalModule.success('Docente creado correctamente.');
            }
            document.getElementById('formulario-docente-container').innerHTML = '';
            render().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(AdminCore.assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al guardar docente: ' + error.message);
        }
    }

    // ============================================================
    // ELIMINAR DOCENTE
    // ============================================================
    async function eliminar(id) {
        var confirmado = await ModalModule.confirmDelete('&iquest;Est&aacute;s seguro de que quieres eliminar este docente?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM docentes WHERE id = ?', [id]);
            await ModalModule.success('Docente eliminado correctamente.');
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

window.AdminDocentes = AdminDocentes;
console.log('✅ AdminDocentes cargado correctamente.');