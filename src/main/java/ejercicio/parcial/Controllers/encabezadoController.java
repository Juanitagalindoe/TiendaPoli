package ejercicio.parcial.Controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import ejercicio.parcial.Models.Entity.Encabezado;
import ejercicio.parcial.Models.Entity.Cliente;
import ejercicio.parcial.Models.Entity.Detalle;
import ejercicio.parcial.Models.Entity.Producto;
import ejercicio.parcial.Service.encabezadoService;
import ejercicio.parcial.Service.clienteService;
import ejercicio.parcial.Service.detalleService;
import ejercicio.parcial.Service.productoService;
import java.text.SimpleDateFormat;
import java.util.Date;

@Controller
@RequestMapping("/encabezado")
public class encabezadoController {

    // Inyección de dependencia del servicio
    @Autowired
    private encabezadoService sEncabezado;
    
    @Autowired
    private clienteService sCliente;
    
    @Autowired
    private detalleService sDetalle;
    
    @Autowired
    private productoService sProducto;

    // Constructor para la inyección de dependencia
    public encabezadoController(encabezadoService sEncabezado, clienteService sCliente, detalleService sDetalle, productoService sProducto) {
        this.sEncabezado = sEncabezado;
        this.sCliente = sCliente;
        this.sDetalle = sDetalle;
        this.sProducto = sProducto;
    }

    // Mapeo para la página principal
    @GetMapping()
    public String listar(Model model) {
        List<Encabezado> encabezados = sEncabezado.listarEncabezados();
        System.out.println("Número de encabezados encontrados: " + (encabezados != null ? encabezados.size() : "null"));

        model.addAttribute("titulo", "Listado de Facturas");
        model.addAttribute("encabezados", encabezados);
        model.addAttribute("encabezado", new Encabezado());
        return "encabezado";
    }

    // Mapeo para registrar un nuevo encabezado - crea registro inicial automáticamente
    @GetMapping("/registrar")
    public String nuevoEncabezado(Model model) {
        try {
            // Crear un nuevo encabezado con valores iniciales mínimos
            Encabezado nuevoEncabezado = new Encabezado();
            
            // Establecer fecha y hora actuales
            Date ahora = new Date();
            nuevoEncabezado.setFecha(ahora);
            nuevoEncabezado.setHora(ahora);
            
            // Establecer valores iniciales en 0
            nuevoEncabezado.setSubtotal(0);
            nuevoEncabezado.setDcto(0);
            nuevoEncabezado.setTotal(0);
            
            // Guardar el encabezado inicial (sin cliente por ahora)
            // Nota: temporalmente deshabilitamos validaciones para permitir guardar sin cliente
            Encabezado encabezadoGuardado = sEncabezado.guardarSinValidaciones(nuevoEncabezado);
            
            // Redirigir al formulario de facturación con el ID del encabezado creado
            return "redirect:/encabezado/facturar/" + encabezadoGuardado.getNroVenta();
            
        } catch (Exception e) {
            System.err.println("Error al crear encabezado inicial: " + e.getMessage());
            model.addAttribute("error", "Error al crear la factura inicial");
            return "redirect:/encabezado";
        }
    }

    // Mapeo para modificar un encabezado existente
    @GetMapping("/modificar/{id}")
    public String modificarEncabezado(@PathVariable int id, Model model) {
        try {
            Encabezado encabezado = sEncabezado.buscarEncabezado(id);
            List<Cliente> clientes = sCliente.listarClientes();
            
            if (encabezado != null) {
                model.addAttribute("titulo", "Modificar Factura");
                model.addAttribute("encabezado", encabezado);
                model.addAttribute("clientes", clientes);
                model.addAttribute("esModificacion", true);
                return "form/fencabezado";
            } else {
                return "redirect:/encabezado?error=Factura no encontrada";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "redirect:/encabezado?error=Error al buscar la factura";
        }
    }

    @PostMapping("/eliminar")
    public String eliminar(@RequestParam int id) {
        try {
            sEncabezado.eliminarEncabezado(id);
            return "redirect:/encabezado?success=Factura eliminada correctamente";
        } catch (IllegalArgumentException e) {
            return "redirect:/encabezado?error=Error al eliminar factura: " + e.getMessage();
        } catch (Exception e) {
            return "redirect:/encabezado?error=Error interno del servidor";
        }
    }

    // Endpoint para eliminar encabezado desde JavaScript (cancelar factura)
    @PostMapping("/eliminar/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, String>> eliminarEncabezadoAjax(@PathVariable int id) {
        Map<String, String> response = new HashMap<>();
        try {
            System.out.println("=== CANCELAR FACTURA ===");
            System.out.println("Eliminando encabezado ID: " + id);
            
            sEncabezado.eliminarEncabezado(id);
            
            response.put("status", "success");
            response.put("message", "Factura cancelada correctamente");
            System.out.println("Factura cancelada exitosamente");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Error de validación al cancelar factura: " + e.getMessage());
            response.put("status", "error");
            response.put("message", "Error al cancelar factura: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            System.err.println("Error interno al cancelar factura: " + e.getMessage());
            response.put("status", "error");
            response.put("message", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Mapeo para guardar un encabezado (nuevo o modificado)
    @PostMapping("/guardar")
    public String guardarEncabezado(@ModelAttribute Encabezado encabezado,
            @RequestParam(value = "esModificacion", defaultValue = "false") boolean esModificacion,
            @RequestParam("fechaStr") String fechaStr,
            @RequestParam("horaStr") String horaStr,
            Model model) {
        try {
            // Convertir fecha y hora de string a Date
            try {
                if (fechaStr != null && !fechaStr.isEmpty()) {
                    SimpleDateFormat formatoFecha = new SimpleDateFormat("yyyy-MM-dd");
                    Date fecha = formatoFecha.parse(fechaStr);
                    encabezado.setFecha(fecha);
                }
                
                if (horaStr != null && !horaStr.isEmpty()) {
                    SimpleDateFormat formatoHora = new SimpleDateFormat("HH:mm");
                    Date hora = formatoHora.parse(horaStr);
                    encabezado.setHora(hora);
                }
            } catch (Exception e) {
                model.addAttribute("errorGeneral", "Error al procesar fecha u hora: " + e.getMessage());
                return prepararFormularioEncabezado(model, encabezado, esModificacion);
            }
            
            // Validar cada campo individualmente para capturar errores específicos
            Map<String, String> errores = validarCamposIndividualmente(encabezado);

            if (!errores.isEmpty()) {
                // Si hay errores, agregar cada uno al modelo
                model.addAllAttributes(errores);
                return prepararFormularioEncabezado(model, encabezado, esModificacion);
            }

            // Si no hay errores, guardar el encabezado
            sEncabezado.guardarEncabezado(encabezado);
            String mensaje = esModificacion ? "Factura modificada correctamente" : "Factura registrada correctamente";
            return "redirect:/encabezado?success=" + mensaje;

        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("errorGeneral", "Error al procesar la factura: " + e.getMessage());
            return prepararFormularioEncabezado(model, encabezado, esModificacion);
        }
    }

    // Método privado para validar campos individualmente
    private Map<String, String> validarCamposIndividualmente(Encabezado encabezado) {
        Map<String, String> errores = new HashMap<>();

        try {
            sEncabezado.validarCliente(encabezado.getCliente());
        } catch (IllegalArgumentException e) {
            errores.put("errorCliente", e.getMessage());
        }

        try {
            sEncabezado.validarFecha(encabezado.getFecha());
        } catch (IllegalArgumentException e) {
            errores.put("errorFecha", e.getMessage());
        }

        try {
            sEncabezado.validarHora(encabezado.getHora());
        } catch (IllegalArgumentException e) {
            errores.put("errorHora", e.getMessage());
        }

        try {
            sEncabezado.validarSubtotal(encabezado.getSubtotal());
        } catch (IllegalArgumentException e) {
            errores.put("errorSubtotal", e.getMessage());
        }

        try {
            sEncabezado.validarDescuento(encabezado.getDcto());
        } catch (IllegalArgumentException e) {
            errores.put("errorDescuento", e.getMessage());
        }

        try {
            sEncabezado.validarTotal(encabezado.getTotal());
        } catch (IllegalArgumentException e) {
            errores.put("errorTotal", e.getMessage());
        }

        return errores;
    }
    
    // Método auxiliar para preparar el formulario de encabezado
    private String prepararFormularioEncabezado(Model model, Encabezado encabezado, boolean esModificacion) {
        model.addAttribute("titulo", esModificacion ? "Modificar Factura" : "Registrar Factura");
        model.addAttribute("encabezado", encabezado);
        model.addAttribute("esModificacion", esModificacion);
        
        // Cargar lista de clientes para el formulario
        List<Cliente> clientes = sCliente.listarClientes();
        model.addAttribute("clientes", clientes);
        
        return "form/fencabezado";
    }
    
    // Método para ver la factura detallada
    @GetMapping("/factura/{nroVenta}")
    public String verFactura(@PathVariable("nroVenta") int nroVenta, Model model) {
        try {
            // Buscar el encabezado por número de venta
            Encabezado encabezado = sEncabezado.listarEncabezados().stream()
                .filter(e -> e.getNroVenta() == nroVenta)
                .findFirst()
                .orElse(null);
            
            if (encabezado == null) {
                model.addAttribute("error", "Factura no encontrada");
                return "redirect:/encabezado";
            }
            
            // Buscar los detalles asociados a esta factura
            List<Detalle> detalles = sDetalle.listarDetalles().stream()
                .filter(d -> d.getNroVenta() == nroVenta)
                .toList();
            
            // Calcular totales
            double totalSubtotal = detalles.stream().mapToDouble(Detalle::getSubtotal).sum();
            double totalDescuento = detalles.stream().mapToDouble(Detalle::getDcto).sum();
            double totalPagar = detalles.stream().mapToDouble(Detalle::getVlrTotal).sum();
            
            // Pasar datos al modelo
            model.addAttribute("encabezado", encabezado);
            model.addAttribute("detalles", detalles);
            model.addAttribute("totalSubtotal", totalSubtotal);
            model.addAttribute("totalDescuento", totalDescuento);
            model.addAttribute("totalPagar", totalPagar);
            
            return "factura-detalle";
            
        } catch (Exception e) {
            System.err.println("Error al cargar la factura: " + e.getMessage());
            model.addAttribute("error", "Error al cargar la factura");
            return "redirect:/encabezado";
        }
    }
    
    // Método para recalcular totales manualmente (puede ser útil para debugging o correcciones)
    @PostMapping("/recalcular/{nroVenta}")
    public String recalcularTotales(@PathVariable("nroVenta") int nroVenta) {
        try {
            sEncabezado.recalcularTotales(nroVenta);
            return "redirect:/encabezado?success=Totales recalculados correctamente para la factura " + nroVenta;
        } catch (Exception e) {
            System.err.println("Error al recalcular totales: " + e.getMessage());
            return "redirect:/encabezado?error=Error al recalcular totales: " + e.getMessage();
        }
    }
    
    // Endpoint directo para crear nueva factura y acceder al formulario
    @GetMapping("/facturar")
    public String nuevaFactura() {
        return "redirect:/encabezado/registrar";
    }
    
    // Endpoint para finalizar una factura (validaciones finales)
    @PostMapping("/finalizar/{nroVenta}")
    @ResponseBody
    public Map<String, Object> finalizarFactura(@PathVariable("nroVenta") int nroVenta) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Buscar el encabezado
            Encabezado encabezado = sEncabezado.buscarEncabezado(nroVenta);
            if (encabezado == null) {
                response.put("success", false);
                response.put("message", "Factura no encontrada");
                return response;
            }
            
            // Validar que tenga cliente
            if (encabezado.getCliente() == null) {
                response.put("success", false);
                response.put("message", "Debe seleccionar un cliente antes de finalizar la factura");
                return response;
            }
            
            // Buscar detalles de la factura
            List<Detalle> detalles = sDetalle.listarDetalles().stream()
                .filter(d -> d.getNroVenta() == nroVenta)
                .toList();
            
            // Validar que tenga al menos un producto
            if (detalles.isEmpty()) {
                response.put("success", false);
                response.put("message", "Debe agregar al menos un producto antes de finalizar la factura");
                return response;
            }
            
            // Actualizar totales una vez más para asegurar consistencia
            sEncabezado.actualizarTotalesEncabezado(nroVenta);
            
            response.put("success", true);
            response.put("message", "Factura finalizada correctamente");
            response.put("redirectUrl", "/encabezado/factura/" + nroVenta);
            
            System.out.println("Factura " + nroVenta + " finalizada correctamente");
            
            return response;
            
        } catch (Exception e) {
            System.err.println("Error al finalizar factura " + nroVenta + ": " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error interno del servidor al finalizar la factura");
            return response;
        }
    }
    
    // Endpoint principal para el formulario de facturación complejo
    @GetMapping("/facturar/{nroVenta}")
    public String formFacturacion(@PathVariable("nroVenta") int nroVenta, Model model) {
        try {
            // Buscar el encabezado
            Encabezado encabezado = sEncabezado.buscarEncabezado(nroVenta);
            if (encabezado == null) {
                return "redirect:/encabezado?error=Factura no encontrada";
            }
            
            // Obtener listas necesarias
            List<Cliente> clientes = sCliente.listarClientes();
            List<Producto> productos = sProducto.listarProductos();
            
            // Obtener detalles actuales de la factura
            List<Detalle> detalles = sDetalle.listarDetalles().stream()
                .filter(d -> d.getNroVenta() == nroVenta)
                .toList();
            
            // Pasar datos al modelo
            model.addAttribute("encabezado", encabezado);
            model.addAttribute("clientes", clientes);
            model.addAttribute("productos", productos);
            model.addAttribute("detalles", detalles);
            model.addAttribute("nuevoDetalle", new Detalle());
            model.addAttribute("esModificacion", false);
            model.addAttribute("titulo", "Facturación - Factura #" + nroVenta);
            
            return "facturacion-form";
            
        } catch (Exception e) {
            System.err.println("Error al cargar formulario de facturación: " + e.getMessage());
            return "redirect:/encabezado?error=Error al cargar el formulario de facturación";
        }
    }
    
    // Endpoint para actualizar el cliente de una factura (AJAX)
    @PostMapping("/actualizar-cliente")
    @ResponseBody 
    public Map<String, Object> actualizarClienteFactura(@RequestParam("nroVenta") int nroVenta, 
                                                        @RequestParam("clienteId") String clienteId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Encabezado encabezado = sEncabezado.buscarEncabezado(nroVenta);
            if (encabezado == null) {
                response.put("success", false);
                response.put("message", "Factura no encontrada");
                return response;
            }
            
            Cliente cliente = sCliente.buscarCliente(clienteId);
            if (cliente == null) {
                response.put("success", false);
                response.put("message", "Cliente no encontrado");
                return response;
            }
            
            encabezado.setCliente(cliente);
            sEncabezado.guardarConValidacionesParciales(encabezado);
            
            response.put("success", true);
            response.put("message", "Cliente seleccionado correctamente");
            response.put("clienteNombre", cliente.getNombre() + " " + cliente.getApellido());
            response.put("clienteId", cliente.getId());
            
            System.out.println("Cliente actualizado: " + cliente.getId() + " - " + cliente.getNombre());
            
            return response;
            
        } catch (Exception e) {
            System.err.println("Error al actualizar cliente: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error interno del servidor");
            return response;
        }
    }
}
