package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response after requesting password reset")
public class ForgotPasswordResponse {

    @Schema(description = "Message indicating email sent status", example = "If your email exists in our system, you will receive a password reset link")
    private String message;
}
