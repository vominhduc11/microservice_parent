package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Change password request payload")
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    @Schema(description = "Current password", example = "oldPassword123")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 100, message = "New password must be between 6 and 100 characters")
    @Schema(description = "New password", example = "newPassword123")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    @Schema(description = "Confirm new password", example = "newPassword123")
    private String confirmPassword;
}
