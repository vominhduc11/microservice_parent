package com.devwonder.common.exception;

public class EmailSendException extends BaseException {
    
    public EmailSendException(String message) {
        super(message);
    }
    
    public EmailSendException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public EmailSendException(String errorCode, String message) {
        super(errorCode, message);
    }
    
    public EmailSendException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
    
    @Override
    protected String getDefaultErrorCode() {
        return "EMAIL_SEND_FAILED";
    }
}