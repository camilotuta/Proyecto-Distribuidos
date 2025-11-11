package co.edu.tienda.domain.entities;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "PRODUCTO")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "P_ID")
    @JsonProperty("id")
    @JsonAlias({"pId", "P_ID"})
    private Integer pId;

    @Column(name = "P_NOMBRE", nullable = false, length = 200)
    @JsonProperty("nombre")
    @JsonAlias({"pNombre", "P_NOMBRE"})
    private String pNombre;

    @Column(name = "P_DESCRIPCION", columnDefinition = "TEXT")
    @JsonProperty("descripcion")
    @JsonAlias({"pDescripcion", "P_DESCRIPCION"})
    private String pDescripcion;

    @Column(name = "P_PRECIO", nullable = false, precision = 10, scale = 2)
    @JsonProperty("precio")
    @JsonAlias({"pPrecio", "P_PRECIO"})
    private BigDecimal pPrecio;

    @Column(name = "P_STOCK", nullable = false)
    @JsonProperty("stock")
    @JsonAlias({"pStock", "P_STOCK"})
    private Integer pStock;

    public Producto() {}

    public Producto(String pNombre, String pDescripcion, BigDecimal pPrecio, Integer pStock) {
        this.pNombre = pNombre;
        this.pDescripcion = pDescripcion;
        this.pPrecio = pPrecio;
        this.pStock = pStock;
    }

    // GETTERS Y SETTERS
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