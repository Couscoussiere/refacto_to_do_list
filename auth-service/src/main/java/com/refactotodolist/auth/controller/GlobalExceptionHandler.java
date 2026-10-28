package com.refactotodolist.auth.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public static class InvalidJsonException extends RuntimeException {
        public InvalidJsonException(Throwable cause) {
            super(cause);
        }
    }

    @ExceptionHandler(InvalidJsonException.class)
    public ResponseEntity<Map<String, String>> invalidJson(InvalidJsonException e) {
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid JSON"));
    }
}
