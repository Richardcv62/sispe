// ============================================================
// SISPE - register.js
// Módulo de Autoregistro y Verificación
// ============================================================

const RegisterModule = (function() {
    'use strict';

    /**
     * Renderiza el formulario de registro
     */
    function renderRegisterForm() {
        var container = document.getElementById('page-container');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-user-plus"></i> Registro de Usuario</h2>
                <div class="breadcrumb">Crear cuenta en SISPE</div>
            </div>

            <div class="card" style="max-width:700px;margin:0 auto;">
                <div class="card-title"><i class="fas fa-id-card"></i> Verificación de Identidad</div>
                <form id="form-registro">
                    <div class="form-group">
                        <label>Tipo de usuario <span class="required">*</span></label>
                        <select id="registro-tipo" required>
                            <option value="">Selecciona...</option>
                            <option value="egresado">👨‍🎓 Egresado (Recién Graduado)</option>
                            <option value="docente">🧑‍🏫 Docente / Tutor</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Número de Identidad (Carnet) <span class="required">*</span></label>
                        <input type="text" id="registro-identidad" placeholder="Ej: 88010112345" required>
                        <small style="color:#94a3b8;">Ingresa tu carnet de identidad para verificar tu registro</small>
                    </div>

                    <div class="form-group">
                        <label>Nombre completo <span class="required">*</span></label>
                        <input type="text" id="registro-nombre" placeholder="Ej: Carlos Pérez" required>
                    </div>

                    <div class="form-group">
                        <label>Correo electrónico <span class="required">*</span></label>
                        <input type="email" id="registro-email" placeholder="ejemplo@uiij.co.cu" required>
                        <small style="color:#94a3b8;">Se enviará un código de verificación a este correo</small>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Usuario <span class="required">*</span></label>
                            <input type="text" id="registro-username" placeholder="Ej: carlos.p" required>
                        </div>
                        <div class="form-group">
                            <label>Contraseña <span class="required">*</span></label>
                            <input type="password" id="registro-password" placeholder="Mínimo 6 caracteres" required minlength="6">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Confirmar contraseña <span class="required">*</span></label>
                        <input type="password" id="registro-password-confirm" placeholder="Repite tu contraseña" required>
                    </div>

                    <div id="registro-resultado" style="display:none;padding:12px;border-radius:8px;margin-bottom:12px;"></div>

                    <div style="display:flex;gap:12px;">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-check-circle"></i> Verificar y Registrar</button>
                        <button type="button" class="btn btn-outline" onclick="window.App.navigate('dashboard')">Volver</button>
                    </div>
                </form>
            </div>
        `;

        // Asignar evento
        document.getElementById('form-registro').addEventListener('submit', handleRegister);
    }

    /**
     * Maneja el registro del usuario
     */
    async function handleRegister(e) {
        e.preventDefault();

        var tipo = document.getElementById('registro-tipo').value;
        var identidad = document.getElementById('registro-identidad').value.trim();
        var nombre = document.getElementById('registro-nombre').value.trim();
        var email = document.getElementById('registro-email').value.trim();
        var username = document.getElementById('registro-username').value.trim();
        var password = document.getElementById('registro-password').value;
        var passwordConfirm = document.getElementById('registro-password-confirm').value;

        var resultado = document.getElementById('registro-resultado');

        // Validaciones básicas
        if (!tipo || !identidad || !nombre || !email || !username || !password) {
            mostrarResultado('error', 'Completa todos los campos obligatorios.');
            return;
        }

        if (password !== passwordConfirm) {
            mostrarResultado('error', 'Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            mostrarResultado('error', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            mostrarResultado('info', 'Verificando identidad...');

            // 1. Verificar si el usuario ya existe
            var existingUser = await DBModule.query(
                'SELECT id FROM usuarios WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUser.length > 0) {
                mostrarResultado('error', 'El usuario o correo ya está registrado.');
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
                    // Verificar que el nombre coincida
                    if (infoUsuario.nombre + ' ' + infoUsuario.apellidos !== nombre) {
                        mostrarResultado('warning', 'El nombre no coincide con el registro oficial. Verifica tus datos.');
                        return;
                    }
                } else {
                    mostrarResultado('warning', 'No se encontró registro como graduado. Contacta a la UIJ.');
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
                    mostrarResultado('warning', 'No se encontró registro como docente. Contacta a la UIJ.');
                    return;
                }
            }

            if (!verificado) {
                mostrarResultado('error', 'Verificación fallida. Contacta al administrador.');
                return;
            }

            mostrarResultado('info', '✅ Identidad verificada. Creando cuenta...');

            // 3. Crear el usuario
            var hashedPassword = hashPassword(password);
            var rolId = tipo === 'egresado' ? 5 : 4; // Egresado o Tutor

            var result = await DBModule.execute(
                `INSERT INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo, verificado) 
                 VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
                [username, hashedPassword, email, nombre, infoUsuario.apellidos || '', rolId]
            );

            // 4. Si es egresado, crear su perfil en la tabla egresados
            if (tipo === 'egresado') {
                var carreraId = infoUsuario.carrera_id || 1;
                var anioGraduacion = infoUsuario.anio_graduacion || new Date().getFullYear();

                await DBModule.execute(
                    `INSERT INTO egresados (usuario_id, carrera_id, entidad_id, anio_graduacion, titulo_oro, graduado_integral, avatar) 
                     VALUES (?, ?, 1, ?, ?, ?, '👨‍🎓')`,
                    [result.lastID, carreraId, anioGraduacion, infoUsuario.titulo_oro || 0, infoUsuario.graduado_integral || 0]
                );

                // Crear plan de superación automático
                await DBModule.execute(
                    `INSERT INTO planes_superacion (egresado_id, tutor_id, anio_plan, estado) 
                     VALUES (?, NULL, strftime('%Y', 'now'), 'activo')`,
                    [result.lastID]
                );

                mostrarResultado('success', '✅ ¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
            } else {
                // Si es docente, crear su perfil en la tabla tutores
                await DBModule.execute(
                    `INSERT INTO tutores (usuario_id, entidad_id, categoria) 
                     VALUES (?, 1, 'Auxiliar')`,
                    [result.lastID]
                );

                mostrarResultado('success', '✅ ¡Cuenta de docente creada exitosamente! Ahora puedes iniciar sesión.');
            }

            // Limpiar formulario
            document.getElementById('form-registro').reset();
            document.getElementById('registro-resultado').style.display = 'block';

            // Redirigir al login después de 3 segundos
            setTimeout(function() {
                window.App.showLogin();
            }, 3000);

        } catch (error) {
            console.error('Error en registro:', error);
            mostrarResultado('error', 'Error al crear la cuenta: ' + error.message);
        }
    }

    /**
     * Muestra resultados en el formulario
     */
    function mostrarResultado(tipo, mensaje) {
        var resultado = document.getElementById('registro-resultado');
        if (!resultado) return;

        var colores = {
            'error': '#b33a4a',
            'warning': '#d48a2a',
            'success': '#1a8a4a',
            'info': '#2a6b9c'
        };

        var iconos = {
            'error': '❌',
            'warning': '⚠️',
            'success': '✅',
            'info': 'ℹ️'
        };

        resultado.style.display = 'block';
        resultado.style.background = '#f8fafc';
        resultado.style.borderLeft = '4px solid ' + (colores[tipo] || '#94a3b8');
        resultado.style.color = '#1e293b';
        resultado.innerHTML = (iconos[tipo] || '') + ' ' + mensaje;
        resultado.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Hash simple para contraseñas
     */
    function hashPassword(password) {
        var hash = 0;
        for (var i = 0; i < password.length; i++) {
            var char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return (hash >>> 0).toString(16).padStart(8, '0');
    }

    return {
        renderRegisterForm: renderRegisterForm,
        handleRegister: handleRegister
    };

})();

window.RegisterModule = RegisterModule;
console.log('📝 Módulo de Registro cargado.');
