package com.devwonder.productservice.dto;

import com.devwonder.productservice.enums.ProductSerialStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSerialStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ProductSerialStatus status;
}