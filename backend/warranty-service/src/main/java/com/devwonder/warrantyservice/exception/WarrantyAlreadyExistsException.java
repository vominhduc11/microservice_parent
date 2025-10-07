package com.devwonder.warrantyservice.exception;

import com.devwonder.common.exception.BaseException;

public class WarrantyAlreadyExistsException extends BaseException {

    public WarrantyAlreadyExistsException(String message) {
        super(message);
    }

    public WarrantyAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "WARRANTY_ALREADY_EXISTS";
    }
}