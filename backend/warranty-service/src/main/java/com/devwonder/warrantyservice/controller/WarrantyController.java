package com.devwonder.warrantyservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.warrantyservice.dto.WarrantyCreateRequest;
import com.devwonder.warrantyservice.dto.WarrantyResponse;
import com.devwonder.warrantyservice.dto.WarrantyBulkCreateResponse;
import com.devwonder.warrantyservice.service.WarrantyService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/warranty")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Warranty Management", description = "APIs for managing product warranties")
public class WarrantyController {

        private final WarrantyService warrantyService;

        @PostMapping
        @Operation(summary = "Create warranties for purchase", description = "Creates warranties for purchased products. Handles both new and existing customers. DEALER role required via API Gateway.", security = @SecurityRequirement(name = "bearerAuth"))
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Warranties created successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Some warranties already exist")
        })
        public ResponseEntity<BaseResponse<WarrantyBulkCreateResponse>> createWarranties(
                        @Valid @RequestBody WarrantyCreateRequest request) {

                log.info("Creating warranties for product: {} with {} serials",
                                request.getProductId(), request.getSerialNumbers().size());

                try {
                        WarrantyBulkCreateResponse response = warrantyService.createWarranties(request);

                        HttpStatus status = response.getFailedSerials().isEmpty() ? HttpStatus.CREATED
                                        : HttpStatus.PARTIAL_CONTENT;

                        String message = response.getFailedSerials().isEmpty() ? "All warranties created successfully"
                                        : String.format("Created %d/%d warranties. %d failed.",
                                                        response.getTotalWarranties(),
                                                        request.getSerialNumbers().size(),
                                                        response.getFailedSerials().size());

                        return ResponseEntity.status(status)
                                        .body(BaseResponse.success(message, response));
                } catch (Exception e) {
                        log.error("Error creating warranties: {}", e.getMessage());
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(BaseResponse.error(e.getMessage()));
                }
        }

        @GetMapping("/check/{serialNumber}")
        @Operation(summary = "Check warranty by serial number", description = "Checks active warranty for a product by its serial number (e.g., SN003). Public endpoint - no authentication required.", security = {})
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Active warranty found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No active warranty found or product serial not found")
        })
        public ResponseEntity<BaseResponse<WarrantyResponse>> checkWarrantyBySerialNumber(
                        @PathVariable String serialNumber) {

                log.info("Checking warranty for serial number: {}", serialNumber);

                try {
                        WarrantyResponse warranty = warrantyService.getWarrantyBySerialNumber(serialNumber);
                        return ResponseEntity.ok(BaseResponse.success("Active warranty found", warranty));
                } catch (Exception e) {
                        log.warn("No active warranty found for serial number {}: {}", serialNumber, e.getMessage());
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(BaseResponse.error(e.getMessage()));
                }
        }
}