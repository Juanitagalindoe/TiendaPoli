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
// SISTEMA DE PAGINACIÓN UNIFICADO
// ===========================

TiendaPoliUtils.Pagination = {
    // Configuración por defecto
    defaultConfig: {
        recordsPerPage: 10,
        searchFields: ['nombre'],
        currentPage: 1,
        allRows: [],
        filteredRows: []
    },

    // Inicializar sistema de paginación
    init: function(config) {
        const finalConfig = Object.assign({}, this.defaultConfig, config);
        
        // Almacenar configuración en el elemento contenedor
        const tableBody = document.getElementById(finalConfig.tableBodyId);
        if (!tableBody) {
            console.error(`❌ No se encontró el elemento con ID: ${finalConfig.tableBodyId}`);
            return;
        }

        // Guardar configuración en el elemento
        tableBody.paginationConfig = finalConfig;
        
        // Obtener todas las filas
        finalConfig.allRows = Array.from(tableBody.querySelectorAll('tr'));
        finalConfig.filteredRows = [...finalConfig.allRows];
        
        // Configurar controles
        this.setupControls(finalConfig);
        
        // Mostrar primera página
        this.showPage(1, finalConfig);
        
        console.log(`✅ Paginación inicializada para ${finalConfig.entityType} con ${finalConfig.allRows.length} registros`);
    },

    // Configurar controles de paginación
    setupControls: function(config) {
        // Configurar buscador
        const searchInput = document.getElementById(config.searchInputId);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value, config);
            });
        }

        // Configurar selector de registros por página
        const pageSizeSelect = document.getElementById(config.pageSizeSelectId);
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                config.recordsPerPage = parseInt(e.target.value);
                config.currentPage = 1;
                this.showPage(1, config);
            });
        }

        // Configurar botones de navegación
        this.setupNavigationButtons(config);
    },

    // Configurar botones de navegación
    setupNavigationButtons: function(config) {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const firstBtn = document.getElementById('firstPage');
        const lastBtn = document.getElementById('lastPage');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (config.currentPage > 1) {
                    this.showPage(config.currentPage - 1, config);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(config.filteredRows.length / config.recordsPerPage);
                if (config.currentPage < totalPages) {
                    this.showPage(config.currentPage + 1, config);
                }
            });
        }

        if (firstBtn) {
            firstBtn.addEventListener('click', () => {
                this.showPage(1, config);
            });
        }

        if (lastBtn) {
            lastBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(config.filteredRows.length / config.recordsPerPage);
                this.showPage(totalPages, config);
            });
        }
    },

    // Manejar búsqueda
    handleSearch: function(searchTerm, config) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term === '') {
            config.filteredRows = [...config.allRows];
        } else {
            config.filteredRows = config.allRows.filter(row => {
                const cells = row.querySelectorAll('td');
                return config.searchFields.some(fieldIndex => {
                    const cellIndex = typeof fieldIndex === 'number' ? fieldIndex : 
                                     this.getFieldIndex(fieldIndex, row);
                    const cell = cells[cellIndex];
                    return cell && cell.textContent.toLowerCase().includes(term);
                });
            });
        }
        
        config.currentPage = 1;
        this.showPage(1, config);
    },

    // Obtener índice de campo por nombre
    getFieldIndex: function(fieldName, sampleRow) {
        const headers = sampleRow.closest('table').querySelectorAll('th');
        for (let i = 0; i < headers.length; i++) {
            const headerText = headers[i].textContent.toLowerCase();
            if (headerText.includes(fieldName.toLowerCase())) {
                return i;
            }
        }
        return 0; // Fallback al primer campo
    },

    // Mostrar página específica
    showPage: function(page, config) {
        const startIndex = (page - 1) * config.recordsPerPage;
        const endIndex = startIndex + config.recordsPerPage;
        const totalPages = Math.ceil(config.filteredRows.length / config.recordsPerPage);
        
        // Validar página
        if (page < 1 || page > totalPages) {
            return;
        }
        
        config.currentPage = page;
        
        // Ocultar todas las filas
        config.allRows.forEach(row => {
            row.style.display = 'none';
        });
        
        // Mostrar filas de la página actual
        const rowsToShow = config.filteredRows.slice(startIndex, endIndex);
        rowsToShow.forEach(row => {
            row.style.display = '';
        });
        
        // Actualizar controles
        this.updatePaginationInfo(config);
        this.updatePaginationButtons(config);
        this.updatePageNumbers(config);
    },

    // Actualizar información de paginación
    updatePaginationInfo: function(config) {
        const totalRecords = config.filteredRows.length;
        const startRecord = totalRecords === 0 ? 0 : ((config.currentPage - 1) * config.recordsPerPage) + 1;
        const endRecord = Math.min(config.currentPage * config.recordsPerPage, totalRecords);
        const totalPages = Math.ceil(totalRecords / config.recordsPerPage);
        
        // Actualizar texto de información
        const infoElement = document.getElementById('paginationInfo');
        if (infoElement) {
            infoElement.textContent = `Mostrando ${startRecord} a ${endRecord} de ${totalRecords} ${config.entityType}s (Página ${config.currentPage} de ${totalPages})`;
        }
    },

    // Actualizar estado de botones
    updatePaginationButtons: function(config) {
        const totalPages = Math.ceil(config.filteredRows.length / config.recordsPerPage);
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const firstBtn = document.getElementById('firstPage');
        const lastBtn = document.getElementById('lastPage');
        
        if (prevBtn) prevBtn.disabled = config.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = config.currentPage >= totalPages;
        if (firstBtn) firstBtn.disabled = config.currentPage <= 1;
        if (lastBtn) lastBtn.disabled = config.currentPage >= totalPages;
    },

    // Actualizar números de página
    updatePageNumbers: function(config) {
        const totalPages = Math.ceil(config.filteredRows.length / config.recordsPerPage);
        const pageNumbersContainer = document.getElementById('pageNumbers');
        
        if (!pageNumbersContainer) return;
        
        pageNumbersContainer.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Calcular rango de páginas a mostrar
        const maxVisiblePages = 5;
        let startPage = Math.max(1, config.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Ajustar si estamos al final
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Crear botones de número de página
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn btn-sm ${i === config.currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                this.showPage(i, config);
            });
            pageNumbersContainer.appendChild(pageBtn);
        }
    }
};

// ===========================
// SISTEMA DE ELIMINACIÓN UNIFICADO
// ===========================

TiendaPoliUtils.DeleteManager = {
    init: function(config) {
        this.config = config;
        this.setupDeleteButtons();
        this.setupModal();
        console.log(`✅ DeleteManager inicializado para ${config.entityType}`);
    },

    setupDeleteButtons: function() {
        const buttons = document.querySelectorAll(this.config.deleteButtonClass || '.btn-eliminar');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const id = button.getAttribute('data-id');
                const name = button.getAttribute('data-nombre') || button.getAttribute('data-name');
                this.showDeleteModal(id, name);
            });
        });
    },

    setupModal: function() {
        const confirmBtn = document.getElementById('confirmDelete');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleDelete();
            });
        }
    },

    showDeleteModal: function(id, name) {
        this.currentDeleteId = id;
        this.currentDeleteName = name;
        
        const modal = new bootstrap.Modal(document.getElementById(this.config.modalId || 'deleteModal'));
        const messageElement = document.getElementById('deleteMessage');
        
        if (messageElement) {
            messageElement.textContent = `¿Está seguro que desea eliminar ${this.config.entityType}: "${name}"?`;
        }
        
        modal.show();
    },

    handleDelete: function() {
        if (!this.currentDeleteId) return;
        
        const url = `${this.config.deleteUrl}/${this.currentDeleteId}`;
        
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (response.ok) {
                location.reload(); // O manejar de forma más elegante
            } else {
                throw new Error('Error al eliminar');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar el registro');
        });
    }
};

// ===========================
// SISTEMA DE VALIDACIÓN UNIFICADO
// ===========================

TiendaPoliUtils.Validation = {
    setupForm: function(formConfig) {
        const form = document.getElementById(formConfig.formId);
        if (!form) return;
        
        this.config = formConfig;
        this.setupFieldValidation();
        this.setupFormSubmission();
        
        console.log(`✅ Validación configurada para formulario: ${formConfig.formId}`);
    },

    setupFieldValidation: function() {
        Object.entries(this.config.fields).forEach(([fieldId, rules]) => {
            const field = document.getElementById(fieldId);
            if (!field) return;
            
            field.addEventListener('blur', () => {
                this.validateField(fieldId, rules);
            });
            
            field.addEventListener('input', () => {
                this.hideError(fieldId);
            });
        });
    },

    setupFormSubmission: function() {
        const form = document.getElementById(this.config.formId);
        form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });
    },

    validateField: function(fieldId, rules) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        // Validación requerido
        if (rules.required && !value) {
            this.showError(fieldId, rules.messages.required || 'Este campo es requerido');
            return false;
        }
        
        // Validación de longitud mínima
        if (rules.minLength && value.length < rules.minLength) {
            this.showError(fieldId, rules.messages.minLength || `Mínimo ${rules.minLength} caracteres`);
            return false;
        }
        
        // Validación de correo
        if (rules.email && value && !this.validarCorreo(value)) {
            this.showError(fieldId, rules.messages.email || 'Formato de correo inválido');
            return false;
        }
        
        // Validación personalizada
        if (rules.custom && !rules.custom(value)) {
            this.showError(fieldId, rules.messages.custom || 'Valor inválido');
            return false;
        }
        
        this.hideError(fieldId);
        return true;
    },

    validateForm: function() {
        let isValid = true;
        
        Object.entries(this.config.fields).forEach(([fieldId, rules]) => {
            if (!this.validateField(fieldId, rules)) {
                isValid = false;
            }
        });
        
        return isValid;
    },

    showError: function(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(`error-${fieldId}`);
        
        field.classList.add('is-invalid');
        
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    },

    hideError: function(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(`error-${fieldId}`);
        
        field.classList.remove('is-invalid');
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
};

// ===========================
// UTILIDADES ADICIONALES
// ===========================

// Auto-ocultar alertas (función duplicada en múltiples archivos)
TiendaPoliUtils.autoHideAlerts = function() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const alertInstance = new bootstrap.Alert(alert);
            alertInstance.close();
        }, 5000);
    });
};

// Sistema de carga de modal
TiendaPoliUtils.Modal = {
    show: function(modalId, config = {}) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;
        
        const modal = new bootstrap.Modal(modalElement);
        
        // Configurar título si se proporciona
        if (config.title) {
            const titleElement = modalElement.querySelector('.modal-title');
            if (titleElement) titleElement.textContent = config.title;
        }
        
        // Configurar cuerpo si se proporciona
        if (config.body) {
            const bodyElement = modalElement.querySelector('.modal-body');
            if (bodyElement) bodyElement.innerHTML = config.body;
        }
        
        modal.show();
        return modal;
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

// Nuevas funciones globales
window.autoHideAlerts = TiendaPoliUtils.autoHideAlerts;

// Exportar el módulo principal
window.TiendaPoliUtils = TiendaPoliUtils;

console.log('🔧 TiendaPoliUtils v2.0 - Módulo de utilidades unificadas cargado correctamente');