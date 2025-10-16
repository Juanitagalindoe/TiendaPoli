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
            System.out.println("🔍 DEBUG: Buscando cliente con ID: " + id);
            Cliente cliente = sCliente.buscarCliente(id);
            if (cliente == null) {
                System.out.println("❌ DEBUG: Cliente no encontrado con ID: " + id);
                // Si no se encuentra el cliente, redirigir con mensaje de error
                model.addAttribute("error", "El cliente con Nro de ID " + id + " no fue encontrado.");
                return "redirect:/cliente?error=Cliente no encontrado";
            }
            System.out.println("✅ DEBUG: Cliente encontrado - ID: " + cliente.getId() + 
                             ", Nombre: " + cliente.getNombre() + " " + cliente.getApellido());
            model.addAttribute("titulo", "Modificar Cliente");
            model.addAttribute("cliente", cliente);
            model.addAttribute("esModificacion", true); // Indicador para modificación
            return "cliente-form";
        } catch (Exception e) {
            // Manejar cualquier error inesperado
            System.err.println("⚠️ Error al buscar cliente con Nro de ID  " + id + ": " + e.getMessage());
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
        System.out.println("🔍 DEBUG GUARDAR: Iniciando proceso de guardado");
        System.out.println("🔍 DEBUG GUARDAR: esModificacion = " + esModificacion);
        System.out.println("🔍 DEBUG GUARDAR: Cliente ID = " + cliente.getId());
        System.out.println("🔍 DEBUG GUARDAR: Cliente Nombre = " + cliente.getNombre());
        System.out.println("🔍 DEBUG GUARDAR: Cliente Apellido = " + cliente.getApellido());
        System.out.println("🔍 DEBUG GUARDAR: Cliente Correo = " + cliente.getCorreo());
        System.out.println("🔍 DEBUG GUARDAR: Cliente Fecha = " + cliente.getFechaRegistro());
        
        // Determinar si es modificación basándose en el parámetro del formulario
        // No verificar automáticamente la existencia para evitar confusión
        boolean esModificacionReal = esModificacion;
        Cliente clienteExistente = null;
        try {
            // Solo buscar el cliente existente si es una modificación declarada
            if (esModificacionReal && cliente.getId() != null && !cliente.getId().trim().isEmpty()) {
                clienteExistente = sCliente.buscarCliente(cliente.getId());
            }

            // Si es una modificación, preservar la fecha de registro original
            if (esModificacionReal && clienteExistente != null) {
                if (clienteExistente.getFechaRegistro() != null) {
                    cliente.setFechaRegistro(clienteExistente.getFechaRegistro());
                }
            } else if (!esModificacionReal) {
                // Si es un cliente nuevo y no tiene fecha, asignar fecha actual del servidor
                if (cliente.getFechaRegistro() == null) {
                    cliente.setFechaRegistro(new java.util.Date());
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
                    return "cliente-form";
                }
            }

            // Validar cada campo individualmente para capturar errores específicos
            System.out.println("🔍 DEBUG GUARDAR: Iniciando validaciones...");
            Map<String, String> errores = validarCamposIndividualmente(cliente);
            System.out.println("🔍 DEBUG GUARDAR: Validaciones completadas. Errores encontrados: " + errores.size());
            
            if (!errores.isEmpty()) {
                System.out.println("❌ DEBUG GUARDAR: Errores de validación encontrados:");
                errores.forEach((key, value) -> System.out.println("  - " + key + ": " + value));
                model.addAllAttributes(errores);
                model.addAttribute("titulo", esModificacionReal ? "Modificar Cliente" : "Registrar Cliente");
                model.addAttribute("cliente", cliente);
                model.addAttribute("esModificacion", esModificacionReal);
                return "cliente-form";
            }

            System.out.println("✅ DEBUG GUARDAR: Validaciones pasadas, intentando guardar cliente...");
            System.out.println("🔍 DEBUG GUARDAR: Cliente antes de guardar - ID: " + cliente.getId() + 
                             ", Nombre: " + cliente.getNombre() + " " + cliente.getApellido() + 
                             ", Correo: " + cliente.getCorreo());
            
            Cliente clienteGuardado = sCliente.guardarCliente(cliente);
            System.out.println("✅ DEBUG GUARDAR: Cliente guardado exitosamente!");
            System.out.println("🔍 DEBUG GUARDAR: Cliente guardado - ID: " + clienteGuardado.getId());
            
            String mensaje = esModificacionReal ? "Cliente modificado correctamente"
                    : "Cliente registrado correctamente";
            return "redirect:/cliente?success=" + mensaje;
        } catch (IllegalArgumentException e) {
            System.err.println("❌ DEBUG GUARDAR: IllegalArgumentException capturada: " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("titulo", esModificacionReal ? "Modificar Cliente" : "Registrar Cliente");
            model.addAttribute("cliente", cliente);
            model.addAttribute("esModificacion", esModificacionReal);
            model.addAttribute("error", e.getMessage());
            return "cliente-form";
        } catch (Exception e) {
            System.err.println("❌ DEBUG GUARDAR: Exception general capturada: " + e.getMessage());
            e.printStackTrace();
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
