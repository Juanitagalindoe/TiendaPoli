// Sistema de clientes - JavaScript con debugging temporal
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 CLIENTE.JS - DOM Cargado');
    
    // Inicializar búsqueda
    initSearchFunction();
    
    // Inicializar botones de eliminar con delay
    setTimeout(function() {
        console.log('🔄 CLIENTE.JS - Inicializando botones...');
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
            const tableBody = document.getElementById('clientesTableBody');
            
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
                    No se encontraron clientes que coincidan con "${searchTerm}"
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
    console.log('🔍 CLIENTE.JS - Botones encontrados:', botonesEliminar.length);

    botonesEliminar.forEach(function(boton) {
        console.log('➕ CLIENTE.JS - Agregando listener a botón:', boton);
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔥 CLIENTE.JS - CLICK DETECTADO!');
            alert('¡CLICK EN ELIMINAR CLIENTE!');
            
            const clienteId = this.getAttribute('data-id');
            const clienteNombre = this.getAttribute('data-nombre');
            
            console.log('ID:', clienteId, 'Nombre:', clienteNombre);
            
            if (clienteId && clienteNombre) {
                console.log('🎭 CLIENTE.JS - Llamando mostrarModalEliminar');
                mostrarModalEliminar(clienteId, clienteNombre);
            }
        });
    });
}

// Función para mostrar el modal de confirmación
function mostrarModalEliminar(clienteId, clienteNombre) {
    console.log('🎭 CLIENTE.JS - Mostrando modal para:', clienteNombre);
    const modal = document.getElementById('modalEliminar');
    const nombreModal = document.getElementById('nombreClienteModal');
    const inputId = document.getElementById('clienteIdEliminar');

    console.log('Modal encontrado:', modal);
    console.log('NombreModal encontrado:', nombreModal);
    console.log('InputId encontrado:', inputId);

    if (modal && nombreModal && inputId) {
        console.log('✅ CLIENTE.JS - Todos los elementos encontrados, mostrando modal');
        nombreModal.textContent = clienteNombre;
        inputId.value = clienteId;
        modal.style.display = 'flex';
        modal.classList.add('show');
        console.log('🎭 CLIENTE.JS - Clase show agregada, modal debería ser visible');

        setTimeout(() => {
            const cancelButton = modal.querySelector('.btn-secondary');
            if (cancelButton) {
                cancelButton.focus();
            }
        }, 100);
    } else {
        console.error('❌ CLIENTE.JS - No se encontraron todos los elementos del modal');
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
        const inputId = document.getElementById('clienteIdEliminar');
        const nombreModal = document.getElementById('nombreClienteModal');
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