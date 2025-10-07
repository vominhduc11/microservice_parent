package com.devwonder.common.exception;

import com.devwonder.common.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Hidden
public class GlobalExceptionHandler {
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<BaseResponse<String>> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(e.getHttpStatus())
                .body(BaseResponse.error(e.getMessage()));
    }
    
    @ExceptionHandler(AccountDisabledException.class)
    public ResponseEntity<BaseResponse<String>> handleAccountDisabledException(AccountDisabledException e) {
        return ResponseEntity.status(e.getHttpStatus())
                .body(BaseResponse.error(e.getMessage()));
    }
    
    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<BaseResponse<String>> handleTokenExpiredException(TokenExpiredException e) {
        return ResponseEntity.status(e.getHttpStatus())
                .body(BaseResponse.error(e.getMessage()));
    }
    
    @ExceptionHandler(TokenBlacklistedException.class)
    public ResponseEntity<BaseResponse<String>> handleTokenBlacklistedException(TokenBlacklistedException e) {
        return ResponseEntity.status(e.getHttpStatus())
                .body(BaseResponse.error(e.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest()
                .body(BaseResponse.error("Validation failed", errors));
    }
    
    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<BaseResponse<String>> handleResourceAlreadyExistsException(ResourceAlreadyExistsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(BaseResponse.error(e.getMessage()));
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<BaseResponse<String>> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(BaseResponse.error("Invalid argument: " + e.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<String>> handleGenericException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(BaseResponse.error("Internal server error: " + e.getMessage()));
    }
}