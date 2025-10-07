package com.devwonder.orderservice.exception;

import com.devwonder.common.exception.BaseException;

public class InvalidOrderStatusException extends BaseException {

    public InvalidOrderStatusException(String message) {
        super(message);
    }

    public InvalidOrderStatusException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "ORDER_INVALID_STATUS";
    }
}