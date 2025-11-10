package co.edu.tienda.infrastructure.rest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

@ControllerAdvice
public class ErrorHandler {

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<String> handle404(NoHandlerFoundException e) {
        return new ResponseEntity<>("Recurso no encontrado. Revisa la URL.", HttpStatus.NOT_FOUND);
    }
}