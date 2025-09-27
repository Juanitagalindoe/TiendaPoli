package ejercicio.parcial.Models.DAO.Interface;

import java.util.List;

import ejercicio.parcial.Models.Entity.Cliente;

public interface ICliente {    
    public List<Cliente> findAll();
    public Cliente findById(String id);
    public Cliente save(Cliente cliente);
    public void delete(String id);
}
