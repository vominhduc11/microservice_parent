package com.devwonder.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AuthenticationException extends BaseException {

    private final HttpStatus httpStatus = HttpStatus.UNAUTHORIZED;

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
    
    public AuthenticationException(String message) {
        super(message);
    }
    
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public AuthenticationException(String errorCode, String message) {
        super(errorCode, message);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "AUTH_001";
    }
}