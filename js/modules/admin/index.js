// ============================================================
// SISPE - admin.js (Punto de Entrada Unificado)
// VERSIÓN CORREGIDA - CON VERIFICACIÓN DE SUBMÓDULOS
// RUTA: js/modules/admin/index.js
// ============================================================

// ============================================================
// 🔥 PRIMERO: Verificar que todos los submódulos estén cargados
// ============================================================
(function verificarSubmodulos() {
    console.log('📦 Verificando submódulos de Admin...');
    
    var submodulos = [
        { name: 'AdminCore', obj: window.AdminCore },
        { name: 'AdminUsuarios', obj: window.AdminUsuarios },
        { name: 'AdminGraduados', obj: window.AdminGraduados },
        { name: 'AdminDocentes', obj: window.AdminDocentes },
        { name: 'AdminEntidades', obj: window.AdminEntidades },
        { name: 'AdminCarreras', obj: window.AdminCarreras },
        { name: 'AdminTutores', obj: window.AdminTutores },
        { name: 'AdminInvestigadores', obj: window.AdminInvestigadores },
        { name: 'AdminReportes', obj: window.AdminReportes },
        { name: 'AdminExcel', obj: window.AdminExcel }
    ];
    
    var todosCargados = true;
    submodulos.forEach(function(s) {
        if (typeof s.obj === 'undefined') {
            console.warn(`⚠️ Submódulo ${s.name} NO ENCONTRADO`);
            todosCargados = false;
        } else {
            console.log(`✅ ${s.name} cargado correctamente`);
        }
    });
    
    if (!todosCargados) {
        console.warn('⚠️ Algunos submódulos no están disponibles');
        console.warn('⚠️ Verifica que todos los scripts de admin estén en index.html');
        console.warn('⚠️ Y que estén declarados con "var" no con "const"');
    } else {
        console.log('✅ Todos los submódulos de Admin están disponibles');
    }
})();

// ============================================================
// ADMIN MODULE - Punto de entrada principal
// ============================================================

var AdminModule = (function() {
    'use strict';

    // ============================================================
    // NAVEGACIÓN PRINCIPAL
    // ============================================================
    function navigate(page, breadcrumb) {
        console.log('📊 AdminModule.navigate llamado con:', page);
        var container = document.getElementById('page-container');
        if (!container) {
            console.error('❌ page-container no encontrado');
            return;
        }

        // Si AdminCore no está disponible, mostrar error
        if (typeof AdminCore === 'undefined') {
            console.error('❌ AdminCore NO está disponible');
            container.innerHTML = `
                <div class="card" style="border:2px solid #b33a4a;padding:20px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
                    <h3 style="color:#b33a4a;">Error: AdminCore no cargado</h3>
                    <p style="color:#64748b;">El módulo AdminCore no se ha cargado correctamente.</p>
                    <p style="color:#64748b;font-size:13px;">Verifica que admin.core.js esté en index.html</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top:12px;">
                        <i class="fas fa-sync-alt"></i> Recargar página
                    </button>
                </div>
            `;
            return;
        }

        var breadcrumbHtml = breadcrumb || AdminCore.generateBreadcrumb(page);

        // ============================================================
        // DASHBOARD
        // ============================================================
        if (page === 'dashboard') {
            try {
                console.log('📊 Cargando Dashboard de Admin...');
                var dashboardContent = AdminCore.renderDashboard();
                container.innerHTML = breadcrumbHtml + dashboardContent;
                setTimeout(AdminCore.assignEvents, 100);
                setTimeout(loadData, 200);
                console.log('✅ Dashboard de Admin cargado correctamente');
            } catch (error) {
                console.error('❌ Error al cargar dashboard:', error);
                container.innerHTML = breadcrumbHtml + `
                    <div class="card" style="border:2px solid #b33a4a;padding:20px;text-align:center;">
                        <div style="font-size:48px;margin-bottom:12px;">❌</div>
                        <h3 style="color:#b33a4a;">Error al cargar Dashboard</h3>
                        <p style="color:#64748b;">${error.message}</p>
                    </div>
                `;
            }
            return;
        }

        // ============================================================
        // USUARIOS
        // ============================================================
        if (page === 'usuarios') {
            if (typeof AdminUsuarios === 'undefined') {
                console.error('❌ AdminUsuarios NO está disponible');
                container.innerHTML = breadcrumbHtml + `
                    <div class="card" style="border:2px solid #b33a4a;padding:20px;text-align:center;">
                        <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
                        <h3 style="color:#b33a4a;">Error: AdminUsuarios no cargado</h3>
                        <p style="color:#64748b;">El módulo AdminUsuarios no se ha cargado correctamente.</p>
                        <p style="color:#64748b;font-size:13px;">Verifica que admin.usuarios.js esté en index.html</p>
                    </div>
                `;
                return;
            }
            try {
                console.log('📊 Cargando Usuarios...');
                AdminUsuarios.render('todos').then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(AdminCore.assignEvents, 100);
                    console.log('✅ Usuarios cargado correctamente');
                }).catch(function(err) {
                    console.error('❌ Error al cargar usuarios:', err);
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar usuarios: ' + err.message + '</p>';
                });
            } catch (error) {
                console.error('❌ Error en usuarios:', error);
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar usuarios: ' + error.message + '</p>';
            }
            return;
        }

        // ============================================================
        // GRADUADOS
        // ============================================================
        if (page === 'graduados') {
            if (typeof AdminGraduados === 'undefined') {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error: Módulo de Graduados no disponible.</p>';
                return;
            }
            try {
                console.log('📊 Cargando Graduados...');
                AdminGraduados.render().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(AdminCore.assignEvents, 100);
                    console.log('✅ Graduados cargado correctamente');
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar graduados: ' + err.message + '</p>';
                });
            } catch (error) {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar graduados: ' + error.message + '</p>';
            }
            return;
        }

        // ============================================================
        // DOCENTES
        // ============================================================
        if (page === 'docentes') {
            if (typeof AdminDocentes === 'undefined') {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error: Módulo de Docentes no disponible.</p>';
                return;
            }
            try {
                console.log('📊 Cargando Docentes...');
                AdminDocentes.render().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(AdminCore.assignEvents, 100);
                    console.log('✅ Docentes cargado correctamente');
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar docentes: ' + err.message + '</p>';
                });
            } catch (error) {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar docentes: ' + error.message + '</p>';
            }
            return;
        }

        // ============================================================
        // ENTIDADES
        // ============================================================
        if (page === 'entidades') {
            if (typeof AdminEntidades === 'undefined') {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error: Módulo de Entidades no disponible.</p>';
                return;
            }
            try {
                console.log('📊 Cargando Entidades...');
                AdminEntidades.render().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(AdminCore.assignEvents, 100);
                    console.log('✅ Entidades cargado correctamente');
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar entidades: ' + err.message + '</p>';
                });
            } catch (error) {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar entidades: ' + error.message + '</p>';
            }
            return;
        }

        // ============================================================
        // CARRERAS
        // ============================================================
        if (page === 'carreras') {
            if (typeof AdminCarreras === 'undefined') {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error: Módulo de Carreras no disponible.</p>';
                return;
            }
            try {
                console.log('📊 Cargando Carreras...');
                AdminCarreras.render().then(function(html) {
                    container.innerHTML = breadcrumbHtml + html;
                    setTimeout(AdminCore.assignEvents, 100);
                    console.log('✅ Carreras cargado correctamente');
                }).catch(function(err) {
                    container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar carreras: ' + err.message + '</p>';
                });
            } catch (error) {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar carreras: ' + error.message + '</p>';
            }
            return;
        }

        // ============================================================
        // ASIGNAR TUTORES
        // ============================================================
        if (page === 'asignar-tutores') {
            if (typeof AdminTutores === 'undefined') {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error: Módulo de Asignación de Tutores no disponible.</p>';
                return;
            }
            AdminTutores.mostrarAsignacion(breadcrumbHtml);
            return;
        }

        // ============================================================
        // INVESTIGADORES
        // ============================================================
        if (page === 'investigadores') {
            if (typeof AdminInvestigadores === 'undefined') {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error: Módulo de Investigadores no disponible.</p>';
                return;
            }
            AdminInvestigadores.render().then(function(html) {
                container.innerHTML = breadcrumbHtml + html;
                setTimeout(AdminCore.assignEvents, 100);
            }).catch(function(err) {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar investigadores: ' + err.message + '</p>';
            });
            return;
        }

        // ============================================================
        // REPORTES
        // ============================================================
        if (page === 'reportes') {
            if (typeof AdminReportes === 'undefined') {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error: Módulo de Reportes no disponible.</p>';
                return;
            }
            AdminReportes.render().then(function(html) {
                container.innerHTML = breadcrumbHtml + html;
                setTimeout(AdminCore.assignEvents, 100);
            }).catch(function(err) {
                container.innerHTML = breadcrumbHtml + '<p class="text-muted">Error al cargar reportes: ' + err.message + '</p>';
            });
            return;
        }

        // ============================================================
        // MÓDULOS FUNCIONALES
        // ============================================================
        if (page === 'competencias' || page === 'cursos' || page === 'eventos' || 
            page === 'proyecto' || page === 'chat' || page === 'calendario') {
            
            var moduleMap = {
                'competencias': window.CompetenciasModule,
                'cursos': window.CursosModule,
                'eventos': window.EventosModule,
                'proyecto': window.ProyectoModule,
                'chat': window.ChatModule,
                'calendario': window.CalendarioModule
            };
            
            var module = moduleMap[page];
            if (module && typeof module.navigate === 'function') {
                module.navigate(page, breadcrumbHtml);
            } else {
                container.innerHTML = breadcrumbHtml + `<p class="text-muted">Módulo ${page} no disponible.</p>`;
            }
            return;
        }

        // ============================================================
        // FALLBACK
        // ============================================================
        console.warn('⚠️ Página no reconocida en admin.js:', page);
        container.innerHTML = breadcrumbHtml + AdminCore.renderDashboard();
        setTimeout(AdminCore.assignEvents, 100);
        setTimeout(loadData, 200);
    }

    // ============================================================
    // CARGAR DATOS DEL DASHBOARD
    // ============================================================
    async function loadData() {
        if (typeof AdminCore === 'undefined') return;
        
        try {
            var stats = await AdminCore.getEstadisticasGenerales();
            var container = document.getElementById('estadisticas-admin');
            if (container) {
                container.innerHTML = `
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:18px;">
                        <div class="stat-card">
                            <div class="stat-icon">👤</div>
                            <div class="number">${stats.totalUsuarios}</div>
                            <div class="label">Usuarios</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">👨‍🎓</div>
                            <div class="number">${stats.totalGraduados}</div>
                            <div class="label">Graduados</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">👩‍🏫</div>
                            <div class="number">${stats.totalDocentes}</div>
                            <div class="label">Docentes</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🏢</div>
                            <div class="number">${stats.totalEntidades}</div>
                            <div class="label">Entidades</div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    // ============================================================
    // FUNCIONES DE ADMINISTRACIÓN (Delegación a submódulos)
    // ============================================================
    
    function mostrarFormularioUsuario(usuarioId) {
        if (typeof AdminUsuarios !== 'undefined') {
            AdminUsuarios.mostrarFormulario(usuarioId);
        } else {
            ModalModule.error('Módulo de Usuarios no disponible.');
        }
    }
    
    function guardarUsuarioMultiRol() {
        if (typeof AdminUsuarios !== 'undefined') {
            AdminUsuarios.guardar();
        } else {
            ModalModule.error('Módulo de Usuarios no disponible.');
        }
    }
    
    function editarUsuario(id) {
        if (typeof AdminUsuarios !== 'undefined') {
            AdminUsuarios.editar(id);
        } else {
            ModalModule.error('Módulo de Usuarios no disponible.');
        }
    }
    
    function eliminarUsuario(id) {
        if (typeof AdminUsuarios !== 'undefined') {
            AdminUsuarios.eliminar(id);
        } else {
            ModalModule.error('Módulo de Usuarios no disponible.');
        }
    }
    
    function aplicarFiltroUsuarios(rolId) {
        if (typeof AdminUsuarios !== 'undefined') {
            AdminUsuarios.aplicarFiltro(rolId);
        } else {
            ModalModule.error('Módulo de Usuarios no disponible.');
        }
    }
    
    function seleccionarTodosRoles() {
        if (typeof AdminUsuarios !== 'undefined') {
            AdminUsuarios.seleccionarTodosRoles();
        }
    }
    
    function deseleccionarTodosRoles() {
        if (typeof AdminUsuarios !== 'undefined') {
            AdminUsuarios.deseleccionarTodosRoles();
        }
    }

    function renderGraduados() {
        if (typeof AdminGraduados !== 'undefined') {
            return AdminGraduados.render();
        }
        return '<p class="text-muted">Módulo de Graduados no disponible.</p>';
    }
    
    function mostrarFormularioGraduado(graduadoId) {
        if (typeof AdminGraduados !== 'undefined') {
            AdminGraduados.mostrarFormulario(graduadoId);
        } else {
            ModalModule.error('Módulo de Graduados no disponible.');
        }
    }
    
    function guardarGraduado() {
        if (typeof AdminGraduados !== 'undefined') {
            AdminGraduados.guardar();
        } else {
            ModalModule.error('Módulo de Graduados no disponible.');
        }
    }
    
    function editarGraduado(id) {
        if (typeof AdminGraduados !== 'undefined') {
            AdminGraduados.editar(id);
        } else {
            ModalModule.error('Módulo de Graduados no disponible.');
        }
    }
    
    function eliminarGraduado(id) {
        if (typeof AdminGraduados !== 'undefined') {
            AdminGraduados.eliminar(id);
        } else {
            ModalModule.error('Módulo de Graduados no disponible.');
        }
    }

    function renderDocentes() {
        if (typeof AdminDocentes !== 'undefined') {
            return AdminDocentes.render();
        }
        return '<p class="text-muted">Módulo de Docentes no disponible.</p>';
    }
    
    function mostrarFormularioDocente(docenteId) {
        if (typeof AdminDocentes !== 'undefined') {
            AdminDocentes.mostrarFormulario(docenteId);
        } else {
            ModalModule.error('Módulo de Docentes no disponible.');
        }
    }
    
    function guardarDocente() {
        if (typeof AdminDocentes !== 'undefined') {
            AdminDocentes.guardar();
        } else {
            ModalModule.error('Módulo de Docentes no disponible.');
        }
    }
    
    function editarDocente(id) {
        if (typeof AdminDocentes !== 'undefined') {
            AdminDocentes.editar(id);
        } else {
            ModalModule.error('Módulo de Docentes no disponible.');
        }
    }
    
    function eliminarDocente(id) {
        if (typeof AdminDocentes !== 'undefined') {
            AdminDocentes.eliminar(id);
        } else {
            ModalModule.error('Módulo de Docentes no disponible.');
        }
    }

    function renderEntidades() {
        if (typeof AdminEntidades !== 'undefined') {
            return AdminEntidades.render();
        }
        return '<p class="text-muted">Módulo de Entidades no disponible.</p>';
    }
    
    function mostrarFormularioEntidad(entidadId) {
        if (typeof AdminEntidades !== 'undefined') {
            AdminEntidades.mostrarFormulario(entidadId);
        } else {
            ModalModule.error('Módulo de Entidades no disponible.');
        }
    }
    
    function guardarEntidad() {
        if (typeof AdminEntidades !== 'undefined') {
            AdminEntidades.guardar();
        } else {
            ModalModule.error('Módulo de Entidades no disponible.');
        }
    }
    
    function editarEntidad(id) {
        if (typeof AdminEntidades !== 'undefined') {
            AdminEntidades.editar(id);
        } else {
            ModalModule.error('Módulo de Entidades no disponible.');
        }
    }
    
    function eliminarEntidad(id) {
        if (typeof AdminEntidades !== 'undefined') {
            AdminEntidades.eliminar(id);
        } else {
            ModalModule.error('Módulo de Entidades no disponible.');
        }
    }

    function renderCarreras() {
        if (typeof AdminCarreras !== 'undefined') {
            return AdminCarreras.render();
        }
        return '<p class="text-muted">Módulo de Carreras no disponible.</p>';
    }
    
    function mostrarFormularioCarrera(carreraId) {
        if (typeof AdminCarreras !== 'undefined') {
            AdminCarreras.mostrarFormulario(carreraId);
        } else {
            ModalModule.error('Módulo de Carreras no disponible.');
        }
    }
    
    function guardarCarrera() {
        if (typeof AdminCarreras !== 'undefined') {
            AdminCarreras.guardar();
        } else {
            ModalModule.error('Módulo de Carreras no disponible.');
        }
    }
    
    function editarCarrera(id) {
        if (typeof AdminCarreras !== 'undefined') {
            AdminCarreras.editar(id);
        } else {
            ModalModule.error('Módulo de Carreras no disponible.');
        }
    }
    
    function eliminarCarrera(id) {
        if (typeof AdminCarreras !== 'undefined') {
            AdminCarreras.eliminar(id);
        } else {
            ModalModule.error('Módulo de Carreras no disponible.');
        }
    }

    function mostrarAsignacionTutor(breadcrumbHtml) {
        if (typeof AdminTutores !== 'undefined') {
            AdminTutores.mostrarAsignacion(breadcrumbHtml);
        } else {
            ModalModule.error('Módulo de Asignación de Tutores no disponible.');
        }
    }
    
    function asignarTutor(egresadoId) {
        if (typeof AdminTutores !== 'undefined') {
            AdminTutores.asignar(egresadoId);
        } else {
            ModalModule.error('Módulo de Asignación de Tutores no disponible.');
        }
    }
    
    function removerTutor(egresadoId) {
        if (typeof AdminTutores !== 'undefined') {
            AdminTutores.remover(egresadoId);
        } else {
            ModalModule.error('Módulo de Asignación de Tutores no disponible.');
        }
    }

    function renderInvestigadores() {
        if (typeof AdminInvestigadores !== 'undefined') {
            return AdminInvestigadores.render();
        }
        return '<p class="text-muted">Módulo de Investigadores no disponible.</p>';
    }

    function renderReportes() {
        if (typeof AdminReportes !== 'undefined') {
            return AdminReportes.render();
        }
        return '<p class="text-muted">Módulo de Reportes no disponible.</p>';
    }

    function descargarPlantillaUsuarios() {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.descargarPlantillaUsuarios();
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function importarUsuarios(event) {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.importarUsuarios(event);
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function exportarUsuarios() {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.exportarUsuarios();
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function descargarPlantillaGraduados() {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.descargarPlantillaGraduados();
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function importarGraduados(event) {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.importarGraduados(event);
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function exportarGraduados() {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.exportarGraduados();
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function descargarPlantillaDocentes() {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.descargarPlantillaDocentes();
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function importarDocentes(event) {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.importarDocentes(event);
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function exportarDocentes() {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.exportarDocentes();
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function descargarPlantillaEntidades() {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.descargarPlantillaEntidades();
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function importarEntidades(event) {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.importarEntidades(event);
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }
    
    function exportarEntidades() {
        if (typeof AdminExcel !== 'undefined') {
            AdminExcel.exportarEntidades();
        } else {
            ModalModule.error('Módulo de Excel no disponible.');
        }
    }

    // ============================================================
    // isAdmin
    // ============================================================
    function isAdmin() {
        if (typeof AdminCore !== 'undefined') {
            return AdminCore.isAdmin();
        }
        return false;
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
        navigate: navigate,
        isAdmin: isAdmin,
        
        // Usuarios
        mostrarFormularioUsuario: mostrarFormularioUsuario,
        guardarUsuarioMultiRol: guardarUsuarioMultiRol,
        editarUsuario: editarUsuario,
        eliminarUsuario: eliminarUsuario,
        aplicarFiltroUsuarios: aplicarFiltroUsuarios,
        seleccionarTodosRoles: seleccionarTodosRoles,
        deseleccionarTodosRoles: deseleccionarTodosRoles,
        
        // Graduados
        renderGraduados: renderGraduados,
        mostrarFormularioGraduado: mostrarFormularioGraduado,
        guardarGraduado: guardarGraduado,
        editarGraduado: editarGraduado,
        eliminarGraduado: eliminarGraduado,
        
        // Docentes
        renderDocentes: renderDocentes,
        mostrarFormularioDocente: mostrarFormularioDocente,
        guardarDocente: guardarDocente,
        editarDocente: editarDocente,
        eliminarDocente: eliminarDocente,
        
        // Entidades
        renderEntidades: renderEntidades,
        mostrarFormularioEntidad: mostrarFormularioEntidad,
        guardarEntidad: guardarEntidad,
        editarEntidad: editarEntidad,
        eliminarEntidad: eliminarEntidad,
        
        // Carreras
        renderCarreras: renderCarreras,
        mostrarFormularioCarrera: mostrarFormularioCarrera,
        guardarCarrera: guardarCarrera,
        editarCarrera: editarCarrera,
        eliminarCarrera: eliminarCarrera,
        
        // Tutores
        mostrarAsignacionTutor: mostrarAsignacionTutor,
        asignarTutor: asignarTutor,
        removerTutor: removerTutor,
        
        // Investigadores
        renderInvestigadores: renderInvestigadores,
        
        // Reportes
        renderReportes: renderReportes,
        
        // Excel
        descargarPlantillaUsuarios: descargarPlantillaUsuarios,
        importarUsuarios: importarUsuarios,
        exportarUsuarios: exportarUsuarios,
        descargarPlantillaGraduados: descargarPlantillaGraduados,
        importarGraduados: importarGraduados,
        exportarGraduados: exportarGraduados,
        descargarPlantillaDocentes: descargarPlantillaDocentes,
        importarDocentes: importarDocentes,
        exportarDocentes: exportarDocentes,
        descargarPlantillaEntidades: descargarPlantillaEntidades,
        importarEntidades: importarEntidades,
        exportarEntidades: exportarEntidades
    };

})();

window.AdminModule = AdminModule;
console.log('✅ AdminModule (unificado) cargado correctamente.');