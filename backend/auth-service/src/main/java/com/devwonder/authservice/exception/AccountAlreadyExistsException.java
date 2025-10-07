package com.devwonder.authservice.exception;

import com.devwonder.common.exception.BaseException;

public class AccountAlreadyExistsException extends BaseException {

    public AccountAlreadyExistsException(String message) {
        super(message);
    }

    public AccountAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "AUTH_ACCOUNT_ALREADY_EXISTS";
    }
}