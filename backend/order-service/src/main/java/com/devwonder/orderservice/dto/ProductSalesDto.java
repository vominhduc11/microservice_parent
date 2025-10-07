package com.devwonder.orderservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesDto {
    public Long productId;
    public String productName;
    public Integer soldQuantity;
    public BigDecimal revenue;
    public Double growth;
}