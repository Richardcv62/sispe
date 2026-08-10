// ============================================================
// SISPE - paginacion.js
// Módulo de Paginación Reutilizable
// RUTA: js/modules/paginacion.js
// ============================================================

const PaginacionModule = (function() {
    'use strict';

    // ============================================================
    // CONFIGURACIÓN
    // ============================================================
    var CONFIG = {
        itemsPorPagina: 20,
        maxBotonesMostrados: 7
    };

    // ============================================================
    // RENDERIZAR CONTROLES DE PAGINACIÓN
    // ============================================================
    function renderizar(paginaActual, totalItems, callback, containerId) {
        var container = document.getElementById(containerId || 'paginacion-container');
        if (!container) {
            // Si no existe el contenedor, crearlo después de la tabla
            var tableWrap = document.querySelector('.table-wrap');
            if (tableWrap) {
                var newContainer = document.createElement('div');
                newContainer.id = containerId || 'paginacion-container';
                newContainer.style.cssText = 'margin-top:16px;';
                tableWrap.parentNode.insertBefore(newContainer, tableWrap.nextSibling);
                container = newContainer;
            } else {
                console.warn('No se encontró contenedor para paginación');
                return;
            }
        }

        var totalPaginas = Math.ceil(totalItems / CONFIG.itemsPorPagina);
        
        if (totalPaginas <= 1) {
            container.innerHTML = '';
            return;
        }

        // Asegurar que la página actual sea válida
        paginaActual = Math.max(1, Math.min(paginaActual, totalPaginas));

        var html = generarHTML(paginaActual, totalPaginas, totalItems);

        container.innerHTML = html;

        // Asignar eventos
        container.querySelectorAll('.paginacion-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var pagina = parseInt(this.dataset.pagina);
                if (callback && typeof callback === 'function') {
                    callback(pagina);
                }
            });
        });
    }

    // ============================================================
    // GENERAR HTML DE PAGINACIÓN
    // ============================================================
    function generarHTML(paginaActual, totalPaginas, totalItems) {
        var inicio = (paginaActual - 1) * CONFIG.itemsPorPagina + 1;
        var fin = Math.min(paginaActual * CONFIG.itemsPorPagina, totalItems);

        var html = `
            <div class="paginacion-wrapper" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <!-- Botón Anterior -->
                    <button class="paginacion-btn btn btn-sm btn-outline" 
                            data-pagina="${paginaActual - 1}"
                            ${paginaActual <= 1 ? 'disabled' : ''}
                            style="padding:6px 12px;border-radius:8px;border:2px solid #e2e8f0;background:transparent;cursor:pointer;font-family:'Inter',sans-serif;${paginaActual <= 1 ? 'opacity:0.5;cursor:not-allowed;' : ''}">
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>

                    <!-- Números de página -->
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        ${generarBotonesPagina(paginaActual, totalPaginas)}
                    </div>

                    <!-- Botón Siguiente -->
                    <button class="paginacion-btn btn btn-sm btn-outline" 
                            data-pagina="${paginaActual + 1}"
                            ${paginaActual >= totalPaginas ? 'disabled' : ''}
                            style="padding:6px 12px;border-radius:8px;border:2px solid #e2e8f0;background:transparent;cursor:pointer;font-family:'Inter',sans-serif;${paginaActual >= totalPaginas ? 'opacity:0.5;cursor:not-allowed;' : ''}">
                        Siguiente <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <!-- Información de resultados -->
                <div style="font-size:13px;color:#94a3b8;white-space:nowrap;">
                    Mostrando <strong style="color:#0a1e3c;">${inicio}</strong> - 
                    <strong style="color:#0a1e3c;">${fin}</strong> de 
                    <strong style="color:#0a1e3c;">${totalItems}</strong> elementos
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // GENERAR BOTONES DE PÁGINA
    // ============================================================
    function generarBotonesPagina(paginaActual, totalPaginas) {
        var html = '';
        var maxBotones = CONFIG.maxBotonesMostrados;
        var rango = Math.floor(maxBotones / 2);

        var inicio = Math.max(1, paginaActual - rango);
        var fin = Math.min(totalPaginas, paginaActual + rango);

        // Ajustar si estamos al inicio o al final
        if (paginaActual - rango < 1) {
            fin = Math.min(totalPaginas, maxBotones);
        }
        if (paginaActual + rango > totalPaginas) {
            inicio = Math.max(1, totalPaginas - maxBotones + 1);
        }

        // Botón de primera página
        if (inicio > 1) {
            html += `
                <button class="paginacion-btn btn btn-sm" 
                        data-pagina="1"
                        style="padding:6px 12px;border-radius:8px;border:2px solid #e2e8f0;background:transparent;cursor:pointer;font-family:'Inter',sans-serif;">
                    1
                </button>
            `;
            if (inicio > 2) {
                html += `<span style="padding:6px 4px;color:#94a3b8;">…</span>`;
            }
        }

        // Botones del rango
        for (var i = inicio; i <= fin; i++) {
            var esActiva = i === paginaActual;
            html += `
                <button class="paginacion-btn btn btn-sm ${esActiva ? 'btn-primary' : 'btn-outline'}" 
                        data-pagina="${i}"
                        style="padding:6px 12px;border-radius:8px;${esActiva ? 'background:#0a1e3c;color:white;border:2px solid #0a1e3c;' : 'border:2px solid #e2e8f0;background:transparent;'}cursor:pointer;font-family:'Inter',sans-serif;font-weight:${esActiva ? '700' : '400'};">
                    ${i}
                </button>
            `;
        }

        // Botón de última página
        if (fin < totalPaginas) {
            if (fin < totalPaginas - 1) {
                html += `<span style="padding:6px 4px;color:#94a3b8;">…</span>`;
            }
            html += `
                <button class="paginacion-btn btn btn-sm btn-outline" 
                        data-pagina="${totalPaginas}"
                        style="padding:6px 12px;border-radius:8px;border:2px solid #e2e8f0;background:transparent;cursor:pointer;font-family:'Inter',sans-serif;">
                    ${totalPaginas}
                </button>
            `;
        }

        return html;
    }

    // ============================================================
    // CAMBIAR PÁGINA
    // ============================================================
    function irPagina(pagina, totalItems, callback, containerId) {
        var totalPaginas = Math.ceil(totalItems / CONFIG.itemsPorPagina);
        pagina = Math.max(1, Math.min(pagina, totalPaginas));
        
        if (callback && typeof callback === 'function') {
            callback(pagina);
        }
    }

    // ============================================================
    // OBTENER DATOS PAGINADOS
    // ============================================================
    function getPaginacion(paginaActual, totalItems) {
        var offset = (paginaActual - 1) * CONFIG.itemsPorPagina;
        var limit = CONFIG.itemsPorPagina;
        
        return {
            offset: offset,
            limit: limit,
            pagina: paginaActual,
            totalPaginas: Math.ceil(totalItems / CONFIG.itemsPorPagina),
            itemsPorPagina: CONFIG.itemsPorPagina
        };
    }

    // ============================================================
    // CONFIGURAR ITEMS POR PÁGINA
    // ============================================================
    function setItemsPorPagina(cantidad) {
        if (cantidad > 0) {
            CONFIG.itemsPorPagina = cantidad;
        }
    }

    // ============================================================
    // OBTENER CONFIGURACIÓN
    // ============================================================
    function getConfig() {
        return {
            itemsPorPagina: CONFIG.itemsPorPagina,
            maxBotonesMostrados: CONFIG.maxBotonesMostrados
        };
    }

    // ============================================================
    // API PÚBLICA
    // ============================================================
    return {
        renderizar: renderizar,
        irPagina: irPagina,
        getPaginacion: getPaginacion,
        setItemsPorPagina: setItemsPorPagina,
        getConfig: getConfig,
        itemsPorPagina: CONFIG.itemsPorPagina
    };

})();

window.PaginacionModule = PaginacionModule;
console.log('📄 Módulo de Paginación cargado correctamente.');