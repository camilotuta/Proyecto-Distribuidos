package co.edu.tienda.domain.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "PERSONA")
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "P_ID")
    private Integer pId;

    @Column(name = "P_NOMBRE", nullable = false, length = 100)
    private String pNombre;

    @Column(name = "P_APELLIDO", nullable = false, length = 100)
    private String pApellido;

    @Column(name = "P_EMAIL", nullable = false, unique = true, length = 150)
    private String pEmail;

    @Column(name = "P_TELEFONO", length = 20)
    private String pTelefono;

    public Persona() {}

    public Persona(String pNombre, String pApellido, String pEmail, String pTelefono) {
        this.pNombre = pNombre;
        this.pApellido = pApellido;
        this.pEmail = pEmail;
        this.pTelefono = pTelefono;
    }

    // GETTERS REALES
    public Integer getPId() { return pId; }
    public void setPId(Integer pId) { this.pId = pId; }

    public String getPNombre() { return pNombre; }
    public void setPNombre(String pNombre) { this.pNombre = pNombre; }

    public String getPApellido() { return pApellido; }
    public void setPApellido(String pApellido) { this.pApellido = pApellido; }

    public String getPEmail() { return pEmail; }
    public void setPEmail(String pEmail) { this.pEmail = pEmail; }

    public String getPTelefono() { return pTelefono; }
    public void setPTelefono(String pTelefono) { this.pTelefono = pTelefono; }

    // GETTERS VIRTUALES
    @JsonProperty("nombre")
    public String getNombre() { return pNombre; }

    @JsonProperty("apellido")
    public String getApellido() { return pApellido; }

    @JsonProperty("email")
    public String getEmail() { return pEmail; }

    @JsonProperty("telefono")
    public String getTelefono() { return pTelefono; }

    @JsonProperty("nombreCompleto")
    public String getNombreCompleto() { return pNombre + " " + pApellido; }

    // SETTERS VIRTUALES
    @JsonProperty("nombre")
    public void setNombre(String nombre) { this.pNombre = nombre; }

    @JsonProperty("apellido")
    public void setApellido(String apellido) { this.pApellido = apellido; }

    @JsonProperty("email")
    public void setEmail(String email) { this.pEmail = email; }

    @JsonProperty("telefono")
    public void setTelefono(String telefono) { this.pTelefono = telefono; }

    @Override
    public String toString() {
        return "Persona{" +
                "pId=" + pId +
                ", nombreCompleto='" + pNombre + " " + pApellido + '\'' +
                ", email='" + pEmail + '\'' +
                '}';
    }
}