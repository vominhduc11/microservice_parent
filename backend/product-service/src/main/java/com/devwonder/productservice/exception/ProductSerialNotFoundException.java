package com.devwonder.productservice.exception;

import com.devwonder.common.exception.BaseException;

public class ProductSerialNotFoundException extends BaseException {

    public ProductSerialNotFoundException(String message) {
        super(message);
    }

    public ProductSerialNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "PRODUCT_SERIAL_NOT_FOUND";
    }
}