package com.devwonder.productservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductStockDto {
    public Long productId;
    public String productName;
    public Integer inStockCount;
    public Integer allocatedCount;
    public Integer soldCount;
}