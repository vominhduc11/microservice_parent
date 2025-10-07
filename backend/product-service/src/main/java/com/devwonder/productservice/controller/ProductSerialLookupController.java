package com.devwonder.productservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.productservice.dto.ProductSerialBulkStatusUpdateRequest;
import com.devwonder.productservice.service.ProductSerialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/product/product-serial")
@Tag(name = "Inter-Service APIs", description = "🔗 Direct service-to-service communication (API Key required)")
@RequiredArgsConstructor
@Slf4j
public class ProductSerialLookupController {

    private final ProductSerialService productSerialService;

    @GetMapping("/serial/{serial}")
    @Operation(
        summary = "Get Product Serial ID by Serial Number",
        description = "Retrieve the database ID of a product serial by its serial number string. Used by inter-service calls (warranty service). Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serial ID retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Product serial not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Long>> getProductSerialIdBySerial(@PathVariable String serial) {

        log.info("Looking up product serial ID for serial: {}", serial);

        Long productSerialId = productSerialService.getProductSerialIdBySerial(serial);

        log.info("Successfully retrieved product serial ID: {} for serial: {}", productSerialId, serial);

        return ResponseEntity.ok(BaseResponse.success("Product serial ID retrieved successfully", productSerialId));
    }

    @PostMapping("/bulk-status")
    @Operation(
        summary = "Update Multiple Product Serial Status to SOLD_TO_CUSTOMER",
        description = "Update status of multiple product serials to SOLD_TO_CUSTOMER. Used by warranty service after warranty creation. Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serial statuses updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "404", description = "Some product serials not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<String>> updateProductSerialsToSoldToCustomer(
            @Valid @RequestBody ProductSerialBulkStatusUpdateRequest request) {

        log.info("Updating {} product serials to SOLD_TO_CUSTOMER status", request.getSerialNumbers().size());

        int updatedCount = productSerialService.updateProductSerialsToSoldToCustomer(request.getSerialNumbers());

        String message = String.format("Successfully updated %d product serials to SOLD_TO_CUSTOMER", updatedCount);
        log.info(message);

        return ResponseEntity.ok(BaseResponse.success(message, null));
    }

    @GetMapping("/{productSerialId}/details")
    @Operation(
        summary = "Get Product Serial Details by ID",
        description = "Retrieve detailed product serial information including product details by product serial ID. Used by inter-service calls (warranty service). Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product serial details retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Product serial not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<com.devwonder.productservice.dto.ProductSerialDetailsResponse>> getProductSerialDetails(@PathVariable Long productSerialId) {

        log.info("Looking up product serial details for ID: {}", productSerialId);

        com.devwonder.productservice.dto.ProductSerialDetailsResponse productSerialDetails = productSerialService.getProductSerialDetails(productSerialId);

        log.info("Successfully retrieved product serial details for ID: {}", productSerialId);

        return ResponseEntity.ok(BaseResponse.success("Product serial details retrieved successfully", productSerialDetails));
    }
}