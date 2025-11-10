package co.edu.tienda.domain.services.impl;

import co.edu.tienda.domain.entities.Producto;
import co.edu.tienda.domain.repositories.ProductoRepository;
import co.edu.tienda.domain.services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorId(Integer id) {
        return productoRepository.findById(id);
    }

    @Override
    public Producto guardar(Producto producto) {
        // Validaciones
        if (producto.getPPrecio().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("El precio no puede ser negativo");
        }
        if (producto.getPStock() < 0) {
            throw new RuntimeException("El stock no puede ser negativo");
        }
        return productoRepository.save(producto);
    }

    @Override
    public Producto actualizar(Integer id, Producto producto) {
        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        productoExistente.setPNombre(producto.getPNombre());
        productoExistente.setPDescripcion(producto.getPDescripcion());
        productoExistente.setPPrecio(producto.getPPrecio());
        productoExistente.setPStock(producto.getPStock());

        return productoRepository.save(productoExistente);
    }

    @Override
    public void eliminar(Integer id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        productoRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> buscarConStockBajo(Integer cantidadMinima) {
        return productoRepository.findByPStockLessThan(cantidadMinima);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerCantidadVendidaPorProducto() {
        List<Object[]> resultados = productoRepository.findCantidadVendidaPorProducto();
        List<Map<String, Object>> respuesta = new ArrayList<>();

        for (Object[] fila : resultados) {
            Map<String, Object> item = new HashMap<>();
            item.put("productoId", fila[0]);
            item.put("nombreProducto", fila[1]);
            item.put("cantidadVendida", fila[2]);
            respuesta.add(item);
        }

        return respuesta;
    }
}