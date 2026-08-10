// ============================================================
// SISPE - admin.usuarios.js
// Gestión de Usuarios con PAGINACIÓN
// RUTA: js/modules/admin/admin.usuarios.js
// ============================================================

var AdminUsuarios = (function() {
    'use strict';

    var paginaActual = 1;
    var filtroActual = 'todos';

    // ============================================================
    // RENDERIZAR LISTA DE USUARIOS CON PAGINACIÓN
    // ============================================================
    async function renderUsuarios(filtroRol, pagina) {
        if (!AdminCore.isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        filtroActual = filtroRol || filtroActual || 'todos';
        paginaActual = pagina || paginaActual || 1;

        var roles = await DBModule.query('SELECT * FROM roles ORDER BY id');
        
        var rolesMap = {};
        for (var i = 0; i < roles.length; i++) {
            rolesMap[roles[i].id] = roles[i].nombre;
        }

        // ============================================================
        // 1. OBTENER TOTAL DE REGISTROS
        // ============================================================
        var countQuery = 'SELECT COUNT(*) as total FROM usuarios';
        var countParams = [];
        
        if (filtroActual && filtroActual !== 'todos' && filtroActual !== '') {
            countQuery += ' WHERE rol_id = ?';
            countParams.push(parseInt(filtroActual));
        }

        var countResult = await DBModule.query(countQuery, countParams);
        var totalItems = countResult[0]?.total || 0;

        // ============================================================
        // 2. OBTENER DATOS PAGINADOS
        // ============================================================
        var paginacion = PaginacionModule.getPaginacion(paginaActual, totalItems);
        
        var query = 'SELECT * FROM usuarios';
        var params = [];
        
        if (filtroActual && filtroActual !== 'todos' && filtroActual !== '') {
            query += ' WHERE rol_id = ?';
            params.push(parseInt(filtroActual));
        }
        query += ' ORDER BY id LIMIT ? OFFSET ?';
        params.push(paginacion.limit, paginacion.offset);

        var usuarios = await DBModule.query(query, params);

        // ============================================================
        // 3. PROCESAR DATOS
        // ============================================================
        for (var i = 0; i < usuarios.length; i++) {
            var u = usuarios[i];
            u.rol_nombre = rolesMap[u.rol_id] || 'Sin rol';
            
            var rolesExtra = await DBModule.query(
                'SELECT r.nombre FROM usuarios_roles ur JOIN roles r ON ur.rol_id = r.id WHERE ur.usuario_id = ?',
                [u.id]
            );
            u.roles_extra = rolesExtra.map(function(r) { return r.nombre; });
        }

        // ============================================================
        // 4. GENERAR HTML
        // ============================================================
        var filtroOptions = '<option value="todos">Todos los roles</option>';
        for (var i = 0; i < roles.length; i++) {
            var selected = (filtroActual && parseInt(filtroActual) === roles[i].id) ? 'selected' : '';
            filtroOptions += '<option value="' + roles[i].id + '" ' + selected + '>' + roles[i].nombre + '</option>';
        }

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-users-cog"></i> Gesti&oacute;n de Usuarios</h2>
                <div class="breadcrumb">${totalItems} usuarios registrados</div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center;">
                <button class="btn btn-primary" onclick="AdminUsuarios.mostrarFormulario()">
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
                    <select id="filtro-rol-usuarios" onchange="AdminUsuarios.aplicarFiltro(this.value)" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;background:white;cursor:pointer;">
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
                                <th>Rol Principal</th>
                                <th>Roles Adicionales</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (usuarios.length === 0) {
            html += '<tr><td colspan="8" class="text-center text-muted">No hay usuarios con este rol.</td></tr>';
        } else {
            for (var i = 0; i < usuarios.length; i++) {
                var u = usuarios[i];
                var estado = u.activo ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-danger">Inactivo</span>';
                var rolNombre = u.rol_nombre || 'Sin rol';
                var rolesExtra = u.roles_extra || [];
                var rolesExtraText = rolesExtra.length > 0 ? rolesExtra.map(function(r) { 
                    return '<span class="badge badge-info" style="margin:2px;">' + r + '</span>'; 
                }).join(' ') : '<span class="text-muted" style="font-size:12px;">Sin roles adicionales</span>';
                
                var nombreCompleto = u.nombre + ' ' + (u.apellidos || '');
                if (nombreCompleto.includes('&')) {
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = nombreCompleto;
                    nombreCompleto = tempDiv.textContent;
                }
                
                html += '<tr><td>' + u.id + '</td>' +
                    '<td><strong>' + u.username + '</strong></td>' +
                    '<td>' + nombreCompleto + '</td>' +
                    '<td>' + u.email + '</td>' +
                    '<td><span class="badge badge-primary">' + rolNombre + '</span></td>' +
                    '<td style="font-size:12px;">' + rolesExtraText + '</td>' +
                    '<td>' + estado + '</td>' +
                    '<td>' +
                    '<button class="btn btn-sm btn-secondary" onclick="AdminUsuarios.editar(' + u.id + ')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="AdminUsuarios.eliminar(' + u.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
                
                <!-- ?? CONTROLES DE PAGINACIÓN -->
                <div id="paginacion-usuarios-container"></div>
            </div>
        `;

        // ============================================================
        // 5. RENDERIZAR PAGINACIÓN
        // ============================================================
        setTimeout(function() {
            PaginacionModule.renderizar(
                paginaActual,
                totalItems,
                function(nuevaPagina) {
                    paginaActual = nuevaPagina;
                    renderUsuarios(filtroActual, nuevaPagina).then(function(html) {
                        document.getElementById('page-container').innerHTML = html;
                        setTimeout(AdminCore.assignEvents, 100);
                    });
                },
                'paginacion-usuarios-container'
            );
        }, 50);

        return html;
    }

    // ============================================================
    // APLICAR FILTRO
    // ============================================================
    function aplicarFiltro(rolId) {
        filtroActual = rolId;
        paginaActual = 1;
        renderUsuarios(rolId, 1).then(function(html) {
            document.getElementById('page-container').innerHTML = html;
            setTimeout(AdminCore.assignEvents, 100);
        });
    }

    // ============================================================
    // FORMULARIO: USUARIO CON MULTI-ROL
    // ============================================================
    function mostrarFormulario(usuarioId) {
        var container = document.getElementById('formulario-usuario-container');
        if (!container) return;

        if (usuarioId) {
            DBModule.query('SELECT * FROM usuarios WHERE id = ?', [usuarioId]).then(function(result) {
                if (result.length > 0) {
                    renderForm(result[0]);
                }
            });
        } else {
            renderForm(null);
        }

        function renderForm(usuario) {
            var isEditing = !!usuario;
            var user = AuthModule.getCurrentUser();
            var esAdmin = user && (user.rol_nombre === 'administrador' || user.id === 1);
            
            Promise.all([
                DBModule.query('SELECT * FROM roles ORDER BY id'),
                isEditing ? DBModule.query(
                    'SELECT rol_id FROM usuarios_roles WHERE usuario_id = ?',
                    [usuario.id]
                ) : Promise.resolve([])
            ]).then(function(results) {
                var roles = results[0];
                var rolesActuales = results[1].map(function(r) { return r.rol_id; });
                
                var rolesPermitidos = esAdmin ? [1, 2, 3, 4, 5] : [1, 2, 4];
                
                if (isEditing && usuario.id === 1) {
                    rolesActuales = [1, 2, 3, 4, 5];
                }
                
                var rolesAdicionalesFiltrados = roles.filter(function(r) {
                    if (isEditing && r.id === usuario.rol_id) return false;
                    return rolesPermitidos.includes(r.id);
                });
                
                var adminMessage = esAdmin ? 
                    '<span style="font-size:12px;color:#1a8a4a;font-weight:400;margin-left:12px;">?? Tienes permisos de administrador - puedes asignar todos los roles</span>' : '';
                
                container.innerHTML = `
                    <div class="card" style="border:2px solid #2a6b9c;">
                        <div class="card-title">
                            <i class="fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'}"></i> 
                            ${isEditing ? 'Editar' : 'Nuevo'} Usuario
                            ${adminMessage}
                            ${isEditing ? '<span style="font-size:12px;color:#94a3b8;font-weight:400;margin-left:12px;">ID: ' + usuario.id + '</span>' : ''}
                        </div>
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
                                    <label>Rol Principal <span class="required">*</span></label>
                                    <select id="usuario-rol" required>
                                        ${roles.map(function(r) {
                                            var selected = isEditing && usuario.rol_id === r.id ? 'selected' : '';
                                            return '<option value="' + r.id + '" ' + selected + '>' + r.nombre + '</option>';
                                        }).join('')}
                                    </select>
                                    <small style="color:#94a3b8;font-size:12px;">Este es el rol principal con el que iniciar&aacute; sesi&oacute;n</small>
                                </div>
                                <div class="form-group">
                                    <label>Estado</label>
                                    <select id="usuario-estado">
                                        <option value="1" ${isEditing && usuario.activo === 1 ? 'selected' : ''}>Activo</option>
                                        <option value="0" ${isEditing && usuario.activo === 0 ? 'selected' : ''}>Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group" style="border:2px dashed #2a6b9c;border-radius:10px;padding:16px;margin-bottom:16px;background:#f8fafc;">
                                <label style="font-weight:700;color:#0a1e3c;display:flex;align-items:center;gap:8px;">
                                    <i class="fas fa-exchange-alt" style="color:#2a6b9c;"></i>
                                    Roles Adicionales (Multi-Rol)
                                    <span style="font-size:12px;font-weight:400;color:#94a3b8;">
                                        ${esAdmin ? '?? Administrador puede asignar todos los roles' : '(Solo Administrador, Coordinador y Tutor pueden compartirse)'}
                                    </span>
                                </label>
                                <select id="usuario-roles-adicionales" multiple style="width:100%;min-height:100px;padding:8px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;">
                                    ${rolesAdicionalesFiltrados.map(function(r) {
                                        var selected = rolesActuales.includes(r.id) ? 'selected' : '';
                                        return '<option value="' + r.id + '" ' + selected + '>' + r.nombre + '</option>';
                                    }).join('')}
                                    ${rolesAdicionalesFiltrados.length === 0 ? '<option value="" disabled>No hay roles disponibles para compartir</option>' : ''}
                                </select>
                                <div style="display:flex;gap:12px;margin-top:6px;flex-wrap:wrap;">
                                    <button type="button" class="btn btn-sm btn-outline" onclick="AdminUsuarios.seleccionarTodosRoles()">
                                        <i class="fas fa-check-double"></i> Seleccionar todos
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline" onclick="AdminUsuarios.deseleccionarTodosRoles()">
                                        <i class="fas fa-times"></i> Deseleccionar todos
                                    </button>
                                    <span style="font-size:12px;color:#94a3b8;display:flex;align-items:center;">
                                        <i class="fas fa-info-circle"></i> 
                                        Mant&eacute;n Ctrl (Cmd en Mac) para seleccionar m&uacute;ltiples
                                    </span>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>${isEditing ? 'Nueva Contrase&ntilde;a (opcional)' : 'Contrase&ntilde;a <span class="required">*</span>'}</label>
                                    <div style="display:flex;align-items:center;gap:8px;position:relative;">
                                        <input type="password" id="usuario-password" 
                                               ${isEditing ? '' : 'required minlength="6"'} 
                                               placeholder="${isEditing ? 'Dejar vac&iacute;o para no cambiar' : 'M&iacute;nimo 6 caracteres'}"
                                               style="flex:1;padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;padding-right:44px;">
                                        <button type="button" id="toggle-password-btn" 
                                                style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
                                                       background:transparent;border:none;font-size:18px;cursor:pointer;color:#94a3b8;padding:4px 8px;border-radius:6px;
                                                       transition:all 0.2s;"
                                                onmouseover="this.style.color='#0a1e3c';"
                                                onmouseout="this.style.color='#94a3b8';">
                                            <i class="fas fa-eye" id="toggle-password-icon"></i>
                                        </button>
                                    </div>
                                    ${isEditing ? '<small style="color:#94a3b8;font-size:12px;">Deja el campo vac&iacute;o para mantener la contrase&ntilde;a actual</small>' : ''}
                                </div>
                                ${!isEditing ? '<div class="form-group"><label>Confirmar Contrase&ntilde;a <span class="required">*</span></label><input type="password" id="usuario-password-confirm" placeholder="Repite la contrase&ntilde;a" required minlength="6"></div>' : ''}
                            </div>
                            
                            <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">
                                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-usuario-container').innerHTML=''">Cancelar</button>
                            </div>
                        </form>
                    </div>
                `;

                var toggleBtn = document.getElementById('toggle-password-btn');
                var passInput = document.getElementById('usuario-password');
                var icon = document.getElementById('toggle-password-icon');
                
                if (toggleBtn && passInput && icon) {
                    toggleBtn.addEventListener('click', function() {
                        if (passInput.type === 'password') {
                            passInput.type = 'text';
                            icon.className = 'fas fa-eye-slash';
                        } else {
                            passInput.type = 'password';
                            icon.className = 'fas fa-eye';
                        }
                    });
                }

                document.getElementById('form-usuario').addEventListener('submit', function(e) {
                    e.preventDefault();
                    AdminUsuarios.guardar();
                });
            });
        }
    }

    // ============================================================
    // GUARDAR USUARIO CON MULTI-ROL
    // ============================================================
    async function guardar() {
        var id = document.getElementById('usuario-id')?.value;
        var username = document.getElementById('usuario-username').value.trim();
        var email = document.getElementById('usuario-email').value.trim();
        var nombre = document.getElementById('usuario-nombre').value.trim();
        var apellidos = document.getElementById('usuario-apellidos').value.trim();
        var rolId = parseInt(document.getElementById('usuario-rol').value);
        var activo = parseInt(document.getElementById('usuario-estado').value);
        var password = document.getElementById('usuario-password').value;

        var selectRoles = document.getElementById('usuario-roles-adicionales');
        var rolesAdicionales = [];
        if (selectRoles) {
            for (var i = 0; i < selectRoles.options.length; i++) {
                if (selectRoles.options[i].selected) {
                    var val = parseInt(selectRoles.options[i].value);
                    if (val !== rolId) {
                        rolesAdicionales.push(val);
                    }
                }
            }
        }

        var user = AuthModule.getCurrentUser();
        var esAdmin = user && (user.rol_nombre === 'administrador' || user.id === 1);
        
        var rolesPermitidos = esAdmin ? [1, 2, 3, 4, 5] : [1, 2, 4];

        var rolesAdicionalesFiltrados = rolesAdicionales.filter(function(rolId) {
            return rolesPermitidos.includes(rolId);
        });

        if (rolesAdicionales.length !== rolesAdicionalesFiltrados.length && !esAdmin) {
            var rolesNoPermitidos = rolesAdicionales.filter(function(rolId) {
                return !rolesPermitidos.includes(rolId);
            });
            var nombresRoles = [];
            for (var i = 0; i < rolesNoPermitidos.length; i++) {
                var result = await DBModule.query(
                    'SELECT nombre FROM roles WHERE id = ?',
                    [rolesNoPermitidos[i]]
                );
                if (result.length > 0) {
                    nombresRoles.push(result[0].nombre);
                }
            }
            var nombres = nombresRoles.join(', ');
            await ModalModule.warning('Los roles "' + nombres + '" no pueden ser compartidos. Solo Administrador, Tutor y Coordinador pueden tener roles adicionales.');
            if (rolesAdicionalesFiltrados.length === 0) {
                return;
            }
        }

        if (!username || !email || !nombre || !rolId) {
            await ModalModule.warning('Completa todos los campos requeridos.');
            return;
        }

        try {
            var usuarioId;
            
            if (id) {
                if (password && password.length > 0) {
                    if (password.length < 6) {
                        await ModalModule.warning('La contrase&ntilde;a debe tener al menos 6 caracteres.');
                        return;
                    }
                    await DBModule.execute(
                        'UPDATE usuarios SET username = ?, email = ?, nombre = ?, apellidos = ?, rol_id = ?, activo = ?, password = ? WHERE id = ?',
                        [username, email, nombre, apellidos, rolId, activo, password, id]
                    );
                } else {
                    await DBModule.execute(
                        'UPDATE usuarios SET username = ?, email = ?, nombre = ?, apellidos = ?, rol_id = ?, activo = ? WHERE id = ?',
                        [username, email, nombre, apellidos, rolId, activo, id]
                    );
                }
                usuarioId = parseInt(id);
                
                await DBModule.execute(
                    'DELETE FROM usuarios_roles WHERE usuario_id = ?',
                    [usuarioId]
                );
                
                for (var i = 0; i < rolesAdicionalesFiltrados.length; i++) {
                    if (rolesAdicionalesFiltrados[i] !== rolId) {
                        await DBModule.execute(
                            'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
                            [usuarioId, rolesAdicionalesFiltrados[i]]
                        );
                    }
                }
                
                var mensaje = 'Usuario actualizado correctamente.';
                if (rolesAdicionalesFiltrados.length > 0) {
                    mensaje += ' Roles adicionales: ' + rolesAdicionalesFiltrados.length;
                }
                await ModalModule.success(mensaje);
                
            } else {
                if (!password || password.length < 6) {
                    await ModalModule.warning('La contrase&ntilde;a debe tener al menos 6 caracteres.');
                    return;
                }
                var passwordConfirm = document.getElementById('usuario-password-confirm').value;
                if (password !== passwordConfirm) {
                    await ModalModule.warning('Las contrase&ntilde;as no coinciden.');
                    return;
                }
                
                var result = await DBModule.execute(
                    'INSERT INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [username, password, email, nombre, apellidos, rolId, activo]
                );
                usuarioId = result.lastID;
                
                for (var i = 0; i < rolesAdicionalesFiltrados.length; i++) {
                    if (rolesAdicionalesFiltrados[i] !== rolId) {
                        await DBModule.execute(
                            'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
                            [usuarioId, rolesAdicionalesFiltrados[i]]
                        );
                    }
                }
                
                if (usuarioId === 1) {
                    for (var i = 1; i <= 5; i++) {
                        if (i !== rolId) {
                            await DBModule.execute(
                                'INSERT OR IGNORE INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
                                [usuarioId, i]
                            );
                        }
                    }
                    console.log('?? Admin con todos los roles');
                }
                
                var mensaje = 'Usuario creado correctamente.';
                if (rolesAdicionalesFiltrados.length > 0) {
                    mensaje += ' Roles adicionales: ' + rolesAdicionalesFiltrados.length;
                }
                await ModalModule.success(mensaje);
            }
            
            var session = JSON.parse(localStorage.getItem('sispe_session'));
            if (session && session.user && session.user.id === usuarioId) {
                var roles = await DBModule.query(
                    `SELECT r.nombre 
                     FROM usuarios_roles ur 
                     JOIN roles r ON ur.rol_id = r.id 
                     WHERE ur.usuario_id = ?`,
                    [usuarioId]
                );
                var rolesExtra = roles.map(function(r) { return r.nombre; });
                var rolPrincipal = await DBModule.query(
                    'SELECT nombre FROM roles WHERE id = ?',
                    [rolId]
                );
                var rolNombre = rolPrincipal.length > 0 ? rolPrincipal[0].nombre : 'egresado';
                var todosLosRoles = [rolNombre, ...rolesExtra];
                todosLosRoles = [...new Set(todosLosRoles)];
                
                session.user.rol_nombre = rolNombre;
                session.user.rol_id = rolId;
                session.user.roles_adicionales = rolesExtra;
                session.user.todos_los_roles = todosLosRoles;
                localStorage.setItem('sispe_session', JSON.stringify(session));
                
                if (window.AuthModule) {
                    AuthModule.currentUser = session.user;
                    AuthModule.currentSession = session;
                }
                console.log('? Sesión actualizada con nuevos roles:', todosLosRoles);
            }
            
            document.getElementById('formulario-usuario-container').innerHTML = '';
            renderUsuarios(document.getElementById('filtro-rol-usuarios')?.value || 'todos').then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(AdminCore.assignEvents, 100);
            });
            
        } catch (error) {
            await ModalModule.error('Error al guardar usuario: ' + error.message);
        }
    }

    // ============================================================
    // ELIMINAR USUARIO
    // ============================================================
    async function eliminar(id) {
        var confirmado = await ModalModule.confirmDelete('&iquest;Est&aacute;s seguro de que quieres eliminar este usuario? Esta acci&oacute;n no se puede deshacer.');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM usuarios_roles WHERE usuario_id = ?', [id]);
            await DBModule.execute('DELETE FROM usuarios WHERE id = ?', [id]);
            await ModalModule.success('Usuario eliminado correctamente.');
            renderUsuarios(document.getElementById('filtro-rol-usuarios')?.value || 'todos').then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(AdminCore.assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // SELECCIONAR/DESELECCIONAR ROLES
    // ============================================================
    function seleccionarTodosRoles() {
        var select = document.getElementById('usuario-roles-adicionales');
        if (!select) return;
        for (var i = 0; i < select.options.length; i++) {
            select.options[i].selected = true;
        }
    }

    function deseleccionarTodosRoles() {
        var select = document.getElementById('usuario-roles-adicionales');
        if (!select) return;
        for (var i = 0; i < select.options.length; i++) {
            select.options[i].selected = false;
        }
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
        render: renderUsuarios,
        mostrarFormulario: mostrarFormulario,
        guardar: guardar,
        editar: mostrarFormulario,
        eliminar: eliminar,
        aplicarFiltro: aplicarFiltro,
        seleccionarTodosRoles: seleccionarTodosRoles,
        deseleccionarTodosRoles: deseleccionarTodosRoles
    };

})();

window.AdminUsuarios = AdminUsuarios;
console.log('? AdminUsuarios cargado correctamente.');