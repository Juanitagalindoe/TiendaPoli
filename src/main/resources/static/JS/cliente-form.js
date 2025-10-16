/**
 * CLIENTE FORM - VALIDACIONES Y FUNCIONALIDAD
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    const form = document.querySelector('form');
    const idInput = document.getElementById('idCliente');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const correoInput = document.getElementById('correo');
    const fechaRegistroInput = document.getElementById('fechaRegistro');
    const btnGuardar = document.getElementById('btnGuardar');

    // Elementos de error
    const idError = document.getElementById('idError');
    const nombreError = document.getElementById('nombreError');
    const apellidoError = document.getElementById('apellidoError');
    const correoError = document.getElementById('correoError');
    const fechaRegistroError = document.getElementById('fechaRegistroError');

    // Configurar validaciones en tiempo real
    configurarValidaciones();
    
    // Configurar envío del formulario
    configurarEnvioFormulario();
    
    // Configurar fecha por defecto
    configurarFechaPorDefecto();

    /**
     * Configura las validaciones en tiempo real para todos los campos
     */
    function configurarValidaciones() {
        // Validación del ID/Documento
        idInput.addEventListener('input', function() {
            validarId();
            formatearDocumento();
        });

        idInput.addEventListener('blur', function() {
            validarId();
        });

        // Validación del nombre
        nombreInput.addEventListener('input', function() {
            validarNombre();
            formatearNombre();
        });

        nombreInput.addEventListener('blur', function() {
            validarNombre();
        });

        // Validación del apellido
        apellidoInput.addEventListener('input', function() {
            validarApellido();
            formatearApellido();
        });

        apellidoInput.addEventListener('blur', function() {
            validarApellido();
        });

        // Validación del correo
        correoInput.addEventListener('input', function() {
            validarCorreo();
        });

        correoInput.addEventListener('blur', function() {
            validarCorreo();
        });

        // La fecha de registro se genera automáticamente, no necesita validación en tiempo real
    }

    /**
     * Valida el campo ID/Documento del cliente
     */
    function validarId() {
        // Si el campo está en modo readonly (modificación), no validar
        if (idInput.readOnly) {
            ocultarError(idInput, idError);
            return true;
        }
        
        const id = idInput.value.trim();
        
        if (id === '') {
            mostrarError(idInput, idError, 'El documento de identidad es obligatorio');
            return false;
        }
        
        if (id.length < 6) {
            mostrarError(idInput, idError, 'El documento debe tener al menos 6 caracteres');
            return false;
        }
        
        if (id.length > 20) {
            mostrarError(idInput, idError, 'El documento no puede exceder 20 caracteres');
            return false;
        }
        
        if (!/^[0-9A-Za-z\-]+$/.test(id)) {
            mostrarError(idInput, idError, 'El documento solo puede contener números, letras y guiones');
            return false;
        }
        
        ocultarError(idInput, idError);
        return true;
    }

    /**
     * Valida el campo nombre
     */
    function validarNombre() {
        const nombre = nombreInput.value.trim();
        
        if (nombre === '') {
            mostrarError(nombreInput, nombreError, 'El nombre es obligatorio');
            return false;
        }
        
        if (nombre.length < 2) {
            mostrarError(nombreInput, nombreError, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }
        
        if (nombre.length > 50) {
            mostrarError(nombreInput, nombreError, 'El nombre no puede exceder 50 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nombre)) {
            mostrarError(nombreInput, nombreError, 'El nombre solo puede contener letras y espacios');
            return false;
        }
        
        ocultarError(nombreInput, nombreError);
        return true;
    }

    /**
     * Valida el campo apellido
     */
    function validarApellido() {
        const apellido = apellidoInput.value.trim();
        
        if (apellido === '') {
            mostrarError(apellidoInput, apellidoError, 'El apellido es obligatorio');
            return false;
        }
        
        if (apellido.length < 2) {
            mostrarError(apellidoInput, apellidoError, 'El apellido debe tener al menos 2 caracteres');
            return false;
        }
        
        if (apellido.length > 50) {
            mostrarError(apellidoInput, apellidoError, 'El apellido no puede exceder 50 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(apellido)) {
            mostrarError(apellidoInput, apellidoError, 'El apellido solo puede contener letras y espacios');
            return false;
        }
        
        ocultarError(apellidoInput, apellidoError);
        return true;
    }

    /**
     * Valida el campo correo electrónico
     */
    function validarCorreo() {
        const correo = correoInput.value.trim();
        
        if (correo === '') {
            mostrarError(correoInput, correoError, 'El correo electrónico es obligatorio');
            return false;
        }
        
        if (correo.length > 100) {
            mostrarError(correoInput, correoError, 'El correo no puede exceder 100 caracteres');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            mostrarError(correoInput, correoError, 'Ingrese un correo electrónico válido');
            return false;
        }
        
        // Validar dominios comunes
        const dominiosComunes = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com'];
        const dominio = correo.split('@')[1];
        if (dominio && !dominiosComunes.includes(dominio) && !dominio.includes('.edu') && !dominio.includes('.gov')) {
            // Solo advertir, no bloquear
            mostrarAdvertencia(correoInput, correoError, 'Verifique que el dominio del correo sea correcto');
        } else {
            ocultarError(correoInput, correoError);
        }
        
        return true;
    }

    /**
     * Valida el campo fecha de registro (ahora automática)
     */
    function validarFechaRegistro() {
        // La fecha se genera automáticamente, siempre es válida
        ocultarError(fechaRegistroInput, fechaRegistroError);
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
        errorElement.style.color = 'var(--error-color)';
    }

    /**
     * Muestra un mensaje de advertencia para un campo específico
     */
    function mostrarAdvertencia(input, errorElement, mensaje) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        errorElement.textContent = mensaje;
        errorElement.classList.add('show');
        errorElement.style.color = 'var(--warning-color)';
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
     * Formatea el documento mientras se escribe
     */
    function formatearDocumento() {
        // No formatear si el campo está en modo readonly (modificación)
        if (idInput.readOnly) {
            return;
        }
        let valor = idInput.value.replace(/[^0-9A-Za-z\-]/g, '');
        idInput.value = valor.toUpperCase();
    }

    /**
     * Formatea el nombre (primera letra de cada palabra en mayúscula)
     */
    function formatearNombre() {
        let valor = nombreInput.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        valor = valor.replace(/\s+/g, ' '); // Eliminar espacios múltiples
        valor = valor.replace(/^\s+/, ''); // Eliminar espacios al inicio
        
        // Capitalizar primera letra de cada palabra
        valor = valor.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        
        nombreInput.value = valor;
    }

    /**
     * Formatea el apellido (primera letra de cada palabra en mayúscula)
     */
    function formatearApellido() {
        let valor = apellidoInput.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        valor = valor.replace(/\s+/g, ' '); // Eliminar espacios múltiples
        valor = valor.replace(/^\s+/, ''); // Eliminar espacios al inicio
        
        // Capitalizar primera letra de cada palabra
        valor = valor.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        
        apellidoInput.value = valor;
    }

    /**
     * Valida todo el formulario
     */
    function validarFormulario() {
        const idValido = validarId();
        const nombreValido = validarNombre();
        const apellidoValido = validarApellido();
        const correoValido = validarCorreo();
        const fechaValida = validarFechaRegistro();
        
        return idValido && nombreValido && apellidoValido && correoValido && fechaValida;
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
     * Configura la fecha de registro según el contexto (crear/modificar)
     */
    function configurarFechaPorDefecto() {
        // Siempre hacer el campo de fecha solo lectura
        fechaRegistroInput.readOnly = true;
        fechaRegistroInput.style.cursor = 'not-allowed';
        fechaRegistroInput.style.backgroundColor = '#f8f9fa';
        
        // Si no hay fecha (cliente nuevo), mostrar fecha actual pero no enviarla
        if (!fechaRegistroInput.value || fechaRegistroInput.value === '') {
            // Mostrar fecha actual en el campo para información del usuario
            const fechaActual = new Date();
            const year = fechaActual.getFullYear();
            const month = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses van de 0-11
            const day = String(fechaActual.getDate()).padStart(2, '0');
            const fechaFormateada = `${year}-${month}-${day}`;
            
            fechaRegistroInput.value = fechaFormateada;
            fechaRegistroInput.title = 'La fecha de registro se genera automáticamente para clientes nuevos';
            
            // Para clientes nuevos, limpiar el valor antes del envío para que el servidor asigne la fecha
            const form = fechaRegistroInput.closest('form');
            if (form) {
                form.addEventListener('submit', function() {
                    // Solo limpiar si es un cliente nuevo (no hay fecha previa del servidor)
                    const esModificacion = document.querySelector('input[name="esModificacion"]');
                    if (!esModificacion || esModificacion.value === 'false') {
                        fechaRegistroInput.value = ''; // Dejar que el servidor asigne la fecha
                    }
                });
            }
        } else {
            // Si ya hay fecha (modificación), mantenerla y agregar tooltip explicativo
            fechaRegistroInput.title = 'La fecha de registro original se mantiene y no se puede modificar';
        }
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
        // Enfocar el primer campo editable
        if (!idInput.disabled) {
            idInput.focus();
        } else {
            nombreInput.focus();
        }
        
        // Agregar información adicional para documento
        agregarInfoDocumento();
        
        // Agregar sugerencias de correo
        agregarSugerenciasCorreo();
    }

    /**
     * Agrega información adicional para el campo documento
     */
    function agregarInfoDocumento() {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'documento-info';
        
        if (idInput.disabled) {
            infoDiv.textContent = 'El documento no se puede modificar una vez creado';
        } else {
            infoDiv.textContent = 'Use números, letras y guiones. Ejemplo: 12345678, CC-1234567890';
        }
        
        idInput.parentNode.appendChild(infoDiv);
    }

    /**
     * Agrega sugerencias de correo mientras se escribe
     */
    function agregarSugerenciasCorreo() {
        const sugerencias = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'];
        
        correoInput.addEventListener('input', function() {
            const valor = this.value;
            const arribaPos = valor.indexOf('@');
            
            if (arribaPos === -1 && valor.length > 2) {
                // Mostrar sugerencia en placeholder
                this.setAttribute('placeholder', valor + '@gmail.com');
            } else {
                this.setAttribute('placeholder', 'cliente@ejemplo.com');
            }
        });
    }

    // Inicializar la aplicación
    inicializar();
});

/**
 * Funciones utilitarias globales
 */

// Limpiar formulario
function limpiarFormulario() {
    const form = document.querySelector('form');
    if (form) {
        form.reset();
        
        // Remover clases de validación
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        
        // Ocultar mensajes de error
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
        
        // Restablecer fecha actual
        const fechaInput = document.getElementById('fechaRegistro');
        if (fechaInput) {
            const fechaActual = new Date();
            const fechaFormateada = fechaActual.toISOString().split('T')[0];
            fechaInput.value = fechaFormateada;
        }
        
        // Enfocar primer campo
        const primerCampo = form.querySelector('.form-input:not(:disabled)');
        if (primerCampo) {
            primerCampo.focus();
        }
    }
}

// Validar formato de correo electrónico
function validarFormatoCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

// Formatear nombre completo
function formatearNombreCompleto(nombre, apellido) {
    const nombreFormateado = nombre.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    const apellidoFormateado = apellido.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    return `${nombreFormateado} ${apellidoFormateado}`;
}