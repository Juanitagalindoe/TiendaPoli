/**
 * JavaScript para el formulario de detalle (fdetalle.html)
 * Maneja cálculos automáticos y validaciones del formulario
 */

document.addEventListener('DOMContentLoaded', function() {
    const productoSelect = document.getElementById('productoId');
    const cantidadInput = document.getElementById('cantidad');
    const subtotalInput = document.getElementById('subtotal');
    const descuentoInput = document.getElementById('dcto');
    const valorTotalInput = document.getElementById('vlrTotal');

    // Objeto para almacenar precios de productos
    const preciosProductos = {};
    
    // Llenar el objeto de precios desde las opciones del select
    Array.from(productoSelect.options).forEach(option => {
        if (option.value) {
            // Extraer el precio del texto de la opción
            const texto = option.textContent;
            const precioMatch = texto.match(/\$([0-9,.]+)/);
            if (precioMatch) {
                const precio = parseFloat(precioMatch[1].replace(/,/g, ''));
                preciosProductos[option.value] = precio;
            }
        }
    });

    // Función para calcular valores automáticamente
    function calcularValores() {
        const productoId = productoSelect.value;
        const cantidad = parseInt(cantidadInput.value) || 0;
        const descuento = parseFloat(descuentoInput.value) || 0;
        
        if (productoId && cantidad > 0 && preciosProductos[productoId]) {
            const precioUnitario = preciosProductos[productoId];
            const subtotal = precioUnitario * cantidad;
            const valorTotal = Math.max(0, subtotal - descuento);
            
            subtotalInput.value = subtotal.toFixed(2);
            valorTotalInput.value = valorTotal.toFixed(2);
        } else {
            subtotalInput.value = '0.00';
            valorTotalInput.value = '0.00';
        }
    }

    // Event listeners para cálculo automático
    productoSelect.addEventListener('change', calcularValores);
    cantidadInput.addEventListener('input', calcularValores);
    descuentoInput.addEventListener('input', calcularValores);

    // Validación del descuento para que no sea mayor al subtotal
    descuentoInput.addEventListener('blur', function() {
        const subtotal = parseFloat(subtotalInput.value) || 0;
        const descuento = parseFloat(this.value) || 0;
        
        if (descuento > subtotal) {
            alert('El descuento no puede ser mayor al subtotal');
            this.value = subtotal.toString();
            calcularValores();
        }
    });

    // Calcular valores iniciales si es una modificación
    const esModificacion = document.querySelector('input[name="esModificacion"]').value === 'true';
    if (esModificacion || (productoSelect.value && cantidadInput.value)) {
        calcularValores();
    }

    // Auto-completar número de item para nuevos registros
    if (!esModificacion) {
        const nroVentaSelect = document.getElementById('nroVenta');
        const itemInput = document.getElementById('item');
        
        nroVentaSelect.addEventListener('change', function() {
            if (this.value && !itemInput.value) {
                // Aquí podrías hacer una llamada AJAX para obtener el próximo número de item
                // Por ahora, sugerimos el item 1
                itemInput.value = '1';
            }
        });
    }
});