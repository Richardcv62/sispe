// ============================================================
// SISPE - admin.investigadores.js
// Gestión de Investigadores del Proyecto
// RUTA: js/modules/admin/admin.investigadores.js
// ============================================================

const AdminInvestigadores = (function() {
    'use strict';

    // ============================================================
    // RENDERIZAR INVESTIGADORES
    // ============================================================
    async function render() {
        if (!AdminCore.isAdmin()) {
            return '<p class="text-muted">Acceso denegado.</p>';
        }

        var investigadores = await DBModule.query(
            `SELECT * FROM docentes WHERE es_investigador_proyecto = 1 ORDER BY apellidos`
        );

        var html = `
            <div class="page-header">
                <h2><i class="fas fa-flask"></i> Investigadores del Proyecto</h2>
                <div class="breadcrumb">${investigadores.length} investigadores registrados</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-list"></i> Lista de Investigadores</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>Categor&iacute;a</th>
                                <th>Rol en el Proyecto</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (investigadores.length === 0) {
            html += '<tr><td colspan="6" class="text-center text-muted">No hay investigadores registrados.</td></tr>';
        } else {
            for (var i = 0; i < investigadores.length; i++) {
                var inv = investigadores[i];
                var categoria = inv.categoria_cientifica || inv.categoria_docente || 'N/A';
                var rol = inv.rol_proyecto || 'Investigador';
                html += `<tr>
                    <td>${i + 1}</td>
                    <td><strong>${inv.nombre}</strong></td>
                    <td>${inv.apellidos}</td>
                    <td><span class="badge badge-purple">${categoria}</span></td>
                    <td><span class="badge badge-info">${rol}</span></td>
                    <td>${inv.email_institucional || 'N/A'}</td>
                </tr>`;
            }
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fas fa-chart-pie"></i> Estad&iacute;sticas</div>
                <div style="padding:12px 0;">
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                        <span>Total Investigadores</span>
                        <span class="badge badge-primary">${investigadores.length}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                        <span>&#128300; Dr.C</span>
                        <span class="badge badge-purple">${investigadores.filter(i => i.categoria_cientifica === 'Dr.C').length}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                        <span>&#128300; Ms.C</span>
                        <span class="badge badge-info">${investigadores.filter(i => i.categoria_cientifica === 'Ms.C').length}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;">
                        <span>&#128105;&#8205;&#127979; Lic.</span>
                        <span class="badge badge-warning">${investigadores.filter(i => i.categoria_cientifica === 'Lic.').length}</span>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
        render: render
    };

})();

window.AdminInvestigadores = AdminInvestigadores;
console.log('&#9989; AdminInvestigadores cargado correctamente.');