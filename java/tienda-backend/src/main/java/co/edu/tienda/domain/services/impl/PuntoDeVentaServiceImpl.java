package co.edu.tienda.domain.services.impl;

import co.edu.tienda.domain.entities.PuntoDeVenta;
import co.edu.tienda.domain.entities.Ubicacion;
import co.edu.tienda.domain.repositories.PuntoDeVentaRepository;
import co.edu.tienda.domain.repositories.UbicacionRepository;
import co.edu.tienda.domain.services.PuntoDeVentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PuntoDeVentaServiceImpl implements PuntoDeVentaService {

    @Autowired
    private PuntoDeVentaRepository puntoDeVentaRepository;
    
    @Autowired
    private UbicacionRepository ubicacionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PuntoDeVenta> listarTodos() {
        return puntoDeVentaRepository.findAllWithUbicacion();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PuntoDeVenta> buscarPorId(Integer id) {
        return puntoDeVentaRepository.findByIdWithUbicacion(id);
    }

    @Override
    @Transactional
    public PuntoDeVenta guardar(PuntoDeVenta puntoDeVenta) {
        // Validar que el nombre no esté vacío
        if (puntoDeVenta.getPvNombre() == null || puntoDeVenta.getPvNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del punto de venta es obligatorio");
        }
        
        // Obtener la ubicación
        Integer uId = puntoDeVenta.getUId();
        if (uId == null) {
            throw new RuntimeException("La ubicación es obligatoria");
        }
        
        Ubicacion ubicacion = ubicacionRepository.findById(uId)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada con ID: " + uId));
        
        puntoDeVenta.setUbicacion(ubicacion);
        return puntoDeVentaRepository.save(puntoDeVenta);
    }

    @Override
    @Transactional
    public PuntoDeVenta actualizar(Integer id, PuntoDeVenta puntoDeVenta) {
        PuntoDeVenta existente = puntoDeVentaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Punto de venta no encontrado con ID: " + id));
        // Actualizar solo campos no nulos
        if (puntoDeVenta.getPvNombre() != null && !puntoDeVenta.getPvNombre().trim().isEmpty()) {
            existente.setPvNombre(puntoDeVenta.getPvNombre());
        }
        
    // Actualizar ubicación si se proporciona
        Integer uId = puntoDeVenta.getUId();
        if (uId != null) {
            Ubicacion ubicacion = ubicacionRepository.findById(uId)
                    .orElseThrow(() -> new RuntimeException("Ubicación no encontrada con ID: " + uId));
            existente.setUbicacion(ubicacion);
        }
        
        return puntoDeVentaRepository.save(existente);
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!puntoDeVentaRepository.existsById(id)) {
            throw new RuntimeException("Punto de venta no encontrado con ID: " + id);
        }
        puntoDeVentaRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PuntoDeVenta> buscarPorUbicacion(Integer uId) {
        return puntoDeVentaRepository.findByUbicacionId(uId);
    }
}
