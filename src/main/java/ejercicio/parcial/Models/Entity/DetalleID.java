package ejercicio.parcial.Models.Entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class DetalleID implements Serializable {
    private int nroVenta;  
    private int item;      

    public DetalleID() {
    }

    public DetalleID(int nroVenta, int item) {
        this.nroVenta = nroVenta;
        this.item = item;
    }

    // Obligatorio para claves compuestas
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DetalleID)) return false;
        DetalleID that = (DetalleID) o;
        return this.nroVenta == that.nroVenta &&
               this.item == that.item;
    }

    @Override
    public int hashCode() {
        return Objects.hash(nroVenta, item);
    }
    
    // Métodos Getters y Setters

    
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

    
}
