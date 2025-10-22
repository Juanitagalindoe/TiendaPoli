/**
 * CLIENTE FORM - VALIDACIONES Y FUNCIONALIDAD
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar fecha del sistema
    inicializarFechaSistema();
    
    // Elementos del formulario
    const form = document.querySelector('form');
    const idInput = document.getElementById('idCliente');
    const nombreInput = document.getElementById('nombreCliente');
    const apellidoInput = document.getElementById('apellidoCliente');
    const correoInput = document.getElementById('correoCliente');
    const btnGuardar = document.getElementById('btnGuardar');

    // Elementos de error
    const idError = document.getElementById('idError');
    const nombreError = document.getElementById('nombreError');
    const apellidoError = document.getElementById('apellidoError');
    const correoError = document.getElementById('correoError');

    // Verificar que todos los elementos existan
    if (!form || !idInput || !nombreInput || !apellidoInput || !correoInput || !btnGuardar) {
        console.error('Error: No se pudieron encontrar todos los elementos del formulario');
        console.log('Elementos encontrados:', {
            form: !!form,
            idInput: !!idInput,
            nombreInput: !!nombreInput,
            apellidoInput: !!apellidoInput,
            correoInput: !!correoInput,
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
        [idInput, nombreInput, apellidoInput, correoInput].forEach(input => {
            if (input) {
                input.classList.remove('is-valid', 'is-invalid');
            }
        });
        
        // Ocultar todos los mensajes de error
        [idError, nombreError, apellidoError, correoError].forEach(errorElement => {
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
        
        // Validar que solo contenga números del 0 al 9
        if (!/^[0-9]+$/.test(id)) {
            mostrarError(idInput, idError, 'El documento solo puede contener números del 0 al 9');
            return false;
        }
        
        if (id.length < 6) {
            mostrarError(idInput, idError, 'El documento debe tener al menos 6 dígitos');
            return false;
        }
        
        if (id.length > 12) {
            mostrarError(idInput, idError, 'El documento no puede exceder 12 dígitos');
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
     * Formatea el documento permitiendo solo números del 0 al 9
     */
    function formatearDocumento() {
        // No formatear si el campo está en modo readonly (modificación)
        if (idInput.readOnly) {
            return;
        }
        
        // Solo permitir números del 0 al 9
        let valor = idInput.value.replace(/[^0-9]/g, '');
        
        // Limitar a máximo 12 dígitos
        if (valor.length > 12) {
            valor = valor.substring(0, 12);
        }
        
        idInput.value = valor;
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
        
        console.log('Validación del formulario:', {
            idValido,
            nombreValido,
            apellidoValido,
            correoValido
        });
        
        const formularioValido = idValido && nombreValido && apellidoValido && correoValido;
        console.log('Formulario válido:', formularioValido);
        
        return formularioValido;
    }

    /**
     * Configura el envío del formulario
     */
    function configurarEnvioFormulario() {
        if (!form) {
            console.error('Error: No se encontró el formulario');
            return;
        }
        
        if (!btnGuardar) {
            console.error('Error: No se encontró el botón de guardar');
            return;
        }
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Evento submit capturado');
            
            // Validar todo el formulario
            if (!validarFormulario()) {
                mostrarMensajeGeneral('Por favor, corrija los errores antes de continuar', 'error');
                return;
            }
            
            console.log('Formulario válido, enviando...');
            
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
     * Muestra un mensaje general - ahora usa TiendaPoliUtils
     */
    function mostrarMensajeGeneral(mensaje, tipo) {
        TiendaPoliUtils.mostrarMensajeGeneral(mensaje, tipo, '.form-container', 5000);
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
 * Funciones utilitarias globales - ahora usan TiendaPoliUtils
 */

// Limpiar formulario - ahora usa TiendaPoliUtils
function limpiarFormulario() {
    const form = document.querySelector('form');
    if (form) {
        TiendaPoliUtils.limpiarFormulario(form, true);
        
        // Enfocar primer campo
        const primerCampo = form.querySelector('.form-control:not(:disabled)');
        if (primerCampo) {
            primerCampo.focus();
        }
    }
}

/**
 * Inicializa el campo de fecha del sistema con la fecha actual para registros nuevos
 */
function inicializarFechaSistema() {
    const fechaSistemaInput = document.getElementById('fechaSistema');
    const esModificacionInput = document.querySelector('input[name="esModificacion"]');
    
    if (fechaSistemaInput) {
        // Verificar si es modificación
        const esModificacion = esModificacionInput && esModificacionInput.value === 'true';
        
        // Solo establecer fecha del sistema si es un registro nuevo
        if (!esModificacion) {
            const fechaActual = new Date();
            const dia = String(fechaActual.getDate()).padStart(2, '0');
            const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
            const anio = fechaActual.getFullYear();
            
            const fechaFormateada = `${dia}/${mes}/${anio}`;
            fechaSistemaInput.value = fechaFormateada;
        }
        // Para modificaciones, el valor ya viene desde Thymeleaf con la fecha de la BD
    }
}

// Validar formato de correo electrónico - ahora usa TiendaPoliUtils
function validarFormatoCorreo(correo) {
    return TiendaPoliUtils.validarCorreo(correo);
}

// Formatear nombre completo - ahora usa TiendaPoliUtils
function formatearNombreCompleto(nombre, apellido) {
    const nombreFormateado = TiendaPoliUtils.formatearNombre(nombre);
    const apellidoFormateado = TiendaPoliUtils.formatearNombre(apellido);
    return `${nombreFormateado} ${apellidoFormateado}`;
}