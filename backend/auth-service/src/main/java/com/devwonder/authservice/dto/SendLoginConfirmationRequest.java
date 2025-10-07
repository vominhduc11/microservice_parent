package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to send login confirmation email")
public class SendLoginConfirmationRequest {

    @NotBlank(message = "Username is required")
    @Schema(description = "Username of the logged in user", example = "admin")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "Email address to send the confirmation", example = "user@example.com")
    private String email;
}
