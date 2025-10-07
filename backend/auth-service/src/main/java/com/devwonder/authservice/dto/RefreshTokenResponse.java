package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response object containing refreshed JWT access token and user information")
public class RefreshTokenResponse {

    @Schema(
        description = "New JWT access token with extended expiry time",
        example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    private String accessToken;

    @Schema(
        description = "Token type - always 'Bearer'",
        example = "Bearer"
    )
    private String tokenType = "Bearer";

    @Schema(
        description = "Token expiry time in seconds from now",
        example = "86400"
    )
    private Long expiresIn;

    @Schema(
        description = "Username of the authenticated user",
        example = "admin"
    )
    private String username;

    @Schema(
        description = "User roles/authorities",
        example = "[\"ADMIN\", \"USER\"]"
    )
    private Set<String> roles;

    @Schema(
        description = "Timestamp when token was refreshed",
        example = "2024-01-15T10:30:00Z"
    )
    private String refreshedAt;

    // Constructor without refreshedAt for backward compatibility
    public RefreshTokenResponse(String accessToken, Long expiresIn, String username, Set<String> roles, String refreshedAt) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.username = username;
        this.roles = roles;
        this.refreshedAt = refreshedAt;
    }
}