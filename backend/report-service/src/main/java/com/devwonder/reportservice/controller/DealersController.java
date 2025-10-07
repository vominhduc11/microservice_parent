package com.devwonder.reportservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.reportservice.dto.DealersResponse;
import com.devwonder.reportservice.service.DealersService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dealers Reports", description = "👥 Đại lý - Dealers API cho giao diện báo cáo")
public class DealersController {

    private final DealersService dealersService;

    @GetMapping("/dealers")
    @Operation(
            summary = "Get Dealers Dashboard Data",
            description = "Lấy dữ liệu đại lý cho tab 'Đại lý' bao gồm dealer KPIs, segmentation, " +
                    "top dealers và detailed dealer information. API này tối ưu cho giao diện dashboard đại lý.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dealers data retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date range parameters"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Valid JWT required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<DealersResponse>> getDealersData(
            @Parameter(description = "Ngày bắt đầu (YYYY-MM-DD)", example = "2024-01-01")
            @RequestParam(defaultValue = "2024-01-01")
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            String from,

            @Parameter(description = "Ngày kết thúc (YYYY-MM-DD)", example = "2024-12-31")
            @RequestParam(defaultValue = "2024-12-31")
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            String to,

            @Parameter(description = "Số lượng top dealers cần lấy", example = "10")
            @RequestParam(defaultValue = "10")
            Integer limit
    ) {
        log.info("GET /api/reports/dealers - from: {}, to: {}, limit: {}", from, to, limit);

        try {
            DealersResponse data = dealersService.getDealersData(from, to, limit);

            BaseResponse<DealersResponse> response = BaseResponse.success("Dealers data retrieved successfully", data);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting dealers data", e);

            BaseResponse<DealersResponse> errorResponse = BaseResponse.error("Failed to retrieve dealers data: " + e.getMessage());

            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}