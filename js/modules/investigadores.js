// ============================================================
// SISPE - investigadores.js
// Módulo de Gestión de Investigadores
// RUTA: js/modules/investigadores.js
// ============================================================

const InvestigadoresModule = (function() {
    'use strict';

    function navigate(page, breadcrumb) {
        var container = document.getElementById('page-container');
        if (!container) return;

        var content = '';

        switch(page) {
            case 'investigadores':
                content = renderInvestigadores();
                break;
            default:
                content = renderInvestigadores();
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
            await cargarInvestigadores();
            await cargarEstadisticas();
        } catch (error) {
            console.error('Error al cargar investigadores:', error);
        }
    }

    async function cargarInvestigadores() {
        var container = document.getElementById('lista-investigadores');
        if (!container) return;

        var investigadores = await DBModule.query(
            `SELECT * FROM docentes WHERE es_investigador_proyecto = 1 ORDER BY apellidos`
        );

        if (investigadores.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay investigadores registrados.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Nombre</th><th>Apellidos</th><th>Categor\u00eda Cient\u00edfica</th><th>Rol en el Proyecto</th><th>Email</th></tr></thead><tbody>';
        investigadores.forEach(function(inv, i) {
            html += `<tr>
                <td>${i + 1}</td>
                <td><strong>${inv.nombre}</strong></td>
                <td>${inv.apellidos}</td>
                <td><span class="badge badge-purple">${inv.categoria_cientifica || 'N/A'}</span></td>
                <td><span class="badge badge-info">${inv.rol_proyecto || 'Investigador'}</span></td>
                <td>${inv.email_institucional || 'N/A'}</td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    async function cargarEstadisticas() {
        try {
            var total = await DBModule.query('SELECT COUNT(*) as total FROM docentes WHERE es_investigador_proyecto = 1');
            var el = document.getElementById('total-investigadores');
            if (el) el.textContent = total[0]?.total || 0;

            var porCategoria = await DBModule.query(
                `SELECT categoria_cientifica, COUNT(*) as total 
                 FROM docentes 
                 WHERE es_investigador_proyecto = 1 
                 GROUP BY categoria_cientifica`
            );
            var container = document.getElementById('investigadores-por-categoria');
            if (container) {
                var html = '';
                porCategoria.forEach(function(c) {
                    var emoji = c.categoria_cientifica === 'Dr.C' ? '👨‍🔬' : c.categoria_cientifica === 'Ms.C' ? '👩‍🔬' : '🧑‍🏫';
                    html += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;">
                        <span>${emoji} ${c.categoria_cientifica || 'N/A'}</span>
                        <span class="badge badge-primary">${c.total}</span>
                    </div>`;
                });
                container.innerHTML = html || '<p class="text-muted">Sin datos</p>';
            }
        } catch (error) {
            console.error('Error en estadísticas:', error);
        }
    }

    function renderInvestigadores() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-flask"></i> Investigadores del Proyecto</h2>
                <div class="breadcrumb">UIJ - Universidad de la Isla de la Juventud</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 3fr;gap:20px;margin-bottom:20px;">
                <div class="card">
                    <div class="card-title"><i class="fas fa-chart-pie"></i> Estad\u00edsticas</div>
                    <div style="padding:8px 0;">
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0;">
                            <span>Total Investigadores</span>
                            <span class="badge badge-primary" id="total-investigadores">0</span>
                        </div>
                    </div>
                    <div style="margin-top:12px;">
                        <div class="card-title" style="font-size:14px;"><i class="fas fa-layer-group"></i> Por Categor\u00eda</div>
                        <div id="investigadores-por-categoria"><p class="text-muted">Cargando...</p></div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><i class="fas fa-list"></i> Lista de Investigadores</div>
                    <div id="lista-investigadores">
                        <p class="text-muted">Cargando investigadores...</p>
                    </div>
                </div>
            </div>
        `;
    }

    return {
        navigate: navigate
    };

})();

window.InvestigadoresModule = InvestigadoresModule;
console.log('👨‍🔬 Módulo de Investigadores cargado correctamente.');