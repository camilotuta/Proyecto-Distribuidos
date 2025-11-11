package co.edu.tienda.domain.services;

import co.edu.tienda.domain.entities.PuntoDeVenta;

import java.util.List;
import java.util.Optional;

public interface PuntoDeVentaService {
    
    List<PuntoDeVenta> listarTodos();
    
    Optional<PuntoDeVenta> buscarPorId(Integer id);
    
    PuntoDeVenta guardar(PuntoDeVenta puntoDeVenta);
    
    PuntoDeVenta actualizar(Integer id, PuntoDeVenta puntoDeVenta);
    
    void eliminar(Integer id);
    
    List<PuntoDeVenta> buscarPorUbicacion(Integer uId);
}
