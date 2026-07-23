// ============================================================
// SISPE - notifications.js
// Módulo de Notificaciones - CON reply_to
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
                console.log('Service ID:', CONFIG.EMAILJS.SERVICE_ID);
                console.log('Template ID:', CONFIG.EMAILJS.TEMPLATE_ID_SISPE);
            } else if (typeof emailjs === 'undefined') {
                console.warn('EmailJS no disponible.');
            } else {
                console.warn('EmailJS no configurado.');
            }
        } catch (error) {
            console.warn('Error al inicializar EmailJS:', error.message);
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

    // ---- API PUBLICA ----
    return {
        init: function() {
            ensureToastContainer();
            initEmailJS();
            this.updateBadge();
            console.log('Modulo de Notificaciones cargado.');
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

        /**
         * Envia un correo electronico usando EmailJS con soporte para reply_to
         */
        sendEmail: function(to, nombre, asunto, mensaje, url, replyTo) {
            return new Promise(function(resolve, reject) {
                try {
                    if (!isEmailJSReady) {
                        console.log('[SIMULACION] Correo a:', to);
                        console.log('Asunto:', asunto);
                        console.log('Mensaje:', mensaje);
                        if (replyTo) console.log('Reply-To:', replyTo);
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

                    // Si hay reply_to, agregarlo a los parametros
                    if (replyTo) {
                        templateParams.reply_to = replyTo;
                    }

                    emailjs.send(
                        CONFIG.EMAILJS.SERVICE_ID,
                        CONFIG.EMAILJS.TEMPLATE_ID_SISPE,
                        templateParams
                    ).then(function(response) {
                        console.log('Correo enviado. Reply-To:', replyTo || 'No especificado');
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
        },

        testEmail: async function(email) {
            if (!email) {
                this.showWarning('Proporciona un correo para la prueba.');
                return;
            }
            
            try {
                await this.sendEmail(
                    email,
                    'Usuario de Prueba',
                    'Prueba de configuracion SISPE',
                    'Este es un correo de prueba para verificar que la configuracion de EmailJS funciona correctamente.\n\nSi recibiste este mensaje, la configuracion es correcta.',
                    window.location.origin,
                    '3sayricardo@gmail.com'
                );
                this.showSuccess('Correo de prueba enviado a ' + email);
            } catch (error) {
                this.showError('Error al enviar correo de prueba.');
                console.error(error);
            }
        }
    };

})();

window.NotificationsModule = NotificationsModule;
console.log('Modulo de Notificaciones cargado.');
