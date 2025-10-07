package com.devwonder.common.exception;

public class JwksRetrievalException extends BaseException {
    
    public JwksRetrievalException(String message) {
        super(message);
    }
    
    public JwksRetrievalException(String message, Throwable cause) {
        super(message, cause);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "JWKS_RETRIEVAL_ERROR";
    }
}