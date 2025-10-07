package com.devwonder.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class TokenExpiredException extends BaseException {

    private final HttpStatus httpStatus = HttpStatus.UNAUTHORIZED;

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
    
    public TokenExpiredException(String message) {
        super(message);
    }
    
    public TokenExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public TokenExpiredException(String errorCode, String message) {
        super(errorCode, message);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "TOKEN_001";
    }
}