package com.devwonder.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSerialBulkCreateResponse {

    private Long productId;
    private int totalRequested;
    private int totalCreated;
    private int totalSkipped;
    private List<ProductSerialResponse> createdSerials;
    private List<String> skippedSerials;
}