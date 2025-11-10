package co.edu.tienda.domain.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "PUNTO_DE_VENTA")
public class PuntoDeVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PV_ID")
    private Integer pvId;

    @Column(name = "PV_NOMBRE", nullable = false, length = 200)
    private String pvNombre;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "U_ID", nullable = false)
    private Ubicacion ubicacion;

    public PuntoDeVenta() {}

    public PuntoDeVenta(String pvNombre, Ubicacion ubicacion) {
        this.pvNombre = pvNombre;
        this.ubicacion = ubicacion;
    }

    public Integer getPvId() { return pvId; }
    public void setPvId(Integer pvId) { this.pvId = pvId; }

    public String getPvNombre() { return pvNombre; }
    public void setPvNombre(String pvNombre) { this.pvNombre = pvNombre; }

    public Ubicacion getUbicacion() { return ubicacion; }
    public void setUbicacion(Ubicacion ubicacion) { this.ubicacion = ubicacion; }

    // GETTERS VIRTUALES
    @JsonProperty("nombre")
    public String getNombre() { return pvNombre; }

    @JsonProperty("uId")
    public Integer getUId() { 
        return ubicacion != null ? ubicacion.getUId() : null; 
    }

    @JsonProperty("ubicacionNombre")
    public String getUbicacionNombre() { 
        return ubicacion != null ? ubicacion.getUNombre() : null; 
    }

    // SETTERS VIRTUALES
    @JsonProperty("nombre")
    public void setNombre(String nombre) { this.pvNombre = nombre; }

    @JsonProperty("uId")
    public void setUId(Integer uId) {
        if (uId != null) {
            this.ubicacion = new Ubicacion();
            this.ubicacion.setUId(uId);
        }
    }

    @Override
    public String toString() {
        return "PuntoDeVenta{pvId=" + pvId + ", nombre='" + pvNombre + "', ubicacion=" + (ubicacion != null ? ubicacion.getUNombre() : "null") + "}";
    }
}