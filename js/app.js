// ============================================================
// SISPE - app.js
// Controlador Principal - CON SELECTOR DE ROLES FORZADO
// RUTA: js/app.js
// ============================================================

const App = (function() {
    'use strict';

    var currentPage = 'login';
    var isAppReady = false;
    var selectorObserver = null;
    var loadedModules = {};

    // ============================================================
    // MAPA DE MÓDULOS PARA LAZY LOADING
    // ============================================================
    const MODULES_MAP = {
        'egresado': {
            path: 'js/modules/roles/egresado.js',
            moduleName: 'EgresadoModule',
            dependencies: ['cursos', 'eventos', 'chat', 'calendario']
        },
        'tutor': {
            path: 'js/modules/roles/tutor.js',
            moduleName: 'TutorModule',
            dependencies: ['competencias', 'chat', 'calendario']
        },
        'coordinador': {
            path: 'js/modules/roles/coordinador.js',
            moduleName: 'CoordinadorModule',
            dependencies: ['competencias', 'cursos', 'eventos', 'chat', 'calendario']
        },
        'directivo': {
            path: 'js/modules/roles/directivo.js',
            moduleName: 'DirectivoModule',
            dependencies: ['chat', 'calendario']
        },
        'administrador': {
            path: 'js/modules/admin/index.js',
            moduleName: 'AdminModule',
            dependencies: []
        },
        'competencias': {
            path: 'js/modules/competencias.js',
            moduleName: 'CompetenciasModule',
            dependencies: []
        },
        'cursos': {
            path: 'js/modules/cursos.js',
            moduleName: 'CursosModule',
            dependencies: []
        },
        'eventos': {
            path: 'js/modules/eventos.js',
            moduleName: 'EventosModule',
            dependencies: []
        },
        'proyecto': {
            path: 'js/modules/proyecto.js',
            moduleName: 'ProyectoModule',
            dependencies: []
        },
        'chat': {
            path: 'js/modules/chat.js',
            moduleName: 'ChatModule',
            dependencies: []
        },
        'calendario': {
            path: 'js/modules/calendario.js',
            moduleName: 'CalendarioModule',
            dependencies: []
        },
        'investigadores': {
            path: 'js/modules/investigadores.js',
            moduleName: 'InvestigadoresModule',
            dependencies: []
        }
    };

    // ============================================================
    // CARGA DE MÓDULOS CON LAZY LOADING
    // ============================================================
    async function cargarModulo(moduleKey) {
        if (loadedModules[moduleKey]) {
            return window[MODULES_MAP[moduleKey]?.moduleName];
        }

        const moduleInfo = MODULES_MAP[moduleKey];
        if (!moduleInfo) {
            console.warn(`⚠️ Módulo "${moduleKey}" no encontrado`);
            return null;
        }

        for (const dep of (moduleInfo.dependencies || [])) {
            await cargarModulo(dep);
        }

        if (window[moduleInfo.moduleName]) {
            loadedModules[moduleKey] = true;
            return window[moduleInfo.moduleName];
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = moduleInfo.path;
            script.async = true;
            
            script.onload = function() {
                loadedModules[moduleKey] = true;
                const module = window[moduleInfo.moduleName];
                resolve(module || null);
            };
            
            script.onerror = function() {
                reject(new Error(`Error al cargar módulo: ${moduleKey}`));
            };
            
            document.head.appendChild(script);
            
            setTimeout(() => {
                if (!loadedModules[moduleKey]) {
                    reject(new Error(`Timeout cargando módulo: ${moduleKey}`));
                }
            }, 15000);
        });
    }

    // ============================================================
    async function cargarModulosPorRol(role) {
        const moduleInfo = MODULES_MAP[role];
        if (!moduleInfo) return null;

        try {
            if (role === 'administrador') {
                const module = await cargarModulo(role);
                return module;
            }
            
            for (const dep of (moduleInfo.dependencies || [])) {
                await cargarModulo(dep);
            }
            
            const module = await cargarModulo(role);
            return module;
        } catch (error) {
            console.error(`❌ Error cargando módulos para rol "${role}":`, error);
            return null;
        }
    }

    // ============================================================
    function getEmoji(icono) {
        var mapa = {
            'dashboard': '📊', 'usuarios': '👤', 'graduados': '👨‍🎓',
            'docentes': '👩‍🏫', 'entidades': '🏢', 'carreras': '🎓',
            'asignar-tutores': '👥', 'reportes': '📄', 'competencias': '⭐',
            'cursos': '📚', 'eventos': '📅', 'investigadores': '🔬',
            'proyecto': '📋', 'objetivos': '🎯', 'productos': '📝',
            'tutorados': '👥', 'registrar-tutoria': '📝', 'evaluar': '⭐',
            'asignar-egresados': '👤', 'evaluar-competencias': '⭐',
            'plan': '📋', 'tutorias': '📝', 'evidencias': '📎',
            'evaluaciones': '⭐', 'solicitar-tutor': '👨‍🏫',
            'mis-cursos': '📚', 'mis-eventos': '📅', 'planes': '📋',
            'estadisticas': '📊', 'directivo-dashboard': '🏛️',
            'chat': '💬', 'calendario': '📅'
        };
        return mapa[icono] || '📊';
    }

    // ============================================================
    // 🔥 CONSTRUIR SELECTOR DE ROLES - SIEMPRE PARA ADMIN
    // ============================================================
    function construirSelector(user) {
        console.log('🔧 construirSelector llamado');
        
        if (!user) return null;

        // 🔥 FORZAR ROLES PARA ADMIN
        var esAdmin = user.username === 'admin' || user.rol_nombre === 'administrador' || user.id === 1;
        
        var todosLosRoles = user.todos_los_roles || [];
        
        // Si es admin y no tiene roles, forzarlos
        if (esAdmin && todosLosRoles.length <= 1) {
            console.log('👑 Forzando todos los roles para ADMIN');
            todosLosRoles = ['administrador', 'coordinador', 'directivo', 'tutor', 'egresado'];
            user.todos_los_roles = todosLosRoles;
            user.roles_adicionales = ['coordinador', 'directivo', 'tutor', 'egresado'];
            
            // Guardar en sesión
            var session = JSON.parse(localStorage.getItem('sispe_session'));
            if (session) {
                session.user.todos_los_roles = todosLosRoles;
                session.user.roles_adicionales = ['coordinador', 'directivo', 'tutor', 'egresado'];
                localStorage.setItem('sispe_session', JSON.stringify(session));
            }
        }

        if (todosLosRoles.length <= 1) {
            var existente = document.getElementById('selector-rol-container');
            if (existente) existente.remove();
            return null;
        }

        var topbarRight = document.querySelector('.topbar-right');
        if (!topbarRight) {
            setTimeout(function() { construirSelector(user); }, 500);
            return null;
        }

        var existente = document.getElementById('selector-rol-container');
        if (existente) existente.remove();

        var isMobile = window.innerWidth <= 480 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

        var container = document.createElement('div');
        container.id = 'selector-rol-container';
        container.style.cssText = `
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: ${isMobile ? '4px' : '6px'} !important;
            background: rgba(255, 255, 255, 0.15) !important;
            padding: ${isMobile ? '3px 10px 3px 12px' : '4px 14px 4px 18px'} !important;
            border-radius: ${isMobile ? '18px' : '22px'} !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            flex-shrink: ${isMobile ? '1' : '0'} !important;
            min-width: ${isMobile ? '70px' : 'auto'} !important;
            max-width: ${isMobile ? '170px' : 'auto'} !important;
            margin-right: ${isMobile ? '6px' : '10px'} !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 9999 !important;
            position: relative !important;
        `;

        if (!isMobile) {
            var icon = document.createElement('i');
            icon.className = 'fas fa-exchange-alt';
            icon.style.cssText = 'color:rgba(255,255,255,0.7);font-size:11px;flex-shrink:0;';
            container.appendChild(icon);

            var label = document.createElement('span');
            label.textContent = 'ROL:';
            label.style.cssText = 'color:rgba(255,255,255,0.5);font-size:9px;font-weight:600;flex-shrink:0;letter-spacing:0.5px;';
            container.appendChild(label);
        }

        var select = document.createElement('select');
        select.id = 'selector-rol';
        select.style.cssText = `
            background: transparent !important;
            color: white !important;
            border: none !important;
            font-size: ${isMobile ? '12px' : '13px'} !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            padding: ${isMobile ? '3px 20px 3px 6px' : '4px 24px 4px 8px'} !important;
            outline: none !important;
            font-family: 'Inter', sans-serif !important;
            -webkit-appearance: none !important;
            appearance: none !important;
            min-width: ${isMobile ? '70px' : '90px'} !important;
            max-width: ${isMobile ? '120px' : 'auto'} !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${isMobile ? '10' : '12'}' height='${isMobile ? '6' : '8'}' viewBox='0 0 ${isMobile ? '10' : '12'} ${isMobile ? '6' : '8'}'%3E%3Cpath d='M1 1l${isMobile ? '4' : '5'} ${isMobile ? '4' : '5'} ${isMobile ? '4' : '5'}-${isMobile ? '4' : '5'}' stroke='rgba(255,255,255,0.8)' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 0 center !important;
            background-size: ${isMobile ? '8px' : '10px'} !important;
        `;

        var roleLabels = {
            'administrador': isMobile ? 'Admin' : 'Administrador',
            'coordinador': isMobile ? 'Coord' : 'Coordinador',
            'directivo': isMobile ? 'Direct' : 'Directivo',
            'tutor': 'Tutor',
            'egresado': isMobile ? 'Egres' : 'Egresado'
        };

        todosLosRoles.forEach(function(r) {
            var option = document.createElement('option');
            option.value = r;
            option.textContent = roleLabels[r] || r;
            option.style.cssText = `
                background: #0a1e3c !important;
                color: white !important;
                padding: 6px 12px !important;
                font-weight: 500 !important;
                font-size: ${isMobile ? '12px' : '13px'} !important;
            `;
            if (r === user.rol_nombre) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        container.appendChild(select);

        var userProfile = topbarRight.querySelector('.user-profile');
        if (userProfile) {
            if (isMobile) {
                topbarRight.insertBefore(container, userProfile.nextSibling);
            } else {
                topbarRight.insertBefore(container, userProfile);
            }
        } else {
            topbarRight.insertBefore(container, topbarRight.firstChild);
        }

        select.addEventListener('change', function() {
            var nuevoRol = this.value;
            console.log('🔄 Cambiando a rol:', nuevoRol);
            cambiarRolSinRecargar(nuevoRol);
        });

        console.log('✅ Selector construido correctamente');
        return container;
    }

    // ============================================================
    // CAMBIAR ROL - SIN RECARGAR
    // ============================================================
    async function cambiarRolSinRecargar(nuevoRol) {
        var user = AuthModule.getCurrentUser();
        if (!user) return;

        var rolMap = {
            'administrador': 1, 'tutor': 2, 'coordinador': 3,
            'egresado': 4, 'directivo': 5
        };

        var nuevoRolId = rolMap[nuevoRol];
        if (!nuevoRolId) return;

        var todosLosRoles = user.todos_los_roles || [user.rol_nombre, ...(user.roles_adicionales || [])];
        todosLosRoles = [...new Set(todosLosRoles)];

        user.rol_nombre = nuevoRol;
        user.rol_id = nuevoRolId;
        user.todos_los_roles = todosLosRoles;

        var sessionData = {
            user: user,
            timestamp: Date.now(),
            expires: Date.now() + 86400000
        };
        localStorage.setItem('sispe_session', JSON.stringify(sessionData));

        if (window.AuthModule) {
            var session = JSON.parse(localStorage.getItem('sispe_session'));
            if (session) {
                AuthModule.currentUser = session.user;
                AuthModule.currentSession = session;
            }
        }

        mostrarLoading('Cambiando a rol: ' + nuevoRol + '...');
        
        try {
            await cargarModulosPorRol(nuevoRol);
            ocultarLoading();
            
            if (window.NotificationsModule) {
                window.NotificationsModule.showSuccess('🔄 Cambiado a rol: ' + nuevoRol);
            }
            
            actualizarInterfazPorRol(nuevoRol);
        } catch (error) {
            ocultarLoading();
            console.error('Error al cargar módulos del rol:', error);
        }
    }

    // ============================================================
    // MOSTRAR/OCULTAR LOADING
    // ============================================================
    function mostrarLoading(mensaje) {
        var existing = document.getElementById('lazy-loading-overlay');
        if (existing) {
            var textEl = existing.querySelector('.loading-text');
            if (textEl) textEl.textContent = mensaje || 'Cargando...';
            return;
        }

        var overlay = document.createElement('div');
        overlay.id = 'lazy-loading-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 30, 60, 0.7); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            z-index: 999999; flex-direction: column; gap: 16px;
        `;
        overlay.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 30px 40px; text-align: center; max-width: 400px;">
                <div style="font-size: 40px; margin-bottom: 12px;">⏳</div>
                <div style="font-size: 18px; font-weight: 600; color: #0a1e3c;" class="loading-text">${mensaje || 'Cargando...'}</div>
                <div style="margin-top: 16px;">
                    <div style="width: 200px; height: 4px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 0 auto;">
                        <div style="width: 30%; height: 100%; background: #2a6b9c; border-radius: 4px; animation: loadingProgress 1s infinite ease-in-out;"></div>
                    </div>
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">Cargando módulos...</div>
            </div>
        `;

        if (!document.getElementById('lazy-loading-styles')) {
            var style = document.createElement('style');
            style.id = 'lazy-loading-styles';
            style.textContent = `
                @keyframes loadingProgress {
                    0% { width: 10%; margin-left: 0; }
                    50% { width: 70%; }
                    100% { width: 10%; margin-left: 90%; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(overlay);
    }

    function ocultarLoading() {
        var overlay = document.getElementById('lazy-loading-overlay');
        if (overlay) overlay.remove();
    }

    // ============================================================
    // ACTUALIZAR INTERFAZ SIN RECARGAR
    // ============================================================
    function actualizarInterfazPorRol(nuevoRol) {
        var user = AuthModule.getCurrentUser();
        if (!user) return;

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

        var menuItems = getMenuItems(nuevoRol);
        var sidebarMenu = document.getElementById('sidebar-menu');
        if (sidebarMenu) {
            sidebarMenu.innerHTML = '<div class="menu-label">Navegación</div>' +
                menuItems.map(function(item) {
                    var icono = getEmoji(item.id);
                    return '<div class="menu-item" data-page="' + item.id + '">' +
                        '<span class="icon">' + icono + '</span>' +
                        '<span>' + item.label + '</span>' +
                        '</div>';
                }).join('');

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

            var firstItem = sidebarMenu.querySelector('.menu-item');
            if (firstItem) firstItem.classList.add('active');
        }

        var sel = document.getElementById('selector-rol');
        if (sel) {
            sel.value = nuevoRol;
        }

        var userNow = AuthModule.getCurrentUser();
        if (userNow) {
            var breadcrumb = renderBreadcrumb('dashboard', nuevoRol);
            var pageContainer = document.getElementById('page-container');
            if (pageContainer) {
                var module = window[MODULES_MAP[nuevoRol]?.moduleName];
                if (module && typeof module.navigate === 'function') {
                    module.navigate('dashboard', breadcrumb);
                } else {
                    pageContainer.innerHTML = breadcrumb + renderDashboardGenerico(nuevoRol);
                }
            }
        }

        setTimeout(function() {
            var userCheck = AuthModule.getCurrentUser();
            if (userCheck) {
                construirSelector(userCheck);
            }
        }, 300);
    }

    // ============================================================
    // VIGILANTE DEL SELECTOR
    // ============================================================
    function iniciarVigilanteSelector() {
        if (selectorObserver) return;

        var topbarRight = document.querySelector('.topbar-right');
        if (!topbarRight) {
            setTimeout(iniciarVigilanteSelector, 500);
            return;
        }

        selectorObserver = new MutationObserver(function() {
            var sel = document.getElementById('selector-rol-container');
            if (!sel) {
                var user = AuthModule.getCurrentUser();
                if (user) {
                    construirSelector(user);
                }
            }
        });

        selectorObserver.observe(topbarRight, {
            childList: true, subtree: true, attributes: true
        });
    }

    // ============================================================
    // NAVEGAR
    // ============================================================
    async function navigateTo(pageId, role) {
        var sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }

        var pageContainer = document.getElementById('page-container');
        if (!pageContainer) return;

        if (MODULES_MAP[role]) {
            var roleModule = window[MODULES_MAP[role].moduleName];
            if (roleModule && typeof roleModule.navigate === 'function') {
                var breadcrumb = renderBreadcrumb(pageId, role);
                try {
                    roleModule.navigate(pageId, breadcrumb);
                    return;
                } catch (error) {
                    console.warn('Error en módulo de rol:', error);
                }
            }
        }

        var functionalModules = ['competencias', 'cursos', 'eventos', 'investigadores', 'proyecto', 'chat', 'calendario'];
        var moduleKey = null;

        if (functionalModules.includes(pageId)) {
            moduleKey = pageId;
        }

        if (['mis-cursos', 'mis-eventos', 'evaluar-competencias'].includes(pageId)) {
            if (pageId === 'mis-cursos') moduleKey = 'cursos';
            else if (pageId === 'mis-eventos') moduleKey = 'eventos';
            else if (pageId === 'evaluar-competencias') moduleKey = 'competencias';
        }

        if (moduleKey) {
            try {
                await cargarModulo(moduleKey);
                var module = window[MODULES_MAP[moduleKey]?.moduleName];
                if (module && typeof module.navigate === 'function') {
                    var breadcrumb = renderBreadcrumb(pageId, role);
                    module.navigate(pageId, breadcrumb);
                    return;
                }
            } catch (error) {
                console.warn('Error cargando módulo funcional:', error);
            }
        }

        var breadcrumb = renderBreadcrumb(pageId, role);
        pageContainer.innerHTML = breadcrumb + renderDashboardGenerico(role);
    }

    // ============================================================
    // FUNCIONES AUXILIARES
    // ============================================================
    function renderBreadcrumb(pageId, role) {
        var pageLabels = {
            'dashboard': 'Dashboard', 'plan': 'Mi Plan',
            'plan-superacion': 'Plan de Superación', 'tutorias': 'Tutorías',
            'evidencias': 'Evidencias', 'evaluaciones': 'Evaluaciones',
            'solicitar-tutor': 'Solicitar Tutor', 'tutorados': 'Tutorados',
            'registrar-tutoria': 'Registrar Tutoría', 'evaluar': 'Evaluar',
            'asignar-egresados': 'Asignar Tutorados', 'planes': 'Planes',
            'entidades': 'Entidades', 'reportes': 'Reportes',
            'estadisticas': 'Estadísticas', 'usuarios': 'Usuarios',
            'graduados': 'Graduados', 'docentes': 'Docentes',
            'carreras': 'Carreras', 'asignar-tutores': 'Asignar Tutores',
            'competencias': 'Competencias', 'cursos': 'Cursos',
            'eventos': 'Eventos', 'investigadores': 'Investigadores',
            'proyecto': 'Proyecto UII', 'chat': 'Mensajes',
            'calendario': 'Calendario'
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
                    <div style="font-size:13px;color:#94a3b8;">${userName} · ${role}</div>
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

    function renderDashboardGenerico(role) {
        var roleLabels = {
            'administrador': 'Administrador', 'coordinador': 'Coordinador',
            'directivo': 'Directivo', 'tutor': 'Tutor', 'egresado': 'Egresado'
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

    function getMenuItems(role) {
        var menuMap = {
            'egresado': [
                { id: 'dashboard', label: 'Dashboard' }, { id: 'plan', label: 'Mi Plan' },
                { id: 'plan-superacion', label: 'Plan de Superación' }, { id: 'tutorias', label: 'Tutorías' },
                { id: 'evidencias', label: 'Evidencias' }, { id: 'evaluaciones', label: 'Evaluaciones' },
                { id: 'solicitar-tutor', label: 'Solicitar Tutor' }, { id: 'mis-cursos', label: 'Mis Cursos' },
                { id: 'mis-eventos', label: 'Mis Eventos' }, { id: 'chat', label: 'Mensajes' },
                { id: 'calendario', label: 'Calendario' }
            ],
            'tutor': [
                { id: 'dashboard', label: 'Dashboard' }, { id: 'tutorados', label: 'Tutorados' },
                { id: 'registrar-tutoria', label: 'Registrar Tutoría' }, { id: 'evaluar', label: 'Evaluar' },
                { id: 'asignar-egresados', label: 'Asignar Tutorados' },
                { id: 'evaluar-competencias', label: 'Evaluar Competencias' },
                { id: 'chat', label: 'Mensajes' }, { id: 'calendario', label: 'Calendario' }
            ],
            'coordinador': [
                { id: 'dashboard', label: 'Dashboard' }, { id: 'planes', label: 'Planes' },
                { id: 'entidades', label: 'Entidades' }, { id: 'competencias', label: 'Competencias' },
                { id: 'cursos', label: 'Cursos' }, { id: 'eventos', label: 'Eventos' },
                { id: 'reportes', label: 'Reportes' }, { id: 'chat', label: 'Mensajes' },
                { id: 'calendario', label: 'Calendario' }
            ],
            'directivo': [
                { id: 'dashboard', label: 'Dashboard' }, { id: 'planes', label: 'Planes' },
                { id: 'competencias', label: 'Competencias' }, { id: 'eventos', label: 'Eventos' },
                { id: 'estadisticas', label: 'Estadísticas' }, { id: 'chat', label: 'Mensajes' },
                { id: 'calendario', label: 'Calendario' }
            ],
            'administrador': [
                { id: 'dashboard', label: 'Dashboard' }, { id: 'usuarios', label: 'Usuarios' },
                { id: 'graduados', label: 'Graduados' }, { id: 'docentes', label: 'Docentes' },
                { id: 'entidades', label: 'Entidades' }, { id: 'carreras', label: 'Carreras' },
                { id: 'asignar-tutores', label: 'Asignar Tutores' }, { id: 'competencias', label: 'Competencias' },
                { id: 'cursos', label: 'Cursos' }, { id: 'eventos', label: 'Eventos' },
                { id: 'investigadores', label: 'Investigadores' }, { id: 'proyecto', label: 'Proyecto UII' },
                { id: 'reportes', label: 'Reportes' }, { id: 'chat', label: 'Mensajes' },
                { id: 'calendario', label: 'Calendario' }
            ]
        };
        return menuMap[role] || menuMap['egresado'];
    }

    // ============================================================
    // INICIALIZAR
    // ============================================================
    async function initializeModules() {
        try {
            console.log('🚀 Inicializando SISPE...');

            if (typeof DBModule === 'undefined') {
                console.error('DBModule no está definido');
                return false;
            }

            await DBModule.init();
            console.log('✅ Base de datos SQLite inicializada');

            var hasSession = AuthModule.init();
            NotificationsModule.init();

            if (hasSession) {
                var user = AuthModule.getCurrentUser();
                if (user) {
                    console.log(`👤 Usuario: ${user.username} - Rol: ${user.rol_nombre}`);
                    
                    // 🔥 FORZAR ROLES PARA ADMIN
                    if (user.username === 'admin' || user.id === 1) {
                        console.log('👑 ADMIN - Forzando todos los roles');
                        user.todos_los_roles = ['administrador', 'coordinador', 'directivo', 'tutor', 'egresado'];
                        user.roles_adicionales = ['coordinador', 'directivo', 'tutor', 'egresado'];
                        
                        var session = JSON.parse(localStorage.getItem('sispe_session'));
                        if (session) {
                            session.user.todos_los_roles = user.todos_los_roles;
                            session.user.roles_adicionales = user.roles_adicionales;
                            localStorage.setItem('sispe_session', JSON.stringify(session));
                        }
                        console.log('✅ Roles forzados:', user.todos_los_roles);
                    }
                    
                    mostrarLoading('Cargando módulo de ' + user.rol_nombre + '...');
                    await cargarModulosPorRol(user.rol_nombre);
                    ocultarLoading();
                    
                    showDashboard(user.rol_nombre);
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
            ocultarLoading();
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
                            <p class="brand-subtitle">Sistema de Preparación para el Empleo</p>
                            <div class="brand-line"></div>
                            <p class="brand-description">
                                Plataforma integral para la superación profesional<br>
                                de los recién graduados universitarios
                            </p>
                            <div class="brand-features">
                                <span><i class="fas fa-check-circle"></i> Planes personalizados</span>
                                <span><i class="fas fa-check-circle"></i> Tutorías sistemáticas</span>
                                <span><i class="fas fa-check-circle"></i> Evaluación de competencias</span>
                            </div>
                        </div>
                    </div>
                    <div class="login-right">
                        <div class="login-card">
                            <div class="login-header">
                                <h2>Iniciar Sesión</h2>
                                <p>Ingresa tus credenciales para acceder</p>
                            </div>
                            <div id="quick-login-selector-container"></div>
                            <form id="login-form">
                                <div class="form-group">
                                    <label><i class="fas fa-user"></i> Usuario</label>
                                    <input type="text" id="login-username" placeholder="Nombre de usuario..." autofocus>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-lock"></i> Contraseña</label>
                                    <input type="password" id="login-password" placeholder="Contraseña...">
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">
                                    <i class="fas fa-arrow-right"></i> Iniciar sesión
                                </button>
                            </form>
                            <div style="text-align:center;margin-top:12px;font-size:14px;color:#64748b;">
                                ¿No tienes cuenta?
                                <a href="#" onclick="if(window.RegisterModule){RegisterModule.renderRegisterForm();}return false;" style="color:#2a6b9c;font-weight:600;cursor:pointer;text-decoration:none;">
                                    Regístrate aquí
                                </a>
                            </div>
                            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.8;">
                                <div>SISPE v4.0 | UIJ 2026</div>
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
                handleLogin();
            });
        }

        setTimeout(function() {
            agregarSelectorRapidoEnLogin();
        }, 100);
    }

    // ============================================================
    // MANEJAR LOGIN
    // ============================================================
    async function handleLogin() {
        var username = document.getElementById('login-username').value.trim();
        var password = document.getElementById('login-password').value;

        if (!username || !password) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showWarning('Completa todos los campos.');
            }
            return;
        }

        try {
            mostrarLoading('Iniciando sesión...');
            
            var user = await AuthModule.login(username, password);
            var role = user.rol_nombre || 'egresado';
            
            // 🔥 FORZAR ROLES PARA ADMIN
            if (user.username === 'admin' || user.id === 1) {
                console.log('👑 ADMIN - Forzando todos los roles');
                user.todos_los_roles = ['administrador', 'coordinador', 'directivo', 'tutor', 'egresado'];
                user.roles_adicionales = ['coordinador', 'directivo', 'tutor', 'egresado'];
                
                var session = JSON.parse(localStorage.getItem('sispe_session'));
                if (session) {
                    session.user.todos_los_roles = user.todos_los_roles;
                    session.user.roles_adicionales = user.roles_adicionales;
                    localStorage.setItem('sispe_session', JSON.stringify(session));
                    AuthModule.currentUser = session.user;
                }
                role = 'administrador';
                console.log('✅ Roles forzados:', user.todos_los_roles);
            }
            
            mostrarLoading('Cargando módulo de ' + role + '...');
            await cargarModulosPorRol(role);
            ocultarLoading();
            
            showDashboard(role);
            
        } catch (err) {
            ocultarLoading();
            console.error('Error en login:', err);
            if (window.NotificationsModule) {
                window.NotificationsModule.showError('Error al iniciar sesión.');
            }
        }
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
            'administrador': 'Administrador', 'coordinador': 'Coordinador',
            'directivo': 'Directivo', 'tutor': 'Tutor', 'egresado': 'Egresado'
        };
        var roleLabel = roleLabels[displayRole] || displayRole;

        appContainer.innerHTML = `
            <div id="app-layout">
                <header class="topbar">
                    <div class="topbar-left">
                        <div class="logo">
                            <i class="fas fa-graduation-cap"></i>
                            <span>SISPE</span>
                            <span class="logo-badge">v4.0</span>
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
                            <div class="user-avatar" id="topbar-avatar"><i class="fas fa-user-circle"></i></div>
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
                            <span>v4.0</span>
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
            sidebarMenu.innerHTML = '<div class="menu-label">Navegación</div>' +
                menuItems.map(function(item) {
                    var icono = getEmoji(item.id);
                    return '<div class="menu-item" data-page="' + item.id + '">' +
                        '<span class="icon">' + icono + '</span>' +
                        '<span>' + item.label + '</span>' +
                        '</div>';
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
            if (window.verNotificaciones) {
                window.verNotificaciones();
            }
        });

        // 🔥 CONSTRUIR SELECTOR INMEDIATAMENTE
        setTimeout(function() {
            var userNow = AuthModule.getCurrentUser();
            if (userNow) {
                console.log('🔧 Construyendo selector...');
                construirSelector(userNow);
            }
        }, 300);

        // 🔥 VIGILANTE CADA 2 SEGUNDOS
        setInterval(function() {
            var userNow = AuthModule.getCurrentUser();
            if (!userNow) return;
            
            var sel = document.getElementById('selector-rol-container');
            var esAdmin = userNow.username === 'admin' || userNow.id === 1;
            
            // Si es admin y no tiene selector, forzarlo
            if (esAdmin && !sel) {
                console.log('🔄 Reconstruyendo selector para admin...');
                construirSelector(userNow);
            }
            
            // Si no es admin y tiene selector, quitarlo
            if (!esAdmin && sel) {
                sel.remove();
            }
        }, 2000);

        setTimeout(function() {
            if (window.ChatModule && typeof window.ChatModule.iniciarMonitorNotificaciones === 'function') {
                window.ChatModule.iniciarMonitorNotificaciones();
            }
        }, 1000);
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
            { username: 'multi_rol', password: '123456', rol: '⭐ Multi-Rol', badge: 'badge-multi' }
        ];

        var selectorHTML = `
            <div id="quick-login-selector" class="login-quick-select">
                <label><i class="fas fa-rocket"></i> Acceso Rápido para Pruebas</label>
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
                    <span>Selecciona un usuario para llenar automáticamente las credenciales</span>
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
                            '👤 Usuario "' + username + '" (' + rol + ') seleccionado.',
                            'info', 2500
                        );
                    }
                }
            });
        }
    }

    // ============================================================
    // API PÚBLICA
    // ============================================================
    return {
        init: function() { initializeModules(); },
        navigate: function(pageId) {
            var user = AuthModule.getCurrentUser();
            if (user) {
                navigateTo(pageId, user.rol_nombre);
            }
        },
        showLogin: function() { showLogin(); },
        agregarSelectorRoles: function() {
            var user = AuthModule.getCurrentUser();
            if (user) {
                return construirSelector(user);
            }
            return null;
        },
        _iniciarVigilante: iniciarVigilanteSelector,
        _cargarModulo: cargarModulo,
        _cargarModulosPorRol: cargarModulosPorRol
    };

})();

// ============================================================
// INICIAR
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

window.App = App;
console.log('🚀 App cargada correctamente.');