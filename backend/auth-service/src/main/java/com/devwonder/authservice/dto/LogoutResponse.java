package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor  
@AllArgsConstructor
@Schema(description = "Logout response")
public class LogoutResponse {
    
    @Schema(description = "Logout status message", example = "Successfully logged out")
    private String message;
    
    @Schema(description = "Timestamp when logout occurred", example = "2025-09-09T10:30:00.000Z")
    private String logoutAt;
}