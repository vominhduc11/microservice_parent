package com.devwonder.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update login email confirmation setting")
public class UpdateLoginEmailConfirmationRequest {

    @NotNull(message = "requireLoginEmailConfirmation is required")
    @Schema(description = "Enable or disable login email confirmation", example = "true", required = true)
    private Boolean requireLoginEmailConfirmation;
}
