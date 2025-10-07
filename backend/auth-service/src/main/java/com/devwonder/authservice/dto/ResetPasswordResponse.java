package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response after resetting password")
public class ResetPasswordResponse {

    @Schema(description = "Success message", example = "Password has been reset successfully")
    private String message;

    @Schema(description = "Email of the user", example = "user@example.com")
    private String email;
}
