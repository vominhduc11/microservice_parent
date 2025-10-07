package com.devwonder.productservice.dto;

import com.devwonder.productservice.enums.ProductSerialStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSerialCreateRequest {

    @NotBlank(message = "Serial number is required")
    private String serial;

    @NotNull(message = "Product ID is required")
    private Long productId;

    private ProductSerialStatus status = ProductSerialStatus.IN_STOCK;
}