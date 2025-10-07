package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response after sending login confirmation email")
public class SendLoginConfirmationResponse {

    @Schema(description = "Message indicating the result", example = "Login confirmation email sent successfully")
    private String message;

    @Schema(description = "Email address where the confirmation was sent", example = "user@example.com")
    private String email;

    @Schema(description = "Timestamp when the email was sent", example = "2025-10-02T10:30:00Z")
    private String timestamp;
}
