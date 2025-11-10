package co.edu.tienda.domain.services.impl;

import co.edu.tienda.domain.entities.Venta;
import co.edu.tienda.domain.entities.VentaDetalle;
import co.edu.tienda.domain.entities.Producto;
import co.edu.tienda.domain.repositories.VentaRepository;
import co.edu.tienda.domain.repositories.ProductoRepository;
import co.edu.tienda.domain.services.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class VentaServiceImpl implements VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Venta> listarTodas() {
        return ventaRepository.findAllConDetalles();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Venta> buscarPorId(Integer id) {
        return ventaRepository.findById(id);
    }

    @Override
    public Venta crearVenta(Venta venta) {
        // Validar que tenga detalles
        if (venta.getDetalles() == null || venta.getDetalles().isEmpty()) {
            throw new RuntimeException("La venta debe tener al menos un detalle");
        }

        // Validar stock y actualizar inventario
        for (VentaDetalle detalle : venta.getDetalles()) {
            Producto producto = productoRepository.findById(detalle.getProducto().getPId())
                    .orElseThrow(
                            () -> new RuntimeException("Producto no encontrado: " + detalle.getProducto().getPId()));

            // Verificar stock suficiente
            if (producto.getPStock() < detalle.getVdCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getPNombre() +
                        ". Disponible: " + producto.getPStock() +
                        ", Solicitado: " + detalle.getVdCantidad());
            }

            // Actualizar stock
            producto.setPStock(producto.getPStock() - detalle.getVdCantidad());
            productoRepository.save(producto);

            // Asegurar que el detalle tenga referencia a la venta
            detalle.setVenta(venta);
        }

        // Guardar la venta con sus detalles (CASCADE se encarga de los detalles)
        return ventaRepository.save(venta);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> buscarVentasPorPersona(Integer personaId) {
        return ventaRepository.findVentasConDetallesPorPersona(personaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerVentasPorPersonaConDetalles(Integer personaId) {
        List<Venta> ventas = ventaRepository.findVentasConDetallesPorPersona(personaId);
        List<Map<String, Object>> respuesta = new ArrayList<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Venta venta : ventas) {
            Map<String, Object> ventaMap = new HashMap<>();
            ventaMap.put("ventaId", venta.getVId());
            ventaMap.put("fecha", venta.getVFecha().format(formatter));
            ventaMap.put("personaNombre", venta.getPersona().getPNombre() + " " + venta.getPersona().getPApellido());
            ventaMap.put("personaEmail", venta.getPersona().getPEmail());
            ventaMap.put("puntoVenta", venta.getPuntoDeVenta().getPvNombre());
            ventaMap.put("ubicacion", venta.getPuntoDeVenta().getUbicacion().getUNombre());

            respuesta.add(ventaMap);
        }

        return respuesta;
    }
}