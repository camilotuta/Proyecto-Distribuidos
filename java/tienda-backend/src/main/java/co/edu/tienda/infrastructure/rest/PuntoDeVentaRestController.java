package co.edu.tienda.infrastructure.rest;

import co.edu.tienda.domain.entities.PuntoDeVenta;
import co.edu.tienda.domain.services.PuntoDeVentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/puntos-de-venta")
public class PuntoDeVentaRestController {

    @Autowired
    private PuntoDeVentaService puntoDeVentaService;

    // GET /api/puntos-de-venta - Listar todos los puntos de venta
    @GetMapping
    public ResponseEntity<List<PuntoDeVenta>> listarTodos() {
        List<PuntoDeVenta> puntosDeVenta = puntoDeVentaService.listarTodos();
        return ResponseEntity.ok(puntosDeVenta);
    }

    // GET /api/puntos-de-venta/{id} - Buscar punto de venta por ID
    @GetMapping("/{id}")
    public ResponseEntity<PuntoDeVenta> buscarPorId(@PathVariable Integer id) {
        Optional<PuntoDeVenta> puntoDeVenta = puntoDeVentaService.buscarPorId(id);
        return puntoDeVenta.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/puntos-de-venta - Crear nuevo punto de venta
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody PuntoDeVenta puntoDeVenta) {
        try {
            PuntoDeVenta puntoDeVentaGuardado = puntoDeVentaService.guardar(puntoDeVenta);
            return ResponseEntity.status(HttpStatus.CREATED).body(puntoDeVentaGuardado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/puntos-de-venta/{id} - Actualizar punto de venta
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody PuntoDeVenta puntoDeVenta) {
        try {
            PuntoDeVenta puntoDeVentaActualizado = puntoDeVentaService.actualizar(id, puntoDeVenta);
            return ResponseEntity.ok(puntoDeVentaActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/puntos-de-venta/{id} - Eliminar punto de venta
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            puntoDeVentaService.eliminar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Punto de venta eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/puntos-de-venta/ubicacion/{uId} - Buscar por ubicación
    @GetMapping("/ubicacion/{uId}")
    public ResponseEntity<List<PuntoDeVenta>> buscarPorUbicacion(@PathVariable Integer uId) {
        List<PuntoDeVenta> puntosDeVenta = puntoDeVentaService.buscarPorUbicacion(uId);
        return ResponseEntity.ok(puntosDeVenta);
    }
}
