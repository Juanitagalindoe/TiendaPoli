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

import ejercicio.parcial.Models.Entity.Cliente;
import ejercicio.parcial.Service.clienteService;

@Controller
@RequestMapping("/cliente")
public class clienteController {

    // Inyección de dependencia del servicio
    @Autowired
    private clienteService sCliente;

    // Constructor para la inyección de dependencia
    public clienteController(clienteService sCliente) {
        this.sCliente = sCliente;
    }

    // Mapeo para la página principal
    @GetMapping()
    public String listar(Model model) {
        List<Cliente> clientes = sCliente.listarClientes();
        System.out.println("Número de clientes encontrados: " + (clientes != null ? clientes.size() : "null"));

        model.addAttribute("titulo", "Listado de Clientes");
        model.addAttribute("clientes", clientes);
        model.addAttribute("cliente", new Cliente()); // objeto vacío cargado en el formulario y modal de eliminación
        return "cliente";
    }

    // Mapeo para registrar un nuevo cliente
    @GetMapping("/registrar")
    public String nuevoCliente(Model model) {
        model.addAttribute("titulo", "Registrar Cliente");
        model.addAttribute("cliente", new Cliente());
        model.addAttribute("esModificacion", false); // Indicador para nuevo registro
        return "form/fcliente";
    }

    // Mapeo para modificar un cliente existente según su ID
    @GetMapping("/modificar/{id}")
    public String ModificarCliente(@PathVariable("id") String id, Model model) {
        try {
            Cliente cliente = sCliente.buscarCliente(id);
            if (cliente == null) {
                // Si no se encuentra el cliente, redirigir con mensaje de error
                model.addAttribute("error", "Cliente no encontrado con ID: " + id);
                return "redirect:/cliente?error=Cliente no encontrado";
            }
            model.addAttribute("titulo", "Modificar Cliente");
            model.addAttribute("cliente", cliente);
            model.addAttribute("esModificacion", true); // Indicador para modificación
            return "form/fcliente";
        } catch (Exception e) {
            // Manejar cualquier error inesperado
            System.err.println("Error al buscar cliente con ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return "redirect:/cliente?error=Error al buscar el cliente";
        }
    }

    @PostMapping("/eliminar")
    public String eliminar(@RequestParam String id) {
        try {
            sCliente.eliminarCliente(id);
            return "redirect:/cliente?success=Cliente eliminado correctamente";
        } catch (IllegalArgumentException e) {
            return "redirect:/cliente?error=Error al eliminar cliente: " + e.getMessage();
        } catch (Exception e) {
            return "redirect:/cliente?error=Error interno del servidor";
        }
    }

    // Mapeo para guardar un cliente (nuevo o modificado)
    @PostMapping("/guardar")
    public String guardarCliente(@ModelAttribute Cliente cliente,
            @RequestParam(value = "esModificacion", defaultValue = "false") boolean esModificacion,
            Model model) {
        try {
            // Validar cada campo individualmente para capturar errores específicos
            Map<String, String> errores = validarCamposIndividualmente(cliente);

            if (!errores.isEmpty()) {
                // Si hay errores, agregar cada uno al modelo
                model.addAllAttributes(errores);
                model.addAttribute("titulo", esModificacion ? "Modificar Cliente" : "Registrar Cliente");
                model.addAttribute("cliente", cliente);
                model.addAttribute("esModificacion", esModificacion);
                return "form/fcliente";
            }

            sCliente.guardarCliente(cliente);
            return "redirect:/cliente"; // Redirigir a la lista de clientes
        } catch (IllegalArgumentException e) {
            model.addAttribute("titulo", esModificacion ? "Modificar Cliente" : "Registrar Cliente");
            model.addAttribute("cliente", cliente);
            model.addAttribute("esModificacion", esModificacion);
            model.addAttribute("error", e.getMessage());
            return "form/fcliente";
        } catch (Exception e) {
            model.addAttribute("titulo", esModificacion ? "Modificar Cliente" : "Registrar Cliente");
            model.addAttribute("cliente", cliente);
            model.addAttribute("esModificacion", esModificacion);
            model.addAttribute("error", "Error interno del servidor: " + e.getMessage());
            return "form/fcliente";
        }
    }

    // Método auxiliar para validar campos individualmente
    private Map<String, String> validarCamposIndividualmente(Cliente cliente) {
        Map<String, String> errores = new HashMap<>();

        try {
            sCliente.validarId(cliente.getId());
        } catch (IllegalArgumentException e) {
            errores.put("errorId", e.getMessage());
        }

        try {
            sCliente.validarNombre(cliente.getNombre());
        } catch (IllegalArgumentException e) {
            errores.put("errorNombre", e.getMessage());
        }

        try {
            sCliente.validarApellido(cliente.getApellido());
        } catch (IllegalArgumentException e) {
            errores.put("errorApellido", e.getMessage());
        }

        try {
            sCliente.validarFechaRegistro(cliente.getFechaRegistro());
        } catch (IllegalArgumentException e) {
            errores.put("errorFecha", e.getMessage());
        }

        return errores;
    }

}
