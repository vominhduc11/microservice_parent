package com.devwonder.productservice.dto;

import com.devwonder.common.enums.OrderItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private Long id;
    private BigDecimal unitPrice;
    private Integer quantity;
    private Long idProduct;
    private Long idOrder;
    private OrderItemStatus status;
}