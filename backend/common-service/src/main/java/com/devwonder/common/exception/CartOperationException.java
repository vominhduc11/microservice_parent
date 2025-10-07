package com.devwonder.common.exception;

public class CartOperationException extends BaseException {

    public CartOperationException(String message) {
        super(message);
    }

    public CartOperationException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "CART_OPERATION_FAILED";
    }
}