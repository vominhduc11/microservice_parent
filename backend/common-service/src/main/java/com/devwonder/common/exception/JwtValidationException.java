package com.devwonder.common.exception;

public class JwtValidationException extends BaseException {
    
    public JwtValidationException(String message) {
        super(message);
    }
    
    public JwtValidationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "JWT_VALIDATION_ERROR";
    }
}