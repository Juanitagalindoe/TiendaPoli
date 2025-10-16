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
        model.addAttribute("esModificacion", false); // Indicar que es un registro nuevo
        return "cliente-form";
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
            return "cliente-form";
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
        
        System.out.println("=== DEBUG GUARDAR CLIENTE ===");
        System.out.println("ID recibido: " + cliente.getId());
        System.out.println("Nombre recibido: " + cliente.getNombre());
        System.out.println("Parámetro esModificacion: " + esModificacion);
        
        // Determinar si es modificación basándose en el parámetro del formulario
        // No verificar automáticamente la existencia para evitar confusión
        boolean esModificacionReal = esModificacion;
        Cliente clienteExistente = null;
        
        System.out.println("esModificacion del formulario: " + esModificacion);
        System.out.println("esModificacionReal determinado: " + esModificacionReal);
        
        try {
            // Solo buscar el cliente existente si es una modificación declarada
            if (esModificacionReal && cliente.getId() != null && !cliente.getId().trim().isEmpty()) {
                clienteExistente = sCliente.buscarCliente(cliente.getId());
                System.out.println("Cliente existente encontrado: " + (clienteExistente != null ? "SÍ" : "NO"));
            }
            
            // Si es una modificación, preservar la fecha de registro original
            if (esModificacionReal && clienteExistente != null) {
                if (clienteExistente.getFechaRegistro() != null) {
                    cliente.setFechaRegistro(clienteExistente.getFechaRegistro());
                }
            }
            
            // Si es un registro nuevo pero el ID ya existe, mostrar error
            if (!esModificacionReal && cliente.getId() != null && !cliente.getId().trim().isEmpty()) {
                Cliente clienteYaExiste = sCliente.buscarCliente(cliente.getId());
                if (clienteYaExiste != null) {
                    model.addAttribute("titulo", "Registrar Cliente");
                    model.addAttribute("cliente", cliente);
                    model.addAttribute("esModificacion", false);
                    model.addAttribute("errorId", "Ya existe un cliente con el documento " + cliente.getId());
                    System.out.println("Error: Cliente con ID " + cliente.getId() + " ya existe");
                    return "cliente-form";
                }
            }

            // Validar cada campo individualmente para capturar errores específicos
            Map<String, String> errores = validarCamposIndividualmente(cliente);

            if (!errores.isEmpty()) {
                // Si hay errores, agregar cada uno al modelo
                System.out.println("Errores de validación encontrados: " + errores);
                model.addAllAttributes(errores);
                model.addAttribute("titulo", esModificacionReal ? "Modificar Cliente" : "Registrar Cliente");
                model.addAttribute("cliente", cliente);
                model.addAttribute("esModificacion", esModificacionReal);
                return "cliente-form";
            }

            sCliente.guardarCliente(cliente);
            String mensaje = esModificacionReal ? "Cliente modificado correctamente" : "Cliente registrado correctamente";
            System.out.println("Cliente guardado exitosamente: " + mensaje);
            return "redirect:/cliente?success=" + mensaje;
        } catch (IllegalArgumentException e) {
            model.addAttribute("titulo", esModificacionReal ? "Modificar Cliente" : "Registrar Cliente");
            model.addAttribute("cliente", cliente);
            model.addAttribute("esModificacion", esModificacionReal);
            model.addAttribute("error", e.getMessage());
            return "cliente-form";
        } catch (Exception e) {
            model.addAttribute("titulo", esModificacionReal ? "Modificar Cliente" : "Registrar Cliente");
            model.addAttribute("cliente", cliente);
            model.addAttribute("esModificacion", esModificacionReal);
            model.addAttribute("error", "Error interno del servidor: " + e.getMessage());
            return "cliente-form";
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
            sCliente.validarCorreo(cliente.getCorreo());
        } catch (IllegalArgumentException e) {
            errores.put("errorCorreo", e.getMessage());
        }

        try {
            sCliente.validarFechaRegistro(cliente.getFechaRegistro());
        } catch (IllegalArgumentException e) {
            errores.put("errorFecha", e.getMessage());
        }

        return errores;
    }

}
