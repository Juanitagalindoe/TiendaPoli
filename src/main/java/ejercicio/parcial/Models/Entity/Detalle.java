package ejercicio.parcial.Models.Entity;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "detalle")
@IdClass(DetalleID.class)
public class Detalle implements Serializable {
    
    @Id
    private int nroVenta;
    
    @Id
    private int item;

    // Relación con Encabezado - se mapea usando nroVenta (solo lectura)
    @ManyToOne
    @JoinColumn(name = "nroVenta", insertable = false, updatable = false)
    private Encabezado encabezado;

    // Relación con Producto - columna separada
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private int cantidad;
    private int subtotal;
    private int dcto; // Revertir a int - los montos son enteros
    private int vlrTotal;

    public Detalle() {
    }

    public Detalle(int nroVenta, int item, Encabezado encabezado, Producto producto, int cantidad) {
        this.nroVenta = nroVenta;
        this.item = item;
        this.encabezado = encabezado;
        this.producto = producto;
        this.cantidad = cantidad;
        this.subtotal = 0;
        this.dcto = 0;
        this.vlrTotal = 0;
    }

    // Constructor que acepta DetalleID para compatibilidad
    public Detalle(DetalleID id, Encabezado encabezado, Producto producto, int cantidad) {
        this(id.getNroVenta(), id.getItem(), encabezado, producto, cantidad);
    }

    // ---- Métodos Getters y Setters ----

    public int getNroVenta() {
        return nroVenta;
    }

    public void setNroVenta(int nroVenta) {
        this.nroVenta = nroVenta;
    }

    public int getItem() {
        return item;
    }

    public void setItem(int item) {
        this.item = item;
    }

    // Método para obtener ID compuesto (compatibilidad)
    public DetalleID getId() {
        return new DetalleID(nroVenta, item);
    }

    public void setId(DetalleID id) {
        if (id != null) {
            this.nroVenta = id.getNroVenta();
            this.item = id.getItem();
        }
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

    public int getVlrTotal() {
        return vlrTotal;
    }

    public void setVlrTotal(int vlrTotal) {
        this.vlrTotal = vlrTotal;
    }

    public Encabezado getEncabezado() {
        return encabezado;
    }

    public void setEncabezado(Encabezado encabezado) {
        this.encabezado = encabezado;
        if (encabezado != null) {
            this.nroVenta = encabezado.getNroVenta();
        }
    }

    // Método toString para debugging
    @Override
    public String toString() {
        return "Detalle{" +
                "nroVenta=" + nroVenta +
                ", item=" + item +
                ", cantidad=" + cantidad +
                ", subtotal=" + subtotal +
                ", dcto=" + dcto +
                ", vlrTotal=" + vlrTotal +
                '}';
    }

    
}
