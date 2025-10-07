package com.devwonder.common.exception;

public class AccountCreationException extends BaseException {
    
    public AccountCreationException(String message) {
        super(message);
    }
    
    public AccountCreationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public AccountCreationException(String errorCode, String message) {
        super(errorCode, message);
    }
    
    public AccountCreationException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "ACCOUNT_CREATION_FAILED";
    }
}