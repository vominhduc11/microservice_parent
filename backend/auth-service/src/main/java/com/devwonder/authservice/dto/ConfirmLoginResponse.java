package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response after confirming login via email")
public class ConfirmLoginResponse {

    @Schema(description = "Confirmation message", example = "Login confirmed successfully")
    private String message;

    @Schema(description = "Account ID", example = "1")
    private Long accountId;

    @Schema(description = "Username", example = "admin")
    private String username;

    @Schema(description = "Timestamp", example = "2025-10-02T10:30:00Z")
    private String timestamp;
}
