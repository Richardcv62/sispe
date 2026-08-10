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
            if (typeof emailjs !== 'undefined' && window.CONFIG && window.CONFIG.EMAILJS && window.CONFIG.EMAILJS.PUBLIC_KEY) {
                emailjs.init(window.CONFIG.EMAILJS.PUBLIC_KEY);
                isEmailJSReady = true;
                console.log('EmailJS inicializado correctamente.');
            } else if (typeof emailjs === 'undefined') {
                console.warn('EmailJS no disponible.');
            } else {
                console.warn('EmailJS no configurado.');
            }
        } catch (error) {
            console.warn('Error al inicializar EmailJS:', error.message);
        }
    }

    // ============================================================
    // ICONOS CON HTML ENTITIES (REGLAS DE ORO)
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
    // FALLBACK DE EMERGENCIA
    // ============================================================
    function showFallbackModal(message, title, icon) {
        return new Promise(function(resolve) {
            var existing = document.getElementById('fallback-modal-container');
            if (existing) existing.remove();
            
            var container = document.createElement('div');
            container.id = 'fallback-modal-container';
            container.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(10, 30, 60, 0.6); backdrop-filter: blur(8px);
                display: flex; align-items: center; justify-content: center;
                z-index: 99999; padding: 20px;
                animation: modalFadeIn 0.3s ease;
            `;
            
            var safeMessage = String(message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var safeTitle = String(title || 'Aviso').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var safeIcon = String(icon || '&#8505;');
            
            container.innerHTML = `
                <div style="background:white;border-radius:16px;padding:30px;max-width:420px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:modalSlideIn 0.3s ease;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <span style="font-size:28px;flex-shrink:0;">${safeIcon}</span>
                        <h3 style="margin:0;color:#0a1e3c;font-size:18px;font-family:'Inter',sans-serif;">${safeTitle}</h3>
                    </div>
                    <p style="color:#475569;margin-bottom:20px;white-space:pre-wrap;font-size:15px;line-height:1.6;font-family:'Inter',sans-serif;">${safeMessage}</p>
                    <button id="fallback-modal-btn" 
                            style="padding:10px 24px;background:#0a1e3c;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;width:100%;font-family:'Inter',sans-serif;">
                        Aceptar
                    </button>
                </div>
            `;
            
            if (!document.getElementById('fallback-modal-styles')) {
                var style = document.createElement('style');
                style.id = 'fallback-modal-styles';
                style.textContent = `
                    @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes modalSlideIn { from { opacity: 0; transform: translateY(-30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(container);
            
            document.getElementById('fallback-modal-btn').addEventListener('click', function() {
                container.remove();
                resolve(true);
            });
            
            container.addEventListener('click', function(e) {
                if (e.target === container) {
                    container.remove();
                    resolve(false);
                }
            });
            
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    var el = document.getElementById('fallback-modal-container');
                    if (el) {
                        el.remove();
                        resolve(false);
                    }
                    document.removeEventListener('keydown', escHandler);
                }
            });
        });
    }

    function showFallbackConfirm(message, title) {
        return new Promise(function(resolve) {
            var existing = document.getElementById('fallback-confirm-container');
            if (existing) existing.remove();
            
            var container = document.createElement('div');
            container.id = 'fallback-confirm-container';
            container.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(10, 30, 60, 0.6); backdrop-filter: blur(8px);
                display: flex; align-items: center; justify-content: center;
                z-index: 99999; padding: 20px;
                animation: modalFadeIn 0.3s ease;
            `;
            
            var safeMessage = String(message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var safeTitle = String(title || 'Confirmar').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            container.innerHTML = `
                <div style="background:white;border-radius:16px;padding:30px;max-width:420px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:modalSlideIn 0.3s ease;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <span style="font-size:28px;flex-shrink:0;">&#10067;</span>
                        <h3 style="margin:0;color:#0a1e3c;font-size:18px;font-family:'Inter',sans-serif;">${safeTitle}</h3>
                    </div>
                    <p style="color:#475569;margin-bottom:20px;white-space:pre-wrap;font-size:15px;line-height:1.6;font-family:'Inter',sans-serif;">${safeMessage}</p>
                    <div style="display:flex;gap:12px;">
                        <button id="fallback-confirm-btn" 
                                style="flex:1;padding:10px 24px;background:#0a1e3c;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">
                            Confirmar
                        </button>
                        <button id="fallback-cancel-btn" 
                                style="flex:1;padding:10px 24px;background:transparent;border:2px solid #e2e8f0;color:#475569;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">
                            Cancelar
                        </button>
                    </div>
                </div>
            `;
            
            if (!document.getElementById('fallback-modal-styles')) {
                var style = document.createElement('style');
                style.id = 'fallback-modal-styles';
                style.textContent = `
                    @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes modalSlideIn { from { opacity: 0; transform: translateY(-30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(container);
            
            document.getElementById('fallback-confirm-btn').addEventListener('click', function() {
                container.remove();
                resolve(true);
            });
            
            document.getElementById('fallback-cancel-btn').addEventListener('click', function() {
                container.remove();
                resolve(false);
            });
            
            container.addEventListener('click', function(e) {
                if (e.target === container) {
                    container.remove();
                    resolve(false);
                }
            });
            
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    var el = document.getElementById('fallback-confirm-container');
                    if (el) {
                        el.remove();
                        resolve(false);
                    }
                    document.removeEventListener('keydown', escHandler);
                }
            });
        });
    }

    // ============================================================
    // TOAST - CON HTML ENTITIES
    // ============================================================
    function showToast(message, type, duration) {
        type = type || 'info';
        duration = duration || 4000;
        
        var container = ensureToastContainer();
        
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        
        var iconHTML = getIconHTML(type);
        var color = getColor(type);
        var safeMessage = String(message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        toast.innerHTML = `
            <span class="toast-icon" style="font-size:24px;flex-shrink:0;line-height:1;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;">${iconHTML}</span>
            <span class="toast-message" style="flex:1;font-weight:500;color:#1e293b;font-size:14px;line-height:1.5;font-family:'Inter','Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;">${safeMessage}</span>
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
    // MÉTODOS DE NOTIFICACIÓN
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
    // MODALES (SIN ALERT/CONFIRM)
    // ============================================================
    function showModalAlert(message, title, icon) {
        if (window.ModalModule && window.ModalModule.alert) {
            return window.ModalModule.alert(message, title || 'Aviso', icon);
        }
        return showFallbackModal(message, title || 'Aviso', icon || '&#8505;');
    }

    function showModalSuccess(message, title) {
        if (window.ModalModule && window.ModalModule.success) {
            return window.ModalModule.success(message, title || '&Eacute;xito');
        }
        return showFallbackModal(message, title || '&Eacute;xito', '&#9989;');
    }

    function showModalError(message, title) {
        if (window.ModalModule && window.ModalModule.error) {
            return window.ModalModule.error(message, title || 'Error');
        }
        return showFallbackModal(message, title || 'Error', '&#10060;');
    }

    function showModalWarning(message, title) {
        if (window.ModalModule && window.ModalModule.warning) {
            return window.ModalModule.warning(message, title || 'Advertencia');
        }
        return showFallbackModal(message, title || 'Advertencia', '&#9888;');
    }

    function showModalConfirm(message, title, confirmText, cancelText) {
        if (window.ModalModule && window.ModalModule.confirm) {
            return window.ModalModule.confirm(message, title || 'Confirmar', confirmText, cancelText);
        }
        return showFallbackConfirm(message, title || 'Confirmar');
    }

    function showModalConfirmDelete(message, title) {
        if (window.ModalModule && window.ModalModule.confirmDelete) {
            return window.ModalModule.confirmDelete(message, title || 'Eliminar');
        }
        return showFallbackConfirm(message || '&iquest;Est&aacute;s seguro de que quieres eliminar este elemento? Esta acci&oacute;n no se puede deshacer.', title || 'Eliminar');
    }

    // ============================================================
    // SISTEMA DE NOTIFICACIONES EN BD
    // ============================================================
    function updateBadge() {
        var badge = document.querySelector('.badge-notification');
        if (!badge) return;

        if (window.DBModule && window.DBModule.isReady && window.DBModule.isReady()) {
            var user = window.AuthModule && window.AuthModule.getCurrentUser ? window.AuthModule.getCurrentUser() : null;
            if (user) {
                window.DBModule.query(
                    'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leida = 0',
                    [user.id]
                ).then(function(result) {
                    var total = result[0]?.total || 0;
                    
                    // También contar mensajes de chat no leídos
                    window.DBModule.query(
                        'SELECT COUNT(*) as total FROM mensajes WHERE destinatario_id = ? AND leido = 0',
                        [user.id]
                    ).then(function(chatResult) {
                        var chatTotal = chatResult[0]?.total || 0;
                        var totalGeneral = total + chatTotal;
                        
                        if (totalGeneral > 0) {
                            badge.textContent = totalGeneral > 9 ? '9+' : totalGeneral;
                            badge.style.display = 'inline';
                        } else {
                            badge.textContent = '0';
                            badge.style.display = 'none';
                        }
                    }).catch(function() {
                        if (total > 0) {
                            badge.textContent = total > 9 ? '9+' : total;
                            badge.style.display = 'inline';
                        } else {
                            badge.textContent = '0';
                            badge.style.display = 'none';
                        }
                    });
                }).catch(function() {
                    badge.style.display = 'none';
                });
            }
        }
    }

    function createNotification(usuarioId, tipo, mensaje, url) {
        return new Promise(function(resolve, reject) {
            try {
                if (!window.DBModule || !window.DBModule.isReady || !window.DBModule.isReady()) {
                    reject(new Error('Base de datos no disponible.'));
                    return;
                }

                window.DBModule.execute(
                    'INSERT INTO notificaciones (usuario_id, tipo, mensaje, url, fecha_envio) VALUES (?, ?, ?, ?, datetime("now"))',
                    [usuarioId, tipo, mensaje, url]
                ).then(function(result) {
                    updateBadge();
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
                var user = window.AuthModule && window.AuthModule.getCurrentUser ? window.AuthModule.getCurrentUser() : null;
                if (!user) {
                    reject(new Error('Usuario no autenticado.'));
                    return;
                }

                if (!window.DBModule || !window.DBModule.isReady || !window.DBModule.isReady()) {
                    reject(new Error('Base de datos no disponible.'));
                    return;
                }

                window.DBModule.query(
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
                if (!window.DBModule || !window.DBModule.isReady || !window.DBModule.isReady()) {
                    reject(new Error('Base de datos no disponible.'));
                    return;
                }

                window.DBModule.execute(
                    'UPDATE notificaciones SET leida = 1, fecha_leida = datetime("now") WHERE id = ?',
                    [notificationId]
                ).then(function() {
                    updateBadge();
                    resolve(true);
                }).catch(function(error) {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    function marcarTodasComoLeidas() {
        return new Promise(function(resolve, reject) {
            try {
                var user = window.AuthModule && window.AuthModule.getCurrentUser ? window.AuthModule.getCurrentUser() : null;
                if (!user) {
                    reject(new Error('Usuario no autenticado.'));
                    return;
                }

                if (!window.DBModule || !window.DBModule.isReady || !window.DBModule.isReady()) {
                    reject(new Error('Base de datos no disponible.'));
                    return;
                }

                window.DBModule.execute(
                    'UPDATE notificaciones SET leida = 1, fecha_leida = datetime("now") WHERE usuario_id = ? AND leida = 0',
                    [user.id]
                ).then(function() {
                    // También marcar mensajes de chat como leídos
                    window.DBModule.execute(
                        'UPDATE mensajes SET leido = 1, fecha_leido = datetime("now") WHERE destinatario_id = ? AND leido = 0',
                        [user.id]
                    ).then(function() {
                        updateBadge();
                        resolve(true);
                    }).catch(function() {
                        updateBadge();
                        resolve(true);
                    });
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
                    console.log('&#128231; [SIMULACION] Correo a:', to);
                    console.log('&#128231; Asunto:', asunto);
                    console.log('&#128231; Mensaje:', mensaje);
                    if (replyTo) console.log('&#128231; Reply-To:', replyTo);
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
                    window.CONFIG.EMAILJS.SERVICE_ID,
                    window.CONFIG.EMAILJS.TEMPLATE_ID_SISPE,
                    templateParams
                ).then(function(response) {
                    console.log('&#9989; Correo enviado.');
                    resolve(response);
                }).catch(function(error) {
                    console.error('&#10060; Error al enviar correo:', error);
                    reject(error);
                });
            } catch (error) {
                console.error('&#10060; Error al enviar correo:', error);
                reject(error);
            }
        });
    }

    function testEmail(email) {
        return new Promise(async function(resolve, reject) {
            if (!email) {
                await showModalWarning('Proporciona un correo para la prueba.');
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
                await showModalSuccess('Correo de prueba enviado a ' + email);
                resolve(true);
            } catch (error) {
                await showModalError('Error al enviar correo de prueba.');
                console.error(error);
                reject(error);
            }
        });
    }

    return {
        init: function() {
            ensureToastContainer();
            initEmailJS();
            setTimeout(function() {
                updateBadge();
            }, 1000);
            console.log('&#128226; M&oacute;dulo de Notificaciones cargado.');
        },

        showToast: showToast,
        showSuccess: showSuccess,
        showError: showError,
        showWarning: showWarning,
        showInfo: showInfo,

        updateBadge: updateBadge,
        marcarTodasComoLeidas: marcarTodasComoLeidas,
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
console.log('&#128226; M&oacute;dulo de Notificaciones cargado correctamente.');