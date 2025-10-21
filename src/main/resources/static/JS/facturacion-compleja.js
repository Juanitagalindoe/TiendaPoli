// Sistema complejo de facturación con validaciones y cálculos automáticos
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema de facturación avanzado...');
    
    // Variables globales para el estado de la aplicación
    // Obtener el primer elemento campo-readonly que corresponde al número de factura
    const camposReadonly = document.querySelectorAll('.header-factura .campo-readonly');
    const nroVentaElement = camposReadonly.length > 0 ? camposReadonly[0] : null;
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
    // No mostrar información de stock al seleccionar producto
    // Solo se mostrará cuando la cantidad exceda el stock disponible
    console.log(`Producto seleccionado: ${producto.nombre} (Stock: ${producto.stock})`);
}

// ========================================
// VALIDACIONES EN TIEMPO REAL
// ========================================

function validarStock() {
    const productoId = parseInt(document.getElementById('productoSelect').value);
    const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
    const cantidadError = document.getElementById('cantidadError');
    const stockInfo = document.getElementById('stockInfo');
    
    // Ocultar mensajes previos
    cantidadError.classList.remove('show');
    stockInfo.classList.remove('show');
    stockInfo.classList.add('hidden');
    
    if (!productoId || cantidad === 0) {
        return true;
    }
    
    const producto = sistemaFacturacion.productos.find(p => p.id === productoId);
    if (!producto) {
        mostrarError('cantidadError', 'Producto no encontrado');
        return false;
    }
    
    // Solo mostrar información de stock cuando la cantidad excede el disponible
    if (cantidad > producto.stock) {
        mostrarError('cantidadError', `Cantidad excede el stock disponible`);
        // Mostrar información de stock con estilo de error
        stockInfo.textContent = `Stock disponible: ${producto.stock} unidades`;
        stockInfo.classList.remove('hidden');
        stockInfo.classList.add('show', 'error');
        return false;
    }
    
    return true;
}

function validarDescuento() {
    const descuentoPorcentaje = parseFloat(document.getElementById('descuento').value) || 0;
    const descuentoError = document.getElementById('descuentoError');
    
    // Ocultar errores previos
    descuentoError.classList.remove('show');
    
    // Validar que el porcentaje esté entre 0 y 100
    if (descuentoPorcentaje < 0) {
        mostrarError('descuentoError', 'El descuento no puede ser negativo');
        return false;
    }
    
    if (descuentoPorcentaje > 100) {
        mostrarError('descuentoError', 'El descuento no puede ser mayor al 100%');
        return false;
    }
    
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
        document.getElementById('descuentoValor').value = '';
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
    const descuentoPorcentaje = parseFloat(document.getElementById('descuento').value) || 0;
    
    if (!subtotalTexto) {
        document.getElementById('descuentoValor').value = '';
        document.getElementById('total').value = '';
        return;
    }
    
    if (!validarDescuento()) return;
    
    const subtotal = parseInt(subtotalTexto.replace(/[^0-9]/g, ''));
    
    // Calcular el descuento como porcentaje del subtotal
    const descuentoValor = Math.round(subtotal * (descuentoPorcentaje / 100));
    const total = Math.max(0, subtotal - descuentoValor);
    
    // Mostrar los valores calculados
    document.getElementById('descuentoValor').value = `$${formatearMoneda(descuentoValor)}`;
    document.getElementById('total').value = `$${formatearMoneda(total)}`;
    
    console.log(`💰 Cálculo de ítem - Subtotal: $${formatearMoneda(subtotal)}, Descuento: ${descuentoPorcentaje}% ($${formatearMoneda(descuentoValor)}), Total: $${formatearMoneda(total)}`);
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
    if (!validarFormularioCompleto()) {
        return;
    }

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
    
    console.log('➕ Añadiendo detalle:', `Producto ${detalle.productoId}, Cant: ${detalle.cantidad}, Desc: $${detalle.descuento}`);
    enviarDetalleAlServidor(datos, 'añadir');
}function modificarDetalle(boton) {
    const item = parseInt(boton.getAttribute('data-item'));
    const productoId = parseInt(boton.getAttribute('data-producto'));
    const cantidad = parseInt(boton.getAttribute('data-cantidad'));
    const descuento = parseFloat(boton.getAttribute('data-descuento'));
    
    // Cambiar a modo modificación
    sistemaFacturacion.esModificando = true;
    sistemaFacturacion.itemModificando = item;
    
    // Llenar formulario con datos existentes
    document.getElementById('productoSelect').value = productoId;
    document.getElementById('cantidad').value = cantidad;
    
    // Recalcular valores primero para obtener el subtotal
    seleccionarProducto();
    calcularSubtotal();
    
    // Calcular el porcentaje basado en el descuento y subtotal actuales
    const subtotal = parseFloat(document.getElementById('subtotal').value) || 0;
    const porcentajeDescuento = subtotal > 0 ? (descuento / subtotal) * 100 : 0;
    document.getElementById('descuento').value = porcentajeDescuento.toFixed(2);
    
    // Recalcular el total con el descuento
    calcularTotal();
    
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
        formData.append('descuentoDetalle', datos.descuento || 0);
    }
    
    fetch(urls[accion], {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.redirected) {
            console.log('Redirected to:', response.url);
            // Si hay redirección, recargar la página para mostrar cambios
            window.location.reload();
        } else if (!response.ok) {
            console.error('Response not ok:', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            return response.json();
        }
    })
    .then(data => {
        if (data) {
            console.log('Respuesta del servidor:', data);
            if (data.success) {
                // Actualizar tabla dinámicamente
                actualizarTablaDetalles(data.detalle, accion);
                // Limpiar formulario si es añadir
                if (accion === 'añadir') {
                    limpiarCamposProducto();
                    sistemaFacturacion.esModificando = false;
                }
                // Si es modificar, salir del modo modificación
                if (accion === 'modificar') {
                    salirModoModificacion();
                }
                // Recalcular totales
                actualizarTotalesGenerales();
            } else {
                console.error('Server returned error:', data);
                alert(data.message || 'Error al procesar la solicitud');
            }
        }
    })
    .catch(error => {
        console.error('Fetch error details:', error);
        console.error('Error stack:', error.stack);
        alert('Error al procesar la solicitud: ' + error.message);
    });
}

function actualizarTablaDetalles(detalle, accion) {
    const tbody = document.getElementById('detallesBody');
    
    if (accion === 'añadir') {
        // Agregar nueva fila
        const fila = crearFilaDetalle(detalle);
        tbody.appendChild(fila);
    } else if (accion === 'modificar') {
        // Actualizar fila existente
        const filas = tbody.querySelectorAll('tr');
        filas.forEach(fila => {
            const itemFila = parseInt(fila.querySelector('td:first-child').textContent);
            if (itemFila === detalle.item) {
                const nuevaFila = crearFilaDetalle(detalle);
                fila.replaceWith(nuevaFila);
            }
        });
    } else if (accion === 'eliminar') {
        // Eliminar fila
        const filas = tbody.querySelectorAll('tr');
        filas.forEach(fila => {
            const itemFila = parseInt(fila.querySelector('td:first-child').textContent);
            if (itemFila === detalle.item) {
                fila.remove();
            }
        });
    }
}

function crearFilaDetalle(detalle) {
    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${detalle.item}</td>
        <td>${detalle.producto}</td>
        <td>${detalle.cantidad}</td>
        <td>$${formatearMoneda(detalle.vlrUnit)}</td>
        <td>$${formatearMoneda(detalle.subtotal)}</td>
        <td>$${formatearMoneda(detalle.descuento)}</td>
        <td>$${formatearMoneda(detalle.total)}</td>
        <td>
            <button type="button" class="btn-accion btn-modificar" 
                    onclick="modificarDetalle(this)" 
                    data-item="${detalle.item}" 
                    data-producto="${detalle.productoId}"
                    data-cantidad="${detalle.cantidad}" 
                    data-descuento="${detalle.descuento}">
                ✏️ Modificar
            </button>
            <button type="button" class="btn-accion btn-eliminar" 
                    onclick="eliminarDetalle(this)" 
                    data-item="${detalle.item}">
                🗑️ Eliminar
            </button>
        </td>
    `;
    return fila;
}

function salirModoModificacion() {
    sistemaFacturacion.esModificando = false;
    sistemaFacturacion.itemModificando = null;
    
    // Limpiar el formulario
    limpiarCamposProducto();
    
    // Quitar resaltado de filas
    quitarResaltadoFilas();
    
    // Restaurar botones a modo normal
    const btnPrimario = document.querySelector('.btn-accion.btn-agregar');
    const btnSecundario = document.querySelector('.btn-accion.btn-limpiar');
    
    if (btnPrimario) {
        btnPrimario.innerHTML = '➕ Agregar Producto';
        btnPrimario.className = 'btn-accion btn-agregar';
        btnPrimario.onclick = añadirDetalle;
    }
    
    if (btnSecundario) {
        btnSecundario.innerHTML = '🗑️ Limpiar';
        btnSecundario.className = 'btn-accion btn-limpiar';
        btnSecundario.onclick = limpiarCamposProducto;
    }
}

function seleccionarCliente() {
    const select = document.getElementById('clienteSelect');
    const clienteId = select.value;
    
    console.log('=== SELECCIONAR CLIENTE DEBUG ===');
    console.log('Cliente ID seleccionado:', clienteId);
    console.log('Numero de factura:', sistemaFacturacion.nroFactura);
    console.log('Estado del sistema:', sistemaFacturacion);
    
    // Ocultar mensajes anteriores
    document.getElementById('clienteError').style.display = 'none';
    document.getElementById('clienteSuccess').style.display = 'none';
    
    if (!clienteId) {
        console.log('Cliente ID vacío, limpiando selección');
        sistemaFacturacion.clienteSeleccionado = null;
        return;
    }
    
    // Validar que tenemos un número de factura válido
    if (!sistemaFacturacion.nroFactura || sistemaFacturacion.nroFactura <= 0) {
        console.error('Número de factura inválido:', sistemaFacturacion.nroFactura);
        mostrarError('clienteError', 'Error: Número de factura inválido');
        return;
    }
    
    // Actualizar cliente en el servidor
    const formData = new FormData();
    formData.append('nroVenta', parseInt(sistemaFacturacion.nroFactura));
    formData.append('clienteId', clienteId);
    
    console.log('Enviando datos al servidor:', {
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
    // Obtener el valor del descuento calculado (no el porcentaje)
    const descuentoValorTexto = document.getElementById('descuentoValor').value;
    const descuentoPorcentajeTexto = document.getElementById('descuento').value;
    let descuentoValor = 0;
    
    if (descuentoValorTexto) {
        // Remover TODOS los caracteres de formato: $, puntos, comas, espacios
        const valorLimpio = descuentoValorTexto.replace(/[$.,\s]/g, '');
        descuentoValor = parseFloat(valorLimpio) || 0;
    }
    
    // Debug mínimo para monitoreo
    if (descuentoValor > 0) {
        console.log('💰 Descuento calculado:', descuentoValor);
    }
    
    const resultado = {
        productoId: parseInt(document.getElementById('productoSelect').value),
        cantidad: parseInt(document.getElementById('cantidad').value),
        descuento: Math.round(descuentoValor), // Redondear para evitar decimales
        descuentoPorcentaje: parseFloat(descuentoPorcentajeTexto) || 0 // Para referencia
    };
    return resultado;
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
}

function formatearMoneda(valor) {
    return valor.toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}



function mostrarMensaje(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    elemento.textContent = mensaje;
    elemento.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        elemento.classList.remove('show');
    }, 3000);
}

function mostrarError(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.classList.remove('hidden');
        elemento.classList.add('show');
    }
}

function ocultarTodosLosErrores() {
    const errores = document.querySelectorAll('.error-message, .success-message');
    errores.forEach(error => {
        error.classList.remove('show');
        error.classList.add('hidden');
    });
    
    // Resetear clases del mensaje de stock
    const stockInfo = document.getElementById('stockInfo');
    if (stockInfo) {
        stockInfo.classList.remove('error');
    }
}

function limpiarCamposProducto() {
    document.getElementById('cantidad').value = '';
    document.getElementById('subtotal').value = '';
    document.getElementById('descuento').value = '';
    document.getElementById('descuentoValor').value = '';
    document.getElementById('total').value = '';
    
    // Asegurar que la información de stock esté oculta
    const stockInfo = document.getElementById('stockInfo');
    stockInfo.classList.remove('show', 'error');
    stockInfo.classList.add('hidden');
    
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
    console.log('=== FINALIZANDO FACTURA ===');
    console.log('Cliente seleccionado:', sistemaFacturacion.clienteSeleccionado);
    console.log('Detalles actuales:', sistemaFacturacion.detallesActuales.length);
    console.log('Número de factura:', sistemaFacturacion.nroFactura);
    
    // Validaciones básicas del lado cliente
    const selectCliente = document.getElementById('clienteSelect');
    const clienteSeleccionadoActual = selectCliente ? selectCliente.value : null;
    
    if (!clienteSeleccionadoActual || clienteSeleccionadoActual === '') {
        alert('Debe seleccionar un cliente antes de finalizar la factura.');
        if (selectCliente) selectCliente.focus();
        return;
    }
    
    // Cargar detalles actuales para validación
    cargarDetallesActuales();
    
    if (sistemaFacturacion.detallesActuales.length === 0) {
        alert('Debe agregar al menos un producto antes de finalizar la factura.');
        return;
    }
    
    if (!confirm('¿Finalizar esta factura?\n\nUna vez finalizada no se podrá modificar.')) {
        return;
    }
    
    console.log('Enviando petición de finalización al servidor...');
    
    // Enviar petición al servidor para finalizar
    fetch(`/encabezado/finalizar/${sistemaFacturacion.nroFactura}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
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
            // Mostrar mensaje de éxito y redirigir
            alert('✅ ' + data.message);
            window.location.href = data.redirectUrl;
        } else {
            // Mostrar error
            alert('❌ Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al finalizar factura:', error);
        alert('❌ Error de comunicación con el servidor al finalizar la factura');
    });
}

function cancelarFactura() {
    if (confirm('¿Cancelar esta factura?\n\nSe eliminará completamente el registro de la factura y todos sus datos.')) {
        console.log('👀 Cancelando factura ID:', sistemaFacturacion.nroFactura);
        
        // Siempre eliminar el encabezado al cancelar, independientemente de si tiene detalles
        fetch(`/encabezado/eliminar/${sistemaFacturacion.nroFactura}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error en la respuesta del servidor');
        })
        .then(data => {
            console.log('✅ Factura cancelada exitosamente:', data.message);
            alert('✅ Factura cancelada correctamente');
            window.location.href = '/encabezado';
        })
        .catch(error => {
            console.error('❌ Error al cancelar factura:', error);
            alert('❌ Error al cancelar la factura. Redirigiendo al listado...');
            window.location.href = '/encabezado';
        });
    }
}

console.log('📋 Sistema de facturación complejo cargado correctamente');