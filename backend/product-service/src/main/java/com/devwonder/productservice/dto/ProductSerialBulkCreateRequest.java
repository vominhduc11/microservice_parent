package com.devwonder.productservice.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSerialBulkCreateRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotEmpty(message = "Serial numbers list cannot be empty")
    private List<@NotBlank(message = "Serial number cannot be blank") String> serialNumbers;
}