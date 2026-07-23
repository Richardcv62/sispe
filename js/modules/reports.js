// ============================================================
// SISPE - reports.js
// Módulo de Reportes Avanzados
// ============================================================

const ReportsModule = (function() {
    'use strict';

    // ---- FUNCIONES PRIVADAS ----

    /**
     * Obtiene todos los datos necesarios para un reporte completo
     */
    async function getReportData(filtros = {}) {
        const { entidadId, carreraId, anio, tipo } = filtros;

        try {
            let whereClause = '1=1';
            const params = [];

            if (entidadId) {
                whereClause += ' AND e.entidad_id = ?';
                params.push(entidadId);
            }
            if (carreraId) {
                whereClause += ' AND e.carrera_id = ?';
                params.push(carreraId);
            }
            if (anio) {
                whereClause += ' AND p.anio_plan = ?';
                params.push(anio);
            }

            // Obtener egresados con sus planes
            const egresados = await DBModule.query(
                `SELECT 
                    e.id,
                    u.nombre as egresado_nombre,
                    u.email,
                    c.nombre as carrera_nombre,
                    ent.nombre as entidad_nombre,
                    ent.sector,
                    p.id as plan_id,
                    p.anio_plan,
                    p.estado as plan_estado,
                    p.progreso,
                    p.fecha_inicio,
                    p.fecha_fin_estimada,
                    t.nombre as tutor_nombre,
                    e.titulo_oro,
                    e.graduado_integral,
                    e.anio_graduacion
                 FROM egresados e
                 JOIN usuarios u ON e.usuario_id = u.id
                 JOIN carreras c ON e.carrera_id = c.id
                 JOIN entidades ent ON e.entidad_id = ent.id
                 LEFT JOIN planes_superacion p ON e.id = p.egresado_id
                 LEFT JOIN tutores tu ON e.tutor_id = tu.id
                 LEFT JOIN usuarios t ON tu.usuario_id = t.id
                 WHERE ${whereClause}
                 ORDER BY u.nombre ASC`,
                params
            );

            // Obtener acciones para cada plan
            const planesIds = egresados
                .filter(e => e.plan_id)
                .map(e => e.plan_id)
                .filter((v, i, a) => a.indexOf(v) === i);

            let acciones = [];
            if (planesIds.length > 0) {
                acciones = await DBModule.query(
                    `SELECT a.*, p.egresado_id 
                     FROM acciones_plan a
                     JOIN planes_superacion p ON a.plan_id = p.id
                     WHERE a.plan_id IN (${planesIds.map(() => '?').join(',')})`,
                    planesIds
                );
            }

            // Obtener evaluaciones
            const egresadosIds = egresados.map(e => e.id);
            let evaluaciones = [];
            if (egresadosIds.length > 0) {
                evaluaciones = await DBModule.query(
                    `SELECT * FROM evaluaciones 
                     WHERE egresado_id IN (${egresadosIds.map(() => '?').join(',')})`,
                    egresadosIds
                );
            }

            // Calcular estadísticas
            const totalEgresados = egresados.length;
            const conPlan = egresados.filter(e => e.plan_id).length;
            const completados = egresados.filter(e => e.progreso === 100).length;
            const altoProgreso = egresados.filter(e => e.progreso >= 80 && e.progreso < 100).length;
            const medioProgreso = egresados.filter(e => e.progreso >= 50 && e.progreso < 80).length;
            const bajoProgreso = egresados.filter(e => e.progreso > 0 && e.progreso < 50).length;
            const sinIniciar = egresados.filter(e => e.progreso === 0 || !e.plan_id).length;

            const promedioProgreso = totalEgresados > 0 ? 
                Math.round(egresados.reduce((acc, e) => acc + (e.progreso || 0), 0) / totalEgresados) : 0;

            // Distribución por carrera
            const porCarrera = {};
            egresados.forEach(e => {
                if (e.carrera_nombre) {
                    porCarrera[e.carrera_nombre] = (porCarrera[e.carrera_nombre] || 0) + 1;
                }
            });

            // Total de acciones
            const totalAcciones = acciones.length;
            const accionesCompletadas = acciones.filter(a => a.estado === 'completado').length;
            const accionesPendientes = acciones.filter(a => a.estado === 'pendiente').length;

            return {
                egresados,
                acciones,
                evaluaciones,
                estadisticas: {
                    totalEgresados,
                    conPlan,
                    completados,
                    altoProgreso,
                    medioProgreso,
                    bajoProgreso,
                    sinIniciar,
                    promedioProgreso,
                    totalAcciones,
                    accionesCompletadas,
                    accionesPendientes,
                    porCarrera
                },
                fechaGeneracion: new Date().toLocaleString('es-CU'),
                filtros
            };
        } catch (error) {
            console.error('Error al obtener datos del reporte:', error);
            throw error;
        }
    }

    /**
     * Dibuja un gráfico de barras en un canvas
     */
    function drawBarChart(canvas, datos, colores = null) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 60;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        ctx.clearRect(0, 0, width, height);

        if (!datos || Object.keys(datos).length === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos para mostrar', width / 2, height / 2);
            return;
        }

        const keys = Object.keys(datos);
        const values = Object.values(datos);
        const maxValue = Math.max(...values, 1);
        
        const barWidth = Math.min((chartWidth / keys.length) * 0.7, 60);
        const gap = chartWidth / keys.length;
        const defaultColors = ['#0a1e3c', '#1a3a6a', '#2a6b9c', '#4a9ad9', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];

        // Dibujar fondo
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Dibujar títulos
        ctx.fillStyle = '#0a1e3c';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Distribución de Egresados', width / 2, 24);

        // Dibujar ejes
        ctx.strokeStyle = '#cbd5e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Dibujar barras
        keys.forEach((key, i) => {
            const x = padding + i * gap + (gap - barWidth) / 2;
            const barHeight = (values[i] / maxValue) * chartHeight;
            const y = height - padding - barHeight;
            const color = colores ? colores[i % colores.length] : defaultColors[i % defaultColors.length];

            // Barra
            const gradient = ctx.createLinearGradient(x, y, x, height - padding);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color + '66');
            ctx.fillStyle = gradient;
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 8;
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.shadowBlur = 0;

            // Valor encima de la barra
            ctx.fillStyle = '#1e293b';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(values[i], x + barWidth / 2, y - 6);

            // Etiqueta debajo
            ctx.fillStyle = '#475569';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText(key.length > 15 ? key.substring(0, 12) + '...' : key, x + barWidth / 2, height - padding + 18);
        });

        // Líneas de guía horizontales
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * (4 - i);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round((maxValue / 4) * i), padding - 8, y + 3);
        }
        ctx.setLineDash([]);
    }

    /**
     * Dibuja un gráfico circular en un canvas
     */
    function drawPieChart(canvas, datos, colores = null) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2 + 10;
        const radius = Math.min(width, height) / 2 - 50;

        ctx.clearRect(0, 0, width, height);

        if (!datos || Object.keys(datos).length === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos para mostrar', width / 2, height / 2);
            return;
        }

        const keys = Object.keys(datos);
        const values = Object.values(datos);
        const total = values.reduce((a, b) => a + b, 0);
        const defaultColors = ['#0a1e3c', '#1a3a6a', '#2a6b9c', '#4a9ad9', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];

        let startAngle = -Math.PI / 2;

        // Dibujar fondo
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Título
        ctx.fillStyle = '#0a1e3c';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Distribución por Estado', width / 2, 24);

        // Dibujar sectores
        keys.forEach((key, i) => {
            const sliceAngle = (values[i] / total) * 2 * Math.PI;
            const color = colores ? colores[i % colores.length] : defaultColors[i % defaultColors.length];

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Etiqueta en el sector (si es suficientemente grande)
            if (sliceAngle > 0.3) {
                const midAngle = startAngle + sliceAngle / 2;
                const labelRadius = radius * 0.7;
                const x = centerX + Math.cos(midAngle) * labelRadius;
                const y = centerY + Math.sin(midAngle) * labelRadius;
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${Math.round((values[i] / total) * 100)}%`, x, y);
            }

            startAngle += sliceAngle;
        });

        // Leyenda
        let legendY = height - 30;
        const legendX = 20;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        keys.forEach((key, i) => {
            const color = colores ? colores[i % colores.length] : defaultColors[i % defaultColors.length];
            const x = legendX + (i % 2) * (width / 2 - 20);
            const y = legendY + Math.floor(i / 2) * 22;

            ctx.fillStyle = color;
            ctx.fillRect(x, y - 6, 12, 12);
            ctx.fillStyle = '#475569';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText(`${key} (${values[i]})`, x + 18, y + 1);
        });
    }

    /**
     * Genera el contenido HTML del reporte para PDF
     */
    function generateReportHTML(data) {
        const { egresados, acciones, evaluaciones, estadisticas, fechaGeneracion, filtros } = data;
        const { totalEgresados, conPlan, completados, promedioProgreso, porCarrera } = estadisticas;

        // Construir tabla de egresados
        let egresadosTable = '';
        egresados.forEach(e => {
            egresadosTable += `
                <tr>
                    <td>${e.egresado_nombre}</td>
                    <td>${e.carrera_nombre}</td>
                    <td>${e.entidad_nombre}</td>
                    <td>${e.tutor_nombre || 'Sin asignar'}</td>
                    <td>${e.plan_id ? `✅ ${e.anio_plan}` : '❌ Sin plan'}</td>
                    <td>${e.progreso || 0}%</td>
                </tr>
            `;
        });

        // Construir tabla de acciones (si hay)
        let accionesTable = '';
        if (acciones.length > 0) {
            acciones.forEach(a => {
                const egresado = egresados.find(e => e.id === a.egresado_id);
                accionesTable += `
                    <tr>
                        <td>${egresado ? egresado.egresado_nombre : 'N/A'}</td>
                        <td>${a.titulo}</td>
                        <td>${a.tipo || 'general'}</td>
                        <td><span style="color: ${a.estado === 'completado' ? '#1a8a4a' : a.estado === 'en_progreso' ? '#d48a2a' : '#b33a4a'};">${a.estado}</span></td>
                        <td>${a.fecha_limite || 'Sin fecha'}</td>
                    </tr>
                `;
            });
        }

        // Construir tabla de evaluaciones (si hay)
        let evaluacionesTable = '';
        if (evaluaciones.length > 0) {
            evaluaciones.forEach(ev => {
                const egresado = egresados.find(e => e.id === ev.egresado_id);
                evaluacionesTable += `
                    <tr>
                        <td>${egresado ? egresado.egresado_nombre : 'N/A'}</td>
                        <td>${ev.dimension}</td>
                        <td>⭐ ${ev.puntaje}/5</td>
                        <td>${ev.comentario || 'Sin comentarios'}</td>
                    </tr>
                `;
            });
        }

        // Construir distribución por carrera
        let carreraRows = '';
        Object.entries(porCarrera).forEach(([nombre, cantidad]) => {
            carreraRows += `
                <tr>
                    <td>${nombre}</td>
                    <td style="text-align:center;">${cantidad}</td>
                    <td>
                        <div style="background:#e2e8f0;border-radius:8px;height:12px;width:100%;max-width:200px;">
                            <div style="background:#0a1e3c;border-radius:8px;height:12px;width:${(cantidad/totalEgresados)*100}%;"></div>
                        </div>
                    </td>
                </tr>
            `;
        });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Inter', 'Segoe UI', sans-serif; padding: 20px; color: #1e293b; }
                    .header { text-align: center; border-bottom: 2px solid #0a1e3c; padding-bottom: 16px; margin-bottom: 20px; }
                    .header h1 { color: #0a1e3c; font-size: 24px; margin: 0; }
                    .header .subtitle { color: #64748b; font-size: 14px; }
                    .header .date { color: #94a3b8; font-size: 12px; }
                    .section { margin-bottom: 24px; }
                    .section-title { color: #0a1e3c; font-size: 18px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
                    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
                    .stat-card { background: #f8fafc; border-radius: 8px; padding: 12px 16px; text-align: center; border-left: 4px solid #0a1e3c; }
                    .stat-card .number { font-size: 24px; font-weight: 800; color: #0a1e3c; }
                    .stat-card .label { font-size: 12px; color: #64748b; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
                    table th { background: #f1f4f8; text-align: left; padding: 8px 12px; font-weight: 700; color: #334155; border-bottom: 2px solid #e2e8f0; }
                    table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
                    table tr:hover { background: #f8fafc; }
                    .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px; }
                    .badge-success { color: #1a8a4a; background: #d4edda; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
                    .badge-danger { color: #b33a4a; background: #f8d7da; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
                    .badge-warning { color: #856404; background: #fff3cd; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📚 SISPE - Reporte de Superación Profesional</h1>
                    <div class="subtitle">${filtros.entidadNombre || 'Todas las entidades'} · ${filtros.carreraNombre || 'Todas las carreras'}</div>
                    <div class="date">Generado: ${fechaGeneracion}</div>
                </div>

                <div class="section">
                    <div class="section-title">📊 Resumen General</div>
                    <div class="stats-grid">
                        <div class="stat-card"><div class="number">${totalEgresados}</div><div class="label">Total Egresados</div></div>
                        <div class="stat-card" style="border-left-color:#1a8a4a;"><div class="number">${conPlan}</div><div class="label">Con Plan Activo</div></div>
                        <div class="stat-card" style="border-left-color:#28a745;"><div class="number">${completados}</div><div class="label">Plan Completado</div></div>
                        <div class="stat-card" style="border-left-color:#2a6b9c;"><div class="number">${promedioProgreso}%</div><div class="label">Progreso Promedio</div></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">📈 Distribución por Carrera</div>
                    <table>
                        <thead><tr><th>Carrera</th><th style="text-align:center;">Cantidad</th><th>Progreso</th></tr></thead>
                        <tbody>${carreraRows || '<tr><td colspan="3" style="text-align:center;color:#94a3b8;">No hay datos disponibles</td></tr>'}</tbody>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">👥 Lista de Egresados</div>
                    <table>
                        <thead><tr><th>Nombre</th><th>Carrera</th><th>Entidad</th><th>Tutor</th><th>Plan</th><th>Progreso</th></tr></thead>
                        <tbody>${egresadosTable || '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No hay egresados</td></tr>'}</tbody>
                    </table>
                </div>

                ${accionesTable ? `
                <div class="section">
                    <div class="section-title">📋 Acciones del Plan</div>
                    <table>
                        <thead><tr><th>Egresado</th><th>Acción</th><th>Tipo</th><th>Estado</th><th>Fecha Límite</th></tr></thead>
                        <tbody>${accionesTable}</tbody>
                    </table>
                </div>
                ` : ''}

                ${evaluacionesTable ? `
                <div class="section">
                    <div class="section-title">⭐ Evaluaciones</div>
                    <table>
                        <thead><tr><th>Egresado</th><th>Dimensión</th><th>Puntaje</th><th>Comentario</th></tr></thead>
                        <tbody>${evaluacionesTable}</tbody>
                    </table>
                </div>
                ` : ''}

                <div class="footer">
                    <p>SISPE - Sistema de Preparación para el Empleo v1.0</p>
                    <p>UIJ - Universidad de la Isla de la Juventud · ${new Date().getFullYear()}</p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Genera un archivo Excel con múltiples hojas
     */
    function generateExcelData(data) {
        const { egresados, acciones, evaluaciones, estadisticas } = data;

        // Hoja 1: Egresados
        const egresadosData = egresados.map(e => ({
            'Nombre': e.egresado_nombre,
            'Email': e.email || '',
            'Carrera': e.carrera_nombre,
            'Entidad': e.entidad_nombre,
            'Tutor': e.tutor_nombre || 'Sin asignar',
            'Año Graduación': e.anio_graduacion || '',
            'Título de Oro': e.titulo_oro ? 'Sí' : 'No',
            'Graduado Integral': e.graduado_integral ? 'Sí' : 'No',
            'Plan Activo': e.plan_id ? 'Sí' : 'No',
            'Año Plan': e.anio_plan || '',
            'Progreso': `${e.progreso || 0}%`,
            'Estado Plan': e.plan_estado || 'Sin plan'
        }));

        // Hoja 2: Acciones
        const accionesData = acciones.map(a => {
            const egresado = egresados.find(e => e.id === a.egresado_id);
            return {
                'Egresado': egresado ? egresado.egresado_nombre : 'N/A',
                'Acción': a.titulo,
                'Descripción': a.descripcion || '',
                'Tipo': a.tipo || 'general',
                'Estado': a.estado,
                'Fecha Programada': a.fecha_programada || '',
                'Fecha Límite': a.fecha_limite || '',
                'Fecha Completado': a.fecha_completado || ''
            };
        });

        // Hoja 3: Evaluaciones
        const evaluacionesData = evaluaciones.map(ev => {
            const egresado = egresados.find(e => e.id === ev.egresado_id);
            return {
                'Egresado': egresado ? egresado.egresado_nombre : 'N/A',
                'Dimensión': ev.dimension,
                'Puntaje': ev.puntaje,
                'Comentario': ev.comentario || '',
                'Fecha': ev.fecha || ''
            };
        });

        // Hoja 4: Estadísticas
        const estadisticasData = [
            { 'Métrica': 'Total Egresados', 'Valor': estadisticas.totalEgresados },
            { 'Métrica': 'Con Plan Activo', 'Valor': estadisticas.conPlan },
            { 'Métrica': 'Plan Completado', 'Valor': estadisticas.completados },
            { 'Métrica': 'Progreso Alto (≥80%)', 'Valor': estadisticas.altoProgreso },
            { 'Métrica': 'Progreso Medio (50-79%)', 'Valor': estadisticas.medioProgreso },
            { 'Métrica': 'Progreso Bajo (1-49%)', 'Valor': estadisticas.bajoProgreso },
            { 'Métrica': 'Sin Iniciar', 'Valor': estadisticas.sinIniciar },
            { 'Métrica': 'Progreso Promedio', 'Valor': `${estadisticas.promedioProgreso}%` },
            { 'Métrica': 'Total Acciones', 'Valor': estadisticas.totalAcciones },
            { 'Métrica': 'Acciones Completadas', 'Valor': estadisticas.accionesCompletadas },
            { 'Métrica': 'Acciones Pendientes', 'Valor': estadisticas.accionesPendientes }
        ];

        // Hoja 5: Distribución por Carrera
        const carreraData = Object.entries(estadisticas.porCarrera).map(([nombre, cantidad]) => ({
            'Carrera': nombre,
            'Cantidad': cantidad
        }));

        return {
            'Egresados': egresadosData,
            'Acciones': accionesData,
            'Evaluaciones': evaluacionesData,
            'Estadísticas': estadisticasData,
            'Distribución_Carreras': carreraData
        };
    }

    // ---- FUNCIONES PÚBLICAS ----

    /**
     * Genera un reporte completo en PDF
     */
    async function generarReportePDF(filtros = {}) {
        try {
            NotificationsModule.showInfo('📄 Generando reporte en PDF...', 2000);

            // Obtener datos
            const data = await getReportData(filtros);

            if (data.estadisticas.totalEgresados === 0) {
                NotificationsModule.showWarning('No hay datos para generar el reporte.');
                return;
            }

            // Generar HTML del reporte
            const htmlContent = generateReportHTML(data);

            // Crear una ventana para imprimir en PDF
            const win = window.open('', '_blank', 'width=1000,height=800');
            if (!win) {
                NotificationsModule.showError('No se pudo abrir la ventana. Verifica que los pop-ups estén permitidos.');
                return;
            }

            win.document.write(htmlContent);
            win.document.close();

            // Esperar a que cargue el contenido
            setTimeout(() => {
                win.print();
            }, 500);

            NotificationsModule.showSuccess('✅ Reporte generado correctamente.');

        } catch (error) {
            console.error('Error al generar PDF:', error);
            NotificationsModule.showError('Error al generar el reporte.');
        }
    }

    /**
     * Genera un reporte en Excel
     */
    async function generarReporteExcel(filtros = {}) {
        try {
            NotificationsModule.showInfo('📊 Generando reporte en Excel...', 2000);

            // Verificar que la librería XLSX está disponible
            if (typeof XLSX === 'undefined') {
                NotificationsModule.showError('La librería XLSX no está disponible.');
                return;
            }

            // Obtener datos
            const data = await getReportData(filtros);

            if (data.estadisticas.totalEgresados === 0) {
                NotificationsModule.showWarning('No hay datos para generar el reporte.');
                return;
            }

            // Generar datos para Excel
            const excelData = generateExcelData(data);

            // Crear libro de trabajo
            const wb = XLSX.utils.book_new();

            // Agregar cada hoja
            Object.entries(excelData).forEach(([nombre, datos]) => {
                const ws = XLSX.utils.json_to_sheet(datos);
                XLSX.utils.book_append_sheet(wb, ws, nombre);
            });

            // Generar archivo y descargar
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `SISPE_Reporte_${fecha}.xlsx`;
            
            XLSX.writeFile(wb, nombreArchivo);

            NotificationsModule.showSuccess(`✅ Reporte Excel generado: ${nombreArchivo}`);

        } catch (error) {
            console.error('Error al generar Excel:', error);
            NotificationsModule.showError('Error al generar el reporte en Excel.');
        }
    }

    /**
     * Genera un reporte simplificado (resumen)
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

            // Mostrar en una ventana
            const win = window.open('', '_blank', 'width=600,height=500');
            if (win) {
                win.document.write(`
                    <html><head><title>Resumen SISPE</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; white-space: pre-wrap; background: #f8fafc; }
                        .container { max-width: 700px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    </style>
                    </head>
                    <body><div class="container">${mensaje}</div></body></html>
                `);
                win.document.close();
            }

            NotificationsModule.showSuccess('✅ Resumen generado correctamente.');

        } catch (error) {
            console.error('Error al generar resumen:', error);
            NotificationsModule.showError('Error al generar el resumen.');
        }
    }

    /**
     * Genera un gráfico en una ventana emergente
     */
    async function generarGrafico(filtros = {}) {
        try {
            const data = await getReportData(filtros);
            const { estadisticas } = data;

            if (Object.keys(estadisticas.porCarrera).length === 0) {
                NotificationsModule.showWarning('No hay datos para generar gráficos.');
                return;
            }

            // Crear ventana para mostrar gráficos
            const win = window.open('', '_blank', 'width=800,height=600');
            if (!win) {
                NotificationsModule.showError('No se pudo abrir la ventana. Verifica que los pop-ups estén permitidos.');
                return;
            }

            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Gráficos - SISPE</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 20px; }
                        .container { max-width: 900px; margin: 0 auto; background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                        h2 { color: #0a1e3c; text-align: center; margin-bottom: 8px; }
                        .subtitle { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 24px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .chart-box { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px; }
                        .chart-box h3 { color: #0a1e3c; font-size: 16px; margin: 0 0 12px 0; text-align: center; }
                        canvas { width: 100% !important; height: auto !important; max-height: 280px; }
                        @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>📊 Gráficos de Superación Profesional</h2>
                        <div class="subtitle">${filtros.entidadNombre || 'Todas las entidades'} · ${new Date().toLocaleDateString('es-CU')}</div>
                        <div class="grid">
                            <div class="chart-box">
                                <h3>Distribución por Carrera</h3>
                                <canvas id="barChart" width="400" height="280"></canvas>
                            </div>
                            <div class="chart-box">
                                <h3>Estado del Plan</h3>
                                <canvas id="pieChart" width="400" height="280"></canvas>
                            </div>
                        </div>
                        <div style="text-align:center;margin-top:16px;">
                            <button onclick="window.close()" style="padding:10px 24px;background:#0a1e3c;color:white;border:none;border-radius:8px;cursor:pointer;">Cerrar</button>
                            <button onclick="window.print()" style="padding:10px 24px;background:#2a6b9c;color:white;border:none;border-radius:8px;cursor:pointer;margin-left:8px;">🖨️ Imprimir</button>
                        </div>
                    </div>
                </body>
                </html>
            `);

            win.document.close();

            // Esperar a que cargue el DOM y dibujar los gráficos
            setTimeout(() => {
                const barCanvas = win.document.getElementById('barChart');
                const pieCanvas = win.document.getElementById('pieChart');

                if (barCanvas) {
                    drawBarChart(barCanvas, estadisticas.porCarrera);
                }
                if (pieCanvas) {
                    const estadoData = {
                        '✅ Completado': estadisticas.completados,
                        '🌟 Alto (≥80%)': estadisticas.altoProgreso,
                        '📈 Medio (50-79%)': estadisticas.medioProgreso,
                        '📉 Bajo (1-49%)': estadisticas.bajoProgreso,
                        '⚪ Sin Iniciar': estadisticas.sinIniciar
                    };
                    const colores = ['#28a745', '#1a8a4a', '#ffc107', '#dc3545', '#94a3b8'];
                    drawPieChart(pieCanvas, estadoData, colores);
                }
            }, 300);

        } catch (error) {
            console.error('Error al generar gráficos:', error);
            NotificationsModule.showError('Error al generar los gráficos.');
        }
    }

    // ---- EXPOSICIÓN PÚBLICA ----
    return {
        generarReportePDF: generarReportePDF,
        generarReporteExcel: generarReporteExcel,
        generarReporteResumen: generarReporteResumen,
        generarGrafico: generarGrafico,
        getReportData: getReportData,
        drawBarChart: drawBarChart,
        drawPieChart: drawPieChart
    };

})();

// Exportar para uso global
window.ReportsModule = ReportsModule;

console.log('📊 Módulo de Reportes Avanzados cargado correctamente.');
