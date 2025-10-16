// función para la barra de búsqueda
document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase().trim();
    const tableBody = document.getElementById('productosTableBody');
    const rows = tableBody.getElementsByTagName('tr');

    // Procesar cada fila de la tabla
    Array.from(rows).forEach(row => {
        const cells = row.getElementsByTagName('td');
        let shouldShow = false;

        // Buscar coincidencias en celdas de datos (excluir columna de acciones)
        for (let j = 0; j < cells.length - 1; j++) {
            const cellText = cells[j].textContent.toLowerCase();
            if (cellText.includes(searchTerm)) {
                shouldShow = true;
                break;
            }
        }

        // Aplicar visibilidad a la fila
        row.style.display = shouldShow || searchTerm === '' ? '' : 'none';
    });

    // Gestionar mensaje de "sin resultados"
    sinResultados(searchTerm, tableBody, rows);
});

/**
 * Maneja el mensaje cuando no se encuentran resultados en la búsqueda
 * @param {string} searchTerm - Término de búsqueda actual
 * @param {HTMLElement} tableBody - Cuerpo de la tabla
 * @param {HTMLCollection} rows - Filas de la tabla
 */
function sinResultados(searchTerm, tableBody, rows) {
    // Remover mensaje anterior si existe
    const existingMessage = document.getElementById('noResultsMessage');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Contar filas visibles
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none').length;

    // Mostrar mensaje si no hay resultados y hay término de búsqueda
    if (visibleRows === 0 && searchTerm !== '') {
        const noResultsRow = document.createElement('tr');
        noResultsRow.id = 'noResultsMessage';
        noResultsRow.innerHTML = `
                        <td colspan="6" class="no-results-message">
                            No se encontraron resultados para "${searchTerm}"
                        </td>
                    `;
        tableBody.appendChild(noResultsRow);
    }
}

/**
 * Verifica si un producto está en uso y muestra el modal apropiado
 * @param {string} productoId - ID del producto a eliminar
 * @param {string} nombre - Nombre del producto
 */
function mostrarModalEliminar(productoId, nombre) {
    console.log('Verificando uso del producto:', productoId, nombre);
    
    // Mostrar indicador de carga
    mostrarCargando();
    
    // Verificar si el producto está en uso mediante AJAX
    fetch(`/producto/verificar-uso/${productoId}`)
        .then(response => response.json())
        .then(data => {
            ocultarCargando();
            
            if (data.error) {
                mostrarAlertaError('Error al verificar el producto: ' + data.mensaje);
                return;
            }
            
            if (data.enUso) {
                // Producto en uso - mostrar alerta informativa
                mostrarAlertaProductoEnUso(data.nombre, data.facturas);
            } else {
                // Producto libre - mostrar modal de confirmación normal
                mostrarModalConfirmacion(productoId, nombre);
            }
        })
        .catch(error => {
            ocultarCargando();
            console.error('Error al verificar uso del producto:', error);
            mostrarAlertaError('Error de comunicación. Intente nuevamente.');
        });
}

/**
 * Muestra el modal de confirmación para eliminar un producto
 * @param {string} productoId - ID del producto a eliminar
 * @param {string} nombre - Nombre del producto
 */
function mostrarModalConfirmacion(productoId, nombre) {
    const modal = document.getElementById('modalEliminar');
    const nombreModal = document.getElementById('nombreProductoModal');
    const inputId = document.getElementById('productoIdEliminar');

    // Configurar los datos del modal
    nombreModal.textContent = nombre;
    inputId.value = productoId;

    // Mostrar el modal
    modal.style.display = 'flex';

    // Enfocar en el botón cancelar para mejor accesibilidad
    setTimeout(() => {
        modal.querySelector('.btnConfirmar').focus();
    }, 100);
}

/**
 * Cierra el modal de confirmación
 */
function cerrarModal() {
    const modal = document.getElementById('modalEliminar');
    modal.style.display = 'none';

    // Limpiar los datos del modal
    document.getElementById('nombreProductoModal').textContent = '';
    document.getElementById('productoIdEliminar').value = '';
}

// Cerrar modal al hacer clic fuera de él
document.getElementById('modalEliminar').addEventListener('click', function (event) {
    if (event.target === this) {
        cerrarModal();
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('modalEliminar');
        if (modal.style.display === 'flex') {
            cerrarModal();
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded - productos');
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    console.log('Botones eliminar encontrados:', botonesEliminar.length);

    botonesEliminar.forEach(function (boton) {
        boton.addEventListener('click', function () {
            console.log('Click en botón eliminar');
            const productoId = this.getAttribute('data-id');
            const productoNombre = this.getAttribute('data-nombre');
            console.log('ID:', productoId, 'Nombre:', productoNombre);
            mostrarModalEliminar(productoId, productoNombre);
        });
    });

    // Auto-ocultar alertas después de 5 segundos
    autoHideAlerts();
});

/**
 * Auto-oculta las alertas de éxito y error después de 5 segundos
 */
function autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(function(alert) {
        // Agregar botón de cerrar manualmente
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.className = 'alert-close-btn';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            color: inherit;
            opacity: 0.7;
            margin-left: auto;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Evento para cerrar manualmente
        closeButton.addEventListener('click', function() {
            hideAlert(alert);
        });
        
        alert.appendChild(closeButton);
        
        // Auto-ocultar después de 5 segundos
        setTimeout(function() {
            hideAlert(alert);
        }, 5000);
    });
}

/**
 * Oculta una alerta con animación suave
 * @param {HTMLElement} alert - Elemento de alerta a ocultar
 */
function hideAlert(alert) {
    if (alert && alert.parentNode) {
        alert.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        
        // Remover completamente el elemento después de la animación
        setTimeout(function() {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 500);
    }
}

/**
 * Muestra indicador de carga
 */
function mostrarCargando() {
    // Crear overlay de carga si no existe
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = '<div class="spinner">⏳ Verificando...</div>';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-size: 18px;
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

/**
 * Oculta indicador de carga
 */
function ocultarCargando() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Muestra alerta de error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarAlertaError(mensaje) {
    crearAlerta('alert-danger', '⚠️ Error', mensaje);
}

/**
 * Muestra alerta informativa cuando un producto está en uso
 * @param {string} nombreProducto - Nombre del producto
 * @param {Array} facturas - Array de números de factura
 */
function mostrarAlertaProductoEnUso(nombreProducto, facturas) {
    const mensajeFacturas = facturas.join(', ');
    const mensaje = `
        <strong>El producto "${nombreProducto}" no se puede eliminar</strong><br>
        <small>Está siendo usado en las siguientes facturas: <strong>${mensajeFacturas}</strong></small><br>
        <small>💡 Debe eliminar primero estas facturas antes de poder eliminar el producto.</small>
    `;
    crearAlerta('alert-warning', '🚫 Producto en Uso', mensaje);
}

/**
 * Crea y muestra una alerta
 * @param {string} tipo - Tipo de alerta (alert-success, alert-danger, alert-warning, etc.)
 * @param {string} titulo - Título de la alerta
 * @param {string} mensaje - Mensaje de la alerta
 */
function crearAlerta(tipo, titulo, mensaje) {
    // Eliminar alertas anteriores
    const alertasAnteriores = document.querySelectorAll('.alert');
    alertasAnteriores.forEach(alerta => alerta.remove());
    
    // Crear nueva alerta
    const alerta = document.createElement('div');
    alerta.className = `alert ${tipo} alert-dismissible`;
    alerta.setAttribute('role', 'alert');
    alerta.innerHTML = `
        <div>
            <strong>${titulo}</strong><br>
            ${mensaje}
        </div>
        <button type="button" class="btn-close" onclick="this.parentElement.remove()" aria-label="Cerrar">×</button>
    `;
    
    // Insertar al inicio de la sección de controles
    const controlsSection = document.querySelector('.controls-section');
    if (controlsSection) {
        controlsSection.insertBefore(alerta, controlsSection.firstChild);
    } else {
        // Fallback: insertar al inicio del contenido principal
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(alerta, mainContent.firstChild);
        }
    }
    
    // Auto-ocultar después de 8 segundos para alertas de warning
    if (tipo === 'alert-warning') {
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.remove();
            }
        }, 8000);
    }
    
    // Scroll hacia la alerta
    alerta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}



