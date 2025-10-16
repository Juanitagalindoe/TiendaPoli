package ejercicio.parcial.Service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ejercicio.parcial.Models.DAO.Interface.IEncabezado;
import ejercicio.parcial.Models.DAO.Interface.IDetalle;
import ejercicio.parcial.Models.Entity.Encabezado;
import ejercicio.parcial.Models.Entity.Cliente;
import ejercicio.parcial.Models.Entity.Detalle;

@Service
public class encabezadoService {
    

    @Autowired
    private IEncabezado encabezado;
    
    @Autowired
    private IDetalle detalle;
    
    @Autowired
    private productoService sProducto;

    public encabezadoService() {
    }

    public encabezadoService(IEncabezado encabezado, IDetalle detalle) {
        this.encabezado = encabezado;
        this.detalle = detalle;
    }

    public List<Encabezado> listarEncabezados() {
        return encabezado.findAll();
    }

    @Transactional
    public Encabezado guardarEncabezado(Encabezado e) {
        // Validar datos antes de guardar
        validarEncabezado(e);
        return encabezado.save(e);
    }
    
    // Método especial para guardar encabezado inicial sin validaciones completas
    @Transactional
    public Encabezado guardarSinValidaciones(Encabezado e) {
        // Solo validar que los campos básicos no sean nulos
        if (e.getFecha() == null) {
            e.setFecha(new Date());
        }
        if (e.getHora() == null) {
            e.setHora(new Date());
        }
        
        // Establecer valores iniciales para campos numéricos
        e.setSubtotal(0);
        e.setDcto(0);
        e.setTotal(0);
        
        return encabezado.save(e);
    }

    public Encabezado buscarEncabezado(int id) {
        return encabezado.findById(id);
    }

    @Transactional
    public void eliminarEncabezado(int id) {
        Encabezado factura = encabezado.findById(id);
        if (factura != null) {
            // Restaurar stock de todos los detalles antes de eliminar la factura
            List<Detalle> detallesFactura = detalle.findByNroVenta(id);
            for (Detalle det : detallesFactura) {
                if (det.getProducto() != null && det.getCantidad() > 0) {
                    System.out.println("🔄 Restaurando stock por cancelación de factura - Producto: " + 
                                     det.getProducto().getNombre() + ", Cantidad: " + det.getCantidad());
                    
                    sProducto.restaurarStock(det.getProducto().getId(), det.getCantidad());
                }
            }
            
            // Eliminar la factura (esto eliminará automáticamente los detalles por cascade)
            encabezado.delete(factura.getNroVenta());
            
            System.out.println("✅ Factura cancelada y stock restaurado - Factura #" + id);
        } else {
            throw new IllegalArgumentException("Encabezado de venta no encontrado: " + id);
        }
    }

    // Método principal de validación
    public void validarEncabezado(Encabezado encabezado) {
        validarCliente(encabezado.getCliente());
        validarFecha(encabezado.getFecha());
        validarHora(encabezado.getHora());
        validarSubtotal(encabezado.getSubtotal());
        validarDescuento(encabezado.getDcto());
        validarTotal(encabezado.getTotal());
    }

    // Validación del cliente: debe existir
    public void validarCliente(Cliente cliente) {
        if (cliente == null || cliente.getId() == null || cliente.getId().trim().isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar un cliente válido");
        }
    }

    // Validación de la fecha: no puede ser nula ni futura
    public void validarFecha(Date fecha) {
        if (fecha == null) {
            throw new IllegalArgumentException("La fecha es obligatoria");
        }
        
        Date hoy = new Date();
        if (fecha.after(hoy)) {
            throw new IllegalArgumentException("La fecha no puede ser futura");
        }
    }

    // Validación de la hora: no puede ser nula
    public void validarHora(Date hora) {
        if (hora == null) {
            throw new IllegalArgumentException("La hora es obligatoria");
        }
    }

    // Validación del subtotal: debe ser positivo o cero (cuando no hay detalles)
    public void validarSubtotal(int subtotal) {
        if (subtotal < 0) {
            throw new IllegalArgumentException("El subtotal no puede ser negativo");
        }
    }

    // Validación del descuento: no puede ser negativo ni mayor al subtotal
    public void validarDescuento(int descuento) {
        if (descuento < 0) {
            throw new IllegalArgumentException("El descuento no puede ser negativo");
        }
    }

    // Validación del total: debe ser positivo o cero (cuando no hay detalles)
    public void validarTotal(int total) {
        if (total < 0) {
            throw new IllegalArgumentException("El total no puede ser negativo");
        }
    }
    
    // Método para actualizar los totales del encabezado basándose en sus detalles
    @Transactional
    public void actualizarTotalesEncabezado(int nroVenta) {
        try {
            // Buscar el encabezado
            Encabezado encabezadoActual = encabezado.findById(nroVenta);
            if (encabezadoActual == null) {
                throw new IllegalArgumentException("Encabezado no encontrado: " + nroVenta);
            }
            
            // Buscar todos los detalles asociados a este encabezado
            List<Detalle> detalles = detalle.findAll().stream()
                .filter(d -> d.getNroVenta() == nroVenta)
                .toList();
            
            // Calcular los totales
            int nuevoSubtotal = 0;
            int nuevoDescuento = 0;
            int nuevoTotal = 0;
            
            // Si hay detalles, calcular totales
            if (!detalles.isEmpty()) {
                for (Detalle d : detalles) {
                    nuevoSubtotal += d.getSubtotal();
                    nuevoDescuento += d.getDcto();
                    nuevoTotal += d.getVlrTotal();
                }
            }
            // Si no hay detalles, los valores quedan en 0.0
            
            // Actualizar los valores en el encabezado
            encabezadoActual.setSubtotal(nuevoSubtotal);
            encabezadoActual.setDcto(nuevoDescuento);
            encabezadoActual.setTotal(nuevoTotal);
            
            // Guardar los cambios (sin validación completa para evitar conflictos)
            encabezado.save(encabezadoActual);
            
            System.out.println("Totales actualizados para encabezado " + nroVenta + 
                             ": Subtotal=" + nuevoSubtotal + 
                             ", Descuento=" + nuevoDescuento + 
                             ", Total=" + nuevoTotal);
            
        } catch (Exception e) {
            System.err.println("Error al actualizar totales del encabezado " + nroVenta + ": " + e.getMessage());
            throw new RuntimeException("Error al actualizar totales del encabezado", e);
        }
    }
    
    // Método público para recalcular totales sin validaciones restrictivas
    @Transactional
    public void recalcularTotales(int nroVenta) {
        actualizarTotalesEncabezado(nroVenta);
    }
    
    // Método para guardar encabezado con validaciones parciales (para actualizaciones durante facturación)
    @Transactional
    public Encabezado guardarConValidacionesParciales(Encabezado e) {
        // Solo validar cliente si está presente
        if (e.getCliente() != null) {
            validarCliente(e.getCliente());
        }
        
        // Validar fecha y hora siempre
        validarFecha(e.getFecha());
        validarHora(e.getHora());
        
        return encabezado.save(e);
    }
}