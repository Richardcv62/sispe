// ============================================================
// SISPE - notifications.js
// Módulo de Notificaciones - SIN EMOJIS
// ============================================================

const NotificationsModule = (function() {
    'use strict';

    var toastContainer = null;
    var isEmailJSReady = false;

    function ensureToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        return toastContainer;
    }

    function initEmailJS() {
        try {
            if (typeof emailjs !== 'undefined' && CONFIG.EMAILJS.PUBLIC_KEY) {
                emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);
                isEmailJSReady = true;
                console.log('EmailJS inicializado correctamente.');
            }
        } catch (error) {
            console.warn('EmailJS no disponible:', error.message);
        }
    }

    function getIcon(type) {
        var icons = {
            success: '✓',
            error: '✗',
            warning: '!',
            info: 'i'
        };
        return icons[type] || 'i';
    }

    function showToast(message, type, duration) {
        type = type || 'info';
        duration = duration || 4000;
        
        var container = ensureToastContainer();
        
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        
        var icon = getIcon(type);
        var iconMap = {
            'success': '#1a8a4a',
            'error': '#b33a4a',
            'warning': '#d48a2a',
            'info': '#2a6b9c'
        };
        var color = iconMap[type] || '#2a6b9c';
        
        toast.innerHTML = `
            <span class="toast-icon" style="font-weight:bold;color:${color};font-size:18px;">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">×</button>
        `;
        
        container.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('toast-exit');
            setTimeout(function() { toast.remove(); }, 300);
        }, duration);
    }

    // ---- API PÚBLICA ----
    return {
        init: function() {
            ensureToastContainer();
            initEmailJS();
            this.updateBadge();
            console.log('Módulo de Notificaciones cargado.');
        },

        showToast: showToast,

        showSuccess: function(message, duration) {
            showToast(message, 'success', duration);
        },

        showError: function(message, duration) {
            showToast(message, 'error', duration);
        },

        showWarning: function(message, duration) {
            showToast(message, 'warning', duration);
        },

        showInfo: function(message, duration) {
            showToast(message, 'info', duration);
        },

        updateBadge: function() {
            var badge = document.querySelector('.badge-notification');
            if (!badge) return;

            if (DBModule.isReady()) {
                var user = AuthModule.getCurrentUser();
                if (user) {
                    DBModule.query(
                        'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leida = 0',
                        [user.id]
                    ).then(function(result) {
                        var count = result[0]?.total || 0;
                        badge.textContent = count > 9 ? '9+' : count;
                        badge.style.display = count > 0 ? 'inline' : 'none';
                    }).catch(function() {
                        badge.style.display = 'none';
                    });
                }
            }
        },

        sendEmail: function(to, nombre, asunto, mensaje, url) {
            return new Promise(function(resolve, reject) {
                try {
                    if (!isEmailJSReady) {
                        console.log('[SIMULACION] Correo a:', to);
                        console.log('Asunto:', asunto);
                        console.log('Mensaje:', mensaje);
                        resolve({ success: true, simulated: true });
                        return;
                    }

                    var templateParams = {
                        to_email: to,
                        nombre: nombre || 'Usuario',
                        asunto: asunto,
                        mensaje: mensaje,
                        url: url || '',
                        fecha: new Date().toLocaleString('es-CU'),
                        rol: 'Usuario SISPE'
                    };

                    emailjs.send(
                        CONFIG.EMAILJS.SERVICE_ID,
                        CONFIG.EMAILJS.TEMPLATE_ID_SISPE,
                        templateParams
                    ).then(function(response) {
                        resolve(response);
                    }).catch(function(error) {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        createNotification: function(usuarioId, tipo, mensaje, url) {
            return new Promise(function(resolve, reject) {
                try {
                    if (!DBModule.isReady()) {
                        reject(new Error('Base de datos no disponible.'));
                        return;
                    }

                    DBModule.execute(
                        'INSERT INTO notificaciones (usuario_id, tipo, mensaje, url, fecha_envio) VALUES (?, ?, ?, ?, datetime("now"))',
                        [usuarioId, tipo, mensaje, url]
                    ).then(function(result) {
                        resolve(result);
                    }).catch(function(error) {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        getNotifications: function(limit) {
            limit = limit || 20;
            return new Promise(function(resolve, reject) {
                try {
                    var user = AuthModule.getCurrentUser();
                    if (!user) {
                        reject(new Error('Usuario no autenticado.'));
                        return;
                    }

                    DBModule.query(
                        'SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_envio DESC LIMIT ?',
                        [user.id, limit]
                    ).then(function(result) {
                        resolve(result);
                    }).catch(function(error) {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        markAsRead: function(notificationId) {
            return new Promise(function(resolve, reject) {
                try {
                    if (!DBModule.isReady()) {
                        reject(new Error('Base de datos no disponible.'));
                        return;
                    }

                    DBModule.execute(
                        'UPDATE notificaciones SET leida = 1, fecha_leida = datetime("now") WHERE id = ?',
                        [notificationId]
                    ).then(function() {
                        resolve(true);
                    }).catch(function(error) {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        }
    };

})();

window.NotificationsModule = NotificationsModule;
console.log('Módulo de Notificaciones cargado.');
