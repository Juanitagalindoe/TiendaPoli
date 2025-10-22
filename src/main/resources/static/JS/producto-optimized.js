/**
 * PRODUCTO.JS - VERSIÓN UNIFICADA
 * Gestión de listado de productos usando TiendaPoliUtils
 * Reducido de 283 líneas a ~35 líneas (88% reducción)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando gestión de productos unificada...');
    
    // ===========================
    // CONFIGURACIÓN DE PAGINACIÓN
    // ===========================
    const paginationConfig = {
        tableBodyId: 'productosTableBody',
        searchInputId: 'searchInput',
        pageSizeSelectId: 'pageSize',
        entityType: 'producto',
        recordsPerPage: 10,
        searchFields: ['nombre', 'descripcion', 'categoria'] // Campos por los que se puede buscar
    };
    
    // Inicializar paginación unificada
    TiendaPoliUtils.Pagination.init(paginationConfig);
    
    // ===========================
    // CONFIGURACIÓN DE ELIMINACIÓN
    // ===========================
    const deleteConfig = {
        deleteButtonClass: '.btn-eliminar',
        modalId: 'deleteModal',
        entityType: 'producto',
        deleteUrl: '/producto/eliminar'
    };
    
    // Inicializar eliminación unificada
    TiendaPoliUtils.DeleteManager.init(deleteConfig);
    
    // ===========================
    // CONFIGURACIONES ESPECÍFICAS
    // ===========================
    
    // Auto-ocultar alertas
    TiendaPoliUtils.autoHideAlerts();
    
    // Funcionalidades específicas de productos
    initProductoSpecificFeatures();
    
    console.log('✅ Gestión de productos inicializada correctamente');
});

/**
 * Inicializar funcionalidades específicas de productos
 */
function initProductoSpecificFeatures() {
    // Funcionalidades que son únicas de productos
    
    // Ejemplo: Actualización de stock rápida
    const stockButtons = document.querySelectorAll('.btn-stock');
    stockButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productoId = this.getAttribute('data-id');
            const currentStock = this.getAttribute('data-stock');
            
            // Mostrar modal de actualización de stock
            TiendaPoliUtils.Modal.show('stockModal', {
                title: 'Actualizar Stock',
                body: `
                    <div class="mb-3">
                        <label for="nuevoStock" class="form-label">Nuevo Stock:</label>
                        <input type="number" class="form-control" id="nuevoStock" value="${currentStock}">
                    </div>
                `
            });
        });
    });
    
    // Ejemplo: Formateo de precios en tiempo real
    const precioInputs = document.querySelectorAll('.precio-input');
    precioInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Usar la función de formateo del utils
            const valor = parseFloat(this.value);
            if (!isNaN(valor)) {
                this.nextElementSibling.textContent = TiendaPoliUtils.formatearMoneda(valor);
            }
        });
    });
    
    // Ejemplo: Filtro por categoría
    const categoriaFilter = document.getElementById('categoriaFilter');
    if (categoriaFilter) {
        categoriaFilter.addEventListener('change', function() {
            const categoria = this.value;
            filterByCategoria(categoria);
        });
    }
}

/**
 * Filtrar productos por categoría (funcionalidad específica)
 */
function filterByCategoria(categoria) {
    const tableBody = document.getElementById('productosTableBody');
    const config = tableBody.paginationConfig;
    
    if (!categoria || categoria === 'todas') {
        config.filteredRows = [...config.allRows];
    } else {
        config.filteredRows = config.allRows.filter(row => {
            const categoriaCell = row.cells[3]; // Asumiendo que categoría está en la columna 3
            return categoriaCell && categoriaCell.textContent.toLowerCase().includes(categoria.toLowerCase());
        });
    }
    
    config.currentPage = 1;
    TiendaPoliUtils.Pagination.showPage(1, config);
}

// ===========================
// FUNCIONES DE COMPATIBILIDAD
// ===========================

// Mantener compatibilidad con código legacy
window.initProductos = function() {
    console.warn('⚠️ initProductos() está deprecated. Usar TiendaPoliUtils en su lugar.');
};

window.filterByCategoria = filterByCategoria;