package ejercicio.parcial.Models.DAO.Interface;

import java.util.List;

import ejercicio.parcial.Models.Entity.Encabezado;

public interface IEncabezado {
    public List<Encabezado> findAll();
    public Encabezado findById(int id);
    public Encabezado save(Encabezado encabezado);
    public void delete(int id);
}
