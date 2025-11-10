package co.edu.tienda.domain.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "UBICACION")
public class Ubicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "U_ID")
    private Integer uId;

    @Column(name = "U_NOMBRE", nullable = false, length = 200)
    private String uNombre;

    public Ubicacion() {}

    public Ubicacion(String uNombre) {
        this.uNombre = uNombre;
    }

    public Integer getUId() { return uId; }
    public void setUId(Integer uId) { this.uId = uId; }

    public String getUNombre() { return uNombre; }
    public void setUNombre(String uNombre) { this.uNombre = uNombre; }

    // GETTER Y SETTER VIRTUAL
    @JsonProperty("nombre")
    public String getNombre() { return uNombre; }

    @JsonProperty("nombre")
    public void setNombre(String nombre) { this.uNombre = nombre; }

    @Override
    public String toString() {
        return "Ubicacion{uId=" + uId + ", nombre='" + uNombre + "'}";
    }
}