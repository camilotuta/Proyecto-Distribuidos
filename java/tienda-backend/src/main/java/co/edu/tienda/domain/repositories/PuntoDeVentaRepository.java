package co.edu.tienda.domain.repositories;

import co.edu.tienda.domain.entities.PuntoDeVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PuntoDeVentaRepository extends JpaRepository<PuntoDeVenta, Integer> {
    
    @Query("SELECT pv FROM PuntoDeVenta pv LEFT JOIN FETCH pv.ubicacion")
    List<PuntoDeVenta> findAllWithUbicacion();
    
    @Query("SELECT pv FROM PuntoDeVenta pv LEFT JOIN FETCH pv.ubicacion WHERE pv.pvId = :id")
    Optional<PuntoDeVenta> findByIdWithUbicacion(@Param("id") Integer id);
    
    @Query("SELECT pv FROM PuntoDeVenta pv LEFT JOIN FETCH pv.ubicacion WHERE pv.ubicacion.uId = :uId")
    List<PuntoDeVenta> findByUbicacionId(@Param("uId") Integer uId);
}
