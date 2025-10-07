package com.devwonder.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Admin registration request")
public class AdminRegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Username for the admin account", example = "admin001")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Schema(description = "Password for the admin account", example = "SecureP@ss123")
    private String password;

    @NotBlank(message = "Name is required")
    @Schema(description = "Full name of the admin", example = "John Doe")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "Email address of the admin", example = "admin@example.com")
    private String email;

    @NotBlank(message = "Phone is required")
    @Schema(description = "Phone number of the admin", example = "+84123456789")
    private String phone;

    @NotBlank(message = "Company name is required")
    @Schema(description = "Company name", example = "DevWonder Corp")
    private String companyName;

    @Schema(description = "Require login email confirmation", example = "false", defaultValue = "false")
    private Boolean requireLoginEmailConfirmation = false;
}
