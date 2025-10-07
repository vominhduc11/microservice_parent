package com.devwonder.orderservice.exception;

import com.devwonder.common.exception.BaseException;

public class OrderNotFoundException extends BaseException {

    public OrderNotFoundException(String message) {
        super(message);
    }

    public OrderNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "ORDER_NOT_FOUND";
    }
}