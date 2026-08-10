// ============================================================
// SISPE - admin.excel.js
// Importación/Exportación Excel
// RUTA: js/modules/admin/admin.excel.js
// ============================================================

const AdminExcel = (function() {
    'use strict';

    // ============================================================
    // USUARIOS - PLANTILLA
    // ============================================================
    function descargarPlantillaUsuarios() {
        var headers = ['username', 'password', 'email', 'nombre', 'apellidos', 'rol'];
        var data = [
            ['carlos.p', '123456', 'carlos@sispe.com', 'Carlos', 'Perez', 'egresado'],
            ['ana.r', '123456', 'ana@sispe.com', 'Ana', 'Rodriguez', 'egresado'],
            ['maria.g', '123456', 'maria@sispe.com', 'Maria', 'Gomez', 'tutor']
        ];
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet([headers].concat(data));
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
        XLSX.writeFile(wb, 'plantilla_usuarios.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Plantilla descargada.', 'success');
        }
    }

    // ============================================================
    // USUARIOS - IMPORTAR
    // ============================================================
    async function importarUsuarios(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                var jsonData = XLSX.utils.sheet_to_json(firstSheet);

                var roles = await DBModule.query('SELECT id, nombre FROM roles');
                var rolMap = {};
                roles.forEach(function(r) {
                    rolMap[r.nombre.toLowerCase().trim()] = r.id;
                });

                var importados = 0;
                var errores = [];

                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var username = row.username || row.Usuario;
                    var password = row.password || row.Contrasena || '123456';
                    var email = row.email || row.Email;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos || '';
                    var rolNombre = row.rol || row.Rol;

                    if (!username || !email || !nombre) {
                        errores.push('Fila ' + (i + 2) + ': Falta usuario, email o nombre.');
                        continue;
                    }

                    var rolId = 5;
                    if (rolNombre) {
                        var key = rolNombre.toLowerCase().trim();
                        if (rolMap[key]) {
                            rolId = rolMap[key];
                        } else {
                            errores.push('Fila ' + (i + 2) + ': Rol "' + rolNombre + '" no encontrado. Se asignar&aacute; "egresado".');
                        }
                    }

                    try {
                        await DBModule.execute(
                            'INSERT OR IGNORE INTO usuarios (username, password, email, nombre, apellidos, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
                            [username, password, email, nombre, apellidos, rolId]
                        );
                        importados++;
                    } catch (err) {
                        errores.push('Fila ' + (i + 2) + ': ' + err.message);
                    }
                }

                var mensaje = 'Importados ' + importados + ' usuarios.';
                if (errores.length > 0) {
                    mensaje += '\n\nErrores:\n' + errores.join('\n');
                    if (window.ModalModule) {
                        await ModalModule.warning(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning(mensaje);
                    }
                } else {
                    if (window.ModalModule) {
                        await ModalModule.success(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showToast(mensaje, 'success');
                    }
                }

                AdminUsuarios.render(document.getElementById('filtro-rol-usuarios')?.value || 'todos').then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(AdminCore.assignEvents, 100);
                });
            } catch (error) {
                if (window.ModalModule) {
                    await ModalModule.error('Error al importar: ' + error.message);
                } else if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    // ============================================================
    // USUARIOS - EXPORTAR
    // ============================================================
    async function exportarUsuarios() {
        var filtroRol = document.getElementById('filtro-rol-usuarios')?.value || 'todos';
        
        var query = 'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id';
        var params = [];
        
        if (filtroRol && filtroRol !== 'todos' && filtroRol !== '') {
            query += ' WHERE u.rol_id = ?';
            params.push(parseInt(filtroRol));
        }
        query += ' ORDER BY u.id';

        var usuarios = await DBModule.query(query, params);

        var data = usuarios.map(function(u) {
            return { 
                Usuario: u.username, 
                Email: u.email, 
                Nombre: u.nombre, 
                Apellidos: u.apellidos || '', 
                Rol: u.rol_nombre || 'Sin rol',
                Activo: u.activo ? 'Si' : 'No'
            };
        });
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
        XLSX.writeFile(wb, 'usuarios_exportados.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportado correctamente.', 'success');
        }
    }

    // ============================================================
    // GRADUADOS - PLANTILLA
    // ============================================================
    function descargarPlantillaGraduados() {
        var headers = ['numero_identidad', 'nombre', 'apellidos', 'carrera', 'anio_graduacion', 'email_institucional', 'titulo_oro', 'graduado_integral'];
        var data = [
            ['88010112345', 'Carlos', 'Perez', 'Ingenier&iacute;a Agr&oacute;noma', '2024', 'carlos@uiij.co.cu', '0', '0'],
            ['89020223456', 'Ana', 'Rodriguez', 'Lic. Contabilidad', '2024', 'ana@uiij.co.cu', '1', '1']
        ];
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet([headers].concat(data));
        XLSX.utils.book_append_sheet(wb, ws, 'Graduados');
        XLSX.writeFile(wb, 'plantilla_graduados.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Plantilla descargada.', 'success');
        }
    }

    // ============================================================
    // GRADUADOS - IMPORTAR
    // ============================================================
    async function importarGraduados(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                var jsonData = XLSX.utils.sheet_to_json(firstSheet);

                var carreras = await DBModule.query('SELECT id, nombre FROM carreras');
                var carreraMap = {};
                carreras.forEach(function(c) {
                    carreraMap[c.nombre.toLowerCase().trim()] = c.id;
                });

                var importados = 0;
                var errores = [];

                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var identidad = row.numero_identidad || row.Identidad;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos;
                    var carreraNombre = row.carrera || row.Carrera;
                    var anio = parseInt(row.anio_graduacion || row.Anio || 2024);
                    var email = row.email_institucional || row.Email || '';
                    var tituloOro = parseInt(row.titulo_oro || row.TituloOro || 0);
                    var integral = parseInt(row.graduado_integral || row.Integral || 0);

                    if (!identidad || !nombre || !apellidos) {
                        errores.push('Fila ' + (i + 2) + ': Falta identidad, nombre o apellidos.');
                        continue;
                    }

                    var carreraId = null;
                    if (carreraNombre) {
                        var key = carreraNombre.toLowerCase().trim();
                        carreraId = carreraMap[key];
                        if (!carreraId) {
                            errores.push('Fila ' + (i + 2) + ': Carrera "' + carreraNombre + '" no encontrada.');
                            continue;
                        }
                    } else {
                        errores.push('Fila ' + (i + 2) + ': Falta la carrera.');
                        continue;
                    }

                    try {
                        await DBModule.execute(
                            'INSERT OR IGNORE INTO graduados (numero_identidad, nombre, apellidos, carrera_id, anio_graduacion, email_institucional, titulo_oro, graduado_integral) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [identidad, nombre, apellidos, carreraId, anio, email, tituloOro, integral]
                        );
                        importados++;
                    } catch (err) {
                        errores.push('Fila ' + (i + 2) + ': ' + err.message);
                    }
                }

                var mensaje = 'Importados ' + importados + ' graduados.';
                if (errores.length > 0) {
                    mensaje += '\n\nErrores:\n' + errores.join('\n');
                    if (window.ModalModule) {
                        await ModalModule.warning(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning(mensaje);
                    }
                } else {
                    if (window.ModalModule) {
                        await ModalModule.success(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showToast(mensaje, 'success');
                    }
                }

                AdminGraduados.render().then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(AdminCore.assignEvents, 100);
                });
            } catch (error) {
                if (window.ModalModule) {
                    await ModalModule.error('Error al importar: ' + error.message);
                } else if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    // ============================================================
    // GRADUADOS - EXPORTAR
    // ============================================================
    async function exportarGraduados() {
        var graduados = await DBModule.query(
            'SELECT g.numero_identidad, g.nombre, g.apellidos, c.nombre as carrera, g.anio_graduacion, g.email_institucional FROM graduados g JOIN carreras c ON g.carrera_id = c.id'
        );
        var data = graduados.map(function(g) {
            return { 
                Identidad: g.numero_identidad, 
                Nombre: g.nombre, 
                Apellidos: g.apellidos, 
                Carrera: g.carrera,
                Anio: g.anio_graduacion,
                Email: g.email_institucional || ''
            };
        });
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Graduados');
        XLSX.writeFile(wb, 'graduados_exportados.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportado correctamente.', 'success');
        }
    }

    // ============================================================
    // DOCENTES - PLANTILLA
    // ============================================================
    function descargarPlantillaDocentes() {
        var headers = ['numero_identidad', 'nombre', 'apellidos', 'email_institucional', 'departamento', 'categoria'];
        var data = [
            ['76010112345', 'Maria', 'Gomez', 'maria@uiij.co.cu', 'Ciencias Agricolas', 'Principal'],
            ['77020223456', 'Pedro', 'Ramirez', 'pedro@uiij.co.cu', 'Economia', 'Auxiliar']
        ];
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet([headers].concat(data));
        XLSX.utils.book_append_sheet(wb, ws, 'Docentes');
        XLSX.writeFile(wb, 'plantilla_docentes.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Plantilla descargada.', 'success');
        }
    }

    // ============================================================
    // DOCENTES - IMPORTAR
    // ============================================================
    async function importarDocentes(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                var jsonData = XLSX.utils.sheet_to_json(firstSheet);

                var importados = 0;
                var errores = [];

                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var identidad = row.numero_identidad || row.Identidad;
                    var nombre = row.nombre || row.Nombre;
                    var apellidos = row.apellidos || row.Apellidos;
                    var email = row.email_institucional || row.Email || '';
                    var departamento = row.departamento || row.Departamento || '';
                    var categoria = row.categoria || row.Categoria || '';

                    if (!identidad || !nombre || !apellidos) {
                        errores.push('Fila ' + (i + 2) + ': Falta identidad, nombre o apellidos.');
                        continue;
                    }

                    try {
                        await DBModule.execute(
                            `INSERT OR IGNORE INTO docentes 
                                (numero_identidad, nombre, apellidos, email_institucional, departamento, categoria_docente) 
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [identidad, nombre, apellidos, email, departamento, categoria]
                        );
                        importados++;
                    } catch (err) {
                        errores.push('Fila ' + (i + 2) + ': ' + err.message);
                    }
                }

                var mensaje = 'Importados ' + importados + ' docentes.';
                if (errores.length > 0) {
                    mensaje += '\n\nErrores:\n' + errores.join('\n');
                    if (window.ModalModule) {
                        await ModalModule.warning(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning(mensaje);
                    }
                } else {
                    if (window.ModalModule) {
                        await ModalModule.success(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showToast(mensaje, 'success');
                    }
                }

                AdminDocentes.render().then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(AdminCore.assignEvents, 100);
                });
            } catch (error) {
                if (window.ModalModule) {
                    await ModalModule.error('Error al importar: ' + error.message);
                } else if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    // ============================================================
    // DOCENTES - EXPORTAR
    // ============================================================
    async function exportarDocentes() {
        var docentes = await DBModule.query('SELECT * FROM docentes');
        var data = docentes.map(function(d) {
            return { 
                Identidad: d.numero_identidad, 
                Nombre: d.nombre, 
                Apellidos: d.apellidos, 
                Email: d.email_institucional, 
                Departamento: d.departamento || '', 
                Categoria: d.categoria_docente || ''
            };
        });
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Docentes');
        XLSX.writeFile(wb, 'docentes_exportados.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportado correctamente.', 'success');
        }
    }

    // ============================================================
    // ENTIDADES - PLANTILLA
    // ============================================================
    function descargarPlantillaEntidades() {
        var headers = ['nombre', 'sector', 'representante', 'telefono', 'logo', 'email_contacto', 'direccion', 'convenio_estado'];
        var data = [
            ['Empresa Citricola', 'Produccion de alimentos', 'Ing. Roberto Mendez', '+53 48 123456', '&#127970;', 'contacto@citricola.cu', 'Carretera de la Fruta Km 3', 'activo'],
            ['Oficina del Turismo', 'Turismo', 'Lic. Mariana Perez', '+53 48 789012', '&#127970;', 'turismo@islajuventud.cu', 'Calle 39 No. 120', 'activo']
        ];
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet([headers].concat(data));
        XLSX.utils.book_append_sheet(wb, ws, 'Entidades');
        XLSX.writeFile(wb, 'plantilla_entidades.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Plantilla descargada.', 'success');
        }
    }

    // ============================================================
    // ENTIDADES - IMPORTAR
    // ============================================================
    async function importarEntidades(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                var jsonData = XLSX.utils.sheet_to_json(firstSheet);

                var importados = 0;
                var errores = [];

                for (var i = 0; i < jsonData.length; i++) {
                    var row = jsonData[i];
                    var nombre = row.nombre || row.Nombre;
                    var sector = row.sector || row.Sector || '';
                    var representante = row.representante || row.Representante || '';
                    var telefono = row.telefono || row.Telefono || '';
                    var logo = row.logo || row.Logo || '&#127970;';
                    var email = row.email_contacto || row.Email || '';
                    var direccion = row.direccion || row.Direccion || '';
                    var convenioEstado = row.convenio_estado || row.Convenio || 'activo';

                    if (!nombre) {
                        errores.push('Fila ' + (i + 2) + ': Falta el nombre.');
                        continue;
                    }

                    try {
                        await DBModule.execute(
                            `INSERT OR IGNORE INTO entidades 
                                (nombre, sector, representante, telefono, logo, email_contacto, direccion, convenio_estado) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [nombre, sector, representante, telefono, logo, email, direccion, convenioEstado]
                        );
                        importados++;
                    } catch (err) {
                        errores.push('Fila ' + (i + 2) + ': ' + err.message);
                    }
                }

                var mensaje = 'Importados ' + importados + ' entidades.';
                if (errores.length > 0) {
                    mensaje += '\n\nErrores:\n' + errores.join('\n');
                    if (window.ModalModule) {
                        await ModalModule.warning(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showWarning(mensaje);
                    }
                } else {
                    if (window.ModalModule) {
                        await ModalModule.success(mensaje);
                    } else if (window.NotificationsModule) {
                        window.NotificationsModule.showToast(mensaje, 'success');
                    }
                }

                AdminEntidades.render().then(function(html) {
                    document.getElementById('page-container').innerHTML = html;
                    setTimeout(AdminCore.assignEvents, 100);
                });
            } catch (error) {
                if (window.ModalModule) {
                    await ModalModule.error('Error al importar: ' + error.message);
                } else if (window.NotificationsModule) {
                    window.NotificationsModule.showToast('Error al importar: ' + error.message, 'error');
                }
            }
            event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
    }

    // ============================================================
    // ENTIDADES - EXPORTAR
    // ============================================================
    async function exportarEntidades() {
        var entidades = await DBModule.query('SELECT * FROM entidades');
        var data = entidades.map(function(e) {
            return { 
                Nombre: e.nombre, 
                Sector: e.sector || '', 
                Representante: e.representante || '', 
                Telefono: e.telefono || '', 
                Logo: e.logo || '&#127970;',
                Email: e.email_contacto || '',
                Direccion: e.direccion || '',
                Convenio: e.convenio_estado || 'sin convenio'
            };
        });
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Entidades');
        XLSX.writeFile(wb, 'entidades_exportadas.xlsx');
        if (window.NotificationsModule) {
            window.NotificationsModule.showToast('Exportado correctamente.', 'success');
        }
    }

    // ============================================================
    // EXPOSICIÓN PÚBLICA
    // ============================================================
    return {
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

window.AdminExcel = AdminExcel;
console.log('&#9989; AdminExcel cargado correctamente.');