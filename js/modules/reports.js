// ============================================================
// REPLACE: generarReporteResumen() en reports.js
// ============================================================

    /**
     * Genera un reporte simplificado (resumen) - SIN ALERT/CONFIRM
     */
    async function generarReporteResumen(filtros = {}) {
        try {
            const data = await getReportData(filtros);
            const { estadisticas } = data;

            let mensaje = `
📊 **RESUMEN DE SUPERACIÓN PROFESIONAL**

📅 Fecha: ${new Date().toLocaleString('es-CU')}
🏛️ ${filtros.entidadNombre || 'Todas las entidades'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 **Total Egresados:** ${estadisticas.totalEgresados}
📋 **Con Plan Activo:** ${estadisticas.conPlan}
✅ **Plan Completado:** ${estadisticas.completados}
📈 **Progreso Promedio:** ${estadisticas.promedioProgreso}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Distribución por Estado:**
🌟 Progreso Alto (≥80%): ${estadisticas.altoProgreso}
📈 En Desarrollo (50-79%): ${estadisticas.medioProgreso}
📉 Progreso Bajo (1-49%): ${estadisticas.bajoProgreso}
⚪ Sin Iniciar: ${estadisticas.sinIniciar}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 **Acciones:**
Total: ${estadisticas.totalAcciones}
Completadas: ${estadisticas.accionesCompletadas}
Pendientes: ${estadisticas.accionesPendientes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **Distribución por Carrera:**
${Object.entries(estadisticas.porCarrera).map(([nombre, cantidad]) => `  • ${nombre}: ${cantidad}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SISPE - Sistema de Preparación para el Empleo
UIJ - Universidad de la Isla de la Juventud
            `;

            // 🔥 MOSTRAR EN VENTANA - SIN ALERT()
            var win = window.open('', '_blank', 'width=600,height=500');
            if (win) {
                win.document.write(`
                    <html><head><title>Resumen SISPE</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; white-space: pre-wrap; background: #f8fafc; }
                        .container { max-width: 700px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                        @media print { body { background: white; } .container { box-shadow: none; } }
                    </style>
                    </head>
                    <body><div class="container">${mensaje}</div></body></html>
                `);
                win.document.close();
                NotificationsModule.showSuccess('✅ Resumen generado correctamente.');
            } else {
                // 🔥 FALLBACK - Mostrar en un modal si no se pudo abrir la ventana
                await NotificationsModule.showModalWarning(
                    'No se pudo abrir la ventana de resumen.\n\nVerifica que los pop-ups estén permitidos en tu navegador.',
                    'Atención'
                );
                // También mostrar el contenido en la consola
                console.log('📊 RESUMEN SISPE:\n' + mensaje);
            }

        } catch (error) {
            console.error('Error al generar resumen:', error);
            await NotificationsModule.showModalError('Error al generar el resumen.');
        }
    }
