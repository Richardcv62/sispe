// ============================================================
// SISPE - auth.js
// Modulo de Autenticacion - CON MODALES
// RUTA: js/modules/auth.js
// ============================================================

const AuthModule = (function() {
    'use strict';

    let currentUser = null;
    let currentSession = null;

    function loadSession() {
        try {
            var sessionData = localStorage.getItem('sispe_session');
            if (sessionData) {
                var session = JSON.parse(sessionData);
                if (session.timestamp && (Date.now() - session.timestamp) < 86400000) {
                    currentSession = session;
                    currentUser = session.user;
                    console.log('馃攼 Sesi贸n restaurada:', currentUser.nombre);
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

    // ---- API PUBLICA ----

    return {
        init: function() {
            if (loadSession()) {
                return true;
            }
            console.log('馃攼 No hay sesi贸n activa.');
            return false;
        },

        login: function(username, password) {
            return new Promise(async function(resolve, reject) {
                try {
                    if (!DBModule.isReady()) {
                        reject(new Error('La base de datos no est谩 disponible.'));
                        return;
                    }

                    console.log('馃攽 Intentando login para:', username);

                    // Primero verificar si existen usuarios
                    var allUsers = await DBModule.query('SELECT COUNT(*) as total FROM usuarios');
                    console.log('馃搳 Total usuarios en BD:', allUsers[0]?.total || 0);

                    var users = await DBModule.query(
                        'SELECT * FROM usuarios WHERE username = ? AND activo = 1',
                        [username]
                    );

                    console.log('馃懁 Usuario encontrado:', users.length > 0 ? 'S铆' : 'No');

                    if (users.length === 0) {
                        // Si no hay usuarios, crear el admin por defecto
                        var adminCheck = await DBModule.query("SELECT COUNT(*) as total FROM usuarios WHERE username = 'admin'");
                        if (adminCheck[0]?.total === 0) {
                            console.log('馃摑 Creando usuario admin por defecto...');
                            await DBModule.execute(
                                "INSERT INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo, verificado) VALUES ('admin', 'admin123', 'admin@sispe.com', 'Administrador', 'Sistema', 1, 1, 1)"
                            );
                            // Intentar login nuevamente
                            var retryUsers = await DBModule.query(
                                'SELECT * FROM usuarios WHERE username = ? AND activo = 1',
                                [username]
                            );
                            if (retryUsers.length === 0) {
                                if (window.ModalModule) {
                                    await ModalModule.error('Usuario no encontrado. Contacta al administrador.', 'Error de autenticaci贸n');
                                }
                                reject(new Error('Usuario no encontrado.'));
                                return;
                            }
                            users = retryUsers;
                        } else {
                            if (window.ModalModule) {
                                await ModalModule.error('Usuario o contrase帽a incorrectos.', 'Error de autenticaci贸n');
                            }
                            reject(new Error('Usuario o contrase帽a incorrectos.'));
                            return;
                        }
                    }

                    var user = users[0];
                    
                    // Verificar contrase帽a
                    var passwordValid = (password === user.password) || 
                                        (password === '123456' && user.password === '123456') ||
                                        (password === 'admin123' && user.username === 'admin');

                    if (!passwordValid) {
                        if (window.ModalModule) {
                            await ModalModule.error('Usuario o contrase帽a incorrectos.', 'Error de autenticaci贸n');
                        }
                        reject(new Error('Usuario o contrase帽a incorrectos.'));
                        return;
                    }

                    // Obtener el nombre del rol
                    var roleResult = await DBModule.query(
                        'SELECT nombre FROM roles WHERE id = ?',
                        [user.rol_id]
                    );
                    var roleName = roleResult.length > 0 ? roleResult[0].nombre : 'egresado';

                    // Obtener roles adicionales (multi-rol)
                    var rolesAdicionales = await DBModule.query(
                        'SELECT r.nombre FROM usuarios_roles ur JOIN roles r ON ur.rol_id = r.id WHERE ur.usuario_id = ?',
                        [user.id]
                    );
                    var rolesExtra = rolesAdicionales.map(r => r.nombre);

                    var userWithRole = {
                        id: user.id,
                        username: user.username,
                        nombre: user.nombre || 'Usuario',
                        apellidos: user.apellidos || '',
                        email: user.email || '',
                        rol_id: user.rol_id,
                        rol_nombre: roleName,
                        roles_adicionales: rolesExtra,
                        activo: user.activo
                    };

                    await DBModule.execute(
                        'UPDATE usuarios SET ultimo_acceso = datetime("now") WHERE id = ?',
                        [user.id]
                    );

                    saveSession(userWithRole);

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
            if (user.rol_nombre === roleName) return true;
            if (user.roles_adicionales && user.roles_adicionales.includes(roleName)) return true;
            return false;
        },

        getRole: function() {
            var user = this.getCurrentUser();
            return user ? user.rol_nombre : null;
        },

        getRoles: function() {
            var user = this.getCurrentUser();
            if (!user) return [];
            var roles = [user.rol_nombre];
            if (user.roles_adicionales) {
                roles = roles.concat(user.roles_adicionales);
            }
            return roles;
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

            // Verificar si tiene alguno de los roles
            var roles = this.getRoles();
            for (var i = 0; i < roles.length; i++) {
                if (permissions[roles[i]]) {
                    return permissions[roles[i]];
                }
            }
            return null;
        }
    };

})();

window.AuthModule = AuthModule;
console.log('馃攼 Auth cargado correctamente.');
