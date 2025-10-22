/**
 * UTILS.JS - Módulo de Utilidades Comunes
 * Versión: 1.0 - Sistema unificado de funciones utilitarias
 * 
 * Centraliza funciones comunes utilizadas en múltiples archivos
 * para evitar duplicación de código y mantener consistencia
 */

// ===========================
// MÓDULO DE UTILIDADES GLOBAL
// ===========================
const TiendaPoliUtils = {
    
    // ===========================
    // FORMATEO DE MONEDA
    // ===========================
    
    /**
     * Formatea un valor numérico como moneda colombiana
     * @param {number} valor - El valor a formatear
     * @param {boolean} conSimbolo - Si incluir el símbolo $ (default: true)
     * @param {number} decimales - Número de decimales (default: 0)
     * @param {boolean} conCOP - Si incluir COP en el formato (default: false)
     * @returns {string} Valor formateado como moneda
     */
    formatearMoneda: function(valor, conSimbolo = true, decimales = 0, conCOP = false) {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return conSimbolo ? '$0' : '0';
        }
        
        if (conCOP) {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: decimales,
                maximumFractionDigits: decimales
            }).format(valor);
        }
        
        const numeroFormateado = valor.toLocaleString('es-CO', {
            minimumFractionDigits: decimales,
            maximumFractionDigits: decimales
        });
        
        return conSimbolo ? `$${numeroFormateado}` : numeroFormateado;
    },

    // ===========================
    // GESTIÓN DE FORMULARIOS
    // ===========================
    
    /**
     * Limpia un formulario y resetea sus validaciones
     * @param {HTMLFormElement|string} formulario - El formulario o selector CSS
     * @param {boolean} incluirValidaciones - Si resetear clases de validación (default: true)
     */
    limpiarFormulario: function(formulario, incluirValidaciones = true) {
        let form;
        
        if (typeof formulario === 'string') {
            form = document.querySelector(formulario);
        } else {
            form = formulario;
        }
        
        if (!form) {
            console.warn('TiendaPoliUtils: Formulario no encontrado');
            return;
        }
        
        // Reset del formulario
        form.reset();
        
        if (incluirValidaciones) {
            // Remover clases de validación
            const inputs = form.querySelectorAll('.form-input, .form-textarea, input, textarea, select');
            inputs.forEach(input => {
                input.classList.remove('valid', 'invalid', 'error', 'success');
            });
            
            // Ocultar mensajes de error
            const mensajesError = form.querySelectorAll('.error-message, .success-message, .field-error');
            mensajesError.forEach(mensaje => {
                mensaje.classList.remove('show');
                mensaje.classList.add('hidden');
                mensaje.textContent = '';
            });
        }
    },

    // ===========================
    // SISTEMA DE MENSAJES
    // ===========================
    
    /**
     * Muestra un mensaje general en la parte superior del contenedor
     * @param {string} mensaje - El mensaje a mostrar
     * @param {string} tipo - Tipo de mensaje: 'success', 'error', 'warning', 'info'
     * @param {string} contenedor - Selector del contenedor (default: '.form-container')
     * @param {number} duracion - Duración en milisegundos (default: 5000)
     */
    mostrarMensajeGeneral: function(mensaje, tipo = 'info', contenedor = '.form-container', duracion = 5000) {
        // Remover mensajes anteriores
        const mensajesExistentes = document.querySelectorAll('.alert');
        mensajesExistentes.forEach(msg => msg.remove());
        
        // Crear nuevo mensaje
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo}`;
        
        const iconos = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const titulos = {
            success: '¡Éxito!',
            error: '¡Error!',
            warning: '¡Advertencia!',
            info: 'Información'
        };
        
        alertDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.2em;">${iconos[tipo] || iconos.info}</span>
                <div>
                    <strong>${titulos[tipo] || titulos.info}</strong> ${mensaje}
                </div>
            </div>
            <button type="button" class="btn-close" onclick="this.parentElement.remove()" aria-label="Cerrar">×</button>
        `;
        
        // Insertar antes del contenedor especificado
        const formContainer = document.querySelector(contenedor);
        if (formContainer && formContainer.parentNode) {
            formContainer.parentNode.insertBefore(alertDiv, formContainer);
        } else {
            // Fallback: insertar al inicio del body
            document.body.insertBefore(alertDiv, document.body.firstChild);
        }
        
        // Auto-remover después de la duración especificada
        if (duracion > 0) {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, duracion);
        }
    },
    
    /**
     * Muestra un mensaje de error en un campo específico
     * @param {HTMLElement|string} input - El input o selector CSS
     * @param {HTMLElement|string} errorElement - El elemento de error o selector CSS
     * @param {string} mensaje - El mensaje de error
     */
    mostrarError: function(input, errorElement, mensaje) {
        const inputEl = typeof input === 'string' ? document.querySelector(input) : input;
        const errorEl = typeof errorElement === 'string' ? document.querySelector(errorElement) : errorElement;
        
        if (inputEl) {
            inputEl.classList.remove('valid');
            inputEl.classList.add('invalid');
        }
        
        if (errorEl) {
            errorEl.textContent = mensaje;
            errorEl.classList.remove('hidden');
            errorEl.classList.add('show');
        }
    },
    
    /**
     * Muestra un mensaje de éxito en un campo específico
     * @param {HTMLElement|string} input - El input o selector CSS
     * @param {HTMLElement|string} successElement - El elemento de éxito o selector CSS
     * @param {string} mensaje - El mensaje de éxito (opcional)
     */
    mostrarExito: function(input, successElement, mensaje = '') {
        const inputEl = typeof input === 'string' ? document.querySelector(input) : input;
        const successEl = typeof successElement === 'string' ? document.querySelector(successElement) : successElement;
        
        if (inputEl) {
            inputEl.classList.remove('invalid');
            inputEl.classList.add('valid');
        }
        
        if (successEl && mensaje) {
            successEl.textContent = mensaje;
            successEl.classList.remove('hidden');
            successEl.classList.add('show');
        }
    },

    // ===========================
    // UTILIDADES DE VALIDACIÓN
    // ===========================
    
    /**
     * Valida formato de correo electrónico
     * @param {string} correo - El correo a validar
     * @returns {boolean} True si es válido
     */
    validarCorreo: function(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    },
    
    /**
     * Valida que un campo no esté vacío
     * @param {string} valor - El valor a validar
     * @returns {boolean} True si no está vacío
     */
    validarRequerido: function(valor) {
        return valor && valor.toString().trim().length > 0;
    },
    
    /**
     * Valida que un número esté en un rango específico
     * @param {number} numero - El número a validar
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {boolean} True si está en el rango
     */
    validarRango: function(numero, min, max) {
        const num = parseFloat(numero);
        return !isNaN(num) && num >= min && num <= max;
    },

    // ===========================
    // UTILIDADES GENERALES
    // ===========================
    
    /**
     * Formatea un número entero con separadores de miles
     * @param {HTMLInputElement} input - El input a formatear
     */
    formatearEntero: function(input) {
        if (!input) return;
        
        // Remover caracteres no numéricos
        let valor = input.value.replace(/[^\d]/g, '');
        
        // Agregar separadores de miles
        if (valor) {
            valor = parseInt(valor).toLocaleString('es-CO');
        }
        
        input.value = valor;
    },
    
    /**
     * Oculta todos los mensajes de error en un contenedor
     * @param {string} contenedor - Selector del contenedor (default: document)
     */
    ocultarTodosLosErrores: function(contenedor = document) {
        const containerEl = typeof contenedor === 'string' ? document.querySelector(contenedor) : contenedor;
        const errores = containerEl.querySelectorAll('.error-message, .success-message, .field-error');
        
        errores.forEach(error => {
            error.classList.remove('show');
            error.classList.add('hidden');
            error.textContent = '';
        });
    },
    
    /**
     * Convierte la primera letra de cada palabra a mayúscula
     * @param {string} texto - El texto a formatear
     * @returns {string} Texto formateado
     */
    formatearNombre: function(texto) {
        if (!texto) return '';
        return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    },
    
    /**
     * Genera un ID único para elementos
     * @param {string} prefijo - Prefijo para el ID (default: 'id')
     * @returns {string} ID único
     */
    generarIdUnico: function(prefijo = 'id') {
        return `${prefijo}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

// ===========================
// FUNCIONES GLOBALES DE COMPATIBILIDAD
// ===========================

// Mantener funciones globales para compatibilidad con código existente
window.formatearMoneda = TiendaPoliUtils.formatearMoneda;
window.limpiarFormulario = TiendaPoliUtils.limpiarFormulario;
window.mostrarMensajeGeneral = TiendaPoliUtils.mostrarMensajeGeneral;
window.validarFormatoCorreo = TiendaPoliUtils.validarCorreo;

// Exportar el módulo principal
window.TiendaPoliUtils = TiendaPoliUtils;

console.log('🔧 TiendaPoliUtils v1.0 - Módulo de utilidades cargado correctamente');