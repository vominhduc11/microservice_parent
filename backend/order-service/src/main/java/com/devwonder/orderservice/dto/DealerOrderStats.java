package com.devwonder.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealerOrderStats {
    private Long dealerId;
    private String companyName;
    private String email;
    private String phone;
    private String city;
    private Long totalOrders;
    private Long paidOrders;
    private Long unpaidOrders;
    private BigDecimal totalRevenue;
    private LocalDateTime lastOrderDate;
    private LocalDateTime firstOrderDate;
}