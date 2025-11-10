package co.edu.tienda.infrastructure.rest;

import co.edu.tienda.domain.entities.Ubicacion;
import co.edu.tienda.domain.services.UbicacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ubicaciones")
public class UbicacionRestController {

    @Autowired
    private UbicacionService ubicacionService;

    // GET /api/ubicaciones - Listar todas las ubicaciones
    @GetMapping
    public ResponseEntity<List<Ubicacion>> listarTodas() {
        List<Ubicacion> ubicaciones = ubicacionService.listarTodas();
        return ResponseEntity.ok(ubicaciones);
    }

    // GET /api/ubicaciones/{id} - Buscar ubicación por ID
    @GetMapping("/{id}")
    public ResponseEntity<Ubicacion> buscarPorId(@PathVariable Integer id) {
        Optional<Ubicacion> ubicacion = ubicacionService.buscarPorId(id);
        return ubicacion.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/ubicaciones - Crear nueva ubicación
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Ubicacion ubicacion) {
        try {
            Ubicacion ubicacionGuardada = ubicacionService.guardar(ubicacion);
            return ResponseEntity.status(HttpStatus.CREATED).body(ubicacionGuardada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/ubicaciones/{id} - Actualizar ubicación
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Ubicacion ubicacion) {
        try {
            Ubicacion ubicacionActualizada = ubicacionService.actualizar(id, ubicacion);
            return ResponseEntity.ok(ubicacionActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/ubicaciones/{id} - Eliminar ubicación
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            ubicacionService.eliminar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Ubicación eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}