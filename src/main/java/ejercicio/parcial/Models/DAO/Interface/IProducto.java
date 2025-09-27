package ejercicio.parcial.Models.DAO.Interface;

import java.util.List;

import ejercicio.parcial.Models.Entity.Producto;

public interface IProducto {
    public List<Producto> findAll();
    public Producto findById(int id);
    public Producto save(Producto producto);
    public void delete(int id);
}
