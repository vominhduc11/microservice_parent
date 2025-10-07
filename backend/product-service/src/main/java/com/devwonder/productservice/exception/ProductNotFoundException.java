package com.devwonder.productservice.exception;

import com.devwonder.common.exception.BaseException;

public class ProductNotFoundException extends BaseException {

    public ProductNotFoundException(String message) {
        super(message);
    }

    public ProductNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "PRODUCT_NOT_FOUND";
    }
}