// ============================================================
// SISPE - help.js
// Módulo de Ayuda del Sistema - SIN ALERT/CONFIRM
// RUTA: js/modules/help.js
// ============================================================

const HelpModule = (function() {
    'use strict';

    /**
     * Muestra ayuda contextual según la página actual
     */
    function showHelp(context = 'general') {
        const helpMessages = {
            'general': '📚 SISPE - Sistema de Preparación para el Empleo\n\n' +
                       'Esta plataforma te permite gestionar la superación profesional de los recién graduados.\n\n' +
                       '🔹 Egresados: Visualizan su plan y progreso\n' +
                       '🔹 Tutores: Gestionan planes y tutorías\n' +
                       '🔹 Coordinadores: Supervisan carreras y entidades\n' +
                       '🔹 Directivos: Visualizan el progreso de su entidad',
            
            'dashboard': '📊 Dashboard\n\n' +
                         'Vista principal donde puedes ver:\n' +
                         '• Estadísticas generales\n' +
                         '• Progreso de actividades\n' +
                         '• Actividades recientes\n' +
                         '• Notificaciones importantes',
            
            'plan': '📋 Plan de Superación\n\n' +
                    'Aquí puedes ver y gestionar tu plan personalizado:\n' +
                    '• Acciones asignadas\n' +
                    '• Estado de cada acción\n' +
                    '• Fechas límite\n' +
                    '• Progreso general',
            
            'tutorias': '🧑‍🏫 Tutorías\n\n' +
                        'Gestiona tus tutorías:\n' +
                        '• Ver historial de tutorías\n' +
                        '• Solicitar nuevas tutorías\n' +
                        '• Ver acuerdos y seguimiento',
            
            'evidencias': '📎 Evidencias\n\n' +
                          'Sube y gestiona tus evidencias:\n' +
                          '• Certificados de cursos\n' +
                          '• Informes de proyectos\n' +
                          '• Resultados de evaluaciones',
            
            'evaluar': '⭐ Evaluaciones\n\n' +
                       'Realiza evaluaciones de competencias:\n' +
                       '• Evaluación de conocimientos\n' +
                       '• Habilidades comunicativas\n' +
                       '• Valores éticos\n' +
                       '• Impacto en el desempeño'
        };

        const message = helpMessages[context] || helpMessages['general'];
        
        // 🔥 USAR MODALES PERSONALIZADOS - SIN ALERT()
        if (window.ModalModule && window.ModalModule.alert) {
            window.ModalModule.alert(message, 'Ayuda SISPE', '❓');
        } else if (window.NotificationsModule && window.NotificationsModule.showInfo) {
            window.NotificationsModule.showInfo(message, 6000);
        } else {
            // 🔥 Fallback ULTRA SEGURO - Sin alert()
            showEmergencyModal(message, 'Ayuda SISPE', '❓');
        }
    }

    /**
     * 🔥 FALLBACK DE EMERGENCIA - SIN ALERT()
     * Último recurso cuando ModalModule y NotificationsModule no están disponibles
     */
    function showEmergencyModal(message, title, icon) {
        // Verificar si ya existe un modal de emergencia
        if (document.getElementById('emergency-help-modal')) return;
        
        var container = document.createElement('div');
        container.id = 'emergency-help-modal';
        container.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 30, 60, 0.6); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            z-index: 999999; padding: 20px;
            animation: modalFadeIn 0.3s ease;
        `;
        
        // Escapar el mensaje para evitar XSS
        var safeMessage = String(message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var safeTitle = String(title || 'Ayuda').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var safeIcon = String(icon || '❓');
        
        container.innerHTML = `
            <div style="background:white;border-radius:16px;padding:30px;max-width:500px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:modalSlideIn 0.3s ease;max-height:80vh;overflow-y:auto;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                    <span style="font-size:28px;flex-shrink:0;">${safeIcon}</span>
                    <h3 style="margin:0;color:#0a1e3c;font-size:18px;font-family:'Inter',sans-serif;">${safeTitle}</h3>
                </div>
                <p style="color:#475569;margin-bottom:20px;white-space:pre-wrap;font-size:14px;line-height:1.7;font-family:'Inter',sans-serif;">${safeMessage}</p>
                <button onclick="this.closest('#emergency-help-modal').remove()" 
                        style="padding:10px 24px;background:#0a1e3c;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;width:100%;font-family:'Inter',sans-serif;">
                    Aceptar
                </button>
            </div>
        `;
        
        // Agregar estilos de animación si no existen
        if (!document.getElementById('emergency-modal-styles')) {
            var style = document.createElement('style');
            style.id = 'emergency-modal-styles';
            style.textContent = `
                @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalSlideIn { from { opacity: 0; transform: translateY(-30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(container);
        
        // Cerrar al hacer clic en el backdrop
        container.addEventListener('click', function(e) {
            if (e.target === container) {
                container.remove();
            }
        });
        
        // Cerrar con tecla ESC
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                if (document.getElementById('emergency-help-modal')) {
                    document.getElementById('emergency-help-modal').remove();
                }
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    /**
     * Inicializa el sistema de ayuda con tooltips
     */
    function initHelp() {
        // Agregar tooltips a elementos con data-help
        document.querySelectorAll('[data-help]').forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                var tip = this.dataset.help;
                if (window.NotificationsModule && window.NotificationsModule.showInfo) {
                    window.NotificationsModule.showInfo(tip, 2000);
                }
            });
        });

        // Agregar botón de ayuda global
        var helpBtn = document.createElement('button');
        helpBtn.className = 'btn-help-global';
        helpBtn.innerHTML = '❓';
        helpBtn.title = 'Ayuda del sistema';
        helpBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #0a1e3c;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 999;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s ease;
        `;
        helpBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        });
        helpBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        helpBtn.addEventListener('click', function() {
            showHelp('general');
        });
        document.body.appendChild(helpBtn);
    }

    return {
        showHelp: showHelp,
        initHelp: initHelp,
        getHelpMessage: function(context) {
            var messages = {
                'general': 'SISPE - Sistema de Preparación para el Empleo',
                'dashboard': 'Dashboard - Estadísticas y progreso',
                'plan': 'Plan de Superación - Acciones y seguimiento',
                'tutorias': 'Tutorías - Historial y solicitudes',
                'evidencias': 'Evidencias - Subir y gestionar documentos',
                'evaluar': 'Evaluaciones - Evaluación de competencias'
            };
            return messages[context] || messages['general'];
        }
    };

})();

// Exportar para uso global
window.HelpModule = HelpModule;

console.log('❓ Módulo de Ayuda cargado correctamente.');