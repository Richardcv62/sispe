// ============================================================
// SISPE - app.js
// Controlador Principal - CON SELECTOR DE ROLES
// RUTA: js/app.js
// ============================================================

const App = (function() {
    'use strict';

    var currentPage = 'login';
    var isAppReady = false;

    function getEmoji(icono) {
        var mapa = {
            'dashboard': '📊',
            'usuarios': '👤',
            'graduados': '👨‍🎓',
            'docentes': '🧑‍🏫',
            'entidades': '🏢',
            'carreras': '🎓',
            'asignar-tutores': '👥',
            'reportes': '📄',
            'competencias': '⭐',
            'cursos': '📚',
            'eventos': '📅',
            'investigadores': '👨‍🔬',
            'proyecto': '📋',
            'objetivos': '🎯',
            'productos': '📝',
            'dashboard-proyecto': '📊'
        };
        return mapa[icono] || '📊';
    }

    // ============================================================
    // SELECTOR DE ROLES PARA MULTI-ROL
    // ============================================================
    function agregarSelectorRoles() {
        var user = AuthModule.getCurrentUser();
        if (!user) {
            console.log('❌ No hay usuario autenticado');
            return;
        }
        
        console.log('👤 Usuario actual:', user.username);
        console.log('📋 Roles del usuario:', user);
        
        // Obtener todos los roles del usuario
        var roles = user.roles_adicionales || [];
        var todosLosRoles = [user.rol_nombre, ...roles];
        todosLosRoles = [...new Set(todosLosRoles)];
        
        console.log('📋 Todos los roles:', todosLosRoles);
        
        // Solo mostrar si tiene más de un rol
        if (todosLosRoles.length <= 1) {
            console.log('⚠️ El usuario tiene un solo rol, no se muestra selector');
            return;
        }
        
        // Buscar donde insertar el selector (en el topbar)
        var topbarRight = document.querySelector('.topbar-right');
        if (!topbarRight) {
            console.log('❌ No se encontró topbar-right');
            return;
        }
        
        // Verificar si ya existe el selector para no duplicarlo
        if (document.getElementById('selector-rol-container')) {
            console.log('⚠️ El selector ya existe');
            return;
        }
        
        var roleLabels = {
            'administrador': 'Administrador',
            'coordinador': 'Coordinador',
            'directivo': 'Directivo',
            'tutor': 'Tutor',
            'egresado': 'Egresado'
        };
        
        var selectorHTML = `
            <div id="selector-rol-container" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);padding:4px 12px 4px 16px;border-radius:20px;border:1px solid rgba(255,255,255,0.15);">
                <i class="fas fa-exchange-alt" style="color:rgba(255,255,255,0.7);font-size:13px;"></i>
                <span style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:500;">ROL:</span>
                <select id="selector-rol" style="background:transparent;color:white;border:none;font-size:13px;font-weight:600;cursor:pointer;padding:4px 4px 4px 0;outline:none;font-family:'Inter',sans-serif;">
                    ${todosLosRoles.map(function(r) {
                        var selected = r === user.rol_nombre ? 'selected' : '';
                        var label = roleLabels[r] || r.charAt(0).toUpperCase() + r.slice(1);
                        return `<option value="${r}" ${selected}>${label}</option>`;
                    }).join('')}
                </select>
                <span style="color:rgba(255,255,255,0.3);font-size:10px;margin-left:4px;">⭐</span>
            </div>
        `;
        
        // Insertar antes del perfil de usuario
        var userProfile = topbarRight.querySelector('.user-profile');
        if (userProfile) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = selectorHTML;
            var selectorElement = tempDiv.firstChild;
            topbarRight.insertBefore(selectorElement, userProfile);
            console.log('✅ Selector de roles insertado correctamente');
        } else {
            console.log('❌ No se encontró user-profile');
            topbarRight.insertAdjacentHTML('afterbegin', selectorHTML);
        }
        
        // Evento para cambiar de rol
        var selector = document.getElementById('selector-rol');
        if (selector) {
            selector.addEventListener('change', function() {
                var nuevoRol = this.value;
                console.log('🔄 Cambiando a rol:', nuevoRol);
                cambiarRol(nuevoRol);
            });
        }
    }

    function cambiarRol(nuevoRol) {
        var user = AuthModule.getCurrentUser();
        if (!user) return;
        
        var rolMap = {
            'administrador': 1,
            'tutor': 2,
            'coordinador': 3,
            'egresado': 4,
            'directivo': 5
        };
        
        var nuevoRolId = rolMap[nuevoRol];
        if (!nuevoRolId) return;
        
        user.rol_nombre = nuevoRol;
        user.rol_id = nuevoRolId;
        
        localStorage.setItem('sispe_session', JSON.stringify({
            user: user,
            timestamp: Date.now(),
            expires: Date.now() + 86400000
        }));
        
        if (window.NotificationsModule) {
            window.NotificationsModule.showSuccess('🔄 Cambiado a rol: ' + nuevoRol);
        }
        
        setTimeout(function() {
            location.reload();
        }, 500);
    }

	async function initializeModules() {
		try {
			console.log('?? Inicializando SISPE...');
			
			await DBModule.init();
			console.log('? Base de datos SQLite inicializada');
			
			// ?? FORZAR RECARGA DESDE LOCALSTORAGE DESPU�S DE init()
			try {
				console.log('?? Verificando localStorage para recargar datos...');
				var localData = localStorage.getItem('sispe_db_data');
				if (localData) {
					console.log('?? Datos encontrados en localStorage, forzando recarga...');
					await DBModule.recargarDesdeLocalStorage();
					console.log('? Datos recargados desde localStorage');
				} else {
					console.log('?? No hay datos en localStorage');
				}
			} catch(e) {
				console.warn('?? Error al recargar desde localStorage:', e);
			}
			
			try {
				var rolesCount = await DBModule.query('SELECT COUNT(*) as total FROM roles');
				if (!rolesCount || rolesCount.length === 0 || rolesCount[0].total === 0) {
					console.log('?? Creando base de datos y datos iniciales...');
					await DBModule.createDatabase();
					console.log('? Base de datos creada correctamente');
				} else {
					console.log('? Base de datos ya existe con ' + rolesCount[0].total + ' roles');
				}
			} catch (error) {
				console.log('?? Tablas no encontradas. Creando base de datos...');
				await DBModule.createDatabase();
				console.log('? Base de datos creada correctamente');
			}
			
			var hasSession = AuthModule.init();
			NotificationsModule.init();
			
			isAppReady = true;
			
			if (hasSession) {
				var user = AuthModule.getCurrentUser();
				if (user) {
					console.log('?? Usuario autenticado:', user.username);
					console.log('?? Roles adicionales:', user.roles_adicionales);
					var role = user.rol_nombre || 'egresado';
					showDashboard(role);
					setTimeout(agregarSelectorRoles, 800);
				} else {
					showLogin();
				}
			} else {
				showLogin();
			}
			
			console.log('? SISPE listo');
			return true;
		} catch (error) {
			console.error('? Error al inicializar:', error);
			var appContainer = document.getElementById('app');
			if (appContainer) {
				appContainer.innerHTML = `
					<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a1e3c;color:white;padding:20px;font-family:'Inter',sans-serif;">
						<div style="text-align:center;max-width:500px;">
							<div style="font-size:64px;margin-bottom:16px;">?</div>
							<h1 style="font-size:24px;margin-bottom:8px;">Error al iniciar SISPE</h1>
							<p style="color:#94a3b8;font-size:14px;">${error.message || 'Error desconocido'}</p>
							<p style="color:#64748b;font-size:13px;margin-top:12px;">Verifica que los archivos lib/sql-wasm.js y lib/sql-wasm.wasm existan.</p>
							<button onclick="location.reload()" style="margin-top:16px;padding:12px 32px;background:#4a9ad9;color:white;border:none;border-radius:10px;font-size:16px;cursor:pointer;font-family:'Inter',sans-serif;">
								<i class="fas fa-sync-alt"></i> Reintentar
							</button>
						</div>
					</div>
				`;
			}
			return false;
		}
	}

    function showLogin() {
        var appContainer = document.getElementById('app');
        if (!appContainer) return;

        appContainer.innerHTML = `
            <div id="login-page">
                <div class="login-container">
                    <div class="login-left">
                        <div class="login-brand">
                            <div class="brand-icon"><i class="fas fa-graduation-cap"></i></div>
                            <h1>SISPE</h1>
                            <p class="brand-subtitle">Sistema de Preparaci\u00f3n para el Empleo</p>
                            <div class="brand-line"></div>
                            <p class="brand-description">
                                Plataforma integral para la superaci\u00f3n profesional<br>
                                de los reci\u00e9n graduados universitarios
                            </p>
                            <div class="brand-features">
                                <span><i class="fas fa-check-circle"></i> Planes personalizados</span>
                                <span><i class="fas fa-check-circle"></i> Tutor\u00edas sistem\u00e1ticas</span>
                                <span><i class="fas fa-check-circle"></i> Evaluaci\u00f3n de competencias</span>
                            </div>
                        </div>
                    </div>
                    <div class="login-right">
                        <div class="login-card">
                            <div class="login-header">
                                <h2>Iniciar Sesi\u00f3n</h2>
                                <p>Ingresa tus credenciales para acceder</p>
                            </div>
                            
                            <form id="login-form">
                                <div class="form-group">
                                    <label><i class="fas fa-user"></i> Usuario</label>
                                    <input type="text" id="login-username" placeholder="Nombre de usuario..." autofocus>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-lock"></i> Contrase\u00f1a</label>
                                    <input type="password" id="login-password" placeholder="Contrase\u00f1a...">
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">
                                    <i class="fas fa-arrow-right"></i> Iniciar sesi\u00f3n
                                </button>
                            </form>
                            
                            <div style="text-align:center;margin-top:12px;font-size:14px;color:#64748b;">
                                ¿No tienes cuenta? 
                                <a href="#" onclick="if(window.RegisterModule){RegisterModule.renderRegisterForm();}return false;" style="color:#2a6b9c;font-weight:600;cursor:pointer;text-decoration:none;">
                                    Reg\u00edstrate aqu\u00ed
                                </a>
                            </div>
                            
                            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.8;">
                                <div>SISPE v2.0 | UIJ 2026</div>
                                <div style="font-size:11px;color:#a0aec0;margin-top:4px;">
                                    &copy; 2026 - Todos los derechos reservados<br>
                                    Desarrollado por Ricardo Castillo Vald\u00e9s<br>
                                    <a href="mailto:3sayricardo@gmail.com" style="color:#94a3b8;text-decoration:none;">3sayricardo@gmail.com</a> | 
                                    <a href="https://wa.me/5355031725" target="_blank" style="color:#94a3b8;text-decoration:none;">WhatsApp +53 55031725</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        var loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var username = document.getElementById('login-username').value.trim();
                var password = document.getElementById('login-password').value;

                if (!username || !password) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning('Completa todos los campos.');
                    }
                    return;
                }

                AuthModule.login(username, password).then(function(user) {
                    var role = user.rol_nombre || 'egresado';
                    showDashboard(role);
                    setTimeout(agregarSelectorRoles, 800);
                }).catch(function(err) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showError('Error al iniciar sesi\u00f3n.');
                    }
                });
            });
        }
    }

    function showDashboard(role) {
        var appContainer = document.getElementById('app');
        if (!appContainer) return;

        var user = AuthModule.getCurrentUser();
        if (!user) {
            showLogin();
            return;
        }

        var displayRole = user.rol_nombre || role || 'Sin rol';
        var displayName = user.nombre || 'Usuario';

        var roleLabels = {
            'administrador': 'Administrador',
            'coordinador': 'Coordinador',
            'directivo': 'Directivo',
            'tutor': 'Tutor',
            'egresado': 'Egresado'
        };
        var roleLabel = roleLabels[displayRole] || displayRole;

        appContainer.innerHTML = `
            <div id="app-layout">
                <header class="topbar">
                    <div class="topbar-left">
                        <div class="logo">
                            <i class="fas fa-graduation-cap"></i>
                            <span>SISPE</span>
                            <span class="logo-badge">v2.0</span>
                        </div>
                        <button class="btn-mobile-menu" id="btn-mobile-menu">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                    <div class="topbar-right" id="topbar-right">
                        <div class="notification-bell" id="notification-bell">
                            <i class="fas fa-bell"></i>
                            <span class="badge-notification">0</span>
                        </div>
                        <div class="user-profile">
                            <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
                            <div class="user-info">
                                <span class="user-name" id="display-name">${displayName}</span>
                                <span class="user-role" id="display-role">${roleLabel}</span>
                            </div>
                            <button id="logout-btn" class="btn btn-logout"><i class="fas fa-sign-out-alt"></i></button>
                        </div>
                    </div>
                </header>

                <div class="app-layout">
                    <nav class="sidebar" id="sidebar">
                        <div class="sidebar-header">
                            <i class="fas fa-graduation-cap"></i>
                            <span>SISPE</span>
                        </div>
                        <div class="sidebar-menu" id="sidebar-menu"></div>
                        <div class="sidebar-footer">
                            <span>v2.0</span>
                            <span>UIJ 2026</span>
                        </div>
                    </nav>

                    <main class="main-content" id="main-content">
                        <div id="page-container"></div>
                    </main>
                </div>
            </div>
        `;

        var menuItems = getMenuItems(displayRole);
        var sidebarMenu = document.getElementById('sidebar-menu');
        if (sidebarMenu) {
            sidebarMenu.innerHTML = '<div class="menu-label">Navegaci\u00f3n</div>' +
                menuItems.map(function(item) {
                    var icono = getEmoji(item.id);
                    return '<div class="menu-item" data-page="' + item.id + '">' +
                        '<span class="icon">' + icono + '</span>' +
                        '<span>' + item.label + '</span></div>';
                }).join('');
        }

        sidebarMenu.querySelectorAll('.menu-item').forEach(function(el) {
            el.addEventListener('click', function() {
                var pageId = this.dataset.page;
                sidebarMenu.querySelectorAll('.menu-item').forEach(function(m) {
                    m.classList.remove('active');
                });
                this.classList.add('active');
                navigateTo(pageId, displayRole);
            });
        });

        var firstItem = sidebarMenu.querySelector('.menu-item');
        if (firstItem) firstItem.classList.add('active');

        navigateTo('dashboard', displayRole);

        document.getElementById('logout-btn').addEventListener('click', function() {
            AuthModule.logout();
            showLogin();
        });

        document.getElementById('btn-mobile-menu').addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('open');
        });

        document.getElementById('notification-bell').addEventListener('click', function() {
            if (window.NotificationsModule) {
                window.NotificationsModule.showInfo('No tienes notificaciones pendientes.', 3000);
            }
        });
        
        // Agregar selector de roles después de que el DOM esté listo
        setTimeout(agregarSelectorRoles, 800);
    }

    function getMenuItems(role) {
        var menuMap = {
            'egresado': [
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'plan', label: 'Mi Plan' },
                { id: 'tutorias', label: 'Tutor\u00edas' },
                { id: 'evidencias', label: 'Evidencias' },
                { id: 'evaluaciones', label: 'Evaluaciones' },
                { id: 'solicitar-tutor', label: 'Solicitar Tutor' },
                { id: 'mis-cursos', label: 'Mis Cursos' },
                { id: 'mis-eventos', label: 'Mis Eventos' }
            ],
            'tutor': [
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'tutorados', label: 'Tutorados' },
                { id: 'registrar-tutoria', label: 'Registrar Tutor\u00eda' },
                { id: 'evaluar', label: 'Evaluar' },
                { id: 'asignar-egresados', label: 'Asignar Tutorados' },
                { id: 'evaluar-competencias', label: 'Evaluar Competencias' }
            ],
            'coordinador': [
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'planes', label: 'Planes' },
                { id: 'entidades', label: 'Entidades' },
                { id: 'competencias', label: 'Competencias' },
                { id: 'cursos', label: 'Cursos' },
                { id: 'eventos', label: 'Eventos' },
                { id: 'reportes', label: 'Reportes' }
            ],
            'directivo': [
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'planes', label: 'Planes' },
                { id: 'competencias', label: 'Competencias' },
                { id: 'eventos', label: 'Eventos' },
                { id: 'estadisticas', label: 'Estad\u00edsticas' }
            ],
            'administrador': [
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'usuarios', label: 'Usuarios' },
                { id: 'graduados', label: 'Graduados' },
                { id: 'docentes', label: 'Docentes' },
                { id: 'entidades', label: 'Entidades' },
                { id: 'carreras', label: 'Carreras' },
                { id: 'asignar-tutores', label: 'Asignar Tutores' },
                { id: 'competencias', label: 'Competencias' },
                { id: 'cursos', label: 'Cursos' },
                { id: 'eventos', label: 'Eventos' },
                { id: 'investigadores', label: 'Investigadores' },
                { id: 'proyecto', label: 'Proyecto UII' },
                { id: 'reportes', label: 'Reportes' }
            ]
        };
        return menuMap[role] || menuMap['egresado'];
    }

    function navigateTo(pageId, role) {
        var sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }

        var pageContainer = document.getElementById('page-container');
        if (!pageContainer) return;

        var moduleMap = {
            'egresado': window.EgresadoModule,
            'tutor': window.TutorModule,
            'coordinador': window.CoordinadorModule,
            'directivo': window.DirectivoModule,
            'administrador': window.AdminModule
        };

        var pageModuleMap = {
            'competencias': window.CompetenciasModule,
            'cursos': window.CursosModule,
            'eventos': window.EventosModule,
            'mis-cursos': window.CursosModule,
            'mis-eventos': window.EventosModule,
            'evaluar-competencias': window.CompetenciasModule,
            'investigadores': window.InvestigadoresModule,
            'proyecto': window.ProyectoModule
        };

        var module = moduleMap[role] || pageModuleMap[pageId];

        if (module && typeof module.navigate === 'function') {
            try {
                var breadcrumb = renderBreadcrumb(pageId, role);
                module.navigate(pageId, breadcrumb);
            } catch (error) {
                console.error('Error en m\u00f3dulo:', error);
                pageContainer.innerHTML = `
                    ${renderBreadcrumb(pageId, role)}
                    <div class="card">
                        <p class="text-muted">Error al cargar el m\u00f3dulo: ${error.message || 'Error desconocido'}</p>
                    </div>
                `;
            }
            return;
        }

        var user = AuthModule.getCurrentUser();
        var userName = user ? user.nombre : 'Usuario';
        var roleName = user ? user.rol_nombre : role;
        
        pageContainer.innerHTML = `
            ${renderBreadcrumb(pageId, role)}
            <div class="page-header">
                <h2><i class="fas fa-file"></i> ${pageId}</h2>
                <div class="breadcrumb">${userName} · ${roleName}</div>
            </div>
            <div class="card">
                <p class="text-muted">Bienvenido, ${userName}.</p>
                <p class="text-muted">Tu rol es: <strong>${roleName}</strong></p>
                <p class="text-muted">El m\u00f3dulo "${pageId}" est\u00e1 en desarrollo.</p>
            </div>
        `;
    }

    function renderBreadcrumb(pageId, role) {
        var pageLabels = {
            'dashboard': 'Dashboard',
            'plan': 'Mi Plan',
            'tutorias': 'Tutor\u00edas',
            'evidencias': 'Evidencias',
            'evaluaciones': 'Evaluaciones',
            'solicitar-tutor': 'Solicitar Tutor',
            'tutorados': 'Tutorados',
            'registrar-tutoria': 'Registrar Tutor\u00eda',
            'evaluar': 'Evaluar',
            'asignar-egresados': 'Asignar Tutorados',
            'planes': 'Planes',
            'entidades': 'Entidades',
            'reportes': 'Reportes',
            'estadisticas': 'Estad\u00edsticas',
            'usuarios': 'Usuarios',
            'graduados': 'Graduados',
            'docentes': 'Docentes',
            'carreras': 'Carreras',
            'asignar-tutores': 'Asignar Tutores',
            'configuracion': 'Configuraci\u00f3n',
            'competencias': 'Competencias',
            'cursos': 'Cursos',
            'eventos': 'Eventos',
            'investigadores': 'Investigadores',
            'proyecto': 'Proyecto UII'
        };

        var label = pageLabels[pageId] || pageId;
        var user = AuthModule.getCurrentUser();
        var userName = user ? user.nombre : 'Usuario';

        if (pageId === 'dashboard') {
            return `
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <i class="fas fa-home" style="color:#0a1e3c;"></i>
                        <span style="color:#0a1e3c;font-weight:600;">Dashboard</span>
                    </div>
                    <div style="font-size:13px;color:#94a3b8;">
                        ${userName} · ${role}
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

    return {
        init: function() {
            initializeModules();
        },
        navigate: function(pageId) {
            var user = AuthModule.getCurrentUser();
            if (user) {
                navigateTo(pageId, user.rol_nombre);
            }
        },
        showLogin: function() {
            showLogin();
        }
    };

})();

document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

window.App = App;
console.log('✅ App cargada correctamente.');