package ejercicio.parcial.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ejercicio.parcial.Models.DAO.Interface.ICliente;
import ejercicio.parcial.Models.Entity.Cliente;

@Service
public class clienteService {
    @Autowired
    private ICliente cliente;

    public clienteService() {
    }
    
    public clienteService(ICliente cliente) {
        this.cliente = cliente;
    }

    public List<Cliente> listarClientes() {
        return cliente.findAll();
    }

    public Cliente guardarCliente(Cliente c) {
        // Validar datos antes de guardar
        validarCliente(c);
        return cliente.save(c);
    }

    public Cliente buscarCliente(String id) {
        return cliente.findById(id);
    }

    public void eliminarCliente(String id) {
        Cliente persona = cliente.findById(id);
        if (persona != null) {
            cliente.delete(persona.getId());
        } else {
            throw new IllegalArgumentException("Cliente no encontrado : " + id);
        }
    }

    // Método principal de validación
    public void validarCliente(Cliente cliente) {
        validarId(cliente.getId());
        validarNombre(cliente.getNombre());
        validarApellido(cliente.getApellido());
        validarCorreo(cliente.getCorreo());
        validarFechaRegistro(cliente.getFechaRegistro());
    }

    // Validación del ID: número de 6 a 12 dígitos
    public void validarId(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("El ID es obligatorio");
        }
        
        // Verificar que solo contenga dígitos
        if (!Pattern.matches("^\\d+$", id.trim())) {
            throw new IllegalArgumentException("El ID debe contener solo números");
        }
        
        // Verificar longitud entre 6 y 12 dígitos
        String idTrimmed = id.trim();
        if (idTrimmed.length() < 6 || idTrimmed.length() > 12) {
            throw new IllegalArgumentException("El ID debe tener entre 6 y 12 dígitos");
        }
    }

    // Validación del nombre: solo letras, mínimo una palabra
    public void validarNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        
        String nombreTrimmed = nombre.trim();
        
        // Verificar que solo contenga letras y espacios
        if (!Pattern.matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", nombreTrimmed)) {
            throw new IllegalArgumentException("El nombre debe contener solo letras");
        }
        
        // Verificar que tenga al menos una palabra (no solo espacios)
        if (nombreTrimmed.replaceAll("\\s+", "").isEmpty()) {
            throw new IllegalArgumentException("El nombre debe contener al menos una palabra válida");
        }
    }

    // Validación del apellido: solo letras, mínimo una palabra
    public void validarApellido(String apellido) {
        if (apellido == null || apellido.trim().isEmpty()) {
            throw new IllegalArgumentException("El apellido es obligatorio");
        }
        
        String apellidoTrimmed = apellido.trim();
        
        // Verificar que solo contenga letras y espacios
        if (!Pattern.matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", apellidoTrimmed)) {
            throw new IllegalArgumentException("El apellido debe contener solo letras");
        }
        
        // Verificar que tenga al menos una palabra (no solo espacios)
        if (apellidoTrimmed.replaceAll("\\s+", "").isEmpty()) {
            throw new IllegalArgumentException("El apellido debe contener al menos una palabra válida");
        }
    }

    // Validación del correo electrónico: formato válido
    public void validarCorreo(String correo) {
        if (correo == null || correo.trim().isEmpty()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio");
        }
        
        String correoTrimmed = correo.trim();
        
        // Verificar formato de correo electrónico
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        if (!Pattern.matches(emailRegex, correoTrimmed)) {
            throw new IllegalArgumentException("El correo electrónico debe tener un formato válido");
        }
    }

    // Validación de fecha de registro: menor o igual a la actual pero no menor de hace 80 años
    public void validarFechaRegistro(Date fechaRegistro) {
        if (fechaRegistro == null) {
            throw new IllegalArgumentException("La fecha de registro es obligatoria");
        }
        
        // Convertir fechas para comparación
        LocalDate fechaRegistroLocal = fechaRegistro.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate fechaActual = LocalDate.now();
        LocalDate fechaMinima = fechaActual.minusYears(80);
        
        // Verificar que no sea mayor a la fecha actual
        if (fechaRegistroLocal.isAfter(fechaActual)) {
            throw new IllegalArgumentException("La fecha de registro no puede ser mayor a la fecha actual");
        }
        
        // Verificar que no sea menor a hace 80 años
        if (fechaRegistroLocal.isBefore(fechaMinima)) {
            throw new IllegalArgumentException("La fecha de registro no puede ser anterior a hace 80 años");
        }
    }
}
