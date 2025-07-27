package com.portalsaude.exceptions;

import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestControllerAdvice
public class ApiExceptionHandler {

    // 1) Bean Validation (DTO inválido)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String,Object> handleValidation(MethodArgumentNotValidException ex) {
        Map<String,String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return Map.of(
          "error", "Validation failed",
          "details", errors
        );
    }

    // 2) Recurso duplicado → 409 Conflict
    @ExceptionHandler(DuplicateResourceException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String,String> handleDuplicate(DuplicateResourceException ex) {
        return Map.of(
          "error", "Conflict",
          "message", ex.getMessage()
        );
    }

    // 3) Outros ResponseStatusException (ex.: 404 not found)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String,String>> handleStatus(ResponseStatusException ex) {
        return ResponseEntity
          .status(ex.getStatusCode())
          .body(Map.of(
            "error", ex.getStatusCode().toString(),
            "message", ex.getReason()
          ));
    }

    @ExceptionHandler({ BadCredentialsException.class, UsernameNotFoundException.class })
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Map<String,String> handleAuthFail(Exception ex) {
        return Map.of("error","Unauthorized","message", ex.getMessage());
    }

    // 4) Fallback para erros inesperados
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String,String> handleAll(Exception ex) {
        return Map.of(
          "error", "Internal Server Error",
          "message", ex.getMessage()
        );
    }
}

