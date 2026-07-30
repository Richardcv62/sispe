// ============================================================
// SISPE - modal.js
// Sistema de Modales Personalizados
// RUTA: js/modules/modal.js
// ============================================================

const ModalModule = (function() {
    'use strict';

    // ---- VARIABLES ----
    let modalContainer = null;
    let activeModal = null;

    // ============================================================
    // CREAR CONTENEDOR DE MODALES
    // ============================================================
    function ensureContainer() {
        if (modalContainer) return modalContainer;

        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        modalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 99999;
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(10, 30, 60, 0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            animation: modalFadeIn 0.3s ease;
            padding: 20px;
        `;
        document.body.appendChild(modalContainer);

        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(-30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .modal-content {
                    animation: modalSlideIn 0.3s ease;
                    max-width: 500px;
                    width: 100%;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 30px 80px rgba(0,0,0,0.3);
                    overflow: hidden;
                }
                .modal-content .modal-header {
                    padding: 20px 24px 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .modal-content .modal-header .modal-icon {
                    font-size: 28px;
                }
                .modal-content .modal-header .modal-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0a1e3c;
                    flex: 1;
                }
                .modal-content .modal-header .modal-close {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    font-size: 22px;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .modal-content .modal-header .modal-close:hover {
                    background: #f1f4f8;
                    color: #475569;
                }
                .modal-content .modal-body {
                    padding: 24px;
                    color: #475569;
                    font-size: 15px;
                    line-height: 1.7;
                }
                .modal-content .modal-body .modal-message {
                    margin-bottom: 12px;
                    white-space: pre-wrap;
                }
                .modal-content .modal-footer {
                    padding: 12px 24px 20px;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    border-top: 1px solid #e2e8f0;
                    flex-wrap: wrap;
                }
                .modal-content .modal-footer .btn-modal {
                    padding: 10px 24px;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-family: 'Inter', sans-serif;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .modal-content .modal-footer .btn-primary {
                    background: #0a1e3c;
                    color: white;
                }
                .modal-content .modal-footer .btn-primary:hover {
                    background: #1a3a6a;
                    transform: translateY(-2px);
                }
                .modal-content .modal-footer .btn-secondary {
                    background: #e2e8f0;
                    color: #475569;
                }
                .modal-content .modal-footer .btn-secondary:hover {
                    background: #cbd5e0;
                }
                .modal-content .modal-footer .btn-success {
                    background: #1a8a4a;
                    color: white;
                }
                .modal-content .modal-footer .btn-success:hover {
                    background: #0f6a38;
                    transform: translateY(-2px);
                }
                .modal-content .modal-footer .btn-danger {
                    background: #b33a4a;
                    color: white;
                }
                .modal-content .modal-footer .btn-danger:hover {
                    background: #8a2a38;
                    transform: translateY(-2px);
                }
                .modal-content .modal-footer .btn-warning {
                    background: #d48a2a;
                    color: white;
                }
                .modal-content .modal-footer .btn-warning:hover {
                    background: #b07020;
                    transform: translateY(-2px);
                }
                .modal-content .modal-footer .btn-outline {
                    background: transparent;
                    border: 2px solid #e2e8f0;
                    color: #475569;
                }
                .modal-content .modal-footer .btn-outline:hover {
                    border-color: #0a1e3c;
                    color: #0a1e3c;
                    background: #f8fafc;
                }
                @media (max-width: 500px) {
                    .modal-content .modal-footer {
                        flex-direction: column;
                    }
                    .modal-content .modal-footer .btn-modal {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        return modalContainer;
    }

    // ============================================================
    // CERRAR MODAL
    // ============================================================
    function closeModal() {
        if (modalContainer) {
            modalContainer.style.display = 'none';
            modalContainer.innerHTML = '';
        }
        activeModal = null;
    }

    // ============================================================
    // MOSTRAR MODAL
    // ============================================================
    function showModal(options) {
        return new Promise(function(resolve) {
            const container = ensureContainer();
            container.style.display = 'flex';
            container.innerHTML = '';

            const {
                title = 'Aviso',
                message = '',
                icon = 'ℹ️',
                type = 'info',
                confirmText = 'Aceptar',
                cancelText = 'Cancelar',
                showCancel = false,
                onConfirm = null,
                onCancel = null,
                closeOnBackdrop = true
            } = options;

            const iconMap = {
                'info': 'ℹ️',
                'success': '✅',
                'warning': '⚠️',
                'error': '❌',
                'confirm': '❓'
            };

            const finalIcon = iconMap[type] || icon;

            const modal = document.createElement('div');
            modal.className = 'modal-content';
            modal.innerHTML = `
                <div class="modal-header">
                    <span class="modal-icon">${finalIcon}</span>
                    <span class="modal-title">${title}</span>
                    <button class="modal-close" id="modal-close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="modal-message">${message}</div>
                </div>
                <div class="modal-footer">
                    ${showCancel ? `<button class="btn-modal btn-outline" id="modal-cancel-btn">${cancelText}</button>` : ''}
                    <button class="btn-modal btn-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'primary'}" id="modal-confirm-btn">${confirmText}</button>
                </div>
            `;

            container.appendChild(modal);

            if (closeOnBackdrop) {
                container.addEventListener('click', function(e) {
                    if (e.target === container) {
                        closeModal();
                        if (onCancel) onCancel();
                        resolve(false);
                    }
                });
            }

            document.getElementById('modal-close-btn').addEventListener('click', function() {
                closeModal();
                if (onCancel) onCancel();
                resolve(false);
            });

            const cancelBtn = document.getElementById('modal-cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    closeModal();
                    if (onCancel) onCancel();
                    resolve(false);
                });
            }

            document.getElementById('modal-confirm-btn').addEventListener('click', function() {
                closeModal();
                if (onConfirm) onConfirm();
                resolve(true);
            });

            setTimeout(function() {
                const confirmBtn = document.getElementById('modal-confirm-btn');
                if (confirmBtn) confirmBtn.focus();
            }, 100);

            activeModal = modal;
        });
    }

    // ============================================================
    // ALERT (INFO)
    // ============================================================
    function alert(message, title = 'Aviso', icon = 'ℹ️') {
        return showModal({
            title: title,
            message: message,
            icon: icon,
            type: 'info',
            confirmText: 'Aceptar',
            showCancel: false
        });
    }

    // ============================================================
    // SUCCESS
    // ============================================================
    function success(message, title = 'Éxito') {
        return showModal({
            title: title,
            message: message,
            icon: '✅',
            type: 'success',
            confirmText: 'Aceptar',
            showCancel: false
        });
    }

    // ============================================================
    // ERROR
    // ============================================================
    function error(message, title = 'Error') {
        return showModal({
            title: title,
            message: message,
            icon: '❌',
            type: 'error',
            confirmText: 'Aceptar',
            showCancel: false
        });
    }

    // ============================================================
    // WARNING
    // ============================================================
    function warning(message, title = 'Advertencia') {
        return showModal({
            title: title,
            message: message,
            icon: '⚠️',
            type: 'warning',
            confirmText: 'Aceptar',
            showCancel: false
        });
    }

    // ============================================================
    // CONFIRM
    // ============================================================
    function confirm(message, title = 'Confirmar', confirmText = 'Confirmar', cancelText = 'Cancelar') {
        return showModal({
            title: title,
            message: message,
            icon: '❓',
            type: 'confirm',
            confirmText: confirmText,
            cancelText: cancelText,
            showCancel: true
        });
    }

    // ============================================================
    // CONFIRM DELETE
    // ============================================================
    function confirmDelete(message, title = 'Eliminar') {
        return showModal({
            title: title,
            message: message || '¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.',
            icon: '🗑️',
            type: 'error',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            showCancel: true
        });
    }

    // ============================================================
    // API PÚBLICA
    // ============================================================
    return {
        alert: alert,
        success: success,
        error: error,
        warning: warning,
        confirm: confirm,
        confirmDelete: confirmDelete,
        showModal: showModal,
        closeModal: closeModal,
        isOpen: function() { return activeModal !== null; }
    };

})();

window.ModalModule = ModalModule;
console.log('💬 Módulo de Modales cargado correctamente.');