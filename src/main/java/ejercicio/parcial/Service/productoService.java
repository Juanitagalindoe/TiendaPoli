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

    // ===== MÉTODOS PARA MANEJO DE STOCK =====
    
    /**
     * Actualiza el stock de un producto restando la cantidad vendida
     * @param productoId ID del producto
     * @param cantidadVendida Cantidad a restar del stock
     * @throws IllegalArgumentException si no hay suficiente stock o el producto no existe
     */
    @Transactional
    public void actualizarStock(int productoId, int cantidadVendida) {
        Producto prod = producto.findById(productoId);
        if (prod == null) {
            throw new IllegalArgumentException("Producto no encontrado: " + productoId);
        }
        
        if (cantidadVendida <= 0) {
            throw new IllegalArgumentException("La cantidad vendida debe ser mayor a 0");
        }
        
        if (prod.getStock() < cantidadVendida) {
            throw new IllegalArgumentException(
                String.format("Stock insuficiente. Disponible: %d, Solicitado: %d", 
                    prod.getStock(), cantidadVendida)
            );
        }
        
        // Restar la cantidad vendida del stock actual
        prod.setStock(prod.getStock() - cantidadVendida);
        producto.save(prod);
        
        System.out.println(String.format("📦 Stock actualizado - Producto: %s, Stock anterior: %d, Cantidad vendida: %d, Stock actual: %d", 
            prod.getNombre(), prod.getStock() + cantidadVendida, cantidadVendida, prod.getStock()));
    }
    
    /**
     * Restaura el stock de un producto sumando la cantidad devuelta
     * @param productoId ID del producto
     * @param cantidadDevuelta Cantidad a sumar al stock
     */
    @Transactional
    public void restaurarStock(int productoId, int cantidadDevuelta) {
        Producto prod = producto.findById(productoId);
        if (prod == null) {
            throw new IllegalArgumentException("Producto no encontrado: " + productoId);
        }
        
        if (cantidadDevuelta <= 0) {
            throw new IllegalArgumentException("La cantidad a restaurar debe ser mayor a 0");
        }
        
        // Sumar la cantidad devuelta al stock actual
        prod.setStock(prod.getStock() + cantidadDevuelta);
        producto.save(prod);
        
        System.out.println(String.format("🔄 Stock restaurado - Producto: %s, Stock anterior: %d, Cantidad restaurada: %d, Stock actual: %d", 
            prod.getNombre(), prod.getStock() - cantidadDevuelta, cantidadDevuelta, prod.getStock()));
    }
    
    /**
     * Verifica si hay suficiente stock para una venta
     * @param productoId ID del producto
     * @param cantidadSolicitada Cantidad solicitada
     * @return true si hay suficiente stock, false en caso contrario
     */
    public boolean verificarStockDisponible(int productoId, int cantidadSolicitada) {
        Producto prod = producto.findById(productoId);
        if (prod == null) {
            return false;
        }
        return prod.getStock() >= cantidadSolicitada;
    }
}
