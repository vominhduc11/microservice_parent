package com.devwonder.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dealer registration request")
public class DealerRequest {
    
    @NotBlank(message = "Company name is required")
    @Size(max = 255, message = "Company name must not exceed 255 characters")
    @Schema(description = "Company name", example = "ABC Trading Co., Ltd")
    private String companyName;
    
    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    @Schema(description = "Company address", example = "123 Business Street, District 1")
    private String address;
    
    @NotBlank(message = "Phone is required")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Schema(description = "Phone number", example = "+84901234567")
    private String phone;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Schema(description = "Email address", example = "contact@abctrading.com")
    private String email;
    
    @NotBlank(message = "District is required")
    @Size(max = 100, message = "District must not exceed 100 characters")
    @Schema(description = "District", example = "District 1")
    private String district;
    
    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    @Schema(description = "City", example = "Ho Chi Minh City")
    private String city;
}