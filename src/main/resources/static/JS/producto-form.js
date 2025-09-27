/**
 * PRODUCTO FORM - VALIDACIONES Y FUNCIONALIDAD
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    const form = document.querySelector('form');
    const nombreInput = document.getElementById('nombre');
    const descripcionInput = document.getElementById('descripcion');
    const vlrUnitInput = document.getElementById('vlrUnit');
    const stockInput = document.getElementById('stock');
    const btnGuardar = document.getElementById('btnGuardar');

    // Elementos de error
    const nombreError = document.getElementById('nombreError');
    const descripcionError = document.getElementById('descripcionError');
    const vlrUnitError = document.getElementById('vlrUnitError');
    const stockError = document.getElementById('stockError');

    // Configurar validaciones en tiempo real
    configurarValidaciones();
    
    // Configurar envío del formulario
    configurarEnvioFormulario();

    /**
     * Configura las validaciones en tiempo real para todos los campos
     */
    function configurarValidaciones() {
        // Validación del nombre
        nombreInput.addEventListener('input', function() {
            validarNombre();
        });

        nombreInput.addEventListener('blur', function() {
            validarNombre();
        });

        // Validación de la descripción
        descripcionInput.addEventListener('input', function() {
            validarDescripcion();
        });

        descripcionInput.addEventListener('blur', function() {
            validarDescripcion();
        });

        // Validación del valor unitario
        vlrUnitInput.addEventListener('input', function() {
            validarValorUnitario();
        });

        vlrUnitInput.addEventListener('blur', function() {
            validarValorUnitario();
        });

        // Validación del stock
        stockInput.addEventListener('input', function() {
            validarStock();
        });

        stockInput.addEventListener('blur', function() {
            validarStock();
        });

        // Formatear valores numéricos mientras se escribe
        vlrUnitInput.addEventListener('input', function() {
            formatearNumero(this);
        });

        stockInput.addEventListener('input', function() {
            formatearEntero(this);
        });
    }

    /**
     * Valida el campo nombre del producto
     */
    function validarNombre() {
        const nombre = nombreInput.value.trim();
        
        if (nombre === '') {
            mostrarError(nombreInput, nombreError, 'El nombre del producto es obligatorio');
            return false;
        }
        
        if (nombre.length < 2) {
            mostrarError(nombreInput, nombreError, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }
        
        if (nombre.length > 100) {
            mostrarError(nombreInput, nombreError, 'El nombre no puede exceder 100 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZÀ-ÿ0-9\s\-\_\.]+$/.test(nombre)) {
            mostrarError(nombreInput, nombreError, 'El nombre contiene caracteres no válidos');
            return false;
        }
        
        ocultarError(nombreInput, nombreError);
        return true;
    }

    /**
     * Valida el campo descripción
     */
    function validarDescripcion() {
        const descripcion = descripcionInput.value.trim();
        
        if (descripcion === '') {
            mostrarError(descripcionInput, descripcionError, 'La descripción es obligatoria');
            return false;
        }
        
        if (descripcion.length < 5) {
            mostrarError(descripcionInput, descripcionError, 'La descripción debe tener al menos 5 caracteres');
            return false;
        }
        
        if (descripcion.length > 255) {
            mostrarError(descripcionInput, descripcionError, 'La descripción no puede exceder 255 caracteres');
            return false;
        }
        
        ocultarError(descripcionInput, descripcionError);
        return true;
    }

    /**
     * Valida el campo valor unitario
     */
    function validarValorUnitario() {
        const valor = parseInt(vlrUnitInput.value);
        
        if (isNaN(valor) || vlrUnitInput.value === '') {
            mostrarError(vlrUnitInput, vlrUnitError, 'El valor unitario es obligatorio');
            return false;
        }
        
        if (valor <= 0) {
            mostrarError(vlrUnitInput, vlrUnitError, 'El valor unitario debe ser mayor a 0');
            return false;
        }
        
        if (valor > 1000000000) {
            mostrarError(vlrUnitInput, vlrUnitError, 'El valor unitario es demasiado alto');
            return false;
        }
        
        ocultarError(vlrUnitInput, vlrUnitError);
        return true;
    }

    /**
     * Valida el campo stock
     */
    function validarStock() {
        const stock = parseInt(stockInput.value);
        
        if (isNaN(stock) || stockInput.value === '') {
            mostrarError(stockInput, stockError, 'El stock es obligatorio');
            return false;
        }
        
        if (stock < 0) {
            mostrarError(stockInput, stockError, 'El stock no puede ser negativo');
            return false;
        }
        
        if (stock > 999999) {
            mostrarError(stockInput, stockError, 'El stock no puede exceder 999,999 unidades');
            return false;
        }
        
        ocultarError(stockInput, stockError);
        return true;
    }

    /**
     * Muestra un mensaje de error para un campo específico
     */
    function mostrarError(input, errorElement, mensaje) {
        input.classList.remove('valid');
        input.classList.add('invalid');
        errorElement.textContent = mensaje;
        errorElement.classList.add('show');
    }

    /**
     * Oculta el mensaje de error para un campo específico
     */
    function ocultarError(input, errorElement) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    /**
     * Formatea números mientras se escribe (para valor unitario)
     */
    function formatearNumero(input) {
        let valor = input.value.replace(/[^0-9]/g, '');
        if (valor === '') {
            input.value = '';
            return;
        }
        
        // Limitar a 10 dígitos para evitar overflow
        if (valor.length > 10) {
            valor = valor.substring(0, 10);
        }
        
        input.value = valor;
    }

    /**
     * Formatea enteros (para stock)
     */
    function formatearEntero(input) {
        let valor = input.value.replace(/[^0-9]/g, '');
        if (valor === '') {
            input.value = '';
            return;
        }
        
        // Limitar a 6 dígitos para stock
        if (valor.length > 6) {
            valor = valor.substring(0, 6);
        }
        
        input.value = valor;
    }

    /**
     * Valida todo el formulario
     */
    function validarFormulario() {
        const nombreValido = validarNombre();
        const descripcionValida = validarDescripcion();
        const valorValido = validarValorUnitario();
        const stockValido = validarStock();
        
        return nombreValido && descripcionValida && valorValido && stockValido;
    }

    /**
     * Configura el envío del formulario
     */
    function configurarEnvioFormulario() {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar todo el formulario
            if (!validarFormulario()) {
                mostrarMensajeGeneral('Por favor, corrija los errores antes de continuar', 'error');
                return;
            }
            
            // Deshabilitar botón para evitar envíos múltiples
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '⏳ Guardando...';
            
            // Enviar formulario
            setTimeout(() => {
                form.submit();
            }, 500);
        });
    }

    /**
     * Muestra un mensaje general en la parte superior del formulario
     */
    function mostrarMensajeGeneral(mensaje, tipo) {
        // Remover mensajes anteriores
        const mensajesExistentes = document.querySelectorAll('.alert');
        mensajesExistentes.forEach(msg => msg.remove());
        
        // Crear nuevo mensaje
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo}`;
        alertDiv.innerHTML = `<strong>${tipo === 'error' ? '¡Error!' : '¡Éxito!'}</strong> ${mensaje}`;
        
        // Insertar antes del contenedor del formulario
        const formContainer = document.querySelector('.form-container');
        formContainer.parentNode.insertBefore(alertDiv, formContainer);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    /**
     * Inicialización adicional
     */
    function inicializar() {
        // Enfocar el primer campo
        nombreInput.focus();
        
        // Agregar placeholder dinámico para valor unitario
        vlrUnitInput.addEventListener('focus', function() {
            this.placeholder = 'Ejemplo: 15000';
        });
        
        vlrUnitInput.addEventListener('blur', function() {
            this.placeholder = '0';
        });
        
        // Agregar contador de caracteres para descripción
        agregarContadorCaracteres();
    }

    /**
     * Agrega un contador de caracteres para la descripción
     */
    function agregarContadorCaracteres() {
        const contador = document.createElement('div');
        contador.className = 'char-counter';
        contador.style.cssText = `
            font-size: 0.8rem;
            color: #6c757d;
            text-align: right;
            margin-top: 5px;
        `;
        
        function actualizarContador() {
            const longitud = descripcionInput.value.length;
            const maxLength = 255;
            contador.textContent = `${longitud}/${maxLength} caracteres`;
            
            if (longitud > maxLength * 0.9) {
                contador.style.color = '#ffc107';
            } else if (longitud > maxLength) {
                contador.style.color = '#dc3545';
            } else {
                contador.style.color = '#6c757d';
            }
        }
        
        descripcionInput.parentNode.appendChild(contador);
        descripcionInput.addEventListener('input', actualizarContador);
        actualizarContador();
    }

    // Inicializar la aplicación
    inicializar();
});

/**
 * Funciones utilitarias globales
 */

// Formatear número con separadores de miles
function formatearMoneda(numero) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numero);
}

// Limpiar formulario
function limpiarFormulario() {
    const form = document.querySelector('form');
    if (form) {
        form.reset();
        
        // Remover clases de validación
        const inputs = form.querySelectorAll('.form-input, .form-textarea');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        
        // Ocultar mensajes de error
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
        
        // Enfocar primer campo
        const primerCampo = form.querySelector('.form-input');
        if (primerCampo) {
            primerCampo.focus();
        }
    }
}