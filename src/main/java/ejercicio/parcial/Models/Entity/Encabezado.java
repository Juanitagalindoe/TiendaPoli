package ejercicio.parcial.Models.Entity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "encabezado")
public class Encabezado implements Serializable {
    @Id
    private int NroVenta;
    @ManyToOne
    private Cliente cliente;
    @Temporal(TemporalType.DATE)
    private Date fecha;
    @Temporal(TemporalType.TIME)
    private Date hora;
    private int subtotal;
    private int dcto;
    private int total;
    private String estado = "BORRADOR"; // BORRADOR, FINALIZADA, ANULADA
    @OneToMany(mappedBy = "encabezado", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Detalle> detalles = new ArrayList<>();

    public Encabezado() {
    }

    public Encabezado(int nroVenta, Cliente cliente, Date fecha, Date hora, int subtotal, int dcto,
            int total, List<Detalle> detalles) {
        NroVenta = nroVenta;
        this.cliente = cliente;
        this.fecha = fecha;
        this.hora = hora;
        this.subtotal = subtotal;
        this.dcto = dcto;
        this.total = total;
        this.estado = "BORRADOR";
        this.detalles = detalles;
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

    public int getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(int subtotal) {
        this.subtotal = subtotal;
    }

    public int getDcto() {
        return dcto;
    }

    public void setDcto(int dcto) {
        this.dcto = dcto;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public List<Detalle> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<Detalle> detalles) {
        this.detalles = detalles;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

}