package co.edu.tienda.domain.services;

import co.edu.tienda.domain.entities.Venta;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface VentaService {

    List<Venta> listarTodas();

    Optional<Venta> buscarPorId(Integer id);

    Venta crearVenta(Venta venta);

    List<Venta> buscarVentasPorPersona(Integer personaId);

    List<Map<String, Object>> obtenerVentasPorPersonaConDetalles(Integer personaId);
}