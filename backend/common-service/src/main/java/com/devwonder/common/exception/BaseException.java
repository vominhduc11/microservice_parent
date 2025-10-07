package com.devwonder.common.exception;

import lombok.Getter;

@Getter
public abstract class BaseException extends RuntimeException {
    
    private final String errorCode;
    
    public BaseException(String message) {
        super(message);
        this.errorCode = getDefaultErrorCode();
    }
    
    public BaseException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = getDefaultErrorCode();
    }
    
    public BaseException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public BaseException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    protected abstract String getDefaultErrorCode();
}