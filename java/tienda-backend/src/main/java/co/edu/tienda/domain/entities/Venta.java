package co.edu.tienda.domain.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "VENTA")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "V_ID")
    private Integer vId;

    @Column(name = "V_FECHA", nullable = false)
    private LocalDateTime vFecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "P_ID", nullable = false)
    private Persona persona;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PV_ID", nullable = false)
    private PuntoDeVenta puntoDeVenta;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<VentaDetalle> detalles = new ArrayList<>();

    // Constructor vacío
    public Venta() {
        this.vFecha = LocalDateTime.now();
    }

    // Constructor con parámetros
    public Venta(Persona persona, PuntoDeVenta puntoDeVenta) {
        this.vFecha = LocalDateTime.now();
        this.persona = persona;
        this.puntoDeVenta = puntoDeVenta;
    }

    // Getters y Setters normales
    public Integer getVId() {
        return vId;
    }

    public void setVId(Integer vId) {
        this.vId = vId;
    }

    public LocalDateTime getVFecha() {
        return vFecha;
    }

    public void setVFecha(LocalDateTime vFecha) {
        this.vFecha = vFecha;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }

    public PuntoDeVenta getPuntoDeVenta() {
        return puntoDeVenta;
    }

    public void setPuntoDeVenta(PuntoDeVenta puntoDeVenta) {
        this.puntoDeVenta = puntoDeVenta;
    }

    public List<VentaDetalle> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<VentaDetalle> detalles) {
        this.detalles = detalles;
    }

    // ==================== GETTERS VIRTUALES PARA JSON ====================
    // Estos métodos solo existen para la serialización JSON
    
    @JsonProperty("pId")
    public Integer getPId() {
        return persona != null ? persona.getPId() : null;
    }

    @JsonProperty("clienteNombre")
    public String getClienteNombre() {
        if (persona != null) {
            return persona.getPNombre() + " " + persona.getPApellido();
        }
        return null;
    }

    @JsonProperty("pvId")
    public Integer getPvId() {
        return puntoDeVenta != null ? puntoDeVenta.getPvId() : null;
    }

    @JsonProperty("puntoVentaNombre")
    public String getPuntoVentaNombre() {
        return puntoDeVenta != null ? puntoDeVenta.getPvNombre() : null;
    }

    @JsonProperty("ubicacionNombre")
    public String getUbicacionNombre() {
        if (puntoDeVenta != null && puntoDeVenta.getUbicacion() != null) {
            return puntoDeVenta.getUbicacion().getUNombre();
        }
        return null;
    }

    @JsonProperty("total")
    public BigDecimal getTotal() {
        return detalles.stream()
            .map(VentaDetalle::calcularSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Método auxiliar para agregar detalles
    public void addDetalle(VentaDetalle detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }

    @Override
    public String toString() {
        return "Venta{" +
                "vId=" + vId +
                ", vFecha=" + vFecha +
                ", persona=" + persona.getPNombre() +
                ", puntoDeVenta=" + puntoDeVenta.getPvNombre() +
                '}';
    }
}