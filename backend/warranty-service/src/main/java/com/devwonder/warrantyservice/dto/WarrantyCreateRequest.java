package com.devwonder.warrantyservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyCreateRequest {

    @NotNull(message = "Product ID is required")
    @Positive(message = "Product ID must be positive")
    private Long productId;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotEmpty(message = "Serial numbers are required")
    private List<String> serialNumbers;

    @NotNull(message = "Customer information is required")
    @Valid
    private CustomerInfo customer;
}