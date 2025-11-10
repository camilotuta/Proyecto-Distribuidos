package co.edu.tienda.domain.services;

import co.edu.tienda.domain.entities.Producto;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ProductoService {

    List<Producto> listarTodos();

    Optional<Producto> buscarPorId(Integer id);

    Producto guardar(Producto producto);

    Producto actualizar(Integer id, Producto producto);

    void eliminar(Integer id);

    List<Producto> buscarConStockBajo(Integer cantidadMinima);

    List<Map<String, Object>> obtenerCantidadVendidaPorProducto();
}