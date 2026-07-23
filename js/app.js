// ============================================================
// SISPE - app.js
// Controlador Principal - Version definitiva
// ============================================================

const App = (function() {
    'use strict';

    var currentPage = 'login';
    var isAppReady = false;

    async function initializeModules() {
        try {
            console.log('Inicializando SISPE...');
            
            await DBModule.init();
            console.log('Base de datos inicializada');
            
            var rolesCount = await DBModule.query('SELECT COUNT(*) as total FROM roles');
            if (rolesCount[0] && rolesCount[0].total === 0) {
                await DBModule.seed();
                console.log('Datos de ejemplo cargados');
            }
            
            var hasSession = AuthModule.init();
            NotificationsModule.init();
            
            isAppReady = true;
            
            if (hasSession) {
                var user = AuthModule.getCurrentUser();
                if (user) {
                    var role = user.rol_nombre || 'egresado';
                    showDashboard(role);
                } else {
                    showLogin();
                }
            } else {
                showLogin();
            }
            
            console.log('SISPE listo');
            return true;
        } catch (error) {
            console.error('Error:', error);
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
                            <p class="brand-subtitle">Sistema de Preparacion para el Empleo</p>
                            <div class="brand-line"></div>
                            <p class="brand-description">
                                Plataforma integral para la superacion profesional<br>
                                de los recien graduados universitarios
                            </p>
                            <div class="brand-features">
                                <span><i class="fas fa-check-circle"></i> Planes personalizados</span>
                                <span><i class="fas fa-check-circle"></i> Tutorias sistematicas</span>
                                <span><i class="fas fa-check-circle"></i> Evaluacion de competencias</span>
                            </div>
                        </div>
                    </div>
                    <div class="login-right">
                        <div class="login-card">
                            <div class="login-header">
                                <h2>Iniciar Sesion</h2>
                                <p>Ingresa tus credenciales para acceder</p>
                            </div>
                            
                            <form id="login-form">
                                <div class="form-group">
                                    <label><i class="fas fa-user"></i> Usuario</label>
                                    <input type="text" id="login-username" placeholder="Nombre de usuario..." autofocus>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-lock"></i> Contrasena</label>
                                    <input type="password" id="login-password" placeholder="Contrasena...">
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">
                                    <i class="fas fa-arrow-right"></i> Iniciar sesion
                                </button>
                            </form>
                            
                            <div style="text-align:center;margin-top:12px;font-size:14px;color:#64748b;">
                                No tienes cuenta? 
                                <a href="#" onclick="if(window.RegisterModule){RegisterModule.renderRegisterForm();}return false;" style="color:#2a6b9c;font-weight:600;cursor:pointer;text-decoration:none;">
                                    Registrate aqui
                                </a>
                            </div>
                            
                            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.8;">
                                <div>SISPE v1.0 | UIJ 2026</div>
                                <div style="font-size:11px;color:#a0aec0;margin-top:4px;">
                                    &copy; 2026 - Todos los derechos reservados<br>
                                    Desarrollado por Ricardo Castillo Valdes<br>
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
                }).catch(function(err) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showError('Error al iniciar sesion.');
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
                            <span class="logo-badge">v1.0</span>
                        </div>
                        <button class="btn-mobile-menu" id="btn-mobile-menu">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                    <div class="topbar-right">
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
                            <span>v1.0</span>
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
            sidebarMenu.innerHTML = '<div class="menu-label">Navegacion</div>' +
                menuItems.map(function(item) {
                    return '<div class="menu-item" data-page="' + item.id + '">' +
                        '<span class="icon"><i class="fas ' + item.icon + '"></i></span>' +
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
    }

    function getMenuItems(role) {
        var menuMap = {
            'egresado': [
                { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
                { id: 'plan', icon: 'fa-clipboard-list', label: 'Mi Plan' },
                { id: 'tutorias', icon: 'fa-chalkboard-user', label: 'Tutorias' },
                { id: 'evidencias', icon: 'fa-upload', label: 'Evidencias' },
                { id: 'evaluaciones', icon: 'fa-star', label: 'Evaluaciones' }
            ],
            'tutor': [
                { id: 'dashboard', icon: 'fa-chart-simple', label: 'Dashboard' },
                { id: 'tutorados', icon: 'fa-users', label: 'Tutorados' },
                { id: 'registrar-tutoria', icon: 'fa-pen-to-square', label: 'Registrar Tutoria' },
                { id: 'evaluar', icon: 'fa-star', label: 'Evaluar' }
            ],
            'coordinador': [
                { id: 'dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
                { id: 'planes', icon: 'fa-clipboard-check', label: 'Planes' },
                { id: 'entidades', icon: 'fa-building', label: 'Entidades' },
                { id: 'reportes', icon: 'fa-file-pdf', label: 'Reportes' }
            ],
            'directivo': [
                { id: 'dashboard', icon: 'fa-building', label: 'Dashboard' },
                { id: 'planes', icon: 'fa-clipboard-list', label: 'Planes' },
                { id: 'estadisticas', icon: 'fa-chart-bar', label: 'Estadisticas' }
            ],
            'administrador': [
                { id: 'dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
                { id: 'usuarios', icon: 'fa-users-cog', label: 'Usuarios' },
                { id: 'graduados', icon: 'fa-user-graduate', label: 'Graduados' },
                { id: 'docentes', icon: 'fa-chalkboard-teacher', label: 'Docentes' },
                { id: 'entidades', icon: 'fa-building', label: 'Entidades' },
                { id: 'carreras', icon: 'fa-graduation-cap', label: 'Carreras' },
                { id: 'reportes', icon: 'fa-file-pdf', label: 'Reportes' }
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

        var module = moduleMap[role];
        if (module && typeof module.navigate === 'function') {
            // Llamar a navigate y esperar si es async
            var result = module.navigate(pageId);
            // Si devuelve una promesa, manejarla
            if (result && typeof result.then === 'function') {
                result.catch(function(err) {
                    console.error('Error en modulo:', err);
                    pageContainer.innerHTML = `
                        <div class="page-header">
                            <h2><i class="fas fa-exclamation-triangle"></i> Error</h2>
                            <div class="breadcrumb">${pageId}</div>
                        </div>
                        <div class="card">
                            <p class="text-muted">Error al cargar el modulo: ${err.message || 'Error desconocido'}</p>
                        </div>
                    `;
                });
            }
        } else {
            var user = AuthModule.getCurrentUser();
            var userName = user ? user.nombre : 'Usuario';
            var roleName = user ? user.rol_nombre : role;
            
            pageContainer.innerHTML = `
                <div class="page-header">
                    <h2><i class="fas fa-file"></i> ${pageId}</h2>
                    <div class="breadcrumb">${userName} · ${roleName}</div>
                </div>
                <div class="card">
                    <p class="text-muted">Bienvenido, ${userName}.</p>
                    <p class="text-muted">Tu rol es: <strong>${roleName}</strong></p>
                    <p class="text-muted">El modulo "${pageId}" esta en desarrollo.</p>
                </div>
            `;
        }
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
console.log('App cargada correctamente.');
