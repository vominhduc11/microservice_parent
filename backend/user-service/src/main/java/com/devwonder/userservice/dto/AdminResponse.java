package com.devwonder.userservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Admin information response")
public class AdminResponse {

    @Schema(description = "Account ID linked to auth service", example = "1")
    private Long accountId;

    @Schema(description = "Admin name", example = "John Admin")
    private String name;

    @Schema(description = "Contact email", example = "admin@devwonder.com")
    private String email;

    @Schema(description = "Contact phone number", example = "+84987654321")
    private String phone;

    @Schema(description = "Company name", example = "DevWonder Inc.")
    private String companyName;

    @Schema(description = "Require login email confirmation", example = "false")
    private Boolean requireLoginEmailConfirmation;
}
