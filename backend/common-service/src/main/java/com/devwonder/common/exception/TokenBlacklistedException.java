package com.devwonder.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class TokenBlacklistedException extends BaseException {

    private final HttpStatus httpStatus = HttpStatus.UNAUTHORIZED;

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
    
    public TokenBlacklistedException(String message) {
        super(message);
    }
    
    public TokenBlacklistedException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public TokenBlacklistedException(String errorCode, String message) {
        super(errorCode, message);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "TOKEN_002";
    }
}