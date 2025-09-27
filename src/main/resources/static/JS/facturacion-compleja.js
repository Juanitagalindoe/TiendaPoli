// Sistema complejo de facturación con validaciones y cálculos automáticos
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema de facturación avanzado...');
    
    // Variables globales para el estado de la aplicación
    const nroVentaElement = document.querySelector('.header-factura .campo-readonly');
    const nroVentaValue = nroVentaElement ? parseInt(nroVentaElement.textContent) : 1;
    
    console.log('=== DEBUG INICIAL ===');
    console.log('Elemento nroVenta encontrado:', nroVentaElement);
    console.log('Texto del elemento:', nroVentaElement ? nroVentaElement.textContent : 'No encontrado');
    console.log('Valor nroVenta parseado:', nroVentaValue);
    
    window.sistemaFacturacion = {
        esModificando: false,
        itemModificando: null,
        productos: [],
        detallesActuales: [],
        nroFactura: nroVentaValue,
        clienteSeleccionado: null,
        subtotalGeneral: 0,
        descuentoGeneral: 0,
        totalGeneral: 0
    };
    
    inicializarSistema();
});

// Función principal de inicialización
function inicializarSistema() {
    cargarProductosDisponibles();
    cargarDetallesActuales();
    configurarEventListeners();
    actualizarTotalesGenerales();
    habilitarBusquedaClientes();
    console.log('✅ Sistema de facturación listo');
}

// ========================================
// GESTIÓN DE PRODUCTOS
// ========================================

function cargarProductosDisponibles() {
    const selectProducto = document.getElementById('productoSelect');
    sistemaFacturacion.productos = [];
    
    Array.from(selectProducto.options).forEach(option => {
        if (option.value) {
            sistemaFacturacion.productos.push({
                id: parseInt(option.value),
                nombre: option.textContent.split(' - ')[1],
                precio: parseInt(option.getAttribute('data-precio')) || 0,
                stock: parseInt(option.getAttribute('data-stock')) || 0
            });
        }
    });
    
    console.log('📦 Productos cargados:', sistemaFacturacion.productos.length);
}

function seleccionarProducto() {
    const select = document.getElementById('productoSelect');
    const productoId = parseInt(select.value);
    
    if (!productoId) {
        limpiarCamposProducto();
        return;
    }
    
    const producto = sistemaFacturacion.productos.find(p => p.id === productoId);
    if (producto) {
        mostrarInfoProducto(producto);
        document.getElementById('cantidad').focus();
    }
}

function mostrarInfoProducto(producto) {
    const stockInfo = document.getElementById('stockInfo');
    stockInfo.textContent = `Stock disponible: ${producto.stock} unidades`;
    stockInfo.style.display = 'block';
}

// ========================================
// VALIDACIONES EN TIEMPO REAL
// ========================================

function validarStock() {
    const productoId = parseInt(document.getElementById('productoSelect').value);
    const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
    const cantidadError = document.getElementById('cantidadError');
    
    if (!productoId || cantidad === 0) {
        cantidadError.style.display = 'none';
        return true;
    }
    
    const producto = sistemaFacturacion.productos.find(p => p.id === productoId);
    if (!producto) {
        mostrarError('cantidadError', 'Producto no encontrado');
        return false;
    }
    
    if (cantidad > producto.stock) {
        mostrarError('cantidadError', `Disponibles: ${producto.stock}`);
        return false;
    }
    
    cantidadError.style.display = 'none';
    return true;
}

function validarDescuento() {
    const subtotalTexto = document.getElementById('subtotal').value;
    const descuento = parseInt(document.getElementById('descuento').value) || 0;
    const descuentoError = document.getElementById('descuentoError');
    
    if (!subtotalTexto) {
        descuentoError.style.display = 'none';
        return true;
    }
    
    const subtotal = parseInt(subtotalTexto.replace(/[^0-9]/g, '')) || 0;
    const maxDescuento = Math.floor(subtotal * 0.5); // 50% máximo
    
    if (descuento > maxDescuento) {
        mostrarError('descuentoError', `Máximo permitido: $${formatearMoneda(maxDescuento)}`);
        return false;
    }
    
    descuentoError.style.display = 'none';
    return true;
}

// ========================================
// CÁLCULOS AUTOMÁTICOS
// ========================================

function calcularSubtotal() {
    const productoId = parseInt(document.getElementById('productoSelect').value);
    const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
    
    if (!productoId || cantidad === 0) {
        document.getElementById('subtotal').value = '';
        document.getElementById('total').value = '';
        return;
    }
    
    const producto = sistemaFacturacion.productos.find(p => p.id === productoId);
    if (!producto) return;
    
    if (!validarStock()) return;
    
    const subtotal = cantidad * producto.precio;
    document.getElementById('subtotal').value = `$${formatearMoneda(subtotal)}`;
    
    // Recalcular total
    calcularTotal();
}

function calcularTotal() {
    const subtotalTexto = document.getElementById('subtotal').value;
    const descuento = parseInt(document.getElementById('descuento').value) || 0;
    
    if (!subtotalTexto) {
        document.getElementById('total').value = '';
        return;
    }
    
    if (!validarDescuento()) return;
    
    const subtotal = parseInt(subtotalTexto.replace(/[^0-9]/g, ''));
    const total = Math.max(0, subtotal - descuento);
    
    document.getElementById('total').value = `$${formatearMoneda(total)}`;
}

// ========================================
// GESTIÓN DE DETALLES
// ========================================

function accionPrincipal() {
    if (sistemaFacturacion.esModificando) {
        guardarModificacion();
    } else {
        añadirDetalle();
    }
}

function accionSecundaria() {
    if (sistemaFacturacion.esModificando) {
        cancelarModificacion();
    } else {
        limpiarFormulario();
    }
}

function añadirDetalle() {
    if (!validarFormularioCompleto()) return;
    
    const detalle = obtenerDatosFormulario();
    const nuevoItem = obtenerSiguienteItem();
    
    // Crear el detalle en el servidor
    const datos = {
        nroVenta: sistemaFacturacion.nroFactura,
        item: nuevoItem,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        descuento: detalle.descuento
    };
    
    enviarDetalleAlServidor(datos, 'añadir');
}

function modificarDetalle(boton) {
    const item = parseInt(boton.getAttribute('data-item'));
    const productoId = parseInt(boton.getAttribute('data-producto'));
    const cantidad = parseInt(boton.getAttribute('data-cantidad'));
    const descuento = parseInt(boton.getAttribute('data-descuento'));
    
    // Cambiar a modo modificación
    sistemaFacturacion.esModificando = true;
    sistemaFacturacion.itemModificando = item;
    
    // Llenar formulario con datos existentes
    document.getElementById('productoSelect').value = productoId;
    document.getElementById('cantidad').value = cantidad;
    document.getElementById('descuento').value = descuento;
    
    // Recalcular valores
    seleccionarProducto();
    calcularSubtotal();
    
    // Cambiar botones
    actualizarBotones();
    
    // Resaltar fila
    resaltarFilaModificacion(item);
}

function guardarModificacion() {
    if (!validarFormularioCompleto()) return;
    
    const detalle = obtenerDatosFormulario();
    
    const datos = {
        nroVenta: sistemaFacturacion.nroFactura,
        item: sistemaFacturacion.itemModificando,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        descuento: detalle.descuento
    };
    
    enviarDetalleAlServidor(datos, 'modificar');
}

function eliminarDetalle(boton) {
    const item = parseInt(boton.getAttribute('data-item'));
    const nombreProducto = boton.closest('tr').querySelector('td:nth-child(2)').textContent;
    
    if (confirm(`¿Eliminar ${nombreProducto} de la factura?\n\nEsta acción recalculará los totales automáticamente.`)) {
        const datos = {
            nroVenta: sistemaFacturacion.nroFactura,
            item: item
        };
        
        enviarDetalleAlServidor(datos, 'eliminar');
    }
}

// ========================================
// COMUNICACIÓN CON EL SERVIDOR
// ========================================

function enviarDetalleAlServidor(datos, accion) {
    const urls = {
        'añadir': '/detalle/guardar',
        'modificar': '/detalle/guardar',
        'eliminar': '/detalle/eliminar'
    };
    
    const formData = new FormData();
    
    if (accion === 'eliminar') {
        formData.append('nroVenta', datos.nroVenta);
        formData.append('item', datos.item);
    } else {
        formData.append('nroVenta', datos.nroVenta);
        formData.append('item', datos.item);
        formData.append('productoId', datos.productoId);
        formData.append('cantidad', datos.cantidad);
        formData.append('esModificacion', accion === 'modificar');
        if (datos.descuento) {
            formData.append('descuentoDetalle', datos.descuento);
        }
    }
    
    fetch(urls[accion], {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            // Si hay redirección, recargar la página para mostrar cambios
            window.location.reload();
        } else {
            return response.text();
        }
    })
    .then(data => {
        if (data) {
            console.log('Respuesta del servidor:', data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al procesar la solicitud. Intente nuevamente.');
    });
}

function seleccionarCliente() {
    const select = document.getElementById('clienteSelect');
    const clienteId = select.value;
    
    console.log('Seleccionando cliente:', clienteId);
    
    // Ocultar mensajes anteriores
    document.getElementById('clienteError').style.display = 'none';
    document.getElementById('clienteSuccess').style.display = 'none';
    
    if (!clienteId) {
        sistemaFacturacion.clienteSeleccionado = null;
        return;
    }
    
    // Actualizar cliente en el servidor
    const formData = new FormData();
    formData.append('nroVenta', parseInt(sistemaFacturacion.nroFactura));
    formData.append('clienteId', clienteId);
    
    console.log('Enviando datos:', {
        nroVenta: parseInt(sistemaFacturacion.nroFactura),
        clienteId: clienteId
    });
    
    fetch('/encabezado/actualizar-cliente', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        console.log('Respuesta del servidor:', data);
        
        if (data.success) {
            mostrarMensaje('clienteSuccess', data.message);
            sistemaFacturacion.clienteSeleccionado = clienteId;
            console.log('Cliente seleccionado exitosamente:', data.clienteNombre);
        } else {
            mostrarError('clienteError', data.message);
            // Resetear selección si hay error
            select.value = '';
            sistemaFacturacion.clienteSeleccionado = null;
        }
    })
    .catch(error => {
        console.error('Error al actualizar cliente:', error);
        mostrarError('clienteError', 'Error de comunicación con el servidor');
        // Resetear selección si hay error
        select.value = '';
        sistemaFacturacion.clienteSeleccionado = null;
    });
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function obtenerDatosFormulario() {
    return {
        productoId: parseInt(document.getElementById('productoSelect').value),
        cantidad: parseInt(document.getElementById('cantidad').value),
        descuento: parseInt(document.getElementById('descuento').value) || 0
    };
}

function obtenerSiguienteItem() {
    cargarDetallesActuales();
    if (sistemaFacturacion.detallesActuales.length === 0) {
        return 1;
    }
    return Math.max(...sistemaFacturacion.detallesActuales.map(d => d.item)) + 1;
}

function validarFormularioCompleto() {
    const productoId = document.getElementById('productoSelect').value;
    const cantidad = document.getElementById('cantidad').value;
    
    if (!productoId) {
        mostrarError('productoError', 'Debe seleccionar un producto');
        return false;
    }
    
    if (!cantidad || cantidad <= 0) {
        mostrarError('cantidadError', 'Debe ingresar una cantidad válida');
        return false;
    }
    
    return validarStock() && validarDescuento();
}

function limpiarFormulario() {
    document.getElementById('productoSelect').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('subtotal').value = '';
    document.getElementById('descuento').value = '';
    document.getElementById('total').value = '';
    
    // Ocultar mensajes
    ocultarTodosLosErrores();
    
    // Si estaba modificando, cancelar
    if (sistemaFacturacion.esModificando) {
        cancelarModificacion();
    }
}

function cancelarModificacion() {
    sistemaFacturacion.esModificando = false;
    sistemaFacturacion.itemModificando = null;
    actualizarBotones();
    quitarResaltadoFilas();
    limpiarFormulario();
}

function actualizarBotones() {
    const btnPrincipal = document.getElementById('btnPrincipal');
    const btnSecundario = document.getElementById('btnSecundario');
    
    if (sistemaFacturacion.esModificando) {
        btnPrincipal.innerHTML = '💾 Guardar';
        btnPrincipal.className = 'btn-accion btn-guardar';
        btnSecundario.innerHTML = '❌ Cancelar';
        btnSecundario.className = 'btn-accion btn-cancelar';
    } else {
        btnPrincipal.innerHTML = '➕ Añadir';
        btnPrincipal.className = 'btn-accion btn-añadir';
        btnSecundario.innerHTML = '🗑️ Limpiar';
        btnSecundario.className = 'btn-accion btn-limpiar';
    }
}

function cargarDetallesActuales() {
    sistemaFacturacion.detallesActuales = [];
    const filas = document.querySelectorAll('#detallesBody tr');
    
    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length >= 7) {
            sistemaFacturacion.detallesActuales.push({
                item: parseInt(celdas[0].textContent),
                producto: celdas[1].textContent,
                cantidad: parseInt(celdas[2].textContent),
                vlrUnit: parseInt(celdas[3].textContent.replace(/[^0-9]/g, '')),
                subtotal: parseInt(celdas[4].textContent.replace(/[^0-9]/g, '')),
                descuento: parseInt(celdas[5].textContent.replace(/[^0-9]/g, '')),
                total: parseInt(celdas[6].textContent.replace(/[^0-9]/g, ''))
            });
        }
    });
}

function actualizarTotalesGenerales() {
    cargarDetallesActuales();
    
    sistemaFacturacion.subtotalGeneral = sistemaFacturacion.detallesActuales.reduce((sum, d) => sum + d.subtotal, 0);
    sistemaFacturacion.descuentoGeneral = sistemaFacturacion.detallesActuales.reduce((sum, d) => sum + d.descuento, 0);
    sistemaFacturacion.totalGeneral = sistemaFacturacion.detallesActuales.reduce((sum, d) => sum + d.total, 0);
    
    document.getElementById('totalSubtotal').textContent = `$${formatearMoneda(sistemaFacturacion.subtotalGeneral)}`;
    document.getElementById('totalDescuento').textContent = `$${formatearMoneda(sistemaFacturacion.descuentoGeneral)}`;
    document.getElementById('totalFinal').textContent = `$${formatearMoneda(sistemaFacturacion.totalGeneral)}`;
    
    // Mostrar/ocultar mensaje sin datos
    const sinDetalles = document.getElementById('sinDetalles');
    const tablaDetalles = document.getElementById('tablaDetalles');
    
    if (sistemaFacturacion.detallesActuales.length === 0) {
        if (sinDetalles) sinDetalles.style.display = 'block';
        if (tablaDetalles) tablaDetalles.style.display = 'none';
    } else {
        if (sinDetalles) sinDetalles.style.display = 'none';
        if (tablaDetalles) tablaDetalles.style.display = 'table';
    }
}

function configurarEventListeners() {
    // Validación en tiempo real para cantidad
    document.getElementById('cantidad').addEventListener('input', function() {
        validarStock();
        calcularSubtotal();
    });
    
    // Validación en tiempo real para descuento
    document.getElementById('descuento').addEventListener('input', function() {
        validarDescuento();
        calcularTotal();
    });
    
    // Event listener para selección de cliente (change event)
    document.getElementById('clienteSelect').addEventListener('change', function() {
        console.log('Cliente seleccionado:', this.value);
        seleccionarCliente();
    });
    
    // Event listener para búsqueda de clientes (input event para filtrado)
    document.getElementById('clienteSelect').addEventListener('input', function() {
        filtrarClientes(this.value);
    });
}

function formatearMoneda(valor) {
    return valor.toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function mostrarError(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    elemento.textContent = mensaje;
    elemento.style.display = 'block';
}

function mostrarMensaje(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    elemento.textContent = mensaje;
    elemento.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        elemento.style.display = 'none';
    }, 3000);
}

function ocultarTodosLosErrores() {
    const errores = document.querySelectorAll('.error-message, .success-message');
    errores.forEach(error => error.style.display = 'none');
}

function limpiarCamposProducto() {
    document.getElementById('cantidad').value = '';
    document.getElementById('subtotal').value = '';
    document.getElementById('descuento').value = '';
    document.getElementById('total').value = '';
    ocultarTodosLosErrores();
}

function resaltarFilaModificacion(item) {
    quitarResaltadoFilas();
    const filas = document.querySelectorAll('#detallesBody tr');
    filas.forEach(fila => {
        const itemFila = parseInt(fila.querySelector('td:first-child').textContent);
        if (itemFila === item) {
            fila.style.backgroundColor = '#fff3cd';
            fila.style.border = '2px solid #ffc107';
        }
    });
}

function quitarResaltadoFilas() {
    const filas = document.querySelectorAll('#detallesBody tr');
    filas.forEach(fila => {
        fila.style.backgroundColor = '';
        fila.style.border = '';
    });
}

function habilitarBusquedaClientes() {
    const selectCliente = document.getElementById('clienteSelect');
    let opcionesOriginales = Array.from(selectCliente.options);
    
    selectCliente.addEventListener('input', function() {
        const texto = this.value.toLowerCase();
        
        // Limpiar opciones actuales
        selectCliente.innerHTML = '<option value="">Seleccione un cliente...</option>';
        
        // Filtrar y agregar opciones que coincidan
        const opcionesFiltradas = opcionesOriginales.filter(option => {
            return option.value === '' || option.textContent.toLowerCase().includes(texto);
        });
        
        if (opcionesFiltradas.length <= 1) {
            // Mostrar mensaje "sin resultados"
            const opcionSinResultados = document.createElement('option');
            opcionSinResultados.textContent = 'Sin resultados';
            opcionSinResultados.disabled = true;
            selectCliente.appendChild(opcionSinResultados);
        } else {
            opcionesFiltradas.forEach(option => {
                if (option.value !== '') selectCliente.appendChild(option.cloneNode(true));
            });
        }
    });
}

// ========================================
// FUNCIONES GLOBALES PARA BOTONES
// ========================================

function finalizarFactura() {
    if (!sistemaFacturacion.clienteSeleccionado) {
        alert('Debe seleccionar un cliente antes de finalizar la factura.');
        document.getElementById('clienteSelect').focus();
        return;
    }
    
    if (sistemaFacturacion.detallesActuales.length === 0) {
        alert('Debe agregar al menos un producto antes de finalizar la factura.');
        return;
    }
    
    if (confirm('¿Finalizar esta factura?\n\nUna vez finalizada no se podrá modificar.')) {
        window.location.href = `/encabezado/factura/${sistemaFacturacion.nroFactura}`;
    }
}

function cancelarFactura() {
    if (confirm('¿Cancelar esta factura?\n\nSe perderán todos los cambios realizados.')) {
        // Eliminar encabezado si no tiene detalles
        if (sistemaFacturacion.detallesActuales.length === 0) {
            fetch(`/encabezado/eliminar/${sistemaFacturacion.nroFactura}`, {
                method: 'POST'
            }).finally(() => {
                window.location.href = '/encabezado';
            });
        } else {
            window.location.href = '/encabezado';
        }
    }
}

console.log('📋 Sistema de facturación complejo cargado correctamente');