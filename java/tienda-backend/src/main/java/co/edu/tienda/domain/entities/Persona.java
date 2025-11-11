package co.edu.tienda.domain.entities;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "PERSONA")
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "P_ID")
    @JsonProperty("id")
    @JsonAlias({"pId", "P_ID"})
    private Integer pId;

    @Column(name = "P_NOMBRE", nullable = false, length = 100)
    @JsonProperty("nombre")
    @JsonAlias({"pNombre", "P_NOMBRE"})
    private String pNombre;

    @Column(name = "P_APELLIDO", nullable = false, length = 100)
    @JsonProperty("apellido")
    @JsonAlias({"pApellido", "P_APELLIDO"})
    private String pApellido;

    @Column(name = "P_EMAIL", nullable = false, unique = true, length = 150)
    @JsonProperty("email")
    @JsonAlias({"pEmail", "P_EMAIL"})
    private String pEmail;

    @Column(name = "P_TELEFONO", length = 20)
    @JsonProperty("telefono")
    @JsonAlias({"pTelefono", "P_TELEFONO"})
    private String pTelefono;

    public Persona() {}

    public Persona(String pNombre, String pApellido, String pEmail, String pTelefono) {
        this.pNombre = pNombre;
        this.pApellido = pApellido;
        this.pEmail = pEmail;
        this.pTelefono = pTelefono;
    }

    // GETTERS Y SETTERS
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

    // GETTER VIRTUAL ADICIONAL
    @JsonProperty("nombreCompleto")
    public String getNombreCompleto() { return pNombre + " " + pApellido; }

    @Override
    public String toString() {
        return "Persona{" +
                "pId=" + pId +
                ", nombreCompleto='" + pNombre + " " + pApellido + '\'' +
                ", email='" + pEmail + '\'' +
                '}';
    }
}