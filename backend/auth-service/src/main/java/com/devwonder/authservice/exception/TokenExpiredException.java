package com.devwonder.authservice.exception;

import com.devwonder.common.exception.BaseException;

public class TokenExpiredException extends BaseException {

    public TokenExpiredException(String message) {
        super(message);
    }

    public TokenExpiredException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "AUTH_TOKEN_EXPIRED";
    }
}