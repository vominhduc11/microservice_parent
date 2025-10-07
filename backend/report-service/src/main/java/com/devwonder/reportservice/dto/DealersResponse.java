package com.devwonder.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealersResponse {

    private DealerKpis dealerKpis;
    private List<DealerSegment> segmentation;
    private List<TopDealer> topDealers;
    private List<DetailedDealer> detailedDealers;
    private Metadata metadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DealerKpis {
        private MetricCard totalDealers;
        private MetricCard vipDealers;
        private MetricCard revenuePerDealer;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricCard {
        private Long value;
        private Double growth;
        private String label;
        private String criteria;
        private BigDecimal avgValue;
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
    public static class TopDealer {
        private String name;
        private Integer rank;
        private BigDecimal totalSpent;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailedDealer {
        private String name;
        private Integer rank;
        private BigDecimal totalSpent;
        private Integer totalOrders;
        private LocalDate lastOrder;
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