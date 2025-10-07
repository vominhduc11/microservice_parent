package com.devwonder.authservice.exception;

import com.devwonder.common.exception.BaseException;

public class InvalidCredentialsException extends BaseException {

    public InvalidCredentialsException(String message) {
        super(message);
    }

    public InvalidCredentialsException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "AUTH_INVALID_CREDENTIALS";
    }
}