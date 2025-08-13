package com.vinodelnya.winery.exception;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataAccessException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
        log.warn("Entity not found: {}", ex.getMessage());
        String title = getMessage("error.entity.notfound", "Entity Not Found");
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            title,
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(EntityInUseException.class)
    public ResponseEntity<ErrorResponse> handleEntityInUse(EntityInUseException ex) {
        log.warn("Entity in use conflict: {}", ex.getMessage());
        String title = getMessage("error.entity.inuse", "Entity In Use");
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            title,
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        String title = getMessage("error.access.denied", "Access Denied");
        String message = getMessage("error.access.denied.message", "You don't have permission to access this resource");
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            title,
            message,
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.warn("Validation failed: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException ex) {
        log.error("Database error occurred", ex);
        log.error("Root cause: {}", ex.getRootCause() != null ? ex.getRootCause().getMessage() : "Unknown");
        log.error("SQL State: {}", ex.getMostSpecificCause().getMessage());
        
        String title = getMessage("error.database", "Database Error");
        String message = getMessage("error.database.message", "A database error occurred while processing your request");
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            title,
            message,
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        log.error("Exception type: {}", ex.getClass().getSimpleName());
        log.error("Stack trace: ", ex);
        
        String title = getMessage("error.internal", "Internal Server Error");
        String message = getMessage("error.internal.message", "An unexpected error occurred");
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            title,
            message,
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private String getMessage(String key, String defaultMessage) {
        try {
            return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            return defaultMessage;
        }
    }

    public record ErrorResponse(int status, String error, String message, LocalDateTime timestamp) {}
}