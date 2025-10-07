package com.devwonder.common.util;

import com.devwonder.common.dto.BaseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseUtil {

    private ResponseUtil() {
        // Private constructor to prevent instantiation
    }

    // Success responses
    public static <T> ResponseEntity<BaseResponse<T>> success(String message, T data) {
        return ResponseEntity.ok(BaseResponse.success(message, data));
    }

    public static <T> ResponseEntity<BaseResponse<T>> success(String message) {
        return ResponseEntity.ok(BaseResponse.success(message, null));
    }

    public static <T> ResponseEntity<BaseResponse<T>> created(String message, T data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success(message, data));
    }

    // Error responses
    public static <T> ResponseEntity<BaseResponse<T>> badRequest(String message) {
        return ResponseEntity.badRequest()
                .body(BaseResponse.error(message));
    }

    public static <T> ResponseEntity<BaseResponse<T>> notFound(String message) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(BaseResponse.error(message));
    }

    public static <T> ResponseEntity<BaseResponse<T>> unauthorized(String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(BaseResponse.error(message));
    }

    public static <T> ResponseEntity<BaseResponse<T>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(BaseResponse.error(message));
    }

    public static <T> ResponseEntity<BaseResponse<T>> internalServerError(String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(BaseResponse.error(message));
    }

    public static <T> ResponseEntity<BaseResponse<T>> conflict(String message) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(BaseResponse.error(message));
    }
}