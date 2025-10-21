/**
 * JavaScript para factura-detalle.html
 * Maneja la funcionalidad de la vista de factura
 */

document.addEventListener('DOMContentLoaded', function() {
    // Función para calcular totales automáticamente si no vienen del backend
    function calcularTotales() {
        const filas = document.querySelectorAll('.detalles-tabla tbody tr');
        let totalSubtotal = 0;
        let totalDescuento = 0;
        let totalPagar = 0;

        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length >= 7) {
                // Extraer valores numéricos (removiendo $ y comas)
                const subtotal = parseFloat(celdas[4].textContent.replace(/[$,]/g, '')) || 0;
                const descuento = parseFloat(celdas[5].textContent.replace(/[$,]/g, '')) || 0;
                const total = parseFloat(celdas[6].textContent.replace(/[$,]/g, '')) || 0;

                totalSubtotal += subtotal;
                totalDescuento += descuento;
                totalPagar += total;
            }
        });

        // Actualizar los totales en el resumen si no vienen del backend
        const subtotalElement = document.querySelector('.resumen-linea.subtotal span:last-child');
        const descuentoElement = document.querySelector('.resumen-linea.descuento span:last-child');
        const totalElement = document.querySelector('.resumen-linea.total span:last-child');

        if (subtotalElement && subtotalElement.textContent === '$0.00') {
            subtotalElement.textContent = '$' + totalSubtotal.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
        if (descuentoElement && descuentoElement.textContent === '$0.00') {
            descuentoElement.textContent = '$' + totalDescuento.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
        if (totalElement && totalElement.textContent === '$0.00') {
            totalElement.textContent = '$' + totalPagar.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
    }

    // Ejecutar cálculo de totales
    calcularTotales();

    // Mejorar la experiencia de impresión
    window.addEventListener('beforeprint', function() {
        document.title = 'Factura_' + document.querySelector('.factura-numero span').textContent;
    });

    // Añadir efecto hover a las filas de la tabla
    const filas = document.querySelectorAll('.detalles-tabla tbody tr');
    filas.forEach(fila => {
        fila.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.01)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        fila.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});