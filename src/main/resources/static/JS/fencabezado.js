/**
 * JavaScript para el formulario de encabezado (fencabezado.html)
 * Maneja cálculos automáticos y validaciones del formulario de factura
 */

document.addEventListener('DOMContentLoaded', function() {
    const subtotalInput = document.getElementById('subtotal');
    const descuentoInput = document.getElementById('dcto');
    const totalInput = document.getElementById('total');

    // Función para calcular el total automáticamente
    function calcularTotal() {
        const subtotal = parseFloat(subtotalInput.value) || 0;
        const descuento = parseFloat(descuentoInput.value) || 0;
        const total = subtotal - descuento;
        
        if (total >= 0) {
            totalInput.value = total.toFixed(2);
        } else {
            totalInput.value = '0.00';
        }
    }

    // Event listeners para cálculo automático
    subtotalInput.addEventListener('input', calcularTotal);
    descuentoInput.addEventListener('input', calcularTotal);

    // Validación del descuento para que no sea mayor al subtotal
    descuentoInput.addEventListener('blur', function() {
        const subtotal = parseFloat(subtotalInput.value) || 0;
        const descuento = parseFloat(this.value) || 0;
        
        if (descuento > subtotal) {
            alert('El descuento no puede ser mayor al subtotal');
            this.value = subtotal.toString();
            calcularTotal();
        }
    });

    // Establecer fecha y hora actuales si es un nuevo registro
    const esModificacion = document.querySelector('input[name="esModificacion"]').value === 'true';
    
    if (!esModificacion) {
        // Establecer fecha actual
        const fechaInput = document.getElementById('fechaStr');
        if (!fechaInput.value) {
            const hoy = new Date();
            const fecha = hoy.toISOString().split('T')[0];
            fechaInput.value = fecha;
        }

        // Establecer hora actual
        const horaInput = document.getElementById('horaStr');
        if (!horaInput.value) {
            const ahora = new Date();
            const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);
            horaInput.value = hora;
        }
    }
});