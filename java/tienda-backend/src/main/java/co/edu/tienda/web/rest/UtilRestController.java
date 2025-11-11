package co.edu.tienda.web.rest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/util")
@CrossOrigin(origins = "*")
public class UtilRestController {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Endpoint temporal para resetear las secuencias de PostgreSQL
     * Usar cuando aparezca error "duplicate key value violates unique constraint"
     */
    @PostMapping("/reset-sequences")
    @Transactional
    public ResponseEntity<Map<String, Object>> resetSequences() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Resetear todas las secuencias
            String[] queries = {
                "SELECT setval(pg_get_serial_sequence('persona', 'p_id'), COALESCE(MAX(p_id), 1), true) FROM persona",
                "SELECT setval(pg_get_serial_sequence('producto', 'p_id'), COALESCE(MAX(p_id), 1), true) FROM producto",
                "SELECT setval(pg_get_serial_sequence('ubicacion', 'u_id'), COALESCE(MAX(u_id), 1), true) FROM ubicacion",
                "SELECT setval(pg_get_serial_sequence('punto_de_venta', 'pv_id'), COALESCE(MAX(pv_id), 1), true) FROM punto_de_venta",
                "SELECT setval(pg_get_serial_sequence('venta', 'v_id'), COALESCE(MAX(v_id), 1), true) FROM venta",
                "SELECT setval(pg_get_serial_sequence('venta_detalle', 'vd_id'), COALESCE(MAX(vd_id), 1), true) FROM venta_detalle"
            };
            
            for (String query : queries) {
                entityManager.createNativeQuery(query).getSingleResult();
            }
            
            // Obtener valores actuales de las secuencias
            Map<String, Long> sequences = new HashMap<>();
            sequences.put("persona", getCurrentSequenceValue("persona", "p_id"));
            sequences.put("producto", getCurrentSequenceValue("producto", "p_id"));
            sequences.put("ubicacion", getCurrentSequenceValue("ubicacion", "u_id"));
            sequences.put("punto_de_venta", getCurrentSequenceValue("punto_de_venta", "pv_id"));
            sequences.put("venta", getCurrentSequenceValue("venta", "v_id"));
            sequences.put("venta_detalle", getCurrentSequenceValue("venta_detalle", "vd_id"));
            
            response.put("success", true);
            response.put("message", "Secuencias reseteadas exitosamente");
            response.put("sequences", sequences);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Endpoint para verificar el estado actual de las secuencias
     */
    @GetMapping("/check-sequences")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> checkSequences() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Long> sequences = new HashMap<>();
            sequences.put("persona", getCurrentSequenceValue("persona", "p_id"));
            sequences.put("producto", getCurrentSequenceValue("producto", "p_id"));
            sequences.put("ubicacion", getCurrentSequenceValue("ubicacion", "u_id"));
            sequences.put("punto_de_venta", getCurrentSequenceValue("punto_de_venta", "pv_id"));
            sequences.put("venta", getCurrentSequenceValue("venta", "v_id"));
            sequences.put("venta_detalle", getCurrentSequenceValue("venta_detalle", "vd_id"));
            
            response.put("success", true);
            response.put("sequences", sequences);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private Long getCurrentSequenceValue(String tableName, String columnName) {
        try {
            String query = String.format(
                "SELECT currval(pg_get_serial_sequence('%s', '%s'))", 
                tableName, columnName
            );
            Object result = entityManager.createNativeQuery(query).getSingleResult();
            return result != null ? ((Number) result).longValue() : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }
}
