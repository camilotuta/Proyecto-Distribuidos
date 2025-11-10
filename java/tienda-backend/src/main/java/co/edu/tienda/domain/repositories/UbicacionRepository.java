package co.edu.tienda.domain.repositories;

import co.edu.tienda.domain.entities.Ubicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UbicacionRepository extends JpaRepository<Ubicacion, Integer> {
    // Métodos CRUD básicos heredados de JpaRepository
}