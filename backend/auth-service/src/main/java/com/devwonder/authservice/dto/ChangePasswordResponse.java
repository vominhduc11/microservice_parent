package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Change password response")
public class ChangePasswordResponse {

    @Schema(description = "Status message", example = "Password changed successfully")
    private String message;

    @Schema(description = "Username of the account", example = "admin")
    private String username;

    @Schema(description = "Timestamp when password was changed", example = "2025-09-09T10:30:00.000Z")
    private String changedAt;
}
