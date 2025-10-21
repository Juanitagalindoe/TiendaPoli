package ejercicio.parcial.Models.DAO.Implementacion;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import ejercicio.parcial.Models.DAO.Interface.IEncabezado;
import ejercicio.parcial.Models.Entity.Encabezado;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class EncabezadoDAO implements IEncabezado {

    // Inyección de la dependencia EntityManager
    @PersistenceContext
    private EntityManager eM;

    // Annotación para manejar transacciones
    // Modo lectura para consultas
    @Transactional(readOnly = true)
    @Override
    public List<Encabezado> findAll() {
        return eM.createQuery("SELECT e FROM Encabezado e", Encabezado.class).getResultList();
    }

    @Override
    public Encabezado findById(int id) {
        return eM.find(Encabezado.class, id);
    }

    @Transactional
    @Override
    public Encabezado save(Encabezado encabezado) {
        if (encabezado.getNroVenta() == 0) {
            // Nueva entidad - usar persist
            eM.persist(encabezado);
            return encabezado;
        } else {
            // Entidad existente - usar merge para manejar detached entities
            return eM.merge(encabezado);
        }
    }

    @Transactional
    @Override
    public void delete(int id) {
        Encabezado encabezado = eM.find(Encabezado.class, id);
        if (encabezado != null) {
            eM.remove(encabezado);
        }
    }
}
