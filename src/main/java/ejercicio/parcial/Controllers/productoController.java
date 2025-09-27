package ejercicio.parcial.Controllers;

import java.util.List;

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
        return "producto-form";
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
            return "producto-form";
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
    public String guardarProducto(@ModelAttribute Producto producto, Model model) {
        try {
            // Validaciones básicas
            if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
                return "redirect:/producto/registrar?error=El nombre es obligatorio";
            }
            
            if (producto.getDescripcion() == null || producto.getDescripcion().trim().isEmpty()) {
                return "redirect:/producto/registrar?error=La descripción es obligatoria";
            }
            
            if (producto.getVlrUnit() <= 0) {
                return "redirect:/producto/registrar?error=El valor unitario debe ser mayor a 0";
            }
            
            if (producto.getStock() < 0) {
                return "redirect:/producto/registrar?error=El stock no puede ser negativo";
            }

            // Guardar producto
            sProducto.guardarProducto(producto);
            
            String mensaje = (producto.getId() == 0) ? "Producto registrado exitosamente" : "Producto actualizado exitosamente";
            return "redirect:/producto?success=" + mensaje;
            
        } catch (Exception e) {
            String accion = (producto.getId() == 0) ? "registrar" : "modificar/" + producto.getId();
            return "redirect:/producto/" + accion + "?error=Error al guardar el producto: " + e.getMessage();
        }
    }



}
