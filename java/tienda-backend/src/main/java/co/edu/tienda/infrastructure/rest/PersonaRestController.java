package co.edu.tienda.infrastructure.rest;

import co.edu.tienda.domain.entities.Persona;
import co.edu.tienda.domain.services.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/personas")
public class PersonaRestController {

    @Autowired
    private PersonaService personaService;

    // GET /api/personas - Listar todas las personas
    @GetMapping
    public ResponseEntity<List<Persona>> listarTodas() {
        List<Persona> personas = personaService.listarTodas();
        return ResponseEntity.ok(personas);
    }

    // GET /api/personas/{id} - Buscar persona por ID
    @GetMapping("/{id}")
    public ResponseEntity<Persona> buscarPorId(@PathVariable Integer id) {
        Optional<Persona> persona = personaService.buscarPorId(id);
        return persona.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/personas - Crear nueva persona
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Persona persona) {
        try {
            Persona personaGuardada = personaService.guardar(persona);
            return ResponseEntity.status(HttpStatus.CREATED).body(personaGuardada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/personas/{id} - Actualizar persona
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Persona persona) {
        try {
            Persona personaActualizada = personaService.actualizar(id, persona);
            return ResponseEntity.ok(personaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/personas/{id} - Eliminar persona
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            personaService.eliminar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Persona eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/personas/email/{email} - Buscar por email
    @GetMapping("/email/{email}")
    public ResponseEntity<Persona> buscarPorEmail(@PathVariable String email) {
        Optional<Persona> persona = personaService.buscarPorEmail(email);
        return persona.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}