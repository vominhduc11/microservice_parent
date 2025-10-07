package com.devwonder.common.util;

import org.slf4j.Logger;

public class LoggingUtil {

    private LoggingUtil() {
        // Private constructor to prevent instantiation
    }

    // CRUD operation logging
    public static void logFetchOperation(Logger log, String entityName, String criteria) {
        log.info("Fetching {} with criteria: {}", entityName, criteria);
    }

    public static void logFetchOperation(Logger log, String entityName, Object id) {
        log.info("Fetching {} with ID: {}", entityName, id);
    }

    public static void logFetchAllOperation(Logger log, String entityName) {
        log.info("Fetching all {}", entityName);
    }

    public static void logCreateOperation(Logger log, String entityName, Object identifier) {
        log.info("Creating new {} with identifier: {}", entityName, identifier);
    }

    public static void logUpdateOperation(Logger log, String entityName, Object id) {
        log.info("Updating {} with ID: {}", entityName, id);
    }

    public static void logDeleteOperation(Logger log, String entityName, Object id) {
        log.info("Soft deleting {} with ID: {}", entityName, id);
    }

    public static void logHardDeleteOperation(Logger log, String entityName, Object id) {
        log.info("Hard deleting {} with ID: {}", entityName, id);
    }

    public static void logRestoreOperation(Logger log, String entityName, Object id) {
        log.info("Restoring {} with ID: {}", entityName, id);
    }

    // Success logging
    public static void logSuccessfulCreate(Logger log, String entityName, Object id, Object identifier) {
        log.info("Successfully created {} with ID: {} and identifier: {}", entityName, id, identifier);
    }

    public static void logSuccessfulUpdate(Logger log, String entityName, Object id, Object identifier) {
        log.info("Successfully updated {} with ID: {} and identifier: {}", entityName, id, identifier);
    }

    public static void logSuccessfulDelete(Logger log, String entityName, Object id, Object identifier) {
        log.info("Successfully soft deleted {} with ID: {} and identifier: {}", entityName, id, identifier);
    }

    public static void logSuccessfulHardDelete(Logger log, String entityName, Object id, Object identifier) {
        log.info("Successfully hard deleted {} with ID: {} and identifier: {}", entityName, id, identifier);
    }

    public static void logSuccessfulRestore(Logger log, String entityName, Object id, Object identifier) {
        log.info("Successfully restored {} with ID: {} and identifier: {}", entityName, id, identifier);
    }

    // Operation with fields
    public static void logFetchWithFields(Logger log, String entityName, String fields, Object criteria) {
        log.info("Fetching {} with fields: {} and criteria: {}", entityName, fields, criteria);
    }

    public static void logFetchWithFieldsAndLimit(Logger log, String entityName, String fields, int limit) {
        log.info("Fetching {} with fields: {} and limit: {}", entityName, fields, limit);
    }

    // Validation logging
    public static void logValidationStart(Logger log, String operationType, Object identifier) {
        log.debug("Starting validation for {} operation with identifier: {}", operationType, identifier);
    }

    public static void logValidationSuccess(Logger log, String operationType, Object identifier) {
        log.debug("Validation successful for {} operation with identifier: {}", operationType, identifier);
    }

    // Error logging
    public static void logOperationError(Logger log, String operation, Object identifier, String error) {
        log.error("Error during {} operation for identifier {}: {}", operation, identifier, error);
    }

    public static void logOperationError(Logger log, String operation, Object identifier, String error, Throwable throwable) {
        log.error("Error during {} operation for identifier {}: {}", operation, identifier, error, throwable);
    }
}