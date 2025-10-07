package com.devwonder.mediaservice.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.common.constants.ErrorMessages;
import com.devwonder.common.exception.InvalidFileException;
import com.devwonder.mediaservice.service.MediaService;
import com.devwonder.mediaservice.service.FileValidationService;

import jakarta.validation.constraints.NotBlank;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/media")
@Tag(name = "Media Management", description = "Media upload and management endpoints")
@RequiredArgsConstructor
@Slf4j
public class MediaController {

    private final MediaService mediaService;
    private final FileValidationService fileValidationService;

    @PostMapping("/upload")
    @Operation(summary = "Upload Image", description = "Upload image file to Cloudinary. Only images are supported. Requires ADMIN role authentication via API Gateway.", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Image uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file, empty file, or unsupported file type"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Map<String, Object>>> uploadImage(
            @Parameter(description = "Image file to upload", required = true) @RequestParam("file") MultipartFile file) {

        logUploadRequest(file);

        try {
            fileValidationService.validateImageFile(file);
            Map<String, Object> result = mediaService.uploadImage(file);
            return createSuccessResponse("Image uploaded successfully to Cloudinary", result);

        } catch (InvalidFileException e) {
            return handleValidationError(e);
        } catch (IOException e) {
            return handleIOError(e);
        } catch (Exception e) {
            return handleUnexpectedError(e);
        }
    }

    private void logUploadRequest(MultipartFile file) {
        log.info("Received image upload request - filename: {}, size: {} bytes, type: {}",
                file.getOriginalFilename(), file.getSize(), file.getContentType());
    }

    private ResponseEntity<BaseResponse<Map<String, Object>>> createSuccessResponse(String message, Map<String, Object> data) {
        return ResponseEntity.ok(BaseResponse.success(message, data));
    }

    private ResponseEntity<BaseResponse<Map<String, Object>>> handleValidationError(InvalidFileException e) {
        log.warn("File validation failed: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(BaseResponse.error("File validation failed: " + e.getMessage()));
    }

    private ResponseEntity<BaseResponse<Map<String, Object>>> handleIOError(IOException e) {
        log.error("Failed to upload image: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(BaseResponse.error("Failed to upload image: " + e.getMessage()));
    }

    private ResponseEntity<BaseResponse<Map<String, Object>>> handleUnexpectedError(Exception e) {
        log.error("Unexpected error during image upload: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(BaseResponse.error("An unexpected error occurred"));
    }

    @DeleteMapping("/delete")
    @Operation(summary = "Delete Image", description = "Delete an image from Cloudinary by public ID. Requires ADMIN role authentication via API Gateway.", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Image deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Map<String, Object>>> deleteImage(
            @Parameter(description = "Public ID of the image to delete", required = true)
            @RequestParam("publicId") @NotBlank(message = "Public ID is required") String publicId) {

        String sanitizedPublicId = sanitizePublicId(publicId);
        logDeleteRequest(sanitizedPublicId);

        try {
            Map<String, Object> result = mediaService.deleteImage(sanitizedPublicId);
            return createSuccessResponse("Image deleted successfully from Cloudinary", result);

        } catch (IllegalArgumentException e) {
            return handleInvalidPublicIdError(e);
        } catch (IOException e) {
            return handleIOError(e);
        } catch (Exception e) {
            return handleUnexpectedError(e);
        }
    }

    private void logDeleteRequest(String sanitizedPublicId) {
        log.info("Received delete request - public_id: {}", sanitizedPublicId);
    }

    private ResponseEntity<BaseResponse<Map<String, Object>>> handleInvalidPublicIdError(IllegalArgumentException e) {
        log.warn("Invalid public ID: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(BaseResponse.error("Invalid public ID: " + e.getMessage()));
    }

    private String sanitizePublicId(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            throw new IllegalArgumentException(ErrorMessages.PUBLIC_ID_REQUIRED);
        }

        // Remove any potentially dangerous characters, allow only safe characters for Cloudinary IDs
        String sanitized = publicId.replaceAll("[^a-zA-Z0-9_\\-/.]", "");

        if (sanitized.isEmpty()) {
            throw new IllegalArgumentException(ErrorMessages.PUBLIC_ID_INVALID);
        }

        // Prevent path traversal
        if (sanitized.contains("..")) {
            throw new IllegalArgumentException(ErrorMessages.PUBLIC_ID_PATH_TRAVERSAL);
        }

        return sanitized;
    }


}