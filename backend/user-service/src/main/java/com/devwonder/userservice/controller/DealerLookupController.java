package com.devwonder.userservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.userservice.dto.DealerResponse;
import com.devwonder.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dealer-service")
@Tag(name = "Dealer Inter-Service APIs", description = "🏪 Dealer service-to-service communication (API Key required)")
@RequiredArgsConstructor
@Slf4j
public class DealerLookupController {

    private final UserService userService;

    @GetMapping("/dealers/{dealerId}")
    @Operation(
        summary = "Get Dealer Information",
        description = "Retrieve dealer information by ID with optional field filtering. Used by order service. Requires API key authentication.",
        security = @SecurityRequirement(name = "apiKey")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dealer retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Dealer not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<DealerResponse>> getDealerInfo(
            @PathVariable Long dealerId,
            @RequestParam(required = false) String fields) {

        log.info("Inter-service call: Getting dealer info for ID: {} with fields: {}", dealerId, fields);

        DealerResponse dealer = userService.getDealerById(dealerId, fields);
        return ResponseEntity.ok(BaseResponse.success("Dealer retrieved successfully", dealer));
    }
}