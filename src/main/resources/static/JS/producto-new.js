// ====================================
// TIENDAPOLI - GESTIÓN DE PRODUCTOS
// Sistema con paginación, búsqueda y eliminación
// ====================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 PRODUCTO.JS - Inicializando sistema de productos...');
    
    // Inicializar sistemas principales
    initTablePagination();
    initDeleteButtons();
    autoHideAlerts();
});

// ====================================
// SISTEMA DE PAGINACIÓN
// ====================================

let paginationData = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    allRows: [],
    filteredRows: []
};

function initTablePagination() {
    const tableBody = document.getElementById('productosTableBody');
    const searchInput = document.getElementById('searchInput');
    const pageSizeSelect = document.getElementById('pageSize');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    if (!tableBody) {
        console.warn('⚠️ No se encontró la tabla de productos');
        return;
    }
    
    // Obtener todas las filas
    paginationData.allRows = Array.from(tableBody.querySelectorAll('tr'));
    paginationData.filteredRows = [...paginationData.allRows];
    paginationData.totalItems = paginationData.allRows.length;
    
    console.log(`📊 Total de productos: ${paginationData.totalItems}`);
    
    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleSearch(this.value.toLowerCase().trim());
        });
    }
    
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', function() {
            paginationData.itemsPerPage = parseInt(this.value);
            paginationData.currentPage = 1;
            updatePagination();
        });
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (paginationData.currentPage > 1) {
                paginationData.currentPage--;
                updatePagination();
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (paginationData.currentPage < paginationData.totalPages) {
                paginationData.currentPage++;
                updatePagination();
            }
        });
    }
    
    // Mostrar primera página
    updatePagination();
}

function handleSearch(searchTerm) {
    if (searchTerm === '') {
        paginationData.filteredRows = [...paginationData.allRows];
    } else {
        paginationData.filteredRows = paginationData.allRows.filter(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).slice(0, -1).some(cell => 
                cell.textContent.toLowerCase().includes(searchTerm)
            );
        });
    }
    
    paginationData.totalItems = paginationData.filteredRows.length;
    paginationData.currentPage = 1;
    updatePagination();
}

function updatePagination() {
    paginationData.totalPages = Math.ceil(paginationData.totalItems / paginationData.itemsPerPage);
    
    // Mostrar página actual
    showPage(paginationData.currentPage);
    
    // Actualizar controles de paginación
    updatePaginationControls();
    
    // Actualizar información
    updatePaginationInfo();
}

function showPage(page) {
    const startIndex = (page - 1) * paginationData.itemsPerPage;
    const endIndex = startIndex + paginationData.itemsPerPage;
    
    // Ocultar todas las filas
    paginationData.allRows.forEach(row => {
        row.style.display = 'none';
    });
    
    // Mostrar filas de la página actual
    const pageRows = paginationData.filteredRows.slice(startIndex, endIndex);
    pageRows.forEach(row => {
        row.style.display = '';
    });
    
    console.log(`📄 Mostrando página ${page}: ${pageRows.length} productos`);
}

function updatePaginationControls() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    
    // Actualizar botones anterior/siguiente
    if (prevButton) {
        prevButton.disabled = paginationData.currentPage === 1;
    }
    
    if (nextButton) {
        nextButton.disabled = paginationData.currentPage === paginationData.totalPages || paginationData.totalPages === 0;
    }
    
    // Generar números de página
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        
        if (paginationData.totalPages <= 7) {
            // Mostrar todas las páginas si son pocas
            for (let i = 1; i <= paginationData.totalPages; i++) {
                createPageButton(i, pageNumbers);
            }
        } else {
            // Lógica para muchas páginas
            createPageButton(1, pageNumbers);
            
            if (paginationData.currentPage > 4) {
                pageNumbers.appendChild(createEllipsis());
            }
            
            const start = Math.max(2, paginationData.currentPage - 2);
            const end = Math.min(paginationData.totalPages - 1, paginationData.currentPage + 2);
            
            for (let i = start; i <= end; i++) {
                createPageButton(i, pageNumbers);
            }
            
            if (paginationData.currentPage < paginationData.totalPages - 3) {
                pageNumbers.appendChild(createEllipsis());
            }
            
            if (paginationData.totalPages > 1) {
                createPageButton(paginationData.totalPages, pageNumbers);
            }
        }
    }
}

function createPageButton(pageNum, container) {
    const button = document.createElement('button');
    button.className = `btn btn-sm ${pageNum === paginationData.currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
    button.textContent = pageNum;
    button.addEventListener('click', () => {
        paginationData.currentPage = pageNum;
        updatePagination();
    });
    container.appendChild(button);
}

function createEllipsis() {
    const span = document.createElement('span');
    span.textContent = '...';
    span.className = 'pagination-ellipsis';
    return span;
}

function updatePaginationInfo() {
    const paginationInfo = document.getElementById('paginationInfo');
    
    if (paginationInfo) {
        const start = paginationData.totalItems === 0 ? 0 : ((paginationData.currentPage - 1) * paginationData.itemsPerPage) + 1;
        const end = Math.min(paginationData.currentPage * paginationData.itemsPerPage, paginationData.totalItems);
        
        paginationInfo.textContent = `Mostrando ${start}-${end} de ${paginationData.totalItems} productos`;
    }
}

// ====================================
// SISTEMA DE ELIMINACIÓN
// ====================================

function initDeleteButtons() {
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    console.log('🔍 PRODUCTO.JS - Botones encontrados:', botonesEliminar.length);

    botonesEliminar.forEach(function(boton) {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productoId = this.getAttribute('data-id');
            const productoNombre = this.getAttribute('data-nombre');
            
            if (productoId && productoNombre) {
                mostrarModalEliminar(productoId, productoNombre);
            }
        });
    });
}

function mostrarModalEliminar(productoId, productoNombre) {
    const modal = document.getElementById('modalEliminar');
    const nombreModal = document.getElementById('nombreProductoModal');
    const inputId = document.getElementById('productoIdEliminar');

    if (modal && nombreModal && inputId) {
        nombreModal.textContent = productoNombre;
        inputId.value = productoId;
        modal.style.display = 'flex';
        modal.classList.add('show');

        setTimeout(() => {
            const cancelButton = modal.querySelector('.btn-secondary');
            if (cancelButton) {
                cancelButton.focus();
            }
        }, 100);
    }
}

function cerrarModal() {
    const modal = document.getElementById('modalEliminar');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        const inputId = document.getElementById('productoIdEliminar');
        const nombreModal = document.getElementById('nombreProductoModal');
        if (inputId) inputId.value = '';
        if (nombreModal) nombreModal.textContent = '';
    }
}

function autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(function(alert) {
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.style.opacity = '0';
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.parentNode.removeChild(alert);
                    }
                }, 300);
            }
        }, 5000);
    });
}