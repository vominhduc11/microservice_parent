package com.devwonder.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AccountDisabledException extends BaseException {

    private final HttpStatus httpStatus = HttpStatus.FORBIDDEN;

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
    
    public AccountDisabledException(String message) {
        super(message);
    }
    
    public AccountDisabledException(String message, Throwable cause) {
        super(message, cause);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "AUTH_002";
    }
}