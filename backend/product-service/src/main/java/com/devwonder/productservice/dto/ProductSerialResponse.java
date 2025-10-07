package com.devwonder.productservice.dto;

import com.devwonder.productservice.enums.ProductSerialStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSerialResponse {
    private Long id;
    private String serial;
    private Long productId;
    private String productName;
    private ProductSerialStatus status;
    private Long orderItemId;
    private Long dealerId;
}