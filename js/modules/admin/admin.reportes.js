// ============================================================
// SISPE - admin.reportes.js
// Reportes y Estadísticas
// RUTA: js/modules/admin/admin.reportes.js
// ============================================================

const AdminReportes = (function() {
    'use strict';

    // ============================================================
    // RENDERIZAR REPORTES
    // ============================================================
    async function render() {
        if (!AdminCore.isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var stats = await AdminCore.getEstadisticasGenerales();

        return `
            <div class="page-header">
                <h2><i class="fas fa-file-pdf"></i> Reportes del Sistema</h2>
                <div class="breadcrumb">Estad&iacute;sticas generales</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:18px;margin-bottom:24px;">
                <div class="stat-card">
                    <div class="stat-icon">&#128100;</div>
                    <div class="number">${stats.totalUsuarios}</div>
                    <div class="label">Usuarios</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">&#128104;&#8205;&#127891;</div>
                    <div class="number">${stats.totalGraduados}</div>
                    <div class="label">Graduados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">&#128105;&#8205;&#127979;</div>
                    <div class="number">${stats.totalDocentes}</div>
                    <div class="label">Docentes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">&#127970;</div>
                    <div class="number">${stats.totalEntidades}</div>
                    <div class="label">Entidades</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-chart-bar"></i> Reporte General</div>
                <div style="padding:12px 0;">
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Total Usuarios</span>
                        <span class="badge badge-primary">${stats.totalUsuarios}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Total Graduados</span>
                        <span class="badge badge-success">${stats.totalGraduados}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Total Docentes</span>
                        <span class="badge badge-info">${stats.totalDocentes}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;">
                        <span>Total Entidades</span>
                        <span class="badge badge-warning">${stats.totalEntidades}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
        render: render
    };

})();

window.AdminReportes = AdminReportes;
console.log('&#9989; AdminReportes cargado correctamente.');