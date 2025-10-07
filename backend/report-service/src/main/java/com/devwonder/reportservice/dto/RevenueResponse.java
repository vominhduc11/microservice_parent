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
public class RevenueResponse {

    private RevenueKpis revenueKpis;
    private Charts charts;
    private List<ProductRevenue> productRevenue;
    private Metadata metadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueKpis {
        private MetricCard monthRevenue;
        private MetricCard todayRevenue;
        private MetricCard avgOrderValue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricCard {
        private BigDecimal value;
        private Double growth;
        private String label;
        private Long totalOrders;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Charts {
        private List<RevenueComparisonItem> comparison;
        private List<GrowthItem> growth;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueComparisonItem {
        private String period;
        private BigDecimal current;
        private String label;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GrowthItem {
        private String period;
        private Double growth;
        private String label;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductRevenue {
        private String productName;
        private Integer soldQuantity;
        private BigDecimal revenue;
        private Double growth;
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