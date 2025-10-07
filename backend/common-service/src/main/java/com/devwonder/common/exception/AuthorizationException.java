package com.devwonder.common.exception;

public class AuthorizationException extends BaseException {
    
    public AuthorizationException(String message) {
        super(message);
    }
    
    public AuthorizationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "AUTHORIZATION_ERROR";
    }
}