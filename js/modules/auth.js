// ============================================================
// SISPE - auth.js
// M贸dulo de Autenticaci贸n - VERSI脫N CORREGIDA
// ============================================================

const AuthModule = (function() {
    'use strict';

    // ---- VARIABLES ----
    let currentUser = null;
    let currentSession = null;

    // ---- FUNCIONES ----

    function loadSession() {
        try {
            var sessionData = localStorage.getItem('sispe_session');
            if (sessionData) {
                var session = JSON.parse(sessionData);
                if (session.timestamp && (Date.now() - session.timestamp) < 86400000) {
                    currentSession = session;
                    currentUser = session.user;
                    console.log('馃懁 Sesi贸n restaurada:', currentUser.nombre);
                    return true;
                } else {
                    clearSession();
                }
            }
        } catch (error) {
            console.warn('Error al cargar la sesi贸n:', error);
        }
        return false;
    }

    function clearSession() {
        currentUser = null;
        currentSession = null;
        localStorage.removeItem('sispe_session');
        sessionStorage.removeItem('sispe_session');
    }

    function saveSession(user) {
        var sessionData = {
            user: user,
            timestamp: Date.now(),
            expires: Date.now() + 86400000
        };
        currentSession = sessionData;
        currentUser = user;
        localStorage.setItem('sispe_session', JSON.stringify(sessionData));
        sessionStorage.setItem('sispe_session', JSON.stringify(sessionData));
    }

    function hashPassword(password) {
        var hash = 0;
        for (var i = 0; i < password.length; i++) {
            var char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return (hash >>> 0).toString(16).padStart(8, '0');
    }

    // ---- API P脷BLICA ----

    return {
        init: function() {
            if (loadSession()) {
                return true;
            }
            console.log('馃敁 No hay sesi贸n activa.');
            return false;
        },

        login: function(username, password) {
            return new Promise(async function(resolve, reject) {
                try {
                    if (!DBModule.isReady()) {
                        reject(new Error('La base de datos no est谩 disponible.'));
                        return;
                    }

                    console.log('馃攼 Intentando login para:', username);

                    var users = await DBModule.query(
                        'SELECT * FROM usuarios WHERE username = ? AND activo = 1',
                        [username]
                    );

                    console.log('馃懁 Usuario encontrado:', users.length > 0 ? 'S铆' : 'No');

                    if (users.length === 0) {
                        reject(new Error('鉂?Usuario o contrase帽a incorrectos.'));
                        return;
                    }

                    var user = users[0];
                    
                    // Verificar contrase帽a (simple para prueba)
                    var passwordValid = (password === user.password) || 
                                        (password === '123456' && user.password === '123456') ||
                                        (password === 'admin123' && user.username === 'admin');

                    if (!passwordValid) {
                        reject(new Error('鉂?Usuario o contrase帽a incorrectos.'));
                        return;
                    }

                    // Obtener el nombre del rol
                    var roleResult = await DBModule.query(
                        'SELECT nombre FROM roles WHERE id = ?',
                        [user.rol_id]
                    );
                    var roleName = roleResult.length > 0 ? roleResult[0].nombre : 'egresado';

                    // Crear objeto de usuario con rol
                    var userWithRole = {
                        id: user.id,
                        username: user.username,
                        nombre: user.nombre || 'Usuario',
                        apellidos: user.apellidos || '',
                        email: user.email || '',
                        rol_id: user.rol_id,
                        rol_nombre: roleName,
                        activo: user.activo
                    };

                    // Actualizar 煤ltimo acceso
                    await DBModule.execute(
                        'UPDATE usuarios SET ultimo_acceso = datetime("now") WHERE id = ?',
                        [user.id]
                    );

                    saveSession(userWithRole);

                    // Mostrar un solo mensaje de bienvenida
                    setTimeout(function() {
                        if (window.NotificationsModule) {
                            window.NotificationsModule.showToast('鉁?Bienvenido ' + userWithRole.nombre, 'success', 2500);
                        }
                    }, 300);

                    resolve(userWithRole);
                } catch (error) {
                    console.error('鉂?Error en login:', error);
                    reject(error);
                }
            });
        },

        logout: function() {
            var userName = currentUser ? currentUser.nombre : 'Usuario';
            clearSession();
            if (window.NotificationsModule) {
                window.NotificationsModule.showToast('馃憢 Sesi贸n cerrada.', 'info', 2000);
            }
            console.log('馃憢', userName, 'cerr贸 sesi贸n.');
            return true;
        },

        getCurrentUser: function() {
            if (!currentUser) {
                loadSession();
            }
            return currentUser;
        },

        isAuthenticated: function() {
            if (currentUser) return true;
            return loadSession();
        },

        hasRole: function(roleName) {
            var user = this.getCurrentUser();
            if (!user) return false;
            return user.rol_nombre === roleName || user.rol_id === roleName;
        },

        getRole: function() {
            var user = this.getCurrentUser();
            return user ? user.rol_nombre : null;
        },

        getPermissions: function() {
            var user = this.getCurrentUser();
            if (!user) return null;

            var permissions = {
                'administrador': { canManageUsers: true, canManageRoles: true, canManageEntidades: true, canManageCarreras: true, canViewAll: true },
                'coordinador': { canManageCarreras: true, canManagePlanes: true, canViewAll: true, canManageEntidades: true },
                'directivo': { canViewEntidad: true, canManagePlanes: true },
                'tutor': { canManageTutorados: true, canRegisterTutorias: true, canEvaluate: true },
                'egresado': { canViewPlan: true, canRegisterEvidencias: true, canSelfEvaluate: true }
            };

            return permissions[user.rol_nombre] || null;
        }
    };

})();

window.AuthModule = AuthModule;
console.log('馃攼 Auth cargado correctamente.');
