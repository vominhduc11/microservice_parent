package com.devwonder.common.constants;

public class ErrorMessages {

    private ErrorMessages() {
        // Private constructor to prevent instantiation
    }

    // Generic error messages
    public static final String RESOURCE_NOT_FOUND = "%s not found with ID: %s";
    public static final String RESOURCE_NOT_FOUND_SIMPLE = "%s not found";
    public static final String RESOURCE_ALREADY_EXISTS = "%s with %s '%s' already exists";
    public static final String INVALID_REQUEST_DATA = "Invalid %s data provided";
    public static final String OPERATION_FAILED = "%s operation failed";
    public static final String UNAUTHORIZED_ACCESS = "Unauthorized access to %s";
    public static final String FORBIDDEN_ACCESS = "Access forbidden for %s";
    public static final String INTERNAL_SERVER_ERROR = "An internal server error occurred while processing %s";

    // Authentication error messages
    public static final String INVALID_CREDENTIALS = "Invalid username or password";
    public static final String TOKEN_EXPIRED = "Authentication token has expired";
    public static final String TOKEN_INVALID = "Invalid authentication token";
    public static final String TOKEN_MISSING = "Authentication token is required";
    public static final String REFRESH_TOKEN_INVALID = "Invalid refresh token";
    public static final String REFRESH_TOKEN_EXPIRED = "Refresh token has expired";
    public static final String ACCOUNT_CREATION_FAILED = "Failed to create account";
    public static final String LOGOUT_FAILED = "Failed to logout user";

    // Product specific error messages
    public static final String PRODUCT_NOT_FOUND = "Product not found with ID: %s";
    public static final String PRODUCT_SKU_EXISTS = "Product with SKU '%s' already exists";
    public static final String PRODUCT_NOT_DELETED = "Product with ID: %s is not deleted";
    public static final String PRODUCT_CREATION_FAILED = "Failed to create product";
    public static final String PRODUCT_UPDATE_FAILED = "Failed to update product";
    public static final String PRODUCT_DELETE_FAILED = "Failed to delete product";

    // User/Dealer specific error messages
    public static final String DEALER_NOT_FOUND = "Dealer not found with ID: %s";
    public static final String USER_NOT_FOUND = "User not found with ID: %s";
    public static final String USERNAME_EXISTS = "Username '%s' already exists";
    public static final String EMAIL_EXISTS = "Email '%s' already exists";

    // Cart specific error messages
    public static final String CART_ITEM_NOT_FOUND = "Product not found in dealer cart";
    public static final String CART_OPERATION_FAILED = "Cart operation failed";
    public static final String INVALID_QUANTITY = "Invalid quantity specified";

    // Blog specific error messages
    public static final String BLOG_NOT_FOUND = "Blog not found with ID: %s";
    public static final String CATEGORY_BLOG_NOT_FOUND = "Category blog not found with ID: %s";
    public static final String BLOG_CREATION_FAILED = "Failed to create blog";
    public static final String BLOG_UPDATE_FAILED = "Failed to update blog";

    // File/Media specific error messages
    public static final String FILE_EMPTY = "File is empty or null";
    public static final String FILE_TOO_LARGE = "File size %d bytes exceeds maximum allowed size of %d bytes";
    public static final String INVALID_FILE_TYPE = "Invalid file type: %s. Only images are allowed";
    public static final String INVALID_FILE_EXTENSION = "Invalid file extension: %s. Allowed extensions: %s";
    public static final String FILE_SIGNATURE_INVALID = "File content does not match expected image format";
    public static final String FILE_TOO_SMALL = "File is too small to be a valid image";
    public static final String FILENAME_REQUIRED = "Filename is required";
    public static final String FILENAME_INVALID_CHARS = "Filename contains only invalid characters";
    public static final String PUBLIC_ID_REQUIRED = "Public ID is required";
    public static final String PUBLIC_ID_INVALID = "Public ID contains only invalid characters";
    public static final String PUBLIC_ID_PATH_TRAVERSAL = "Public ID cannot contain path traversal sequences";
    public static final String FILE_UPLOAD_FAILED = "Failed to upload file";
    public static final String FILE_DELETE_FAILED = "Failed to delete file";
    public static final String FILE_VALIDATION_FAILED = "File validation failed: %s";

    // Validation error messages
    public static final String FIELD_REQUIRED = "%s is required";
    public static final String FIELD_INVALID = "Invalid %s provided";
    public static final String FIELD_TOO_SHORT = "%s must be at least %d characters long";
    public static final String FIELD_TOO_LONG = "%s must not exceed %d characters";
    public static final String FIELD_INVALID_FORMAT = "%s has invalid format";
    public static final String EMAIL_INVALID_FORMAT = "Email address has invalid format";
    public static final String PASSWORD_TOO_WEAK = "Password does not meet security requirements";

    // Success messages
    public static final String OPERATION_SUCCESSFUL = "%s completed successfully";
    public static final String RESOURCE_CREATED = "%s created successfully";
    public static final String RESOURCE_UPDATED = "%s updated successfully";
    public static final String RESOURCE_DELETED = "%s deleted successfully";
    public static final String RESOURCE_RESTORED = "%s restored successfully";
    public static final String RESOURCES_RETRIEVED = "%s retrieved successfully";

    // Notification messages
    public static final String NOTIFICATION_NOT_FOUND = "Notification not found with ID: %s";
    public static final String NOTIFICATION_MARKED_READ = "Notification marked as read";

    // Helper methods to format messages
    public static String format(String template, Object... args) {
        return String.format(template, args);
    }

    public static String resourceNotFound(String resourceType, Object id) {
        return format(RESOURCE_NOT_FOUND, resourceType, id);
    }

    public static String resourceAlreadyExists(String resourceType, String field, String value) {
        return format(RESOURCE_ALREADY_EXISTS, resourceType, field, value);
    }

    public static String operationSuccessful(String operation) {
        return format(OPERATION_SUCCESSFUL, operation);
    }

    public static String resourceCreated(String resourceType) {
        return format(RESOURCE_CREATED, resourceType);
    }

    public static String resourceUpdated(String resourceType) {
        return format(RESOURCE_UPDATED, resourceType);
    }

    public static String resourceDeleted(String resourceType) {
        return format(RESOURCE_DELETED, resourceType);
    }

    public static String resourcesRetrieved(String resourceType) {
        return format(RESOURCES_RETRIEVED, resourceType);
    }
}