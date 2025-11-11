package co.edu.tienda.domain.services.impl;

import co.edu.tienda.domain.entities.Persona;
import co.edu.tienda.domain.repositories.PersonaRepository;
import co.edu.tienda.domain.services.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PersonaServiceImpl implements PersonaService {

    @Autowired
    private PersonaRepository personaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Persona> listarTodas() {
        return personaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Persona> buscarPorId(Integer id) {
        return personaRepository.findById(id);
    }

    @Override
    public Persona guardar(Persona persona) {
        // Validaciones básicas
        if (persona.getPNombre() == null || persona.getPNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre es obligatorio");
        }
        if (persona.getPApellido() == null || persona.getPApellido().trim().isEmpty()) {
            throw new RuntimeException("El apellido es obligatorio");
        }
        if (persona.getPEmail() == null || persona.getPEmail().trim().isEmpty()) {
            throw new RuntimeException("El email es obligatorio");
        }

        // Validación de email único
        Optional<Persona> existente = personaRepository.findByEmail(persona.getPEmail());
        if (existente.isPresent()) {
            throw new RuntimeException("El email ya está registrado: " + persona.getPEmail());
        }

        return personaRepository.save(persona);
    }

    @Override
    public Persona actualizar(Integer id, Persona persona) {
        Persona personaExistente = personaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con ID: " + id));
        // Actualizar solo los campos no nulos (evitar sobrescribir con null)
        if (persona.getPNombre() != null && !persona.getPNombre().trim().isEmpty()) {
            personaExistente.setPNombre(persona.getPNombre());
        }
        if (persona.getPApellido() != null && !persona.getPApellido().trim().isEmpty()) {
            personaExistente.setPApellido(persona.getPApellido());
        }
        if (persona.getPEmail() != null && !persona.getPEmail().trim().isEmpty()) {
            // verificar correo único si cambia
            if (!personaExistente.getPEmail().equals(persona.getPEmail())) {
                Optional<Persona> existe = personaRepository.findByEmail(persona.getPEmail());
                if (existe.isPresent()) {
                    throw new RuntimeException("El email ya está registrado: " + persona.getPEmail());
                }
                personaExistente.setPEmail(persona.getPEmail());
            }
        }
        if (persona.getPTelefono() != null) {
            personaExistente.setPTelefono(persona.getPTelefono());
        }

        return personaRepository.save(personaExistente);
    }

    @Override
    public void eliminar(Integer id) {
        if (!personaRepository.existsById(id)) {
            throw new RuntimeException("Persona no encontrada con ID: " + id);
        }
        personaRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Persona> buscarPorEmail(String email) {
        // MÉTODO CORREGIDO
        return personaRepository.findByEmail(email);
    }
}