package co.edu.tienda.domain.services;

import co.edu.tienda.domain.entities.Persona;

import java.util.List;
import java.util.Optional;

public interface PersonaService {

    List<Persona> listarTodas();

    Optional<Persona> buscarPorId(Integer id);

    Persona guardar(Persona persona);

    Persona actualizar(Integer id, Persona persona);

    void eliminar(Integer id);

    Optional<Persona> buscarPorEmail(String email);
}