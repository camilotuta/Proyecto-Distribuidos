package co.edu.tienda.domain.repositories;

import co.edu.tienda.domain.entities.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {

        // Buscar ventas por persona
        @Query("SELECT v FROM Venta v WHERE v.persona.pId = ?1")
        List<Venta> findByPersona_PId(Integer personaId);

        // Consulta personalizada: ventas por persona con detalles completos
        @Query("SELECT DISTINCT v FROM Venta v " +
                        "LEFT JOIN FETCH v.detalles d " +
                        "LEFT JOIN FETCH d.producto " +
                        "LEFT JOIN FETCH v.persona " +
                        "LEFT JOIN FETCH v.puntoDeVenta pv " +
                        "LEFT JOIN FETCH pv.ubicacion " +
                        "WHERE v.persona.pId = :personaId " +
                        "ORDER BY v.vFecha DESC")
        List<Venta> findVentasConDetallesPorPersona(@Param("personaId") Integer personaId);

        // Todas las ventas con sus relaciones cargadas (INCLUYENDO DETALLES)
        @Query("SELECT DISTINCT v FROM Venta v " +
                        "LEFT JOIN FETCH v.detalles d " +
                        "LEFT JOIN FETCH d.producto " +
                        "LEFT JOIN FETCH v.persona " +
                        "LEFT JOIN FETCH v.puntoDeVenta pv " +
                        "LEFT JOIN FETCH pv.ubicacion " +
                        "ORDER BY v.vFecha DESC")
        List<Venta> findAllConDetalles();
}