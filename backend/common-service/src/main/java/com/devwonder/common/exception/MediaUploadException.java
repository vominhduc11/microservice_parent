package com.devwonder.common.exception;

public class MediaUploadException extends BaseException {

    public MediaUploadException(String message) {
        super(message);
    }

    public MediaUploadException(String message, Throwable cause) {
        super(message, cause);
    }

    @Override
    protected String getDefaultErrorCode() {
        return "MEDIA_UPLOAD_FAILED";
    }
}