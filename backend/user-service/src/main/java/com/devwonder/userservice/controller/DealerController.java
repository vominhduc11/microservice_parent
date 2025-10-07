package com.devwonder.userservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.userservice.dto.DealerRequest;
import com.devwonder.userservice.dto.DealerResponse;
import com.devwonder.userservice.dto.DealerUpdateRequest;
import com.devwonder.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/dealer")
@Tag(name = "Dealers", description = "🏪 Dealer management - Registration & public information")
@RequiredArgsConstructor
@Slf4j
public class DealerController {

    private final UserService userService;

    @GetMapping
    @Operation(
        summary = "Get All Dealers",
        description = "Retrieve a list of all dealers (business partners) in the system. " +
                    "This endpoint provides dealer company information including contact details and location.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dealers retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<DealerResponse>>> getAllDealers() {
        List<DealerResponse> dealers = userService.getAllDealers();
        BaseResponse<List<DealerResponse>> response = new BaseResponse<>(
            true,
            "Dealers retrieved successfully",
            dealers
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get Dealer by ID",
        description = "Retrieve detailed information of a specific dealer by ID with optional field filtering. " +
                    "This endpoint provides complete dealer profile including company information, contact details and location. " +
                    "Use 'fields' parameter to specify which fields to return (e.g., ?fields=companyName,email,phone). " +
                    "Available fields: accountId, companyName, address, phone, email, district, city.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dealer retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Dealer not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<DealerResponse>> getDealerById(
            @PathVariable Long id,
            @RequestParam(required = false) String fields) {
        DealerResponse dealer = userService.getDealerById(id, fields);
        BaseResponse<DealerResponse> response = new BaseResponse<>(
            true,
            "Dealer retrieved successfully",
            dealer
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(
        summary = "Search Dealers",
        description = "Search dealers by keyword in company name, phone, email or city. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dealers search completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<DealerResponse>>> searchDealers(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String fields) {

        log.info("Searching dealers with query: '{}', limit: {}, fields: {}", q, limit, fields);

        List<DealerResponse> dealers = userService.searchDealers(q, limit, fields);

        log.info("Found {} dealers matching query: '{}'", dealers.size(), q);

        return ResponseEntity.ok(BaseResponse.success("Dealers search completed successfully", dealers));
    }

    @PostMapping
    @Operation(
        summary = "Register New Dealer",
        description = "Register a new dealer (business partner) in the system. " +
                    "This endpoint creates dealer profile with company information, contact details and location. " +
                    "The accountId must correspond to an existing account in the auth service with DEALER role.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Dealer registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "409", description = "Dealer already exists for this account"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<DealerResponse>> registerDealer(@Valid @RequestBody DealerRequest dealerRequest) {
        log.info("Registering new dealer: {}", dealerRequest.getCompanyName());

        DealerResponse dealerResponse = userService.createDealer(dealerRequest);
        BaseResponse<DealerResponse> response = new BaseResponse<>(
            true,
            "Dealer registered successfully",
            dealerResponse
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}