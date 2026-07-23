// ============================================================
// SISPE - admin.js
// Modulo de Administracion - COMPLETO CON FILTRO
// ============================================================

const AdminModule = (function() {
    'use strict';

    function navigate(page) {
        var container = document.getElementById('page-container');
        if (!container) return;

        switch(page) {
            case 'dashboard':
                container.innerHTML = renderDashboard();
                setTimeout(loadData, 200);
                break;
            case 'usuarios':
                renderUsuarios('todos').then(function(html) {
                    container.innerHTML = html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = '<p class="text-muted">Error al cargar usuarios: ' + err.message + '</p>';
                });
                break;
            case 'graduados':
                renderGraduados().then(function(html) {
                    container.innerHTML = html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = '<p class="text-muted">Error al cargar graduados: ' + err.message + '</p>';
                });
                break;
            case 'docentes':
                renderDocentes().then(function(html) {
                    container.innerHTML = html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = '<p class="text-muted">Error al cargar docentes: ' + err.message + '</p>';
                });
                break;
            case 'entidades':
                renderEntidades().then(function(html) {
                    container.innerHTML = html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = '<p class="text-muted">Error al cargar entidades: ' + err.message + '</p>';
                });
                break;
            case 'carreras':
                renderCarreras().then(function(html) {
                    container.innerHTML = html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = '<p class="text-muted">Error al cargar carreras: ' + err.message + '</p>';
                });
                break;
            case 'reportes':
                renderReportes().then(function(html) {
                    container.innerHTML = html;
                    setTimeout(assignEvents, 100);
                }).catch(function(err) {
                    container.innerHTML = '<p class="text-muted">Error al cargar reportes: ' + err.message + '</p>';
                });
                break;
            default:
                container.innerHTML = renderDashboard();
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
                    <div style="font-size:40px;">👤</div>
                    <h4>Usuarios</h4>
                    <p style="font-size:12px;color:#64748b;">Gestionar usuarios del sistema</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('graduados')">
                    <div style="font-size:40px;">👨‍🎓</div>
                    <h4>Graduados</h4>
                    <p style="font-size:12px;color:#64748b;">Lista oficial de graduados UIJ</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('docentes')">
                    <div style="font-size:40px;">🧑‍🏫</div>
                    <h4>Docentes</h4>
                    <p style="font-size:12px;color:#64748b;">Lista oficial de docentes UIJ</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('entidades')">
                    <div style="font-size:40px;">🏢</div>
                    <h4>Entidades</h4>
                    <p style="font-size:12px;color:#64748b;">Empresas y organismos</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('carreras')">
                    <div style="font-size:40px;">🎓</div>
                    <h4>Carreras</h4>
                    <p style="font-size:12px;color:#64748b;">Carreras universitarias</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;" onclick="AdminModule.navigate('reportes')">
                    <div style="font-size:40px;">📊</div>
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

        // Obtener todos los roles para el filtro
        var roles = await DBModule.query('SELECT * FROM roles ORDER BY id');
        
        // Crear un diccionario de roles: { id: nombre }
        var rolesMap = {};
        for (var i = 0; i < roles.length; i++) {
            rolesMap[roles[i].id] = roles[i].nombre;
        }

        // Construir la consulta con filtro
        var query = 'SELECT * FROM usuarios';
        var params = [];
        
        if (filtroRol && filtroRol !== 'todos' && filtroRol !== '') {
            query += ' WHERE rol_id = ?';
            params.push(parseInt(filtroRol));
        }
        query += ' ORDER BY id';

        var usuarios = await DBModule.query(query, params);

        // Asignar el nombre del rol a cada usuario
        for (var i = 0; i < usuarios.length; i++) {
            var u = usuarios[i];
            u.rol_nombre = rolesMap[u.rol_id] || 'Sin rol';
        }

        // Construir opciones del filtro
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
    // GRADUADOS
    // ============================================================
    async function renderGraduados() {
        if (!isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var graduados = await DBModule.query(
            'SELECT g.*, c.nombre as carrera_nombre FROM graduados g LEFT JOIN carreras c ON g.carrera_id = c.id ORDER BY g.anio_graduacion DESC'
        );

        var carreras = await DBModule.query('SELECT * FROM carreras ORDER BY nombre');

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
    // DOCENTES
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
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (docentes.length === 0) {
            html += '<tr><td colspan="5" class="text-center text-muted">No hay docentes registrados.</td></tr>';
        } else {
            for (var i = 0; i < docentes.length; i++) {
                var d = docentes[i];
                html += '<tr><td><strong>' + d.numero_identidad + '</strong></td>' +
                    '<td>' + d.nombre + ' ' + d.apellidos + '</td>' +
                    '<td>' + (d.departamento || 'Sin asignar') + '</td>' +
                    '<td><span class="badge badge-info">' + (d.categoria_docente || 'Sin categoria') + '</span></td>' +
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
    // ENTIDADES
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
                html += '<tr><td style="font-size:28px;">' + (ent.logo || '🏢') + '</td>' +
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
    // CARRERAS
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
                    '<td>' + c.duracion_anios + ' años</td>' +
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
            console.error('Error al obtener estadisticas:', error);
            return { totalUsuarios: 0, totalGraduados: 0, totalDocentes: 0, totalEntidades: 0 };
        }
    }

    // ============================================================
    // FORMULARIO: USUARIO
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
                            ${!isEditing ? '<div class="form-row"><div class="form-group"><label>Contraseña <span class="required">*</span></label><input type="password" id="usuario-password" placeholder="Minimo 6 caracteres" required minlength="6"></div></div>' : ''}
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
                        window.NotificationsModule.showWarning('La contraseña debe tener al menos 6 caracteres.');
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

    async function eliminarUsuario(id) {
        if (!confirm('¿Eliminar este usuario?')) return;
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
        var headers = ['numero_identidad', 'nombre', 'apellidos', 'email_institucional', 'departamento', 'categoria_docente'];
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
                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var identidad = row.numero_identidad || row.Identidad;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos;
                    var email = row.email_institucional || row.Email || '';
                    var departamento = row.departamento || row.Departamento || '';
                    var categoria = row.categoria_docente || row.Categoria || '';

                    if (identidad && nombre && apellidos) {
                        try {
                            await DBModule.execute(
                                'INSERT OR IGNORE INTO docentes (numero_identidad, nombre, apellidos, email_institucional, departamento, categoria_docente) VALUES (?, ?, ?, ?, ?, ?)',
                                [identidad, nombre, apellidos, email, departamento, categoria]
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
        var docentes = await DBModule.query('SELECT numero_identidad, nombre, apellidos, email_institucional, departamento, categoria_docente FROM docentes');
        var data = docentes.map(function(d) {
            return { Identidad: d.numero_identidad, Nombre: d.nombre, Apellidos: d.apellidos, Email: d.email_institucional, Departamento: d.departamento, Categoria: d.categoria_docente };
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
        var headers = ['nombre', 'sector', 'representante', 'telefono', 'logo'];
        var data = [
            ['Empresa Citricola', 'Produccion de alimentos', 'Ing. Roberto Mendez', '+53 48 123456', '🍊'],
            ['Oficina del Turismo', 'Turismo', 'Lic. Mariana Perez', '+53 48 789012', '🏨']
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
                    var logo = row.logo || row.Logo || '🏢';

                    if (nombre) {
                        try {
                            await DBModule.execute(
                                'INSERT OR IGNORE INTO entidades (nombre, sector, representante, telefono, logo) VALUES (?, ?, ?, ?, ?)',
                                [nombre, sector, representante, telefono, logo]
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
            return { Nombre: e.nombre, Sector: e.sector || '', Representante: e.representante || '', Telefono: e.telefono || '', Logo: e.logo || '🏢' };
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
    // FUNCIONES DE EDICION Y ELIMINACION (Placeholder)
    // ============================================================
    function editarUsuario(id) { mostrarFormularioUsuario(id); }
    function editarGraduado(id) { /* Implementar */ }
    function editarDocente(id) { /* Implementar */ }
    function editarEntidad(id) { /* Implementar */ }
    function editarCarrera(id) { /* Implementar */ }
    function eliminarGraduado(id) { /* Implementar */ }
    function eliminarDocente(id) { /* Implementar */ }
    function eliminarEntidad(id) { /* Implementar */ }
    function eliminarCarrera(id) { /* Implementar */ }

    // ============================================================
    // FORMULARIOS FALTANTES (Placeholder)
    // ============================================================
    function mostrarFormularioGraduado() {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Formulario de graduado en desarrollo.', 'info');
        }
    }

    function mostrarFormularioDocente() {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Formulario de docente en desarrollo.', 'info');
        }
    }

    function mostrarFormularioEntidad() {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Formulario de entidad en desarrollo.', 'info');
        }
    }

    function mostrarFormularioCarrera() {
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Formulario de carrera en desarrollo.', 'info');
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
        // Cargar estadisticas en el dashboard
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
        // Docentes
        renderDocentes: renderDocentes,
        descargarPlantillaDocentes: descargarPlantillaDocentes,
        importarDocentes: importarDocentes,
        exportarDocentes: exportarDocentes,
        editarDocente: editarDocente,
        eliminarDocente: eliminarDocente,
        mostrarFormularioDocente: mostrarFormularioDocente,
        // Entidades
        renderEntidades: renderEntidades,
        descargarPlantillaEntidades: descargarPlantillaEntidades,
        importarEntidades: importarEntidades,
        exportarEntidades: exportarEntidades,
        editarEntidad: editarEntidad,
        eliminarEntidad: eliminarEntidad,
        mostrarFormularioEntidad: mostrarFormularioEntidad,
        // Carreras
        renderCarreras: renderCarreras,
        editarCarrera: editarCarrera,
        eliminarCarrera: eliminarCarrera,
        mostrarFormularioCarrera: mostrarFormularioCarrera,
        // Reportes
        renderReportes: renderReportes
    };

})();

window.AdminModule = AdminModule;
console.log('AdminModule cargado correctamente.');
