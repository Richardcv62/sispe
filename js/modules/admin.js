// ============================================================
// SISPE - admin.js
// Modulo de Administracion - CON MODALES Y PERSISTENCIA
// RUTA: js/modules/admin.js
// ============================================================

const AdminModule = (function() {
    'use strict';

    // ============================================================
    // GENERAR BREADCRUMB AUTOMÁTICAMENTE
    // ============================================================
    function generateBreadcrumb(pageId) {
        var pageLabels = {
            'dashboard': 'Dashboard',
            'usuarios': 'Usuarios',
            'graduados': 'Graduados',
            'docentes': 'Docentes',
            'entidades': 'Entidades',
            'carreras': 'Carreras',
            'asignar-tutores': 'Asignar Tutores',
            'investigadores': 'Investigadores',
            'competencias': 'Competencias',
            'cursos': 'Cursos',
            'eventos': 'Eventos',
            'proyecto': 'Proyecto UnivSoc',
            'reportes': 'Reportes'
        };

        var label = pageLabels[pageId] || pageId;
        var user = AuthModule.getCurrentUser();
        var userName = user ? user.nombre : 'Usuario';
        var roleName = user ? user.rol_nombre : '';

        if (pageId === 'dashboard') {
            return `
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <i class="fas fa-home" style="color:#0a1e3c;"></i>
                        <span style="color:#0a1e3c;font-weight:600;">Dashboard</span>
                    </div>
                    <div style="font-size:13px;color:#94a3b8;">
                        ${userName} · ${roleName}
                    </div>
                </div>
            `;
        }

        return `
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <a href="#" onclick="App.navigate('dashboard');return false;" style="color:#0a1e3c;text-decoration:none;font-weight:600;display:flex;align-items:center;gap:4px;">
                        <i class="fas fa-home"></i> Dashboard
                    </a>
                    <span style="color:#94a3b8;">/</span>
                    <span style="color:#475569;font-weight:500;">${label}</span>
                </div>
                <div>
                    <button onclick="App.navigate('dashboard');" style="padding:6px 16px;background:#0a1e3c;color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px;">
                        <i class="fas fa-arrow-left"></i> Volver al Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    // NAVEGACION PRINCIPAL
    // ============================================================
    function navigate(page, breadcrumb) {
        console.log('📊 AdminModule.navigate llamado con:', page);
        var container = document.getElementById('page-container');
        if (!container) {
            console.error('❌ page-container no encontrado');
            return;
        }

        var breadcrumbHtml = breadcrumb || generateBreadcrumb(page);

        switch(page) {
            case 'dashboard':
                container.innerHTML = breadcrumbHtml + renderDashboard();
                setTimeout(assignEvents, 100);
                setTimeout(loadData, 200);
                return;
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
            case 'investigadores':
                renderInvestigadores().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar investigadores: ' + err.message + '</p>';
                });
                return;
            case 'competencias':
                if (window.CompetenciasModule && typeof window.CompetenciasModule.navigate === 'function') {
                    window.CompetenciasModule.navigate('competencias', breadcrumbHtml);
                } else {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Módulo de Competencias no disponible.</p>';
                }
                return;
            case 'cursos':
                if (window.CursosModule && typeof window.CursosModule.navigate === 'function') {
                    window.CursosModule.navigate('cursos', breadcrumbHtml);
                } else {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Módulo de Cursos no disponible.</p>';
                }
                return;
            case 'eventos':
                if (window.EventosModule && typeof window.EventosModule.navigate === 'function') {
                    window.EventosModule.navigate('eventos', breadcrumbHtml);
                } else {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Módulo de Eventos no disponible.</p>';
                }
                return;
            case 'proyecto':
                if (window.ProyectoModule && typeof window.ProyectoModule.navigate === 'function') {
                    window.ProyectoModule.navigate('proyecto', breadcrumbHtml);
                } else {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Módulo del Proyecto no disponible.</p>';
                }
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
                container.innerHTML = breadcrumbHtml + renderDashboard();
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
    // CARGAR DATOS
    // ============================================================
    async function loadData() {
        var stats = await getEstadisticasGenerales();
        var container = document.getElementById('estadisticas-admin');
        if (container) {
            container.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:18px;">
                    <div class="stat-card">
                        <div class="stat-icon">👤</div>
                        <div class="number">${stats.totalUsuarios}</div>
                        <div class="label">Usuarios</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">👨‍🎓</div>
                        <div class="number">${stats.totalGraduados}</div>
                        <div class="label">Graduados</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🧑‍🏫</div>
                        <div class="number">${stats.totalDocentes}</div>
                        <div class="label">Docentes</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🏢</div>
                        <div class="number">${stats.totalEntidades}</div>
                        <div class="label">Entidades</div>
                    </div>
                </div>
            `;
        }
    }

    // ============================================================
    // DASHBOARD - CON EMOJIS CORREGIDOS
    // ============================================================
    function renderDashboard() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        return `
            <div class="page-header">
                <h2><i class="fas fa-cogs"></i> Panel de Administración</h2>
                <div class="breadcrumb">Control total del sistema</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:24px;">
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('usuarios')">
                    <div style="font-size:40px;">👤</div>
                    <h4>Usuarios</h4>
                    <p style="font-size:12px;color:#64748b;">Gestionar usuarios del sistema</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('graduados')">
                    <div style="font-size:40px;">👨‍🎓</div>
                    <h4>Graduados</h4>
                    <p style="font-size:12px;color:#64748b;">Lista oficial de graduados UIJ</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('docentes')">
                    <div style="font-size:40px;">🧑‍🏫</div>
                    <h4>Docentes</h4>
                    <p style="font-size:12px;color:#64748b;">Lista oficial de docentes UIJ</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('entidades')">
                    <div style="font-size:40px;">🏢</div>
                    <h4>Entidades</h4>
                    <p style="font-size:12px;color:#64748b;">Empresas y organismos</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('carreras')">
                    <div style="font-size:40px;">🎓</div>
                    <h4>Carreras</h4>
                    <p style="font-size:12px;color:#64748b;">Carreras universitarias</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('asignar-tutores')">
                    <div style="font-size:40px;">👥</div>
                    <h4>Asignar Tutores</h4>
                    <p style="font-size:12px;color:#64748b;">Asignar tutores a egresados</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('investigadores')">
                    <div style="font-size:40px;">🔬</div>
                    <h4>Investigadores</h4>
                    <p style="font-size:12px;color:#64748b;">Gestionar investigadores del proyecto</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('competencias')">
                    <div style="font-size:40px;">⭐</div>
                    <h4>Competencias</h4>
                    <p style="font-size:12px;color:#64748b;">Gestionar competencias</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('cursos')">
                    <div style="font-size:40px;">📚</div>
                    <h4>Cursos</h4>
                    <p style="font-size:12px;color:#64748b;">Gestionar cursos</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('eventos')">
                    <div style="font-size:40px;">📅</div>
                    <h4>Eventos</h4>
                    <p style="font-size:12px;color:#64748b;">Gestionar eventos</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('proyecto')">
                    <div style="font-size:40px;">📋</div>
                    <h4>Proyecto UnivSoc</h4>
                    <p style="font-size:12px;color:#64748b;">Proyecto Universidad-Sociedad</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="AdminModule.navigate('reportes')">
                    <div style="font-size:40px;">📄</div>
                    <h4>Reportes</h4>
                    <p style="font-size:12px;color:#64748b;">Estadísticas del sistema</p>
                </div>
            </div>

            <div id="estadisticas-admin">
                <p class="text-muted">Cargando estadísticas...</p>
            </div>
        `;
    }

    // ============================================================
    // INVESTIGADORES
    // ============================================================
    async function renderInvestigadores() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var investigadores = await DBModule.query(
            `SELECT * FROM docentes WHERE es_investigador_proyecto = 1 ORDER BY apellidos`
        );

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-flask"></i> Investigadores del Proyecto</h2>
                <div class="breadcrumb">${investigadores.length} investigadores registrados</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Investigadores</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>Categoría</th>
                                <th>Rol en el Proyecto</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (investigadores.length === 0) {
            html += '<tr><td colspan="6" class="text-center text-muted">No hay investigadores registrados.</td></tr>';
        } else {
            for (var i = 0; i < investigadores.length; i++) {
                var inv = investigadores[i];
                var categoria = inv.categoria_cientifica || inv.categoria_docente || 'N/A';
                var rol = inv.rol_proyecto || 'Investigador';
                html += `<tr>
                    <td>${i + 1}</td>
                    <td><strong>${inv.nombre}</strong></td>
                    <td>${inv.apellidos}</td>
                    <td><span class="badge badge-purple">${categoria}</span></td>
                    <td><span class="badge badge-info">${rol}</span></td>
                    <td>${inv.email_institucional || 'N/A'}</td>
                </tr>`;
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-chart-pie"></i> Estadísticas</div>
                <div style="padding:12px 0;">
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Total Investigadores</span>
                        <span class="badge badge-primary">${investigadores.length}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                        <span>🔬 Dr.C</span>
                        <span class="badge badge-purple">${investigadores.filter(i => i.categoria_cientifica === 'Dr.C').length}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                        <span>🔬 Ms.C</span>
                        <span class="badge badge-info">${investigadores.filter(i => i.categoria_cientifica === 'Ms.C').length}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;">
                        <span>🧑‍🏫 Lic.</span>
                        <span class="badge badge-warning">${investigadores.filter(i => i.categoria_cientifica === 'Lic.').length}</span>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // USUARIOS - RENDERIZAR LISTA
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
                <h2><i class="fas fa-users-cog"></i> Gestión de Usuarios</h2>
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
    // 🔥 FORMULARIO: USUARIO CON CAMPO CONTRASEÑA Y OJO
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
                            
                            <!-- ========================================================== -->
                            <!-- 🔥 CAMPO DE CONTRASEÑA CON OJO PARA MOSTRAR/OCULTAR        -->
                            <!-- ========================================================== -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label>${isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña <span class="required">*</span>'}</label>
                                    <div style="display:flex;align-items:center;gap:8px;position:relative;">
                                        <input type="password" id="usuario-password" 
                                               ${isEditing ? '' : 'required minlength="6"'} 
                                               placeholder="${isEditing ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}"
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
                                    ${isEditing ? '<small style="color:#94a3b8;font-size:12px;">Deja el campo vacío para mantener la contraseña actual</small>' : ''}
                                </div>
                                ${!isEditing ? '<div class="form-group"><label>Confirmar Contraseña <span class="required">*</span></label><input type="password" id="usuario-password-confirm" placeholder="Repite la contraseña" required minlength="6"></div>' : ''}
                            </div>
                            
                            <div style="display:flex;gap:12px;margin-top:16px;">
                                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${isEditing ? 'Actualizar' : 'Guardar'}</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('formulario-usuario-container').innerHTML=''">Cancelar</button>
                            </div>
                        </form>
                    </div>
                `;

                // ==========================================================
                // 🔥 EVENTO: MOSTRAR/OCULTAR CONTRASEÑA (OJO)
                // ==========================================================
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
                    AdminModule.guardarUsuario();
                });
            });
        }
    }

    // ============================================================
    // 🔥 GUARDAR USUARIO - CON PERSISTENCIA AUTOMÁTICA
    // ============================================================
    async function guardarUsuario() {
        var id = document.getElementById('usuario-id')?.value;
        var username = document.getElementById('usuario-username').value.trim();
        var email = document.getElementById('usuario-email').value.trim();
        var nombre = document.getElementById('usuario-nombre').value.trim();
        var apellidos = document.getElementById('usuario-apellidos').value.trim();
        var rolId = parseInt(document.getElementById('usuario-rol').value);
        var activo = parseInt(document.getElementById('usuario-estado').value);
        var password = document.getElementById('usuario-password').value;

        if (!username || !email || !nombre || !rolId) {
            await ModalModule.warning('Completa todos los campos requeridos.');
            return;
        }

        try {
            if (id) {
                // 🔥 ACTUALIZAR USUARIO
                if (password && password.length > 0) {
                    if (password.length < 6) {
                        await ModalModule.warning('La contraseña debe tener al menos 6 caracteres.');
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
                await ModalModule.success('Usuario actualizado correctamente.');
            } else {
                // 🔥 CREAR NUEVO USUARIO
                if (!password || password.length < 6) {
                    await ModalModule.warning('La contraseña debe tener al menos 6 caracteres.');
                    return;
                }
                var passwordConfirm = document.getElementById('usuario-password-confirm').value;
                if (password !== passwordConfirm) {
                    await ModalModule.warning('Las contraseñas no coinciden.');
                    return;
                }
                await DBModule.execute(
                    'INSERT INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [username, password, email, nombre, apellidos, rolId, activo]
                );
                await ModalModule.success('Usuario creado correctamente.');
            }
            
            document.getElementById('formulario-usuario-container').innerHTML = '';
            renderUsuarios(document.getElementById('filtro-rol-usuarios')?.value || 'todos').then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al guardar usuario: ' + error.message);
        }
    }

    function editarUsuario(id) { mostrarFormularioUsuario(id); }

    // ============================================================
    // ELIMINAR USUARIO (CON MODAL)
    // ============================================================
    async function eliminarUsuario(id) {
        var confirmado = await ModalModule.confirmDelete('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM usuarios WHERE id = ?', [id]);
            await ModalModule.success('Usuario eliminado correctamente.');
            renderUsuarios(document.getElementById('filtro-rol-usuarios')?.value || 'todos').then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // GRADUADOS
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
                <h2><i class="fas fa-user-graduate"></i> Gestión de Graduados</h2>
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
                                <th>Año</th>
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
                if (g.titulo_oro) logros += '<span class="badge badge-success">🥇 Oro</span> ';
                if (g.graduado_integral) logros += '<span class="badge badge-primary">⭐ Integral</span> ';
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
    // FORMULARIO: GRADUADO
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
                                    <label>Número de Identidad <span class="required">*</span></label>
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
                                    <label>Año de Graduación <span class="required">*</span></label>
                                    <input type="number" id="graduado-anio" value="${isEditing ? graduado.anio_graduacion : 2024}" required>
                                </div>
                                <div class="form-group">
                                    <label>Email Institucional</label>
                                    <input type="email" id="graduado-email" value="${isEditing ? graduado.email_institucional || '' : ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label><input type="checkbox" id="graduado-titulo-oro" ${isEditing && graduado.titulo_oro ? 'checked' : ''}> Título de Oro</label>
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
            renderGraduados().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al guardar graduado: ' + error.message);
        }
    }

    function editarGraduado(id) { mostrarFormularioGraduado(id); }

    // ============================================================
    // ELIMINAR GRADUADO (CON MODAL)
    // ============================================================
    async function eliminarGraduado(id) {
        var confirmado = await ModalModule.confirmDelete('¿Estás seguro de que quieres eliminar este graduado?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM graduados WHERE id = ?', [id]);
            await ModalModule.success('Graduado eliminado correctamente.');
            renderGraduados().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // DOCENTES
    // ============================================================
    async function renderDocentes() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var docentes = await DBModule.query('SELECT * FROM docentes ORDER BY nombre ASC');

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-chalkboard-teacher"></i> Gestión de Docentes</h2>
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
                                <th>Categoría</th>
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
                    '<td><span class="badge badge-info">' + (d.categoria_docente || 'Sin categoría') + '</span></td>' +
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
    // FORMULARIO: DOCENTE
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
                                <label>Número de Identidad <span class="required">*</span></label>
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
                                <label>Categoría Docente</label>
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
            renderDocentes().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al guardar docente: ' + error.message);
        }
    }

    function editarDocente(id) { mostrarFormularioDocente(id); }

    // ============================================================
    // ELIMINAR DOCENTE (CON MODAL)
    // ============================================================
    async function eliminarDocente(id) {
        var confirmado = await ModalModule.confirmDelete('¿Estás seguro de que quieres eliminar este docente?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM docentes WHERE id = ?', [id]);
            await ModalModule.success('Docente eliminado correctamente.');
            renderDocentes().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // ENTIDADES
    // ============================================================
    async function renderEntidades() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var entidades = await DBModule.query('SELECT * FROM entidades ORDER BY nombre');

        function mostrarLogo(logo) {
            if (!logo) return '🏢';
            return logo;
        }

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-building"></i> Gestión de Entidades</h2>
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
                <div class="card-title"><i class="fas fa-list"></i> Lista de Entidades (${entidades.length})</div>
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
                        <button class="btn btn-sm btn-secondary" onclick="AdminModule.editarEntidad(${ent.id})" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="AdminModule.eliminarEntidad(${ent.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
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
    // FORMULARIO: ENTIDAD
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
            var logoActual = isEditing ? (entidad.logo || '🏢') : '🏢';
            
            var emojis = ['🏨', '🏖️', '🌊', '✈️', '🚌', '🏝️', '🌾', '🚜', '🥫', '⚡', '📡', '💻', '🖥️', '⛏️', '🐟', '♻️', '💊', '📚', '🎓', '⚖️', '📜', '📋', '🏛️', '📊', '💰', '📈', '🛒', '🔬', '🔍', '🏢', '🏭', '🏪'];
            
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
                                    <option value="Energía" ${isEditing && entidad.sector === 'Energía' ? 'selected' : ''}>⚡ Energía</option>
                                    <option value="Comunicaciones" ${isEditing && entidad.sector === 'Comunicaciones' ? 'selected' : ''}>📡 Comunicaciones</option>
                                    <option value="Minería" ${isEditing && entidad.sector === 'Minería' ? 'selected' : ''}>⛏️ Minería</option>
                                    <option value="Pesca" ${isEditing && entidad.sector === 'Pesca' ? 'selected' : ''}>🐟 Pesca</option>
                                    <option value="Reciclaje" ${isEditing && entidad.sector === 'Reciclaje' ? 'selected' : ''}>♻️ Reciclaje</option>
                                    <option value="Salud" ${isEditing && entidad.sector === 'Salud' ? 'selected' : ''}>💊 Salud</option>
                                    <option value="Educación" ${isEditing && entidad.sector === 'Educación' ? 'selected' : ''}>📚 Educación</option>
                                    <option value="Justicia" ${isEditing && entidad.sector === 'Justicia' ? 'selected' : ''}>⚖️ Justicia</option>
                                    <option value="Economía" ${isEditing && entidad.sector === 'Economía' ? 'selected' : ''}>💰 Economía</option>
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
                                <label>Teléfono</label>
                                <input type="text" id="entidad-telefono" value="${isEditing ? entidad.telefono || '' : ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email de Contacto</label>
                                <input type="email" id="entidad-email" value="${isEditing ? entidad.email_contacto || '' : ''}">
                            </div>
                            <div class="form-group">
                                <label>Dirección</label>
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
                                    ${emojis.map(e => 
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
            renderEntidades().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al guardar entidad: ' + error.message);
        }
    }

    function editarEntidad(id) { mostrarFormularioEntidad(id); }

    // ============================================================
    // ELIMINAR ENTIDAD (CON MODAL)
    // ============================================================
    async function eliminarEntidad(id) {
        var confirmado = await ModalModule.confirmDelete('¿Estás seguro de que quieres eliminar esta entidad?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM entidades WHERE id = ?', [id]);
            await ModalModule.success('Entidad eliminada correctamente.');
            renderEntidades().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // CARRERAS
    // ============================================================
    async function renderCarreras() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var carreras = await DBModule.query('SELECT * FROM carreras ORDER BY nombre');

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-graduation-cap"></i> Gestión de Carreras</h2>
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
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Duración</th>
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
                    '<td>' + c.duracion_anios + ' años</td>' +
                    '<td style="text-align:center;">' +
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
    // FORMULARIO: CARRERA
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
                                <label>Código</label>
                                <input type="text" id="carrera-codigo" value="${isEditing ? carrera.codigo || '' : ''}" placeholder="Ej: IA-5">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Duración (años)</label>
                                <input type="number" id="carrera-duracion" value="${isEditing ? carrera.duracion_anios || 5 : 5}" min="1" max="6">
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
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
            renderCarreras().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al guardar carrera: ' + error.message);
        }
    }

    function editarCarrera(id) { mostrarFormularioCarrera(id); }

    // ============================================================
    // ELIMINAR CARRERA (CON MODAL)
    // ============================================================
    async function eliminarCarrera(id) {
        var confirmado = await ModalModule.confirmDelete('¿Estás seguro de que quieres eliminar esta carrera?');
        if (!confirmado) return;
        try {
            await DBModule.execute('DELETE FROM carreras WHERE id = ?', [id]);
            await ModalModule.success('Carrera eliminada correctamente.');
            renderCarreras().then(function(html) {
                document.getElementById('page-container').innerHTML = html;
                setTimeout(assignEvents, 100);
            });
        } catch (error) {
            await ModalModule.error('Error al eliminar: ' + error.message);
        }
    }

    // ============================================================
    // ASIGNAR TUTOR
    // ============================================================
    function mostrarAsignacionTutor(breadcrumbHtml) {
        var container = document.getElementById('page-container');
        if (!container) return;

        DBModule.query(
            `SELECT e.*, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             WHERE e.tutor_id IS NULL OR e.tutor_id = 0
             ORDER BY u.nombre`
        ).then(function(egresados) {
            DBModule.query(
                `SELECT t.*, u.nombre as tutor_nombre 
                 FROM tutores t 
                 JOIN usuarios u ON t.usuario_id = u.id 
                 ORDER BY u.nombre`
            ).then(function(tutores) {
                var html = `
                    <div class="page-header">
                        <h2><i class="fas fa-user-graduate"></i> Asignar Tutores a Egresados</h2>
                        <div class="breadcrumb">Asignación de tutores</div>
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
                                            <th style="text-align:center;">Acción</th>
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
                                                <td style="text-align:center;">
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

                if (breadcrumbHtml) {
                    container.innerHTML = breadcrumbHtml + html;
                } else {
                    container.innerHTML = html;
                }

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
                            <th style="text-align:center;">Acción</th>
                        </tr>
                    </thead>
                    <tbody>`;
            egresados.forEach(function(e) {
                html += `<tr>
                    <td><strong>${e.egresado_nombre}</strong></td>
                    <td>${e.carrera_nombre}</td>
                    <td>${e.tutor_nombre || 'Sin asignar'}</td>
                    <td style="text-align:center;">
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

    // ============================================================
    // ASIGNAR TUTOR (CON MODAL)
    // ============================================================
    function asignarTutor(egresadoId) {
        var select = document.getElementById('tutor-select-' + egresadoId);
        var tutorId = select.value;
        if (!tutorId) {
            ModalModule.warning('Selecciona un tutor para asignar.');
            return;
        }
        ModalModule.confirm('¿Asignar este tutor al egresado?', 'Asignar Tutor').then(function(confirmado) {
            if (!confirmado) return;
            DBModule.execute('UPDATE egresados SET tutor_id = ? WHERE id = ?', [tutorId, egresadoId])
                .then(function() {
                    ModalModule.success('Tutor asignado correctamente.');
                    mostrarAsignacionTutor();
                }).catch(function(error) {
                    ModalModule.error('Error al asignar tutor: ' + error.message);
                });
        });
    }

    // ============================================================
    // REMOVER TUTOR (CON MODAL)
    // ============================================================
    function removerTutor(egresadoId) {
        ModalModule.confirm('¿Estás seguro de que quieres remover el tutor de este egresado?', 'Remover Tutor').then(function(confirmado) {
            if (!confirmado) return;
            DBModule.execute('UPDATE egresados SET tutor_id = NULL WHERE id = ?', [egresadoId])
                .then(function() {
                    ModalModule.success('Tutor removido correctamente.');
                    mostrarAsignacionTutor();
                }).catch(function(error) {
                    ModalModule.error('Error al remover tutor: ' + error.message);
                });
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
                <div class="breadcrumb">Estadísticas generales</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:18px;margin-bottom:24px;">
                <div class="stat-card">
                    <div class="stat-icon">👤</div>
                    <div class="number">${stats.totalUsuarios}</div>
                    <div class="label">Usuarios</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">👨‍🎓</div>
                    <div class="number">${stats.totalGraduados}</div>
                    <div class="label">Graduados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🧑‍🏫</div>
                    <div class="number">${stats.totalDocentes}</div>
                    <div class="label">Docentes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏢</div>
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
            console.error('Error al obtener estadísticas:', error);
            return { totalUsuarios: 0, totalGraduados: 0, totalDocentes: 0, totalEntidades: 0 };
        }
    }

    // ============================================================
    // FUNCIONES DE IMPORTACION/EXPORTACION EXCEL
    // ============================================================

    // ---- USUARIOS ----
    function descargarPlantillaUsuarios() {
        var headers = ['username', 'password', 'email', 'nombre', 'apellidos', 'rol'];
        var data = [
            ['carlos.p', '123456', 'carlos@sispe.com', 'Carlos', 'Perez', 'egresado'],
            ['ana.r', '123456', 'ana@sispe.com', 'Ana', 'Rodriguez', 'egresado'],
            ['maria.g', '123456', 'maria@sispe.com', 'Maria', 'Gomez', 'tutor']
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

                var roles = await DBModule.query('SELECT id, nombre FROM roles');
                var rolMap = {};
                roles.forEach(function(r) {
                    rolMap[r.nombre.toLowerCase().trim()] = r.id;
                });

                var importados = 0;
                var errores = [];

                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var username = row.username || row.Usuario;
                    var password = row.password || row.Contrasena || '123456';
                    var email = row.email || row.Email;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos || '';
                    var rolNombre = row.rol || row.Rol;

                    if (!username || !email || !nombre) {
                        errores.push('Fila ' + (i + 2) + ': Falta usuario, email o nombre.');
                        continue;
                    }

                    var rolId = 5;
                    if (rolNombre) {
                        var key = rolNombre.toLowerCase().trim();
                        if (rolMap[key]) {
                            rolId = rolMap[key];
                        } else {
                            errores.push('Fila ' + (i + 2) + ': Rol "' + rolNombre + '" no encontrado. Se asignará "egresado".');
                        }
                    }

                    try {
                        await DBModule.execute(
                            'INSERT OR IGNORE INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
                            [username, password, email, nombre, apellidos, rolId]
                        );
                        importados++;
                    } catch (err) {
                        errores.push('Fila ' + (i + 2) + ': ' + err.message);
                    }
                }

                var mensaje = 'Importados ' + importados + ' usuarios.';
                if (errores.length > 0) {
                    mensaje += '\n\nErrores:\n' + errores.join('\n');
                    if (window.ModalModule) {
                        await ModalModule.warning(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning(mensaje);
                    }
                } else {
                    if (window.ModalModule) {
                        await ModalModule.success(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showToast(mensaje, 'success');
                    }
                }

                renderUsuarios(document.getElementById('filtro-rol-usuarios')?.value || 'todos').then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(assignEvents, 100);
                });
            } catch (error) {
                if (window.ModalModule) {
                    await ModalModule.error('Error al importar: ' + error.message);
                } else if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    async function exportarUsuarios() {
        var filtroRol = document.getElementById('filtro-rol-usuarios')?.value || 'todos';
        
        var query = 'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id';
        var params = [];
        
        if (filtroRol && filtroRol !== 'todos' && filtroRol !== '') {
            query += ' WHERE u.rol_id = ?';
            params.push(parseInt(filtroRol));
        }
        query += ' ORDER BY u.id';

        var usuarios = await DBModule.query(query, params);

        var data = usuarios.map(function(u) {
            return { 
                Usuario: u.username, 
                Email: u.email, 
                Nombre: u.nombre, 
                Apellidos: u.apellidos || '', 
                Rol: u.rol_nombre || 'Sin rol',
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
        var headers = ['numero_identidad', 'nombre', 'apellidos', 'carrera', 'anio_graduacion', 'email_institucional', 'titulo_oro', 'graduado_integral'];
        var data = [
            ['88010112345', 'Carlos', 'Perez', 'Ingeniería Agrónoma', '2024', 'carlos@uiij.co.cu', '0', '0'],
            ['89020223456', 'Ana', 'Rodriguez', 'Lic. Contabilidad', '2024', 'ana@uiij.co.cu', '1', '1']
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

                var carreras = await DBModule.query('SELECT id, nombre FROM carreras');
                var carreraMap = {};
                carreras.forEach(function(c) {
                    carreraMap[c.nombre.toLowerCase().trim()] = c.id;
                });

                var importados = 0;
                var errores = [];

                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var identidad = row.numero_identidad || row.Identidad;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos;
                    var carreraNombre = row.carrera || row.Carrera;
                    var anio = parseInt(row.anio_graduacion || row.Anio || 2024);
                    var email = row.email_institucional || row.Email || '';
                    var tituloOro = parseInt(row.titulo_oro || row.TituloOro || 0);
                    var integral = parseInt(row.graduado_integral || row.Integral || 0);

                    if (!identidad || !nombre || !apellidos) {
                        errores.push('Fila ' + (i + 2) + ': Falta identidad, nombre o apellidos.');
                        continue;
                    }

                    var carreraId = null;
                    if (carreraNombre) {
                        var key = carreraNombre.toLowerCase().trim();
                        carreraId = carreraMap[key];
                        if (!carreraId) {
                            errores.push('Fila ' + (i + 2) + ': Carrera "' + carreraNombre + '" no encontrada.');
                            continue;
                        }
                    } else {
                        errores.push('Fila ' + (i + 2) + ': Falta la carrera.');
                        continue;
                    }

                    try {
                        await DBModule.execute(
                            'INSERT OR IGNORE INTO graduados (numero_identidad, nombre, apellidos, carrera_id, anio_graduacion, email_institucional, titulo_oro, graduado_integral) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [identidad, nombre, apellidos, carreraId, anio, email, tituloOro, integral]
                        );
                        importados++;
                    } catch (err) {
                        errores.push('Fila ' + (i + 2) + ': ' + err.message);
                    }
                }

                var mensaje = 'Importados ' + importados + ' graduados.';
                if (errores.length > 0) {
                    mensaje += '\n\nErrores:\n' + errores.join('\n');
                    if (window.ModalModule) {
                        await ModalModule.warning(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning(mensaje);
                    }
                } else {
                    if (window.ModalModule) {
                        await ModalModule.success(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showToast(mensaje, 'success');
                    }
                }

                renderGraduados().then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(assignEvents, 100);
                });
            } catch (error) {
                if (window.ModalModule) {
                    await ModalModule.error('Error al importar: ' + error.message);
                } else if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    async function exportarGraduados() {
        var graduados = await DBModule.query(
            'SELECT g.numero_identidad, g.nombre, g.apellidos, c.nombre as carrera, g.anio_graduacion, g.email_institucional FROM graduados g JOIN carreras c ON g.carrera_id = c.id'
        );
        var data = graduados.map(function(g) {
            return { 
                Identidad: g.numero_identidad, 
                Nombre: g.nombre, 
                Apellidos: g.apellidos, 
                Carrera: g.carrera,
                Anio: g.anio_graduacion,
                Email: g.email_institucional || ''
            };
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
        var headers = ['numero_identidad', 'nombre', 'apellidos', 'email_institucional', 'departamento', 'categoria'];
        var data = [
            ['76010112345', 'Maria', 'Gomez', 'maria@uiij.co.cu', 'Ciencias Agricolas', 'Principal'],
            ['77020223456', 'Pedro', 'Ramirez', 'pedro@uiij.co.cu', 'Economia', 'Auxiliar']
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
                var errores = [];

                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var identidad = row.numero_identidad || row.Identidad;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos;
                    var email = row.email_institucional || row.Email || '';
                    var departamento = row.departamento || row.Departamento || '';
                    var categoria = row.categoria || row.Categoria || '';

                    if (!identidad || !nombre || !apellidos) {
                        errores.push('Fila ' + (i + 2) + ': Falta identidad, nombre o apellidos.');
                        continue;
                    }

                    try {
                        await DBModule.execute(
                            `INSERT OR IGNORE INTO docentes 
                                (numero_identidad, nombre, apellidos, email_institucional, departamento, categoria_docente) 
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [identidad, nombre, apellidos, email, departamento, categoria]
                        );
                        importados++;
                    } catch (err) {
                        errores.push('Fila ' + (i + 2) + ': ' + err.message);
                    }
                }

                var mensaje = 'Importados ' + importados + ' docentes.';
                if (errores.length > 0) {
                    mensaje += '\n\nErrores:\n' + errores.join('\n');
                    if (window.ModalModule) {
                        await ModalModule.warning(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning(mensaje);
                    }
                } else {
                    if (window.ModalModule) {
                        await ModalModule.success(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showToast(mensaje, 'success');
                    }
                }

                renderDocentes().then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(assignEvents, 100);
                });
            } catch (error) {
                if (window.ModalModule) {
                    await ModalModule.error('Error al importar: ' + error.message);
                } else if (window.NotificationsModule) {
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
                Categoria: d.categoria_docente || ''
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
        var headers = ['nombre', 'sector', 'representante', 'telefono', 'logo', 'email_contacto', 'direccion', 'convenio_estado'];
        var data = [
            ['Empresa Citricola', 'Produccion de alimentos', 'Ing. Roberto Mendez', '+53 48 123456', '🍊', 'contacto@citricola.cu', 'Carretera de la Fruta Km 3', 'activo'],
            ['Oficina del Turismo', 'Turismo', 'Lic. Mariana Perez', '+53 48 789012', '🏨', 'turismo@islajuventud.cu', 'Calle 39 No. 120', 'activo']
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
                var errores = [];

                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var nombre = row.nombre || row.Nombre;
                    var sector = row.sector || row.Sector || '';
                    var representante = row.representante || row.Representante || '';
                    var telefono = row.telefono || row.Telefono || '';
                    var logo = row.logo || row.Logo || '🏢';
                    var email = row.email_contacto || row.Email || '';
                    var direccion = row.direccion || row.Direccion || '';
                    var convenioEstado = row.convenio_estado || row.Convenio || 'activo';

                    if (!nombre) {
                        errores.push('Fila ' + (i + 2) + ': Falta el nombre.');
                        continue;
                    }

                    try {
                        await DBModule.execute(
                            `INSERT OR IGNORE INTO entidades 
                                (nombre, sector, representante, telefono, logo, email_contacto, direccion, convenio_estado) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [nombre, sector, representante, telefono, logo, email, direccion, convenioEstado]
                        );
                        importados++;
                    } catch (err) {
                        errores.push('Fila ' + (i + 2) + ': ' + err.message);
                    }
                }

                var mensaje = 'Importados ' + importados + ' entidades.';
                if (errores.length > 0) {
                    mensaje += '\n\nErrores:\n' + errores.join('\n');
                    if (window.ModalModule) {
                        await ModalModule.warning(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning(mensaje);
                    }
                } else {
                    if (window.ModalModule) {
                        await ModalModule.success(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showToast(mensaje, 'success');
                    }
                }

                renderEntidades().then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(assignEvents, 100);
                });
            } catch (error) {
                if (window.ModalModule) {
                    await ModalModule.error('Error al importar: ' + error.message);
                } else if (window.NotificationsModule) {
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
                Logo: e.logo || '🏢',
                Email: e.email_contacto || '',
                Direccion: e.direccion || '',
                Convenio: e.convenio_estado || 'sin convenio'
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
        // Los eventos se manejan inline
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
        // Investigadores
        renderInvestigadores: renderInvestigadores,
        // Reportes
        renderReportes: renderReportes
    };

})();

window.AdminModule = AdminModule;
console.log('✅ AdminModule con persistencia cargado correctamente.');