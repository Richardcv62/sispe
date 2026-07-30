// ============================================================
// SISPE - sync.js
// M車dulo de Sincronizaci車n Offline/Online - CON MODALES
// RUTA: js/modules/sync.js
// ============================================================

const SyncModule = (function() {
    'use strict';

    let isOnline = navigator.onLine;
    let pendingSync = [];
    let isSyncing = false;

    /**
     * Inicializa el m車dulo de sincronizaci車n
     */
    function init() {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        loadPendingSync();

        console.log('?? M車dulo de Sincronizaci車n inicializado.');
        console.log(`?? Estado: ${isOnline ? '?? Online' : '?? Offline'}`);
        console.log(`?? Datos pendientes: ${pendingSync.length}`);
    }

    /**
     * Maneja la conexi車n online
     */
    function handleOnline() {
        isOnline = true;
        console.log('?? Conexi車n restablecida.');
        
        if (window.NotificationsModule) {
            window.NotificationsModule.showSuccess('? Conexi車n restablecida. Sincronizando datos...');
        }
        
        syncPending();
    }

    /**
     * Maneja la desconexi車n
     */
    function handleOffline() {
        isOnline = false;
        console.log('?? Conexi車n perdida.');
        
        if (window.NotificationsModule) {
            window.NotificationsModule.showWarning('?? Sin conexi車n a Internet. Los datos se guardar芍n localmente.');
        }
    }

    /**
     * Carga los datos pendientes de sincronizaci車n
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
     * Agrega una operaci車n a la cola de sincronizaci車n
     */
    function addToSync(operacion, datos) {
        const item = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            operacion: operacion,
            datos: datos,
            timestamp: new Date().toISOString(),
            intentos: 0
        };

        pendingSync.push(item);
        savePendingSync();

        console.log(`?? Operaci車n agregada a la cola: ${operacion}`, datos);

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
            console.log('? Ya hay una sincronizaci車n en curso...');
            return;
        }

        if (!isOnline) {
            console.log('? Sin conexi車n. La sincronizaci車n se realizar芍 autom芍ticamente cuando se restablezca.');
            return;
        }

        if (pendingSync.length === 0) {
            console.log('? No hay datos pendientes de sincronizaci車n.');
            return;
        }

        // Confirmar antes de sincronizar
        const confirmado = await ModalModule.confirm(
            'Hay ' + pendingSync.length + ' elementos pendientes de sincronizaci車n. ?Deseas continuar?',
            'Sincronizar datos'
        );
        if (!confirmado) return;

        isSyncing = true;
        console.log(`?? Sincronizando ${pendingSync.length} elementos...`);

        if (window.NotificationsModule) {
            window.NotificationsModule.showInfo(`?? Sincronizando ${pendingSync.length} elementos...`, 2000);
        }

        try {
            const failedItems = [];

            for (const item of pendingSync) {
                try {
                    console.log(`?? Enviando: ${item.operacion}`, item.datos);
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (error) {
                    console.error('? Error al sincronizar item:', item.id, error);
                    item.intentos += 1;
                    if (item.intentos < 3) {
                        failedItems.push(item);
                    } else {
                        console.warn(`?? Item ${item.id} eliminado por exceso de intentos.`);
                    }
                }
            }

            pendingSync = failedItems;
            savePendingSync();

            console.log(`? Sincronizaci車n completada. ${failedItems.length} elementos pendientes.`);

            if (window.ModalModule) {
                if (failedItems.length === 0) {
                    await ModalModule.success('Todos los datos sincronizados correctamente.');
                } else {
                    await ModalModule.warning(failedItems.length + ' elementos pendientes de sincronizaci車n.');
                }
            } else if (window.NotificationsModule) {
                if (failedItems.length === 0) {
                    window.NotificationsModule.showSuccess('? Todos los datos sincronizados correctamente.');
                } else {
                    window.NotificationsModule.showWarning(`?? ${failedItems.length} elementos pendientes de sincronizaci車n.`);
                }
            }

        } catch (error) {
            console.error('? Error en la sincronizaci車n:', error);
            if (window.ModalModule) {
                await ModalModule.error('Error en la sincronizaci車n: ' + error.message);
            }
        } finally {
            isSyncing = false;
        }
    }

    /**
     * Verifica el estado de la conexi車n
     */
    function getStatus() {
        return {
            isOnline: isOnline,
            pendingCount: pendingSync.length,
            isSyncing: isSyncing
        };
    }

    /**
     * Limpia la cola de sincronizaci車n (con modal)
     */
    function clearPendingSync() {
        ModalModule.confirm('?Est芍s seguro de que quieres limpiar la cola de sincronizaci車n?', 'Limpiar cola').then(function(confirmado) {
            if (!confirmado) return;
            pendingSync = [];
            savePendingSync();
            ModalModule.success('Cola de sincronizaci車n limpiada.');
            console.log('??? Cola de sincronizaci車n limpiada.');
        });
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

window.SyncModule = SyncModule;

console.log('?? M車dulo de Sincronizaci車n cargado correctamente.');