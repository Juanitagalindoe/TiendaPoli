// Script para funcionalidades adicionales en la gestión de facturas
document.addEventListener('DOMContentLoaded', function() {
    
    // Función para mostrar totales actualizados en tiempo real
    function actualizarTotalesVisuales() {
        const filas = document.querySelectorAll('.detalles-tabla tbody tr');
        let subtotalAcumulado = 0;
        let descuentoAcumulado = 0;
        let totalAcumulado = 0;
        
        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length >= 7) {
                // Extraer valores (removiendo símbolo de moneda y comas)
                const subtotal = parseFloat(celdas[4].textContent.replace(/[$,]/g, '')) || 0;
                const descuento = parseFloat(celdas[5].textContent.replace(/[$,]/g, '')) || 0;
                const total = parseFloat(celdas[6].textContent.replace(/[$,]/g, '')) || 0;
                
                subtotalAcumulado += subtotal;
                descuentoAcumulado += descuento;
                totalAcumulado += total;
            }
        });
        
        // Actualizar elementos del resumen si existen
        const subtotalElement = document.querySelector('.resumen-linea.subtotal span:last-child');
        const descuentoElement = document.querySelector('.resumen-linea.descuento span:last-child');
        const totalElement = document.querySelector('.resumen-linea.total span:last-child');
        
        if (subtotalElement) {
            subtotalElement.textContent = formatearMoneda(subtotalAcumulado);
        }
        if (descuentoElement) {
            descuentoElement.textContent = formatearMoneda(descuentoAcumulado);
        }
        if (totalElement) {
            totalElement.textContent = formatearMoneda(totalAcumulado);
        }
    }
    
    // Función para formatear valores como moneda colombiana
    function formatearMoneda(valor) {
        return '$' + valor.toLocaleString('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    // Función para validar y calcular valores en formularios de detalle
    function calcularValoresDetalle() {
        const cantidadInput = document.getElementById('cantidad');
        const vlrUnitDisplay = document.querySelector('[data-vlr-unit]');
        const subtotalInput = document.getElementById('subtotal');
        const dctoInput = document.getElementById('dcto');
        const vlrTotalInput = document.getElementById('vlrTotal');
        
        if (cantidadInput && vlrUnitDisplay && subtotalInput && dctoInput && vlrTotalInput) {
            function recalcular() {
                const cantidad = parseFloat(cantidadInput.value) || 0;
                const vlrUnit = parseFloat(vlrUnitDisplay.getAttribute('data-vlr-unit')) || 0;
                const descuento = parseFloat(dctoInput.value) || 0;
                
                // Calcular subtotal
                const subtotal = cantidad * vlrUnit;
                subtotalInput.value = subtotal.toFixed(2);
                
                // Calcular total (subtotal - descuento)
                const total = subtotal - descuento;
                vlrTotalInput.value = Math.max(0, total).toFixed(2); // No permitir totales negativos
                
                // Actualizar visualización
                actualizarVisualizacionCalculo(cantidad, vlrUnit, subtotal, descuento, total);
            }
            
            // Agregar listeners para recálculo automático
            cantidadInput.addEventListener('input', recalcular);
            dctoInput.addEventListener('input', recalcular);
            
            // Cálculo inicial
            recalcular();
        }
    }
    
    // Función para actualizar la visualización del cálculo
    function actualizarVisualizacionCalculo(cantidad, vlrUnit, subtotal, descuento, total) {
        // Crear o actualizar elemento de vista previa
        let preview = document.getElementById('calculo-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.id = 'calculo-preview';
            preview.style.cssText = `
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 10px;
                margin-top: 10px;
                font-size: 0.9rem;
                color: #495057;
            `;
            
            // Insertar después del formulario
            const form = document.querySelector('form');
            if (form) {
                form.appendChild(preview);
            }
        }
        
        preview.innerHTML = `
            <strong>Vista Previa del Cálculo:</strong><br>
            Cantidad: ${cantidad} × Valor Unitario: ${formatearMoneda(vlrUnit)} = Subtotal: ${formatearMoneda(subtotal)}<br>
            Subtotal: ${formatearMoneda(subtotal)} - Descuento: ${formatearMoneda(descuento)} = <strong>Total: ${formatearMoneda(total)}</strong>
        `;
    }
    
    // Función para mostrar confirmaciones antes de eliminar
    function configurarConfirmacionesEliminacion() {
        const botonesEliminar = document.querySelectorAll('.btn-eliminar');
        
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', function(e) {
                e.preventDefault();
                
                const nroVenta = this.getAttribute('data-nro-venta');
                const item = this.getAttribute('data-item');
                const descripcion = this.getAttribute('data-descripcion') || 'este detalle';
                
                if (confirm(`¿Está seguro de que desea eliminar ${descripcion}?\n\nEsta acción recalculará automáticamente los totales del encabezado.`)) {
                    // Crear formulario temporal para enviar la eliminación
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = '/detalle/eliminar';
                    
                    const inputNroVenta = document.createElement('input');
                    inputNroVenta.type = 'hidden';
                    inputNroVenta.name = 'nroVenta';
                    inputNroVenta.value = nroVenta;
                    
                    const inputItem = document.createElement('input');
                    inputItem.type = 'hidden';
                    inputItem.name = 'item';
                    inputItem.value = item;
                    
                    form.appendChild(inputNroVenta);
                    form.appendChild(inputItem);
                    document.body.appendChild(form);
                    form.submit();
                }
            });
        });
    }
    
    // Función para highlight de cambios
    function highlightCambios() {
        // Destacar filas que fueron recientemente modificadas
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success')) {
            const rows = document.querySelectorAll('.detalles-tabla tbody tr');
            rows.forEach(row => {
                row.style.backgroundColor = '#d1edff';
                row.style.transition = 'background-color 3s ease';
                
                // Remover highlight después de 3 segundos
                setTimeout(() => {
                    row.style.backgroundColor = '';
                }, 3000);
            });
        }
    }
    
    // Inicializar todas las funcionalidades
    actualizarTotalesVisuales();
    calcularValoresDetalle();
    configurarConfirmacionesEliminacion();
    highlightCambios();
    
    // Actualizar totales cada vez que se modifica la tabla (útil para contenido dinámico)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                actualizarTotalesVisuales();
            }
        });
    });
    
    const tablaDetalles = document.querySelector('.detalles-tabla tbody');
    if (tablaDetalles) {
        observer.observe(tablaDetalles, { childList: true, subtree: true });
    }
    
    console.log('✅ Sistema de cálculo automático de totales inicializado correctamente');
});