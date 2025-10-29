// Sistema complejo de facturación con validaciones y cálculos automáticos
document.addEventListener('DOMContentLoaded', function () {

    let nroVentaElement = document.getElementById('nroFacturaSpan');

    // Si no se encuentra por ID, buscar en otras ubicaciones
    if (!nroVentaElement) {
        const selectors = [
            '.factura-numero span',
            '.header-factura .campo-readonly',
            '.readonly-value',
            '.info-value'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                nroVentaElement = elements[0];
                break;
            }
        }
    }

    let nroVentaValue = null;
    if (nroVentaElement) {
        nroVentaValue = parseInt(nroVentaElement.textContent.trim());
    }

    // Si aún no se encuentra, usar valor por defecto
    if (!nroVentaValue || isNaN(nroVentaValue)) {
        nroVentaValue = 1;
    }


    window.sistemaFacturacion = {
        esModificando: false,
        itemModificando: null,
        productos: [],
        productosStock: [], // Array para manejo de stock local
        detallesActuales: [],
        nroFactura: nroVentaValue,
        clienteSeleccionado: null,
        subtotalGeneral: 0,
        descuentoGeneral: 0,
        totalGeneral: 0
    };

    // Función para actualizar textos de botones según el modo
    window.actualizarTextosBotones = function (modoModificacion = false) {
        const btnPrincipal = document.getElementById('btnPrincipal');
        const btnSecundario = document.getElementById('btnSecundario');

        if (!btnPrincipal || !btnSecundario) {
            console.warn('⚠️ Botones no encontrados para actualizar textos');
            return;
        }

        if (modoModificacion) {
            // Modo modificación
            btnPrincipal.innerHTML = '💾 Actualizar';
            btnPrincipal.className = 'btn-accion btn-guardar';

            btnSecundario.innerHTML = '❌ Cancelar';
            btnSecundario.className = 'btn-accion btn-cancel';
        } else {
            btnPrincipal.innerHTML = '➕ Agregar';
            btnPrincipal.className = 'btn-accion btn-añadir';

            btnSecundario.innerHTML = '🗑️ Limpiar';
            btnSecundario.className = 'btn-accion btn-limpiar';
        }
    };

    inicializarSistema();
});

// Función principal de inicialización
function inicializarSistema() {
    cargarProductosDisponibles();
    cargarDetallesActuales(); // Cargar detalles existentes
    configurarEventListeners();
    verificarClienteInicial();
    actualizarTotalesGenerales();

    // Inicializar botones en modo normal
    actualizarTextosBotones(false);

    // Verificar estado inicial de la tabla
    verificarTablaVacia();

    // Forzar actualización inicial del stock
    setTimeout(() => {
        actualizarSelectProductosConStock();
        recalcularStockDesdeDatos();
    }, 100);
}

// Función para recalcular el stock basado en los datos actuales de la tabla
function recalcularStockDesdeDatos() {
    if (!sistemaFacturacion.productos || sistemaFacturacion.productos.length === 0) {
        return;
    }

    // Obtener todas las filas de la tabla actual
    const tbody = document.getElementById('detallesBody');
    if (!tbody) {
        return;
    }

    // Resetear stock local a valores originales primero
    sistemaFacturacion.productos.forEach(producto => {
        const stockOriginal = sistemaFacturacion.productosStock?.find(p => p.id === producto.id);
        if (stockOriginal) {
            producto.stock = stockOriginal.stock;
        }
    });

    // Analizar filas existentes y decrementar stock usado
    const filas = tbody.querySelectorAll('tr:not(#filaVacia)');

    filas.forEach((fila, index) => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length >= 3) {
            try {
                const nombreProducto = celdas[1].textContent.trim();
                const cantidad = parseInt(celdas[2].textContent) || 0;

                console.log(`  Fila ${index + 1}: ${nombreProducto} - Cantidad: ${cantidad}`);

                // Encontrar el producto por nombre
                const producto = sistemaFacturacion.productos.find(p =>
                    p.nombre === nombreProducto
                );

                if (producto && cantidad > 0) {
                    const stockAnterior = producto.stock;
                    producto.stock = Math.max(0, producto.stock - cantidad);
                    console.log(`    📦 ${producto.nombre}: ${stockAnterior} → ${producto.stock} (-${cantidad})`);
                }
            } catch (error) {

            }
        }
    });

    // Actualizar el select con los stocks recalculados
    actualizarSelectProductosConStock();
}

// ========================================
// FUNCIONES GLOBALES REQUERIDAS POR EL HTML
// ========================================

function seleccionarProducto() {
    actualizarInfoProducto();
}

function validarStock() {
    try {
        const productoId = parseInt(document.getElementById('productoSelect').value);
        const cantidad = parseInt(document.getElementById('cantidad').value) || 0;

        // Limpiar mensajes previos
    ocultarMensajeError('cantidadError');
    // No limpiar mensaje de stock aquí, solo cuando la cantidad sea válida y suficiente
        // Quitar resaltado previo
        const inputCantidad = document.getElementById('cantidad');
        if (inputCantidad) {
            inputCantidad.classList.remove('input-error-stock');
        }

        if (!productoId) {
            return true; // No validar si no hay producto seleccionado
        }

        if (cantidad <= 0) {
            mostrarMensajeError('cantidadError', 'La cantidad debe ser mayor a 0');
            const inputCantidad = document.getElementById('cantidad');
            if (inputCantidad) {
                inputCantidad.classList.add('input-error-stock');
            }
            // No limpiar mensaje de stock, mantener el último mensaje mostrado
            return false;
        }

        // Obtener stock local y producto
        const stockDisponible = obtenerStockLocal(productoId);
        const producto = obtenerProductoPorId(productoId);

        if (producto) {
            if (cantidad > stockDisponible) {
                // Mensaje específico para stock insuficiente en rojo claro
                const mensajeStock = `Cantidad no disponible. Stock: ${stockDisponible}`;
                mostrarMensajeStock(mensajeStock, 'error');
                mostrarMensajeError('cantidadError', ''); // No mostrar mensaje debajo, solo el de stock
                // Resaltar input cantidad
                const inputCantidad = document.getElementById('cantidad');
                if (inputCantidad) {
                    inputCantidad.classList.add('input-error-stock');
                    inputCantidad.focus();
                }
                // No limpiar mensaje de stock, mantener visible
                return false;
            } else {
                // Stock suficiente
                ocultarMensajeError('cantidadError');
                // Quitar resaltado si todo está bien
                const inputCantidad = document.getElementById('cantidad');
                if (inputCantidad) {
                    inputCantidad.classList.remove('input-error-stock');
                }
                if (cantidad > 0 && stockDisponible >= cantidad) {
                    // Mostrar información de stock actualizada en verde
                    const stockRestante = stockDisponible - cantidad;
                    const mensajeExito = `✅ Stock disponible: ${stockRestante} unidades restantes`;
                    mostrarMensajeStock(mensajeExito, 'success');
                } else {
                    // Si la cantidad no es válida, no limpiar el mensaje de stock
                }
                return true;
            }
        }
        return true;
    } catch (error) {
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
                }, 1000);
            }
        }, 5000);

    } catch (error) {
        // Fallback a alert básico
        alert(mensaje);
    }
}

function mostrarMensajeExito(mensaje) {
    // Usar el sistema de alertas existente en lugar de crear elementos flotantes
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

function limpiarMensajeStock() {
    const stockInfo = document.getElementById('stockInfo');
    if (stockInfo) {
        stockInfo.style.display = 'none';
        stockInfo.textContent = '';
        stockInfo.className = '';
        stockInfo.style.color = '';
        stockInfo.style.backgroundColor = '';
        stockInfo.style.border = '';
        stockInfo.style.fontWeight = '';
        stockInfo.style.boxShadow = '';
    }
}

function mostrarMensajeStock(mensaje, tipo = 'info') {
    console.log('[DEBUG mostrarMensajeStock]', {mensaje, tipo});
    const stockInfo = document.getElementById('stockInfo');

    if (stockInfo) {
    stockInfo.textContent = mensaje;
    // Quitar todas las clases previas y forzar display:block con !important
    stockInfo.className = '';
    stockInfo.classList.remove('hidden');
    stockInfo.classList.remove('error-message'); // Eliminar clase que pone opacity:0
    stockInfo.style.setProperty('display', 'block', 'important');

        // Configurar estilos según el tipo de mensaje
        if (tipo === 'success') {
            stockInfo.classList.add('success-message');
            stockInfo.style.color = '#28a745'; // Verde para éxito
            stockInfo.style.backgroundColor = '#d4edda';
            stockInfo.style.border = '1px solid #c3e6cb';
            stockInfo.style.fontWeight = '500';
            stockInfo.style.boxShadow = '';
        } else if (tipo === 'error' || tipo === 'warning') {
            stockInfo.classList.add('error-message');
            stockInfo.style.color = '#dc3545'; // Rojo para error/warning
            stockInfo.style.backgroundColor = '#f8d7da';
            stockInfo.style.border = '2px solid #dc3545'; // Borde más prominente para errores
            stockInfo.style.fontWeight = '600'; // Texto más bold para errores
            stockInfo.style.boxShadow = '0 2px 4px rgba(220, 53, 69, 0.2)'; // Sombra sutil
        } else {
            stockInfo.classList.add('info-message');
            stockInfo.style.color = '#0c5460'; // Azul para info
            stockInfo.style.backgroundColor = '#d1ecf1';
            stockInfo.style.border = '1px solid #bee5eb';
            stockInfo.style.fontWeight = '500';
            stockInfo.style.boxShadow = '';
        }

        // Estilos comunes
        stockInfo.style.padding = '10px';
        stockInfo.style.borderRadius = '5px';
        stockInfo.style.marginTop = '10px';
        stockInfo.style.textAlign = 'center';
    } else {
        console.error('❌ ERROR: Elemento stockInfo no encontrado en el DOM');
        // Como fallback, mostrar en consola
        console.log('📢 MENSAJE DE STOCK (fallback):', mensaje);
    }
}

function validarDescuento() {
    try {
        const descuento = parseFloat(document.getElementById('descuento').value) || 0;

        if (descuento < 0) {
            return false;
        }

        if (descuento > 99.9) {
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
                }
            }
        }
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



        // Ejecutar validación de stock cada vez que se calcula el total
        if (productoId && cantidad > 0) {
            validarStock();
        }

        if (productoId && cantidad > 0) {
            const producto = obtenerProductoPorId(productoId);
            if (producto) {
                const precioUnitario = producto.precio || producto.vlrUnit || 0;
                const subtotal = precioUnitario * cantidad;
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
            .map(option => {
                const textoCompleto = option.textContent.trim();
                // El formato es "ID - Nombre del Producto"
                const partes = textoCompleto.split(' - ');
                const nombre = partes.length > 1 ? partes.slice(1).join(' - ') : textoCompleto;

                return {
                    id: parseInt(option.value),
                    nombre: nombre,
                    precio: parseFloat(option.dataset.precio || '0'),
                    vlrUnit: parseFloat(option.dataset.precio || '0'), // Mantenemos ambas propiedades
                    stock: parseInt(option.dataset.stock || '0')
                };
            });

        // Inicializar stock local si no existe
        if (!sistemaFacturacion.productosStock) {
            sistemaFacturacion.productosStock = [];
        }

        // Copiar stock inicial a stock local
        sistemaFacturacion.productos.forEach(producto => {
            const stockExistente = sistemaFacturacion.productosStock.find(p => p.id === producto.id);
            if (!stockExistente) {
                sistemaFacturacion.productosStock.push({
                    id: producto.id,
                    stock: producto.stock
                });
            }
        });
    } else {

    }
}

function obtenerProductoPorId(productoId) {
    return sistemaFacturacion.productos.find(p => p.id === parseInt(productoId));
}

function obtenerStockLocal(productoId) {

    // Primero intentar obtener del array de stock local
    if (sistemaFacturacion.productosStock) {
        const stockLocal = sistemaFacturacion.productosStock.find(p => p.id === parseInt(productoId));
        if (stockLocal) {
            return stockLocal.stock;
        }
    }

    // Si no está en stock local, usar el stock original del producto
    const producto = obtenerProductoPorId(productoId);
    const stockFinal = producto ? producto.stock : 0;
    return stockFinal;
}

function validarStockDisponible(productoId, cantidadSolicitada) {
    const producto = obtenerProductoPorId(productoId);
    if (!producto) {
        console.error('❌ Producto no encontrado para ID:', productoId);
        throw new Error('Producto no encontrado');
    }

    if (cantidadSolicitada > producto.stock) {
        const mensaje = `Stock insuficiente. Disponible (${producto.stock})`;
        console.error('❌ ' + mensaje);

        // Mostrar mensaje visual en rojo
        mostrarMensajeStock(`⚠️ ${mensaje}`, 'error');

        throw new Error(mensaje);
    }

    if (cantidadSolicitada > producto.stock) {
        const mensaje = `Stock insuficiente. Disponible (${producto.stock})`;
        console.error('❌ ' + mensaje);

        // Mostrar mensaje visual en rojo
        mostrarMensajeStock(`⚠️ ${mensaje}`, 'error');

        throw new Error(mensaje);
    }

    console.log('✅ Validación de stock exitosa');
    return true;
}

// Función para actualizar el stock local después de operaciones
function actualizarStockLocal(productoId, cantidad, operacion) {
    try {
        const producto = obtenerProductoPorId(productoId);
        if (!producto) {
            return;
        }

        const cantidadNumerica = parseInt(cantidad);
        if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
            return;
        }

        const stockAnterior = producto.stock;

        if (operacion === 'decrementar') {
            producto.stock = Math.max(0, producto.stock - cantidadNumerica);
        } else if (operacion === 'incrementar') {
        } else if (operacion === 'incrementar') {
            producto.stock += cantidadNumerica;
        }

        // Actualizar el array de stock local también
        actualizarStockEnArray(productoId, producto.stock);

        // Actualizar el select de productos con el nuevo stock
        actualizarSelectProductosConStock();

        // Actualizar la información mostrada si el producto está seleccionado
        actualizarInfoProductoEnFormulario(productoId);
    } catch (error) {
        console.error('❌ Error al actualizar stock local:', error);
    }
}

// Función auxiliar para actualizar el array de stock local
function actualizarStockEnArray(productoId, nuevoStock) {
    if (sistemaFacturacion.productosStock) {
        const stockItem = sistemaFacturacion.productosStock.find(p => p.id === parseInt(productoId));
        if (stockItem) {
            stockItem.stock = nuevoStock;
        } else {
            sistemaFacturacion.productosStock.push({
                id: parseInt(productoId),
                stock: nuevoStock
            });
        }
    }
}

// Función para actualizar la información del producto en el formulario
function actualizarInfoProductoEnFormulario(productoId) {
    const productoSeleccionado = parseInt(document.getElementById('productoSelect').value);
    if (productoSeleccionado === parseInt(productoId)) {
        // Si el producto está seleccionado, actualizar la información mostrada
        const stockField = document.getElementById('stockDisponible');
        const producto = obtenerProductoPorId(productoId);
        if (stockField && producto) {
            stockField.textContent = producto.stock;

            // Mostrar mensaje actualizado de stock
            const stockActual = obtenerStockLocal(productoId);
            mostrarMensajeStock(`📦 Stock actualizado: ${stockActual} unidades disponibles`, 'info');
        }
    }
}

// Función para actualizar el select de productos con el stock actualizado
function actualizarSelectProductosConStock() {
    const selectProducto = document.getElementById('productoSelect');
    if (!selectProducto) {
        return;
    }

    let productosActualizados = 0;

    Array.from(selectProducto.options).forEach(option => {
        if (option.value) {
            const productoId = parseInt(option.value);
            const producto = obtenerProductoPorId(productoId);
            if (producto) {
                const stockAnterior = option.dataset.stock;
                option.dataset.stock = producto.stock;

                // Actualizar el texto si incluye información de stock
                const textoActual = option.textContent;
                let nuevoTexto = textoActual;

                if (textoActual.includes('(Stock:')) {
                    const partes = textoActual.split('(Stock:')[0];
                    nuevoTexto = `${partes.trim()} (Stock: ${producto.stock})`;
                } else if (textoActual.includes(' - Stock:')) {
                    const partes = textoActual.split(' - Stock:')[0];
                    nuevoTexto = `${partes.trim()} - Stock: ${producto.stock}`;
                } else {
                    // Si no tiene información de stock, agregarla
                    nuevoTexto = `${textoActual} - Stock: ${producto.stock}`;
                }

                option.textContent = nuevoTexto;
                productosActualizados++;
            }
        }
    });
}

// ========================================
// GESTIÓN DE DETALLES
// ========================================

function añadirDetalle() {
    try {
        // Verificar que los elementos del DOM existan
        const productoSelect = document.getElementById('productoSelect');
        const cantidadInput = document.getElementById('cantidad');
        const descuentoInput = document.getElementById('descuento');
        const clienteSelect = document.getElementById('clienteSelect');

        if (!productoSelect || !cantidadInput || !descuentoInput || !clienteSelect) {
            console.error('❌ Error: Elementos del formulario no encontrados');
            mostrarMensajeAlerta('Error: No se pueden encontrar los elementos del formulario', 'error');
            return;
        }

        // Obtener valores del formulario
        const productoId = parseInt(productoSelect.value);
        const cantidad = parseInt(cantidadInput.value);
        const descuentoValue = descuentoInput.value;
        const descuento = parseFloat(descuentoValue) || 0; // Usar parseFloat para decimales

        // Validación de cliente seleccionado
        const clienteId = clienteSelect.value;
        if (!clienteId) {
            mostrarMensajeAlerta('⚠️ Debes seleccionar un cliente antes de agregar productos a la factura', 'warning');
            clienteSelect.focus();
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

        const producto = obtenerProductoPorId(productoId);
        if (producto) {
            const subtotalLocal = producto.precio * cantidad;
            const descuentoValorLocal = (subtotalLocal * descuento) / 100;
            const totalLocal = subtotalLocal - descuentoValorLocal;
        }
        // Determinar acción
        const accion = sistemaFacturacion.esModificando ? 'modificar' : 'añadir';

        // Enviar al servidor
        enviarDetalleAlServidor(datos, accion)
            .then(response => {
                console.log('✅ Respuesta del servidor recibida correctamente');
            })
            .catch(error => {
                console.error('❌ Error en el envío al servidor:', error);
                mostrarMensajeAlerta('Error al guardar: ' + error.message, 'error');
            });

    } catch (error) {
        console.error('Error al añadir detalle:', error);
        alert('Error al procesar el detalle: ' + error.message);
    }
}

// Función principal para determinar qué acción realizar
function accionPrincipal() {
    if (sistemaFacturacion.esModificando) {
        añadirDetalle(); // En realidad será modificar
    } else {
        añadirDetalle();
    }
}

function modificarDetalle(boton) {
    console.log('✏️ Modificar detalle iniciado');

    const fila = boton.closest('tr');
    const celdas = fila.querySelectorAll('td');

    // Extraer datos del botón y la fila
    const item = parseInt(boton.getAttribute('data-item'));
    const productoId = parseInt(boton.getAttribute('data-producto'));
    const cantidad = parseInt(boton.getAttribute('data-cantidad'));
    const precio = parseFloat(boton.getAttribute('data-precio')) || 0;
    const descuentoValor = parseFloat(boton.getAttribute('data-descuento-valor')) || 0;
    const subtotal = parseFloat(boton.getAttribute('data-subtotal')) || 0;

    // Calcular el porcentaje de descuento a partir del valor monetario
    let descuentoPorcentaje = 0;
    if (subtotal > 0 && descuentoValor > 0) {
        descuentoPorcentaje = (descuentoValor / subtotal) * 100;
        descuentoPorcentaje = Math.round(descuentoPorcentaje * 10) / 10; // Redondear a 1 decimal
    }

    // También extraer datos de la fila como respaldo
    const itemFila = parseInt(celdas[0].textContent);
    const nombreProducto = celdas[1].textContent;
    const cantidadFila = parseInt(celdas[2].textContent);

    console.log('Datos del botón:', {
        item,
        productoId,
        cantidad,
        precio,
        descuentoValor,
        descuentoPorcentaje,
        subtotal
    });
    console.log('Datos de la fila:', { itemFila, nombreProducto, cantidadFila });

    // Encontrar el producto por ID (más confiable)
    let producto = sistemaFacturacion.productos.find(p => p.id === productoId);

    // Si no se encuentra por ID, buscar por nombre como respaldo
    if (!producto) {
        console.warn('⚠️ No se encontró producto por ID, buscando por nombre...');
        producto = sistemaFacturacion.productos.find(p => p.nombre === nombreProducto);
    }

    if (!producto) {
        console.error('❌ No se pudo identificar el producto');
        console.log('ProductoId buscado:', productoId);
        console.log('Nombre buscado:', nombreProducto);
        console.log('Productos disponibles:', sistemaFacturacion.productos);
        alert('Error: No se pudo identificar el producto. Por favor, recarga la página.');
        return;
    }

    console.log('✅ Producto encontrado:', producto);

    // Usar item del botón o de la fila
    const itemFinal = item || itemFila;
    const cantidadFinal = cantidad || cantidadFila;

    // Configurar modo modificación
    sistemaFacturacion.esModificando = true;
    sistemaFacturacion.itemModificando = itemFinal;
    sistemaFacturacion.cantidadAnteriorModificacion = cantidadFinal; // Guardar para actualizar stock después

    // Rellenar formulario
    document.getElementById('productoSelect').value = producto.id;
    document.getElementById('cantidad').value = cantidadFinal;
    document.getElementById('descuento').value = descuentoPorcentaje;


    // Disparar eventos para actualizar campos calculados
    seleccionarProducto();
    calcularSubtotal();
    calcularTotal();

    // Si estamos en modo edición, recalcular totales generales después de modificar descuento
    if (window.esModificacionFactura) {
        setTimeout(() => actualizarTotalesGenerales(), 200);
    }

    // Actualizar textos de botones para modo modificación
    actualizarTextosBotones(true);

    // Resaltar fila
    resaltarFilaModificacion(itemFinal);

    // Scroll al formulario
    const seccionProducto = document.querySelector('.seccion-producto, .cliente-info');
    if (seccionProducto) {
        seccionProducto.scrollIntoView({ behavior: 'smooth' });
    }

    console.log('Modo modificación configurado para item:', itemFinal);
}

function eliminarDetalle(boton) {
    console.log('🗑️ MODIFICACIÓN DE FACTURA - Eliminando item');
    
    // Protección contra múltiples clics
    if (boton.disabled) {
        console.warn('⚠️ Botón ya está procesando, ignorando clic múltiple');
        return;
    }

    const item = parseInt(boton.getAttribute('data-item'));
    const productoId = parseInt(boton.getAttribute('data-producto'));
    const cantidad = parseInt(boton.getAttribute('data-cantidad'));
    const nombreProducto = boton.closest('tr').querySelector('td:nth-child(2)').textContent;

    console.log(`Eliminando item ${item}: ${nombreProducto} (Cantidad: ${cantidad})`);

    const mensaje = `¿Eliminar ${nombreProducto} de la factura?\n\n` +
                   `Cantidad: ${cantidad} unidades\n` +
                   `Esta acción recalculará automáticamente los totales de la factura.`;

    if (confirm(mensaje)) {
        // Deshabilitar botón temporalmente
        boton.disabled = true;
        boton.style.opacity = '0.5';

        // Mostrar mensaje de procesamiento
        mostrarMensajeAlerta('🗑️ Eliminando producto de la factura...', 'info');

        const datos = {
            nroVenta: sistemaFacturacion.nroFactura,
            item: item,
            productoId: productoId,
            cantidad: cantidad
        };

        // Si estamos en modo edición, recalcular totales después de eliminar
        setTimeout(() => actualizarTotalesGenerales(), 300);

        // Almacenar información para usar en caso de que el servidor no la devuelva
        sistemaFacturacion.infoTemporalEliminacion = {
            item: item,
            productoId: productoId,
            cantidad: cantidad,
            nombreProducto: nombreProducto
        };

        console.log('Enviando solicitud de eliminación:', datos);

        enviarDetalleAlServidor(datos, 'eliminar')
            .then(() => {
                console.log('✅ Item eliminado exitosamente - Totales recalculados automáticamente');
                mostrarMensajeAlerta('✅ Producto eliminado y totales recalculados', 'success');
            })
            .catch(error => {
                console.error('❌ Error al eliminar item:', error);
                mostrarMensajeAlerta('❌ Error al eliminar producto: ' + error.message, 'error');
            })
            .finally(() => {
                // Re-habilitar botón (si todavía existe)
                if (boton && !boton.closest('tr').parentNode) {
                    // El botón ya fue eliminado con la fila, no hacer nada
                    console.log('Botón eliminado junto con la fila');
                } else if (boton) {
                    boton.disabled = false;
                    boton.style.opacity = '1';
                }
            });
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
        // Enviar el porcentaje de descuento, no el monto
        const descuentoEnviar = datos.descuentoPorcentaje || datos.descuento || 0;
        formData.append('descuentoDetalle', descuentoEnviar);
    }

    return fetch(urls[accion], {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
        .then(response => {
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
                if (data.success) {
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

                    if (!tbody) {
                        mostrarMensajeAlerta('Tabla actualizada correctamente. Recargando vista...', 'info');
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                        return;
                    }

                    if (accion === 'eliminar') {
                        // Para eliminación, remover la fila específica
                        eliminarFilaDeTabla(data.detalle.item);

                        // Restaurar stock del producto eliminado - usar información del servidor o temporal
                        let productoId, cantidadRestaurar;

                        if (data.detalle.producto && data.detalle.producto.id && data.detalle.cantidad) {
                            // Usar datos del servidor
                            productoId = data.detalle.producto.id;
                            cantidadRestaurar = data.detalle.cantidad
                        } else if (sistemaFacturacion.infoTemporalEliminacion) {
                            // Usar información temporal guardada
                            productoId = sistemaFacturacion.infoTemporalEliminacion.productoId;
                            cantidadRestaurar = sistemaFacturacion.infoTemporalEliminacion.cantidad;

                        }

                        // Restaurar stock si tenemos la información
                        if (productoId && cantidadRestaurar) {
                            actualizarStockLocal(productoId, cantidadRestaurar, 'incrementar');
                        }

                        // Limpiar información temporal
                        delete sistemaFacturacion.infoTemporalEliminacion;

                        // Verificar si la tabla quedó vacía
                        verificarTablaVacia();

                        // Actualizar totales después de eliminar
                        actualizarTotalesGenerales();
                    } else {
                        // Para añadir y modificar, usar la función existente
                        actualizarTablaDetalles(data.detalle, accion);
                    }

                    // Limpiar formulario si es añadir
                    if (accion === 'añadir') {
                        limpiarCamposProducto();
                        sistemaFacturacion.esModificando = false;

                        // Actualizar stock local del producto - usar datos del servidor o formulario
                        let productoId, cantidadAgregar;

                        if (data.detalle.producto && data.detalle.producto.id && data.detalle.cantidad) {
                            productoId = data.detalle.producto.id;
                            cantidadAgregar = data.detalle.cantidad;
                        } else {
                            // Usar datos del formulario como respaldo
                            productoId = parseInt(document.getElementById('productoSelect').value);
                            cantidadAgregar = parseInt(document.getElementById('cantidad').value);
                        }

                        if (productoId && cantidadAgregar > 0) {
                            actualizarStockLocal(productoId, cantidadAgregar, 'decrementar');
                        } else {
                            console.warn('⚠️ No se pudo decrementar stock - información insuficiente');
                        }
                    }
                    // Si es modificar, salir del modo modificación
                    if (accion === 'modificar') {
                        salirModoModificacion();

                        // Para modificación, necesitamos restaurar el stock anterior y decrementar el nuevo
                        let productoId, cantidadNueva;

                        if (data.detalle.producto && data.detalle.producto.id && data.detalle.cantidad) {
                            productoId = data.detalle.producto.id;
                            cantidadNueva = data.detalle.cantidad;
                        } else {
                            // Usar datos del formulario como respaldo
                            productoId = parseInt(document.getElementById('productoSelect').value);
                            cantidadNueva = parseInt(document.getElementById('cantidad').value);

                        }

                        if (productoId && cantidadNueva > 0) {
                            const cantidadAnterior = sistemaFacturacion.cantidadAnteriorModificacion || 0;

                            // Restaurar stock anterior y aplicar nueva cantidad
                            if (cantidadAnterior > 0) {
                                actualizarStockLocal(productoId, cantidadAnterior, 'incrementar');
                            }
                            actualizarStockLocal(productoId, cantidadNueva, 'decrementar');

                            // Limpiar variable temporal
                            delete sistemaFacturacion.cantidadAnteriorModificacion;
                        } else {
                            console.warn('⚠️ No se pudo modificar stock - información insuficiente');
                        }
                    }
                    // Recalcular totales
                    actualizarTotalesGenerales();

                    // Actualizar detalles actuales para mantener sincronización
                    cargarDetallesActuales();

                    // Forzar recálculo del stock después de cualquier operación
                    setTimeout(() => {
                        recalcularStockDesdeDatos();
                        // También actualizar la lista de detalles
                        cargarDetallesActuales();
                    }, 200);
                } else {
                    mostrarMensajeAlerta(data.message || 'Error al procesar la solicitud', 'error');
                }
            }
        })
        .catch(error => {
            mostrarMensajeAlerta('Error de conexión: ' + error.message, 'error');
        });
}

function actualizarTablaDetalles(detalle, accion) {
    const tbody = document.getElementById('detallesBody');

    if (!tbody) {
        console.error('❌ Error: No se encontró el elemento detallesBody en el DOM');
        return;
    }

    if (!tbody) {
        console.error('❌ Error: No se encontró el elemento detallesBody en el DOM');
        const elementos = document.querySelectorAll('[id*="detalle"]');
        elementos.forEach(el => console.log(`  - ${el.id}: ${el.tagName}`));

        const tbodies = document.querySelectorAll('tbody');
        tbodies.forEach((tb, index) => console.log(`  - tbody[${index}]: id="${tb.id}" class="${tb.className}"`));
        return;
    }

    if (accion === 'añadir') {
        // Eliminar fila de mensaje vacío si existe
        const filaVacia = document.getElementById('filaVacia');
        if (filaVacia) {
            filaVacia.remove();
        }

        // Agregar nueva fila
        const fila = crearFilaDetalle(detalle);
        if (fila) {
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
    }
}

function crearFilaDetalle(detalle) {
    try {
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
                <div class="btn-tabla-container">
                    <button type="button" class="btn-tabla btn-modificar" 
                            onclick="modificarDetalle(this)" 
                            title="Modificar este producto">
                        ✏️ Modificar
                    </button>
                    <button type="button" class="btn-tabla btn-eliminar" 
                            onclick="eliminarDetalle(this)" 
                            data-item="${detalle.item}"
                            title="Eliminar este producto">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        `;

        // Agregar atributos data al botón de modificar
        const botonModificar = fila.querySelector('.btn-modificar');
        if (botonModificar && detalle.producto) {
            botonModificar.setAttribute('data-item', detalle.item);
            botonModificar.setAttribute('data-producto', detalle.producto.id || '');
            botonModificar.setAttribute('data-cantidad', detalle.cantidad);
            botonModificar.setAttribute('data-precio', detalle.vlrUnit || detalle.precio || '');
            botonModificar.setAttribute('data-descuento-valor', detalle.descuento || 0);
            botonModificar.setAttribute('data-subtotal', detalle.subtotal || '');
            botonModificar.setAttribute('data-total', detalle.total || '');
        }

        // Agregar atributos data adicionales al botón de eliminar
        const botonEliminar = fila.querySelector('.btn-eliminar');
        if (botonEliminar && detalle.producto) {
            botonEliminar.setAttribute('data-producto', detalle.producto.id || '');
            botonEliminar.setAttribute('data-cantidad', detalle.cantidad);
        }

        return fila;
    } catch (error) {
        console.error('Error al crear fila de detalle:', error);
        return null;
    }
}

function eliminarFilaDeTabla(item) {
    // Protección contra ejecuciones múltiples
    if (sistemaFacturacion.eliminandoFila) {
        console.warn('⚠️ Ya se está eliminando una fila, ignorando ejecución múltiple');
        return;
    }
    sistemaFacturacion.eliminandoFila = true;

    const tbody = document.getElementById('detallesBody');
    if (!tbody) {
        console.error('❌ No se encontró el elemento detallesBody');
        sistemaFacturacion.eliminandoFila = false;
        return;
    }

    // Contar filas antes de eliminar
    const filasAntes = tbody.querySelectorAll('tr:not(#filaVacia)');

    // Buscar la fila correspondiente al item ESPECÍFICO
    const filas = tbody.querySelectorAll('tr:not(#filaVacia)');
    let filaEliminada = false;
    let filasEliminadas = 0;

    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        const primeraCelda = fila.querySelector('td:first-child');

        if (primeraCelda) {
            const itemFila = parseInt(primeraCelda.textContent.trim());

            if (itemFila === item) {
                fila.remove();
                filaEliminada = true;
                filasEliminadas++;

                // Salir del bucle después de eliminar la primera coincidencia
                break;
            }
        } else {
            console.log(`🔍 Fila ${i}: sin primera celda (posiblemente fila vacía)`);
        }
    }

    // Contar filas después de eliminar
    const filasDespues = tbody.querySelectorAll('tr:not(#filaVacia)');
   
    if (!filaEliminada) {
        console.warn(`⚠️ No se encontró fila para eliminar con item: ${item}`);
    }

    // Liberar protección
    sistemaFacturacion.eliminandoFila = false;
    if (!filaEliminada) {
        console.warn(`⚠️ No se encontró fila para eliminar con item: ${item}`);
    }

    // Liberar protección
    sistemaFacturacion.eliminandoFila = false;
}

function salirModoModificacion() {
    sistemaFacturacion.esModificando = false;
    sistemaFacturacion.itemModificando = null;

    // Actualizar textos de botones para modo normal
    actualizarTextosBotones(false);

    // Quitar resaltado de filas
    quitarResaltadoFilas();

    // Limpiar formulario
    limpiarCamposProducto();
}

function limpiarCamposProducto() {
    try {
        console.log('🧹 Iniciando limpieza de campos...');

        // Limpiar campos principales
        const productoSelect = document.getElementById('productoSelect');
        const cantidadInput = document.getElementById('cantidad');
        const descuentoInput = document.getElementById('descuento');

        if (productoSelect) productoSelect.value = '';
        if (cantidadInput) cantidadInput.value = '';
        if (descuentoInput) descuentoInput.value = '';

        // Limpiar campos calculados
        const precioField = document.getElementById('precio');
        const subtotalField = document.getElementById('subtotal');
        const descuentoValorField = document.getElementById('descuentoValor');
        const totalField = document.getElementById('total');
        const stockField = document.getElementById('stockDisponible');

        if (precioField) precioField.value = '';
        if (subtotalField) subtotalField.value = '';
        if (descuentoValorField) descuentoValorField.value = '';
        if (totalField) totalField.value = '';
        if (stockField) stockField.textContent = '';

        // Limpiar mensaje de stock
        const stockInfo = document.getElementById('stockInfo');
        if (stockInfo) {
            stockInfo.style.display = 'none';
            stockInfo.classList.add('hidden');
            stockInfo.textContent = '';
        }

        // Limpiar mensajes de error
        ocultarMensajeError('cantidadError');
        ocultarMensajeError('descuentoError');
        ocultarMensajeError('productoError');

        // Resetear modo modificación si estaba activo
        if (sistemaFacturacion.esModificando) {
            sistemaFacturacion.esModificando = false;
            sistemaFacturacion.itemModificando = null;

            // Actualizar botones a modo normal
            actualizarTextosBotones(false);

            // Quitar resaltado de filas
            quitarResaltadoFilas();
        }

        console.log('✅ Campos del producto limpiados completamente');
    } catch (error) {
        console.error('Error al limpiar campos:', error);
    }
}

// Función para el botón secundario (Limpiar)
function accionSecundaria() {
    if (sistemaFacturacion.esModificando) {
        // Modo cancelar - salir del modo modificación
        console.log('❌ Acción secundaria: Cancelar modificación');
        salirModoModificacion();
    } else {
        // Modo limpiar - limpiar campos
        console.log('🗑️ Acción secundaria: Limpiar campos');
        limpiarCamposProducto();
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
    limpiarMensajeStock(); // Limpiar mensaje de stock al cambiar producto

    if (productoId) {
        const producto = obtenerProductoPorId(productoId);
        if (producto) {
            // Actualizar campos relacionados
            const precioField = document.getElementById('precio');
            const stockField = document.getElementById('stockDisponible');

            if (precioField) precioField.value = producto.precio;
            if (stockField) stockField.textContent = `Stock disponible: ${obtenerStockLocal(productoId)}`;

            // Mostrar información del producto seleccionado
            mostrarMensajeAlerta(`📦 Producto seleccionado: ${producto.nombre} - Precio: $${producto.precio} - Stock: ${obtenerStockLocal(productoId)}`, 'info');

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
    const tbody = document.getElementById('detallesBody');

    if (!tbody) {
        console.warn('⚠️ No se encontró tbody para cargar detalles');
        return;
    }

    const filas = tbody.querySelectorAll('tr:not(#filaVacia)');
    console.log(`📊 Cargando ${filas.length} detalles actuales desde la tabla`);

    filas.forEach((fila, index) => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length >= 7) {
            const detalle = {
                item: parseInt(celdas[0].textContent.trim()),
                producto: celdas[1].textContent.trim(),
                cantidad: parseInt(celdas[2].textContent.trim()),
                vlrUnit: parseInt(celdas[3].textContent.replace(/[^0-9]/g, '')),
                subtotal: parseInt(celdas[4].textContent.replace(/[^0-9]/g, '')),
                descuento: parseInt(celdas[5].textContent.replace(/[^0-9]/g, '')),
                total: parseInt(celdas[6].textContent.replace(/[^0-9]/g, ''))
            };

            sistemaFacturacion.detallesActuales.push(detalle);
            console.log(`  ${index + 1}. ${detalle.producto} - Qty: ${detalle.cantidad} - Total: $${detalle.total}`);
        }
    });

    console.log(`✅ Total de detalles cargados: ${sistemaFacturacion.detallesActuales.length}`);
}

function actualizarTotalesGenerales() {
    console.log('💰 Actualizando totales generales...');

    // Calcular totales directamente desde la tabla DOM
    const tbody = document.getElementById('detallesBody');
    if (!tbody) {
        console.error('❌ No se encontró detallesBody');
        return;
    }

    let subtotalGeneral = 0;
    let descuentoGeneral = 0;
    let totalGeneral = 0;

    // Obtener todas las filas excepto la fila vacía
    const filas = tbody.querySelectorAll('tr:not(#filaVacia)');
    console.log(`📊 Procesando ${filas.length} filas de la tabla`);

    filas.forEach((fila, index) => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length >= 7) {
            // Extraer valores de las celdas (índices: 4=subtotal, 5=descuento, 6=total)
            // Limpiar valores: remover $, comas, puntos de miles y espacios
            const subtotalTexto = celdas[4].textContent.replace(/[$,.\s]/g, '').replace(/[^0-9]/g, '');
            const descuentoTexto = celdas[5].textContent.replace(/[$,.\s]/g, '').replace(/[^0-9]/g, '');
            const totalTexto = celdas[6].textContent.replace(/[$,.\s]/g, '').replace(/[^0-9]/g, '');

            const subtotal = parseInt(subtotalTexto) || 0;
            const descuento = parseInt(descuentoTexto) || 0;
            const total = parseInt(totalTexto) || 0;

            console.log(`Fila ${index + 1}:`);
            console.log(`  - Texto original: [${celdas[4].textContent}] [${celdas[5].textContent}] [${celdas[6].textContent}]`);
            console.log(`  - Texto limpio: [${subtotalTexto}] [${descuentoTexto}] [${totalTexto}]`);
            console.log(`  - Valores parseados: Subtotal=${subtotal}, Descuento=${descuento}, Total=${total}`);

            subtotalGeneral += subtotal;
            descuentoGeneral += descuento;
            totalGeneral += total;
        }
    });

    // Actualizar variables del sistema
    sistemaFacturacion.subtotalGeneral = subtotalGeneral;
    sistemaFacturacion.descuentoGeneral = descuentoGeneral;
    sistemaFacturacion.totalGeneral = totalGeneral;

    // Actualizar interfaz
    const totalSubtotalEl = document.getElementById('totalSubtotal');
    const totalDescuentoEl = document.getElementById('totalDescuento');
    const totalFinalEl = document.getElementById('totalFinal');

    if (totalSubtotalEl) totalSubtotalEl.textContent = `$${TiendaPoliUtils.formatearMoneda(subtotalGeneral, false)}`;
    if (totalDescuentoEl) totalDescuentoEl.textContent = `$${TiendaPoliUtils.formatearMoneda(descuentoGeneral, false)}`;
    if (totalFinalEl) totalFinalEl.textContent = `$${TiendaPoliUtils.formatearMoneda(totalGeneral, false)}`;

    console.log('✅ Totales actualizados:', { subtotalGeneral, descuentoGeneral, totalGeneral });

    // Actualizar estado de la tabla
    verificarTablaVacia();
}

function configurarEventListeners() {
    console.log('⚙️ Configurando event listeners...');

    // Listener para cambio de producto
    const selectProducto = document.getElementById('productoSelect');
    if (selectProducto) {
        selectProducto.addEventListener('change', function () {
            console.log('🎧 Event: change en producto, valor:', this.value);
            limpiarMensajeStock(); // Limpiar mensaje al cambiar producto
            actualizarInfoProducto();
            // Dar un pequeño delay para que se actualice la info antes de validar
            setTimeout(() => {
                validarStock();
            }, 50);
        });
    }

    // Listener para cambio de cantidad con validación en tiempo real
    const inputCantidad = document.getElementById('cantidad');
    if (inputCantidad) {
        inputCantidad.addEventListener('input', function () {
            console.log('🎧 Event: input en cantidad, valor:', this.value);
            validarStock();
            calcularSubtotal();
        });

        inputCantidad.addEventListener('blur', function () {
            console.log('🎧 Event: blur en cantidad, valor:', this.value);
            const cantidad = parseInt(this.value) || 0;
            if (cantidad <= 0 && this.value !== '') {
                mostrarMensajeError('cantidadError', 'La cantidad debe ser mayor a 0');
            } else {
                validarStock();
            }
        });

        inputCantidad.addEventListener('change', function () {
            console.log('🎧 Event: change en cantidad, valor:', this.value);
            validarStock();
            calcularSubtotal();
        });
    }

    // Listener para descuento con validación en tiempo real
    const inputDescuento = document.getElementById('descuento');
    if (inputDescuento) {
        inputDescuento.addEventListener('input', function () {
            validarDescuento();
            calcularSubtotal();
        });

        inputDescuento.addEventListener('blur', function () {
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
        selectCliente.addEventListener('change', function () {
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
    console.log('👤 MODIFICACIÓN DE FACTURA - Actualizando cliente');
    
    const clienteId = document.getElementById('clienteSelect').value;
    const nroVenta = sistemaFacturacion.nroFactura;

    if (!clienteId) {
        mostrarMensajeAlerta('⚠️ Por favor selecciona un cliente', 'warning');
        return;
    }

    console.log('Actualizando cliente de factura:', { nroVenta, clienteId });

    const formData = new FormData();
    formData.append('nroVenta', nroVenta);
    formData.append('clienteId', clienteId);

    // Mostrar mensaje de procesamiento
    mostrarMensajeAlerta('🔄 Actualizando cliente de la factura...', 'info');

    fetch('/facturacion/actualizar-cliente', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
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

                mostrarMensajeAlerta('✅ Cliente actualizado correctamente: ' + data.clienteNombre, 'success');
                console.log('👤 Cliente actualizado:', data.clienteNombre);
                
                // NOTA: No se recalculan totales al cambiar cliente
                console.log('ℹ️ Cambio de cliente completado - No se recalculan totales');
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        })
        .catch(error => {
            console.error('❌ Error al actualizar cliente:', error);
            mostrarMensajeAlerta('❌ Error al actualizar el cliente: ' + error.message, 'error');
        });
}

// ========================================
// FUNCIONES DE FINALIZACIÓN
// ========================================

function finalizarFactura() {
    console.log('💾 Iniciando finalización de factura...');

    // Actualizar detalles actuales desde la tabla antes de validar
    cargarDetallesActuales();

    // Actualizar cliente seleccionado desde el formulario
    const selectCliente = document.getElementById('clienteSelect');
    if (selectCliente && selectCliente.value) {
        const selectedOption = selectCliente.options[selectCliente.selectedIndex];
        if (selectedOption && selectedOption.text) {
            sistemaFacturacion.clienteSeleccionado = {
                id: selectCliente.value,
                nombre: selectedOption.text.substring(selectedOption.text.indexOf(' - ') + 3)
            };
        }
    }

    

    // Validación del número de factura
    if (!sistemaFacturacion.nroFactura || isNaN(sistemaFacturacion.nroFactura) || sistemaFacturacion.nroFactura <= 0) {
        console.error('❌ Número de factura inválido:', sistemaFacturacion.nroFactura);
        mostrarMensajeAlerta('Error: No se pudo obtener el número de factura. Por favor, recarga la página.', 'error');
        return;
    }

    // Validar que hay productos en la factura
    if (sistemaFacturacion.detallesActuales.length === 0) {
        console.warn('⚠️ No hay productos en la factura');
        mostrarMensajeAlerta('No puedes finalizar una factura sin productos. Agrega al menos un producto antes de continuar.', 'warning');
        return;
    }

    // Validar que hay cliente seleccionado
    if (!sistemaFacturacion.clienteSeleccionado || !sistemaFacturacion.clienteSeleccionado.id) {
        console.warn('⚠️ No hay cliente seleccionado');
        mostrarMensajeAlerta('Debes seleccionar un cliente antes de finalizar la factura.', 'warning');

        // Hacer foco en el select de cliente
        if (selectCliente) {
            selectCliente.focus();
        }
        return;
    }

    // Mostrar confirmación con información detallada
    const mensajeConfirmacion = `¿Finalizar la factura?\n\n` +
        `Cliente: ${sistemaFacturacion.clienteSeleccionado.nombre}\n` +
        `Productos: ${sistemaFacturacion.detallesActuales.length} item(s)\n` +
        `Factura N°: ${sistemaFacturacion.nroFactura}\n\n` +
        `Esta acción no se puede deshacer.`;

    if (confirm(mensajeConfirmacion)) {
        console.log(`📤 Enviando solicitud de finalización para factura: ${sistemaFacturacion.nroFactura}`);

        // Mostrar mensaje de procesamiento
        mostrarMensajeAlerta('🔄 Procesando factura...', 'info');

        fetch(`/facturacion/finalizar/${sistemaFacturacion.nroFactura}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => {
                console.log('📥 Respuesta recibida:', response.status, response.statusText);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                console.log('📋 Datos de respuesta:', data);
                if (data.success) {
                    let msg = data.message || 'Factura finalizada correctamente';
                    mostrarMensajeAlerta('✅ ' + msg, 'success');
                    // Redirigir después de un breve delay para mostrar el mensaje
                    setTimeout(() => {
                        if (data.redirectUrl) {
                            console.log('🔄 Redirigiendo a:', data.redirectUrl);
                            window.location.href = data.redirectUrl;
                        } else {
                            window.location.href = '/facturacion';
                        }
                    }, 2000);
                } else {
                    let msg = data.message || 'Error desconocido al finalizar la factura';
                    console.error('❌ Error del servidor:', msg);
                    mostrarMensajeAlerta('❌ ' + msg, 'error');
                }
            })
            .catch(error => {
                console.error('❌ Error al finalizar factura:', error);
                mostrarMensajeAlerta('❌ Error al finalizar la factura: ' + error.message, 'error');
            });
    }
}

function cancelarFactura() {
    if (window.esModificacionFactura) {
        // En modo edición, solo redirigir sin eliminar
        if (confirm('¿Cancelar la edición?\n\nSe descartarán los cambios no guardados, pero la factura NO será eliminada.')) {
            window.location.href = '/facturacion';
        }
    } else {
        // En modo registro, sí elimina la factura borrador
        if (confirm('¿Cancelar la factura?\n\nSe perderán todos los cambios realizados y la factura será eliminada.')) {
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
                .catch(() => {
                    alert('Error al cancelar la factura.');
                });
        }
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

// ========================================
// FUNCIONES DE PRUEBA Y DEBUG (TEMPORAL)
// ========================================

// Función temporal para probar la validación de stock
window.probarValidacionStock = function () {
    console.log('🧪 PRUEBA DE VALIDACIÓN DE STOCK');
    console.log('Estado del sistema:', sistemaFacturacion);
    console.log('Productos disponibles:', sistemaFacturacion.productos);
    console.log('Stock local:', sistemaFacturacion.productosStock);

    // Intentar validar con los valores actuales del formulario
    const resultado = validarStock();
    console.log('Resultado de validación:', resultado);

    return resultado;
};

// Función para mostrar estado completo del sistema
window.mostrarEstadoSistema = function () {
    console.log('📊 ESTADO COMPLETO DEL SISTEMA');
    console.log('=================================');
    console.log('Productos:', sistemaFacturacion.productos);
    console.log('Stock local:', sistemaFacturacion.productosStock);
    console.log('Detalles actuales:', sistemaFacturacion.detallesActuales);
    console.log('Cliente seleccionado:', sistemaFacturacion.clienteSeleccionado);
    console.log('Número de factura:', sistemaFacturacion.nroFactura);

    // Verificar elemento stockInfo
    const stockInfo = document.getElementById('stockInfo');
    console.log('Elemento stockInfo:', stockInfo);
    if (stockInfo) {
        console.log('  - Display:', stockInfo.style.display);
        console.log('  - Contenido:', stockInfo.textContent);
        console.log('  - Clases:', stockInfo.className);
    }
};

function mostrarMensajeTablaVacia() {
    const tbody = document.getElementById('detallesBody');
    if (!tbody) return;

    // Verificar si ya existe el mensaje
    const mensajeExistente = document.getElementById('filaVacia');
    if (mensajeExistente) return;

    const filaVacia = document.createElement('tr');
    filaVacia.id = 'filaVacia';
    filaVacia.className = 'fila-vacia';
    filaVacia.innerHTML = `
        <td colspan="8" class="table-empty">
            <div class="table-empty-icon">📋</div>
            <div class="table-empty-message">No hay detalles registrados</div>
            <div class="table-empty-description">
                Selecciona un producto y haz clic en "Agregar" para comenzar a crear la factura
            </div>
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
        actualizarTotalesGenerales();
    },

    limpiarTabla: () => {
        const tbody = document.getElementById('detallesBody');
        if (tbody) {
            tbody.innerHTML = '';
            mostrarMensajeTablaVacia();
            actualizarTotalesGenerales();
        }
    }
};

// ===== FUNCIÓN PARA ACTUALIZAR SELECT CON STOCK =====
function actualizarSelectConStock() {

    const selectProducto = document.getElementById('productoSelect');
    if (!selectProducto) {
        console.warn('⚠️ Select de productos no encontrado');
        return;
    }

    // Actualizar cada opción con el stock actual
    Array.from(selectProducto.options).forEach(option => {
        if (option.value && option.value !== '') {
            const productoId = parseInt(option.value);
            const stockActual = obtenerStockLocal(productoId);

            // Extraer el nombre original del producto (antes del stock)
            let textoOriginal = option.textContent;
            const indicePrimerParentesis = textoOriginal.indexOf('(Stock:');
            if (indicePrimerParentesis > -1) {
                textoOriginal = textoOriginal.substring(0, indicePrimerParentesis).trim();
            }

            // Actualizar texto con nuevo stock
            option.textContent = `${textoOriginal} (Stock: ${stockActual})`;
            option.setAttribute('data-stock', stockActual);

            // Deshabilitar si no hay stock
            if (stockActual <= 0) {
                option.disabled = true;
                option.textContent += ' - SIN STOCK';
                option.style.color = '#999';
            } else {
                option.disabled = false;
                option.style.color = '';
            }
        }
    });
}

// Agregar la función al sistema global para que pueda ser llamada desde otras partes
window.actualizarSelectConStock = actualizarSelectConStock;

// Habilita/deshabilita los campos de cantidad y descuento y los botones de acción, pero nunca el select de producto ni el botón de agregar en modo edición
function setCamposEdicionItem(habilitar) {
    // En modo modificación de factura, deshabilitar toda la sección de productos
    if (window.esModificacionFactura) {
        const fieldset = document.getElementById('fieldsetProductos');
        if (fieldset) fieldset.disabled = true;
        // Opcional: limpiar valores de producto/cantidad/desc/total
        document.getElementById('productoSelect').selectedIndex = 0;
        document.getElementById('cantidad').value = '';
        document.getElementById('descuento').value = '';
        document.getElementById('subtotal').value = '';
        document.getElementById('descuentoValor').value = '';
        document.getElementById('total').value = '';
        return;
    }
    // Modo normal
    const producto = document.getElementById('productoSelect');
    const cantidad = document.getElementById('cantidad');
    const descuento = document.getElementById('descuento');
    const btnPrincipal = document.getElementById('btnPrincipal');
    const btnSecundario = document.getElementById('btnSecundario');
    if (producto) producto.disabled = !habilitar;
    if (btnPrincipal) btnPrincipal.disabled = !habilitar;
    if (cantidad) cantidad.disabled = !habilitar;
    if (descuento) descuento.disabled = !habilitar;
    if (btnSecundario) btnSecundario.disabled = !habilitar;
}

// Modificar para habilitar campos al editar un ítem
const originalModificarDetalle = window.modificarDetalle;
window.modificarDetalle = function(boton) {
    if (window.esModificacionFactura) {
        setCamposEdicionItem(true);
    }
    originalModificarDetalle.call(this, boton);
};

// Al guardar/cancelar, volver a deshabilitar
const originalAccionPrincipal = window.accionPrincipal;
window.accionPrincipal = function() {
    if (window.esModificacionFactura && window.sistemaFacturacion.esModificando) {
        actualizarFilaDetalleModificado();
        limpiarYDeshabilitarFormulario();
    }
    originalAccionPrincipal.call(this);
};

// Modificar acción secundaria para limpiar/deshabilitar
const originalAccionSecundaria = window.accionSecundaria;
window.accionSecundaria = function() {
    if (window.esModificacionFactura && window.sistemaFacturacion.esModificando) {
        limpiarYDeshabilitarFormulario();
    }
    if (originalAccionSecundaria) originalAccionSecundaria.call(this);
};

// Al cargar la página en modo edición, deshabilitar por defecto
if (window.esModificacionFactura) {
    setCamposEdicionItem(false);
}

// Mejorar cancelarFactura para nunca eliminar en modo edición
function cancelarFactura() {
    if (window.esModificacionFactura) {
        // En modo edición, solo redirigir sin eliminar
        if (confirm('¿Cancelar la edición?\n\nNo se eliminará la factura, solo se descartarán los cambios no guardados.')) {
            window.location.href = '/facturacion';
        }
    } else {
        // En modo registro, sí elimina la factura borrador
        if (confirm('¿Cancelar la factura?\n\nSe perderán todos los cambios realizados y la factura será eliminada.')) {
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
                .catch(() => {
                    alert('Error al cancelar la factura.');
                });
        }
    }
}

// Variable para guardar el producto en edición y la cantidad original
window.productoEnEdicion = null;
window.cantidadOriginalEdicion = null;

const originalModificarDetalle3 = window.modificarDetalle;
window.modificarDetalle = function(boton) {
    if (window.esModificacionFactura) {
        // Sumar cantidad original al stock local del producto solo si no está ya en edición
        const productoId = parseInt(boton.getAttribute('data-producto'));
        const cantidadOriginal = parseInt(boton.getAttribute('data-cantidad'));
        const producto = window.sistemaFacturacion.productos.find(p => p.id === productoId);
        if (producto && !isNaN(cantidadOriginal)) {
            if (!window.productoEnEdicion) {
                producto.stock += cantidadOriginal;
                window.productoEnEdicion = producto;
                window.cantidadOriginalEdicion = cantidadOriginal;
            }
        }
    }
    originalModificarDetalle3.call(this, boton);
};

function limpiarStockTemporalEdicion() {
    // Al guardar/cancelar, recalcular el stock real según la tabla y limpiar referencia
    if (typeof recalcularStockDesdeDatos === 'function') {
        setTimeout(() => recalcularStockDesdeDatos(), 100);
    }
    window.productoEnEdicion = null;
    window.cantidadOriginalEdicion = null;
}

function actualizarFilaDetalleModificado() {
    if (!window.sistemaFacturacion || !window.sistemaFacturacion.itemModificando) return;
    const item = window.sistemaFacturacion.itemModificando;
    const tbody = document.getElementById('detallesBody');
    if (!tbody) return;
    const filas = tbody.querySelectorAll('tr');
    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length && parseInt(celdas[0].textContent) === item) {
            // Actualizar cantidad y descuento
            const cantidad = document.getElementById('cantidad').value;
            const descuento = document.getElementById('descuento').value;
            // Recalcular subtotal y total
            const precio = parseFloat(celdas[3].textContent.replace(/[^0-9]/g, ''));
            const subtotal = precio * cantidad;
            const descuentoValor = (subtotal * descuento) / 100;
            const total = subtotal - descuentoValor;
            celdas[2].textContent = cantidad;
            celdas[4].textContent = `$${subtotal}`;
            celdas[5].textContent = `$${descuentoValor}`;
            celdas[6].textContent = `$${total}`;
        }
    });
}

function limpiarYDeshabilitarFormulario() {
    document.getElementById('productoSelect').selectedIndex = 0;
    document.getElementById('cantidad').value = '';
    document.getElementById('descuento').value = '';
    document.getElementById('subtotal').value = '';
    document.getElementById('descuentoValor').value = '';
    document.getElementById('total').value = '';
    setCamposEdicionItem(false);
    limpiarStockTemporalEdicion();
}

const originalAccionPrincipal4 = window.accionPrincipal;
window.accionPrincipal = function() {
    if (window.esModificacionFactura && window.sistemaFacturacion.esModificando) {
        actualizarFilaDetalleModificado();
        limpiarYDeshabilitarFormulario();
    }
    originalAccionPrincipal4.call(this);
};

const originalAccionSecundaria4 = window.accionSecundaria;
window.accionSecundaria = function() {
    if (window.esModificacionFactura && window.sistemaFacturacion.esModificando) {
        limpiarYDeshabilitarFormulario();
    }
    if (originalAccionSecundaria4) originalAccionSecundaria4.call(this);
};