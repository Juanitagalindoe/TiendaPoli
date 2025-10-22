package ejercicio.parcial.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ejercicio.parcial.Models.DAO.Interface.IDetalle;
import ejercicio.parcial.Models.Entity.Detalle;
import ejercicio.parcial.Models.Entity.Encabezado;
import ejercicio.parcial.Models.Entity.Producto;

@Service
public class detalleService {
    @Autowired
    private IDetalle detalle;
    
    @Autowired
    private productoService sProducto;

    public detalleService() {
    }

    public detalleService(IDetalle detalle) {
        this.detalle = detalle;
    }

    public List<Detalle> listarDetalles() {
        return detalle.findAll();
    }

    @Transactional
    public Detalle guardarDetalle(Detalle d) {
        // Validar datos antes de guardar
        validarDetalle(d);
        
        // Para detalles, siempre vamos a considerar que es una nueva venta
        // ya que cada detalle representa una línea de producto vendido
        if (d.getProducto() != null && d.getCantidad() > 0) {
            System.out.println("🛒 Procesando venta - Producto: " + d.getProducto().getNombre() + 
                             ", Cantidad: " + d.getCantidad());
            
            // Actualizar el stock (esto validará internamente si hay suficiente stock)
            sProducto.actualizarStock(d.getProducto().getId(), d.getCantidad());
        }
        
        return detalle.save(d);
    }

    public Detalle buscarDetalle(int id) {
        return detalle.findById(id);
    }

    @Transactional
    public void eliminarDetalle(int id) {
        Detalle item = detalle.findById(id);
        if (item != null) {
            // Restaurar el stock antes de eliminar el detalle
            if (item.getProducto() != null && item.getCantidad() > 0) {
                System.out.println("🔄 Restaurando stock por eliminación - Producto: " + item.getProducto().getNombre() + 
                                 ", Cantidad: " + item.getCantidad());
                
                sProducto.restaurarStock(item.getProducto().getId(), item.getCantidad());
            }
            
            detalle.delete(id);
        } else {
            throw new IllegalArgumentException("Detalle no encontrado: " + id);
        }
    }

    // Método específico para eliminar por clave compuesta
    @Transactional
    public void eliminarDetallePorClaveCompuesta(int nroVenta, int item) {
        // Buscar el detalle por clave compuesta para restaurar stock
        List<Detalle> detalles = detalle.findByNroVenta(nroVenta).stream()
            .filter(d -> d.getItem() == item)
            .toList();
        
        if (detalles.isEmpty()) {
            throw new IllegalArgumentException("Detalle no encontrado para nroVenta: " + nroVenta + ", item: " + item);
        }
        
        Detalle detalleAEliminar = detalles.get(0);
        
        // Restaurar el stock antes de eliminar
        if (detalleAEliminar.getProducto() != null && detalleAEliminar.getCantidad() > 0) {
            System.out.println("🔄 Restaurando stock por eliminación - Producto: " + 
                             detalleAEliminar.getProducto().getNombre() + ", Cantidad: " + detalleAEliminar.getCantidad());
            sProducto.restaurarStock(detalleAEliminar.getProducto().getId(), detalleAEliminar.getCantidad());
        }
        
        // Eliminar usando el nuevo método del DAO
        detalle.deleteByCompositeKey(nroVenta, item);
    }

    // Método principal de validación
    public void validarDetalle(Detalle detalle) {
        validarEncabezado(detalle.getEncabezado());
        validarProducto(detalle.getProducto());
        validarCantidad(detalle.getCantidad());
        validarSubtotal(detalle.getSubtotal());
        validarDescuento(detalle.getDcto());
        validarValorTotal(detalle.getVlrTotal());
    }

    // Validación del encabezado: debe existir
    public void validarEncabezado(Encabezado encabezado) {
        if (encabezado == null || encabezado.getNroVenta() == 0) {
            throw new IllegalArgumentException("Debe estar asociado a una factura válida");
        }
    }

    // Validación del producto: debe existir
    public void validarProducto(Producto producto) {
        if (producto == null || producto.getId() == 0) {
            throw new IllegalArgumentException("Debe seleccionar un producto válido");
        }
    }

    // Validación de la cantidad: debe ser positiva
    public void validarCantidad(int cantidad) {
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
        }
    }

    // Validación del subtotal: debe ser positivo
    public void validarSubtotal(double subtotal) {
        if (subtotal <= 0) {
            throw new IllegalArgumentException("El subtotal debe ser un valor positivo");
        }
    }

    // Validación del descuento: no puede ser negativo
    public void validarDescuento(double descuento) {
        if (descuento < 0) {
            throw new IllegalArgumentException("El descuento no puede ser negativo");
        }
    }

    // Validación del valor total: debe ser positivo
    public void validarValorTotal(double valorTotal) {
        if (valorTotal <= 0) {
            throw new IllegalArgumentException("El valor total debe ser positivo");
        }
    }
}
