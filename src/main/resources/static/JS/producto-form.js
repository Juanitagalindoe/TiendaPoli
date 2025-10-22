/**
 * PRODUCTO FORM - VALIDACIONES Y FUNCIONALIDAD
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    const form = document.querySelector('form');
    const nombreInput = document.getElementById('nombreProducto');
    const descripcionInput = document.getElementById('descripcion');
    const vlrUnitInput = document.getElementById('vlrUnitProducto');
    const stockInput = document.getElementById('stockProducto');
    const btnGuardar = document.getElementById('btnGuardar');

    // Elementos de error
    const nombreError = document.getElementById('nombreError');
    const descripcionError = document.getElementById('descripcionError');
    const vlrUnitError = document.getElementById('vlrUnitError');
    const stockError = document.getElementById('stockError');

    // Verificar que todos los elementos existan
    if (!form || !nombreInput || !descripcionInput || !vlrUnitInput || !stockInput || !btnGuardar) {
        console.error('Error: No se pudieron encontrar todos los elementos del formulario');
        console.log('Elementos encontrados:', {
            form: !!form,
            nombreInput: !!nombreInput,
            descripcionInput: !!descripcionInput,
            vlrUnitInput: !!vlrUnitInput,
            stockInput: !!stockInput,
            btnGuardar: !!btnGuardar
        });
        return;
    }

    // Inicializar estado limpio de los campos
    inicializarEstadoCampos();
    
    // Configurar validaciones en tiempo real
    configurarValidaciones();
    
    // Configurar envío del formulario
    configurarEnvioFormulario();

    /**
     * Inicializa el estado limpio de todos los campos (sin errores)
     */
    function inicializarEstadoCampos() {
        // Limpiar estado de todos los campos
        [nombreInput, descripcionInput, vlrUnitInput, stockInput].forEach(input => {
            if (input) {
                input.classList.remove('is-valid', 'is-invalid');
            }
        });
        
        // Ocultar todos los mensajes de error
        [nombreError, descripcionError, vlrUnitError, stockError].forEach(errorElement => {
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        });
    }

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
        
        if (!/^[a-zA-ZÀ-ÿ0-9\s\-\_\.\*\+áéíóúÁÉÍÓÚ%#\/]+$/.test(nombre)) {
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
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
    }

    /**
     * Muestra un mensaje de advertencia para un campo específico
     */
    function mostrarAdvertencia(input, errorElement, mensaje) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
        errorElement.style.color = 'var(--warning-color)';
    }

    /**
     * Oculta el mensaje de error para un campo específico
     */
    function ocultarError(input, errorElement) {
        input.classList.remove('is-invalid');
        // Solo agregar 'is-valid' si el campo tiene contenido válido
        if (input.value.trim() !== '') {
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
        }
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }

    /**
     * Limpia completamente el estado de un campo (sin error ni válido)
     */
    function limpiarEstadoCampo(input, errorElement) {
        input.classList.remove('is-invalid', 'is-valid');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
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
     * Formatea enteros (para stock) - simplificado
     */
    function formatearEntero(input) {
        let valor = input.value.replace(/[^0-9]/g, '');
        if (valor === '' || valor.length > 6) {
            valor = valor.substring(0, 6);
        }
        input.value = valor;
    }

    /**
     * Valida todo el formulario
     */
    function validarFormulario() {
        console.log('🔍 Iniciando validación del formulario de productos...');
        
        const nombreValido = validarNombre();
        console.log('✓ Validación nombre:', nombreValido);
        
        const descripcionValida = validarDescripcion();
        console.log('✓ Validación descripción:', descripcionValida);
        
        const valorValido = validarValorUnitario();
        console.log('✓ Validación valor unitario:', valorValido);
        
        const stockValido = validarStock();
        console.log('✓ Validación stock:', stockValido);
        
        const formularioValido = nombreValido && descripcionValida && valorValido && stockValido;
        console.log('🎯 Resultado final de validación:', formularioValido);
        
        return formularioValido;
    }

    /**
     * Configura el envío del formulario
     */
    function configurarEnvioFormulario() {
        console.log('⚙️ Configurando envío del formulario de productos...');
        
        // Verificar que el formulario existe
        if (!form) {
            console.error('❌ Error: Formulario no encontrado');
            return;
        }
        
        // Verificar que el botón de guardar existe
        if (!btnGuardar) {
            console.error('❌ Error: Botón de guardar no encontrado');
            return;
        }
        
        console.log('✅ Elementos del formulario encontrados correctamente');
        
        form.addEventListener('submit', function(e) {
            console.log('📝 Intento de envío del formulario...');
            e.preventDefault();
            
            // Validar todo el formulario
            console.log('🔍 Ejecutando validación completa...');
            if (!validarFormulario()) {
                console.log('❌ Validación falló, deteniendo envío');
                mostrarMensajeGeneral('Por favor, corrija los errores antes de continuar', 'error');
                return;
            }
            
            console.log('✅ Validación exitosa, procediendo con el envío');
            
            // Deshabilitar botón para evitar envíos múltiples
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '⏳ Guardando...';
            
            // Enviar formulario
            console.log('🚀 Enviando formulario...');
            setTimeout(() => {
                form.submit();
            }, 500);
        });
    }

    /**
     * Muestra un mensaje general - ahora usa TiendaPoliUtils
     */
    function mostrarMensajeGeneral(mensaje, tipo) {
        TiendaPoliUtils.mostrarMensajeGeneral(mensaje, tipo, '.form-container', 5000);
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
// Formatear número con separadores de miles - usa función de formateo entero de utils
function formatearMoneda(numero) {
    return TiendaPoliUtils.formatearMoneda(numero, true, 0, true);
}

// Limpiar formulario - ahora usa TiendaPoliUtils
function limpiarFormulario() {
    const form = document.querySelector('form');
    if (form) {
        TiendaPoliUtils.limpiarFormulario(form, true);
        
        // Funcionalidad específica: enfocar primer campo
        const primerCampo = form.querySelector('.form-input');
        if (primerCampo) {
            primerCampo.focus();
        }
    }
}