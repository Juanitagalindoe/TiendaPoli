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
 * Muestra el modal de confirmación de eliminación
 * @param {string} productoId - ID del producto a eliminar
 * @param {string} nombre - Nombre del producto
 */
function mostrarModalEliminar(productoId, nombre) {
    console.log('mostrarModalEliminar llamado con:', productoId, nombre);
    const modal = document.getElementById('modalEliminar');
    const nombreModal = document.getElementById('nombreProductoModal');
    const inputId = document.getElementById('productoIdEliminar');

    console.log('Modal elemento:', modal);
    console.log('Nombre modal elemento:', nombreModal);
    console.log('Input ID elemento:', inputId);

    // Configurar los datos del modal
    nombreModal.textContent = nombre;
    inputId.value = productoId;

    // Mostrar el modal
    modal.style.display = 'flex';
    console.log('Modal mostrado');

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



