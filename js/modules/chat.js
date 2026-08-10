// ============================================================
// SISPE - chat.js
// Modulo de Mensajeria Interna (Chat) - CON TECLA ENTER
// RUTA: js/modules/chat.js
// ============================================================

const ChatModule = (function() {
    'use strict';

    // ============================================================
    // VARIABLES GLOBALES
    // ============================================================
    var conversacionAbierta = null;
    var intervaloNotificaciones = null;

    // ============================================================
    // NAVEGACION
    // ============================================================
    function navigate(page, breadcrumb) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = renderChat();

        if (breadcrumb) {
            container.innerHTML = breadcrumb + content;
        } else {
            container.innerHTML = content;
        }
        setTimeout(loadData, 200);
        setTimeout(assignEvents, 100);
    }

    // ============================================================
    // INICIAR/DETENER MONITOREO DE NOTIFICACIONES
    // ============================================================
    function iniciarMonitorNotificaciones() {
        if (intervaloNotificaciones) {
            clearInterval(intervaloNotificaciones);
            intervaloNotificaciones = null;
        }

        setTimeout(function() {
            cargarMensajesNoLeidos();
        }, 500);

        intervaloNotificaciones = setInterval(function() {
            cargarMensajesNoLeidos();
        }, 10000);

        console.log('📢 Monitor de notificaciones de chat activado (cada 10s)');
    }

    function detenerMonitorNotificaciones() {
        if (intervaloNotificaciones) {
            clearInterval(intervaloNotificaciones);
            intervaloNotificaciones = null;
            console.log('📢 Monitor de notificaciones de chat detenido');
        }
    }

    // ============================================================
    // RENDER: CHAT PRINCIPAL
    // ============================================================
    function renderChat() {
        var user = AuthModule.getCurrentUser();
        if (!user) return '<p class="text-muted">No has iniciado sesión.</p>';

        return `
            <div class="page-header">
                <h2><i class="fas fa-envelope"></i> Mensajes</h2>
                <div class="breadcrumb">
                    <span class="chat-badge" style="display:none;background:#b33a4a;color:white;padding:2px 10px;border-radius:20px;font-size:12px;margin-right:8px;">0</span>
                    ${user.nombre}
                </div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="ChatModule.nuevoMensaje()">
                    <i class="fas fa-pen"></i> Nuevo mensaje
                </button>
                <button class="btn btn-outline" onclick="ChatModule.actualizar()">
                    <i class="fas fa-sync-alt"></i> Actualizar
                </button>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-comments"></i> Conversaciones</div>
                <div id="lista-conversaciones">
                    <p class="text-muted">Cargando conversaciones...</p>
                </div>
            </div>

            <div id="chat-conversacion-container" style="display:none;"></div>
        `;
    }

    // ============================================================
    // CERRAR CONVERSACION
    // ============================================================
    function cerrarConversacion() {
        var container = document.getElementById('chat-conversacion-container');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
            conversacionAbierta = null;
        }
        setTimeout(function() {
            cargarMensajesNoLeidos();
        }, 200);
    }

    // ============================================================
    // CARGAR MENSAJES NO LEIDOS
    // ============================================================
    async function cargarMensajesNoLeidos() {
        var user = AuthModule.getCurrentUser();
        if (!user) return 0;

        try {
            var result = await DBModule.query(
                'SELECT COUNT(*) as total FROM mensajes WHERE destinatario_id = ? AND leido = 0',
                [user.id]
            );

            var total = result[0]?.total || 0;

            var badge = document.querySelector('.chat-badge');
            if (badge) {
                badge.textContent = total > 9 ? '9+' : total;
                badge.style.display = total > 0 ? 'inline' : 'none';
            }

            if (window.NotificationsModule && typeof window.NotificationsModule.updateBadge === 'function') {
                setTimeout(function() {
                    window.NotificationsModule.updateBadge();
                }, 150);
            }

            if (total > 0) {
                document.title = '(' + total + ' 💬) SISPE - Mensajes';
            }

            return total;
        } catch (error) {
            console.warn('Error al cargar mensajes no leídos:', error);
            return 0;
        }
    }

    // ============================================================
    // CARGAR CONVERSACIONES
    // ============================================================
    async function cargarConversaciones() {
        var container = document.getElementById('lista-conversaciones');
        if (!container) return;

        var user = AuthModule.getCurrentUser();
        if (!user) {
            container.innerHTML = '<p class="text-muted">No has iniciado sesión.</p>';
            return;
        }

        var conversaciones = await DBModule.query(
            `SELECT c.*, 
                    u1.nombre as usuario1_nombre, 
                    u2.nombre as usuario2_nombre,
                    m.mensaje as ultimo_mensaje_texto,
                    m.fecha_envio as ultimo_mensaje_fecha,
                    (SELECT COUNT(*) FROM mensajes WHERE destinatario_id = ? AND remitente_id = CASE 
                        WHEN c.usuario1_id = ? THEN c.usuario2_id 
                        ELSE c.usuario1_id 
                    END AND leido = 0) as no_leidos
             FROM conversaciones c
             JOIN usuarios u1 ON c.usuario1_id = u1.id
             JOIN usuarios u2 ON c.usuario2_id = u2.id
             LEFT JOIN mensajes m ON c.ultimo_mensaje_id = m.id
             WHERE c.usuario1_id = ? OR c.usuario2_id = ?
             ORDER BY c.fecha_ultimo DESC`,
            [user.id, user.id, user.id, user.id]
        );

        if (conversaciones.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px 20px;color:#94a3b8;">
                    <div style="font-size:48px;margin-bottom:16px;">💬</div>
                    <h3>No tienes conversaciones</h3>
                    <p style="font-size:14px;">Envía un mensaje a otro usuario para iniciar una conversación.</p>
                    <button class="btn btn-primary" onclick="ChatModule.nuevoMensaje()" style="margin-top:12px;">
                        <i class="fas fa-pen"></i> Nuevo mensaje
                    </button>
                </div>
            `;
            return;
        }

        var html = '';
        conversaciones.forEach(function(c) {
            var otroUsuario = c.usuario1_id === user.id ? c.usuario2_nombre : c.usuario1_nombre;
            var otroId = c.usuario1_id === user.id ? c.usuario2_id : c.usuario1_id;
            var noLeidos = c.no_leidos || 0;
            var fecha = c.ultimo_mensaje_fecha ? new Date(c.ultimo_mensaje_fecha).toLocaleDateString('es-CU') : 'Sin mensajes';
            var mensajePreview = c.ultimo_mensaje_texto ? c.ultimo_mensaje_texto.substring(0, 50) + (c.ultimo_mensaje_texto.length > 50 ? '...' : '') : 'Sin mensajes';
            
            html += `
                <div class="conversacion-item" onclick="ChatModule.verConversacion(${otroId})" 
                     style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #e2e8f0;cursor:pointer;transition:all 0.2s;border-radius:8px;"
                     onmouseover="this.style.background='#f8fafc';"
                     onmouseout="this.style.background='transparent';">
                    <div style="font-size:32px;flex-shrink:0;">👤</div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <strong style="color:#0a1e3c;font-size:15px;">${otroUsuario}</strong>
                            <span style="font-size:11px;color:#94a3b8;">${fecha}</span>
                        </div>
                        <div style="font-size:13px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${mensajePreview}
                        </div>
                    </div>
                    ${noLeidos > 0 ? `<span class="badge badge-danger" style="font-size:12px;padding:2px 10px;border-radius:20px;">${noLeidos}</span>` : ''}
                </div>
            `;
        });

        container.innerHTML = html;
        console.log('📩 Conversaciones cargadas:', conversaciones.length);
    }

    // ============================================================
    // 🔥 VER CONVERSACION - CON TECLA ENTER (PERMANECE ABIERTA)
    // ============================================================
    async function verConversacion(otroUsuarioId) {
        console.log('📩 verConversacion llamado con ID:', otroUsuarioId);
        
        // Cerrar cualquier conversacion abierta primero
        cerrarConversacion();

        var container = document.getElementById('chat-conversacion-container');
        if (!container) {
            console.error('❌ chat-conversacion-container no encontrado');
            return;
        }

        var user = AuthModule.getCurrentUser();
        if (!user) {
            await ModalModule.warning('No has iniciado sesión.');
            return;
        }

        // Validar ID
        if (!otroUsuarioId || otroUsuarioId === 'undefined' || otroUsuarioId === 'null') {
            await ModalModule.warning('No se pudo abrir la conversación.');
            return;
        }

        otroUsuarioId = parseInt(otroUsuarioId);
        if (isNaN(otroUsuarioId)) {
            await ModalModule.warning('No se pudo abrir la conversación.');
            return;
        }

        var otroUsuario = await DBModule.query(
            'SELECT id, nombre, username, email FROM usuarios WHERE id = ?',
            [otroUsuarioId]
        );

        if (otroUsuario.length === 0) {
            await ModalModule.warning('Usuario no encontrado.');
            return;
        }

        var otro = otroUsuario[0];

        var mensajes = await DBModule.query(
            `SELECT * FROM mensajes 
             WHERE (remitente_id = ? AND destinatario_id = ?) 
                OR (remitente_id = ? AND destinatario_id = ?)
             ORDER BY fecha_envio ASC`,
            [user.id, otroUsuarioId, otroUsuarioId, user.id]
        );

        // Marcar mensajes como leidos
        await DBModule.execute(
            'UPDATE mensajes SET leido = 1, fecha_leido = datetime("now") WHERE destinatario_id = ? AND remitente_id = ?',
            [user.id, otroUsuarioId]
        );

        // Marcar notificaciones del sistema relacionadas como leidas
        await DBModule.execute(
            `UPDATE notificaciones 
             SET leida = 1, fecha_leida = datetime("now") 
             WHERE usuario_id = ? AND url LIKE '%chat%' AND leida = 0`,
            [user.id]
        );

        // Actualizar badges
        setTimeout(function() {
            cargarMensajesNoLeidos();
            if (window.NotificationsModule && typeof window.NotificationsModule.updateBadge === 'function') {
                window.NotificationsModule.updateBadge();
            }
        }, 300);

        // Guardar conversacion abierta
        conversacionAbierta = otroUsuarioId;

        // Construir la ventana
        container.style.display = 'block';
        container.innerHTML = `
            <div class="card" style="border:2px solid #2a6b9c;margin-top:16px;z-index:100000;position:relative;">
                <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <i class="fas fa-user-circle"></i> 
                        ${otro.nombre} (${otro.username})
                        <span style="font-size:12px;color:#94a3b8;font-weight:400;margin-left:8px;">${otro.email}</span>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="ChatModule.cerrarConversacion()" style="background:#b33a4a;color:white;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                </div>

                <div style="max-height:400px;overflow-y:auto;padding:8px 0;" id="chat-mensajes-container">
                    ${mensajes.length === 0 ? '<p class="text-muted" style="text-align:center;padding:20px;">No hay mensajes. Envía el primero.</p>' : ''}
                    ${mensajes.map(function(m) {
                        var esMio = m.remitente_id === user.id;
                        var estilo = esMio ? 
                            'text-align:right;background:#0a1e3c;color:white;border-radius:12px 12px 4px 12px;padding:10px 14px;margin:4px 0 4px 40px;' :
                            'text-align:left;background:#f1f4f8;color:#1e293b;border-radius:12px 12px 12px 4px;padding:10px 14px;margin:4px 40px 4px 0;';
                        var fecha = new Date(m.fecha_envio).toLocaleString('es-CU');
                        var leidoIcon = m.leido ? '✅' : '⏳';
                        
                        return `
                            <div style="${estilo}">
                                <div style="font-size:14px;">${m.mensaje}</div>
                                <div style="font-size:10px;opacity:0.6;margin-top:4px;">
                                    ${fecha} ${esMio ? leidoIcon : ''}
                                    ${m.asunto ? '<br><strong>Asunto:</strong> ' + m.asunto : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <form id="form-enviar-mensaje" style="margin-top:12px;display:flex;gap:8px;">
                    <input type="hidden" id="chat-destinatario-id" value="${otroUsuarioId}">
                    <div style="flex:1;display:flex;gap:8px;">
                        <input type="text" id="chat-mensaje-input" placeholder="Escribe tu mensaje..." 
                               style="flex:1;padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:'Inter',sans-serif;">
                        <button type="submit" class="btn btn-primary" style="flex-shrink:0;">
                            <i class="fas fa-paper-plane"></i> Enviar
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Scroll al final
        var containerMensajes = document.getElementById('chat-mensajes-container');
        if (containerMensajes) {
            containerMensajes.scrollTop = containerMensajes.scrollHeight;
        }

        // Asignar eventos
        var form = document.getElementById('form-enviar-mensaje');
        if (form) {
            var newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            newForm.addEventListener('submit', function(e) {
                e.preventDefault();
                enviarMensaje();
            });
        }

        var input = document.getElementById('chat-mensaje-input');
        if (input) {
            // 🔥 TECLA ENTER - Envía mensaje y PERMANECE en la conversación
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    var form = document.getElementById('form-enviar-mensaje');
                    if (form) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }
            });
            setTimeout(function() {
                input.focus();
            }, 100);
        }

        console.log('📩 Conversación abierta - Enter envía mensaje y permanece abierta');
    }

    // ============================================================
    // ENVIAR MENSAJE (dentro de la conversación)
    // ============================================================
    async function enviarMensaje() {
        var destinatarioId = document.getElementById('chat-destinatario-id')?.value;
        var mensaje = document.getElementById('chat-mensaje-input')?.value.trim();

        if (!mensaje) {
            await ModalModule.warning('Escribe un mensaje.');
            return;
        }

        if (!destinatarioId) {
            await ModalModule.warning('No se pudo identificar al destinatario.');
            return;
        }

        var user = AuthModule.getCurrentUser();
        if (!user) return;

        try {
            // Guardar mensaje
            var result = await DBModule.execute(
                `INSERT INTO mensajes (remitente_id, destinatario_id, mensaje, fecha_envio) 
                 VALUES (?, ?, ?, datetime('now'))`,
                [user.id, parseInt(destinatarioId), mensaje]
            );

            var mensajeId = result.lastID;

            // Actualizar conversacion
            var conv = await DBModule.query(
                `SELECT id FROM conversaciones 
                 WHERE (usuario1_id = ? AND usuario2_id = ?) 
                    OR (usuario1_id = ? AND usuario2_id = ?)`,
                [user.id, parseInt(destinatarioId), parseInt(destinatarioId), user.id]
            );

            if (conv.length > 0) {
                await DBModule.execute(
                    'UPDATE conversaciones SET ultimo_mensaje_id = ?, fecha_ultimo = datetime("now") WHERE id = ?',
                    [mensajeId, conv[0].id]
                );
            } else {
                await DBModule.execute(
                    `INSERT INTO conversaciones (usuario1_id, usuario2_id, ultimo_mensaje_id, fecha_ultimo) 
                     VALUES (?, ?, ?, datetime('now'))`,
                    [Math.min(user.id, parseInt(destinatarioId)), Math.max(user.id, parseInt(destinatarioId)), mensajeId]
                );
            }

            // Notificar al destinatario
            await notificarDestinatario(parseInt(destinatarioId), user.nombre, mensaje);

            // Limpiar input
            var input = document.getElementById('chat-mensaje-input');
            if (input) input.value = '';

            // Agregar mensaje al contenedor
            await agregarMensajeAContenedor(mensaje, user.id, parseInt(destinatarioId));

            // Actualizar badges
            await cargarMensajesNoLeidos();

            // Actualizar lista de conversaciones
            cargarConversaciones();

            // Mostrar toast de confirmación
            setTimeout(function() {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('✅ Mensaje enviado', 'success', 2000);
                }
            }, 100);

        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            await ModalModule.error('Error al enviar mensaje: ' + error.message);
        }
    }

    // ============================================================
    // AGREGAR MENSAJE AL CONTENEDOR
    // ============================================================
    async function agregarMensajeAContenedor(mensaje, remitenteId, destinatarioId) {
        var containerMensajes = document.getElementById('chat-mensajes-container');
        if (!containerMensajes) return;

        var user = AuthModule.getCurrentUser();
        if (!user) return;

        var esMio = remitenteId === user.id;
        var estilo = esMio ? 
            'text-align:right;background:#0a1e3c;color:white;border-radius:12px 12px 4px 12px;padding:10px 14px;margin:4px 0 4px 40px;' :
            'text-align:left;background:#f1f4f8;color:#1e293b;border-radius:12px 12px 12px 4px;padding:10px 14px;margin:4px 40px 4px 0;';
        var fecha = new Date().toLocaleString('es-CU');
        var leidoIcon = '⏳';

        if (containerMensajes.innerHTML.includes('No hay mensajes')) {
            containerMensajes.innerHTML = '';
        }

        var mensajeHTML = `
            <div style="${estilo}">
                <div style="font-size:14px;">${mensaje}</div>
                <div style="font-size:10px;opacity:0.6;margin-top:4px;">
                    ${fecha} ${esMio ? leidoIcon : ''}
                </div>
            </div>
        `;

        containerMensajes.innerHTML += mensajeHTML;
        containerMensajes.scrollTop = containerMensajes.scrollHeight;
    }

    // ============================================================
    // NOTIFICAR DESTINATARIO
    // ============================================================
    async function notificarDestinatario(destinatarioId, remitenteNombre, mensaje) {
        try {
            await NotificationsModule.createNotification(
                destinatarioId,
                'mensaje',
                '💬 Nuevo mensaje de ' + remitenteNombre + ': ' + mensaje.substring(0, 50) + '...',
                '#chat'
            );
            await cargarMensajesNoLeidos();
        } catch (error) {
            console.warn('Error al notificar:', error);
        }
    }

    // ============================================================
    // 🔥 NUEVO MENSAJE - CON TECLA ENTER (Ctrl+Enter = Enviar y cerrar)
    // ============================================================
    async function nuevoMensaje() {
        var user = AuthModule.getCurrentUser();
        if (!user) return;

        cerrarConversacion();

        var usuarios = await DBModule.query(
            `SELECT u.id, u.nombre, u.username, u.email, e.avatar 
             FROM usuarios u
             LEFT JOIN egresados e ON u.id = e.usuario_id
             WHERE u.id != ?
             ORDER BY u.nombre`,
            [user.id]
        );

        if (usuarios.length === 0) {
            await ModalModule.warning('No hay otros usuarios para enviar mensajes.');
            return;
        }

        var optionsHTML = usuarios.map(function(u) {
            var avatar = u.avatar || '👤';
            var avatarHtml = avatar.startsWith('data:image') ? 
                `<img src="${avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;margin-right:10px;flex-shrink:0;">` :
                `<span style="font-size:24px;margin-right:10px;flex-shrink:0;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif;">${avatar}</span>`;
            return `<div class="usuario-item" data-id="${u.id}" style="display:flex;align-items:center;padding:8px 12px;border-radius:8px;cursor:pointer;transition:all 0.2s;border-bottom:1px solid #f1f4f8;" onclick="window._toggleUsuarioChat('${u.id}')" onmouseover="this.style.background='#f1f4f8';" onmouseout="this.style.background='transparent';">
                ${avatarHtml}
                <div class="usuario-info" style="flex:1;">
                    <div class="nombre" style="font-weight:500;font-size:14px;color:#0a1e3c;">${u.nombre}</div>
                    <div class="detalle" style="font-size:12px;color:#94a3b8;">${u.username} · ${u.email}</div>
                </div>
                <span class="check-mark" style="display:none;color:#1a8a4a;font-size:20px;margin-left:auto;">✅</span>
            </div>`;
        }).join('');

        var container = document.createElement('div');
        container.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 30, 60, 0.6); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            z-index: 100000; padding: 20px;
        `;
        container.innerHTML = `
            <div style="background:white;border-radius:16px;padding:24px;max-width:500px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:modalSlideIn 0.3s ease;max-height:80vh;display:flex;flex-direction:column;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3 style="margin:0;color:#0a1e3c;font-size:18px;">
                        <i class="fas fa-pen" style="color:#2a6b9c;"></i> Nuevo mensaje
                        <span style="font-size:12px;color:#94a3b8;font-weight:400;margin-left:8px;">(Selecciona uno o más)</span>
                    </h3>
                    <button id="btn-cerrar-modal-chat" style="background:transparent;border:none;font-size:20px;cursor:pointer;color:#94a3b8;">&times;</button>
                </div>
                
                <div style="margin-bottom:12px;">
                    <input type="text" id="buscador-usuarios-chat" placeholder="🔍 Buscar por nombre..." 
                           style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:'Inter',sans-serif;">
                </div>
                
                <div style="margin-bottom:10px;font-size:13px;color:#64748b;">
                    <span id="contador-seleccionados">0</span> usuario(s) seleccionado(s)
                </div>
                
                <div id="lista-usuarios-chat" style="overflow-y:auto;flex:1;max-height:300px;border:1px solid #e2e8f0;border-radius:8px;padding:4px;">
                    ${optionsHTML}
                </div>
                
                <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;">
                    <div class="form-group" style="margin-bottom:8px;">
                        <textarea id="nuevo-mensaje-texto" rows="3" placeholder="Escribe tu mensaje..." style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;resize:vertical;font-family:'Inter',sans-serif;"></textarea>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button id="btn-enviar-mensaje-multiple" class="btn btn-primary" style="flex:1;padding:10px;" disabled>
                            <i class="fas fa-paper-plane"></i> Enviar mensaje
                        </button>
                        <button id="btn-cancelar-mensaje-multiple" style="flex:1;padding:10px;background:transparent;border:2px solid #b33a4a;color:#b33a4a;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">
                            Cancelar
                        </button>
                    </div>
                </div>
                
                <input type="hidden" id="destinatarios-seleccionados" value="">
            </div>
        `;
        document.body.appendChild(container);

        function cerrarModal() {
            if (document.body.contains(container)) {
                container.remove();
            }
            cerrarConversacion();
        }

        document.getElementById('btn-cerrar-modal-chat').addEventListener('click', cerrarModal);
        document.getElementById('btn-cancelar-mensaje-multiple').addEventListener('click', cerrarModal);

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                if (document.body.contains(container)) {
                    cerrarModal();
                }
                document.removeEventListener('keydown', escHandler);
            }
        });

        container.addEventListener('click', function(e) {
            if (e.target === container) {
                cerrarModal();
            }
        });

        window._toggleUsuarioChat = function(id) {
            var item = document.querySelector(`.usuario-item[data-id="${id}"]`);
            if (!item) return;
            
            var check = item.querySelector('.check-mark');
            var isSelected = check.style.display === 'inline';
            
            if (isSelected) {
                check.style.display = 'none';
                item.style.background = 'transparent';
                item.style.border = 'none';
            } else {
                check.style.display = 'inline';
                item.style.background = '#e8f5e9';
                item.style.border = '2px solid #1a8a4a';
            }
            
            var seleccionados = document.querySelectorAll('.usuario-item .check-mark[style*="inline"]');
            var count = seleccionados.length;
            document.getElementById('contador-seleccionados').textContent = count;
            document.getElementById('btn-enviar-mensaje-multiple').disabled = count === 0;
            
            var ids = [];
            seleccionados.forEach(function(el) {
                var parent = el.closest('.usuario-item');
                if (parent) ids.push(parent.dataset.id);
            });
            document.getElementById('destinatarios-seleccionados').value = ids.join(',');
        };

        document.getElementById('buscador-usuarios-chat').addEventListener('input', function() {
            var term = this.value.toLowerCase().trim();
            document.querySelectorAll('.usuario-item').forEach(function(el) {
                var text = el.textContent.toLowerCase();
                el.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });

        document.getElementById('btn-enviar-mensaje-multiple').addEventListener('click', async function() {
            var idsStr = document.getElementById('destinatarios-seleccionados').value;
            var mensaje = document.getElementById('nuevo-mensaje-texto').value.trim();

            if (!idsStr) {
                await ModalModule.warning('Selecciona al menos un destinatario.');
                return;
            }

            if (!mensaje) {
                await ModalModule.warning('Escribe un mensaje.');
                return;
            }

            var ids = idsStr.split(',').map(Number);
            
            cerrarModal();
            
            var enviados = 0;
            var errores = [];

            for (var i = 0; i < ids.length; i++) {
                try {
                    var result = await DBModule.execute(
                        'INSERT INTO mensajes (remitente_id, destinatario_id, mensaje, fecha_envio) VALUES (?, ?, ?, datetime("now"))',
                        [user.id, ids[i], mensaje]
                    );

                    var mensajeId = result.lastID;

                    var conv = await DBModule.query(
                        'SELECT id FROM conversaciones WHERE (usuario1_id = ? AND usuario2_id = ?) OR (usuario1_id = ? AND usuario2_id = ?)',
                        [user.id, ids[i], ids[i], user.id]
                    );

                    if (conv.length > 0) {
                        await DBModule.execute(
                            'UPDATE conversaciones SET ultimo_mensaje_id = ?, fecha_ultimo = datetime("now") WHERE id = ?',
                            [mensajeId, conv[0].id]
                        );
                    } else {
                        await DBModule.execute(
                            'INSERT INTO conversaciones (usuario1_id, usuario2_id, ultimo_mensaje_id, fecha_ultimo) VALUES (?, ?, ?, datetime("now"))',
                            [Math.min(user.id, ids[i]), Math.max(user.id, ids[i]), mensajeId]
                        );
                    }

                    await NotificationsModule.createNotification(
                        ids[i],
                        'mensaje',
                        '💬 Nuevo mensaje de ' + user.nombre + ': ' + mensaje.substring(0, 40) + (mensaje.length > 40 ? '...' : ''),
                        '#chat'
                    );

                    enviados++;
                } catch (err) {
                    errores.push('Error al enviar a usuario ID ' + ids[i] + ': ' + err.message);
                }
            }

            if (window.NotificationsModule) {
                window.NotificationsModule.updateBadge();
            }
            cargarMensajesNoLeidos();
            cargarConversaciones();

            if (enviados > 0) {
                if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('✅ Mensaje enviado a ' + enviados + ' usuario(s)', 'success', 3000);
                }
            } else {
                await ModalModule.error('Error al enviar mensajes: ' + errores.join('\n'));
            }

            if (ids.length > 0) {
                await verConversacion(ids[0]);
            }
        });

        // 🔥 TECLA ENTER en el textarea - Ctrl+Enter = Enviar
        var textarea = document.getElementById('nuevo-mensaje-texto');
        if (textarea) {
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    document.getElementById('btn-enviar-mensaje-multiple').click();
                }
            });
        }

        setTimeout(function() {
            document.getElementById('buscador-usuarios-chat').focus();
        }, 200);
    }

    // ============================================================
    // ACTUALIZAR
    // ============================================================
    function actualizar() {
        cargarConversaciones();
        cargarMensajesNoLeidos();
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('🔄 Mensajes actualizados', 'info', 2000);
        }
    }

    // ============================================================
    // LOAD DATA
    // ============================================================
    async function loadData() {
        try {
            await cargarConversaciones();
            await cargarMensajesNoLeidos();
        } catch (error) {
            console.error('Error al cargar datos del chat:', error);
        }
    }

    // ============================================================
    // ASIGNAR EVENTOS
    // ============================================================
    function assignEvents() {
        // Los eventos se manejan inline
    }

    // ============================================================
    // RESETEAR NOTIFICACIONES DEL SISTEMA
    // ============================================================
    async function resetearNotificacionesSistema() {
        try {
            var user = AuthModule.getCurrentUser();
            if (!user) return false;

            await DBModule.execute(
                'UPDATE notificaciones SET leida = 1, fecha_leida = datetime("now") WHERE usuario_id = ? AND leida = 0',
                [user.id]
            );

            if (window.NotificationsModule) {
                window.NotificationsModule.updateBadge();
            }
            await cargarMensajesNoLeidos();

            return true;
        } catch (error) {
            console.error('Error al resetear notificaciones:', error);
            return false;
        }
    }

    // ============================================================
    // EXPOSICION PUBLICA
    // ============================================================
    return {
        navigate: navigate,
        verConversacion: verConversacion,
        enviarMensaje: enviarMensaje,
        nuevoMensaje: nuevoMensaje,
        actualizar: actualizar,
        cerrarConversacion: cerrarConversacion,
        cargarMensajesNoLeidos: cargarMensajesNoLeidos,
        cargarConversaciones: cargarConversaciones,
        loadData: loadData,
        iniciarMonitorNotificaciones: iniciarMonitorNotificaciones,
        detenerMonitorNotificaciones: detenerMonitorNotificaciones,
        resetearNotificacionesSistema: resetearNotificacionesSistema
    };

})();

window.ChatModule = ChatModule;
console.log('💬 Módulo de Chat cargado correctamente.');