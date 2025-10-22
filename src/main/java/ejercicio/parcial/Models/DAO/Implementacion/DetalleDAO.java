package ejercicio.parcial.Models.DAO.Implementacion;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import ejercicio.parcial.Models.DAO.Interface.IDetalle;
import ejercicio.parcial.Models.Entity.Detalle;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class DetalleDAO implements IDetalle {

    // Inyección de la dependencia EntityManager
    @PersistenceContext
    private EntityManager eM;

    // Annotación para manejar transacciones
    // Modo lectura para consultas
    @Transactional(readOnly = true)
    @Override
    public List<Detalle> findAll() {
        return eM.createQuery("SELECT e FROM Detalle e", Detalle.class).getResultList();
    }

    @Override
    public Detalle findById(int id) {
        return eM.find(Detalle.class, id);
    }

    @Override
    public Detalle save(Detalle Detalle) {
        // Usar merge() para manejar tanto entidades nuevas como existentes
        return eM.merge(Detalle);
    }

    @Override
    public void delete(int id) {
        Detalle Detalle = eM.find(Detalle.class, id);
        if (Detalle != null) {
            eM.remove(Detalle);
        }
    }

    @Transactional(readOnly = true)
    @Override
    public List<Detalle> findByNroVenta(int nroVenta) {
        return eM.createQuery("SELECT d FROM Detalle d WHERE d.nroVenta = :nroVenta", Detalle.class)
                .setParameter("nroVenta", nroVenta)
                .getResultList();
    }

    // Método específico para eliminar por clave compuesta
    @Transactional
    public void deleteByCompositeKey(int nroVenta, int item) {
        int deletedRows = eM.createQuery("DELETE FROM Detalle d WHERE d.nroVenta = :nroVenta AND d.item = :item")
                .setParameter("nroVenta", nroVenta)
                .setParameter("item", item)
                .executeUpdate();
        
        if (deletedRows == 0) {
            throw new IllegalArgumentException("No se encontró detalle para eliminar con nroVenta: " + nroVenta + ", item: " + item);
        }
        
        System.out.println("✅ Detalle eliminado correctamente - nroVenta: " + nroVenta + ", item: " + item);
    }
}
