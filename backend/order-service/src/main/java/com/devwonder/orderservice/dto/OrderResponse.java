package com.devwonder.orderservice.dto;

import com.devwonder.orderservice.enums.PaymentStatus;
import com.devwonder.common.enums.OrderItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private Long idDealer;
    private String orderCode;
    private LocalDateTime createdAt;
    private PaymentStatus paymentStatus;
    private List<OrderItemResponse> orderItems;
    private BigDecimal totalPrice; // Calculated from orderItems

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long idProduct;
        private BigDecimal unitPrice;
        private Integer quantity;
        private OrderItemStatus status;
        private BigDecimal subtotal; // quantity * unitPrice
    }
}