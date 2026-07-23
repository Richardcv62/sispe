// ============================================================
// SISPE - admin.js
// Modulo de Administracion - VERSION COMPLETA
// ============================================================

const AdminModule = (function() {
    'use strict';

    // ============================================================
    // NAVEGACION PRINCIPAL
    // ============================================================
    function navigate(page, breadcrumb) {
        console.log('?? AdminModule.navigate llamado con:', page);
        var container = document.getElementById('page-container');
        if (!container) {
            console.error('? page-container no encontrado');
            return;
        }

        // Si hay breadcrumb, insertarlo
        var breadcrumbHtml = breadcrumb || '';

        var content = '';

        switch(page) {
            case 'dashboard':
                content = renderDashboard();
                break;
            case 'usuarios':
                renderUsuarios('todos').then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar usuarios: ' + err.message + '</p>';
                });
                return;
            case 'graduados':
                renderGraduados().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar graduados: ' + err.message + '</p>';
                });
                return;
            case 'docentes':
                renderDocentes().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar docentes: ' + err.message + '</p>';
                });
                return;
            case 'entidades':
                renderEntidades().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar entidades: ' + err.message + '</p>';
                });
                return;
            case 'carreras':
                renderCarreras().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar carreras: ' + err.message + '</p>';
                });
                return;
            case 'asignar-tutores':
                mostrarAsignacionTutor(breadcrumbHtml);
                return;
            case 'reportes':
                renderReportes().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar reportes: ' + err.message + '</p>';
                });
                return;
            default:
                content = renderDashboard();
        }

        if (content) {
            container.innerHTML = breadcrumbHtml + content;
            setTimeout(assignEvents, 100);
            setTimeout(loadData, 200);
        }
    }
	
    // ============================================================
    // VERIFICAR SI ES ADMIN
    // ============================================================
    function isAdmin() {
        var user = AuthModule.getCurrentUser();
        return user && (user.rol_nombre === 'administrador' || user.rol_id === 1);
    }

    // ============================================================
    // DASHBOARD
    // ============================================================
    function renderDashboard() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        return `
            <div class="page-header">
                <h2><i class="fas fa-cogs"></i> Panel de Administracion</h2>
                <div class="breadcrumb">Control total del sistema</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:24px;">
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('usuarios')">
                    <div style="font-size:40px;">ðŸ‘¤</div>
                    <h4>Usuarios</h4>
                    <p style="font-size:12px;color:#64748b;">Gestionar usuarios del sistema</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('graduados')">
                    <div style="font-size:40px;">ðŸ‘¨â€ðŸŽ“</div>
                    <h4>Graduados</h4>
                    <p style="font-size:12px;color:#64748b;">Lista oficial de graduados UIJ</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('docentes')">
                    <div style="font-size:40px;">ðŸ§‘â€ðŸ«</div>
                    <h4>Docentes</h4>
                    <p style="font-size:12px;color:#64748b;">Lista oficial de docentes UIJ</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('entidades')">
                    <div style="font-size:40px;">ðŸ¢</div>
                    <h4>Entidades</h4>
                    <p style="font-size:12px;color:#64748b;">Empresas y organismos</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('carreras')">
                    <div style="font-size:40px;">ðŸŽ“</div>
                    <h4>Carreras</h4>
                    <p style="font-size:12px;color:#64748b;">Carreras universitarias</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('asignar-tutores')">
                    <div style="font-size:40px;">ðŸ‘¥</div>
                    <h4>Asignar Tutores</h4>
                    <p style="font-size:12px;color:#64748b;">Asignar tutores a egresados</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('reportes')">
                    <div style="font-size:40px;">ðŸ“Š</div>
                    <h4>Reportes</h4>
                    <p style="font-size:12px;color:#64748b;">Estadisticas del sistema</p>
                </div>
            </div>

            <div id="estadisticas-admin">
                <p class="text-muted">Cargando estadisticas...</p>
            </div>
        `;
    }

    // ============================================================
    // USUARIOS (CON FILTRO POR ROL)
    // ============================================================
    async function renderUsuarios(filtroRol) {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var roles = await DBModule.query('SELECT * FROM roles ORDER BY id');
        
        var rolesMap = {};
        for (var i = 0; i < roles.length; i++) {
            rolesMap[roles[i].id] = roles[i].nombre;
        }

        var query = 'SELECT * FROM usuarios';
        var params = [];
        
        if (filtroRol && filtroRol !== 'todos' && filtroRol !== '') {
            query += ' WHERE rol_id = ?';
            params.push(parseInt(filtroRol));
        }
        query += ' ORDER BY id';

        var usuarios = await DBModule.query(query, params);

        for (var i = 0; i < usuarios.length; i++) {
            var u = usuarios[i];
            u.rol_nombre = rolesMap[u.rol_id] || 'Sin rol';
        }

        var filtroOptions = '<option value="todos">Todos los roles</option>';
        for (var i = 0; i < roles.length; i++) {
            var selected = (filtroRol && parseInt(filtroRol) === roles[i].id) ? 'selected' : '';
            filtroOptions += '<option value="' + roles[i].id + '" ' + selected + '>' + roles[i].nombre + '</option>';
        }

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-users-cog"></i> Gestion de Usuarios</h2>
                <div class="breadcrumb">${usuarios.length} usuarios registrados</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center;">
                <button class="btn btn-primary" onclick="AdminModule.mostrarFormularioUsuario()">
                    <i class="fas fa-plus"></i> Nuevo Usuario
                </button>
                <button class="btn btn-secondary" onclick="AdminModule.descargarPlantillaUsuarios()">
                    <i class="fas fa-download"></i> Plantilla Excel
                </button>
                <button class="btn btn-success" onclick="document.getElementById('importar-usuarios-input').click()">
                    <i class="fas fa-upload"></i> Importar Excel
                </button>
                <input type="file" id="importar-usuarios-input" accept=".xlsx,.xls" style="display:none;" onchange="AdminModule.importarUsuarios(event)">
                <button class="btn btn-outline" onclick="AdminModule.exportarUsuarios()">
                    <i class="fas fa-file-excel"></i> Exportar
                </button>
                
                <div style="display:flex;align-items:center;gap:8px;margin-left:auto;">
                    <label style="font-weight:600;font-size:14px;color:#475569;"><i class="fas fa-filter"></i> Filtrar por rol:</label>
                    <select id="filtro-rol-usuarios" onchange="AdminModule.aplicarFiltroUsuarios(this.value)" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;background:white;cursor:pointer;">
                        ${filtroOptions}
                    </select>
                </div>
            </div>

            <div id="formulario-usuario-container"></div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Usuarios</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (usuarios.length === 0) {
            html += '<tr><td colspan="7" class="text-center text-muted">No hay usuarios con este rol.</td></tr>';
        } else {
            for (var i = 0; i < usuarios.length; i++) {
                var u = usuarios[i];
                var estado = u.activo ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-danger">Inactivo</span>';
                var rolNombre = u.rol_nombre || 'Sin rol';
                html += '<tr><td>' + u.id + '</td>' +
                    '<td><strong>' + u.username + '</strong></td>' +
                    '<td>' + u.nombre + ' ' + (u.apellidos || '') + '</td>' +
                    '<td>' + u.email + '</td>' +
                    '<td><span class="badge badge-info">' + rolNombre + '</span></td>' +
                    '<td>' + estado + '</td>' +
                    '<td>' +
                    '<button class="btn btn-sm btn-secondary" onclick="AdminModule.editarUsuario(' + u.id + ')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="AdminModule.eliminarUsuario(' + u.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // APLICAR FILTRO A USUARIOS
    // ============================================================
    function aplicarFiltroUsuarios(rolId) {
        var container = document.getElementById('page-container');
        if (!container) return;

        renderUsuarios(rolId).then(function(html) {
            container.innerHTML = html;
            setTimeout(assignEvents, 100);
        }).catch(function(err) {
            container.innerHTML = '<p class="text-muted">Error al aplicar filtro: ' + err.message + '</p>';
        });
    }

    // ============================================================
    // FORMULARIO: USUARIO (CREAR Y EDITAR)
    // ============================================================
    function mostrarFormularioUsuario(usuarioId) {
        var container = document.getElementById('formulario-usuario-container');
        if (!container) return;

        if (usuarioId) {
            DBModule.query('SELECT * FROM usuarios WHERE id = ?', [usuarioId]).then(function(result) {
                if (result.length > 0) {
                    renderFormUsuario(result[0]);
                }
            });
        } else {
            renderFormUsuario(null);
        }

        function renderFormUsuario(usuario) {
            var isEditing = !!usuario;
            var roles = [];
            DBModule.query('SELECT * FROM roles').then(function(r) {
                roles = r;
                container.innerHTML = `
                    <div class="card" style="border:2px solid #2a6b9c;">
                        <div class="card-title"><i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEditing ? 'Editar' : 'Nuevo'} Usuario</div>
                        <form id="form-usuario">
                            ${isEditing ? '<input type="hidden" id="usuario-id" value="' + usuario.id + '">' : ''}
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Usuario <span class="required">*</span></label>
                                    <input type="text" id="usuario-username" value="${isEditing ? usuario.username : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Email <span class="required">*</span></label>
                                    <input type="email" id="usuario-email" value="${isEditing ? usuario.email : ''}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nombre <span class="required">*</span></label>
                                    <input type="text" id="usuario-nombre" value="${isEditing ? usuario.nombre : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Apellidos</label>
                                    <input type="text" id="usuario-apellidos" value="${isEditing ? usuario.apellidos || '' : ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Rol <span class="required">*</span></label>
                                    <select id="usuario-rol" required>
                                        ${roles.map(function(r) {
                                            var selected = isEditing && usuario.rol_id === r.id ? 'selected' : '';
                                            return '<option value="' + r.id + '" ' + selected + '>' + r.nombre + '</option>';
                                        }).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Estado</label>
                                    <select id="usuario-estado">
                                        <option value="1" ${isEditing && usuario.activo === 1 ? 'selected' : ''}>Activo</option>
                                        <option value="0" ${isEditing && usuario.activo === 0 ? 'selected' : ''}>Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            ${!isEditing ? '<div class="form-row"><div class="form-group"><label>ContraseÃ±a <span class="required">*</span></label><input type="password" id="usuario-password" placeholder="Minimo 6 caracteres" required minlength="6"></div></div>' : ''}
                            <div style="display:flex;gap:12px;margin-top:16px;">
                                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-usuario-container').innerHTML=''">Cancelar</button>
                            </div>
                        </form>
                    </div>
                `;

                document.getElementById('form-usuario').addEventListener('submit', function(e) {
                    e.preventDefault();
                    AdminModule.guardarUsuario();
                });
            });
        }
    }

    async function guardarUsuario() {
        var id = document.getElementById('usuario-id')?.value;
        var username = document.getElementById('usuario-username').value.trim();
        var email = document.getElementById('usuario-email').value.trim();
        var nombre = document.getElementById('usuario-nombre').value.trim();
        var apellidos = document.getElementById('usuario-apellidos').value.trim();
        var rolId = parseInt(document.getElementById('usuario-rol').value);
        var activo = parseInt(document.getElementById('usuario-estado').value);

        if (!username || !email || !nombre || !rolId) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showWarning('Completa todos los campos requeridos.');
            }
            return;
        }

        try {
            if (id) {
                await DBModule.execute(
                    'UPDATE usuarios SET username = ?, email = ?, nombre = ?, apellidos = ?, rol_id = ?, activo = ? WHERE id = ?',
                    [username, email, nombre, apellidos, rolId, activo, id]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Usuario actualizado correctamente.', 'success');
                }
            } else {
                var password = document.getElementById('usuario-password').value;
                if (!password || password.length < 6) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning('La contraseÃ±a debe tener al menos 6 caracteres.');
                    }
                    return;
                }
                await DBModule.execute(
                    'INSERT INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [username, password, email, nombre, apellidos, rolId, activo]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Usuario creado correctamente.', 'success');
                }
            }
            document.getElementById('formulario-usuario-container').innerHTML = '';
            renderUsuarios(document.getElementById('filtro-rol-usuarios')?.value || 'todos').then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al guardar usuario: ' + error.message, 'error');
            }
        }
    }

    function editarUsuario(id) { mostrarFormularioUsuario(id); }

    async function eliminarUsuario(id) {
        if (!confirm('Â¿Eliminar este usuario?')) return;
        try {
            await DBModule.execute('DELETE FROM usuarios WHERE id = ?', [id]);
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Usuario eliminado.', 'success');
            }
            renderUsuarios(document.getElementById('filtro-rol-usuarios')?.value || 'todos').then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al eliminar.', 'error');
            }
        }
    }

    // ============================================================
    // GRADUADOS (CON EDICION COMPLETA)
    // ============================================================
    async function renderGraduados() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var graduados = await DBModule.query(
            'SELECT g.*, c.nombre as carrera_nombre FROM graduados g LEFT JOIN carreras c ON g.carrera_id = c.id ORDER BY g.anio_graduacion DESC'
        );

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-user-graduate"></i> Gestion de Graduados</h2>
                <div class="breadcrumb">${graduados.length} graduados registrados</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="AdminModule.mostrarFormularioGraduado()">
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
                                <th>AÃ±o</th>
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
                if (g.titulo_oro) logros += '<span class="badge badge-success">Oro</span> ';
                if (g.graduado_integral) logros += '<span class="badge badge-primary">Integral</span> ';
                html += '<tr><td><strong>' + g.numero_identidad + '</strong></td>' +
                    '<td>' + g.nombre + ' ' + g.apellidos + '</td>' +
                    '<td>' + (g.carrera_nombre || 'Sin carrera') + '</td>' +
                    '<td>' + g.anio_graduacion + '</td>' +
                    '<td>' + (logros || '<span class="text-muted">-</span>') + '</td>' +
                    '<td>' +
                    '<button class="btn btn-sm btn-secondary" onclick="AdminModule.editarGraduado(' + g.id + ')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="AdminModule.eliminarGraduado(' + g.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // FORMULARIO: GRADUADO (CREAR Y EDITAR)
    // ============================================================
    function mostrarFormularioGraduado(graduadoId) {
        var container = document.getElementById('formulario-graduado-container');
        if (!container) return;

        if (graduadoId) {
            DBModule.query('SELECT * FROM graduados WHERE id = ?', [graduadoId]).then(function(result) {
                if (result.length > 0) {
                    renderFormGraduado(result[0]);
                }
            });
        } else {
            renderFormGraduado(null);
        }

        function renderFormGraduado(graduado) {
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
                                    <label>Numero de Identidad <span class="required">*</span></label>
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
                                    <label>AÃ±o de Graduacion <span class="required">*</span></label>
                                    <input type="number" id="graduado-anio" value="${isEditing ? graduado.anio_graduacion : 2024}" required>
                                </div>
                                <div class="form-group">
                                    <label>Email Institucional</label>
                                    <input type="email" id="graduado-email" value="${isEditing ? graduado.email_institucional || '' : ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label><input type="checkbox" id="graduado-titulo-oro" ${isEditing && graduado.titulo_oro ? 'checked' : ''}> Titulo de Oro</label>
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
                    AdminModule.guardarGraduado();
                });
            });
        }
    }

    async function guardarGraduado() {
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
            if (window.NotificationsModule) {
                window.NotificationsModule.showWarning('Completa todos los campos requeridos.');
            }
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
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Graduado actualizado correctamente.', 'success');
                }
            } else {
                await DBModule.execute(
                    `INSERT INTO graduados 
                        (numero_identidad, nombre, apellidos, carrera_id, anio_graduacion, email_institucional, titulo_oro, graduado_integral) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [identidad, nombre, apellidos, carreraId, anio, email, tituloOro, integral]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Graduado creado correctamente.', 'success');
                }
            }
            document.getElementById('formulario-graduado-container').innerHTML = '';
            renderGraduados().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al guardar graduado: ' + error.message, 'error');
            }
        }
    }

    function editarGraduado(id) { mostrarFormularioGraduado(id); }

    async function eliminarGraduado(id) {
        if (!confirm('Â¿Eliminar este graduado?')) return;
        try {
            await DBModule.execute('DELETE FROM graduados WHERE id = ?', [id]);
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Graduado eliminado.', 'success');
            }
            renderGraduados().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al eliminar.', 'error');
            }
        }
    }

    // ============================================================
    // DOCENTES (CON EDICION COMPLETA)
    // ============================================================
    async function renderDocentes() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var docentes = await DBModule.query('SELECT * FROM docentes ORDER BY nombre ASC');

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-chalkboard-teacher"></i> Gestion de Docentes</h2>
                <div class="breadcrumb">${docentes.length} docentes registrados</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="AdminModule.mostrarFormularioDocente()">
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
                                <th>Categoria</th>
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
                    '<td><span class="badge badge-info">' + (d.categoria_docente || 'Sin categoria') + '</span></td>' +
                    '<td>' + (d.email_institucional || '-') + '</td>' +
                    '<td>' +
                    '<button class="btn btn-sm btn-secondary" onclick="AdminModule.editarDocente(' + d.id + ')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="AdminModule.eliminarDocente(' + d.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // FORMULARIO: DOCENTE (CREAR Y EDITAR)
    // ============================================================
    function mostrarFormularioDocente(docenteId) {
        var container = document.getElementById('formulario-docente-container');
        if (!container) return;

        if (docenteId) {
            DBModule.query('SELECT * FROM docentes WHERE id = ?', [docenteId]).then(function(result) {
                if (result.length > 0) {
                    renderFormDocente(result[0]);
                }
            });
        } else {
            renderFormDocente(null);
        }

        function renderFormDocente(docente) {
            var isEditing = !!docente;
            
            container.innerHTML = `
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title"><i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> ${isEditing ? 'Editar' : 'Nuevo'} Docente</div>
                    <form id="form-docente">
                        ${isEditing ? '<input type="hidden" id="docente-id" value="' + docente.id + '">' : ''}
                        <div class="form-row">
                            <div class="form-group">
                                <label>Numero de Identidad <span class="required">*</span></label>
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
                                <label>Categoria Docente</label>
                                <select id="docente-categoria">
                                    <option value="">Selecciona...</option>
                                    <option value="Principal" ${isEditing && docente.categoria_docente === 'Principal' ? 'selected' : ''}>Principal</option>
                                    <option value="Auxiliar" ${isEditing && docente.categoria_docente === 'Auxiliar' ? 'selected' : ''}>Auxiliar</option>
                                    <option value="Asistente" ${isEditing && docente.categoria_docente === 'Asistente' ? 'selected' : ''}>Asistente</option>
                                    <option value="Instructor" ${isEditing && docente.categoria_docente === 'Instructor' ? 'selected' : ''}>Instructor</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email Personal</label>
                                <input type="email" id="docente-email-personal" value="${isEditing ? docente.email_personal || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Telefono</label>
                                <input type="text" id="docente-telefono" value="${isEditing ? docente.telefono || '' : ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label><input type="checkbox" id="docente-disponible" ${isEditing && docente.disponible !== 0 ? 'checked' : ''}> Disponible como tutor</label>
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
                AdminModule.guardarDocente();
            });
        }
    }

    async function guardarDocente() {
        var id = document.getElementById('docente-id')?.value;
        var identidad = document.getElementById('docente-identidad').value.trim();
        var nombre = document.getElementById('docente-nombre').value.trim();
        var apellidos = document.getElementById('docente-apellidos').value.trim();
        var email = document.getElementById('docente-email').value.trim();
        var departamento = document.getElementById('docente-departamento').value.trim();
        var categoria = document.getElementById('docente-categoria').value;
        var emailPersonal = document.getElementById('docente-email-personal').value.trim();
        var telefono = document.getElementById('docente-telefono').value.trim();
        var disponible = document.getElementById('docente-disponible').checked ? 1 : 0;

        if (!identidad || !nombre || !apellidos || !email) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showWarning('Completa todos los campos requeridos.');
            }
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
                        categoria_docente = ?, 
                        email_personal = ?, 
                        telefono = ?, 
                        disponible = ? 
                     WHERE id = ?`,
                    [identidad, nombre, apellidos, email, departamento, categoria, emailPersonal, telefono, disponible, id]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Docente actualizado correctamente.', 'success');
                }
            } else {
                await DBModule.execute(
                    `INSERT INTO docentes 
                        (numero_identidad, nombre, apellidos, email_institucional, departamento, categoria_docente, email_personal, telefono, disponible) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [identidad, nombre, apellidos, email, departamento, categoria, emailPersonal, telefono, disponible]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Docente creado correctamente.', 'success');
                }
            }
            document.getElementById('formulario-docente-container').innerHTML = '';
            renderDocentes().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al guardar docente: ' + error.message, 'error');
            }
        }
    }

    function editarDocente(id) { mostrarFormularioDocente(id); }

    async function eliminarDocente(id) {
        if (!confirm('Â¿Eliminar este docente?')) return;
        try {
            await DBModule.execute('DELETE FROM docentes WHERE id = ?', [id]);
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Docente eliminado.', 'success');
            }
            renderDocentes().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al eliminar.', 'error');
            }
        }
    }

    // ============================================================
    // ENTIDADES (CON EDICION COMPLETA)
    // ============================================================
    async function renderEntidades() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var entidades = await DBModule.query('SELECT * FROM entidades ORDER BY nombre');

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-building"></i> Gestion de Entidades</h2>
                <div class="breadcrumb">${entidades.length} entidades registradas</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="AdminModule.mostrarFormularioEntidad()">
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
                <div class="card-title"><i class="fas fa-list"></i> Lista de Entidades</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Logo</th>
                                <th>Nombre</th>
                                <th>Sector</th>
                                <th>Representante</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (entidades.length === 0) {
            html += '<tr><td colspan="5" class="text-center text-muted">No hay entidades registradas.</td></tr>';
        } else {
            for (var i = 0; i < entidades.length; i++) {
                var ent = entidades[i];
                html += '<tr><td style="font-size:28px;">' + (ent.logo || 'ðŸ¢') + '</td>' +
                    '<td><strong>' + ent.nombre + '</strong></td>' +
                    '<td><span class="badge badge-info">' + (ent.sector || 'Sin sector') + '</span></td>' +
                    '<td>' + (ent.representante || 'Sin representante') + '</td>' +
                    '<td>' +
                    '<button class="btn btn-sm btn-secondary" onclick="AdminModule.editarEntidad(' + ent.id + ')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="AdminModule.eliminarEntidad(' + ent.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // FORMULARIO: ENTIDAD (CREAR Y EDITAR)
    // ============================================================
    function mostrarFormularioEntidad(entidadId) {
        var container = document.getElementById('formulario-entidad-container');
        if (!container) return;

        if (entidadId) {
            DBModule.query('SELECT * FROM entidades WHERE id = ?', [entidadId]).then(function(result) {
                if (result.length > 0) {
                    renderFormEntidad(result[0]);
                }
            });
        } else {
            renderFormEntidad(null);
        }

        function renderFormEntidad(entidad) {
            var isEditing = !!entidad;
            
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
                                    <option value="Produccion de alimentos" ${isEditing && entidad.sector === 'Produccion de alimentos' ? 'selected' : ''}>ðŸŒ¾ Produccion de alimentos</option>
                                    <option value="Turismo" ${isEditing && entidad.sector === 'Turismo' ? 'selected' : ''}>ðŸ¨ Turismo</option>
                                    <option value="Comunicaciones" ${isEditing && entidad.sector === 'Comunicaciones' ? 'selected' : ''}>ðŸ“¡ Comunicaciones</option>
                                    <option value="Servicios profesionales" ${isEditing && entidad.sector === 'Servicios profesionales' ? 'selected' : ''}>âš–ï¸ Servicios profesionales</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Representante</label>
                                <input type="text" id="entidad-representante" value="${isEditing ? entidad.representante || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Telefono</label>
                                <input type="text" id="entidad-telefono" value="${isEditing ? entidad.telefono || '' : ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email de Contacto</label>
                                <input type="email" id="entidad-email" value="${isEditing ? entidad.email_contacto || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Direccion</label>
                                <input type="text" id="entidad-direccion" value="${isEditing ? entidad.direccion || '' : ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Logo (emoji)</label>
                                <input type="text" id="entidad-logo" placeholder="ðŸ¢" maxlength="2" value="${isEditing ? entidad.logo || 'ðŸ¢' : 'ðŸ¢'}" style="width:60px;">
                            </div>
                            <div class="form-group">
                                <label>Estado del Convenio</label>
                                <select id="entidad-convenio">
                                    <option value="activo" ${isEditing && entidad.convenio_estado === 'activo' ? 'selected' : ''}>Activo</option>
                                    <option value="vencido" ${isEditing && entidad.convenio_estado === 'vencido' ? 'selected' : ''}>Vencido</option>
                                    <option value="renovado" ${isEditing && entidad.convenio_estado === 'renovado' ? 'selected' : ''}>Renovado</option>
                                    <option value="sin convenio" ${isEditing && entidad.convenio_estado === 'sin convenio' ? 'selected' : ''}>Sin convenio</option>
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

            document.getElementById('form-entidad').addEventListener('submit', function(e) {
                e.preventDefault();
                AdminModule.guardarEntidad();
            });
        }
    }

    async function guardarEntidad() {
        var id = document.getElementById('entidad-id')?.value;
        var nombre = document.getElementById('entidad-nombre').value.trim();
        var sector = document.getElementById('entidad-sector').value;
        var representante = document.getElementById('entidad-representante').value.trim();
        var telefono = document.getElementById('entidad-telefono').value.trim();
        var email = document.getElementById('entidad-email').value.trim();
        var direccion = document.getElementById('entidad-direccion').value.trim();
        var logo = document.getElementById('entidad-logo').value.trim() || 'ðŸ¢';
        var convenioEstado = document.getElementById('entidad-convenio').value;
        var convenioInicio = document.getElementById('entidad-convenio-inicio').value;
        var convenioFin = document.getElementById('entidad-convenio-fin').value;

        if (!nombre) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showWarning('El nombre es obligatorio.');
            }
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
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Entidad actualizada correctamente.', 'success');
                }
            } else {
                await DBModule.execute(
                    `INSERT INTO entidades 
                        (nombre, sector, representante, telefono, email_contacto, direccion, logo, convenio_estado, convenio_fecha_inicio, convenio_fecha_fin) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [nombre, sector, representante, telefono, email, direccion, logo, convenioEstado, convenioInicio || null, convenioFin || null]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Entidad creada correctamente.', 'success');
                }
            }
            document.getElementById('formulario-entidad-container').innerHTML = '';
            renderEntidades().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al guardar entidad: ' + error.message, 'error');
            }
        }
    }

    function editarEntidad(id) { mostrarFormularioEntidad(id); }

    async function eliminarEntidad(id) {
        if (!confirm('Â¿Eliminar esta entidad?')) return;
        try {
            await DBModule.execute('DELETE FROM entidades WHERE id = ?', [id]);
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Entidad eliminada.', 'success');
            }
            renderEntidades().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al eliminar.', 'error');
            }
        }
    }

    // ============================================================
    // CARRERAS (CON EDICION COMPLETA)
    // ============================================================
    async function renderCarreras() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var carreras = await DBModule.query('SELECT * FROM carreras ORDER BY nombre');

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-graduation-cap"></i> Gestion de Carreras</h2>
                <div class="breadcrumb">${carreras.length} carreras registradas</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="AdminModule.mostrarFormularioCarrera()">
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
                                <th>Codigo</th>
                                <th>Nombre</th>
                                <th>Duracion</th>
                                <th>Acciones</th>
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
                    '<td>' + c.duracion_anios + ' aÃ±os</td>' +
                    '<td>' +
                    '<button class="btn btn-sm btn-secondary" onclick="AdminModule.editarCarrera(' + c.id + ')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="AdminModule.eliminarCarrera(' + c.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // FORMULARIO: CARRERA (CREAR Y EDITAR)
    // ============================================================
    function mostrarFormularioCarrera(carreraId) {
        var container = document.getElementById('formulario-carrera-container');
        if (!container) return;

        if (carreraId) {
            DBModule.query('SELECT * FROM carreras WHERE id = ?', [carreraId]).then(function(result) {
                if (result.length > 0) {
                    renderFormCarrera(result[0]);
                }
            });
        } else {
            renderFormCarrera(null);
        }

        function renderFormCarrera(carrera) {
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
                                <label>Codigo</label>
                                <input type="text" id="carrera-codigo" value="${isEditing ? carrera.codigo || '' : ''}" placeholder="Ej: IA-5">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Duracion (aÃ±os)</label>
                                <input type="number" id="carrera-duracion" value="${isEditing ? carrera.duracion_anios || 5 : 5}" min="1" max="6">
                            </div>
                            <div class="form-group">
                                <label>Descripcion</label>
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
                AdminModule.guardarCarrera();
            });
        }
    }

    async function guardarCarrera() {
        var id = document.getElementById('carrera-id')?.value;
        var nombre = document.getElementById('carrera-nombre').value.trim();
        var codigo = document.getElementById('carrera-codigo').value.trim();
        var duracion = parseInt(document.getElementById('carrera-duracion').value) || 5;
        var descripcion = document.getElementById('carrera-descripcion').value.trim();

        if (!nombre) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showWarning('El nombre es obligatorio.');
            }
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
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Carrera actualizada correctamente.', 'success');
                }
            } else {
                await DBModule.execute(
                    `INSERT INTO carreras (nombre, codigo, duracion_anios, descripcion) 
                     VALUES (?, ?, ?, ?)`,
                    [nombre, codigo || null, duracion, descripcion || null]
                );
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Carrera creada correctamente.', 'success');
                }
            }
            document.getElementById('formulario-carrera-container').innerHTML = '';
            renderCarreras().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al guardar carrera: ' + error.message, 'error');
            }
        }
    }

    function editarCarrera(id) { mostrarFormularioCarrera(id); }

    async function eliminarCarrera(id) {
        if (!confirm('Â¿Eliminar esta carrera?')) return;
        try {
            await DBModule.execute('DELETE FROM carreras WHERE id = ?', [id]);
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Carrera eliminada.', 'success');
            }
            renderCarreras().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al eliminar.', 'error');
            }
        }
    }

    // ============================================================
    // ASIGNAR TUTOR A EGRESADO (DESDE ADMIN)
    // ============================================================
    // ============================================================
    // ASIGNAR TUTOR A EGRESADO (DESDE ADMIN) CON BREADCRUMB
    // ============================================================
    function mostrarAsignacionTutor(breadcrumbHtml) {
        var container = document.getElementById('page-container');
        if (!container) return;

        // Obtener egresados sin tutor
        DBModule.query(
            `SELECT e.*, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             WHERE e.tutor_id IS NULL OR e.tutor_id = 0
             ORDER BY u.nombre`
        ).then(function(egresados) {
            // Obtener todos los tutores
            DBModule.query(
                `SELECT t.*, u.nombre as tutor_nombre 
                 FROM tutores t 
                 JOIN usuarios u ON t.usuario_id = u.id 
                 ORDER BY u.nombre`
            ).then(function(tutores) {
                var html = `
                    <div class="page-header">
                        <h2><i class="fas fa-user-graduate"></i> Asignar Tutores a Egresados</h2>
                        <div class="breadcrumb">Asignacion de tutores</div>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fas fa-users"></i> Egresados sin tutor</div>
                        ${egresados.length === 0 ? 
                            '<p class="text-muted">Todos los egresados tienen tutor asignado.</p>' :
                            `<div class="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Egresado</th>
                                            <th>Carrera</th>
                                            <th>Asignar Tutor</th>
                                            <th>Accion</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${egresados.map(function(e) {
                                            return `<tr>
                                                <td><strong>${e.egresado_nombre}</strong></td>
                                                <td>${e.carrera_nombre}</td>
                                                <td>
                                                    <select id="tutor-select-${e.id}" class="tutor-select" style="padding:6px 10px;border:2px solid #e2e8f0;border-radius:8px;">
                                                        <option value="">Selecciona un tutor...</option>
                                                        ${tutores.map(function(t) {
                                                            return `<option value="${t.id}">${t.tutor_nombre}</option>`;
                                                        }).join('')}
                                                    </select>
                                                </td>
                                                <td>
                                                    <button class="btn btn-sm btn-primary" onclick="AdminModule.asignarTutor(${e.id})">
                                                        <i class="fas fa-check"></i> Asignar
                                                    </button>
                                                </td>
                                            </tr>`;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>`
                        }
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fas fa-users"></i> Egresados con tutor asignado</div>
                        <div id="egresados-con-tutor">
                            <p class="text-muted">Cargando...</p>
                        </div>
                    </div>
                `;

                // Si hay breadcrumb, insertarlo antes del contenido
                if (breadcrumbHtml) {
                    container.innerHTML = breadcrumbHtml + html;
                } else {
                    container.innerHTML = html;
                }

                // Cargar egresados con tutor
                cargarEgresadosConTutor();
            });
        });
    }
	
    function cargarEgresadosConTutor() {
        DBModule.query(
            `SELECT e.*, u.nombre as egresado_nombre, c.nombre as carrera_nombre, tu.nombre as tutor_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             LEFT JOIN tutores t ON e.tutor_id = t.id 
             LEFT JOIN usuarios tu ON t.usuario_id = tu.id 
             WHERE e.tutor_id IS NOT NULL AND e.tutor_id != 0
             ORDER BY u.nombre`
        ).then(function(egresados) {
            var container = document.getElementById('egresados-con-tutor');
            if (!container) return;

            if (egresados.length === 0) {
                container.innerHTML = '<p class="text-muted">No hay egresados con tutor asignado.</p>';
                return;
            }

            var html = `<div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Egresado</th>
                            <th>Carrera</th>
                            <th>Tutor</th>
                            <th>Accion</th>
                        </tr>
                    </thead>
                    <tbody>`;
            egresados.forEach(function(e) {
                html += `<tr>
                    <td><strong>${e.egresado_nombre}</strong></td>
                    <td>${e.carrera_nombre}</td>
                    <td>${e.tutor_nombre || 'Sin asignar'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="AdminModule.removerTutor(${e.id})">
                            <i class="fas fa-times"></i> Remover
                        </button>
                    </td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
            container.innerHTML = html;
        });
    }

    function asignarTutor(egresadoId) {
        var select = document.getElementById('tutor-select-' + egresadoId);
        var tutorId = select.value;
        if (!tutorId) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showWarning('Selecciona un tutor.');
            }
            return;
        }
        DBModule.execute(
            'UPDATE egresados SET tutor_id = ? WHERE id = ?',
            [tutorId, egresadoId]
        ).then(function() {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Tutor asignado correctamente.', 'success');
            }
            mostrarAsignacionTutor();
        }).catch(function(error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al asignar tutor: ' + error.message, 'error');
            }
        });
    }

    function removerTutor(egresadoId) {
        if (!confirm('Â¿Remover el tutor de este egresado?')) return;
        DBModule.execute(
            'UPDATE egresados SET tutor_id = NULL WHERE id = ?',
            [egresadoId]
        ).then(function() {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Tutor removido correctamente.', 'success');
            }
            mostrarAsignacionTutor();
        }).catch(function(error) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('Error al remover tutor: ' + error.message, 'error');
            }
        });
    }

    // ============================================================
    // REPORTES
    // ============================================================
    async function renderReportes() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var stats = await getEstadisticasGenerales();

        return `
            <div class="page-header">
                <h2><i class="fas fa-file-pdf"></i> Reportes del Sistema</h2>
                <div class="breadcrumb">Estadisticas generales</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:18px;margin-bottom:24px;">
                <div class="stat-card">
                    <div class="stat-icon">ðŸ‘¤</div>
                    <div class="number">${stats.totalUsuarios}</div>
                    <div class="label">Usuarios</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">ðŸ‘¨â€ðŸŽ“</div>
                    <div class="number">${stats.totalGraduados}</div>
                    <div class="label">Graduados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">ðŸ§‘â€ðŸ«</div>
                    <div class="number">${stats.totalDocentes}</div>
                    <div class="label">Docentes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">ðŸ¢</div>
                    <div class="number">${stats.totalEntidades}</div>
                    <div class="label">Entidades</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-chart-bar"></i> Reporte General</div>
                <div style="padding:12px 0;">
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Total Usuarios</span>
                        <span class="badge badge-primary">${stats.totalUsuarios}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Total Graduados</span>
                        <span class="badge badge-success">${stats.totalGraduados}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Total Docentes</span>
                        <span class="badge badge-info">${stats.totalDocentes}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;">
                        <span>Total Entidades</span>
                        <span class="badge badge-warning">${stats.totalEntidades}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // ESTADISTICAS
    // ============================================================
    async function getEstadisticasGenerales() {
        try {
            var usuarios = await DBModule.query('SELECT COUNT(*) as total FROM usuarios');
            var graduados = await DBModule.query('SELECT COUNT(*) as total FROM graduados');
            var docentes = await DBModule.query('SELECT COUNT(*) as total FROM docentes');
            var entidades = await DBModule.query('SELECT COUNT(*) as total FROM entidades');

            return {
                totalUsuarios: usuarios[0]?.total || 0,
                totalGraduados: graduados[0]?.total || 0,
                totalDocentes: docentes[0]?.total || 0,
                totalEntidades: entidades[0]?.total || 0
            };
        } catch (error) {
            console.error('Error al obtener estadisticas:', error);
            return { totalUsuarios: 0, totalGraduados: 0, totalDocentes: 0, totalEntidades: 0 };
        }
    }

    // ============================================================
    // FUNCIONES DE IMPORTACION/EXPORTACION EXCEL
    // ============================================================

    // ---- USUARIOS ----
    function descargarPlantillaUsuarios() {
        var headers = ['username', 'password', 'email', 'nombre', 'apellidos', 'rol_id'];
        var data = [
            ['carlos.p', '123456', 'carlos@sispe.com', 'Carlos', 'Perez', '5'],
            ['ana.r', '123456', 'ana@sispe.com', 'Ana', 'Rodriguez', '5']
        ];
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet([headers].concat(data));
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
        XLSX.writeFile(wb, 'plantilla_usuarios.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Plantilla descargada.', 'success');
        }
    }

    async function importarUsuarios(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                var jsonData = XLSX.utils.sheet_to_json(firstSheet);

                var importados = 0;
                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var username = row.username || row.Usuario;
                    var password = row.password || row.Contrasena || '123456';
                    var email = row.email || row.Email;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos || '';
                    var rolId = row.rol_id || row.Rol || 5;

                    if (username && email && nombre) {
                        try {
                            await DBModule.execute(
                                'INSERT OR IGNORE INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
                                [username, password, email, nombre, apellidos, rolId]
                            );
                            importados++;
                        } catch (err) {
                            console.warn('Error importando:', err);
                        }
                    }
                }

                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Importados ' + importados + ' usuarios.', 'success');
                }
                renderUsuarios(document.getElementById('filtro-rol-usuarios')?.value || 'todos').then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(assignEvents, 100);
                });
            } catch (error) {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    async function exportarUsuarios() {
        var filtroRol = document.getElementById('filtro-rol-usuarios')?.value || 'todos';
        
        var query = 'SELECT * FROM usuarios';
        var params = [];
        
        if (filtroRol && filtroRol !== 'todos' && filtroRol !== '') {
            query += ' WHERE rol_id = ?';
            params.push(parseInt(filtroRol));
        }
        query += ' ORDER BY id';

        var usuarios = await DBModule.query(query, params);
        var roles = await DBModule.query('SELECT * FROM roles ORDER BY id');
        
        var rolesMap = {};
        for (var i = 0; i < roles.length; i++) {
            rolesMap[roles[i].id] = roles[i].nombre;
        }

        var data = usuarios.map(function(u) {
            var rolNombre = rolesMap[u.rol_id] || 'Sin rol';
            return { 
                Usuario: u.username, 
                Email: u.email, 
                Nombre: u.nombre, 
                Apellidos: u.apellidos || '', 
                Rol: rolNombre,
                Activo: u.activo ? 'Si' : 'No'
            };
        });
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
        XLSX.writeFile(wb, 'usuarios_exportados.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportado correctamente.', 'success');
        }
    }

    // ---- GRADUADOS ----
    function descargarPlantillaGraduados() {
        var headers = ['numero_identidad', 'nombre', 'apellidos', 'carrera_id', 'anio_graduacion', 'email_institucional', 'titulo_oro', 'graduado_integral'];
        var data = [
            ['88010112345', 'Carlos', 'Perez', '1', '2024', 'carlos@uiij.co.cu', '0', '0'],
            ['89020223456', 'Ana', 'Rodriguez', '2', '2024', 'ana@uiij.co.cu', '1', '1']
        ];
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet([headers].concat(data));
        XLSX.utils.book_append_sheet(wb, ws, 'Graduados');
        XLSX.writeFile(wb, 'plantilla_graduados.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Plantilla descargada.', 'success');
        }
    }

    async function importarGraduados(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                var jsonData = XLSX.utils.sheet_to_json(firstSheet);

                var importados = 0;
                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var identidad = row.numero_identidad || row.Identidad;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos;
                    var carreraId = parseInt(row.carrera_id || row.Carrera || 1);
                    var anio = parseInt(row.anio_graduacion || row.Anio || 2024);
                    var email = row.email_institucional || row.Email || '';
                    var tituloOro = parseInt(row.titulo_oro || row.TituloOro || 0);
                    var integral = parseInt(row.graduado_integral || row.Integral || 0);

                    if (identidad && nombre && apellidos) {
                        try {
                            await DBModule.execute(
                                'INSERT OR IGNORE INTO graduados (numero_identidad, nombre, apellidos, carrera_id, anio_graduacion, email_institucional, titulo_oro, graduado_integral) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                                [identidad, nombre, apellidos, carreraId, anio, email, tituloOro, integral]
                            );
                            importados++;
                        } catch (err) {
                            console.warn('Error importando:', err);
                        }
                    }
                }

                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Importados ' + importados + ' graduados.', 'success');
                }
                renderGraduados().then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(assignEvents, 100);
                });
            } catch (error) {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    async function exportarGraduados() {
        var graduados = await DBModule.query('SELECT g.numero_identidad, g.nombre, g.apellidos, c.nombre as carrera, g.anio_graduacion FROM graduados g JOIN carreras c ON g.carrera_id = c.id');
        var data = graduados.map(function(g) {
            return { Identidad: g.numero_identidad, Nombre: g.nombre, Apellidos: g.apellidos, Carrera: g.carrera, Anio: g.anio_graduacion };
        });
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Graduados');
        XLSX.writeFile(wb, 'graduados_exportados.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportado correctamente.', 'success');
        }
    }

    // ---- DOCENTES ----
    function descargarPlantillaDocentes() {
        var headers = ['numero_identidad', 'nombre', 'apellidos', 'email_institucional', 'departamento', 'categoria_docente', 'email_personal', 'telefono', 'disponible'];
        var data = [
            ['76010112345', 'Maria', 'Gomez', 'maria@uiij.co.cu', 'Ciencias Agricolas', 'Principal', '', '', '1'],
            ['77020223456', 'Pedro', 'Ramirez', 'pedro@uiij.co.cu', 'Economia', 'Auxiliar', '', '', '1']
        ];
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet([headers].concat(data));
        XLSX.utils.book_append_sheet(wb, ws, 'Docentes');
        XLSX.writeFile(wb, 'plantilla_docentes.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Plantilla descargada.', 'success');
        }
    }

    async function importarDocentes(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                var jsonData = XLSX.utils.sheet_to_json(firstSheet);

                var importados = 0;
                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var identidad = row.numero_identidad || row.Identidad;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos;
                    var email = row.email_institucional || row.Email || '';
                    var departamento = row.departamento || row.Departamento || '';
                    var categoria = row.categoria_docente || row.Categoria || '';
                    var emailPersonal = row.email_personal || '';
                    var telefono = row.telefono || '';
                    var disponible = row.disponible || '1';

                    if (identidad && nombre && apellidos) {
                        try {
                            await DBModule.execute(
                                `INSERT OR IGNORE INTO docentes 
                                    (numero_identidad, nombre, apellidos, email_institucional, departamento, categoria_docente, email_personal, telefono, disponible) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [identidad, nombre, apellidos, email, departamento, categoria, emailPersonal, telefono, disponible]
                            );
                            importados++;
                        } catch (err) {
                            console.warn('Error importando:', err);
                        }
                    }
                }

                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Importados ' + importados + ' docentes.', 'success');
                }
                renderDocentes().then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(assignEvents, 100);
                });
            } catch (error) {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    async function exportarDocentes() {
        var docentes = await DBModule.query('SELECT * FROM docentes');
        var data = docentes.map(function(d) {
            return { 
                Identidad: d.numero_identidad, 
                Nombre: d.nombre, 
                Apellidos: d.apellidos, 
                Email: d.email_institucional, 
                Departamento: d.departamento || '', 
                Categoria: d.categoria_docente || '',
                EmailPersonal: d.email_personal || '',
                Telefono: d.telefono || '',
                Disponible: d.disponible ? 'Si' : 'No'
            };
        });
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Docentes');
        XLSX.writeFile(wb, 'docentes_exportados.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportado correctamente.', 'success');
        }
    }

    // ---- ENTIDADES ----
    function descargarPlantillaEntidades() {
        var headers = ['nombre', 'sector', 'representante', 'telefono', 'logo', 'email_contacto', 'direccion', 'convenio_estado', 'convenio_fecha_inicio', 'convenio_fecha_fin'];
        var data = [
            ['Empresa Citricola', 'Produccion de alimentos', 'Ing. Roberto Mendez', '+53 48 123456', 'ðŸŠ', 'contacto@citricola.cu', 'Carretera de la Fruta Km 3', 'activo', '2025-01-01', '2025-12-31'],
            ['Oficina del Turismo', 'Turismo', 'Lic. Mariana Perez', '+53 48 789012', 'ðŸ¨', 'turismo@islajuventud.cu', 'Calle 39 No. 120', 'activo', '2025-01-01', '2025-12-31']
        ];
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet([headers].concat(data));
        XLSX.utils.book_append_sheet(wb, ws, 'Entidades');
        XLSX.writeFile(wb, 'plantilla_entidades.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Plantilla descargada.', 'success');
        }
    }

    async function importarEntidades(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                var jsonData = XLSX.utils.sheet_to_json(firstSheet);

                var importados = 0;
                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var nombre = row.nombre || row.Nombre;
                    var sector = row.sector || row.Sector || '';
                    var representante = row.representante || row.Representante || '';
                    var telefono = row.telefono || row.Telefono || '';
                    var logo = row.logo || row.Logo || 'ðŸ¢';
                    var email = row.email_contacto || row.Email || '';
                    var direccion = row.direccion || row.Direccion || '';
                    var convenioEstado = row.convenio_estado || row.Convenio || 'activo';
                    var convenioInicio = row.convenio_fecha_inicio || '';
                    var convenioFin = row.convenio_fecha_fin || '';

                    if (nombre) {
                        try {
                            await DBModule.execute(
                                `INSERT OR IGNORE INTO entidades 
                                    (nombre, sector, representante, telefono, logo, email_contacto, direccion, convenio_estado, convenio_fecha_inicio, convenio_fecha_fin) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [nombre, sector, representante, telefono, logo, email, direccion, convenioEstado, convenioInicio || null, convenioFin || null]
                            );
                            importados++;
                        } catch (err) {
                            console.warn('Error importando:', err);
                        }
                    }
                }

                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Importados ' + importados + ' entidades.', 'success');
                }
                renderEntidades().then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(assignEvents, 100);
                });
            } catch (error) {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    async function exportarEntidades() {
        var entidades = await DBModule.query('SELECT * FROM entidades');
        var data = entidades.map(function(e) {
            return { 
                Nombre: e.nombre, 
                Sector: e.sector || '', 
                Representante: e.representante || '', 
                Telefono: e.telefono || '', 
                Logo: e.logo || 'ðŸ¢',
                Email: e.email_contacto || '',
                Direccion: e.direccion || '',
                Convenio: e.convenio_estado || 'sin convenio',
                Inicio: e.convenio_fecha_inicio || '',
                Fin: e.convenio_fecha_fin || ''
            };
        });
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Entidades');
        XLSX.writeFile(wb, 'entidades_exportadas.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportado correctamente.', 'success');
        }
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        // Los eventos se manejan en los botones inline
    }

    // ============================================================
    // CARGAR DATOS
    // ============================================================
    async function loadData() {
        var stats = await getEstadisticasGenerales();
        var container = document.getElementById('estadisticas-admin');
        if (container) {
            container.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:18px;">
                    <div class="stat-card">
                        <div class="stat-icon">ðŸ‘¤</div>
                        <div class="number">${stats.totalUsuarios}</div>
                        <div class="label">Usuarios</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">ðŸ‘¨â€ðŸŽ“</div>
                        <div class="number">${stats.totalGraduados}</div>
                        <div class="label">Graduados</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">ðŸ§‘â€ðŸ«</div>
                        <div class="number">${stats.totalDocentes}</div>
                        <div class="label">Docentes</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">ðŸ¢</div>
                        <div class="number">${stats.totalEntidades}</div>
                        <div class="label">Entidades</div>
                    </div>
                </div>
            `;
        }
    }

    // ============================================================
    // EXPOSICION PUBLICA
    // ============================================================
    return {
        navigate: navigate,
        isAdmin: isAdmin,
        // Usuarios
        mostrarFormularioUsuario: mostrarFormularioUsuario,
        guardarUsuario: guardarUsuario,
        editarUsuario: editarUsuario,
        eliminarUsuario: eliminarUsuario,
        descargarPlantillaUsuarios: descargarPlantillaUsuarios,
        importarUsuarios: importarUsuarios,
        exportarUsuarios: exportarUsuarios,
        aplicarFiltroUsuarios: aplicarFiltroUsuarios,
        // Graduados
        renderGraduados: renderGraduados,
        descargarPlantillaGraduados: descargarPlantillaGraduados,
        importarGraduados: importarGraduados,
        exportarGraduados: exportarGraduados,
        editarGraduado: editarGraduado,
        eliminarGraduado: eliminarGraduado,
        mostrarFormularioGraduado: mostrarFormularioGraduado,
        guardarGraduado: guardarGraduado,
        // Docentes
        renderDocentes: renderDocentes,
        descargarPlantillaDocentes: descargarPlantillaDocentes,
        importarDocentes: importarDocentes,
        exportarDocentes: exportarDocentes,
        editarDocente: editarDocente,
        eliminarDocente: eliminarDocente,
        mostrarFormularioDocente: mostrarFormularioDocente,
        guardarDocente: guardarDocente,
        // Entidades
        renderEntidades: renderEntidades,
        descargarPlantillaEntidades: descargarPlantillaEntidades,
        importarEntidades: importarEntidades,
        exportarEntidades: exportarEntidades,
        editarEntidad: editarEntidad,
        eliminarEntidad: eliminarEntidad,
        mostrarFormularioEntidad: mostrarFormularioEntidad,
        guardarEntidad: guardarEntidad,
        // Carreras
        renderCarreras: renderCarreras,
        editarCarrera: editarCarrera,
        eliminarCarrera: eliminarCarrera,
        mostrarFormularioCarrera: mostrarFormularioCarrera,
        guardarCarrera: guardarCarrera,
        // Asignar Tutores
        mostrarAsignacionTutor: mostrarAsignacionTutor,
        asignarTutor: asignarTutor,
        removerTutor: removerTutor,
        // Reportes
        renderReportes: renderReportes
    };

})();

// EXPONER AdminModule GLOBALMENTE
window.AdminModule = AdminModule;

console.log('âœ… AdminModule cargado correctamente.');
