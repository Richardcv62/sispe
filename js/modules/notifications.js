// ============================================================
// SISPE - notifications.js
// Módulo de Notificaciones - CON HTML ENTITIES
// RUTA: js/modules/notifications.js
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
            toastContainer.style.cssText = `
                position: fixed;
                top: 80px;
                right: 24px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 420px;
                width: 100%;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }
        return toastContainer;
    }

    function initEmailJS() {
        try {
            if (typeof emailjs !== 'undefined' && CONFIG.EMAILJS.PUBLIC_KEY) {
                emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);
                isEmailJSReady = true;
                console.log('✅ EmailJS inicializado correctamente.');
            } else if (typeof emailjs === 'undefined') {
                console.warn('⚠️ EmailJS no disponible.');
            } else {
                console.warn('⚠️ EmailJS no configurado.');
            }
        } catch (error) {
            console.warn('⚠️ Error al inicializar EmailJS:', error.message);
        }
    }

    // ============================================================
    // ICONOS CON HTML ENTITIES (MÁS SEGURO)
    // ============================================================
    function getIconHTML(type) {
        var icons = {
            'success': '&#9989;', // ✅
            'error': '&#10060;',  // ❌
            'warning': '&#9888;', // ⚠️
            'info': '&#8505;'     // ℹ️
        };
        return icons[type] || '&#8505;';
    }

    function getColor(type) {
        var colors = {
            'success': '#1a8a4a',
            'error': '#b33a4a',
            'warning': '#d48a2a',
            'info': '#2a6b9c'
        };
        return colors[type] || '#2a6b9c';
    }

    // ============================================================
    // TOAST (MENSAJES FLOTANTES) - CON HTML ENTITIES
    // ============================================================
    function showToast(message, type, duration) {
        type = type || 'info';
        duration = duration || 4000;
        
        var container = ensureToastContainer();
        
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        
        var iconHTML = getIconHTML(type);
        var color = getColor(type);
        
        toast.innerHTML = `
            <span class="toast-icon" style="font-size:24px;flex-shrink:0;line-height:1;">${iconHTML}</span>
            <span class="toast-message" style="flex:1;font-weight:500;color:#1e293b;font-size:14px;line-height:1.5;font-family:'Inter','Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:20px;padding:0 4px;flex-shrink:0;line-height:1;">&times;</button>
        `;
        
        toast.style.cssText = `
            background: white;
            padding: 14px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            border-left: 5px solid ${color};
            display: flex;
            align-items: center;
            gap: 14px;
            animation: slideInRight 0.4s ease;
            font-size: 14px;
            color: #1e293b;
            position: relative;
            max-width: 420px;
            width: 100%;
            pointer-events: auto;
            margin-bottom: 8px;
            font-family: 'Inter','Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;
        `;
        
        container.appendChild(toast);

        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(function() { 
                if (toast.parentElement) toast.remove(); 
            }, 300);
        }, duration);
    }

    // ============================================================
    // MÉTODOS DE NOTIFICACIÓN - SIN EMOJIS EN EL MENSAJE
    // ============================================================
    function showSuccess(message, duration) {
        showToast(message, 'success', duration || 4000);
    }

    function showError(message, duration) {
        showToast(message, 'error', duration || 5000);
    }

    function showWarning(message, duration) {
        showToast(message, 'warning', duration || 4000);
    }

    function showInfo(message, duration) {
        showToast(message, 'info', duration || 3000);
    }

    // ============================================================
    // MODALES (delegación a ModalModule)
    // ============================================================
    function showModalAlert(message, title, icon) {
        if (window.ModalModule) {
            return window.ModalModule.alert(message, title, icon);
        }
        alert('ℹ️ ' + message);
        return Promise.resolve();
    }

    function showModalSuccess(message, title) {
        if (window.ModalModule) {
            return window.ModalModule.success(message, title);
        }
        alert('✅ ' + message);
        return Promise.resolve();
    }

    function showModalError(message, title) {
        if (window.ModalModule) {
            return window.ModalModule.error(message, title);
        }
        alert('❌ ' + message);
        return Promise.resolve();
    }

    function showModalWarning(message, title) {
        if (window.ModalModule) {
            return window.ModalModule.warning(message, title);
        }
        alert('⚠️ ' + message);
        return Promise.resolve();
    }

    function showModalConfirm(message, title, confirmText, cancelText) {
        if (window.ModalModule) {
            return window.ModalModule.confirm(message, title, confirmText, cancelText);
        }
        return Promise.resolve(confirm(message));
    }

    function showModalConfirmDelete(message, title) {
        if (window.ModalModule) {
            return window.ModalModule.confirmDelete(message, title);
        }
        return Promise.resolve(confirm(message));
    }

    // ============================================================
    // SISTEMA DE NOTIFICACIONES EN BD
    // ============================================================
    function updateBadge() {
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
    }

    function createNotification(usuarioId, tipo, mensaje, url) {
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
    }

    function getNotifications(limit) {
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
    }

    function markAsRead(notificationId) {
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

    // ============================================================
    // EMAILJS
    // ============================================================
    function sendEmail(to, nombre, asunto, mensaje, url, replyTo) {
        return new Promise(function(resolve, reject) {
            try {
                if (!isEmailJSReady) {
                    console.log('📧 [SIMULACION] Correo a:', to);
                    console.log('📧 Asunto:', asunto);
                    console.log('📧 Mensaje:', mensaje);
                    if (replyTo) console.log('📧 Reply-To:', replyTo);
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

                if (replyTo) {
                    templateParams.reply_to = replyTo;
                }

                emailjs.send(
                    CONFIG.EMAILJS.SERVICE_ID,
                    CONFIG.EMAILJS.TEMPLATE_ID_SISPE,
                    templateParams
                ).then(function(response) {
                    console.log('✅ Correo enviado.');
                    resolve(response);
                }).catch(function(error) {
                    console.error('❌ Error al enviar correo:', error);
                    reject(error);
                });
            } catch (error) {
                console.error('❌ Error al enviar correo:', error);
                reject(error);
            }
        });
    }

    function testEmail(email) {
        return new Promise(async function(resolve, reject) {
            if (!email) {
                showWarning('Proporciona un correo para la prueba.');
                reject(new Error('Email no proporcionado'));
                return;
            }
            
            try {
                await sendEmail(
                    email,
                    'Usuario de Prueba',
                    'Prueba de configuracion SISPE',
                    'Este es un correo de prueba para verificar que la configuracion de EmailJS funciona correctamente.\n\nSi recibiste este mensaje, la configuracion es correcta.\n\nSaludos,\nEquipo SISPE',
                    window.location.origin,
                    '3sayricardo@gmail.com'
                );
                showSuccess('Correo de prueba enviado a ' + email);
                resolve(true);
            } catch (error) {
                showError('Error al enviar correo de prueba.');
                console.error(error);
                reject(error);
            }
        });
    }

    // ============================================================
    // API PÚBLICA
    // ============================================================
    return {
        init: function() {
            ensureToastContainer();
            initEmailJS();
            updateBadge();
            console.log('✅ Módulo de Notificaciones cargado.');
        },

        showToast: showToast,
        showSuccess: showSuccess,
        showError: showError,
        showWarning: showWarning,
        showInfo: showInfo,

        updateBadge: updateBadge,
        sendEmail: sendEmail,
        testEmail: testEmail,
        createNotification: createNotification,
        getNotifications: getNotifications,
        markAsRead: markAsRead,

        showModalAlert: showModalAlert,
        showModalSuccess: showModalSuccess,
        showModalError: showModalError,
        showModalWarning: showModalWarning,
        showModalConfirm: showModalConfirm,
        showModalConfirmDelete: showModalConfirmDelete
    };

})();

window.NotificationsModule = NotificationsModule;
console.log('📢 Módulo de Notificaciones cargado correctamente.');