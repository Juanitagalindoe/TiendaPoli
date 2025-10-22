package ejercicio.parcial.Models.DAO.Interface;

import java.util.List;

import ejercicio.parcial.Models.Entity.Detalle;

public interface IDetalle {
    public List<Detalle> findAll();
    public Detalle findById(int id);
    public Detalle save(Detalle detalle);
    public void delete(int id);
    public List<Detalle> findByNroVenta(int nroVenta);
    public void deleteByCompositeKey(int nroVenta, int item);
}
