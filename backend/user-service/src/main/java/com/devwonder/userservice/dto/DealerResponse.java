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
@Schema(description = "Dealer information response")
public class DealerResponse {

    @Schema(description = "Account ID linked to auth service", example = "101")
    private Long accountId;

    @Schema(description = "Company name", example = "ABC Electronics Co., Ltd")
    private String companyName;

    @Schema(description = "Business address", example = "123 Main Street")
    private String address;

    @Schema(description = "Contact phone number", example = "+84123456789")
    private String phone;

    @Schema(description = "Contact email", example = "contact@abcelectronics.com")
    private String email;

    @Schema(description = "District/Area", example = "District 1")
    private String district;

    @Schema(description = "City/Province", example = "Ho Chi Minh City")
    private String city;
}