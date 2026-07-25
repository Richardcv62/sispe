// ============================================================
// SISPE - proyecto.js
// Módulo del Proyecto Universidad-Sociedad
// RUTA: js/modules/proyecto.js
// ============================================================

const ProyectoModule = (function() {
    'use strict';

    function navigate(page, breadcrumb) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = '';

        switch(page) {
            case 'proyecto':
                content = renderDashboard();
                break;
            case 'objetivos':
                content = renderObjetivos();
                break;
            default:
                content = renderDashboard();
        }

        if (breadcrumb) {
            container.innerHTML = breadcrumb + content;
        } else {
            container.innerHTML = content;
        }
        setTimeout(loadData, 200);
    }

    async function loadData() {
        try {
            await cargarEstadisticas();
            await cargarObjetivos();
            await cargarUltimosProductos();
        } catch (error) {
            console.error('Error al cargar datos del proyecto:', error);
        }
    }

    async function cargarEstadisticas() {
        try {
            var totalEntidades = await DBModule.query('SELECT COUNT(*) as total FROM entidades');
            var totalInvestigadores = await DBModule.query('SELECT COUNT(*) as total FROM docentes WHERE es_investigador_proyecto = 1');
            var totalCarreras = await DBModule.query('SELECT COUNT(*) as total FROM carreras');
            var totalObjetivos = await DBModule.query('SELECT COUNT(*) as total FROM objetivos_proyecto');
            var totalProductos = await DBModule.query('SELECT COUNT(*) as total FROM productos_cientificos');

            var el = document.getElementById('total-entidades-proyecto');
            if (el) el.textContent = totalEntidades[0]?.total || 0;

            el = document.getElementById('total-investigadores-proyecto');
            if (el) el.textContent = totalInvestigadores[0]?.total || 0;

            el = document.getElementById('total-carreras-proyecto');
            if (el) el.textContent = totalCarreras[0]?.total || 0;

            el = document.getElementById('total-objetivos-proyecto');
            if (el) el.textContent = totalObjetivos[0]?.total || 0;

            el = document.getElementById('total-productos-proyecto');
            if (el) el.textContent = totalProductos[0]?.total || 0;

        } catch (error) {
            console.error('Error en estadísticas:', error);
        }
    }

    async function cargarObjetivos() {
        var container = document.getElementById('lista-objetivos');
        if (!container) return;

        var objetivos = await DBModule.query(
            'SELECT * FROM objetivos_proyecto ORDER BY numero'
        );

        if (objetivos.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay objetivos registrados.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Objetivo</th><th>Estado</th><th>Fecha Inicio</th><th>Fecha Fin Estimada</th></tr></thead><tbody>';
        objetivos.forEach(function(o) {
            var estadoClass = o.estado === 'completado' ? 'success' : o.estado === 'en_progreso' ? 'warning' : 'danger';
            var estadoText = o.estado === 'completado' ? '✅ Completado' : o.estado === 'en_progreso' ? '🔄 En progreso' : '⏳ Pendiente';
            html += `<tr>
                <td><span class="badge badge-primary">${o.numero}</span></td>
                <td>${o.descripcion}</td>
                <td><span class="badge badge-${estadoClass}">${estadoText}</span></td>
                <td>${o.fecha_inicio || 'N/A'}</td>
                <td>${o.fecha_fin_estimada || 'N/A'}</td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async function cargarUltimosProductos() {
        var container = document.getElementById('ultimos-productos');
        if (!container) return;

        var productos = await DBModule.query(
            `SELECT p.*, d.nombre || ' ' || d.apellidos as autor 
             FROM productos_cientificos p 
             LEFT JOIN docentes d ON p.docente_id = d.id 
             ORDER BY p.created_at DESC 
             LIMIT 5`
        );

        if (productos.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay productos científicos registrados.</p>';
            return;
        }

        var html = '';
        productos.forEach(function(p) {
            var tipoEmoji = p.tipo === 'articulo' ? '📄' : p.tipo === 'ponencia' ? '🎤' : p.tipo === 'tesis_maestria' ? '🎓' : '📝';
            html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                <div>
                    <div><strong>${tipoEmoji} ${p.titulo}</strong></div>
                    <div style="font-size:12px;color:#64748b;">${p.autor || 'Sin autor'} · ${p.revista_evento || ''}</div>
                </div>
                <div><span class="badge badge-${p.estado === 'publicado' ? 'success' : p.estado === 'presentado' ? 'warning' : 'info'}">${p.estado || 'En elaboración'}</span></div>
            </div>`;
        });
        container.innerHTML = html;
    }

    function renderDashboard() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-graduation-cap"></i> Proyecto Universidad-Sociedad</h2>
                <div class="breadcrumb">UIJ - Isla de la Juventud</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
                <div class="stat-card" style="border-left:4px solid #0a1e3c;">
                    <div class="stat-icon">🏢</div>
                    <div class="number" id="total-entidades-proyecto">0</div>
                    <div class="label">Entidades</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #7c3aed;">
                    <div class="stat-icon">👨‍🔬</div>
                    <div class="number" id="total-investigadores-proyecto">0</div>
                    <div class="label">Investigadores</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #059669;">
                    <div class="stat-icon">🎓</div>
                    <div class="number" id="total-carreras-proyecto">0</div>
                    <div class="label">Carreras</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #d97706;">
                    <div class="stat-icon">🎯</div>
                    <div class="number" id="total-objetivos-proyecto">0</div>
                    <div class="label">Objetivos</div>
                </div>
                <div class="stat-card" style="border-left:4px solid #2563eb;">
                    <div class="stat-icon">📝</div>
                    <div class="number" id="total-productos-proyecto">0</div>
                    <div class="label">Productos</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-list-check"></i> Objetivos del Proyecto</div>
                    <div id="lista-objetivos">
                        <p class="text-muted">Cargando objetivos...</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-clock-rotate-left"></i> \u00daltimos Productos</div>
                    <div id="ultimos-productos">
                        <p class="text-muted">Cargando productos...</p>
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px;">
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="ProyectoModule.navigate('investigadores')">
                    <div style="font-size:40px;">👨‍🔬</div>
                    <h4>Investigadores</h4>
                    <p style="font-size:12px;color:#64748b;">Ver todos los investigadores</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="ProyectoModule.navigate('objetivos')">
                    <div style="font-size:40px;">🎯</div>
                    <h4>Objetivos</h4>
                    <p style="font-size:12px;color:#64748b;">Ver todos los objetivos</p>
                </div>
                <div class="card" style="text-align:center;cursor:pointer;padding:20px;" onclick="ProyectoModule.navigate('eventos')">
                    <div style="font-size:40px;">📅</div>
                    <h4>Eventos</h4>
                    <p style="font-size:12px;color:#64748b;">Eventos del proyecto</p>
                </div>
            </div>
        `;
    }

    function renderObjetivos() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-bullseye"></i> Objetivos del Proyecto</h2>
                <div class="breadcrumb">11 objetivos estratégicos</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Todos los Objetivos</div>
                <div id="lista-objetivos">
                    <p class="text-muted">Cargando objetivos...</p>
                </div>
            </div>
        `;
    }

    return {
        navigate: navigate
    };

})();

window.ProyectoModule = ProyectoModule;
console.log('📋 Módulo del Proyecto cargado correctamente.');