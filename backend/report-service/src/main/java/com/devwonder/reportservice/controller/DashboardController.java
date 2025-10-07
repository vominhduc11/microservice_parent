package com.devwonder.reportservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.reportservice.dto.DashboardResponse;
import com.devwonder.reportservice.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/report/dashboard")
@Tag(name = "Dashboard", description = "📊 Admin Dashboard - Analytics and Business Intelligence")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin")
    @Operation(
        summary = "Get Admin Dashboard Data (ADMIN Only)",
        description = "Retrieve comprehensive dashboard analytics including KPI metrics, inventory alerts, " +
                    "top performers, charts data, and ranking lists. This endpoint provides real-time business " +
                    "intelligence data for administrative decision making. Data includes revenue analytics, " +
                    "order completion rates, agent performance, product sales, and inventory management insights. " +
                    "Requires ADMIN role authorization for access to sensitive business metrics.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dashboard data retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error - Check service connectivity"),
        @ApiResponse(responseCode = "503", description = "Service unavailable - Fallback data provided")
    })
    public ResponseEntity<BaseResponse<DashboardResponse>> getAdminDashboard() {
        // log.info("Admin dashboard data requested");

        try {
            DashboardResponse dashboardData = dashboardService.getDashboardData();

            BaseResponse<DashboardResponse> response = new BaseResponse<>(
                true,
                "Dashboard data retrieved successfully",
                dashboardData
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // log.error("Error retrieving dashboard data", e);

            BaseResponse<DashboardResponse> response = new BaseResponse<>(
                false,
                "Error retrieving dashboard data: " + e.getMessage(),
                null
            );

            return ResponseEntity.status(500).body(response);
        }
    }
}