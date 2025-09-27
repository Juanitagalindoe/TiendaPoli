package ejercicio.parcial.Models.Entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "encabezado")
public class Encabezado implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int NroVenta;
    @ManyToOne
    private Cliente cliente;
    @Temporal(TemporalType.DATE)
    private Date fecha;
    @Temporal(TemporalType.TIME)
    private Date hora;
    private Double subtotal;
    private Double dcto;
    private Double total;

    public Encabezado() {
    }

    public Encabezado(int nroVenta, Cliente cliente, Date fecha, Date hora, Double subtotal, Double dcto,
            Double total) {
        NroVenta = nroVenta;
        this.cliente = cliente;
        this.fecha = fecha;
        this.hora = hora;
        this.subtotal = subtotal;
        this.dcto = dcto;
        this.total = total;
    }

    // Métodos Getters y Setters

    public int getNroVenta() {
        return NroVenta;
    }

    public void setNroVenta(int nroVenta) {
        NroVenta = nroVenta;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public Date getHora() {
        return hora;
    }

    public void setHora(Date hora) {
        this.hora = hora;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getDcto() {
        return dcto;
    }

    public void setDcto(Double dcto) {
        this.dcto = dcto;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

}