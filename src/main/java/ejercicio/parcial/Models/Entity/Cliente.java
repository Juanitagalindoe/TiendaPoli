package ejercicio.parcial.Models.Entity;

//----librerias de java----
import java.io.Serializable;
import java.util.Date;

//----librerias de spring----
import org.springframework.format.annotation.DateTimeFormat;

//----librerias de jakarta----
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

//---- Definición de la entidad Cliente ----
@Entity
@Table(name = "cliente")
public class Cliente implements Serializable {
    // Definicón de la PK
    @Id
    private String id;
    private String nombre;
    private String apellido;
    private String correo;
    // Formato columna fecha de registro
    @Column(name = "Registro")
    @Temporal(TemporalType.DATE)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date fechaRegistro;

    public Cliente() {
    }

    public Cliente(String id, String nombre, String apellido, String correo, Date fechaRegistro) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.fechaRegistro = fechaRegistro;
    }

    // Métodos get y set

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Date getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(Date fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    /**
     * Método que se ejecuta automáticamente antes de persistir la entidad
     * Solo asigna la fecha de registro para clientes nuevos (sin fecha previa)
     */
    @PrePersist
    protected void Creacion() {
        // Solo establecer la fecha si es un cliente nuevo (fecha null)
        if (this.fechaRegistro == null) {
            this.fechaRegistro = new Date();
        }
        // Si ya existe una fecha, la preservamos (para modificaciones)
    }
}
