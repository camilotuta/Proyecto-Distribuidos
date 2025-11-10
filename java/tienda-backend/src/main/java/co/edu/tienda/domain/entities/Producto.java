package co.edu.tienda.domain.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "PRODUCTO")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "P_ID")
    private Integer pId;

    @Column(name = "P_NOMBRE", nullable = false, length = 200)
    private String pNombre;

    @Column(name = "P_DESCRIPCION", columnDefinition = "TEXT")
    private String pDescripcion;

    @Column(name = "P_PRECIO", nullable = false, precision = 10, scale = 2)
    private BigDecimal pPrecio;

    @Column(name = "P_STOCK", nullable = false)
    private Integer pStock;

    public Producto() {}

    public Producto(String pNombre, String pDescripcion, BigDecimal pPrecio, Integer pStock) {
        this.pNombre = pNombre;
        this.pDescripcion = pDescripcion;
        this.pPrecio = pPrecio;
        this.pStock = pStock;
    }

    // GETTERS REALES
    public Integer getPId() { return pId; }
    public void setPId(Integer pId) { this.pId = pId; }

    public String getPNombre() { return pNombre; }
    public void setPNombre(String pNombre) { this.pNombre = pNombre; }

    public String getPDescripcion() { return pDescripcion; }
    public void setPDescripcion(String pDescripcion) { this.pDescripcion = pDescripcion; }

    public BigDecimal getPPrecio() { return pPrecio; }
    public void setPPrecio(BigDecimal pPrecio) { this.pPrecio = pPrecio; }

    public Integer getPStock() { return pStock; }
    public void setPStock(Integer pStock) { this.pStock = pStock; }

    // GETTERS VIRTUALES (para mostrar)
    @JsonProperty("nombre")
    public String getNombre() { return pNombre; }

    @JsonProperty("descripcion")
    public String getDescripcion() { return pDescripcion; }

    @JsonProperty("precio")
    public BigDecimal getPrecio() { return pPrecio; }

    @JsonProperty("stock")
    public Integer getStock() { return pStock; }

    // SETTERS VIRTUALES (para recibir del frontend)
    @JsonProperty("nombre")
    public void setNombre(String nombre) { this.pNombre = nombre; }

    @JsonProperty("descripcion")
    public void setDescripcion(String descripcion) { this.pDescripcion = descripcion; }

    @JsonProperty("precio")
    public void setPrecio(BigDecimal precio) { this.pPrecio = precio; }

    @JsonProperty("stock")
    public void setStock(Integer stock) { this.pStock = stock; }

    @Override
    public String toString() {
        return "Producto{" +
                "pId=" + pId +
                ", nombre='" + pNombre + '\'' +
                ", precio=" + pPrecio +
                ", stock=" + pStock +
                '}';
    }
}