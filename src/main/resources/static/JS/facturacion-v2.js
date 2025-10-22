// Sistema complejo de facturación con validaciones y cálculos automáticos
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema de facturación avanzado...');
    console.log('🔥 VERSION ACTUALIZADA - VALIDACIÓN DE CLIENTE OBLIGATORIO - 22/10/2025 19:00');
    
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
    verificarClienteInicial();
    actualizarTotalesGenerales();
    console.log('✅ Sistema de facturación listo');
}

// ========================================
// FUNCIONES GLOBALES REQUERIDAS POR EL HTML
// ========================================

function seleccionarProducto() {
    console.log('📦 Producto seleccionado, actualizando información...');
    actualizarInfoProducto();
}

function validarStock() {
    try {
        const productoId = parseInt(document.getElementById('productoSelect').value);
        const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
        
        // Limpiar mensajes previos
        ocultarMensajeError('cantidadError');
        
        if (!productoId) {
            return true; // No validar si no hay producto seleccionado
        }
        
        if (cantidad <= 0) {
            mostrarMensajeError('cantidadError', 'La cantidad debe ser mayor a 0');
            return false;
        }
        
        const producto = obtenerProductoPorId(productoId);
        if (producto) {
            if (cantidad > producto.stock) {
                mostrarMensajeError('cantidadError', `⚠️ Stock insuficiente. Disponible: ${producto.stock}, Solicitado: ${cantidad}`);
                mostrarMensajeAlerta(`Stock insuficiente para ${producto.nombre}. Solo hay ${producto.stock} unidades disponibles.`, 'warning');
                return false;
            } else {
                ocultarMensajeError('cantidadError');
                if (cantidad > 0) {
                    mostrarMensajeExito(`✅ Stock disponible: ${producto.stock - cantidad} unidades restantes`);
                }
                return true;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error al validar stock:', error);
        return true; // Permitir continuar en caso de error
    }
}

// ========================================
// FUNCIONES DE MENSAJES Y ALERTAS
// ========================================

function mostrarMensajeAlerta(mensaje, tipo = 'info') {
    try {
        // Crear el contenedor de alertas si no existe
        let alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'alertContainer';
            alertContainer.className = 'alert-container';
            alertContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(alertContainer);
        }
        
        // Crear el mensaje de alerta
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${tipo}`;
        alertElement.style.cssText = `
            margin-bottom: 10px;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            pointer-events: auto;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            font-size: 14px;
            border-left: 4px solid;
            background: white;
        `;
        
        // Configurar colores según tipo
        switch (tipo) {
            case 'success':
                alertElement.style.borderLeftColor = '#28a745';
                alertElement.style.backgroundColor = '#d4edda';
                alertElement.style.color = '#155724';
                break;
            case 'warning':
                alertElement.style.borderLeftColor = '#ffc107';
                alertElement.style.backgroundColor = '#fff3cd';
                alertElement.style.color = '#856404';
                break;
            case 'error':
                alertElement.style.borderLeftColor = '#dc3545';
                alertElement.style.backgroundColor = '#f8d7da';
                alertElement.style.color = '#721c24';
                break;
            default:
                alertElement.style.borderLeftColor = '#17a2b8';
                alertElement.style.backgroundColor = '#d1ecf1';
                alertElement.style.color = '#0c5460';
        }
        
        alertElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${mensaje}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; font-size: 18px; cursor: pointer; color: currentColor; margin-left: 10px;">×</button>
            </div>
        `;
        
        alertContainer.appendChild(alertElement);
        
        // Animación de entrada
        setTimeout(() => {
            alertElement.style.opacity = '1';
            alertElement.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.style.opacity = '0';
                alertElement.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (alertElement.parentNode) {
                        alertElement.remove();
                    }
                }, 300);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error al mostrar mensaje de alerta:', error);
        // Fallback a alert básico
        alert(mensaje);
    }
}

function mostrarMensajeExito(mensaje) {
    mostrarMensajeAlerta(mensaje, 'success');
}

function mostrarMensajeError(elementoId, mensaje) {
    try {
        const elemento = document.getElementById(elementoId);
        if (elemento) {
            elemento.textContent = mensaje;
            elemento.style.display = 'block';
            elemento.style.color = '#dc3545';
            elemento.style.fontSize = '0.875rem';
            elemento.style.marginTop = '5px';
        }
    } catch (error) {
        console.error('Error al mostrar mensaje de error:', error);
    }
}

function ocultarMensajeError(elementoId) {
    try {
        const elemento = document.getElementById(elementoId);
        if (elemento) {
            elemento.style.display = 'none';
            elemento.textContent = '';
        }
    } catch (error) {
        console.error('Error al ocultar mensaje de error:', error);
    }
}

function validarDescuento() {
    try {
        const descuento = parseFloat(document.getElementById('descuento').value) || 0;
        
        // Limpiar mensajes previos
        ocultarMensajeError('descuentoError');
        
        if (descuento < 0) {
            mostrarMensajeError('descuentoError', 'El descuento no puede ser negativo');
            return false;
        }
        
        if (descuento > 99.9) {
            mostrarMensajeError('descuentoError', 'El descuento no puede ser mayor al 99.9%');
            return false;
        }
        
        // Mostrar mensaje positivo para descuentos válidos
        if (descuento > 0) {
            const productoId = parseInt(document.getElementById('productoSelect').value);
            const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
            
            if (productoId && cantidad > 0) {
                const producto = obtenerProductoPorId(productoId);
                if (producto) {
                    const subtotal = producto.precio * cantidad;
                    const descuentoValor = (subtotal * descuento) / 100;
                    mostrarMensajeAlerta(`💰 Descuento del ${descuento}% = $${descuentoValor.toFixed(2)}`, 'info');
                }
            } else {
                mostrarMensajeAlerta(`💰 Descuento del ${descuento}% configurado (rango: 0.0% - 99.9%)`, 'info');
            }
        }
        
        ocultarMensajeError('descuentoError');
        return true;
    } catch (error) {
        console.error('Error al validar descuento:', error);
        return true; // Permitir continuar en caso de error
    }
}

function calcularTotal() {
    try {
        const productoId = parseInt(document.getElementById('productoSelect').value);
        const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
        const descuentoPorcentaje = parseFloat(document.getElementById('descuento').value) || 0;
        
        if (productoId && cantidad > 0) {
            const producto = obtenerProductoPorId(productoId);
            if (producto) {
                const subtotal = producto.precio * cantidad;
                const descuentoValor = (subtotal * descuentoPorcentaje) / 100;
                const total = subtotal - descuentoValor;
                
                // Actualizar campos mostrando valores exactos
                const subtotalField = document.getElementById('subtotal');
                const descuentoValorField = document.getElementById('descuentoValor');
                const totalField = document.getElementById('total');
                
                if (subtotalField) subtotalField.value = `$${TiendaPoliUtils.formatearMoneda(subtotal, false)}`;
                if (descuentoValorField) descuentoValorField.value = `$${descuentoValor.toFixed(2)}`;
                if (totalField) totalField.value = `$${TiendaPoliUtils.formatearMoneda(Math.round(total), false)}`;
                
                return { subtotal, descuentoValor, total };
            }
        }
        
        // Limpiar campos si no hay producto seleccionado
        const subtotalField = document.getElementById('subtotal');
        const descuentoValorField = document.getElementById('descuentoValor');
        const totalField = document.getElementById('total');
        
        if (subtotalField) subtotalField.value = '';
        if (descuentoValorField) descuentoValorField.value = '';
        if (totalField) totalField.value = '';
        
        return { subtotal: 0, descuentoValor: 0, total: 0 };
    } catch (error) {
        console.error('Error al calcular total:', error);
        return { subtotal: 0, descuentoValor: 0, total: 0 };
    }
}

// ========================================
// GESTIÓN DE PRODUCTOS
// ========================================

function cargarProductosDisponibles() {
    // Los productos ya están cargados en el select
    const selectProducto = document.getElementById('productoSelect');
    if (selectProducto) {
        sistemaFacturacion.productos = Array.from(selectProducto.options)
            .filter(option => option.value !== '')
            .map(option => ({
                id: parseInt(option.value),
                nombre: option.textContent.split(' - ')[0],
                precio: parseFloat(option.dataset.precio || '0'),
                stock: parseInt(option.dataset.stock || '0')
            }));
        
        console.log('Productos cargados:', sistemaFacturacion.productos);
    }
}

function obtenerProductoPorId(productoId) {
    return sistemaFacturacion.productos.find(p => p.id === parseInt(productoId));
}

function validarStockDisponible(productoId, cantidadSolicitada) {
    const producto = obtenerProductoPorId(productoId);
    if (!producto) {
        throw new Error('Producto no encontrado');
    }
    
    if (cantidadSolicitada > producto.stock) {
        throw new Error(`Stock insuficiente. Disponible: ${producto.stock}, Solicitado: ${cantidadSolicitada}`);
    }
    
    return true;
}

// ========================================
// GESTIÓN DE DETALLES
// ========================================

function añadirDetalle() {
    try {
        console.log('🔄 Iniciando proceso de añadir detalle...');
        
        // Obtener valores del formulario
        const productoId = parseInt(document.getElementById('productoSelect').value);
        const cantidad = parseInt(document.getElementById('cantidad').value);
        const descuentoValue = document.getElementById('descuento').value;
        const descuento = parseFloat(descuentoValue) || 0; // Usar parseFloat para decimales
        
        console.log('Datos del formulario:', { productoId, cantidad, descuento });
        console.log('🔍 DEBUGGING DESCUENTO:');
        console.log('   - Valor raw del input descuento:', document.getElementById('descuento').value);
        console.log('   - Tipo de valor:', typeof descuento);
        console.log('   - Valor parseado:', descuento);
        
        // Validación de cliente seleccionado
        const clienteId = document.getElementById('clienteSelect').value;
        if (!clienteId) {
            mostrarMensajeAlerta('⚠️ Debes seleccionar un cliente antes de agregar productos a la factura', 'warning');
            document.getElementById('clienteSelect').focus();
            return;
        }
        
        // Validaciones básicas con mensajes informativos
        if (!productoId) {
            mostrarMensajeAlerta('Por favor selecciona un producto antes de continuar', 'warning');
            return;
        }
        
        if (cantidad <= 0) {
            mostrarMensajeAlerta('La cantidad debe ser mayor a 0', 'warning');
            return;
        }
        
        // Validar stock disponible
        try {
            validarStockDisponible(productoId, cantidad);
        } catch (error) {
            mostrarMensajeAlerta(error.message, 'error');
            return;
        }
        
        // Preparar datos para enviar
        const siguienteItem = sistemaFacturacion.esModificando 
            ? sistemaFacturacion.itemModificando 
            : (sistemaFacturacion.detallesActuales.length + 1);
            
        const datos = {
            nroVenta: sistemaFacturacion.nroFactura,
            item: siguienteItem,
            productoId: productoId,
            cantidad: cantidad,
            descuentoPorcentaje: descuento, // Enviar como porcentaje
            descuento: descuento // Mantener para compatibilidad
        };
        
        console.log('📊 Cálculo local de verificación:');
        const producto = obtenerProductoPorId(productoId);
        if (producto) {
            const subtotalLocal = producto.precio * cantidad;
            const descuentoValorLocal = (subtotalLocal * descuento) / 100;
            const totalLocal = subtotalLocal - descuentoValorLocal;
            console.log(`   Subtotal: $${subtotalLocal.toLocaleString()}`);
            console.log(`   Descuento ${descuento}%: $${descuentoValorLocal.toLocaleString()}`);
            console.log(`   Total: $${totalLocal.toLocaleString()}`);
        }
        
        console.log('Datos a enviar:', datos);
        
        // Determinar acción
        const accion = sistemaFacturacion.esModificando ? 'modificar' : 'añadir';
        console.log('Acción a realizar:', accion);
        
        // Enviar al servidor
        enviarDetalleAlServidor(datos, accion);
        
    } catch (error) {
        console.error('Error al añadir detalle:', error);
        alert('Error al procesar el detalle: ' + error.message);
    }
}

// Función principal para determinar qué acción realizar
function accionPrincipal() {
    if (sistemaFacturacion.esModificando) {
        console.log('🔄 Modo modificación activo');
        añadirDetalle(); // En realidad será modificar
    } else {
        console.log('➕ Modo añadir activo');
        añadirDetalle();
    }
}

function modificarDetalle(boton) {
    console.log('✏️ Modificar detalle iniciado');
    
    const fila = boton.closest('tr');
    const celdas = fila.querySelectorAll('td');
    
    // Extraer datos de la fila
    const item = parseInt(celdas[0].textContent);
    const nombreProducto = celdas[1].textContent;
    const cantidad = parseInt(celdas[2].textContent);
    const descuento = parseInt(celdas[5].textContent.replace(/[^0-9]/g, ''));
    
    console.log('Datos extraídos:', { item, nombreProducto, cantidad, descuento });
    
    // Encontrar el producto por nombre
    const producto = sistemaFacturacion.productos.find(p => p.nombre === nombreProducto);
    if (!producto) {
        alert('Error: No se pudo identificar el producto');
        return;
    }
    
    // Configurar modo modificación
    sistemaFacturacion.esModificando = true;
    sistemaFacturacion.itemModificando = item;
    
    // Rellenar formulario
    document.getElementById('productoSelect').value = producto.id;
    document.getElementById('cantidad').value = cantidad;
    document.getElementById('descuento').value = descuento;
    
    // Actualizar interfaz
    const botonAccion = document.querySelector('.btn-agregar');
    if (botonAccion) {
        botonAccion.textContent = '✏️ Actualizar Producto';
        botonAccion.style.background = 'linear-gradient(135deg, #ffc107, #e0a800)';
    }
    
    // Resaltar fila
    resaltarFilaModificacion(item);
    
    // Scroll al formulario
    document.querySelector('.seccion-producto').scrollIntoView({ behavior: 'smooth' });
    
    console.log('Modo modificación configurado para item:', item);
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
        // Enviar el porcentaje de descuento, no el monto
        const descuentoEnviar = datos.descuentoPorcentaje || datos.descuento || 0;
        formData.append('descuentoDetalle', descuentoEnviar);
        
        console.log('🔍 DEBUGGING FORMDATA:');
        console.log('   - datos.descuentoPorcentaje:', datos.descuentoPorcentaje);
        console.log('   - datos.descuento:', datos.descuento);
        console.log('   - descuentoEnviar final:', descuentoEnviar);
    }
    
    console.log('📤 URL de destino:', urls[accion]);
    console.log('📋 FormData creado:', Array.from(formData.entries()));
    console.log('🔍 Verificando descuentoDetalle enviado:', datos.descuentoPorcentaje);
    
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
                
                // Mostrar mensaje de confirmación personalizado según la acción
                let mensajeExito = '';
                switch (accion) {
                    case 'añadir':
                        mensajeExito = `✅ Producto agregado exitosamente a la factura`;
                        break;
                    case 'modificar':
                        mensajeExito = `🔄 Producto modificado exitosamente`;
                        break;
                    case 'eliminar':
                        mensajeExito = `🗑️ Producto eliminado de la factura`;
                        break;
                    default:
                        mensajeExito = data.message;
                }
                mostrarMensajeExito(mensajeExito);
                
                // Verificar si el elemento detallesBody existe antes de continuar
                const tbody = document.getElementById('detallesBody');
                console.log('🔍 Verificando elemento detallesBody:', tbody);
                
                if (!tbody) {
                    console.error('❌ PROBLEMA: detallesBody no encontrado, recargando página');
                    mostrarMensajeAlerta('Tabla actualizada correctamente. Recargando vista...', 'info');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    return;
                }
                
                // Actualizar tabla dinámicamente
                console.log('🔄 Actualizando tabla con detalle:', data.detalle);
                
                if (accion === 'eliminar') {
                    // Para eliminación, remover la fila específica
                    eliminarFilaDeTabla(data.detalle.item);
                    console.log(`🗑️ Fila eliminada: Item ${data.detalle.item}`);
                    
                    // Verificar si la tabla quedó vacía
                    verificarTablaVacia();
                } else {
                    // Para añadir y modificar, usar la función existente
                    actualizarTablaDetalles(data.detalle, accion);
                }
                
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
            } else {
                console.error('Server returned error:', data);
                mostrarMensajeAlerta(data.message || 'Error al procesar la solicitud', 'error');
            }
        }
    })
    .catch(error => {
        console.error('Fetch error details:', error);
        console.error('Error stack:', error.stack);
        mostrarMensajeAlerta('Error de conexión: ' + error.message, 'error');
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
                        console.log('🔄 Fila actualizada para item:', detalle.item);
                    }
                }
            }
        });
    }
}

function crearFilaDetalle(detalle) {
    try {
        console.log('🔨 Creando fila para detalle:', detalle);
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${detalle.item}</td>
            <td>${detalle.producto}</td>
            <td>${detalle.cantidad}</td>
            <td>$${TiendaPoliUtils.formatearMoneda(detalle.vlrUnit, false)}</td>
            <td>$${TiendaPoliUtils.formatearMoneda(detalle.subtotal, false)}</td>
            <td>$${TiendaPoliUtils.formatearMoneda(detalle.descuento, false)}</td>
            <td>$${TiendaPoliUtils.formatearMoneda(detalle.total, false)}</td>
            <td>
                <button type="button" class="btn-tabla btn-modificar" 
                        onclick="modificarDetalle(this)" 
                        title="Modificar este producto">
                    ✏️
                </button>
                <button type="button" class="btn-tabla btn-eliminar" 
                        onclick="eliminarDetalle(this)" 
                        data-item="${detalle.item}"
                        title="Eliminar este producto">
                    🗑️
                </button>
            </td>
        `;
        return fila;
    } catch (error) {
        console.error('Error al crear fila de detalle:', error);
        return null;
    }
}

function eliminarFilaDeTabla(item) {
    console.log('🗑️ Eliminando fila de tabla para item:', item);
    
    const tbody = document.getElementById('detallesBody');
    if (!tbody) {
        console.error('❌ No se encontró el elemento detallesBody');
        return;
    }
    
    // Buscar la fila correspondiente al item
    const filas = tbody.querySelectorAll('tr');
    let filaEliminada = false;
    
    filas.forEach(fila => {
        const primeraCelda = fila.querySelector('td:first-child');
        if (primeraCelda) {
            const itemFila = parseInt(primeraCelda.textContent);
            if (itemFila === item) {
                console.log(`🎯 Fila encontrada para item ${item}, eliminando...`);
                fila.remove();
                filaEliminada = true;
                
                // Mostrar confirmación visual
                console.log(`✅ Fila del item ${item} eliminada correctamente`);
            }
        }
    });
    
    if (!filaEliminada) {
        console.warn(`⚠️ No se encontró fila para eliminar con item: ${item}`);
    }
}

function salirModoModificacion() {
    sistemaFacturacion.esModificando = false;
    sistemaFacturacion.itemModificando = null;
    
    // Restaurar botón
    const botonAccion = document.querySelector('.btn-agregar');
    if (botonAccion) {
        botonAccion.textContent = '➕ Agregar Producto';
        botonAccion.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    }
    
    // Quitar resaltado de filas
    quitarResaltadoFilas();
    
    // Limpiar formulario
    limpiarCamposProducto();
    
    console.log('↩️ Modo modificación desactivado');
}

function limpiarCamposProducto() {
    try {
        // Limpiar campos principales
        const productoSelect = document.getElementById('productoSelect');
        const cantidadInput = document.getElementById('cantidad');
        const descuentoInput = document.getElementById('descuento');
        
        if (productoSelect) productoSelect.value = '';
        if (cantidadInput) cantidadInput.value = '1';
        if (descuentoInput) descuentoInput.value = '0';
        
        // Limpiar campos calculados
        const precioField = document.getElementById('precio');
        const subtotalField = document.getElementById('subtotal');
        const descuentoValorField = document.getElementById('descuentoValor');
        const totalField = document.getElementById('total');
        const stockField = document.getElementById('stockDisponible');
        
        if (precioField) precioField.value = '';
        if (subtotalField) subtotalField.value = '$0';
        if (descuentoValorField) descuentoValorField.value = '$0';
        if (totalField) totalField.value = '$0';
        if (stockField) stockField.textContent = '';
        
        // Limpiar mensajes de error
        ocultarMensajeError('cantidadError');
        ocultarMensajeError('descuentoError');
        
        console.log('🧹 Campos del producto limpiados completamente');
    } catch (error) {
        console.error('Error al limpiar campos:', error);
    }
}

// ========================================
// VALIDACIONES Y CÁLCULOS
// ========================================

function calcularSubtotal() {
    const productoId = parseInt(document.getElementById('productoSelect').value);
    const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
    
    if (productoId && cantidad > 0) {
        const producto = obtenerProductoPorId(productoId);
        if (producto) {
            const subtotal = producto.precio * cantidad;
            
            // Actualizar campo de subtotal si existe
            const subtotalField = document.getElementById('subtotal');
            if (subtotalField) {
                subtotalField.value = `$${TiendaPoliUtils.formatearMoneda(subtotal, false)}`;
            }
            
            // Calcular y mostrar el total con descuento
            calcularTotal();
            
            return subtotal;
        }
    } else {
        // Limpiar campos si no hay datos válidos
        const subtotalField = document.getElementById('subtotal');
        const descuentoValorField = document.getElementById('descuentoValor');
        const totalField = document.getElementById('total');
        
        if (subtotalField) subtotalField.value = '$0';
        if (descuentoValorField) descuentoValorField.value = '$0';
        if (totalField) totalField.value = '$0';
    }
    
    return 0;
}

function actualizarInfoProducto() {
    const productoId = parseInt(document.getElementById('productoSelect').value);
    
    // Limpiar mensajes previos
    ocultarMensajeError('cantidadError');
    ocultarMensajeError('descuentoError');
    
    if (productoId) {
        const producto = obtenerProductoPorId(productoId);
        if (producto) {
            // Actualizar campos relacionados
            const precioField = document.getElementById('precio');
            const stockField = document.getElementById('stockDisponible');
            
            if (precioField) precioField.value = producto.precio;
            if (stockField) stockField.textContent = `Stock disponible: ${producto.stock}`;
            
            // Mostrar información del producto seleccionado
            mostrarMensajeAlerta(`📦 Producto seleccionado: ${producto.nombre} - Precio: $${producto.precio} - Stock: ${producto.stock}`, 'info');
            
            // Recalcular subtotal
            calcularSubtotal();
            
            console.log('ℹ️ Información del producto actualizada:', producto);
        }
    } else {
        // Limpiar campos cuando no hay producto seleccionado
        const precioField = document.getElementById('precio');
        const stockField = document.getElementById('stockDisponible');
        
        if (precioField) precioField.value = '';
        if (stockField) stockField.textContent = '';
        
        // Limpiar total
        const totalField = document.getElementById('total');
        if (totalField) totalField.value = '';
    }
}

// ========================================
// GESTIÓN DE ESTADO Y TOTALES
// ========================================

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
    console.log('⚙️ Configurando event listeners...');
    
    // Listener para cambio de producto
    const selectProducto = document.getElementById('productoSelect');
    if (selectProducto) {
        selectProducto.addEventListener('change', function() {
            actualizarInfoProducto();
            validarStock();
        });
    }
    
    // Listener para cambio de cantidad con validación en tiempo real
    const inputCantidad = document.getElementById('cantidad');
    if (inputCantidad) {
        inputCantidad.addEventListener('input', function() {
            validarStock();
            calcularSubtotal();
        });
        
        inputCantidad.addEventListener('blur', function() {
            const cantidad = parseInt(this.value) || 0;
            if (cantidad <= 0 && this.value !== '') {
                mostrarMensajeError('cantidadError', 'La cantidad debe ser mayor a 0');
            }
        });
    }
    
    // Listener para descuento con validación en tiempo real
    const inputDescuento = document.getElementById('descuento');
    if (inputDescuento) {
        inputDescuento.addEventListener('input', function() {
            validarDescuento();
            calcularSubtotal();
        });
        
        inputDescuento.addEventListener('blur', function() {
            const descuento = parseFloat(this.value) || 0;
            if (descuento < 0 || descuento > 100) {
                if (descuento < 0) {
                    mostrarMensajeError('descuentoError', 'El descuento no puede ser negativo');
                } else {
                    mostrarMensajeError('descuentoError', 'El descuento no puede ser mayor al 100%');
                }
            }
        });
    }
    
    // Listener para el botón de agregar
    const botonAgregar = document.querySelector('.btn-agregar');
    if (botonAgregar) {
        botonAgregar.addEventListener('click', accionPrincipal);
    }
    
    // Listener para cambio de cliente
    const selectCliente = document.getElementById('clienteSelect');
    if (selectCliente) {
        selectCliente.addEventListener('change', function() {
            const clienteId = this.value;
            if (clienteId) {
                console.log('👤 Cliente seleccionado:', clienteId);
                actualizarCliente();
            }
        });
    }
    
    console.log('🎧 Event listeners configurados');
}

// ========================================
// FUNCIONES DE CLIENTE
// ========================================

function verificarClienteInicial() {
    const selectCliente = document.getElementById('clienteSelect');
    if (selectCliente && selectCliente.value) {
        console.log('👤 Cliente preseleccionado detectado:', selectCliente.value);
        // Obtener información del cliente seleccionado
        const selectedOption = selectCliente.options[selectCliente.selectedIndex];
        if (selectedOption && selectedOption.text) {
            sistemaFacturacion.clienteSeleccionado = {
                id: selectCliente.value,
                nombre: selectedOption.text.substring(selectedOption.text.indexOf(' - ') + 3)
            };
            console.log('👤 Cliente inicial configurado:', sistemaFacturacion.clienteSeleccionado);
            mostrarMensajeExito('Cliente ya seleccionado: ' + sistemaFacturacion.clienteSeleccionado.nombre);
        }
    } else {
        console.log('⚠️ No hay cliente preseleccionado');
    }
}

function actualizarCliente() {
    const clienteId = document.getElementById('clienteSelect').value;
    const nroVenta = sistemaFacturacion.nroFactura;
    
    if (!clienteId) {
        alert('Por favor selecciona un cliente');
        return;
    }
    
    const formData = new FormData();
    formData.append('nroVenta', nroVenta);
    formData.append('clienteId', clienteId);
    
    fetch('/facturacion/actualizar-cliente', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sistemaFacturacion.clienteSeleccionado = {
                id: data.clienteId,
                nombre: data.clienteNombre
            };
            
            // Actualizar interfaz si existe
            const clienteInfo = document.getElementById('clienteSeleccionado');
            if (clienteInfo) {
                clienteInfo.textContent = data.clienteNombre;
            }
            
            mostrarMensajeExito(data.message);
            console.log('👤 Cliente actualizado:', data.clienteNombre);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error al actualizar cliente:', error);
        alert('Error al actualizar el cliente');
    });
}

// ========================================
// FUNCIONES DE FINALIZACIÓN
// ========================================

function finalizarFactura() {
    if (sistemaFacturacion.detallesActuales.length === 0) {
        alert('No puedes finalizar una factura sin productos');
        return;
    }
    
    if (!sistemaFacturacion.clienteSeleccionado) {
        alert('Debes seleccionar un cliente antes de finalizar la factura');
        return;
    }
    
    if (confirm('¿Finalizar la factura?\n\nEsta acción no se puede deshacer.')) {
        fetch(`/facturacion/finalizar/${sistemaFacturacion.nroFactura}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                }
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error al finalizar factura:', error);
            alert('Error al finalizar la factura');
        });
    }
}

function cancelarFactura() {
    if (confirm('¿Cancelar la factura?\n\nSe perderán todos los cambios realizados.')) {
        fetch(`/facturacion/eliminar/${sistemaFacturacion.nroFactura}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                window.location.href = '/facturacion';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error al cancelar factura:', error);
            alert('Error al cancelar la factura');
        });
    }
}

// ========================================
// FUNCIONES DE INTERFAZ
// ========================================

function resaltarFilaModificacion(item) {
    quitarResaltadoFilas();
    
    const filas = document.querySelectorAll('#detallesBody tr');
    filas.forEach(fila => {
        const primeraCelda = fila.querySelector('td:first-child');
        if (primeraCelda && parseInt(primeraCelda.textContent) === item) {
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

function mostrarMensajeExito(mensaje) {
    // Crear elemento de mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-exito';
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Agregar animación CSS si no existe
    if (!document.getElementById('mensajeAnimacion')) {
        const style = document.createElement('style');
        style.id = 'mensajeAnimacion';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(mensajeDiv);
    
    // Remover mensaje después de 3 segundos
    setTimeout(() => {
        mensajeDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (mensajeDiv.parentNode) {
                mensajeDiv.parentNode.removeChild(mensajeDiv);
            }
        }, 300);
    }, 3000);
}

// ========================================
// FUNCIONES DE VALIDACIÓN DE TABLA
// ========================================

function verificarTablaVacia() {
    const tbody = document.getElementById('detallesBody');
    if (!tbody) return;
    
    // Contar filas que no sean la fila vacía
    const filasReales = tbody.querySelectorAll('tr:not(#filaVacia)');
    const filaVacia = document.getElementById('filaVacia');
    
    console.log('Verificando tabla vacía. Filas reales:', filasReales.length);
    
    if (filasReales.length === 0) {
        // Mostrar fila vacía si no existe
        if (!filaVacia) {
            mostrarMensajeTablaVacia();
        } else {
            filaVacia.style.display = '';
        }
    } else {
        // Ocultar fila vacía si existe
        if (filaVacia) {
            filaVacia.style.display = 'none';
        }
    }
}

function mostrarMensajeTablaVacia() {
    const tbody = document.getElementById('detallesBody');
    if (!tbody) return;
    
    // Verificar si ya existe el mensaje
    const mensajeExistente = document.getElementById('filaVacia');
    if (mensajeExistente) return;
    
    const filaVacia = document.createElement('tr');
    filaVacia.id = 'filaVacia';
    filaVacia.innerHTML = `
        <td colspan="8" style="text-align: center; padding: 40px; color: #6c757d; font-style: italic;">
            📦 No hay productos agregados a esta factura
            <br>
            <small>Selecciona un producto y haz clic en "Agregar Producto" para comenzar</small>
        </td>
    `;
    
    tbody.appendChild(filaVacia);
    console.log('💭 Mensaje de tabla vacía mostrado');
}

function ocultarMensajeTablaVacia() {
    const filaVacia = document.getElementById('filaVacia');
    if (filaVacia) {
        filaVacia.remove();
        console.log('🗑️ Mensaje de tabla vacía ocultado');
    }
}

// ========================================
// FUNCIONES DE DEBUGGING Y LOGS
// ========================================

window.debugFacturacion = {
    mostrarEstado: () => {
        console.log('=== ESTADO ACTUAL DEL SISTEMA ===');
        console.log('Sistema:', sistemaFacturacion);
        console.log('Productos disponibles:', sistemaFacturacion.productos.length);
        console.log('Detalles actuales:', sistemaFacturacion.detallesActuales.length);
        console.log('Cliente seleccionado:', sistemaFacturacion.clienteSeleccionado);
        console.log('Modo modificación:', sistemaFacturacion.esModificando);
    },
    
    recalcularTotales: () => {
        console.log('🔄 Recalculando totales manualmente...');
        actualizarTotalesGenerales();
    },
    
    limpiarTabla: () => {
        const tbody = document.getElementById('detallesBody');
        if (tbody) {
            tbody.innerHTML = '';
            mostrarMensajeTablaVacia();
            actualizarTotalesGenerales();
            console.log('🧹 Tabla limpiada manualmente');
        }
    }
};

console.log('🔧 Funciones de debugging disponibles en window.debugFacturacion');