package com.devwonder.cartservice.dto;

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
public class CartResponse {

    private Long dealerId;
    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal totalPrice;
    private LocalDateTime lastUpdated;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemResponse {
        private Long cartId;
        private Long productId;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private LocalDateTime addedAt;
    }
}