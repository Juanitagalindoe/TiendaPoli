package ejercicio.parcial.Models.Entity;

import java.io.Serializable;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "detalle")
public class Detalle implements Serializable {
    @EmbeddedId
    private DetalleID id;

    // Relación con Encabezado
    @MapsId("nroVenta") // indica que usa la PK nroVenta del DetalleID
    @ManyToOne
    @JoinColumn(name = "nroVenta") // columna en la tabla detalle
    private Encabezado encabezado;

    // Relación con Producto
    @ManyToOne(fetch = FetchType.LAZY) // Carga perezosa para optimización
    @JoinColumn(name = "producto")
    private Producto producto;

    private int cantidad;
    private double subtotal;
    private double dcto;
    private double vlrTotal;

    public Detalle() {
    }

    public Detalle(DetalleID id, Encabezado encabezado, Producto producto, int cantidad) {
        this.id = id;
        this.encabezado = encabezado;
        this.producto = producto;
        this.cantidad = cantidad;
        this.subtotal = 0;
        this.dcto = 0;
        this.vlrTotal = 0;
    }

    // ---- Métodos Getters y Setters ----

    public DetalleID getId() {
        return id;
    }

    public void setId(DetalleID id) {
        this.id = id;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public double getDcto() {
        return dcto;
    }

    public void setDcto(double dcto) {
        this.dcto = dcto;
    }

    public double getVlrTotal() {
        return vlrTotal;
    }

    public void setVlrTotal(double vlrTotal) {
        this.vlrTotal = vlrTotal;
    }

    public Encabezado getEncabezado() {
        return encabezado;
    }

    public void setEncabezado(Encabezado encabezado) {
        this.encabezado = encabezado;
    }

    
}
