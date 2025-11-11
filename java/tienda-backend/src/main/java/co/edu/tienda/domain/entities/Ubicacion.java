package co.edu.tienda.domain.entities;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "UBICACION")
public class Ubicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "U_ID")
    @JsonProperty("id")
    @JsonAlias({"uId", "U_ID"})
    private Integer uId;

    @Column(name = "U_NOMBRE", nullable = false, length = 200)
    @JsonProperty("nombre")
    @JsonAlias({"uNombre", "U_NOMBRE"})
    private String uNombre;

    public Ubicacion() {}

    public Ubicacion(String uNombre) {
        this.uNombre = uNombre;
    }

    public Integer getUId() { return uId; }
    public void setUId(Integer uId) { this.uId = uId; }

    public String getUNombre() { return uNombre; }
    public void setUNombre(String uNombre) { this.uNombre = uNombre; }

    @Override
    public String toString() {
        return "Ubicacion{uId=" + uId + ", nombre='" + uNombre + "'}";
    }
}