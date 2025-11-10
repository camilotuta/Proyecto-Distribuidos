package co.edu.tienda.infrastructure.rest;

import co.edu.tienda.domain.entities.Producto;
import co.edu.tienda.domain.services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/productos")
public class ProductoRestController {

    @Autowired
    private ProductoService productoService;

    // GET /api/productos - Listar todos los productos
    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        List<Producto> productos = productoService.listarTodos();
        return ResponseEntity.ok(productos);
    }

    // GET /api/productos/{id} - Buscar producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscarPorId(@PathVariable Integer id) {
        Optional<Producto> producto = productoService.buscarPorId(id);
        return producto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/productos - Crear nuevo producto
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Producto producto) {
        try {
            Producto productoGuardado = productoService.guardar(producto);
            return ResponseEntity.status(HttpStatus.CREATED).body(productoGuardado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/productos/{id} - Actualizar producto
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Producto producto) {
        try {
            Producto productoActualizado = productoService.actualizar(id, producto);
            return ResponseEntity.ok(productoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/productos/{id} - Eliminar producto
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            productoService.eliminar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/productos/stock-bajo/{cantidad} - Productos con stock bajo
    @GetMapping("/stock-bajo/{cantidad}")
    public ResponseEntity<List<Producto>> buscarStockBajo(@PathVariable Integer cantidad) {
        List<Producto> productos = productoService.buscarConStockBajo(cantidad);
        return ResponseEntity.ok(productos);
    }

    // GET /api/productos/cantidad-vendida - Cantidad vendida por producto
    @GetMapping("/cantidad-vendida")
    public ResponseEntity<List<Map<String, Object>>> obtenerCantidadVendida() {
        List<Map<String, Object>> resultado = productoService.obtenerCantidadVendidaPorProducto();
        return ResponseEntity.ok(resultado);
    }
}