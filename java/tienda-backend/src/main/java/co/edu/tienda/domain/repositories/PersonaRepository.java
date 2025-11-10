package co.edu.tienda.domain.repositories;

import co.edu.tienda.domain.entities.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Integer> {

    // Método con @Query explícita para evitar problemas de naming
    @Query("SELECT p FROM Persona p WHERE p.pEmail = :email")
    Optional<Persona> findByEmail(@Param("email") String email);

    // Spring Data JPA ya proporciona automáticamente:
    // - findAll()
    // - findById()
    // - save()
    // - delete()
    // - deleteById()
    // - existsById()
}