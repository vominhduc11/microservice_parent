package com.devwonder.productservice.exception;

import com.devwonder.common.exception.BaseException;

public class InsufficientInventoryException extends BaseException {

    public InsufficientInventoryException(String message) {
        super(message);
    }

    public InsufficientInventoryException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "PRODUCT_INSUFFICIENT_INVENTORY";
    }
}