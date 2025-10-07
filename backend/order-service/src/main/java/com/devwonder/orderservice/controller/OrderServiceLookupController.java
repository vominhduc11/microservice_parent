package com.devwonder.orderservice.controller;

import com.devwonder.orderservice.service.OrderService;
import com.devwonder.common.dto.BaseResponse;
import com.devwonder.common.enums.OrderItemStatus;
import com.devwonder.orderservice.dto.OrderItemResponse;
import com.devwonder.common.exception.ResourceNotFoundException;
import com.devwonder.common.validation.ValidId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order/order-service")
@Tag(name = "Inter-Service APIs", description = "🔗 Direct service-to-service communication (API Key required)")
@RequiredArgsConstructor
@Slf4j
@Validated
public class OrderServiceLookupController {

    private final OrderService orderService;

    @GetMapping("/items/{orderItemId}")
    @Operation(
        summary = "Get Order Item Details",
        description = "Get detailed information about an order item. Used by product service for validation. Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order item details retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Order item not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<OrderItemResponse>> getOrderItem(
            @Parameter(description = "Order Item ID", required = true)
            @PathVariable @ValidId Long orderItemId) {

        log.info("Inter-Service API: Get order item details for ID: {}", orderItemId);

        try {
            OrderItemResponse orderItem = orderService.getOrderItem(orderItemId);
            return ResponseEntity.ok(BaseResponse.success("Order item details retrieved successfully", orderItem));

        } catch (ResourceNotFoundException e) {
            log.error("Order item not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to get order item details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to get order item details: " + e.getMessage()));
        }
    }

    @PostMapping("/items/{orderItemId}/status")
    @Operation(
        summary = "Update Order Item Status",
        description = "Update the status of an order item. Used by product service for completion tracking. Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order item status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Order item not found"),
            @ApiResponse(responseCode = "400", description = "Invalid order item status"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<String>> updateOrderItemStatus(
            @Parameter(description = "Order Item ID", required = true)
            @PathVariable @ValidId Long orderItemId,
            @Parameter(description = "Order Item Status", required = true)
            @RequestParam OrderItemStatus status) {

        log.info("Inter-Service API: Update order item {} status to {}", orderItemId, status);

        try {
            orderService.updateOrderItemStatus(orderItemId, status);
            return ResponseEntity.ok(BaseResponse.success("Order item status updated successfully", null));

        } catch (ResourceNotFoundException e) {
            log.error("Order item not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update order item status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to update order item status: " + e.getMessage()));
        }
    }
}