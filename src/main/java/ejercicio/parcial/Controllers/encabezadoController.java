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

import ejercicio.parcial.Models.Entity.Encabezado;
import ejercicio.parcial.Models.Entity.Cliente;
import ejercicio.parcial.Service.encabezadoService;
import ejercicio.parcial.Service.clienteService;

@Controller
@RequestMapping("/encabezado")
public class encabezadoController {

    // Inyección de dependencia del servicio
    @Autowired
    private encabezadoService sEncabezado;
    
    @Autowired
    private clienteService sCliente;

    // Constructor para la inyección de dependencia
    public encabezadoController(encabezadoService sEncabezado, clienteService sCliente) {
        this.sEncabezado = sEncabezado;
        this.sCliente = sCliente;
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

    // Mapeo para registrar un nuevo encabezado
    @GetMapping("/registrar")
    public String nuevoEncabezado(Model model) {
        List<Cliente> clientes = sCliente.listarClientes();
        
        model.addAttribute("titulo", "Registrar Factura");
        model.addAttribute("encabezado", new Encabezado());
        model.addAttribute("clientes", clientes);
        model.addAttribute("esModificacion", false);
        return "form/fencabezado";
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

    // Mapeo para guardar un encabezado (nuevo o modificado)
    @PostMapping("/guardar")
    public String guardarEncabezado(@ModelAttribute Encabezado encabezado,
            @RequestParam(value = "esModificacion", defaultValue = "false") boolean esModificacion,
            Model model) {
        try {
            // Validar cada campo individualmente para capturar errores específicos
            Map<String, String> errores = validarCamposIndividualmente(encabezado);

            if (!errores.isEmpty()) {
                // Si hay errores, agregar cada uno al modelo
                model.addAllAttributes(errores);
                model.addAttribute("titulo", esModificacion ? "Modificar Factura" : "Registrar Factura");
                model.addAttribute("encabezado", encabezado);
                model.addAttribute("esModificacion", esModificacion);
                
                // Cargar lista de clientes para el formulario
                List<Cliente> clientes = sCliente.listarClientes();
                model.addAttribute("clientes", clientes);
                
                return "form/fencabezado";
            }

            // Si no hay errores, guardar el encabezado
            sEncabezado.guardarEncabezado(encabezado);
            String mensaje = esModificacion ? "Factura modificada correctamente" : "Factura registrada correctamente";
            return "redirect:/encabezado?success=" + mensaje;

        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("errorGeneral", "Error al procesar la factura: " + e.getMessage());
            model.addAttribute("titulo", esModificacion ? "Modificar Factura" : "Registrar Factura");
            model.addAttribute("encabezado", encabezado);
            model.addAttribute("esModificacion", esModificacion);
            
            // Cargar lista de clientes para el formulario
            List<Cliente> clientes = sCliente.listarClientes();
            model.addAttribute("clientes", clientes);
            
            return "form/fencabezado";
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
}
