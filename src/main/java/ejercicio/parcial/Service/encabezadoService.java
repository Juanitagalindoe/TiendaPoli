package ejercicio.parcial.Service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ejercicio.parcial.Models.DAO.Interface.IEncabezado;
import ejercicio.parcial.Models.Entity.Encabezado;
import ejercicio.parcial.Models.Entity.Cliente;

@Service
public class encabezadoService {
    @Autowired
    private IEncabezado encabezado;

    public encabezadoService() {
    }

    public encabezadoService(IEncabezado encabezado) {
        this.encabezado = encabezado;
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

    public Encabezado buscarEncabezado(int id) {
        return encabezado.findById(id);
    }

    @Transactional
    public void eliminarEncabezado(int id) {
        Encabezado factura = encabezado.findById(id);
        if (factura != null) {
            encabezado.delete(factura.getNroVenta());
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

    // Validación del subtotal: debe ser positivo
    public void validarSubtotal(Double subtotal) {
        if (subtotal == null || subtotal <= 0) {
            throw new IllegalArgumentException("El subtotal debe ser un valor positivo");
        }
    }

    // Validación del descuento: no puede ser negativo ni mayor al subtotal
    public void validarDescuento(Double descuento) {
        if (descuento == null) {
            descuento = 0.0;
        }
        if (descuento < 0) {
            throw new IllegalArgumentException("El descuento no puede ser negativo");
        }
    }

    // Validación del total: debe ser positivo
    public void validarTotal(Double total) {
        if (total == null || total <= 0) {
            throw new IllegalArgumentException("El total debe ser un valor positivo");
        }
    }
}