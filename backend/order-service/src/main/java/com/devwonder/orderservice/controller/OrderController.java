package com.devwonder.orderservice.controller;

import com.devwonder.orderservice.dto.CreateOrderRequest;
import com.devwonder.orderservice.dto.OrderResponse;
import com.devwonder.orderservice.dto.ProductInfo;
import com.devwonder.common.enums.OrderItemStatus;
import com.devwonder.orderservice.enums.PaymentStatus;
import com.devwonder.orderservice.service.OrderService;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order/orders")
@Tag(name = "Order Management", description = "Order management endpoints for dealers")
@RequiredArgsConstructor
@Slf4j
@Validated
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create Order",
               description = "Create a new order for a dealer. Requires DEALER role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Order created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<OrderResponse>> createOrder(
            @Parameter(description = "Order creation request", required = true)
            @Valid @RequestBody CreateOrderRequest request) {

        log.info("Received create order request for dealer: {}", request.getIdDealer());

        try {
            OrderResponse orderResponse = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(BaseResponse.success("Order created successfully", orderResponse));

        } catch (Exception e) {
            log.error("Failed to create order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to create order: " + e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Get All Orders",
               description = "Retrieve all orders in the system. Requires ADMIN role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<OrderResponse>>> getAllOrders() {

        log.info("Received get all orders request");

        try {
            List<OrderResponse> orders = orderService.getAllOrders();
            return ResponseEntity.ok(BaseResponse.success("Orders retrieved successfully", orders));

        } catch (Exception e) {
            log.error("Failed to retrieve all orders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    @GetMapping("/dealer/{dealerId}")
    @Operation(summary = "Get Dealer Orders",
               description = "Retrieve all orders for a specific dealer. Optionally filter by payment status and include soft-deleted orders. Requires DEALER role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<OrderResponse>>> getDealerOrders(
            @Parameter(description = "Dealer ID", required = true)
            @PathVariable @ValidId Long dealerId,
            @Parameter(description = "Payment status filter (optional)", required = false)
            @RequestParam(required = false) PaymentStatus status,
            @Parameter(description = "Include soft-deleted orders (default: false)", required = false)
            @RequestParam(required = false, defaultValue = "false") boolean includeDeleted) {

        log.info("Received get orders request for dealer: {} with status: {} includeDeleted: {}", dealerId, status, includeDeleted);

        try {
            List<OrderResponse> orders = orderService.getDealerOrders(dealerId, status, includeDeleted);
            return ResponseEntity.ok(BaseResponse.success("Orders retrieved successfully", orders));

        } catch (Exception e) {
            log.error("Failed to retrieve dealer orders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get Order by ID",
               description = "Retrieve a specific order by ID. Requires DEALER role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<OrderResponse>> getOrderById(
            @Parameter(description = "Order ID", required = true)
            @PathVariable @ValidId Long orderId) {

        log.info("Received get order request for order: {}", orderId);

        try {
            OrderResponse orderResponse = orderService.getOrderById(orderId);
            return ResponseEntity.ok(BaseResponse.success("Order retrieved successfully", orderResponse));

        } catch (ResourceNotFoundException e) {
            log.error("Order not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to retrieve order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve order: " + e.getMessage()));
        }
    }

    @PatchMapping("/{orderId}/payment-status")
    @Operation(summary = "Update Payment Status",
               description = "Update payment status of an order. Requires ADMIN role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "400", description = "Invalid payment status"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<OrderResponse>> updatePaymentStatus(
            @Parameter(description = "Order ID", required = true)
            @PathVariable @ValidId Long orderId,
            @Parameter(description = "Payment status", required = true)
            @RequestParam PaymentStatus paymentStatus) {

        log.info("Received update payment status request for order: {} to status: {}", orderId, paymentStatus);

        try {
            OrderResponse orderResponse = orderService.updatePaymentStatus(orderId, paymentStatus);
            return ResponseEntity.ok(BaseResponse.success("Payment status updated successfully", orderResponse));

        } catch (ResourceNotFoundException e) {
            log.error("Order not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update payment status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to update payment status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{orderId}")
    @Operation(summary = "Soft Delete Order",
               description = "Soft delete an order (mark as deleted). Requires ADMIN role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order soft deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<OrderResponse>> softDeleteOrder(
            @Parameter(description = "Order ID", required = true)
            @PathVariable @ValidId Long orderId) {

        log.info("Received soft delete request for order: {}", orderId);

        try {
            OrderResponse orderResponse = orderService.softDeleteOrder(orderId);
            return ResponseEntity.ok(BaseResponse.success("Order soft deleted successfully", orderResponse));

        } catch (ResourceNotFoundException e) {
            log.error("Order not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to soft delete order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to soft delete order: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{orderId}/hard")
    @Operation(summary = "Hard Delete Order",
               description = "Permanently delete an order from database. Requires ADMIN role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order hard deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> hardDeleteOrder(
            @Parameter(description = "Order ID", required = true)
            @PathVariable @ValidId Long orderId) {

        log.info("Received hard delete request for order: {}", orderId);

        try {
            orderService.hardDeleteOrder(orderId);
            return ResponseEntity.ok(BaseResponse.success("Order hard deleted successfully", null));

        } catch (ResourceNotFoundException e) {
            log.error("Order not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to hard delete order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to hard delete order: " + e.getMessage()));
        }
    }

    @DeleteMapping("/bulk")
    @Operation(summary = "Soft Delete Multiple Orders (Bulk)",
               description = "Soft delete multiple orders in a single request. Only PAID orders can be deleted. Requires ADMIN role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders bulk soft delete completed"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> softDeleteOrdersBulk(@RequestBody List<Long> orderIds) {

        log.info("Received bulk soft delete request for {} orders", orderIds.size());

        try {
            orderService.softDeleteOrdersBulk(orderIds);
            return ResponseEntity.ok(BaseResponse.success("Orders bulk soft delete completed", null));

        } catch (Exception e) {
            log.error("Failed to bulk soft delete orders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to bulk soft delete orders: " + e.getMessage()));
        }
    }

    @DeleteMapping("/bulk/hard")
    @Operation(summary = "Hard Delete Multiple Orders (Bulk)",
               description = "Permanently delete multiple orders from database in a single request. Requires ADMIN role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders bulk hard delete completed"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> hardDeleteOrdersBulk(@RequestBody List<Long> orderIds) {

        log.info("Received bulk hard delete request for {} orders", orderIds.size());

        try {
            orderService.hardDeleteOrdersBulk(orderIds);
            return ResponseEntity.ok(BaseResponse.success("Orders bulk hard delete completed", null));

        } catch (Exception e) {
            log.error("Failed to bulk hard delete orders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to bulk hard delete orders: " + e.getMessage()));
        }
    }

    @PatchMapping("/{orderId}/restore")
    @Operation(summary = "Restore Order",
               description = "Restore a soft deleted order. Requires ADMIN role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Order restored successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "400", description = "Order is not deleted"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<OrderResponse>> restoreOrder(
            @Parameter(description = "Order ID", required = true)
            @PathVariable @ValidId Long orderId) {

        log.info("Received restore request for order: {}", orderId);

        try {
            OrderResponse orderResponse = orderService.restoreOrder(orderId);
            return ResponseEntity.ok(BaseResponse.success("Order restored successfully", orderResponse));

        } catch (ResourceNotFoundException e) {
            log.error("Order not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid operation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(BaseResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to restore order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to restore order: " + e.getMessage()));
        }
    }

    @GetMapping("/deleted")
    @Operation(summary = "Get Deleted Orders",
               description = "Retrieve all soft deleted orders. Requires ADMIN role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Deleted orders retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<OrderResponse>>> getDeletedOrders() {

        log.info("Received get deleted orders request");

        try {
            List<OrderResponse> orders = orderService.getDeletedOrders();
            return ResponseEntity.ok(BaseResponse.success("Deleted orders retrieved successfully", orders));

        } catch (Exception e) {
            log.error("Failed to retrieve deleted orders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve deleted orders: " + e.getMessage()));
        }
    }

    @GetMapping("/dealer/{dealerId}/purchased-products")
    @Operation(summary = "Get Dealer Purchased Products",
               description = "Retrieve all products purchased by a specific dealer. Products are considered purchased if they appear in orders or have product serials allocated to the dealer. Requires DEALER role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Purchased products retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductInfo>>> getDealerPurchasedProducts(
            @Parameter(description = "Dealer ID", required = true)
            @PathVariable @ValidId Long dealerId) {

        log.info("Received get purchased products request for dealer: {}", dealerId);

        try {
            List<ProductInfo> productInfos = orderService.getDealerPurchasedProducts(dealerId);
            return ResponseEntity.ok(BaseResponse.success("Purchased products retrieved successfully", productInfos));

        } catch (Exception e) {
            log.error("Failed to retrieve dealer purchased products: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve purchased products: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search Orders",
               description = "Search orders by keyword in order code. Requires ADMIN role authentication via API Gateway.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orders search completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<OrderResponse>>> searchOrders(
            @Parameter(description = "Search query - order code", required = true)
            @RequestParam String q,
            @Parameter(description = "Maximum number of results (default: 10)", required = false)
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Searching orders with query: '{}', limit: {}", q, limit);

        try {
            List<OrderResponse> orders = orderService.searchOrders(q, limit);
            return ResponseEntity.ok(BaseResponse.success("Orders search completed successfully", orders));

        } catch (Exception e) {
            log.error("Failed to search orders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to search orders: " + e.getMessage()));
        }
    }

}