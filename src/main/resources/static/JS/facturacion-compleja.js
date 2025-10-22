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
    document.getElementById('subtotal').value = `$${TiendaPoliUtils.formatearMoneda(subtotal, false)}`;
    
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
    document.getElementById('descuentoValor').value = `$${TiendaPoliUtils.formatearMoneda(descuentoValor, false)}`;
    document.getElementById('total').value = `$${TiendaPoliUtils.formatearMoneda(total, false)}`;
    
    console.log(`💰 Cálculo de ítem - Subtotal: $${TiendaPoliUtils.formatearMoneda(subtotal, false)}, Descuento: ${descuentoPorcentaje}% ($${TiendaPoliUtils.formatearMoneda(descuentoValor, false)}), Total: $${TiendaPoliUtils.formatearMoneda(total, false)}`);
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
    console.log('🚀 Iniciando añadirDetalle()...');
    
    if (!validarFormularioCompleto()) {
        console.log('❌ Validación del formulario falló');
        return;
    }

    const detalle = obtenerDatosFormulario();
    console.log('📋 Datos del formulario obtenidos:', detalle);
    
    const nuevoItem = obtenerSiguienteItem();
    console.log('🔢 Siguiente número de item:', nuevoItem);
    console.log('📊 Estado actual de detalles:', sistemaFacturacion.detallesActuales);
    
    // Crear el detalle en el servidor
    const datos = {
        nroVenta: sistemaFacturacion.nroFactura,
        item: nuevoItem,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        descuento: detalle.descuento
    };
    
    console.log('📦 Datos a enviar al servidor:', datos);
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
    console.log(`🌐 enviarDetalleAlServidor llamado con:`, {datos, accion});
    
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
    
    console.log('📤 URL de destino:', urls[accion]);
    console.log('📋 FormData creado:', Array.from(formData.entries()));
    
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
        console.log('📥 Datos recibidos del servidor:', data);
        if (data) {
            console.log('✅ Respuesta del servidor válida:', data);
            if (data.success) {
                console.log('🎉 Operación exitosa:', data.message);
                
                // Mostrar mensaje de confirmación para todas las acciones
                mostrarMensajeExito(data.message);
                
                // Actualizar tabla dinámicamente
                console.log('🔄 Actualizando tabla con detalle:', data.detalle);
                actualizarTablaDetalles(data.detalle, accion);
                
                // Limpiar formulario si es añadir
                if (accion === 'añadir') {
                    console.log('🧹 Limpiando formulario después de añadir');
                    limpiarCamposProducto();
                    sistemaFacturacion.esModificando = false;
                }
                // Si es modificar, salir del modo modificación
                if (accion === 'modificar') {
                    salirModoModificacion();
                }
                // Recalcular totales
                console.log('💰 Recalculando totales generales');
                actualizarTotalesGenerales();
                
                // Verificar si la tabla está vacía después de eliminar
                if (accion === 'eliminar') {
                    verificarTablaVacia();
                }
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
    console.log('🔍 Buscando elemento detallesBody...');
    const tbody = document.getElementById('detallesBody');
    
    console.log('📍 Elemento encontrado:', tbody);
    console.log('📍 Tipo de elemento:', tbody ? tbody.tagName : 'null');
    console.log('📍 Parent de tbody:', tbody ? tbody.parentElement : 'null');
    
    if (!tbody) {
        console.error('❌ Error: No se encontró el elemento detallesBody en el DOM');
        console.log('🔍 Elementos disponibles con ID que contengan "detalle":');
        const elementos = document.querySelectorAll('[id*="detalle"]');
        elementos.forEach(el => console.log(`  - ${el.id}: ${el.tagName}`));
        
        console.log('🔍 Todos los tbody en la página:');
        const tbodies = document.querySelectorAll('tbody');
        tbodies.forEach((tb, index) => console.log(`  - tbody[${index}]: id="${tb.id}" class="${tb.className}"`));
        return;
    }
    
    console.log('✅ Elemento detallesBody encontrado correctamente');
    
    if (accion === 'añadir') {
        // Eliminar fila de mensaje vacío si existe
        const filaVacia = document.getElementById('filaVacia');
        if (filaVacia) {
            console.log('🗑️ Eliminando fila de mensaje vacío');
            filaVacia.remove();
        }
        
        // Agregar nueva fila
        const fila = crearFilaDetalle(detalle);
        if (fila) {
            console.log('➕ Agregando nueva fila a la tabla');
            tbody.appendChild(fila);
        } else {
            console.error('❌ Error: No se pudo crear la fila');
        }
    } else if (accion === 'modificar') {
        // Actualizar fila existente
        const filas = tbody.querySelectorAll('tr');
        filas.forEach(fila => {
            const primeraCelda = fila.querySelector('td:first-child');
            if (primeraCelda) {
                const itemFila = parseInt(primeraCelda.textContent);
                if (itemFila === detalle.item) {
                    const nuevaFila = crearFilaDetalle(detalle);
                    if (nuevaFila) {
                        fila.replaceWith(nuevaFila);
                    }
                }
            }
        });
    } else if (accion === 'eliminar') {
        // Eliminar fila
        const filas = tbody.querySelectorAll('tr');
        filas.forEach(fila => {
            const primeraCelda = fila.querySelector('td:first-child');
            if (primeraCelda) {
                const itemFila = parseInt(primeraCelda.textContent);
                if (itemFila === detalle.item) {
                    fila.remove();
                }
            }
        });
        
        // Verificar si la tabla queda vacía después de eliminar
        const filasRestantes = tbody.querySelectorAll('tr:not(#filaVacia)');
        if (filasRestantes.length === 0) {
            console.log('📝 Tabla vacía, agregando mensaje');
            const filaVacia = document.createElement('tr');
            filaVacia.id = 'filaVacia';
            filaVacia.innerHTML = `
                <td colspan="8" style="text-align: center; padding: 20px; color: #6c757d; font-style: italic;">
                    No hay productos agregados a esta factura. Use la sección anterior para agregar productos.
                </td>
            `;
            tbody.appendChild(filaVacia);
        }
    }
}

function crearFilaDetalle(detalle) {
    if (!detalle) {
        console.error('Error: detalle es null o undefined');
        return null;
    }
    
    try {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${detalle.item || 0}</td>
            <td>${detalle.producto || 'Producto no especificado'}</td>
            <td>${detalle.cantidad || 0}</td>
            <td>$${TiendaPoliUtils.formatearMoneda(detalle.vlrUnit || 0, false)}</td>
            <td>$${TiendaPoliUtils.formatearMoneda(detalle.subtotal || 0, false)}</td>
            <td>$${TiendaPoliUtils.formatearMoneda(detalle.descuento || 0, false)}</td>
            <td>$${TiendaPoliUtils.formatearMoneda(detalle.total || 0, false)}</td>
            <td>
                <button type="button" class="btn-accion btn-modificar" 
                        onclick="modificarDetalle(this)" 
                        data-item="${detalle.item || 0}" 
                        data-producto="${detalle.productoId || 0}"
                        data-cantidad="${detalle.cantidad || 0}" 
                        data-descuento="${detalle.descuento || 0}">
                    ✏️ Modificar
                </button>
                <button type="button" class="btn-accion btn-eliminar" 
                        onclick="eliminarDetalle(this)" 
                        data-item="${detalle.item || 0}">
                    🗑️ Eliminar
                </button>
            </td>
        `;
        return fila;
    } catch (error) {
        console.error('Error al crear fila de detalle:', error);
        return null;
    }
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
    
    // Validar que tenemos un número de factura válido (ahora aceptamos negativos para borradores)
    if (!sistemaFacturacion.nroFactura || sistemaFacturacion.nroFactura == 0) {
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
    
    fetch('/facturacion/actualizar-cliente', {
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
    // Usar la función del módulo de utilidades pero con campos específicos
    document.getElementById('productoSelect').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('subtotal').value = '';
    document.getElementById('descuento').value = '';
    document.getElementById('total').value = '';
    
    // Ocultar mensajes usando utilidades
    TiendaPoliUtils.ocultarTodosLosErrores();
    
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
    
    document.getElementById('totalSubtotal').textContent = `$${TiendaPoliUtils.formatearMoneda(sistemaFacturacion.subtotalGeneral, false)}`;
    document.getElementById('totalDescuento').textContent = `$${TiendaPoliUtils.formatearMoneda(sistemaFacturacion.descuentoGeneral, false)}`;
    document.getElementById('totalFinal').textContent = `$${TiendaPoliUtils.formatearMoneda(sistemaFacturacion.totalGeneral, false)}`;
    
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

// Función removida - ahora se usa TiendaPoliUtils.formatearMoneda()



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

// Función removida - ahora se usa TiendaPoliUtils.ocultarTodosLosErrores()
function ocultarTodosLosErrores() {
    // Mantener funcionalidad específica para stock
    const stockInfo = document.getElementById('stockInfo');
    if (stockInfo) {
        stockInfo.classList.remove('error');
    }
    
    // Usar función de utilidades para el resto
    TiendaPoliUtils.ocultarTodosLosErrores();
}

function limpiarCamposProducto() {
    console.log('🧹 Limpiando todos los campos del formulario de productos...');
    
    // Limpiar selector de producto
    const productoSelect = document.getElementById('productoSelect');
    if (productoSelect) {
        productoSelect.value = '';
        console.log('   ✅ Producto: limpiado');
    }
    
    // Limpiar cantidad
    const cantidad = document.getElementById('cantidad');
    if (cantidad) {
        cantidad.value = '';
        console.log('   ✅ Cantidad: limpiada');
    }
    
    // Limpiar subtotal
    const subtotal = document.getElementById('subtotal');
    if (subtotal) {
        subtotal.value = '';
        console.log('   ✅ Subtotal: limpiado');
    }
    
    // Limpiar descuento porcentaje
    const descuento = document.getElementById('descuento');
    if (descuento) {
        descuento.value = '';
        console.log('   ✅ Descuento %: limpiado');
    }
    
    // Limpiar descuento valor aplicado
    const descuentoValor = document.getElementById('descuentoValor');
    if (descuentoValor) {
        descuentoValor.value = '';
        console.log('   ✅ Descuento Aplicado: limpiado');
    }
    
    // Limpiar total ítem
    const total = document.getElementById('total');
    if (total) {
        total.value = '';
        console.log('   ✅ Total Ítem: limpiado');
    }
    
    // Asegurar que la información de stock esté oculta
    const stockInfo = document.getElementById('stockInfo');
    if (stockInfo) {
        stockInfo.classList.remove('show', 'error');
        stockInfo.classList.add('hidden');
        console.log('   ✅ Información de stock: ocultada');
    }
    
    // Ocultar todos los mensajes de error
    ocultarTodosLosErrores();
    console.log('   ✅ Mensajes de error: ocultados');
    
    // Enfocar en el selector de producto para la siguiente entrada
    if (productoSelect) {
        productoSelect.focus();
        console.log('   ✅ Foco en selector de producto');
    }
    
    console.log('🎯 Formulario completamente limpiado y listo para nuevo producto');
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
    fetch(`/facturacion/finalizar/${sistemaFacturacion.nroFactura}`, {
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
        fetch(`/facturacion/eliminar/${sistemaFacturacion.nroFactura}`, {
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
            window.location.href = '/facturacion';
        })
        .catch(error => {
            console.error('❌ Error al cancelar factura:', error);
            alert('❌ Error al cancelar la factura. Redirigiendo al listado...');
            window.location.href = '/facturacion';
        });
    }
}

// Función para mostrar mensajes de éxito temporales
function mostrarMensajeExito(mensaje) {
    // Verificar que el DOM esté listo
    if (!document.body) {
        console.error('Error: document.body no está disponible');
        return;
    }
    
    // Crear elemento de alerta si no existe
    let alertaExito = document.getElementById('alertaExito');
    if (!alertaExito) {
        alertaExito = document.createElement('div');
        alertaExito.id = 'alertaExito';
        alertaExito.className = 'alert alert-success alert-dismissible animate-slide-in-down';
        alertaExito.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            padding: 15px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: bold;
            display: none;
        `;
        document.body.appendChild(alertaExito);
    }
    
    // Actualizar contenido y mostrar
    alertaExito.innerHTML = `
        <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px;">✅</span>
            <span>${mensaje}</span>
        </div>
    `;
    
    alertaExito.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        alertaExito.style.display = 'none';
    }, 3000);
}

// Función para verificar si la tabla de detalles está vacía y mostrar mensaje apropiado
function verificarTablaVacia() {
    const tbody = document.getElementById('detallesBody');
    const tabla = document.getElementById('tablaDetalles');
    
    if (!tbody || !tabla) {
        console.error('Error: No se encontraron elementos de tabla en el DOM');
        return;
    }
    
    const filas = tbody.querySelectorAll('tr');
    
    if (filas.length === 0) {
        // Tabla vacía - mostrar mensaje
        mostrarMensajeTablaVacia();
    } else {
        // Tabla con datos - ocultar mensaje si existe
        ocultarMensajeTablaVacia();
    }
}

// Función para mostrar mensaje cuando la tabla está vacía
function mostrarMensajeTablaVacia() {
    const tabla = document.getElementById('tablaDetalles');
    
    if (!tabla) {
        console.error('Error: No se encontró la tabla de detalles');
        return;
    }
    
    let mensajeVacio = document.getElementById('mensajeTablaVacia');
    
    if (!mensajeVacio) {
        mensajeVacio = document.createElement('div');
        mensajeVacio.id = 'mensajeTablaVacia';
        mensajeVacio.className = 'empty-state';
        mensajeVacio.style.cssText = `
            text-align: center;
            padding: 40px 20px;
            color: #6c757d;
            font-style: italic;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 20px 0;
        `;
        mensajeVacio.innerHTML = `
            <p style="margin: 0; font-size: 16px;">No hay productos agregados a esta factura.</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Use la sección anterior para agregar productos.</p>
        `;
        
        // Validar que tabla.parentNode existe antes de usar insertBefore
        if (tabla.parentNode) {
            tabla.parentNode.insertBefore(mensajeVacio, tabla.nextSibling);
        } else {
            console.error('Error: tabla.parentNode es null');
            return;
        }
    }
    
    // Ocultar tabla y mostrar mensaje
    tabla.style.display = 'none';
    mensajeVacio.style.display = 'block';
}

// Función para ocultar mensaje cuando la tabla tiene datos
function ocultarMensajeTablaVacia() {
    const tabla = document.getElementById('tablaDetalles');
    const mensajeVacio = document.getElementById('mensajeTablaVacia');
    
    if (tabla) {
        tabla.style.display = 'table';
    }
    
    if (mensajeVacio) {
        mensajeVacio.style.display = 'none';
    }
}

console.log('📋 Sistema de facturación complejo cargado correctamente');