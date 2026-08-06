// ============================================================
// SISPE - app.js
// Controlador Principal - CON SELECTOR DE ROLES "INMORTAL"
// RUTA: js/app.js
// ============================================================

const App = (function() {
    'use strict';

    var currentPage = 'login';
    var isAppReady = false;
    var selectorObserver = null;

    // ============================================================
    // MAPA DE EMOJIS
    // ============================================================
    function getEmoji(icono) {
        var mapa = {
            'dashboard': '\uD83D\uDCCA',
            'dashboard-proyecto': '\uD83D\uDCCA',
            'usuarios': '\uD83D\uDC64',
            'graduados': '\uD83D\uDC68\u200D\uD83C\uDF93',
            'docentes': '\uD83E\uDDD1\u200D\uD83C\uDFEB',
            'entidades': '\uD83C\uDFE2',
            'carreras': '\uD83C\uDF93',
            'asignar-tutores': '\uD83D\uDC65',
            'reportes': '\uD83D\uDCC4',
            'competencias': '\u2B50',
            'cursos': '\uD83D\uDCDA',
            'eventos': '\uD83D\uDCC5',
            'investigadores': '\uD83D\uDD2C',
            'proyecto': '\uD83D\uDCCB',
            'objetivos': '\uD83C\uDFAF',
            'productos': '\uD83D\uDCDD',
            'tutorados': '\uD83D\uDC65',
            'registrar-tutoria': '\uD83D\uDCDD',
            'evaluar': '\u2B50',
            'asignar-egresados': '\uD83D\uDC64',
            'evaluar-competencias': '\u2B50',
            'plan': '\uD83D\uDCCB',
            'tutorias': '\uD83D\uDCDD',
            'evidencias': '\uD83D\uDCCE',
            'evaluaciones': '\u2B50',
            'solicitar-tutor': '\uD83D\uDC68\u200D\uD83C\uDFEB',
            'mis-cursos': '\uD83D\uDCDA',
            'mis-eventos': '\uD83D\uDCC5',
            'planes': '\uD83D\uDCCB',
            'estadisticas': '\uD83D\uDCCA',
            'directivo-dashboard': '\uD83C\uDFDB'
        };
        return mapa[icono] || '\uD83D\uDCCA';
    }

    // ============================================================
    // CONSTRUIR EL SELECTOR DE ROLES
    // ============================================================
    function construirSelector(user) {
        if (!user) {
            console.warn('⚠️ construirSelector: No hay usuario');
            return null;
        }

        // Asegurar que todos_los_roles existe
        if (!user.todos_los_roles || user.todos_los_roles.length === 0) {
            var roles = user.roles_adicionales || [];
            var todosLosRoles = [user.rol_nombre, ...roles];
            user.todos_los_roles = [...new Set(todosLosRoles)];
            var session = JSON.parse(localStorage.getItem('sispe_session'));
            if (session) {
                session.user.todos_los_roles = user.todos_los_roles;
                localStorage.setItem('sispe_session', JSON.stringify(session));
            }
        }

        var todosLosRoles = user.todos_los_roles || [];
        console.log('📋 Roles para selector:', todosLosRoles);

        if (todosLosRoles.length <= 1) {
            var existente = document.getElementById('selector-rol-container');
            if (existente) existente.remove();
            return null;
        }

        var topbarRight = document.querySelector('.topbar-right');
        if (!topbarRight) {
            console.warn('⚠️ No se encontró .topbar-right');
            return null;
        }

        var existente = document.getElementById('selector-rol-container');
        if (existente) existente.remove();

        var roleLabels = {
            'administrador': 'Administrador',
            'coordinador': 'Coordinador',
            'directivo': 'Directivo',
            'tutor': 'Tutor',
            'egresado': 'Egresado'
        };

        var container = document.createElement('div');
        container.id = 'selector-rol-container';
        container.style.cssText = `
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            background: rgba(255, 255, 255, 0.12) !important;
            padding: 4px 12px 4px 16px !important;
            border-radius: 20px !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            flex-shrink: 0 !important;
            margin-right: 8px !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 999 !important;
            position: relative !important;
        `;

        var icon = document.createElement('i');
        icon.className = 'fas fa-exchange-alt';
        icon.style.cssText = 'color:rgba(255,255,255,0.7);font-size:13px;';
        container.appendChild(icon);

        var label = document.createElement('span');
        label.textContent = 'ROL:';
        label.style.cssText = 'color:rgba(255,255,255,0.6);font-size:11px;font-weight:500;';
        container.appendChild(label);

        var select = document.createElement('select');
        select.id = 'selector-rol';
        select.style.cssText = `
            background: transparent !important;
            color: white !important;
            border: none !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            padding: 4px 22px 4px 6px !important;
            outline: none !important;
            font-family: 'Inter', sans-serif !important;
            -webkit-appearance: none !important;
            appearance: none !important;
            min-width: 80px !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.7)' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 0 center !important;
            background-size: 10px !important;
        `;

        todosLosRoles.forEach(function(r) {
            var option = document.createElement('option');
            option.value = r;
            var labelText = roleLabels[r] || r.charAt(0).toUpperCase() + r.slice(1);
            option.textContent = labelText;
            option.style.cssText = `
                background: #0a1e3c !important;
                color: white !important;
                padding: 8px 16px !important;
                font-weight: 500 !important;
            `;
            if (r === user.rol_nombre) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        container.appendChild(select);

        var star = document.createElement('span');
        star.textContent = '⭐';
        star.style.cssText = 'color:rgba(255,255,255,0.3);font-size:10px;margin-left:4px;';
        container.appendChild(star);

        var userProfile = topbarRight.querySelector('.user-profile');
        if (userProfile) {
            topbarRight.insertBefore(container, userProfile);
        } else {
            topbarRight.insertBefore(container, topbarRight.firstChild);
        }

        // 🔥 Evento para cambiar de rol - SIN RECARGAR LA PÁGINA
        select.addEventListener('change', function() {
            var nuevoRol = this.value;
            console.log('🔄 Cambiando a rol:', nuevoRol);
            cambiarRolSinRecargar(nuevoRol);
        });

        console.log('✅ Selector construido. Roles:', todosLosRoles);
        return container;
    }

    // ============================================================
    // 🔥 CAMBIAR ROL - SIN RECARGAR LA PÁGINA
    // ============================================================
    function cambiarRolSinRecargar(nuevoRol) {
        var user = AuthModule.getCurrentUser();
        if (!user) {
            console.error('❌ No hay usuario');
            return;
        }

        var rolMap = {
            'administrador': 1,
            'tutor': 2,
            'coordinador': 3,
            'egresado': 4,
            'directivo': 5
        };

        var nuevoRolId = rolMap[nuevoRol];
        if (!nuevoRolId) {
            console.error('❌ Rol no válido:', nuevoRol);
            return;
        }

        // Guardar todos los roles
        var todosLosRoles = user.todos_los_roles || [user.rol_nombre, ...(user.roles_adicionales || [])];
        todosLosRoles = [...new Set(todosLosRoles)];

        // Actualizar usuario
        user.rol_nombre = nuevoRol;
        user.rol_id = nuevoRolId;
        user.todos_los_roles = todosLosRoles;

        // Guardar en sesión
        var sessionData = {
            user: user,
            timestamp: Date.now(),
            expires: Date.now() + 86400000
        };
        localStorage.setItem('sispe_session', JSON.stringify(sessionData));

        // Actualizar AuthModule
        if (window.AuthModule) {
            var session = JSON.parse(localStorage.getItem('sispe_session'));
            if (session) {
                AuthModule.currentUser = session.user;
                AuthModule.currentSession = session;
            }
        }

        console.log('✅ Rol cambiado a:', nuevoRol);
        console.log('📋 Todos los roles:', todosLosRoles);

        if (window.NotificationsModule) {
            window.NotificationsModule.showSuccess('🔄 Cambiado a rol: ' + nuevoRol);
        }

        // 🔥 ACTUALIZAR LA INTERFAZ SIN RECARGAR
        actualizarInterfazPorRol(nuevoRol);
    }

    // ============================================================
    // 🔥 ACTUALIZAR INTERFAZ SIN RECARGAR
    // ============================================================
    function actualizarInterfazPorRol(nuevoRol) {
        var user = AuthModule.getCurrentUser();
        if (!user) return;

        // 1. Actualizar el texto del rol en el topbar
        var roleLabelEl = document.getElementById('display-role');
        if (roleLabelEl) {
            var roleLabels = {
                'administrador': 'Administrador',
                'coordinador': 'Coordinador',
                'directivo': 'Directivo',
                'tutor': 'Tutor',
                'egresado': 'Egresado'
            };
            roleLabelEl.textContent = roleLabels[nuevoRol] || nuevoRol;
        }

        // 2. Actualizar el menú lateral
        var menuItems = getMenuItems(nuevoRol);
        var sidebarMenu = document.getElementById('sidebar-menu');
        if (sidebarMenu) {
            sidebarMenu.innerHTML = '<div class="menu-label">Navegaci\u00f3n</div>' +
                menuItems.map(function(item) {
                    var icono = getEmoji(item.id);
                    return '<div class="menu-item" data-page="' + item.id + '">' +
                        '<span class="icon">' + icono + '</span>' +
                        '<span>' + item.label + '</span></div>';
                }).join('');

            // Reasignar eventos del menú
            sidebarMenu.querySelectorAll('.menu-item').forEach(function(el) {
                el.addEventListener('click', function() {
                    var pageId = this.dataset.page;
                    sidebarMenu.querySelectorAll('.menu-item').forEach(function(m) {
                        m.classList.remove('active');
                    });
                    this.classList.add('active');
                    navigateTo(pageId, nuevoRol);
                });
            });

            // Activar el primer item
            var firstItem = sidebarMenu.querySelector('.menu-item');
            if (firstItem) firstItem.classList.add('active');
        }

        // 3. Reconstruir el selector (ya está visible, pero actualizamos la selección)
        var sel = document.getElementById('selector-rol');
        if (sel) {
            sel.value = nuevoRol;
        }

        // 4. Navegar al dashboard del nuevo rol
        var userNow = AuthModule.getCurrentUser();
        if (userNow) {
            var breadcrumb = renderBreadcrumb('dashboard', nuevoRol);
            var pageContainer = document.getElementById('page-container');
            if (pageContainer) {
                var moduleMap = {
                    'egresado': window.EgresadoModule,
                    'tutor': window.TutorModule,
                    'coordinador': window.CoordinadorModule,
                    'directivo': window.DirectivoModule,
                    'administrador': window.AdminModule
                };
                var module = moduleMap[nuevoRol];
                if (module && typeof module.navigate === 'function') {
                    module.navigate('dashboard', breadcrumb);
                } else {
                    pageContainer.innerHTML = breadcrumb + renderDashboardGenerico(nuevoRol);
                }
            }
        }

        // 5. Reconstruir el selector después de cambiar el contenido
        setTimeout(function() {
            var userCheck = AuthModule.getCurrentUser();
            if (userCheck) {
                construirSelector(userCheck);
            }
        }, 300);

        console.log('✅ Interfaz actualizada para rol:', nuevoRol);
    }

    // ============================================================
    // RENDER DASHBOARD GENÉRICO (fallback)
    // ============================================================
    function renderDashboardGenerico(role) {
        var roleLabels = {
            'administrador': 'Administrador',
            'coordinador': 'Coordinador',
            'directivo': 'Directivo',
            'tutor': 'Tutor',
            'egresado': 'Egresado'
        };
        var roleLabel = roleLabels[role] || role;
        return `
            <div class="page-header">
                <h2><i class="fas fa-chart-pie"></i> Dashboard de ${roleLabel}</h2>
                <div class="breadcrumb">Bienvenido, ${roleLabel}</div>
            </div>
            <div class="card">
                <p>Has cambiado al rol: <strong>${roleLabel}</strong></p>
                <p>El dashboard se está cargando...</p>
            </div>
        `;
    }

    // ============================================================
    // VIGILANTE DEL SELECTOR (MutationObserver)
    // ============================================================
    function iniciarVigilanteSelector() {
        if (selectorObserver) {
            console.log('ℹ️ Vigilante ya activo');
            return;
        }

        var topbarRight = document.querySelector('.topbar-right');
        if (!topbarRight) {
            console.warn('⚠️ No se encontró topbar-right para el vigilante');
            setTimeout(iniciarVigilanteSelector, 500);
            return;
        }

        console.log('🛡️ Activando vigilante del selector...');

        selectorObserver = new MutationObserver(function(mutations) {
            var sel = document.getElementById('selector-rol-container');
            if (!sel) {
                console.log('🔄 Vigilante: Selector desapareció, reconstruyendo...');
                var user = AuthModule.getCurrentUser();
                if (user) {
                    construirSelector(user);
                }
            }
        });

        selectorObserver.observe(topbarRight, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        // Observar también el body
        var bodyObserver = new MutationObserver(function() {
            var topbar = document.querySelector('.topbar-right');
            if (!topbar) {
                console.log('🔄 Vigilante: topbar-right desapareció');
                setTimeout(function() {
                    var nuevoTopbar = document.querySelector('.topbar-right');
                    if (nuevoTopbar && !document.getElementById('selector-rol-container')) {
                        var user = AuthModule.getCurrentUser();
                        if (user) {
                            console.log('🔄 Reconstruyendo selector después de recrear topbar');
                            construirSelector(user);
                        }
                    }
                }, 300);
            }
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
        window.__bodyObserver = bodyObserver;

        console.log('✅ Vigilante del selector activo');
    }

    // ============================================================
    // SELECTOR RÁPIDO DE USUARIOS
    // ============================================================
    function agregarSelectorRapidoEnLogin() {
        var container = document.getElementById('quick-login-selector-container');
        if (!container) return;
        if (document.getElementById('quick-login-selector')) return;

        var usuarios = [
            { username: 'admin', password: 'admin123', rol: 'Administrador', badge: 'badge-admin' },
            { username: 'carlos.p', password: '123456', rol: 'Egresado', badge: 'badge-egresado' },
            { username: 'maria.g', password: '123456', rol: 'Tutor', badge: 'badge-tutor' },
            { username: 'coord1', password: '123456', rol: 'Coordinador', badge: 'badge-coordinador' },
            { username: 'directivo1', password: '123456', rol: 'Directivo', badge: 'badge-directivo' },
            { username: 'multi_rol', password: '123456', rol: '\u2B50 Multi-Rol', badge: 'badge-multi' }
        ];

        var selectorHTML = `
            <div id="quick-login-selector" class="login-quick-select">
                <label><i class="fas fa-rocket"></i> Acceso R\u00e1pido para Pruebas</label>
                <select id="quick-user-select">
                    <option value="">-- Selecciona un usuario de prueba --</option>
                    ${usuarios.map(function(u) {
                        return `<option value="${u.username}" data-password="${u.password}" data-rol="${u.rol}">
                            ${u.username} 
                            <span class="user-badge ${u.badge}">${u.rol}</span>
                        </option>`;
                    }).join('')}
                </select>
                <div style="margin-top:6px;font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:6px;">
                    <i class="fas fa-info-circle"></i>
                    <span>Selecciona un usuario para llenar autom\u00e1ticamente las credenciales</span>
                </div>
            </div>
        `;

        container.innerHTML = selectorHTML;

        var select = document.getElementById('quick-user-select');
        if (select) {
            select.addEventListener('change', function() {
                var selectedOption = this.options[this.selectedIndex];
                var username = selectedOption.value;
                var password = selectedOption.dataset.password;

                if (username && password) {
                    var userInput = document.getElementById('login-username');
                    var passInput = document.getElementById('login-password');

                    if (userInput) {
                        userInput.value = username;
                        userInput.dispatchEvent(new Event('input'));
                    }
                    if (passInput) {
                        passInput.value = password;
                        passInput.dispatchEvent(new Event('input'));
                    }

                    var rol = selectedOption.dataset.rol || 'Usuario';
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showToast(
                            '\uD83D\uDC64 Usuario "' + username + '" (' + rol + ') seleccionado.',
                            'info',
                            2500
                        );
                    }
                }
            });
        }

        console.log('✅ Selector rápido agregado en login');
    }

    // ============================================================
    // INICIALIZAR MÓDULOS
    // ============================================================
    async function initializeModules() {
        try {
            console.log('🚀 Inicializando SISPE...');

            if (typeof DBModule === 'undefined') {
                console.error('❌ DBModule no está definido');
                var appContainer = document.getElementById('app');
                if (appContainer) {
                    appContainer.innerHTML = `
                        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a1e3c;color:white;padding:20px;font-family:'Inter',sans-serif;">
                            <div style="text-align:center;max-width:500px;">
                                <div style="font-size:64px;margin-bottom:16px;">⚠️</div>
                                <h1 style="font-size:24px;margin-bottom:8px;">Error al iniciar SISPE</h1>
                                <p style="color:#94a3b8;font-size:14px;">DBModule no está definido.</p>
                                <p style="color:#64748b;font-size:13px;margin-top:12px;">
                                    Verifica que el archivo <code>js/modules/db.js</code> se esté cargando correctamente.
                                </p>
                                <button onclick="location.reload()" style="margin-top:16px;padding:12px 32px;background:#4a9ad9;color:white;border:none;border-radius:10px;font-size:16px;cursor:pointer;font-family:'Inter',sans-serif;">
                                    <i class="fas fa-sync-alt"></i> Reintentar
                                </button>
                            </div>
                        </div>
                    `;
                }
                return false;
            }

            console.log('✅ DBModule encontrado:', typeof DBModule);

            await DBModule.init();
            console.log('✅ Base de datos SQLite inicializada');

            try {
                console.log('💾 Verificando localStorage...');
                var localData = localStorage.getItem('sispe_db_data');
                if (localData) {
                    console.log('💾 Datos encontrados en localStorage');
                    await DBModule.recargarDesdeLocalStorage();
                    console.log('✅ Datos recargados');
                }
            } catch (e) {
                console.warn('⚠️ Error al recargar:', e);
            }

            try {
                var rolesCount = await DBModule.query('SELECT COUNT(*) as total FROM roles');
                if (!rolesCount || rolesCount.length === 0 || rolesCount[0].total === 0) {
                    console.log('📋 Creando base de datos...');
                    await DBModule.createDatabase();
                    console.log('✅ Base de datos creada');
                } else {
                    console.log('✅ Base de datos existe con ' + rolesCount[0].total + ' roles');
                }
            } catch (error) {
                console.log('📋 Tablas no encontradas. Creando...');
                await DBModule.createDatabase();
                console.log('✅ Base de datos creada');
            }

            var hasSession = AuthModule.init();
            NotificationsModule.init();

            isAppReady = true;

            if (hasSession) {
                var user = AuthModule.getCurrentUser();
                if (user) {
                    console.log('👤 Usuario autenticado:', user.username);
                    console.log('📋 Rol actual:', user.rol_nombre);
                    console.log('📋 Roles adicionales:', user.roles_adicionales);
                    console.log('📋 Todos los roles:', user.todos_los_roles);
                    var role = user.rol_nombre || 'egresado';
                    showDashboard(role);
                    // Iniciar vigilante
                    setTimeout(iniciarVigilanteSelector, 1000);
                } else {
                    showLogin();
                }
            } else {
                showLogin();
            }

            console.log('✅ SISPE listo');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar:', error);
            var appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a1e3c;color:white;padding:20px;font-family:'Inter',sans-serif;">
                        <div style="text-align:center;max-width:500px;">
                            <div style="font-size:64px;margin-bottom:16px;">❌</div>
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

    // ============================================================
    // MOSTRAR LOGIN
    // ============================================================
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

                            <div id="quick-login-selector-container"></div>

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
                                \u00bfNo tienes cuenta?
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
                }).catch(function(err) {
                    if (window.NotificationsModule) {
                        window.NotificationsModule.showError('Error al iniciar sesi\u00f3n.');
                    }
                });
            });
        }

        setTimeout(function() {
            agregarSelectorRapidoEnLogin();
        }, 100);
    }

    // ============================================================
    // MOSTRAR DASHBOARD
    // ============================================================
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

        // Construir selector inmediatamente
        setTimeout(function() {
            var userNow = AuthModule.getCurrentUser();
            if (userNow) {
                construirSelector(userNow);
            }
        }, 300);
    }

    // ============================================================
    // OBTENER MENÚ
    // ============================================================
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

    // ============================================================
    // NAVEGAR
    // ============================================================
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
        } else {
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

        // Reconstruir selector después de navegar
        setTimeout(function() {
            var sel = document.getElementById('selector-rol-container');
            if (!sel) {
                var userCheck = AuthModule.getCurrentUser();
                if (userCheck) {
                    console.log('🔄 Reconstruyendo selector después de navegar');
                    construirSelector(userCheck);
                }
            }
        }, 500);
    }

    // ============================================================
    // RENDER BREADCRUMB
    // ============================================================
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

    // ============================================================
    // API PÚBLICA
    // ============================================================
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
        },
        agregarSelectorRoles: function() {
            var user = AuthModule.getCurrentUser();
            if (user) {
                return construirSelector(user);
            }
            return null;
        },
        _iniciarVigilante: iniciarVigilanteSelector
    };

})();

// ============================================================
// INICIALIZAR
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

window.App = App;
console.log('✅ App cargada correctamente.');