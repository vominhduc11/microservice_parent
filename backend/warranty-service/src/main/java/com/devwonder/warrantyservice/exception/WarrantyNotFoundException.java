package com.devwonder.warrantyservice.exception;

import com.devwonder.common.exception.BaseException;

public class WarrantyNotFoundException extends BaseException {

    public WarrantyNotFoundException(String message) {
        super(message);
    }

    public WarrantyNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "WARRANTY_NOT_FOUND";
    }
}