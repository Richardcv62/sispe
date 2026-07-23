// ============================================================
// SISPE - register.js
// Módulo de Registro de Usuarios con verificación
// ============================================================

const RegisterModule = (function() {
    'use strict';

    // ============================================================
    // RENDERIZAR FORMULARIO DE REGISTRO
    // ============================================================
    function renderRegisterForm() {
        var container = document.getElementById('page-container');
        if (!container) {
            // Si no hay page-container, usar app directamente
            container = document.getElementById('app');
        }
        if (!container) return;

        container.innerHTML = `
            <div id="register-page" style="max-width:700px;margin:40px auto;padding:0 20px;">
                <div class="card" style="border:2px solid #2a6b9c;">
                    <div class="card-title" style="text-align:center;font-size:24px;">
                        <i class="fas fa-user-plus" style="color:#2a6b9c;"></i> Registro de Usuario
                    </div>
                    <p style="text-align:center;color:#64748b;margin-bottom:20px;">
                        Completa tus datos para crear una cuenta en SISPE
                    </p>

                    <form id="form-registro">
                        <!-- Tipo de usuario -->
                        <div class="form-group">
                            <label>Tipo de usuario <span class="required">*</span></label>
                            <select id="registro-tipo" required>
                                <option value="">Selecciona...</option>
                                <option value="egresado">👨‍🎓 Egresado (Recién Graduado)</option>
                                <option value="docente">🧑‍🏫 Docente / Tutor</option>
                            </select>
                        </div>

                        <!-- Número de Identidad -->
                        <div class="form-group">
                            <label>Número de Identidad (Carnet) <span class="required">*</span></label>
                            <input type="text" id="registro-identidad" placeholder="Ej: 88010112345" required>
                            <small style="color:#94a3b8;">Ingresa tu carnet de identidad para verificar tu registro</small>
                        </div>

                        <!-- Nombre -->
                        <div class="form-group">
                            <label>Nombre completo <span class="required">*</span></label>
                            <input type="text" id="registro-nombre" placeholder="Ej: Carlos Perez" required>
                        </div>

                        <!-- Apellidos -->
                        <div class="form-group">
                            <label>Apellidos <span class="required">*</span></label>
                            <input type="text" id="registro-apellidos" placeholder="Ej: Perez Rodriguez" required>
                        </div>

                        <!-- Email -->
                        <div class="form-group">
                            <label>Correo electrónico <span class="required">*</span></label>
                            <input type="email" id="registro-email" placeholder="ejemplo@uiij.co.cu" required>
                            <small style="color:#94a3b8;">Se enviará un código de verificación a este correo</small>
                        </div>

                        <!-- Usuario -->
                        <div class="form-group">
                            <label>Nombre de usuario <span class="required">*</span></label>
                            <input type="text" id="registro-username" placeholder="Ej: carlos.p" required>
                            <small style="color:#94a3b8;">Mínimo 4 caracteres, solo letras y puntos</small>
                        </div>

                        <!-- Contraseña -->
                        <div class="form-row">
                            <div class="form-group">
                                <label>Contraseña <span class="required">*</span></label>
                                <input type="password" id="registro-password" placeholder="Mínimo 6 caracteres" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label>Confirmar contraseña <span class="required">*</span></label>
                                <input type="password" id="registro-password-confirm" placeholder="Repite tu contraseña" required>
                            </div>
                        </div>

                        <!-- Resultado -->
                        <div id="registro-resultado" style="display:none;padding:12px;border-radius:8px;margin-bottom:12px;"></div>

                        <!-- Botones -->
                        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                            <button type="submit" class="btn btn-primary" style="min-width:200px;">
                                <i class="fas fa-check-circle"></i> Verificar y Registrar
                            </button>
                            <button type="button" class="btn btn-outline" onclick="App.showLogin();">
                                <i class="fas fa-arrow-left"></i> Volver al Login
                            </button>
                        </div>
                    </form>
                </div>

                <div style="text-align:center;margin-top:20px;font-size:12px;color:#94a3b8;line-height:1.8;">
                    <div>SISPE v1.0 | UIJ 2026</div>
                    <div style="font-size:11px;color:#a0aec0;margin-top:4px;">
                        &copy; 2026 - Todos los derechos reservados<br>
                        Desarrollado por Ricardo Castillo Valdes<br>
                        <a href="mailto:3sayricardo@gmail.com" style="color:#94a3b8;text-decoration:none;">3sayricardo@gmail.com</a> | 
                        <a href="https://wa.me/5355031725" target="_blank" style="color:#94a3b8;text-decoration:none;">WhatsApp +53 55031725</a>
                    </div>
                </div>
            </div>
        `;

        // Asignar evento al formulario
        document.getElementById('form-registro').addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });

        // Validación en tiempo real de contraseñas
        document.getElementById('registro-password').addEventListener('input', function() {
            verificarContrasenas();
        });
        document.getElementById('registro-password-confirm').addEventListener('input', function() {
            verificarContrasenas();
        });

        // Validación de username
        document.getElementById('registro-username').addEventListener('input', function() {
            var val = this.value;
            this.value = val.toLowerCase().replace(/[^a-z0-9.]/g, '');
        });
    }

    // ============================================================
    // VERIFICAR CONTRASEÑAS
    // ============================================================
    function verificarContrasenas() {
        var pass1 = document.getElementById('registro-password').value;
        var pass2 = document.getElementById('registro-password-confirm').value;
        var resultado = document.getElementById('registro-resultado');

        if (pass1.length > 0 && pass2.length > 0) {
            if (pass1 !== pass2) {
                resultado.style.display = 'block';
                resultado.style.background = '#f8d7da';
                resultado.style.borderLeft = '4px solid #b33a4a';
                resultado.style.color = '#721c24';
                resultado.innerHTML = '❌ Las contraseñas no coinciden.';
            } else {
                resultado.style.display = 'none';
            }
        }
    }

    // ============================================================
    // MANEJAR REGISTRO
    // ============================================================
    async function handleRegister() {
        var tipo = document.getElementById('registro-tipo').value;
        var identidad = document.getElementById('registro-identidad').value.trim();
        var nombre = document.getElementById('registro-nombre').value.trim();
        var apellidos = document.getElementById('registro-apellidos').value.trim();
        var email = document.getElementById('registro-email').value.trim();
        var username = document.getElementById('registro-username').value.trim();
        var password = document.getElementById('registro-password').value;
        var passwordConfirm = document.getElementById('registro-password-confirm').value;

        var resultado = document.getElementById('registro-resultado');

        // Validaciones básicas
        if (!tipo || !identidad || !nombre || !apellidos || !email || !username || !password) {
            mostrarResultado('error', '❌ Completa todos los campos obligatorios.');
            return;
        }

        if (password !== passwordConfirm) {
            mostrarResultado('error', '❌ Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            mostrarResultado('error', '❌ La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (username.length < 4) {
            mostrarResultado('error', '❌ El nombre de usuario debe tener al menos 4 caracteres.');
            return;
        }

        try {
            mostrarResultado('info', '⏳ Verificando identidad...');

            // 1. Verificar si el usuario ya existe
            var existingUser = await DBModule.query(
                'SELECT id FROM usuarios WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUser.length > 0) {
                mostrarResultado('error', '❌ El nombre de usuario o correo ya está registrado.');
                return;
            }

            // 2. Verificar en la lista de graduados o docentes según el tipo
            var verificado = false;
            var infoUsuario = null;

            if (tipo === 'egresado') {
                // Buscar en la tabla de graduados
                var graduados = await DBModule.query(
                    'SELECT * FROM graduados WHERE numero_identidad = ?',
                    [identidad]
                );

                if (graduados.length > 0) {
                    verificado = true;
                    infoUsuario = graduados[0];
                    // Verificar que el nombre coincida (aproximadamente)
                    var nombreCompleto = (nombre + ' ' + apellidos).toLowerCase().replace(/\s+/g, ' ');
                    var nombreRegistro = (infoUsuario.nombre + ' ' + infoUsuario.apellidos).toLowerCase().replace(/\s+/g, ' ');
                    if (nombreCompleto !== nombreRegistro) {
                        mostrarResultado('warning', '⚠️ El nombre no coincide exactamente con el registro oficial. Verifica tus datos.');
                        return;
                    }
                } else {
                    mostrarResultado('warning', '⚠️ No se encontró registro como graduado. Contacta a la UIJ.');
                    return;
                }

            } else if (tipo === 'docente') {
                // Buscar en la tabla de docentes
                var docentes = await DBModule.query(
                    'SELECT * FROM docentes WHERE numero_identidad = ?',
                    [identidad]
                );

                if (docentes.length > 0) {
                    verificado = true;
                    infoUsuario = docentes[0];
                } else {
                    mostrarResultado('warning', '⚠️ No se encontró registro como docente. Contacta a la UIJ.');
                    return;
                }
            }

            if (!verificado) {
                mostrarResultado('error', '❌ Verificación fallida. Contacta al administrador.');
                return;
            }

            mostrarResultado('info', '✅ Identidad verificada. Creando cuenta...');

            // 3. Crear el usuario
            var rolId = tipo === 'egresado' ? 5 : 4; // Egresado o Tutor

            var result = await DBModule.execute(
                'INSERT INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo, verificado) VALUES (?, ?, ?, ?, ?, ?, 1, 1)',
                [username, password, email, nombre, apellidos, rolId]
            );

            var usuarioId = result.lastID;

            // 4. Si es egresado, crear su perfil en la tabla egresados
            if (tipo === 'egresado') {
                var carreraId = infoUsuario.carrera_id || 1;
                var anioGraduacion = infoUsuario.anio_graduacion || new Date().getFullYear();
                var avatar = '👤';

                // Asignar avatar según carrera o nombre
                var carrerasMap = {
                    'Ingeniería Agrónoma': '👨‍🌾',
                    'Lic. Contabilidad': '👩‍💼',
                    'Lic. Derecho': '👨‍⚖️',
                    'Ing. Informática': '👩‍💻',
                    'Lic. Cultura Física': '🏃‍♂️',
                    'Lic. Psicología': '👩‍🔬'
                };

                // Obtener nombre de la carrera
                var carreraInfo = await DBModule.query(
                    'SELECT nombre FROM carreras WHERE id = ?',
                    [carreraId]
                );
                if (carreraInfo.length > 0) {
                    avatar = carrerasMap[carreraInfo[0].nombre] || '👤';
                }

                await DBModule.execute(
                    `INSERT INTO egresados (usuario_id, carrera_id, entidad_id, anio_graduacion, titulo_oro, graduado_integral, avatar) 
                     VALUES (?, ?, 1, ?, ?, ?, ?)`,
                    [usuarioId, carreraId, anioGraduacion, infoUsuario.titulo_oro || 0, infoUsuario.graduado_integral || 0, avatar]
                );

                // Crear plan de superación automático
                await DBModule.execute(
                    `INSERT INTO planes_superacion (egresado_id, anio_plan, estado) 
                     VALUES (?, strftime('%Y', 'now'), 'activo')`,
                    [usuarioId]
                );

                mostrarResultado('success', '✅ ¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');

            } else {
                // Si es docente, crear su perfil en la tabla tutores
                var entidadId = 1;
                var categoria = 'Auxiliar';

                // Asignar entidad según departamento
                if (infoUsuario.departamento) {
                    var entidadMatch = await DBModule.query(
                        'SELECT id FROM entidades WHERE sector LIKE ?',
                        ['%' + infoUsuario.departamento + '%']
                    );
                    if (entidadMatch.length > 0) {
                        entidadId = entidadMatch[0].id;
                    }
                }

                await DBModule.execute(
                    `INSERT INTO tutores (usuario_id, entidad_id, categoria, anios_experiencia) 
                     VALUES (?, ?, ?, 5)`,
                    [usuarioId, entidadId, categoria]
                );

                mostrarResultado('success', '✅ ¡Cuenta de docente creada exitosamente! Ahora puedes iniciar sesión.');
            }

            // 5. Enviar correo de confirmación
            try {
                await enviarCorreoConfirmacion(email, nombre);
            } catch (err) {
                console.warn('Error al enviar correo:', err);
            }

            // 6. Crear notificación para el administrador
            try {
                await window.NotificationsModule.createNotification(
                    1, // admin
                    'sistema',
                    'Nuevo usuario registrado: ' + username + ' (' + nombre + ')',
                    '#usuarios'
                );
            } catch (err) {
                console.warn('Error al crear notificación:', err);
            }

            // Limpiar formulario
            document.getElementById('form-registro').reset();
            resultado.style.display = 'block';
            resultado.style.background = '#d4edda';
            resultado.style.borderLeft = '4px solid #1a8a4a';
            resultado.style.color = '#155724';
            resultado.innerHTML = '✅ ¡Cuenta creada exitosamente! Serás redirigido al login en 3 segundos...';

            // Redirigir al login después de 3 segundos
            setTimeout(function() {
                App.showLogin();
            }, 3000);

        } catch (error) {
            console.error('Error en registro:', error);
            mostrarResultado('error', '❌ Error al crear la cuenta: ' + error.message);
        }
    }

    // ============================================================
    // ENVIAR CORREO DE CONFIRMACIÓN
    // ============================================================
    async function enviarCorreoConfirmacion(email, nombre) {
        try {
            var asunto = 'Bienvenido a SISPE - Sistema de Preparacion para el Empleo';
            var mensaje = 'Hola ' + nombre + ',\n\n' +
                          'Te damos la bienvenida a SISPE, el Sistema de Preparacion para el Empleo de la UIJ.\n\n' +
                          'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesion con tus credenciales.\n\n' +
                          'Usuario: ' + document.getElementById('registro-username').value + '\n' +
                          'Enlace de acceso: ' + window.location.origin + '/sispe/\n\n' +
                          'Si no solicitaste esta cuenta, por favor ignora este mensaje.\n\n' +
                          'Saludos cordiales,\n' +
                          'Equipo SISPE - UIJ';

            await window.NotificationsModule.sendEmail(
                email,
                nombre,
                asunto,
                mensaje,
                window.location.origin + '/sispe/'
            );
            console.log('📧 Correo de confirmacion enviado a:', email);
        } catch (error) {
            console.error('❌ Error al enviar correo:', error);
        }
    }

    // ============================================================
    // MOSTRAR RESULTADO
    // ============================================================
    function mostrarResultado(tipo, mensaje) {
        var resultado = document.getElementById('registro-resultado');
        if (!resultado) return;

        var colores = {
            'error': { bg: '#f8d7da', border: '#b33a4a', text: '#721c24' },
            'warning': { bg: '#fff3cd', border: '#d48a2a', text: '#856404' },
            'success': { bg: '#d4edda', border: '#1a8a4a', text: '#155724' },
            'info': { bg: '#d1ecf1', border: '#2a6b9c', text: '#0c5460' }
        };

        var color = colores[tipo] || colores['info'];

        resultado.style.display = 'block';
        resultado.style.background = color.bg;
        resultado.style.borderLeft = '4px solid ' + color.border;
        resultado.style.color = color.text;
        resultado.innerHTML = mensaje;
        resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ============================================================
    // API PÚBLICA
    // ============================================================
    return {
        renderRegisterForm: renderRegisterForm,
        handleRegister: handleRegister
    };

})();

// Exponer globalmente
window.RegisterModule = RegisterModule;
console.log('📝 Módulo de Registro cargado correctamente.');
