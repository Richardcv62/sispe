// ============================================================
// SISPE - help.js
// Módulo de Ayuda del Sistema
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
        
        // Mostrar en una ventana o en un toast
        if (window.NotificationsModule) {
            window.NotificationsModule.showInfo(message, 6000);
        } else {
            alert(message);
        }
    }

    /**
     * Inicializa el sistema de ayuda con tooltips
     */
    function initHelp() {
        // Agregar tooltips a elementos con data-help
        document.querySelectorAll('[data-help]').forEach(el => {
            el.addEventListener('mouseenter', function(e) {
                const tip = this.dataset.help;
                if (window.NotificationsModule) {
                    window.NotificationsModule.showInfo(tip, 2000);
                }
            });
        });

        // Agregar botón de ayuda global
        const helpBtn = document.createElement('button');
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
        `;
        helpBtn.addEventListener('click', () => showHelp('general'));
        document.body.appendChild(helpBtn);
    }

    return {
        showHelp: showHelp,
        initHelp: initHelp,
        getHelpMessage: function(context) {
            const messages = {
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
