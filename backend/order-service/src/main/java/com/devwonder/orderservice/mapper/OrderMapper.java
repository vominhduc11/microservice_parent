package com.devwonder.orderservice.mapper;

import com.devwonder.orderservice.dto.OrderResponse;
import com.devwonder.orderservice.entity.Order;
import com.devwonder.orderservice.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    /**
     * Convert Order entity to OrderResponse DTO
     */
    @Mapping(target = "totalPrice", expression = "java(calculateTotalPrice(order.getOrderItems()))")
    OrderResponse toOrderResponse(Order order);

    /**
     * Convert list of Order entities to list of OrderResponse DTOs
     */
    List<OrderResponse> toOrderResponseList(List<Order> orders);

    /**
     * Convert OrderItem entity to OrderItemResponse DTO
     */
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(orderItem.getQuantity(), orderItem.getUnitPrice()))")
    OrderResponse.OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    /**
     * Convert list of OrderItem entities to list of OrderItemResponse DTOs
     */
    List<OrderResponse.OrderItemResponse> toOrderItemResponseList(List<OrderItem> orderItems);

    /**
     * Calculate subtotal for order item
     */
    default BigDecimal calculateSubtotal(Integer quantity, BigDecimal unitPrice) {
        if (quantity == null || unitPrice == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    /**
     * Calculate total price for order
     */
    default BigDecimal calculateTotalPrice(List<OrderItem> orderItems) {
        if (orderItems == null || orderItems.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return orderItems.stream()
                .map(item -> calculateSubtotal(item.getQuantity(), item.getUnitPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}