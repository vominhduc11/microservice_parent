package com.devwonder.common.exception;

public class ResourceNotFoundException extends BaseException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "RESOURCE_NOT_FOUND";
    }
}