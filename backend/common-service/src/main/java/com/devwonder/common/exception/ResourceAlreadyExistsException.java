package com.devwonder.common.exception;

public class ResourceAlreadyExistsException extends BaseException {
    
    public ResourceAlreadyExistsException(String message) {
        super(message);
    }
    
    public ResourceAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public ResourceAlreadyExistsException(String errorCode, String message) {
        super(errorCode, message);
    }
    
    public ResourceAlreadyExistsException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "RESOURCE_ALREADY_EXISTS";
    }
}