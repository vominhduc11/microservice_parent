package com.devwonder.mediaservice.service;

import com.devwonder.common.exception.InvalidFileException;
import com.devwonder.common.constants.ErrorMessages;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Service
@Slf4j
public class FileValidationService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    // File validation constants
    private static final int MIN_FILE_SIZE_BYTES = 4;
    private static final int JPEG_SIGNATURE_LENGTH = 3;
    private static final int STANDARD_SIGNATURE_LENGTH = 4;
    private static final int WEBP_SIGNATURE_LENGTH = 8;
    private static final int WEBP_FULL_HEADER_LENGTH = 12;

    // File signature constants
    private static final byte JPEG_BYTE_1 = (byte) 0xFF;
    private static final byte JPEG_BYTE_2 = (byte) 0xD8;
    private static final byte JPEG_BYTE_3 = (byte) 0xFF;

    private static final byte PNG_BYTE_1 = (byte) 0x89;
    private static final byte PNG_BYTE_2 = 0x50;
    private static final byte PNG_BYTE_3 = 0x4E;
    private static final byte PNG_BYTE_4 = 0x47;

    private static final byte GIF_BYTE_1 = 0x47;
    private static final byte GIF_BYTE_2 = 0x49;
    private static final byte GIF_BYTE_3 = 0x46;
    private static final byte GIF_BYTE_4 = 0x38;

    private static final byte WEBP_RIFF_BYTE_1 = 0x52;
    private static final byte WEBP_RIFF_BYTE_2 = 0x49;
    private static final byte WEBP_RIFF_BYTE_3 = 0x46;
    private static final byte WEBP_RIFF_BYTE_4 = 0x46;
    private static final byte WEBP_WEBP_BYTE_1 = 0x57;
    private static final byte WEBP_WEBP_BYTE_2 = 0x45;
    private static final byte WEBP_WEBP_BYTE_3 = 0x42;
    private static final byte WEBP_WEBP_BYTE_4 = 0x50;

    private static final int WEBP_HEADER_OFFSET = 8;
    private static final int WEBP_FORMAT_OFFSET_1 = 9;
    private static final int WEBP_FORMAT_OFFSET_2 = 10;
    private static final int WEBP_FORMAT_OFFSET_3 = 11;

    @Value("${file.upload.max-size:10485760}") // 10MB default
    private long maxFileSize;

    public void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException(ErrorMessages.FILE_EMPTY);
        }

        validateFileSize(file);
        validateContentType(file);
        validateFileName(file);
        validateFileSignature(file);
    }

    private void validateFileSize(MultipartFile file) {
        if (file.getSize() > maxFileSize) {
            throw new InvalidFileException(
                ErrorMessages.format(ErrorMessages.FILE_TOO_LARGE, file.getSize(), maxFileSize));
        }
    }

    private void validateContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidFileException(
                ErrorMessages.format(ErrorMessages.INVALID_FILE_TYPE, contentType));
        }
    }

    private void validateFileName(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new InvalidFileException(ErrorMessages.FILENAME_REQUIRED);
        }

        // Sanitize filename - remove dangerous characters
        String sanitizedFilename = sanitizeFilename(filename);
        if (sanitizedFilename.isEmpty()) {
            throw new InvalidFileException(ErrorMessages.FILENAME_INVALID_CHARS);
        }

        String extension = getFileExtension(sanitizedFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new InvalidFileException(
                ErrorMessages.format(ErrorMessages.INVALID_FILE_EXTENSION, extension, ALLOWED_EXTENSIONS));
        }
    }

    private void validateFileSignature(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            if (fileBytes.length < MIN_FILE_SIZE_BYTES) {
                throw new InvalidFileException(ErrorMessages.FILE_TOO_SMALL);
            }

            if (!isValidImageSignature(fileBytes)) {
                throw new InvalidFileException(ErrorMessages.FILE_SIGNATURE_INVALID);
            }
        } catch (IOException e) {
            log.error("Error reading file for signature validation: {}", e.getMessage());
            throw new InvalidFileException(ErrorMessages.format(ErrorMessages.FILE_VALIDATION_FAILED, "Could not read file"));
        }
    }

    private boolean isValidImageSignature(byte[] bytes) {
        return isJpegSignature(bytes) || isPngSignature(bytes) || isGifSignature(bytes) || isWebpSignature(bytes);
    }

    private boolean isJpegSignature(byte[] bytes) {
        return bytes.length >= JPEG_SIGNATURE_LENGTH &&
            bytes[0] == JPEG_BYTE_1 &&
            bytes[1] == JPEG_BYTE_2 &&
            bytes[2] == JPEG_BYTE_3;
    }

    private boolean isPngSignature(byte[] bytes) {
        return bytes.length >= STANDARD_SIGNATURE_LENGTH &&
            bytes[0] == PNG_BYTE_1 &&
            bytes[1] == PNG_BYTE_2 &&
            bytes[2] == PNG_BYTE_3 &&
            bytes[3] == PNG_BYTE_4;
    }

    private boolean isGifSignature(byte[] bytes) {
        return bytes.length >= STANDARD_SIGNATURE_LENGTH &&
            bytes[0] == GIF_BYTE_1 &&
            bytes[1] == GIF_BYTE_2 &&
            bytes[2] == GIF_BYTE_3 &&
            bytes[3] == GIF_BYTE_4;
    }

    private boolean isWebpSignature(byte[] bytes) {
        return bytes.length >= WEBP_FULL_HEADER_LENGTH &&
            bytes[0] == WEBP_RIFF_BYTE_1 && bytes[1] == WEBP_RIFF_BYTE_2 &&
            bytes[2] == WEBP_RIFF_BYTE_3 && bytes[3] == WEBP_RIFF_BYTE_4 &&
            bytes[WEBP_HEADER_OFFSET] == WEBP_WEBP_BYTE_1 &&
            bytes[WEBP_FORMAT_OFFSET_1] == WEBP_WEBP_BYTE_2 &&
            bytes[WEBP_FORMAT_OFFSET_2] == WEBP_WEBP_BYTE_3 &&
            bytes[WEBP_FORMAT_OFFSET_3] == WEBP_WEBP_BYTE_4;
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "";

        // Remove path traversal characters and other dangerous characters
        return filename.replaceAll("[^a-zA-Z0-9._-]", "")
                      .replaceAll("\\.{2,}", ".") // Remove multiple dots
                      .trim();
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

}