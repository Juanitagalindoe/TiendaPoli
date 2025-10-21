/**
 * DETALLE.JS - Sistema de Gestión de Detalles de Factura
 * Funcionalidad para búsqueda, eliminación y gestión de modal
 */

// ===========================
// FUNCIONES DE BÚSQUEDA
// ===========================
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.warn('⚠️ Campo de búsqueda no encontrado');
        return;
    }

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const tableBody = document.getElementById('detallesTableBody');
        const rows = tableBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const cells = row.getElementsByTagName('td');
            let shouldShow = false;

            for (let j = 0; j < cells.length - 1; j++) {
                const cellText = cells[j].textContent.toLowerCase();
                if (cellText.includes(searchTerm)) {
                    shouldShow = true;
                    break;
                }
            }

            row.style.display = shouldShow || searchTerm === '' ? '' : 'none';
        });

        handleNoResults(searchTerm, tableBody, rows);
    });
}

function handleNoResults(searchTerm, tableBody, rows) {
    const existingMessage = document.getElementById('noResultsMessage');
    if (existingMessage) {
        existingMessage.remove();
    }

    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none').length;

    if (visibleRows === 0 && searchTerm !== '') {
        const noResultsRow = document.createElement('tr');
        noResultsRow.id = 'noResultsMessage';
        noResultsRow.innerHTML = `
            <td colspan="9" class="no-results-message">
                <i class="fas fa-search"></i>
                No se encontraron resultados para "<strong>${searchTerm}</strong>"
            </td>
        `;
        tableBody.appendChild(noResultsRow);
    }
}

// ===========================
// FUNCIONES DEL MODAL
// ===========================
function mostrarModalEliminar(nroVenta, item, nombre) {
    console.log('🎭 DETALLE - Mostrando modal para:', nombre);
    const modal = document.getElementById('modalEliminar');
    const nombreModal = document.getElementById('nombreDetalleModal');
    const inputNroVenta = document.getElementById('nroVentaEliminar');
    const inputItem = document.getElementById('itemEliminar');

    console.log('Modal encontrado:', modal);
    console.log('NombreModal encontrado:', nombreModal);
    console.log('InputNroVenta encontrado:', inputNroVenta);
    console.log('InputItem encontrado:', inputItem);

    if (modal && nombreModal && inputNroVenta && inputItem) {
        console.log('✅ DETALLE - Todos los elementos encontrados, mostrando modal');
        nombreModal.textContent = nombre;
        inputNroVenta.value = nroVenta;
        inputItem.value = item;
        modal.style.display = 'flex';
        modal.classList.add('show');
        console.log('🎭 DETALLE - Clase show agregada, modal debería ser visible');
    } else {
        console.error('❌ DETALLE - No se encontraron todos los elementos del modal');
    }

    setTimeout(() => {
        const cancelBtn = modal.querySelector('.btn-secondary');
        if (cancelBtn) cancelBtn.focus();
    }, 100);
}

function cerrarModal() {
    const modal = document.getElementById('modalEliminar');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        // Limpiar valores
        const nombreModal = document.getElementById('nombreDetalleModal');
        const inputNroVenta = document.getElementById('nroVentaEliminar');
        const inputItem = document.getElementById('itemEliminar');
        
        if (nombreModal) nombreModal.textContent = '';
        if (inputNroVenta) inputNroVenta.value = '';
        if (inputItem) inputItem.value = '';
    }
}

function setupModalEventListeners() {
    // Cerrar modal haciendo clic en el overlay
    const modal = document.getElementById('modalEliminar');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                cerrarModal();
            }
        });
    }

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('modalEliminar');
            if (modal && modal.style.display === 'flex') {
                cerrarModal();
            }
        }
    });
}

// ===========================
// FUNCIONES DE ELIMINACIÓN
// ===========================
function setupDeleteButtons() {
    console.log('🗑️ DETALLE - Configurando botones de eliminación...');
    
    setTimeout(() => {
        const botonesEliminar = document.querySelectorAll('.btn-eliminar');
        console.log(`🔍 DETALLE - Botones encontrados: ${botonesEliminar.length}`);

        botonesEliminar.forEach(function(boton) {
            // Remover listeners anteriores
            boton.removeEventListener('click', handleDeleteClick);
            
            // Agregar nuevo listener
            boton.addEventListener('click', handleDeleteClick);
        });
    }, 500);
}

function handleDeleteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔥 DETALLE - CLICK DETECTADO EN ELIMINAR!');
    
    const nroVenta = this.getAttribute('data-nroventa');
    const item = this.getAttribute('data-item');
    const nombre = this.getAttribute('data-nombre');
    
    console.log('NroVenta:', nroVenta, 'Item:', item, 'Nombre:', nombre);
    
    if (nroVenta && item && nombre) {
        console.log('🎭 DETALLE - Llamando mostrarModalEliminar');
        mostrarModalEliminar(nroVenta, item, nombre);
    } else {
        console.error('❌ DETALLE - Faltan datos del detalle');
    }
}

// ===========================
// FUNCIONES DE ALERTAS
// ===========================
function autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(function(alert) {
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.className = 'alert-close-btn';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            color: inherit;
            opacity: 0.7;
            margin-left: auto;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        closeButton.addEventListener('click', function() {
            hideAlert(alert);
        });
        
        alert.appendChild(closeButton);
        
        setTimeout(function() {
            hideAlert(alert);
        }, 5000);
    });
}

function hideAlert(alert) {
    if (alert && alert.parentNode) {
        alert.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        
        setTimeout(function() {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 500);
    }
}

// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DETALLE.JS - DOM Cargado, inicializando...');
    
    // Inicializar funcionalidades
    setupSearch();
    setupDeleteButtons();
    setupModalEventListeners();
    autoHideAlerts();
    
    console.log('✅ DETALLE.JS - Inicialización completada');
});

// ===========================
// FUNCIONES GLOBALES (para compatibilidad)
// ===========================
window.mostrarModalEliminar = mostrarModalEliminar;
window.cerrarModal = cerrarModal;