package com.devwonder.productservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.productservice.dto.ProductSerialCreateRequest;
import com.devwonder.productservice.dto.ProductSerialResponse;
import com.devwonder.productservice.dto.ProductSerialBulkCreateRequest;
import com.devwonder.productservice.dto.ProductSerialBulkCreateResponse;
import com.devwonder.productservice.dto.ProductSerialStatusUpdateRequest;
import com.devwonder.productservice.dto.ProductSerialBulkStatusUpdateRequest;
import com.devwonder.productservice.dto.ProductInventoryResponse;
import com.devwonder.productservice.enums.ProductSerialStatus;
import com.devwonder.productservice.service.ProductSerialService;
import com.devwonder.productservice.service.ProductStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product/product-serials")
@Tag(name = "Product Inventory", description = "📋 Serial number tracking & Inventory management")
@RequiredArgsConstructor
@Slf4j
public class ProductSerialController {
    
    private final ProductSerialService productSerialService;
    private final ProductStockService productStockService;
    
    @PostMapping("/serials")
    @Operation(
        summary = "Create Multiple Product Serials (Bulk)",
        description = "Create multiple product serial numbers in a single request. Requires ADMIN role authentication via API Gateway. Skips duplicate serials and returns detailed results.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Product serials created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data or empty serial numbers list"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductSerialBulkCreateResponse>> createProductSerialsBulk(@Valid @RequestBody ProductSerialBulkCreateRequest request) {

        log.info("Creating bulk product serials: {} serial numbers for product ID: {} by ADMIN user",
                 request.getSerialNumbers().size(), request.getProductId());

        ProductSerialBulkCreateResponse response = productSerialService.createProductSerialsBulk(request);

        log.info("Bulk creation completed: {} created, {} skipped out of {} requested for product ID: {}",
                response.getTotalCreated(), response.getTotalSkipped(), response.getTotalRequested(), response.getProductId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success("Product serials bulk creation completed", response));
    }

    @GetMapping("/{productId}/serials")
    @Operation(
        summary = "Get Product Serials by Product ID",
        description = "Retrieve all product serials for a specific product. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serials retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductSerialResponse>>> getProductSerialsByProductId(@PathVariable Long productId) {

        log.info("Requesting product serials for product ID: {} by authorized user", productId);

        List<ProductSerialResponse> productSerials = productSerialService.getProductSerialsByProductId(productId);

        log.info("Retrieved {} product serials for product ID: {}", productSerials.size(), productId);

        return ResponseEntity.ok(BaseResponse.success("Product serials retrieved successfully", productSerials));
    }

    @PostMapping("/serial")
    @Operation(
        summary = "Create Single Product Serial",
        description = "Create a single product serial number. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Product serial created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid product serial data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "409", description = "Conflict - Product serial already exists"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductSerialResponse>> createSingleProductSerial(@Valid @RequestBody ProductSerialCreateRequest request) {

        log.info("Creating single product serial: {} for product ID: {} by ADMIN user", request.getSerial(), request.getProductId());

        ProductSerialResponse productSerial = productSerialService.createProductSerial(request);

        log.info("Successfully created single product serial with ID: {}", productSerial.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success("Product serial created successfully", productSerial));
    }

    @DeleteMapping("/serial/{serialId}")
    @Operation(
        summary = "Delete Product Serial",
        description = "Delete a specific product serial by ID. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serial deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product serial not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> deleteProductSerial(@PathVariable Long serialId) {

        log.info("Deleting product serial with ID: {} by ADMIN user", serialId);

        productSerialService.deleteProductSerial(serialId);

        log.info("Successfully deleted product serial with ID: {}", serialId);

        return ResponseEntity.ok(BaseResponse.success("Product serial deleted successfully", null));
    }

    @DeleteMapping("/serials")
    @Operation(
        summary = "Delete Multiple Product Serials (Bulk)",
        description = "Delete multiple product serials in a single request. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serials deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> deleteProductSerialsBulk(@RequestBody List<Long> serialIds) {

        log.info("Deleting {} product serials in bulk by ADMIN user", serialIds.size());

        productSerialService.deleteProductSerialsBulk(serialIds);

        log.info("Successfully completed bulk deletion for {} product serials", serialIds.size());

        return ResponseEntity.ok(BaseResponse.success("Product serials bulk deletion completed", null));
    }

    @PatchMapping("/serial/{serialId}/status")
    @Operation(
        summary = "Update Product Serial Status",
        description = "Update status of a specific product serial (IN_STOCK/ALLOCATED_TO_DEALER/ASSIGN_TO_ORDER_ITEM/SOLD_TO_CUSTOMER). Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serial status updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product serial not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductSerialResponse>> updateProductSerialStatus(
            @PathVariable Long serialId,
            @Valid @RequestBody ProductSerialStatusUpdateRequest request) {

        log.info("Updating status for product serial with ID: {} to {} by ADMIN user", serialId, request.getStatus());

        ProductSerialResponse updatedSerial = productSerialService.updateProductSerialStatus(serialId, request);

        log.info("Successfully updated status for product serial with ID: {} to {}", serialId, request.getStatus());

        return ResponseEntity.ok(BaseResponse.success("Product serial status updated successfully", updatedSerial));
    }

    @GetMapping("/{productId}/inventory")
    @Operation(
        summary = "Get Product Inventory Count",
        description = "Get detailed inventory count for a product by status (IN_STOCK/ALLOCATED_TO_DEALER/ASSIGN_TO_ORDER_ITEM/SOLD_TO_CUSTOMER). Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product inventory retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductInventoryResponse>> getProductInventory(@PathVariable Long productId) {

        log.info("Getting inventory for product ID: {} by ADMIN user", productId);

        ProductInventoryResponse inventory = productSerialService.getProductInventory(productId);

        log.info("Retrieved inventory for product ID: {} - {} available out of {} total",
                productId, inventory.getAvailableCount(), inventory.getTotalCount());

        return ResponseEntity.ok(BaseResponse.success("Product inventory retrieved successfully", inventory));
    }

    @GetMapping("/{productId}/available-count")
    @Operation(
        summary = "Get Available Product Serial Count",
        description = "Get count of available product serials for a specific product. Requires DEALER role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Available count retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Long>> getAvailableProductSerialCount(@PathVariable Long productId) {

        log.info("Getting available product serial count for product ID: {} by DEALER user", productId);

        Long availableCount = productSerialService.getAvailableProductSerialCount(productId);

        log.info("Retrieved available count for product ID: {} - {} available", productId, availableCount);

        return ResponseEntity.ok(BaseResponse.success("Available product serial count retrieved successfully", availableCount));
    }

    @GetMapping("/{productId}/serials/status/{status}")
    @Operation(
        summary = "Get Product Serials by Status",
        description = "Retrieve all product serials for a specific product filtered by status (IN_STOCK/ALLOCATED_TO_DEALER/ASSIGN_TO_ORDER_ITEM/SOLD_TO_CUSTOMER). Requires ADMIN or DEALER role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serials retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status parameter"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN or DEALER role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductSerialResponse>>> getProductSerialsByStatus(
            @PathVariable Long productId,
            @PathVariable ProductSerialStatus status) {

        log.info("Requesting product serials for product ID: {} with status: {} by authorized user", productId, status);

        List<ProductSerialResponse> productSerials = productSerialService.getProductSerialsByProductIdAndStatus(productId, status);

        log.info("Retrieved {} product serials for product ID: {} with status: {}", productSerials.size(), productId, status);

        return ResponseEntity.ok(BaseResponse.success("Product serials retrieved successfully", productSerials));
    }

    @PostMapping("/serials/assign-to-order-item/{orderItemId}")
    @Operation(
        summary = "Assign Multiple Product Serials to Order Item",
        description = "Assign multiple product serials to an order item. Updates all serial statuses to ASSIGN_TO_ORDER_ITEM. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serials assigned successfully"),
        @ApiResponse(responseCode = "400", description = "One or more serials not available for assignment"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "One or more product serials not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> assignSerialsToOrderItem(
            @PathVariable Long orderItemId,
            @RequestBody List<Long> serialIds) {

        log.info("Assigning {} product serials to order item {} by ADMIN user", serialIds.size(), orderItemId);

        productSerialService.assignSerialsToOrderItem(serialIds, orderItemId);

        log.info("Successfully assigned {} product serials to order item {}", serialIds.size(), orderItemId);

        return ResponseEntity.ok(BaseResponse.success("Product serials assigned to order item successfully", null));
    }

    @PostMapping("/serials/allocate-to-dealer/{dealerId}")
    @Operation(
        summary = "Allocate Multiple Product Serials to Dealer",
        description = "Allocate multiple product serials to a dealer. Updates all serial statuses from ASSIGN_TO_ORDER_ITEM to ALLOCATED_TO_DEALER. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serials allocated successfully"),
        @ApiResponse(responseCode = "400", description = "One or more serials not available for allocation"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "One or more product serials not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> allocateSerialsToDealer(
            @PathVariable Long dealerId,
            @RequestBody List<Long> serialIds) {

        log.info("Allocating {} product serials to dealer {} by ADMIN user", serialIds.size(), dealerId);

        productSerialService.allocateSerialsToDealer(serialIds, dealerId);

        log.info("Successfully allocated {} product serials to dealer {}", serialIds.size(), dealerId);

        return ResponseEntity.ok(BaseResponse.success("Product serials allocated to dealer successfully", null));
    }

    @PatchMapping("/serials/unassign-from-order-item/{orderItemId}")
    @Operation(
        summary = "Unassign Multiple Product Serials from Order Item",
        description = "Unassign multiple product serials from an order item. Updates all serial statuses from ASSIGN_TO_ORDER_ITEM back to IN_STOCK. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serials unassigned successfully"),
        @ApiResponse(responseCode = "400", description = "One or more serials not assigned to the order item"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "One or more product serials not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> unassignSerialsFromOrderItem(
            @PathVariable Long orderItemId,
            @RequestBody List<Long> serialIds) {

        log.info("Unassigning {} product serials from order item {} by ADMIN user", serialIds.size(), orderItemId);

        productSerialService.unassignSerialsFromOrderItem(serialIds, orderItemId);

        log.info("Successfully unassigned {} product serials from order item {}", serialIds.size(), orderItemId);

        return ResponseEntity.ok(BaseResponse.success("Product serials unassigned from order item successfully", null));
    }

    @GetMapping("/order-items/{orderItemId}/serials")
    @Operation(
        summary = "Get Assigned Product Serials by Order Item ID",
        description = "Retrieve all product serials assigned to a specific order item with ASSIGN_TO_ORDER_ITEM status. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assigned product serials retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductSerialResponse>>> getAssignedSerialsByOrderItemId(
            @PathVariable Long orderItemId) {

        log.info("Requesting assigned product serials for order item ID: {} by ADMIN user", orderItemId);

        List<ProductSerialResponse> productSerials = productSerialService.getAssignedSerialsByOrderItemId(orderItemId);

        log.info("Retrieved {} assigned product serials for order item ID: {}", productSerials.size(), orderItemId);

        return ResponseEntity.ok(BaseResponse.success("Assigned product serials retrieved successfully", productSerials));
    }

    @GetMapping("/order-items/{orderItemId}/allocated-serials")
    @Operation(
        summary = "Get Allocated Product Serials by Order Item ID",
        description = "Retrieve all product serials allocated to dealers for a specific order item with ALLOCATED_TO_DEALER status. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Allocated product serials retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductSerialResponse>>> getAllocatedSerialsByOrderItemId(
            @PathVariable Long orderItemId) {

        log.info("Requesting allocated product serials for order item ID: {} by ADMIN user", orderItemId);

        List<ProductSerialResponse> productSerials = productSerialService.getAllocatedSerialsByOrderItemId(orderItemId);

        log.info("Retrieved {} allocated product serials for order item ID: {}", productSerials.size(), orderItemId);

        return ResponseEntity.ok(BaseResponse.success("Allocated product serials retrieved successfully", productSerials));
    }

    @GetMapping("/dealer/{dealerId}/product-ids")
    @Operation(
        summary = "Get Product IDs with Serials by Dealer",
        description = "Get distinct product IDs that have serials allocated to a specific dealer. For inter-service communication. Requires API key authentication.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product IDs retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<Long>>> getProductIdsWithSerialsByDealer(
            @PathVariable Long dealerId,
            @RequestHeader("X-API-Key") String apiKey) {

        // Simple API key validation for inter-service communication
        if (!"INTER_SERVICE_KEY".equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(BaseResponse.error("Invalid API key"));
        }

        log.info("Getting product IDs with serials for dealer: {} via inter-service call", dealerId);

        try {
            List<Long> productIds = productSerialService.getProductIdsWithSerialsByDealer(dealerId);
            return ResponseEntity.ok(BaseResponse.success("Product IDs retrieved successfully", productIds));
        } catch (Exception e) {
            log.error("Failed to get product IDs with serials for dealer: {}", dealerId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve product IDs"));
        }
    }

    @GetMapping("/product/{productId}/dealer/{dealerId}/serials")
    @Operation(
        summary = "Get Product Serials by Product ID and Dealer ID",
        description = "Retrieve all product serials allocated to a specific dealer for a specific product. Requires DEALER role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serials retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - DEALER role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductSerialResponse>>> getProductSerialsByProductIdAndDealerId(
            @PathVariable Long productId,
            @PathVariable Long dealerId) {

        log.info("Getting product serials for product ID: {} and dealer ID: {} by authorized user", productId, dealerId);

        List<ProductSerialResponse> productSerials = productSerialService.getProductSerialsByProductIdAndDealerId(productId, dealerId);

        log.info("Retrieved {} product serials for product ID: {} and dealer ID: {}", productSerials.size(), productId, dealerId);

        return ResponseEntity.ok(BaseResponse.success("Product serials retrieved successfully", productSerials));
    }

    @PostMapping("/sync-all-stock")
    @Operation(
        summary = "Sync Stock for All Products",
        description = "Manually sync stock values for all products based on current IN_STOCK product serials count. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock sync completed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> syncAllProductsStock() {
        log.info("Syncing stock for all products by ADMIN user");

        try {
            productStockService.updateAllProductsStock();
            return ResponseEntity.ok(BaseResponse.success("Stock sync completed successfully for all products", null));
        } catch (Exception e) {
            log.error("Error syncing stock for all products", e);
            return ResponseEntity.status(500)
                    .body(BaseResponse.error("Failed to sync stock: " + e.getMessage()));
        }
    }

}