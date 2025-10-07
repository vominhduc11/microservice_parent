package com.devwonder.cartservice.controller;

import com.devwonder.cartservice.dto.AddToCartRequest;
import com.devwonder.cartservice.dto.CartResponse;
import com.devwonder.cartservice.service.DealerCartService;
import com.devwonder.common.dto.BaseResponse;
import com.devwonder.common.exception.ResourceNotFoundException;
import com.devwonder.common.validation.ValidId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/cart")
@Tag(name = "Dealer Cart Management", description = "Dealer cart management endpoints")
@RequiredArgsConstructor
@Slf4j
@Validated
public class DealerCartController {

    private final DealerCartService dealerCartService;

    @PostMapping("/items")
    @Operation(summary = "Add Product to Dealer Cart",
               description = "Add a product to dealer's cart. Requires DEALER role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product added to cart successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<CartResponse>> addProductToCart(
            @Parameter(description = "Product and dealer information", required = true)
            @Valid @RequestBody AddToCartRequest request) {

        log.info("Received add to cart request - dealer: {}, product: {}, quantity: {}",
                request.getDealerId(), request.getProductId(), request.getQuantity());

        try {
            CartResponse cartResponse = dealerCartService.addProductToCart(request);
            return ResponseEntity.ok(BaseResponse.success("Product added to cart successfully", cartResponse));

        } catch (Exception e) {
            log.error("Failed to add product to cart: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to add product to cart: " + e.getMessage()));
        }
    }

    @GetMapping("/dealer/{dealerId}")
    @Operation(summary = "Get Dealer Cart",
               description = "Retrieve all products in a dealer's cart. Requires DEALER role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cart retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<CartResponse>> getDealerCart(
            @Parameter(description = "Dealer ID", required = true)
            @PathVariable @ValidId Long dealerId) {

        log.info("Received get cart request for dealer: {}", dealerId);

        try {
            CartResponse cartResponse = dealerCartService.getDealerCart(dealerId);
            return ResponseEntity.ok(BaseResponse.success("Cart retrieved successfully", cartResponse));

        } catch (Exception e) {
            log.error("Failed to retrieve dealer cart: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve cart: " + e.getMessage()));
        }
    }

    @DeleteMapping("/items/{cartId}")
    @Operation(summary = "Remove Cart Item",
               description = "Remove a specific cart item by cart ID. Requires DEALER role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cart item removed successfully"),
            @ApiResponse(responseCode = "404", description = "Cart item not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<String>> removeCartItem(
            @Parameter(description = "Cart Item ID", required = true)
            @PathVariable @ValidId Long cartId) {

        log.info("Received remove cart item request - cartId: {}", cartId);

        try {
            dealerCartService.removeCartItem(cartId);
            return ResponseEntity.ok(BaseResponse.success("Cart item removed successfully", null));

        } catch (ResourceNotFoundException e) {
            log.error("Cart item not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to remove cart item: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to remove cart item: " + e.getMessage()));
        }
    }


    @PatchMapping("/items/{cartId}/quantity")
    @Operation(summary = "Update Cart Item Quantity",
               description = "Update quantity of a cart item. Supports increment (+), decrement (-), or set exact value. Requires DEALER role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cart item quantity updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid action or quantity value"),
            @ApiResponse(responseCode = "404", description = "Cart item not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<CartResponse>> updateCartItemQuantity(
            @Parameter(description = "Cart Item ID", required = true)
            @PathVariable @ValidId Long cartId,
            @Parameter(description = "Action: 'increment' to add 1, 'decrement' to subtract 1, 'set' to set exact quantity", required = true)
            @RequestParam String action,
            @Parameter(description = "Quantity value (only required when action=set)", required = false)
            @RequestParam(required = false) @Min(value = 0, message = "Quantity must be at least 0")
            @Max(value = 999, message = "Quantity cannot exceed 999") Integer quantity) {

        log.info("Received quantity update request - cartId: {}, action: {}, quantity: {}", cartId, action, quantity);

        try {
            CartResponse cartResponse;

            switch (action.toLowerCase()) {
                case "increment":
                    cartResponse = dealerCartService.incrementProductQuantity(cartId, 1);
                    break;
                case "decrement":
                    cartResponse = dealerCartService.decrementProductQuantity(cartId, 1);
                    break;
                case "set":
                    if (quantity == null) {
                        throw new IllegalArgumentException("Quantity value is required when action is 'set'");
                    }
                    cartResponse = dealerCartService.setProductQuantity(cartId, quantity);
                    break;
                default:
                    throw new IllegalArgumentException("Invalid action. Use 'increment', 'decrement', or 'set'");
            }

            return ResponseEntity.ok(BaseResponse.success("Cart item quantity updated successfully", cartResponse));

        } catch (ResourceNotFoundException e) {
            log.error("Cart item not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid quantity update request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update cart item quantity: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to update cart item quantity: " + e.getMessage()));
        }
    }

    @DeleteMapping("/dealer/{dealerId}")
    @Operation(summary = "Clear Dealer Cart",
               description = "Clear all cart items for a specific dealer. Requires DEALER role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dealer cart cleared successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<String>> clearDealerCart(
            @Parameter(description = "Dealer ID", required = true)
            @PathVariable @ValidId Long dealerId) {

        log.info("Received clear cart request for dealer: {}", dealerId);

        try {
            dealerCartService.clearDealerCart(dealerId);
            return ResponseEntity.ok(BaseResponse.success("Dealer cart cleared successfully", null));

        } catch (Exception e) {
            log.error("Failed to clear dealer cart: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to clear dealer cart: " + e.getMessage()));
        }
    }

}