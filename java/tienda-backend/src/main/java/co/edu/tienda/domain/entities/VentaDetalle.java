package co.edu.tienda.domain.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "VENTA_DETALLE")
public class VentaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VD_ID")
    private Integer vdId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "V_ID", nullable = false)
    @JsonBackReference
    private Venta venta;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "P_ID", nullable = false)
    private Producto producto;

    @Column(name = "VD_CANTIDAD", nullable = false)
    private Integer vdCantidad;

    @Column(name = "VD_PRECIO_UNITARIO", nullable = false, precision = 10, scale = 2)
    private BigDecimal vdPrecioUnitario;

    // Constructor vacío
    public VentaDetalle() {
    }

    // Constructor con parámetros
    public VentaDetalle(Venta venta, Producto producto, Integer vdCantidad, BigDecimal vdPrecioUnitario) {
        this.venta = venta;
        this.producto = producto;
        this.vdCantidad = vdCantidad;
        this.vdPrecioUnitario = vdPrecioUnitario;
    }

    // Getters y Setters normales
    public Integer getVdId() {
        return vdId;
    }

    public void setVdId(Integer vdId) {
        this.vdId = vdId;
    }

    public Venta getVenta() {
        return venta;
    }

    public void setVenta(Venta venta) {
        this.venta = venta;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Integer getVdCantidad() {
        return vdCantidad;
    }

    public void setVdCantidad(Integer vdCantidad) {
        this.vdCantidad = vdCantidad;
    }

    public BigDecimal getVdPrecioUnitario() {
        return vdPrecioUnitario;
    }

    public void setVdPrecioUnitario(BigDecimal vdPrecioUnitario) {
        this.vdPrecioUnitario = vdPrecioUnitario;
    }

    // ==================== GETTERS VIRTUALES PARA JSON ====================
    
    @JsonProperty("pId")
    public Integer getPId() {
        return producto != null ? producto.getPId() : null;
    }

    @JsonProperty("productoNombre")
    public String getProductoNombre() {
        return producto != null ? producto.getPNombre() : null;
    }

    @JsonProperty("subtotal")
    public BigDecimal getSubtotal() {
        return calcularSubtotal();
    }

    // Método para calcular subtotal
    public BigDecimal calcularSubtotal() {
        return vdPrecioUnitario.multiply(new BigDecimal(vdCantidad));
    }

    @Override
    public String toString() {
        return "VentaDetalle{" +
                "vdId=" + vdId +
                ", producto=" + producto.getPNombre() +
                ", vdCantidad=" + vdCantidad +
                ", vdPrecioUnitario=" + vdPrecioUnitario +
                '}';
    }
}