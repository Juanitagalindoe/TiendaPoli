package ejercicio.parcial.Service;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ejercicio.parcial.Models.DAO.Interface.IProducto;
import ejercicio.parcial.Models.Entity.Producto;

@Service
public class productoService {
    @Autowired
    private IProducto producto;

    public productoService() {
    }

    public productoService(IProducto producto) {
        this.producto = producto;
    }

    public List<Producto> listarProductos() {
        return producto.findAll();
    }

    @Transactional
    public Producto guardarProducto(Producto c) {
        // Validar datos antes de guardar
        validarProducto(c);
        return producto.save(c);
    }

    public Producto buscarProducto(int id) {
        return producto.findById(id);
    }

    @Transactional
    public void eliminarProducto(int id) {
        Producto articulo = producto.findById(id);
        if (articulo != null) {
            producto.delete(articulo.getId());
        } else {
            throw new IllegalArgumentException("producto no encontrado : " + id);
        }
    }

    // Método principal de validación
    public void validarProducto(Producto producto) {
        validarNombre(producto.getNombre());
        validarDescripcion(producto.getDescripcion());
        validarValorUnitario(producto.getVlrUnit());
        validarStock(producto.getStock());

    }

    // Validación del nombre: solo letras, mínimo una palabra
    public void validarNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }

        String nombreTrimmed = nombre.trim();

        // Verificar que solo contenga letras y espacios
        if (!Pattern.matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", nombreTrimmed)) {
            throw new IllegalArgumentException("El nombre debe contener solo letras");
        }

        // Verificar que tenga al menos una palabra (no solo espacios)
        if (nombreTrimmed.replaceAll("\\s+", "").isEmpty()) {
            throw new IllegalArgumentException("El nombre debe contener al menos una palabra válida");
        }
    }

    // Validación del descripcion: solo letras, mínimo una palabra
    public void validarDescripcion(String descripcion) {
        if (descripcion == null || descripcion.trim().isEmpty()) {
            throw new IllegalArgumentException("El descripcion es obligatorio");
        }

        String descripcionTrimmed = descripcion.trim();

        // Verificar que solo contenga letras y espacios
        if (!Pattern.matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", descripcionTrimmed)) {
            throw new IllegalArgumentException("El descripcion debe contener solo letras");
        }

        // Verificar que tenga al menos una palabra (no solo espacios)
        if (descripcionTrimmed.replaceAll("\\s+", "").isEmpty()) {
            throw new IllegalArgumentException("El descripcion debe contener al menos una palabra válida");
        }
    }

    // Validación del valor unitario: debe ser un número positivo
    public void validarValorUnitario(double valorUnitario) {
        if (valorUnitario <= 0) {
            throw new IllegalArgumentException("El valor unitario debe ser un número positivo");
        }
    }
    
    // Validación del stock: no puede ser negativo
    public void validarStock(int stock) {
        if (stock <0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
    }
}
