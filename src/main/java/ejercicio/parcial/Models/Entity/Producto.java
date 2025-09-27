package ejercicio.parcial.Models.Entity;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
@Entity
@Table(name="producto")
public class Producto implements Serializable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nombre;
    private String descripcion;
    private double vlrUnit;
    private int stock;

    public Producto() {
    }

    public Producto(int id, String nombre, String descripcion, double vlrUnit, int stock) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.vlrUnit = vlrUnit;
        this.stock = stock;
    }

    // Métodos Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public double getVlrUnit() {
        return vlrUnit;
    }

    public void setVlrUnit(double vlrUnit) {
        this.vlrUnit = vlrUnit;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    
}
