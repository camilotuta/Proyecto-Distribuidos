package co.edu.tienda.infrastructure.rest;

import co.edu.tienda.domain.entities.Venta;
import co.edu.tienda.domain.services.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ventas")
public class VentaRestController {

    @Autowired
    private VentaService ventaService;

    // GET /api/ventas - Listar todas las ventas
    @GetMapping
    public ResponseEntity<List<Venta>> listarTodas() {
        List<Venta> ventas = ventaService.listarTodas();
        return ResponseEntity.ok(ventas);
    }

    // GET /api/ventas/{id} - Buscar venta por ID
    @GetMapping("/{id}")
    public ResponseEntity<Venta> buscarPorId(@PathVariable Integer id) {
        Optional<Venta> venta = ventaService.buscarPorId(id);
        return venta.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/ventas - Crear nueva venta
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Venta venta) {
        try {
            Venta ventaGuardada = ventaService.crearVenta(venta);
            return ResponseEntity.status(HttpStatus.CREATED).body(ventaGuardada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/ventas/persona/{personaId} - Ventas por persona
    @GetMapping("/persona/{personaId}")
    public ResponseEntity<List<Venta>> buscarPorPersona(@PathVariable Integer personaId) {
        List<Venta> ventas = ventaService.buscarVentasPorPersona(personaId);
        return ResponseEntity.ok(ventas);
    }

    // GET /api/ventas/persona/{personaId}/detalles - Ventas con detalles completos
    @GetMapping("/persona/{personaId}/detalles")
    public ResponseEntity<List<Map<String, Object>>> obtenerConDetalles(@PathVariable Integer personaId) {
        List<Map<String, Object>> ventas = ventaService.obtenerVentasPorPersonaConDetalles(personaId);
        return ResponseEntity.ok(ventas);
    }
}