package com.devwonder.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OverviewResponse {

    private KpiCards kpiCards;
    private EssentialStats essentialStats;
    private List<DealerSegment> dealerSegments;
    private Charts charts;
    private Metadata metadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KpiCards {
        private MetricCard monthRevenue;
        private MetricCard completedOrders;
        private MetricCard activeDealers;
        private MetricCard lowStockProducts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricCard {
        private BigDecimal value;
        private Double growth;
        private String label;
        private Double fulfillmentRate;
        private Long total;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EssentialStats {
        private BigDecimal avgOrderValue;
        private Double orderFulfillmentRate;
        private Long lowStockCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DealerSegment {
        private String name;
        private Long count;
        private Double percentage;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Charts {
        private List<RevenueComparisonItem> revenueComparison;
        private List<GrowthItem> revenueGrowth;
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
    public static class Metadata {
        private LocalDateTime lastUpdated;
        private Integer cacheExpiry;
        private String dataSource;
    }
}