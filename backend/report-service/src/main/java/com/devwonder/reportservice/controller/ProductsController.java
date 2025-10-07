package com.devwonder.reportservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.reportservice.dto.ProductsResponse;
import com.devwonder.reportservice.service.ProductsService;
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
@Tag(name = "Products Reports", description = "📦 Sản phẩm - Products API cho giao diện báo cáo")
public class ProductsController {

    private final ProductsService productsService;

    @GetMapping("/products")
    @Operation(
            summary = "Get Products Dashboard Data",
            description = "Lấy dữ liệu sản phẩm cho tab 'Sản phẩm' bao gồm product KPIs, top products performance, " +
                    "low stock products và inventory summary. API này tối ưu cho giao diện dashboard sản phẩm.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Products data retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date range parameters"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Valid JWT required"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductsResponse>> getProductsData(
            @Parameter(description = "Ngày bắt đầu (YYYY-MM-DD)", example = "2024-01-01")
            @RequestParam(defaultValue = "2024-01-01")
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            String from,

            @Parameter(description = "Ngày kết thúc (YYYY-MM-DD)", example = "2024-12-31")
            @RequestParam(defaultValue = "2024-12-31")
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            String to,

            @Parameter(description = "Bao gồm thông tin tồn kho", example = "inventory")
            @RequestParam(defaultValue = "inventory")
            String include
    ) {
        log.info("GET /api/reports/products - from: {}, to: {}, include: {}", from, to, include);

        try {
            ProductsResponse data = productsService.getProductsData(from, to, include);

            BaseResponse<ProductsResponse> response = BaseResponse.success("Products data retrieved successfully", data);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting products data", e);

            BaseResponse<ProductsResponse> errorResponse = BaseResponse.error("Failed to retrieve products data: " + e.getMessage());

            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}