package co.edu.tienda.domain.services;

import co.edu.tienda.domain.entities.Ubicacion;

import java.util.List;
import java.util.Optional;

public interface UbicacionService {

    List<Ubicacion> listarTodas();

    Optional<Ubicacion> buscarPorId(Integer id);

    Ubicacion guardar(Ubicacion ubicacion);

    Ubicacion actualizar(Integer id, Ubicacion ubicacion);

    void eliminar(Integer id);
}