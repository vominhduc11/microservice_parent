package com.devwonder.authservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login response payload")
public class LoginResponse {

    @Schema(description = "JWT access token for API authentication", example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    @Schema(description = "JWT refresh token for obtaining new access tokens", example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    @Schema(description = "Token type - always 'Bearer'", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Access token expiration time in seconds", example = "1800")
    private Long expiresIn;

    @Schema(description = "Refresh token expiration time in seconds", example = "604800")
    private Long refreshExpiresIn;

    @Schema(description = "Authenticated username", example = "admin")
    private String username;

    @Schema(description = "User roles", example = "[\"ADMIN\", \"USER\"]")
    private Set<String> roles;

    @Schema(description = "Account ID of the authenticated user", example = "3")
    private Long accountId;

    @Schema(description = "Email of the authenticated user (only for ADMIN)", example = "admin@devwonder.com")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String email;

    @Schema(description = "Whether this account requires email confirmation on login (only for ADMIN)", example = "false")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean requireLoginEmailConfirmation;

    // Constructor for backward compatibility
    public LoginResponse(String accessToken, Long expiresIn, String username, Set<String> roles) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.username = username;
        this.roles = roles;
    }

    // Full constructor with refresh token
    public LoginResponse(String accessToken, String refreshToken, Long expiresIn, Long refreshExpiresIn, String username, Set<String> roles, Long accountId, String email, Boolean requireLoginEmailConfirmation) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.refreshExpiresIn = refreshExpiresIn;
        this.username = username;
        this.roles = roles;
        this.accountId = accountId;
        this.email = email;
        this.requireLoginEmailConfirmation = requireLoginEmailConfirmation;
    }
}