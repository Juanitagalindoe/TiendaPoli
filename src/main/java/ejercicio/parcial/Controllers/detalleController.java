package ejercicio.parcial.Controllers;

//librerías de Java
import java.util.HashMap;
import java.util.List;
import java.util.Map;

//librerías de Spring
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

// Imports para manejo de peticiones HTTP
import jakarta.servlet.http.HttpServletRequest;


//clases del proyecto
import ejercicio.parcial.Models.Entity.*;
import ejercicio.parcial.Service.*;

@Controller
@RequestMapping("/detalle")
public class detalleController {
    @Autowired
    private detalleService sDetalle;
    
    @Autowired
    private encabezadoService sEncabezado;
    
    @Autowired
    private productoService sProducto;
    
    public detalleController(detalleService sDetalle, encabezadoService sEncabezado, productoService sProducto) {
        this.sDetalle = sDetalle;
        this.sEncabezado = sEncabezado;
        this.sProducto = sProducto;
    }

    // Mapeo para la página principal
    @GetMapping()
    public String listar(Model model) {
        List<Detalle> detalles = sDetalle.listarDetalles();
        model.addAttribute("titulo", "Resumen de compra");
        model.addAttribute("detalles", detalles);
        model.addAttribute("detalle", new Detalle());
        return "detalle";
    }

    // Mapeo para registrar un nuevo detalle
    @GetMapping("/registrar")
    public String nuevoDetalle(Model model) {
        List<Encabezado> encabezados = sEncabezado.listarEncabezados();
        List<Producto> productos = sProducto.listarProductos();
        
        model.addAttribute("titulo", "Registrar Detalle de Factura");
        model.addAttribute("detalle", new Detalle());
        model.addAttribute("encabezados", encabezados);
        model.addAttribute("productos", productos);
        model.addAttribute("esModificacion", false);
        return "form/fdetalle";
    }

    // Mapeo para modificar un detalle existente (requiere nroVenta e item)
    @GetMapping("/modificar/{nroVenta}/{item}")
    public String modificarDetalle(@PathVariable int nroVenta, @PathVariable int item, Model model) {
        try {
            // Crear la clave compuesta
            DetalleID detalleId = new DetalleID(nroVenta, item);
            
            // Buscar el detalle (necesitamos ajustar el servicio para aceptar DetalleID)
            Detalle detalle = buscarDetallePorId(detalleId);
            
            if (detalle != null) {
                List<Encabezado> encabezados = sEncabezado.listarEncabezados();
                List<Producto> productos = sProducto.listarProductos();
                
                model.addAttribute("titulo", "Modificar Detalle de Factura");
                model.addAttribute("detalle", detalle);
                model.addAttribute("encabezados", encabezados);
                model.addAttribute("productos", productos);
                model.addAttribute("esModificacion", true);
                return "form/fdetalle";
            } else {
                return "redirect:/detalle?error=Detalle no encontrado";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "redirect:/detalle?error=Error al buscar el detalle";
        }
    }

    @PostMapping("/eliminar")
    public Object eliminar(@RequestParam int nroVenta, @RequestParam int item, HttpServletRequest request) {
        // Detectar si es una petición AJAX
        boolean isAjax = "XMLHttpRequest".equals(request.getHeader("X-Requested-With"));
        
        try {
            System.out.println("🗑️ ELIMINANDO DETALLE - Factura: " + nroVenta + ", Item: " + item);
            
            // Obtener información del detalle antes de eliminarlo (para mostrar en respuesta)
            List<Detalle> detalles = sDetalle.listarDetalles().stream()
                .filter(d -> d.getNroVenta() == nroVenta && d.getItem() == item)
                .toList();
            
            String nombreProducto = "";
            int cantidadEliminada = 0;
            
            if (!detalles.isEmpty()) {
                Detalle detalleAEliminar = detalles.get(0);
                if (detalleAEliminar.getProducto() != null) {
                    nombreProducto = detalleAEliminar.getProducto().getNombre();
                    cantidadEliminada = detalleAEliminar.getCantidad();
                    System.out.println("📦 Producto a eliminar: " + nombreProducto + " (Cantidad: " + cantidadEliminada + ")");
                }
            }
            
            // Para simplificar, usamos un método que combine nroVenta e item
            eliminarDetallePorIds(nroVenta, item);
            
            // Actualizar totales del encabezado después de eliminar el detalle
            sEncabezado.recalcularTotales(nroVenta);
            
            System.out.println("✅ Detalle eliminado y totales recalculados correctamente");
            
            if (isAjax) {
                // Respuesta JSON para AJAX
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Producto '" + nombreProducto + "' eliminado correctamente. Stock reintegrado: " + cantidadEliminada);
                
                // Incluir información del item eliminado para el JavaScript
                Map<String, Object> detalleEliminado = new HashMap<>();
                detalleEliminado.put("item", item);
                detalleEliminado.put("nroVenta", nroVenta);
                detalleEliminado.put("nombreProducto", nombreProducto);
                detalleEliminado.put("cantidadRestituida", cantidadEliminada);
                response.put("detalle", detalleEliminado);
                
                System.out.println("📤 Enviando respuesta AJAX exitosa");
                return ResponseEntity.ok(response);
            } else {
                // Redirección para peticiones normales
                return "redirect:/detalle?success=Detalle eliminado correctamente";
            }
            
        } catch (IllegalArgumentException e) {
            if (isAjax) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Error al eliminar detalle: " + e.getMessage());
                return ResponseEntity.badRequest().body(response);
            } else {
                return "redirect:/detalle?error=Error al eliminar detalle: " + e.getMessage();
            }
        } catch (Exception e) {
            if (isAjax) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Error interno del servidor");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            } else {
                return "redirect:/detalle?error=Error interno del servidor";
            }
        }
    }

    // Mapeo para guardar un detalle (nuevo o modificado)
    @PostMapping("/guardar")
    public Object guardarDetalle(@ModelAttribute Detalle detalle,
            @RequestParam(value = "esModificacion", defaultValue = "false") boolean esModificacion,
            @RequestParam("nroVenta") int nroVenta,
            @RequestParam("item") int item,
            @RequestParam("productoId") int productoId,
            @RequestParam(value = "descuentoDetalle", defaultValue = "0") double descuento,
            HttpServletRequest request,
            Model model) {
        
        // Detectar si es una petición AJAX
        boolean isAjax = "XMLHttpRequest".equals(request.getHeader("X-Requested-With"));
        
        // Debug: Verificar datos recibidos
        System.out.println("📥 Datos recibidos en controlador:");
        System.out.println("   - nroVenta: " + nroVenta);
        System.out.println("   - item: " + item);
        System.out.println("   - productoId: " + productoId);
        System.out.println("   - cantidad: " + detalle.getCantidad());
        System.out.println("   - descuentoDetalle (recibido): " + descuento);
        System.out.println("   - esModificacion: " + esModificacion);
        System.out.println("   - isAjax: " + isAjax);
        
        try {
            // Crear la clave compuesta
            DetalleID detalleId = new DetalleID(nroVenta, item);
            detalle.setId(detalleId);
            
            // Buscar y asignar el encabezado
            Encabezado encabezado = sEncabezado.buscarEncabezado(nroVenta);
            if (encabezado == null) {
                String errorMsg = "La factura especificada no existe";
                if (isAjax) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", errorMsg);
                    return ResponseEntity.badRequest().body(response);
                } else {
                    model.addAttribute("errorGeneral", errorMsg);
                    return prepararFormulario(model, detalle, esModificacion);
                }
            }
            detalle.setEncabezado(encabezado);
            
            // Buscar y asignar el producto
            Producto producto = sProducto.buscarProducto(productoId);
            if (producto == null) {
                String errorMsg = "El producto especificado no existe";
                if (isAjax) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", errorMsg);
                    return ResponseEntity.badRequest().body(response);
                } else {
                    model.addAttribute("errorGeneral", errorMsg);
                    return prepararFormulario(model, detalle, esModificacion);
                }
            }
            detalle.setProducto(producto);
            
            // Calcular valores automáticamente con el porcentaje de descuento
            calcularValoresDetalle(detalle, descuento);
            
            // Validar cada campo individualmente
            Map<String, String> errores = validarCamposIndividualmente(detalle);

            if (!errores.isEmpty()) {
                if (isAjax) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Error de validación: " + errores.values().iterator().next());
                    return ResponseEntity.badRequest().body(response);
                } else {
                    model.addAllAttributes(errores);
                    return prepararFormulario(model, detalle, esModificacion);
                }
            }

            // Validar que haya suficiente stock antes de guardar
            if (!sProducto.verificarStockDisponible(producto.getId(), detalle.getCantidad())) {
                Producto prod = sProducto.buscarProducto(producto.getId());
                String mensajeError = String.format("Stock insuficiente. Disponible: %d, Solicitado: %d", 
                    prod.getStock(), detalle.getCantidad());
                if (isAjax) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", mensajeError);
                    return ResponseEntity.badRequest().body(response);
                } else {
                    model.addAttribute("errorStock", mensajeError);
                    return prepararFormulario(model, detalle, esModificacion);
                }
            }

            // Guardar el detalle (esto también actualizará el stock automáticamente)
            sDetalle.guardarDetalle(detalle);
            
            // Debug: Verificar que el detalle se guardó correctamente
            System.out.println("✅ Detalle guardado exitosamente:");
            System.out.println("   - NroVenta: " + detalle.getId().getNroVenta());
            System.out.println("   - Item: " + detalle.getId().getItem());
            System.out.println("   - Producto: " + detalle.getProducto().getNombre());
            System.out.println("   - Cantidad: " + detalle.getCantidad());
            System.out.println("   - Subtotal final: $" + detalle.getSubtotal());
            System.out.println("   - Descuento final (monto): $" + detalle.getDcto());
            System.out.println("   - Total final: $" + detalle.getVlrTotal());
            System.out.println("   - Cantidad: " + detalle.getCantidad());
            System.out.println("   - Subtotal: " + detalle.getSubtotal());
            System.out.println("   - Total: " + detalle.getVlrTotal());
            
            // Actualizar totales del encabezado después de guardar el detalle
            sEncabezado.recalcularTotales(nroVenta);
            
            String mensaje = esModificacion ? "Producto modificado correctamente en la factura" : "Producto agregado correctamente a la factura";
            
            if (isAjax) {
                System.out.println("🌐 Preparando respuesta AJAX...");
                
                // Crear un DTO del detalle sin referencias circulares
                Map<String, Object> detalleDto = new HashMap<>();
                detalleDto.put("item", detalle.getId().getItem());
                detalleDto.put("nroVenta", detalle.getId().getNroVenta());
                detalleDto.put("producto", detalle.getProducto().getNombre());
                detalleDto.put("productoId", detalle.getProducto().getId());
                detalleDto.put("cantidad", detalle.getCantidad());
                detalleDto.put("vlrUnit", detalle.getProducto().getVlrUnit());
                detalleDto.put("subtotal", detalle.getSubtotal());
                detalleDto.put("descuento", detalle.getDcto());
                detalleDto.put("total", detalle.getVlrTotal());
                
                System.out.println("📦 DTO creado: " + detalleDto);
                
                // Respuesta JSON para AJAX
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", mensaje);
                response.put("detalle", detalleDto);
                
                System.out.println("📤 Enviando respuesta: " + response);
                return ResponseEntity.ok(response);
            } else {
                // Redirección para peticiones normales
                return "redirect:/detalle?success=" + mensaje;
            }

        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = "Error al procesar el detalle: " + e.getMessage();
            if (isAjax) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", errorMsg);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            } else {
                model.addAttribute("errorGeneral", errorMsg);
                return prepararFormulario(model, detalle, esModificacion);
            }
        }
    }

    // MÉTODO ELIMINADO: guardarDetalleAjax() - Era redundante con guardarDetalle()
    // El endpoint /detalle/guardar maneja tanto peticiones normales como AJAX

    // Método auxiliar para preparar el formulario
    private String prepararFormulario(Model model, Detalle detalle, boolean esModificacion) {
        List<Encabezado> encabezados = sEncabezado.listarEncabezados();
        List<Producto> productos = sProducto.listarProductos();
        
        model.addAttribute("titulo", esModificacion ? "Modificar Detalle de Factura" : "Registrar Detalle de Factura");
        model.addAttribute("detalle", detalle);
        model.addAttribute("encabezados", encabezados);
        model.addAttribute("productos", productos);
        model.addAttribute("esModificacion", esModificacion);
        
        return "form/fdetalle";
    }

    // Método auxiliar para calcular valores del detalle
    private void calcularValoresDetalle(Detalle detalle, double porcentajeDescuento) {
        if (detalle.getProducto() != null && detalle.getCantidad() > 0) {
            int precioUnitario = detalle.getProducto().getVlrUnit();
            int subtotal = precioUnitario * detalle.getCantidad();
            detalle.setSubtotal(subtotal);
            
            // Calcular el monto exacto sin redondeo intermedio
            double montoDescuentoExacto = (subtotal * porcentajeDescuento) / 100.0;
            
            // Redondear solo al final para almacenar como entero
            int montoDescuentoFinal = (int) Math.round(montoDescuentoExacto);
            int valorTotal = subtotal - montoDescuentoFinal;
            
            // Debug para verificar cálculos
            System.out.println("🧮 Cálculo de detalle:");
            System.out.println("   - Precio unitario: $" + precioUnitario);
            System.out.println("   - Cantidad: " + detalle.getCantidad());
            System.out.println("   - Subtotal: $" + subtotal);
            System.out.println("   - Descuento %: " + porcentajeDescuento + "%");
            System.out.println("   - Monto descuento (exacto): $" + String.format("%.2f", montoDescuentoExacto));
            System.out.println("   - Monto descuento (final): $" + montoDescuentoFinal);
            System.out.println("   - Total final: $" + valorTotal);
            
            // Guardar el monto del descuento (redondeado a entero)
            detalle.setDcto(montoDescuentoFinal);
            detalle.setVlrTotal(Math.max(0, valorTotal));
        }
    }

    // Método auxiliar para buscar detalle por ID compuesto
    private Detalle buscarDetallePorId(DetalleID detalleId) {
        List<Detalle> todos = sDetalle.listarDetalles();
        return todos.stream()
                .filter(d -> d.getId().equals(detalleId))
                .findFirst()
                .orElse(null);
    }

    // Método auxiliar para eliminar por IDs compuestos
    private void eliminarDetallePorIds(int nroVenta, int item) {
        // Usar el método específico del servicio para claves compuestas
        sDetalle.eliminarDetallePorClaveCompuesta(nroVenta, item);
    }

    // Método privado para validar campos individualmente
    private Map<String, String> validarCamposIndividualmente(Detalle detalle) {
        Map<String, String> errores = new HashMap<>();

        try {
            sDetalle.validarEncabezado(detalle.getEncabezado());
        } catch (IllegalArgumentException e) {
            errores.put("errorEncabezado", e.getMessage());
        }

        try {
            sDetalle.validarProducto(detalle.getProducto());
        } catch (IllegalArgumentException e) {
            errores.put("errorProducto", e.getMessage());
        }

        try {
            sDetalle.validarCantidad(detalle.getCantidad());
        } catch (IllegalArgumentException e) {
            errores.put("errorCantidad", e.getMessage());
        }

        try {
            sDetalle.validarSubtotal(detalle.getSubtotal());
        } catch (IllegalArgumentException e) {
            errores.put("errorSubtotal", e.getMessage());
        }

        try {
            sDetalle.validarDescuento(detalle.getDcto());
        } catch (IllegalArgumentException e) {
            errores.put("errorDescuento", e.getMessage());
        }

        try {
            sDetalle.validarValorTotal(detalle.getVlrTotal());
        } catch (IllegalArgumentException e) {
            errores.put("errorValorTotal", e.getMessage());
        }

        return errores;
    }
}
