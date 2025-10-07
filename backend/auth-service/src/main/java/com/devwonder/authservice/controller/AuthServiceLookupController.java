package com.devwonder.authservice.controller;

import com.devwonder.authservice.dto.AccountCreateRequest;
import com.devwonder.authservice.dto.AccountCreateResponse;
import com.devwonder.authservice.service.AuthService;
import com.devwonder.common.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth-service")
@Tag(name = "Inter-Service APIs", description = "🔗 Direct service-to-service communication (API Key required)")
@RequiredArgsConstructor
@Slf4j
public class AuthServiceLookupController {

    private final AuthService authService;

    @PostMapping("/accounts")
    @Operation(
        summary = "Create new account",
        description = "Create a new user account with specified roles. Used by user service for dealer registration. Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Account created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request payload"),
        @ApiResponse(responseCode = "409", description = "Account with this username already exists"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<AccountCreateResponse>> createAccount(
            @Valid @RequestBody AccountCreateRequest request) {

        log.info("Inter-service call: Creating account for username: {}", request.getUsername());

        try {
            AccountCreateResponse response = authService.createAccount(request);
            log.info("Successfully created account with ID: {} for username: {}",
                    response.getId(), request.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(BaseResponse.success("Account created successfully", response));
        } catch (RuntimeException e) {
            log.error("Account creation failed for username {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(BaseResponse.error("Account creation failed: " + e.getMessage()));
        }
    }

    @GetMapping("/accounts/check-username/{username}")
    @Operation(
        summary = "Check if username exists",
        description = "Check if a username already exists in the system. Used by user service before creating customer accounts. Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Username check completed"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Boolean>> checkUsernameExists(@PathVariable String username) {

        log.info("Inter-service call: Checking if username exists: {}", username);

        try {
            boolean exists = authService.checkUsernameExists(username);
            log.info("Username check result for {}: {}", username, exists);

            return ResponseEntity.ok(BaseResponse.success(
                "Username check completed",
                exists
            ));
        } catch (Exception e) {
            log.error("Username check failed for {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Username check failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/accounts/{accountId}")
    @Operation(
        summary = "Delete account",
        description = "Delete an existing user account by ID. Used by user service when dealer is deleted. Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Account deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Account not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<String>> deleteAccount(@PathVariable Long accountId) {

        log.info("Inter-service call: Deleting account with ID: {}", accountId);

        try {
            authService.deleteAccount(accountId);
            log.info("Successfully deleted account with ID: {}", accountId);

            return ResponseEntity.ok(BaseResponse.success(
                "Account deleted successfully",
                "Account with ID " + accountId + " has been permanently removed"
            ));
        } catch (RuntimeException e) {
            log.error("Account deletion failed for ID {}: {}", accountId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error("Account deletion failed: " + e.getMessage()));
        }
    }

    @GetMapping("/accounts/by-role")
    @Operation(
        summary = "Get account IDs by role excluding specific role",
        description = "Get list of account IDs that have a specific role but do not have another role. Used by user service to get admin accounts without SYSTEM role. Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Account IDs retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<java.util.List<Long>>> getAccountIdsByRoleExcluding(
            @RequestParam String roleName,
            @RequestParam String excludeRoleName) {

        log.info("Inter-service call: Getting account IDs with role {} excluding {}", roleName, excludeRoleName);

        try {
            java.util.List<Long> accountIds = authService.getAccountIdsByRoleExcluding(roleName, excludeRoleName);
            log.info("Successfully retrieved {} account IDs", accountIds.size());

            return ResponseEntity.ok(BaseResponse.success(
                "Account IDs retrieved successfully",
                accountIds
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve account IDs: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve account IDs: " + e.getMessage()));
        }
    }

}