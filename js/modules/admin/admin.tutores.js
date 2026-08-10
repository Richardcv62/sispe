// ============================================================
// SISPE - admin.tutores.js
// Asignación de Tutores
// RUTA: js/modules/admin/admin.tutores.js
// ============================================================

const AdminTutores = (function() {
    'use strict';

    // ============================================================
    // MOSTRAR ASIGNACIÓN DE TUTORES
    // ============================================================
    function mostrarAsignacion(breadcrumbHtml) {
        var container = document.getElementById('page-container');
        if (!container) return;

        DBModule.query(
            `SELECT e.*, u.nombre as egresado_nombre, c.nombre as carrera_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             WHERE e.tutor_id IS NULL OR e.tutor_id = 0
             ORDER BY u.nombre`
        ).then(function(egresados) {
            DBModule.query(
                `SELECT t.*, u.nombre as tutor_nombre 
                 FROM tutores t 
                 JOIN usuarios u ON t.usuario_id = u.id 
                 ORDER BY u.nombre`
            ).then(function(tutores) {
                var html = `
                    <div class="page-header">
                        <h2><i class="fas fa-user-graduate"></i> Asignar Tutores a Egresados</h2>
                        <div class="breadcrumb">Asignaci&oacute;n de tutores</div>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fas fa-users"></i> Egresados sin tutor</div>
                        ${egresados.length === 0 ? 
                            '<p class="text-muted">Todos los egresados tienen tutor asignado.</p>' :
                            `<div class="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Egresado</th>
                                            <th>Carrera</th>
                                            <th>Asignar Tutor</th>
                                            <th style="text-align:center;">Acci&oacute;n</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${egresados.map(function(e) {
                                            return `<tr>
                                                <td><strong>${e.egresado_nombre}</strong></td>
                                                <td>${e.carrera_nombre}</td>
                                                <td>
                                                    <select id="tutor-select-${e.id}" class="tutor-select" style="padding:6px 10px;border:2px solid #e2e8f0;border-radius:8px;">
                                                        <option value="">Selecciona un tutor...</option>
                                                        ${tutores.map(function(t) {
                                                            return `<option value="${t.id}">${t.tutor_nombre}</option>`;
                                                        }).join('')}
                                                    </select>
                                                </td>
                                                <td style="text-align:center;">
                                                    <button class="btn btn-sm btn-primary" onclick="AdminTutores.asignar(${e.id})">
                                                        <i class="fas fa-check"></i> Asignar
                                                    </button>
                                                </td>
                                            </tr>`;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>`
                        }
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fas fa-users"></i> Egresados con tutor asignado</div>
                        <div id="egresados-con-tutor">
                            <p class="text-muted">Cargando...</p>
                        </div>
                    </div>
                `;

                if (breadcrumbHtml) {
                    container.innerHTML = breadcrumbHtml + html;
                } else {
                    container.innerHTML = html;
                }

                cargarEgresadosConTutor();
            });
        });
    }

    // ============================================================
    // CARGAR EGRESADOS CON TUTOR
    // ============================================================
    function cargarEgresadosConTutor() {
        DBModule.query(
            `SELECT e.*, u.nombre as egresado_nombre, c.nombre as carrera_nombre, tu.nombre as tutor_nombre 
             FROM egresados e 
             JOIN usuarios u ON e.usuario_id = u.id 
             JOIN carreras c ON e.carrera_id = c.id 
             LEFT JOIN tutores t ON e.tutor_id = t.id 
             LEFT JOIN usuarios tu ON t.usuario_id = tu.id 
             WHERE e.tutor_id IS NOT NULL AND e.tutor_id != 0
             ORDER BY u.nombre`
        ).then(function(egresados) {
            var container = document.getElementById('egresados-con-tutor');
            if (!container) return;

            if (egresados.length === 0) {
                container.innerHTML = '<p class="text-muted">No hay egresados con tutor asignado.</p>';
                return;
            }

            var html = `<div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Egresado</th>
                            <th>Carrera</th>
                            <th>Tutor</th>
                            <th style="text-align:center;">Acci&oacute;n</th>
                        </tr>
                    </thead>
                    <tbody>`;
            egresados.forEach(function(e) {
                html += `<tr>
                    <td><strong>${e.egresado_nombre}</strong></td>
                    <td>${e.carrera_nombre}</td>
                    <td>${e.tutor_nombre || 'Sin asignar'}</td>
                    <td style="text-align:center;">
                        <button class="btn btn-sm btn-danger" onclick="AdminTutores.remover(${e.id})">
                            <i class="fas fa-times"></i> Remover
                        </button>
                    </td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
            container.innerHTML = html;
        });
    }

    // ============================================================
    // ASIGNAR TUTOR
    // ============================================================
    function asignar(egresadoId) {
        var select = document.getElementById('tutor-select-' + egresadoId);
        var tutorId = select.value;
        if (!tutorId) {
            ModalModule.warning('Selecciona un tutor para asignar.');
            return;
        }
        ModalModule.confirm('&iquest;Asignar este tutor al egresado?', 'Asignar Tutor').then(function(confirmado) {
            if (!confirmado) return;
            DBModule.execute('UPDATE egresados SET tutor_id = ? WHERE id = ?', [tutorId, egresadoId])
                .then(function() {
                    ModalModule.success('Tutor asignado correctamente.');
                    mostrarAsignacion();
                }).catch(function(error) {
                    ModalModule.error('Error al asignar tutor: ' + error.message);
                });
        });
    }

    // ============================================================
    // REMOVER TUTOR
    // ============================================================
    function remover(egresadoId) {
        ModalModule.confirm('&iquest;Est&aacute;s seguro de que quieres remover el tutor de este egresado?', 'Remover Tutor').then(function(confirmado) {
            if (!confirmado) return;
            DBModule.execute('UPDATE egresados SET tutor_id = NULL WHERE id = ?', [egresadoId])
                .then(function() {
                    ModalModule.success('Tutor removido correctamente.');
                    mostrarAsignacion();
                }).catch(function(error) {
                    ModalModule.error('Error al remover tutor: ' + error.message);
                });
        });
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
        mostrarAsignacion: mostrarAsignacion,
        asignar: asignar,
        remover: remover
    };

})();

window.AdminTutores = AdminTutores;
console.log('&#9989; AdminTutores cargado correctamente.');