// Sistema de productos - JavaScript con debugging temporal
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 PRODUCTO.JS - DOM Cargado');
    
    // Inicializar búsqueda
    initSearchFunction();
    
    // Inicializar botones de eliminar con delay
    setTimeout(function() {
        console.log('🔄 PRODUCTO.JS - Inicializando botones...');
        initDeleteButtons();
        autoHideAlerts();
    }, 500);
});

// Función de búsqueda
function initSearchFunction() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const tableBody = document.getElementById('productosTableBody');
            
            if (!tableBody) {
                return;
            }
            
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
            updateNoResultsMessage(searchTerm, tableBody);
        });
    }
}

// Función para mostrar/ocultar mensaje de "sin resultados"  
function updateNoResultsMessage(searchTerm, tableBody) {
    const existingNoResults = document.getElementById('noResultsRow');
    const visibleRows = Array.from(tableBody.getElementsByTagName('tr')).filter(row => 
        row.style.display !== 'none' && row.id !== 'noResultsRow'
    );

    if (searchTerm && visibleRows.length === 0) {
        if (!existingNoResults) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.id = 'noResultsRow';
            noResultsRow.innerHTML = `
                <td colspan="6" class="text-center" style="padding: 20px; color: #6c757d; font-style: italic;">
                    No se encontraron productos que coincidan con "${searchTerm}"
                </td>
            `;
            tableBody.appendChild(noResultsRow);
        }
    } else {
        if (existingNoResults) {
            existingNoResults.remove();
        }
    }
}

// Función para inicializar los botones de eliminar
function initDeleteButtons() {
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    console.log('🔍 PRODUCTO.JS - Botones encontrados:', botonesEliminar.length);

    botonesEliminar.forEach(function(boton) {
        console.log('➕ PRODUCTO.JS - Agregando listener a botón:', boton);
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔥 PRODUCTO.JS - CLICK DETECTADO!');
            alert('¡CLICK EN ELIMINAR PRODUCTO!');
            
            const productoId = this.getAttribute('data-id');
            const productoNombre = this.getAttribute('data-nombre');
            
            console.log('ID:', productoId, 'Nombre:', productoNombre);
            
            if (productoId && productoNombre) {
                verificarUsoProducto(productoId, productoNombre);
            }
        });
    });
}

// Función para verificar si el producto está en uso
function verificarUsoProducto(productoId, productoNombre) {
    console.log('🌐 PRODUCTO.JS - Verificando uso del producto:', productoId);
    fetch(`/producto/verificar-uso/${productoId}`)
        .then(response => {
            console.log('📡 PRODUCTO.JS - Respuesta recibida:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('📋 PRODUCTO.JS - Datos:', data);
            if (data.enUso) {
                mostrarMensajeError(`El producto "${productoNombre}" no puede eliminarse porque está siendo utilizado en ${data.cantidad} venta(s).`);
            } else {
                mostrarModalEliminar(productoId, productoNombre);
            }
        })
        .catch(error => {
            mostrarMensajeError('Error al verificar el uso del producto. Inténtalo de nuevo.');
        });
}

// Función para mostrar el modal de confirmación
function mostrarModalEliminar(productoId, productoNombre) {
    console.log('🎭 PRODUCTO.JS - Mostrando modal para:', productoNombre);
    const modal = document.getElementById('modalEliminar');
    const nombreModal = document.getElementById('nombreProductoModal');
    
    console.log('Modal encontrado:', modal);
    console.log('NombreModal encontrado:', nombreModal);
    const inputId = document.getElementById('productoIdEliminar');

    if (modal && nombreModal && inputId) {
        console.log('✅ PRODUCTO.JS - Todos los elementos encontrados, mostrando modal');
        nombreModal.textContent = productoNombre;
        inputId.value = productoId;
        modal.style.display = 'flex';
        modal.classList.add('show');
        console.log('🎭 PRODUCTO.JS - Clase show agregada, modal debería ser visible');

        setTimeout(() => {
            const cancelButton = modal.querySelector('.btn-secondary');
            if (cancelButton) {
                cancelButton.focus();
            }
        }, 100);
    } else {
        console.error('❌ PRODUCTO.JS - No se encontraron todos los elementos del modal');
    }
}

// Función para mostrar mensajes de error
function mostrarMensajeError(mensaje) {
    const container = document.querySelector('.container');
    if (container) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            hideAlert(alertDiv);
        }, 5000);
    }
}

// Función para cerrar modal
function cerrarModal() {
    const modal = document.getElementById('modalEliminar');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Esperar a que termine la animación
        const inputId = document.getElementById('productoIdEliminar');
        const nombreModal = document.getElementById('nombreProductoModal');
        if (inputId) inputId.value = '';
        if (nombreModal) nombreModal.textContent = '';
    }
}

// Función para auto-ocultar alertas
function autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(function(alert) {
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
        
        closeButton.addEventListener('click', function() {
            hideAlert(alert);
        });
        
        alert.appendChild(closeButton);
        
        setTimeout(function() {
            hideAlert(alert);
        }, 5000);
    });
}

// Función para ocultar alertas con animación
function hideAlert(alert) {
    if (alert && alert.parentNode) {
        alert.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        
        setTimeout(function() {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 500);
    }
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modalEliminar');
    
    if (modal) {
        // Cerrar modal al hacer clic fuera de él
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                cerrarModal();
            }
        });
    }
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('modalEliminar');
            if (modal && modal.style.display === 'flex') {
                cerrarModal();
            }
        }
    });
});