package co.edu.tienda.domain.repositories;

import co.edu.tienda.domain.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    // Método personalizado: buscar productos con stock bajo
    @Query("SELECT p FROM Producto p WHERE p.pStock < ?1")
    List<Producto> findByPStockLessThan(Integer stock);

    // Consulta personalizada: cantidad vendida por producto
    @Query("SELECT p.pId, p.pNombre, COALESCE(SUM(vd.vdCantidad), 0) as totalVendido " +
            "FROM Producto p LEFT JOIN VentaDetalle vd ON p.pId = vd.producto.pId " +
            "GROUP BY p.pId, p.pNombre " +
            "ORDER BY totalVendido DESC")
    List<Object[]> findCantidadVendidaPorProducto();
}