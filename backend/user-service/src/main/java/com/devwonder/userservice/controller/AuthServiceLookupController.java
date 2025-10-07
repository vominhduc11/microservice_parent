package com.devwonder.userservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth-lookup")
@RequiredArgsConstructor
@Tag(name = "Auth Service Lookup", description = "Internal endpoints for auth-service to lookup user data")
public class AuthServiceLookupController {

    private final UserService userService;

    @GetMapping("/admin/{accountId}/require-login-email-confirmation")
    @Operation(summary = "Get admin's requireLoginEmailConfirmation setting", description = "Internal API for auth-service to check if admin requires email confirmation on login")
    public ResponseEntity<BaseResponse<Boolean>> getAdminRequireLoginEmailConfirmation(@PathVariable Long accountId) {
        Boolean requireConfirmation = userService.getAdminRequireLoginEmailConfirmation(accountId);
        return ResponseEntity.ok(BaseResponse.success(
            "Retrieved login email confirmation setting",
            requireConfirmation
        ));
    }

    @GetMapping("/admin/{accountId}/email")
    @Operation(summary = "Get admin's email", description = "Internal API for auth-service to get admin's email address")
    public ResponseEntity<BaseResponse<String>> getAdminEmail(@PathVariable Long accountId) {
        String email = userService.getAdminEmail(accountId);
        return ResponseEntity.ok(BaseResponse.success(
            "Retrieved admin email",
            email
        ));
    }

    @GetMapping("/email/{email}/account-id")
    @Operation(summary = "Get account ID by email", description = "Internal API for auth-service to get account ID from email address (supports both Admin and Dealer)")
    public ResponseEntity<BaseResponse<Long>> getAccountIdByEmail(@PathVariable String email) {
        Long accountId = userService.getAccountIdByEmail(email);
        return ResponseEntity.ok(BaseResponse.success(
            "Retrieved account ID",
            accountId
        ));
    }
}
