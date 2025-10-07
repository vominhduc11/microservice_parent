package com.devwonder.common.exception;

public class InvalidFileException extends BaseException {

    public InvalidFileException(String message) {
        super(message);
    }

    public InvalidFileException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "INVALID_FILE";
    }
}