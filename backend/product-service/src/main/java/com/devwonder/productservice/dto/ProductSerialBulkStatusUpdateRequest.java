package com.devwonder.productservice.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSerialBulkStatusUpdateRequest {

    @NotEmpty(message = "Serial numbers are required")
    private List<String> serialNumbers;

    @NotNull(message = "Status is required")
    private String status; // Will be "SOLD_TO_CUSTOMER"
}