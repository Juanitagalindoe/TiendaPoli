package ejercicio.parcial.Service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ejercicio.parcial.Models.DAO.Interface.IProducto;
import ejercicio.parcial.Models.DAO.Interface.IDetalle;
import ejercicio.parcial.Models.Entity.Producto;
import ejercicio.parcial.Models.Entity.Detalle;

@Service
public class productoService {
    @Autowired
    private IProducto producto;
    
    @Autowired
    private IDetalle detalle;

    public productoService() {
    }

    public productoService(IProducto producto) {
        this.producto = producto;
    }
    
    public productoService(IProducto producto, IDetalle detalle) {
        this.producto = producto;
        this.detalle = detalle;
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
        if (articulo == null) {
            throw new IllegalArgumentException("Producto no encontrado: " + id);
        }
        
        // Verificar si el producto está en uso en facturas
        if (esProductoEnUso(id)) {
            List<Integer> facturasConProducto = obtenerFacturasConProducto(id);
            String mensajeFacturas = facturasConProducto.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(", "));
            
            throw new IllegalArgumentException(
                "No se puede eliminar el producto '" + articulo.getNombre() + 
                "' porque está siendo usado en las siguientes facturas: " + mensajeFacturas + 
                ". Debe eliminar primero estas facturas."
            );
        }
        
        producto.delete(articulo.getId());
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
    
    /**
     * Verifica si un producto está siendo usado en facturas
     * @param productoId ID del producto a verificar
     * @return true si el producto está en uso, false en caso contrario
     */
    public boolean esProductoEnUso(int productoId) {
        List<Detalle> detallesConProducto = detalle.findAll().stream()
            .filter(d -> d.getProducto() != null && d.getProducto().getId() == productoId)
            .collect(Collectors.toList());
        return !detallesConProducto.isEmpty();
    }
    
    /**
     * Obtiene la lista de números de factura donde se usa un producto
     * @param productoId ID del producto
     * @return Lista de números de factura
     */
    public List<Integer> obtenerFacturasConProducto(int productoId) {
        return detalle.findAll().stream()
            .filter(d -> d.getProducto() != null && d.getProducto().getId() == productoId)
            .map(d -> d.getNroVenta())
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }
}
