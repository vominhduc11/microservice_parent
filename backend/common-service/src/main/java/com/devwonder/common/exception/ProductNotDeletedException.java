package com.devwonder.common.exception;

public class ProductNotDeletedException extends BaseException {

    public ProductNotDeletedException(String message) {
        super(message);
    }

    public ProductNotDeletedException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "PRODUCT_NOT_DELETED";
    }
}