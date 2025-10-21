/**
 * ENCABEZADO.JS - Sistema de Paginación y Gestión de Facturas
 * Versión: 2.0 - Actualizado con diseño modular
 */

// ===========================
// CONFIGURACIÓN GLOBAL
// ===========================
let paginationData = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    filteredItems: 0,
    allRows: [],
    filteredRows: []
};

// ===========================
// FUNCIONES DE PAGINACIÓN
// ===========================
function initializePagination() {
    console.log('🚀 ENCABEZADO - Inicializando paginación...');
    
    const tableBody = document.getElementById('encabezadosTableBody');
    if (!tableBody) {
        console.error('❌ No se encontró la tabla de encabezados');
        return;
    }

    // Obtener todas las filas de datos (excluir mensajes)
    paginationData.allRows = Array.from(tableBody.querySelectorAll('tr')).filter(row => {
        return !row.id || row.id !== 'noResultsMessage';
    });

    paginationData.totalItems = paginationData.allRows.length;
    paginationData.filteredRows = [...paginationData.allRows];
    paginationData.filteredItems = paginationData.totalItems;

    console.log(`📊 Total de facturas encontradas: ${paginationData.totalItems}`);

    // Configurar controles de paginación
    setupPaginationControls();
    
    // Mostrar primera página
    showPage(1);
    updatePaginationInfo();
}

function setupPaginationControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageSize = document.getElementById('pageSize');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (paginationData.currentPage > 1) {
                showPage(paginationData.currentPage - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(paginationData.filteredItems / paginationData.itemsPerPage);
            if (paginationData.currentPage < totalPages) {
                showPage(paginationData.currentPage + 1);
            }
        });
    }

    if (pageSize) {
        pageSize.addEventListener('change', (e) => {
            paginationData.itemsPerPage = parseInt(e.target.value);
            showPage(1); // Volver a la primera página
        });
    }
}

function showPage(pageNumber) {
    console.log(`📄 ENCABEZADO - Mostrando página ${pageNumber}`);
    
    const tableBody = document.getElementById('encabezadosTableBody');
    const startIndex = (pageNumber - 1) * paginationData.itemsPerPage;
    const endIndex = startIndex + paginationData.itemsPerPage;

    // Ocultar todas las filas
    paginationData.allRows.forEach(row => {
        row.style.display = 'none';
    });

    // Mostrar filas de la página actual
    const rowsToShow = paginationData.filteredRows.slice(startIndex, endIndex);
    rowsToShow.forEach(row => {
        row.style.display = '';
    });

    paginationData.currentPage = pageNumber;
    updatePaginationInfo();
    updatePaginationButtons();

    console.log(`✅ Mostrando filas ${startIndex + 1} a ${Math.min(endIndex, paginationData.filteredItems)}`);
}

function updatePaginationInfo() {
    const paginationInfo = document.getElementById('paginationInfo');
    const pageInfo = document.getElementById('pageInfo');
    
    const startIndex = (paginationData.currentPage - 1) * paginationData.itemsPerPage;
    const endIndex = Math.min(startIndex + paginationData.itemsPerPage, paginationData.filteredItems);
    const totalPages = Math.ceil(paginationData.filteredItems / paginationData.itemsPerPage);

    if (paginationInfo) {
        if (paginationData.filteredItems === 0) {
            paginationInfo.textContent = 'No hay facturas para mostrar';
        } else {
            paginationInfo.textContent = `Mostrando ${startIndex + 1}-${endIndex} de ${paginationData.filteredItems} facturas`;
        }
    }

    if (pageInfo) {
        pageInfo.textContent = `Página ${paginationData.currentPage} de ${Math.max(1, totalPages)}`;
    }
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalPages = Math.ceil(paginationData.filteredItems / paginationData.itemsPerPage);

    if (prevBtn) {
        prevBtn.disabled = paginationData.currentPage <= 1;
        prevBtn.classList.toggle('disabled', paginationData.currentPage <= 1);
    }

    if (nextBtn) {
        nextBtn.disabled = paginationData.currentPage >= totalPages;
        nextBtn.classList.toggle('disabled', paginationData.currentPage >= totalPages);
    }
}

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
        console.log(`🔍 Buscando: "${searchTerm}"`);
        
        performSearch(searchTerm);
    });
}

function performSearch(searchTerm) {
    const tableBody = document.getElementById('encabezadosTableBody');
    
    // Remover mensaje anterior de "no resultados"
    const existingMessage = document.getElementById('noResultsMessage');
    if (existingMessage) {
        existingMessage.remove();
    }

    if (searchTerm === '') {
        // Mostrar todas las filas
        paginationData.filteredRows = [...paginationData.allRows];
        paginationData.filteredItems = paginationData.totalItems;
    } else {
        // Filtrar filas basado en el término de búsqueda
        paginationData.filteredRows = paginationData.allRows.filter(row => {
            const cells = row.getElementsByTagName('td');
            
            for (let i = 0; i < cells.length - 1; i++) { // Excluir columna de acciones
                const cellText = cells[i].textContent.toLowerCase();
                if (cellText.includes(searchTerm)) {
                    return true;
                }
            }
            return false;
        });
        
        paginationData.filteredItems = paginationData.filteredRows.length;
    }

    // Si no hay resultados, mostrar mensaje
    if (paginationData.filteredItems === 0 && searchTerm !== '') {
        const noResultsRow = document.createElement('tr');
        noResultsRow.id = 'noResultsMessage';
        noResultsRow.innerHTML = `
            <td colspan="8" class="no-results-message">
                <i class="fas fa-search"></i>
                No se encontraron facturas que coincidan con "<strong>${searchTerm}</strong>"
            </td>
        `;
        tableBody.appendChild(noResultsRow);
    }

    // Volver a la primera página y actualizar vista
    showPage(1);
}

// ===========================
// FUNCIONES DEL MODAL
// ===========================
function mostrarModalEliminar(encabezadoId, nombre) {
    console.log('🎭 ENCABEZADO - Mostrando modal para:', nombre);
    const modal = document.getElementById('modalEliminar');
    const nombreModal = document.getElementById('nombreEncabezadoModal');
    const inputId = document.getElementById('encabezadoIdEliminar');

    console.log('Modal encontrado:', modal);
    console.log('NombreModal encontrado:', nombreModal);
    console.log('InputId encontrado:', inputId);

    if (modal && nombreModal && inputId) {
        console.log('✅ ENCABEZADO - Todos los elementos encontrados, mostrando modal');
        nombreModal.textContent = nombre;
        inputId.value = encabezadoId;
        modal.style.display = 'flex';
        modal.classList.add('show');
        console.log('🎭 ENCABEZADO - Clase show agregada, modal debería ser visible');
    } else {
        console.error('❌ ENCABEZADO - No se encontraron todos los elementos del modal');
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
        const nombreModal = document.getElementById('nombreEncabezadoModal');
        const inputId = document.getElementById('encabezadoIdEliminar');
        
        if (nombreModal) nombreModal.textContent = '';
        if (inputId) inputId.value = '';
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
    console.log('🗑️ ENCABEZADO - Configurando botones de eliminación...');
    
    setTimeout(() => {
        const botonesEliminar = document.querySelectorAll('.btn-eliminar');
        console.log(`🔍 ENCABEZADO - Botones encontrados: ${botonesEliminar.length}`);

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
    
    console.log('🔥 ENCABEZADO - CLICK DETECTADO EN ELIMINAR!');
    
    const encabezadoId = this.getAttribute('data-id');
    const encabezadoNombre = this.getAttribute('data-nombre');
    
    console.log('ID:', encabezadoId, 'Nombre:', encabezadoNombre);
    
    if (encabezadoId && encabezadoNombre) {
        console.log('🎭 ENCABEZADO - Llamando mostrarModalEliminar');
        mostrarModalEliminar(encabezadoId, encabezadoNombre);
    } else {
        console.error('❌ ENCABEZADO - Faltan datos del encabezado');
    }
}

// ===========================
// FUNCIONES DE ALERTAS
// ===========================
function autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-dismissible)');
    
    alerts.forEach(function(alert) {
        // Solo agregar botón de cierre si no existe
        if (!alert.querySelector('.btn-close')) {
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '×';
            closeButton.className = 'btn-close';
            closeButton.setAttribute('aria-label', 'Cerrar');
            closeButton.onclick = function() {
                hideAlert(alert);
            };
            alert.appendChild(closeButton);
        }
        
        // Auto-ocultar después de 6 segundos
        setTimeout(function() {
            hideAlert(alert);
        }, 6000);
    });
}

function hideAlert(alert) {
    if (alert && alert.parentNode) {
        alert.classList.add('fade');
        alert.classList.remove('show');
        
        setTimeout(function() {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 150);
    }
}

// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ENCABEZADO.JS - DOM Cargado, inicializando...');
    
    // Inicializar funcionalidades
    initializePagination();
    setupSearch();
    setupDeleteButtons();
    setupModalEventListeners();
    autoHideAlerts();
    
    console.log('✅ ENCABEZADO.JS - Inicialización completada');
});

// ===========================
// FUNCIONES GLOBALES (para compatibilidad)
// ===========================
window.mostrarModalEliminar = mostrarModalEliminar;
window.cerrarModal = cerrarModal;