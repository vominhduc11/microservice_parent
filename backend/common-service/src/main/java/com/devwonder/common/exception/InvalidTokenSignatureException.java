package com.devwonder.common.exception;

public class InvalidTokenSignatureException extends BaseException {
    
    public InvalidTokenSignatureException(String message) {
        super(message);
    }
    
    public InvalidTokenSignatureException(String message, Throwable cause) {
        super(message, cause);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "INVALID_TOKEN_SIGNATURE";
    }
}