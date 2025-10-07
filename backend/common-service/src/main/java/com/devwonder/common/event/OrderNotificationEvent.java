package com.devwonder.common.event;

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
public class OrderNotificationEvent {
    private Long orderId;
    private String orderCode;
    private Long dealerId;
    private String dealerName;
    private String dealerEmail;
    private String dealerPhone;
    private String dealerCity;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private LocalDateTime orderTime;
}