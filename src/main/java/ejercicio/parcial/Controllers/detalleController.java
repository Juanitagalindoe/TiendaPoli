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
    public String eliminar(@RequestParam int nroVenta, @RequestParam int item) {
        try {
            // Para simplificar, usamos un método que combine nroVenta e item
            eliminarDetallePorIds(nroVenta, item);
            
            // Actualizar totales del encabezado después de eliminar el detalle
            sEncabezado.recalcularTotales(nroVenta);
            
            return "redirect:/detalle?success=Detalle eliminado correctamente";
        } catch (IllegalArgumentException e) {
            return "redirect:/detalle?error=Error al eliminar detalle: " + e.getMessage();
        } catch (Exception e) {
            return "redirect:/detalle?error=Error interno del servidor";
        }
    }

    // Mapeo para guardar un detalle (nuevo o modificado)
    @PostMapping("/guardar")
    public String guardarDetalle(@ModelAttribute Detalle detalle,
            @RequestParam(value = "esModificacion", defaultValue = "false") boolean esModificacion,
            @RequestParam("nroVenta") int nroVenta,
            @RequestParam("item") int item,
            @RequestParam("productoId") int productoId,
            @RequestParam(value = "descuentoDetalle", defaultValue = "0") int descuento,
            Model model) {
        try {
            // Crear la clave compuesta
            DetalleID detalleId = new DetalleID(nroVenta, item);
            detalle.setId(detalleId);
            
            // Buscar y asignar el encabezado
            Encabezado encabezado = sEncabezado.buscarEncabezado(nroVenta);
            if (encabezado == null) {
                model.addAttribute("errorGeneral", "La factura especificada no existe");
                return prepararFormulario(model, detalle, esModificacion);
            }
            detalle.setEncabezado(encabezado);
            
            // Buscar y asignar el producto
            Producto producto = sProducto.buscarProducto(productoId);
            if (producto == null) {
                model.addAttribute("errorGeneral", "El producto especificado no existe");
                return prepararFormulario(model, detalle, esModificacion);
            }
            detalle.setProducto(producto);
            
            // Asignar descuento del parámetro si está disponible
            detalle.setDcto(descuento);
            
            // Calcular valores automáticamente
            calcularValoresDetalle(detalle);
            
            // Validar cada campo individualmente
            Map<String, String> errores = validarCamposIndividualmente(detalle);

            if (!errores.isEmpty()) {
                model.addAllAttributes(errores);
                return prepararFormulario(model, detalle, esModificacion);
            }

            // Validar que haya suficiente stock antes de guardar
            if (!sProducto.verificarStockDisponible(producto.getId(), detalle.getCantidad())) {
                Producto prod = sProducto.buscarProducto(producto.getId());
                String mensajeError = String.format("Stock insuficiente. Disponible: %d, Solicitado: %d", 
                    prod.getStock(), detalle.getCantidad());
                model.addAttribute("errorStock", mensajeError);
                return prepararFormulario(model, detalle, esModificacion);
            }

            // Guardar el detalle (esto también actualizará el stock automáticamente)
            sDetalle.guardarDetalle(detalle);
            
            // Actualizar totales del encabezado después de guardar el detalle
            sEncabezado.recalcularTotales(nroVenta);
            
            String mensaje = esModificacion ? "Detalle modificado correctamente" : "Detalle registrado correctamente";
            return "redirect:/detalle?success=" + mensaje;

        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("errorGeneral", "Error al procesar el detalle: " + e.getMessage());
            return prepararFormulario(model, detalle, esModificacion);
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
    private void calcularValoresDetalle(Detalle detalle) {
        if (detalle.getProducto() != null && detalle.getCantidad() > 0) {
            int precioUnitario = detalle.getProducto().getVlrUnit();
            int subtotal = precioUnitario * detalle.getCantidad();
            detalle.setSubtotal(subtotal);
            
            // El descuento se mantiene como se ingresó
            int descuento = detalle.getDcto();
            int valorTotal = subtotal - descuento;
            detalle.setVlrTotal(Math.max(0, valorTotal)); // No permitir totales negativos
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
        DetalleID detalleId = new DetalleID(nroVenta, item);
        Detalle detalle = buscarDetallePorId(detalleId);
        if (detalle != null) {
            // Eliminar usando el servicio apropiado
            sDetalle.eliminarDetalle(detalle.getId().hashCode());
        } else {
            throw new IllegalArgumentException("Detalle no encontrado");
        }
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
