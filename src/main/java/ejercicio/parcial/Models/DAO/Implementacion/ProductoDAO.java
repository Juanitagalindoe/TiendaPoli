package ejercicio.parcial.Models.DAO.Implementacion;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import ejercicio.parcial.Models.DAO.Interface.IProducto;
import ejercicio.parcial.Models.Entity.Producto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class ProductoDAO implements IProducto {

    // Inyección de la dependencia EntityManager
    @PersistenceContext
    private EntityManager eM;

    // Annotación para manejar transacciones
    // Modo lectura para consultas
    @Transactional(readOnly = true)
    @Override
    public List<Producto> findAll() {
        return eM.createQuery("SELECT e FROM Producto e", Producto.class).getResultList();
    }

    @Override
    public Producto findById(int id) {
        return eM.find(Producto.class, id);
    }

    @Transactional
    @Override
    public Producto save(Producto Producto) {
        eM.persist(Producto);
        return Producto;
    }

    @Transactional
    @Override
    public void delete(int id) {
        Producto Producto = eM.find(Producto.class, id);
        if (Producto != null) {
            eM.remove(Producto);
        }
    }
}
