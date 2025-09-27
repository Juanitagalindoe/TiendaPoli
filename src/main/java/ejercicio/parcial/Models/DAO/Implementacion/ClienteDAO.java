package ejercicio.parcial.Models.DAO.Implementacion;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import ejercicio.parcial.Models.DAO.Interface.ICliente;
import ejercicio.parcial.Models.Entity.Cliente;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class ClienteDAO implements ICliente {
    // Inyección de la dependencia EntityManager
    @PersistenceContext
    private EntityManager eM;

    // Annotación para manejar transacciones
    // Modo lectura para consultas
    @SuppressWarnings("unchecked")
    @Transactional(readOnly = true)

    @Override
    public List<Cliente> findAll() {
        return eM.createQuery("from Cliente").getResultList();
    }

    @Override
    @Transactional
    public Cliente findById(String id) {
        return eM.find(Cliente.class, id);
    }

    @Override
    @Transactional
    public Cliente save(Cliente cliente) {
        return eM.merge(cliente);
    }

    @Transactional
    public void delete(Cliente cliente) {
        if (cliente != null) {
            eM.remove(eM.contains(cliente) ? cliente : eM.merge(cliente));
            eM.flush(); // asegura que la eliminación se ejecute inmediatamente
        }
    }

    @Override
    @Transactional
    public void delete(String id) {
        Cliente cliente = findById(id);
        if (cliente != null) {
            delete(cliente);
        }
    }

}
