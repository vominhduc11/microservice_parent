package com.devwonder.reportservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardResponse {
    private KpiMetrics kpiMetrics;
    private InventoryAlerts inventoryAlerts;
    private TopPerformers topPerformers;
    private ChartsData chartsData;
    private TopLists topLists;
    private Metadata metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiMetrics {
        private RevenueMetric todayRevenue;
        private OrderMetric completedOrders;
        private DealerMetric monthDealers;  // Changed from monthAgents
        private StockMetric lowStockProducts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueMetric {
        private Long value;
        private Double growth;
        private String comparison;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderMetric {
        private Long value;
        private Long total;
        private String label;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DealerMetric {  // Renamed from AgentMetric
        private Long value;
        private Double growth;
        private String comparison;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockMetric {
        private Long value;
        private Long total;
        private String label;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryAlerts {
        private Integer lowStockCount;
        private Integer overstockCount;
        private String urgentProduct;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPerformers {
        private TopDealer topDealer;  // Changed from topAgent
        private TopProduct topProduct;
        private RevenueMetric todayRevenueHighlight;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopDealer {  // Renamed from TopAgent
        private String name;
        private Long totalSpent;
        private Integer totalOrders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private String name;
        private Integer soldQuantity;
        private Double growth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartsData {
        private List<RevenueComparison> revenueComparison;
        private List<RevenueGrowth> revenueGrowth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueComparison {
        private String period;
        private Long current;
        private String label;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueGrowth {
        private String period;
        private Double growth;
        private String label;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopLists {
        private List<RankedDealer> dealers;  // Changed from agents
        private List<RankedProduct> products;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankedDealer {  // Renamed from RankedAgent
        private Integer rank;
        private String name;
        private Long totalSpent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankedProduct {
        private Integer rank;
        private String name;
        private Integer soldQuantity;
        private Long revenue;
        private Double growth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metadata {
        private String lastUpdated;
        private Integer cacheExpiry;
        private String dataSource;
    }
}