package com.devwonder.reportservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.reportservice.dto.OverviewResponse;
import com.devwonder.reportservice.service.OverviewService;
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
@Tag(name = "Overview Reports", description = "📊 Tổng quan - Essential Metrics API cho giao diện báo cáo")
public class OverviewController {

    private final OverviewService overviewService;

    @GetMapping("/overview")
    @Operation(
            summary = "Get Overview Dashboard Data",
            description = "Lấy dữ liệu tổng quan cho tab 'Tổng quan' bao gồm KPI cards, essential stats, " +
                    "dealer segmentation và charts data. API này tối ưu cho giao diện dashboard chính.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Overview data retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date range parameters"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Valid JWT required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<OverviewResponse>> getOverviewData(
            @Parameter(description = "Ngày bắt đầu (YYYY-MM-DD)", example = "2024-01-01")
            @RequestParam(defaultValue = "2024-01-01")
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            String from,

            @Parameter(description = "Ngày kết thúc (YYYY-MM-DD)", example = "2024-12-31")
            @RequestParam(defaultValue = "2024-12-31")
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            String to
    ) {
        log.info("GET /api/reports/overview - from: {}, to: {}", from, to);

        try {
            OverviewResponse data = overviewService.getOverviewData(from, to);

            BaseResponse<OverviewResponse> response = BaseResponse.success("Overview data retrieved successfully", data);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting overview data", e);

            BaseResponse<OverviewResponse> errorResponse = BaseResponse.error("Failed to retrieve overview data: " + e.getMessage());

            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}