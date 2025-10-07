package com.devwonder.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductsResponse {

    private ProductKpis productKpis;
    private List<TopProduct> topProducts;
    private List<LowStockProduct> lowStockProducts;
    private InventorySummary inventorySummary;
    private Metadata metadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductKpis {
        private MetricCard growingProducts;
        private MetricCard totalRevenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricCard {
        private Long value;
        private String label;
        private BigDecimal revenueValue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProduct {
        private String name;
        private Integer rank;
        private Integer soldQuantity;
        private BigDecimal revenue;
        private Double growth;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LowStockProduct {
        private String id;
        private String name;
        private Integer currentStock;
        private Integer minStock;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventorySummary {
        private Long lowStock;
        private Long normal;
        private Long overstock;
        private String alertMessage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Metadata {
        private LocalDateTime lastUpdated;
        private Integer cacheExpiry;
        private String dataSource;
    }
}