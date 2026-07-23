// ============================================================
// SISPE - sync.js
// M贸dulo de Sincronizaci贸n Offline/Online
// ============================================================

const SyncModule = (function() {
    'use strict';

    let isOnline = navigator.onLine;
    let pendingSync = [];
    let isSyncing = false;

    /**
     * Inicializa el m贸dulo de sincronizaci贸n
     */
    function init() {
        // Escuchar cambios de conectividad
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Verificar si hay datos pendientes
        loadPendingSync();

        console.log('馃攧 M贸dulo de Sincronizaci贸n inicializado.');
        console.log(`馃摗 Estado: ${isOnline ? '馃煝 Online' : '馃敶 Offline'}`);
        console.log(`馃摝 Datos pendientes: ${pendingSync.length}`);
    }

    /**
     * Maneja la conexi贸n online
     */
    function handleOnline() {
        isOnline = true;
        console.log('馃煝 Conexi贸n restablecida.');
        
        if (window.NotificationsModule) {
            window.NotificationsModule.showSuccess('鉁?Conexi贸n restablecida. Sincronizando datos...');
        }
        
        // Intentar sincronizar datos pendientes
        syncPending();
    }

    /**
     * Maneja la desconexi贸n
     */
    function handleOffline() {
        isOnline = false;
        console.log('馃敶 Conexi贸n perdida.');
        
        if (window.NotificationsModule) {
            window.NotificationsModule.showWarning('鈿狅笍 Sin conexi贸n a Internet. Los datos se guardar谩n localmente.');
        }
    }

    /**
     * Carga los datos pendientes de sincronizaci贸n
     */
    function loadPendingSync() {
        try {
            const stored = localStorage.getItem('sispe_pending_sync');
            if (stored) {
                pendingSync = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Error al cargar datos pendientes:', e);
            pendingSync = [];
        }
    }

    /**
     * Guarda los datos pendientes en localStorage
     */
    function savePendingSync() {
        try {
            localStorage.setItem('sispe_pending_sync', JSON.stringify(pendingSync));
        } catch (e) {
            console.warn('Error al guardar datos pendientes:', e);
        }
    }

    /**
     * Agrega una operaci贸n a la cola de sincronizaci贸n
     */
    function addToSync(operacion, datos) {
        const item = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            operacion: operacion, // 'insert', 'update', 'delete'
            datos: datos,
            timestamp: new Date().toISOString(),
            intentos: 0
        };

        pendingSync.push(item);
        savePendingSync();

        console.log(`馃摝 Operaci贸n agregada a la cola: ${operacion}`, datos);

        // Si estamos online, intentar sincronizar inmediatamente
        if (isOnline) {
            syncPending();
        }

        return item.id;
    }

    /**
     * Sincroniza los datos pendientes con el servidor
     */
    async function syncPending() {
        if (isSyncing) {
            console.log('鈴?Ya hay una sincronizaci贸n en curso...');
            return;
        }

        if (!isOnline) {
            console.log('鈴?Sin conexi贸n. La sincronizaci贸n se realizar谩 autom谩ticamente cuando se restablezca.');
            return;
        }

        if (pendingSync.length === 0) {
            console.log('鉁?No hay datos pendientes de sincronizaci贸n.');
            return;
        }

        isSyncing = true;
        console.log(`馃攧 Sincronizando ${pendingSync.length} elementos...`);

        if (window.NotificationsModule) {
            window.NotificationsModule.showInfo(`馃攧 Sincronizando ${pendingSync.length} elementos...`, 2000);
        }

        try {
            // Procesar cada elemento pendiente
            const failedItems = [];

            for (const item of pendingSync) {
                try {
                    // Aqu铆 se implementar铆a la llamada al servidor
                    // Por ahora, simulamos una sincronizaci贸n exitosa
                    console.log(`馃摛 Enviando: ${item.operacion}`, item.datos);
                    
                    // Simular llamada a API
                    // const response = await fetch('/api/sync', {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify(item)
                    // });
                    
                    // Simular 茅xito
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Si tiene 茅xito, no se agrega a failedItems
                    
                } catch (error) {
                    console.error('鉂?Error al sincronizar item:', item.id, error);
                    item.intentos += 1;
                    
                    // Si ha fallado m谩s de 3 veces, lo eliminamos (para no bloquear)
                    if (item.intentos < 3) {
                        failedItems.push(item);
                    } else {
                        console.warn(`鈿狅笍 Item ${item.id} eliminado por exceso de intentos.`);
                    }
                }
            }

            // Actualizar la cola con los items que fallaron
            pendingSync = failedItems;
            savePendingSync();

            console.log(`鉁?Sincronizaci贸n completada. ${failedItems.length} elementos pendientes.`);

            if (window.NotificationsModule) {
                if (failedItems.length === 0) {
                    window.NotificationsModule.showSuccess('鉁?Todos los datos sincronizados correctamente.');
                } else {
                    window.NotificationsModule.showWarning(`鈿狅笍 ${failedItems.length} elementos pendientes de sincronizaci贸n.`);
                }
            }

        } catch (error) {
            console.error('鉂?Error en la sincronizaci贸n:', error);
        } finally {
            isSyncing = false;
        }
    }

    /**
     * Verifica el estado de la conexi贸n
     */
    function getStatus() {
        return {
            isOnline: isOnline,
            pendingCount: pendingSync.length,
            isSyncing: isSyncing
        };
    }

    /**
     * Limpia la cola de sincronizaci贸n (solo para debug)
     */
    function clearPendingSync() {
        pendingSync = [];
        savePendingSync();
        console.log('馃棏锔?Cola de sincronizaci贸n limpiada.');
    }

    return {
        init: init,
        addToSync: addToSync,
        syncPending: syncPending,
        getStatus: getStatus,
        clearPendingSync: clearPendingSync,
        isOnline: function() { return isOnline; }
    };

})();

// Exportar para uso global
window.SyncModule = SyncModule;

console.log('馃攧 M贸dulo de Sincronizaci贸n cargado correctamente.');
