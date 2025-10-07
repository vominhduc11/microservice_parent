package com.devwonder.orderservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerOrderStatsDto {
    public Long dealerId;
    public String companyName;
    public Long totalOrders;
    public BigDecimal totalRevenue;
}