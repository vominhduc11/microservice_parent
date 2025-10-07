package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request object for refreshing JWT access token")
public class RefreshTokenRequest {

    @NotBlank(message = "Token is required")
    @Schema(
        description = "JWT refresh token (must be valid and not expired). Use the refreshToken from login response.",
        example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String token;
}