package com.devwonder.common.util;

import com.devwonder.common.exception.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public class RepositoryUtil {

    private RepositoryUtil() {
        // Private constructor to prevent instantiation
    }

    /**
     * Find entity by ID or throw ResourceNotFoundException
     */
    public static <T, ID> T findByIdOrThrow(JpaRepository<T, ID> repository, ID id, String entityName) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(entityName + " not found with ID: " + id));
    }

    /**
     * Find entity by ID or throw ResourceNotFoundException with custom message
     */
    public static <T, ID> T findByIdOrThrowWithMessage(JpaRepository<T, ID> repository, ID id, String errorMessage) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(errorMessage));
    }

    /**
     * Find entity by ID with custom exception
     */
    public static <T, ID> T findByIdOrThrow(JpaRepository<T, ID> repository, ID id, RuntimeException exception) {
        return repository.findById(id)
                .orElseThrow(() -> exception);
    }

    /**
     * Check if entity exists or throw ResourceNotFoundException
     */
    public static <T, ID> void existsByIdOrThrow(JpaRepository<T, ID> repository, ID id, String entityName) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(entityName + " not found with ID: " + id);
        }
    }

    /**
     * Find entity and validate it's not deleted
     */
    public static <T> T findActiveEntity(Optional<T> optionalEntity, String entityName) {
        return optionalEntity.orElseThrow(() -> new ResourceNotFoundException(entityName + " not found or has been deleted"));
    }
}