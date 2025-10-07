package com.devwonder.productservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAlertsDto {
    public Integer lowStockCount;
    public Integer overstockCount;
    public String urgentProduct;
}