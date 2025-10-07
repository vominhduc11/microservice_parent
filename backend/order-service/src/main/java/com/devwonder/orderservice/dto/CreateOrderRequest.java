package com.devwonder.orderservice.dto;

import com.devwonder.common.validation.ValidId;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @ValidId
    private Long idDealer;

    @NotEmpty(message = "Order items cannot be empty")
    @Valid
    private List<OrderItemRequest> orderItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {

        @ValidId
        private Long idProduct;

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.01", message = "Unit price must be greater than 0")
        @Digits(integer = 10, fraction = 2, message = "Unit price must have at most 2 decimal places")
        private BigDecimal unitPrice;

        @NotNull(message = "Quantity is required")
        @jakarta.validation.constraints.Min(value = 1, message = "Quantity must be at least 1")
        @jakarta.validation.constraints.Max(value = 999, message = "Quantity cannot exceed 999")
        private Integer quantity;
    }
}