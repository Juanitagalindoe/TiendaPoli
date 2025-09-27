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

import ejercicio.parcial.Models.Entity.Producto;
import ejercicio.parcial.Service.productoService;

@Controller
@RequestMapping("/producto")
public class productoController {

    // Inyección de dependencia del servicio
    @Autowired
    private productoService sProducto;

    // Constructor para la inyección de dependencia
    public productoController(productoService sProducto) {
        this.sProducto = sProducto;
    }

    // Mapeo para la página principal
    @GetMapping()
    public String listar(Model model) {
        List<Producto> productos = sProducto.listarProductos();
        System.out.println("Número de productos encontrados: " + (productos != null ? productos.size() : "null"));
        model.addAttribute("titulo", "Listado de Productos");
        model.addAttribute("productos", productos);
        model.addAttribute("producto", new Producto()); // objeto vacío cargado en el formulario y modal de eliminación
        return "producto";
    }

    // Mapeo para registrar un nuevo producto
    @GetMapping("/registrar")
    public String nuevoProducto(Model model) {
        model.addAttribute("titulo", "Registrar Producto");
        model.addAttribute("producto", new Producto());
        model.addAttribute("esModificacion", false); // Indicador para nuevo registro
        return "form/fproducto";
    }

    // Mapeo para modificar un producto existente según su ID
    @GetMapping("/modificar/{id}")
    public String ModificarProducto(@PathVariable("id") int id, Model model) {
        try {
            Producto producto = sProducto.buscarProducto(id);
            if (producto == null) {
                // Si no se encuentra el producto, redirigir con mensaje de error
                model.addAttribute("error", "Producto no encontrado con ID: " + id);
                return "redirect:/producto?error=Producto no encontrado";
            }
            model.addAttribute("titulo", "Modificar Producto");
            model.addAttribute("producto", producto);
            model.addAttribute("esModificacion", true); // Indicador para modificación
            return "form/fproducto";
        } catch (Exception e) {
            // Manejar cualquier error inesperado
            System.err.println("Error al buscar producto con ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return "redirect:/producto?error=Error al buscar el producto";
        }
    }

    @PostMapping("/eliminar")
    public String eliminar(@RequestParam int id) {
        try {
            sProducto.eliminarProducto(id);
            return "redirect:/producto?success=Producto eliminado correctamente";
        } catch (IllegalArgumentException e) {
            return "redirect:/producto?error=Error al eliminar producto: " + e.getMessage();
        } catch (Exception e) {
            return "redirect:/producto?error=Error interno del servidor";
        }
    }

    // Mapeo para guardar un producto (nuevo o modificado)
    @PostMapping("/guardar")
    public String guardarProducto(@ModelAttribute Producto producto,
            @RequestParam(value = "esModificacion", defaultValue = "false") boolean esModificacion,
            Model model) {
        try {
            // Validar cada campo individualmente para capturar errores específicos
            Map<String, String> errores = validarCamposIndividualmente(producto);

            if (!errores.isEmpty()) {
                // Si hay errores, agregar cada uno al modelo
                model.addAllAttributes(errores);
                model.addAttribute("titulo", esModificacion ? "Modificar Producto" : "Registrar Producto");
                model.addAttribute("producto", producto);
                model.addAttribute("esModificacion", esModificacion);
                return "form/fproducto";
            }

            sProducto.guardarProducto(producto);
            return "redirect:/producto"; // Redirigir a la lista de productos
        } catch (IllegalArgumentException e) {
            model.addAttribute("titulo", esModificacion ? "Modificar Producto" : "Registrar Producto");
            model.addAttribute("producto", producto);
            model.addAttribute("esModificacion", esModificacion);
            model.addAttribute("error", e.getMessage());
            return "form/fproducto";
        } catch (Exception e) {
            model.addAttribute("titulo", esModificacion ? "Modificar Producto" : "Registrar Producto");
            model.addAttribute("producto", producto);
            model.addAttribute("esModificacion", esModificacion);
            model.addAttribute("error", "Error interno del servidor: " + e.getMessage());
            return "form/fproducto";
        }
    }

    // Método auxiliar para validar campos individualmente
    private Map<String, String> validarCamposIndividualmente(Producto producto) {
        Map<String, String> errores = new HashMap<>();

        try {
            sProducto.validarNombre(producto.getNombre());
        } catch (IllegalArgumentException e) {
            errores.put("errorNombre", e.getMessage());
        }

        try {
            sProducto.validarDescripcion(producto.getDescripcion());
        } catch (IllegalArgumentException e) {
            errores.put("errorDescripcion", e.getMessage());
        }
        try {
            sProducto.validarValorUnitario(producto.getVlrUnit());
        } catch (IllegalArgumentException e) {
            errores.put("errorVlrUnit", e.getMessage());
        }
        try {
            sProducto.validarStock(producto.getStock());
        } catch (IllegalArgumentException e) {
            errores.put("errorStock", e.getMessage());
        }
        return errores;
    }

}
