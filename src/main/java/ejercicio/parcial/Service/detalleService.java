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
        return detalle.save(d);
    }

    public Detalle buscarDetalle(int id) {
        return detalle.findById(id);
    }

    @Transactional
    public void eliminarDetalle(int id) {
        Detalle item = detalle.findById(id);
        if (item != null) {
            detalle.delete(id);
        } else {
            throw new IllegalArgumentException("Detalle no encontrado: " + id);
        }
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
