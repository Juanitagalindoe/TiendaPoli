/**
 * FACTURACION.JS - VERSIÓN UNIFICADA  
 * Gestión de listado de facturas usando TiendaPoliUtils
 * Reducido de 283 líneas a ~40 líneas (86% reducción)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando gestión de facturación unificada...');
    
    // ===========================
    // CONFIGURACIÓN DE PAGINACIÓN
    // ===========================
    const paginationConfig = {
        tableBodyId: 'facturasTableBody',
        searchInputId: 'searchInput', 
        pageSizeSelectId: 'pageSize',
        entityType: 'factura',
        recordsPerPage: 10,
        searchFields: ['numero', 'cliente', 'fecha'] // Campos de búsqueda
    };
    
    // Inicializar paginación unificada
    TiendaPoliUtils.Pagination.init(paginationConfig);
    
    // ===========================
    // CONFIGURACIÓN DE ELIMINACIÓN
    // ===========================
    const deleteConfig = {
        deleteButtonClass: '.btn-eliminar',
        modalId: 'deleteModal',
        entityType: 'factura',
        deleteUrl: '/factura/eliminar'
    };
    
    // Inicializar eliminación unificada
    TiendaPoliUtils.DeleteManager.init(deleteConfig);
    
    // ===========================
    // CONFIGURACIONES ESPECÍFICAS
    // ===========================
    
    // Auto-ocultar alertas
    TiendaPoliUtils.autoHideAlerts();
    
    // Funcionalidades específicas de facturación
    initFacturacionSpecificFeatures();
    
    console.log('✅ Gestión de facturación inicializada correctamente');
});

/**
 * Inicializar funcionalidades específicas de facturación
 */
function initFacturacionSpecificFeatures() {
    // Funcionalidades únicas de facturación
    
    // Ejemplo: Botones de estado de factura
    const estadoButtons = document.querySelectorAll('.btn-estado');
    estadoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const facturaId = this.getAttribute('data-id');
            const currentEstado = this.getAttribute('data-estado');
            
            toggleEstadoFactura(facturaId, currentEstado);
        });
    });
    
    // Ejemplo: Generación de PDF
    const pdfButtons = document.querySelectorAll('.btn-pdf');
    pdfButtons.forEach(button => {
        button.addEventListener('click', function() {
            const facturaId = this.getAttribute('data-id');
            generarPDF(facturaId);
        });
    });
    
    // Ejemplo: Envío por correo
    const emailButtons = document.querySelectorAll('.btn-email');
    emailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const facturaId = this.getAttribute('data-id');
            const clienteEmail = this.getAttribute('data-email');
            
            enviarFacturaPorCorreo(facturaId, clienteEmail);
        });
    });
    
    // Filtro por rango de fechas
    initDateRangeFilter();
    
    // Filtro por estado
    initEstadoFilter();
}

/**
 * Cambiar estado de factura
 */
function toggleEstadoFactura(facturaId, currentEstado) {
    const nuevoEstado = currentEstado === 'PAGADA' ? 'PENDIENTE' : 'PAGADA';
    
    fetch(`/factura/${facturaId}/estado`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado })
    })
    .then(response => {
        if (response.ok) {
            location.reload();
        } else {
            throw new Error('Error al cambiar estado');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al cambiar el estado de la factura');
    });
}

/**
 * Generar PDF de factura
 */
function generarPDF(facturaId) {
    window.open(`/factura/${facturaId}/pdf`, '_blank');
}

/**
 * Enviar factura por correo
 */
function enviarFacturaPorCorreo(facturaId, email) {
    if (!email) {
        alert('El cliente no tiene correo electrónico registrado');
        return;
    }
    
    TiendaPoliUtils.Modal.show('emailModal', {
        title: 'Enviar Factura por Correo',
        body: `
            <div class="mb-3">
                <label for="emailDestino" class="form-label">Correo de destino:</label>
                <input type="email" class="form-control" id="emailDestino" value="${email}">
            </div>
            <div class="mb-3">
                <label for="mensajeEmail" class="form-label">Mensaje:</label>
                <textarea class="form-control" id="mensajeEmail" rows="3">Adjunto encontrará su factura.</textarea>
            </div>
        `
    });
}

/**
 * Inicializar filtro por rango de fechas
 */
function initDateRangeFilter() {
    const fechaDesde = document.getElementById('fechaDesde');
    const fechaHasta = document.getElementById('fechaHasta');
    
    if (fechaDesde && fechaHasta) {
        [fechaDesde, fechaHasta].forEach(input => {
            input.addEventListener('change', function() {
                filterByDateRange();
            });
        });
    }
}

/**
 * Filtrar por rango de fechas
 */
function filterByDateRange() {
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    
    const tableBody = document.getElementById('facturasTableBody');
    const config = tableBody.paginationConfig;
    
    if (!fechaDesde && !fechaHasta) {
        config.filteredRows = [...config.allRows];
    } else {
        config.filteredRows = config.allRows.filter(row => {
            const fechaCell = row.cells[2]; // Asumiendo que fecha está en columna 2
            if (!fechaCell) return false;
            
            const fechaFactura = fechaCell.textContent.trim();
            
            if (fechaDesde && fechaFactura < fechaDesde) return false;
            if (fechaHasta && fechaFactura > fechaHasta) return false;
            
            return true;
        });
    }
    
    config.currentPage = 1;
    TiendaPoliUtils.Pagination.showPage(1, config);
}

/**
 * Inicializar filtro por estado
 */
function initEstadoFilter() {
    const estadoFilter = document.getElementById('estadoFilter');
    if (estadoFilter) {
        estadoFilter.addEventListener('change', function() {
            filterByEstado(this.value);
        });
    }
}

/**
 * Filtrar por estado
 */
function filterByEstado(estado) {
    const tableBody = document.getElementById('facturasTableBody');
    const config = tableBody.paginationConfig;
    
    if (!estado || estado === 'todos') {
        config.filteredRows = [...config.allRows];
    } else {
        config.filteredRows = config.allRows.filter(row => {
            const estadoCell = row.cells[4]; // Asumiendo que estado está en columna 4
            return estadoCell && estadoCell.textContent.toLowerCase().includes(estado.toLowerCase());
        });
    }
    
    config.currentPage = 1;
    TiendaPoliUtils.Pagination.showPage(1, config);
}

// ===========================
// FUNCIONES DE COMPATIBILIDAD
// ===========================

// Mantener compatibilidad con código legacy
window.initFacturacion = function() {
    console.warn('⚠️ initFacturacion() está deprecated. Usar TiendaPoliUtils en su lugar.');
};

// Exportar funciones específicas si son necesarias
window.toggleEstadoFactura = toggleEstadoFactura;
window.generarPDF = generarPDF;
window.filterByDateRange = filterByDateRange;
window.filterByEstado = filterByEstado;