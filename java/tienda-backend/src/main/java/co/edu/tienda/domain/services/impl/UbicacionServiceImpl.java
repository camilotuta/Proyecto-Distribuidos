package co.edu.tienda.domain.services.impl;

import co.edu.tienda.domain.entities.Ubicacion;
import co.edu.tienda.domain.repositories.UbicacionRepository;
import co.edu.tienda.domain.services.UbicacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UbicacionServiceImpl implements UbicacionService {

    @Autowired
    private UbicacionRepository ubicacionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Ubicacion> listarTodas() {
        return ubicacionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Ubicacion> buscarPorId(Integer id) {
        return ubicacionRepository.findById(id);
    }

    @Override
    public Ubicacion guardar(Ubicacion ubicacion) {
        if (ubicacion.getUNombre() == null || ubicacion.getUNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre de la ubicación es obligatorio");
        }
        return ubicacionRepository.save(ubicacion);
    }

    @Override
    public Ubicacion actualizar(Integer id, Ubicacion ubicacion) {
        Ubicacion ubicacionExistente = ubicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada con ID: " + id));
        if (ubicacion.getUNombre() != null && !ubicacion.getUNombre().trim().isEmpty()) {
            ubicacionExistente.setUNombre(ubicacion.getUNombre());
        }

        return ubicacionRepository.save(ubicacionExistente);
    }

    @Override
    public void eliminar(Integer id) {
        if (!ubicacionRepository.existsById(id)) {
            throw new RuntimeException("Ubicación no encontrada con ID: " + id);
        }
        ubicacionRepository.deleteById(id);
    }
}