package co.edu.tienda.infrastructure.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeRestController {

    @GetMapping("/")
    public String home() {
        return "¡Bienvenido a Tienda Backend! Usa endpoints como /productos, /ventas, etc.";
    }
}