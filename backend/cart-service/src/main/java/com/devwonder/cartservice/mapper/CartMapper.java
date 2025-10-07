package com.devwonder.cartservice.mapper;

import com.devwonder.cartservice.dto.CartResponse;
import com.devwonder.cartservice.entity.ProductOfCart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartMapper {

    /**
     * Convert ProductOfCart entity to CartItemResponse DTO
     */
    @Mapping(target = "cartId", source = "id")
    @Mapping(target = "addedAt", source = "createdAt")
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(productOfCart.getQuantity(), productOfCart.getUnitPrice()))")
    CartResponse.CartItemResponse toCartItemResponse(ProductOfCart productOfCart);

    /**
     * Convert list of ProductOfCart entities to list of CartItemResponse DTOs
     */
    List<CartResponse.CartItemResponse> toCartItemResponseList(List<ProductOfCart> productOfCarts);

    /**
     * Calculate subtotal for cart item
     */
    default BigDecimal calculateSubtotal(Integer quantity, BigDecimal unitPrice) {
        if (quantity == null || unitPrice == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}