package com.devwonder.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInventoryResponse {
    private Long productId;
    private String productName;
    private Long availableCount;
    private Long soldCount;
    private Long assignedCount;
    private Long soldToCustomerCount;
    private Long totalCount;
}