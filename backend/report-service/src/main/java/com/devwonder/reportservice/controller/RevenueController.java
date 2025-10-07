package com.devwonder.reportservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.reportservice.dto.RevenueResponse;
import com.devwonder.reportservice.service.RevenueService;
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
@Tag(name = "Revenue Reports", description = "💰 Doanh thu - Revenue API cho giao diện báo cáo")
public class RevenueController {

    private final RevenueService revenueService;

    @GetMapping("/revenue")
    @Operation(
            summary = "Get Revenue Dashboard Data",
            description = "Lấy dữ liệu doanh thu cho tab 'Doanh thu' bao gồm revenue KPIs, charts data, " +
                    "và chi tiết doanh thu theo sản phẩm. API này tối ưu cho giao diện dashboard doanh thu.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Revenue data retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date range parameters"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Valid JWT required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<RevenueResponse>> getRevenueData(
            @Parameter(description = "Ngày bắt đầu (YYYY-MM-DD)", example = "2024-01-01")
            @RequestParam(defaultValue = "2024-01-01")
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            String from,

            @Parameter(description = "Ngày kết thúc (YYYY-MM-DD)", example = "2024-12-31")
            @RequestParam(defaultValue = "2024-12-31")
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            String to
    ) {
        log.info("GET /api/reports/revenue - from: {}, to: {}", from, to);

        try {
            RevenueResponse data = revenueService.getRevenueData(from, to);

            BaseResponse<RevenueResponse> response = BaseResponse.success("Revenue data retrieved successfully", data);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting revenue data", e);

            BaseResponse<RevenueResponse> errorResponse = BaseResponse.error("Failed to retrieve revenue data: " + e.getMessage());

            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}