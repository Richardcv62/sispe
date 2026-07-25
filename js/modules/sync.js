// ============================================================
// SISPE - sync.js
// Módulo de Sincronización Offline/Online
// ============================================================

const SyncModule = (function() {
    'use strict';

    let isOnline = navigator.onLine;
    let pendingSync = [];
    let isSyncing = false;

    /**
     * Inicializa el módulo de sincronización
     */
    function init() {
        // Escuchar cambios de conectividad
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Verificar si hay datos pendientes
        loadPendingSync();

        console.log('🔄 Módulo de Sincronización inicializado.');
        console.log(`📡 Estado: ${isOnline ? '🟢 Online' : '🔴 Offline'}`);
        console.log(`📦 Datos pendientes: ${pendingSync.length}`);
    }

    /**
     * Maneja la conexión online
     */
    function handleOnline() {
        isOnline = true;
        console.log('🟢 Conexión restablecida.');
        
        if (window.NotificationsModule) {
            window.NotificationsModule.showSuccess('✅ Conexión restablecida. Sincronizando datos...');
        }
        
        // Intentar sincronizar datos pendientes
        syncPending();
    }

    /**
     * Maneja la desconexión
     */
    function handleOffline() {
        isOnline = false;
        console.log('🔴 Conexión perdida.');
        
        if (window.NotificationsModule) {
            window.NotificationsModule.showWarning('⚠️ Sin conexión a Internet. Los datos se guardarán localmente.');
        }
    }

    /**
     * Carga los datos pendientes de sincronización
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
     * Agrega una operación a la cola de sincronización
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

        console.log(`📦 Operación agregada a la cola: ${operacion}`, datos);

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
            console.log('⏳ Ya hay una sincronización en curso...');
            return;
        }

        if (!isOnline) {
            console.log('⏳ Sin conexión. La sincronización se realizará automáticamente cuando se restablezca.');
            return;
        }

        if (pendingSync.length === 0) {
            console.log('✅ No hay datos pendientes de sincronización.');
            return;
        }

        isSyncing = true;
        console.log(`🔄 Sincronizando ${pendingSync.length} elementos...`);

        if (window.NotificationsModule) {
            window.NotificationsModule.showInfo(`🔄 Sincronizando ${pendingSync.length} elementos...`, 2000);
        }

        try {
            // Procesar cada elemento pendiente
            const failedItems = [];

            for (const item of pendingSync) {
                try {
                    // Aquí se implementaría la llamada al servidor
                    // Por ahora, simulamos una sincronización exitosa
                    console.log(`📤 Enviando: ${item.operacion}`, item.datos);
                    
                    // Simular llamada a API
                    // const response = await fetch('/api/sync', {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify(item)
                    // });
                    
                    // Simular éxito
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Si tiene éxito, no se agrega a failedItems
                    
                } catch (error) {
                    console.error('❌ Error al sincronizar item:', item.id, error);
                    item.intentos += 1;
                    
                    // Si ha fallado más de 3 veces, lo eliminamos (para no bloquear)
                    if (item.intentos < 3) {
                        failedItems.push(item);
                    } else {
                        console.warn(`⚠️ Item ${item.id} eliminado por exceso de intentos.`);
                    }
                }
            }

            // Actualizar la cola con los items que fallaron
            pendingSync = failedItems;
            savePendingSync();

            console.log(`✅ Sincronización completada. ${failedItems.length} elementos pendientes.`);

            if (window.NotificationsModule) {
                if (failedItems.length === 0) {
                    window.NotificationsModule.showSuccess('✅ Todos los datos sincronizados correctamente.');
                } else {
                    window.NotificationsModule.showWarning(`⚠️ ${failedItems.length} elementos pendientes de sincronización.`);
                }
            }

        } catch (error) {
            console.error('❌ Error en la sincronización:', error);
        } finally {
            isSyncing = false;
        }
    }

    /**
     * Verifica el estado de la conexión
     */
    function getStatus() {
        return {
            isOnline: isOnline,
            pendingCount: pendingSync.length,
            isSyncing: isSyncing
        };
    }

    /**
     * Limpia la cola de sincronización (solo para debug)
     */
    function clearPendingSync() {
        pendingSync = [];
        savePendingSync();
        console.log('🗑️ Cola de sincronización limpiada.');
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

console.log('🔄 Módulo de Sincronización cargado correctamente.');