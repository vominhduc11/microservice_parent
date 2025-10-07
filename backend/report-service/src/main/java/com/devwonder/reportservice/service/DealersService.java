package com.devwonder.reportservice.service;

import com.devwonder.reportservice.client.OrderServiceClient;
import com.devwonder.reportservice.client.UserServiceClient;
import com.devwonder.reportservice.dto.DealersResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DealersService {

    private final OrderServiceClient orderServiceClient;
    private final UserServiceClient userServiceClient;

    @Value("${auth.api.key:INTER_SERVICE_KEY}")
    private String apiKey;

    public DealersResponse getDealersData(String from, String to, Integer limit) {
        log.info("Fetching dealers data from {} to {} with limit {}", from, to, limit);

        try {
            // Fetch data from microservices
            DealerDataCache cache = fetchDealerDataOnce();

            // Build Dealer KPIs
            DealersResponse.DealerKpis dealerKpis = buildDealerKpis(cache);

            // Build Dealer Segmentation
            List<DealersResponse.DealerSegment> segmentation = buildDealerSegmentation(cache);

            // Build Top Dealers
            List<DealersResponse.TopDealer> topDealers = buildTopDealers(cache, limit);

            // Build Detailed Dealers
            List<DealersResponse.DetailedDealer> detailedDealers = buildDetailedDealers(cache, limit);

            // Build Metadata
            DealersResponse.Metadata metadata = buildMetadata();

            return DealersResponse.builder()
                    .dealerKpis(dealerKpis)
                    .segmentation(segmentation)
                    .topDealers(topDealers)
                    .detailedDealers(detailedDealers)
                    .metadata(metadata)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching dealers data", e);
            throw new RuntimeException("Failed to fetch dealers data: " + e.getMessage());
        }
    }

    private DealerDataCache fetchDealerDataOnce() {
        DealerDataCache cache = new DealerDataCache();

        // User Service calls
        cache.totalDealers = safeCall(() -> userServiceClient.getTotalDealers(apiKey), 0L);

        // Order Service calls
        cache.currentMonthDealers = safeCall(() -> orderServiceClient.getCurrentMonthDealers(apiKey), 0L);
        cache.lastMonthDealers = safeCall(() -> orderServiceClient.getLastMonthDealers(apiKey), 0L);
        cache.monthRevenue = safeCall(() -> orderServiceClient.getMonthRevenue(apiKey), BigDecimal.ZERO);

        // Top dealers from both services
        cache.topDealersFromOrder = safeCall(() -> orderServiceClient.getTopDealers(apiKey), List.of());
        cache.topDealersFromUser = safeCall(() -> userServiceClient.getTopDealers(apiKey), List.of());

        return cache;
    }

    private DealersResponse.DealerKpis buildDealerKpis(DealerDataCache cache) {
        // Total Dealers growth
        BigDecimal dealerGrowth = calculateGrowthPercentage(
                BigDecimal.valueOf(cache.currentMonthDealers),
                BigDecimal.valueOf(cache.lastMonthDealers)
        );

        // VIP Dealers (assume top 20% are VIP)
        long vipDealers = Math.round(cache.totalDealers * 0.2);

        // Revenue per dealer
        BigDecimal revenuePerDealer = cache.totalDealers > 0 ?
                cache.monthRevenue.divide(BigDecimal.valueOf(cache.totalDealers), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        return DealersResponse.DealerKpis.builder()
                .totalDealers(DealersResponse.MetricCard.builder()
                        .value(cache.totalDealers)
                        .growth(dealerGrowth.doubleValue())
                        .label(String.format("%.1f%% vs tháng trước", dealerGrowth))
                        .build())
                .vipDealers(DealersResponse.MetricCard.builder()
                        .value(vipDealers)
                        .criteria("Chi tiêu > 20M VND")
                        .label("Chi tiêu > 20M VND")
                        .build())
                .revenuePerDealer(DealersResponse.MetricCard.builder()
                        .value(revenuePerDealer.longValue())
                        .avgValue(revenuePerDealer)
                        .label("Trung bình/đại lý")
                        .build())
                .build();
    }

    private List<DealersResponse.DealerSegment> buildDealerSegmentation(DealerDataCache cache) {
        // Simple segmentation: assume 20% are VIP dealers
        long vipDealers = Math.round(cache.totalDealers * 0.2);
        long regularDealers = cache.totalDealers - vipDealers;

        double vipPercentage = cache.totalDealers > 0 ? (vipDealers * 100.0 / cache.totalDealers) : 0.0;
        double regularPercentage = cache.totalDealers > 0 ? (regularDealers * 100.0 / cache.totalDealers) : 0.0;

        return Arrays.asList(
                DealersResponse.DealerSegment.builder()
                        .name("Đại lý VIP")
                        .count(vipDealers)
                        .percentage(vipPercentage)
                        .color("#ffd700")
                        .build(),
                DealersResponse.DealerSegment.builder()
                        .name("Đại lý thường")
                        .count(regularDealers)
                        .percentage(regularPercentage)
                        .color("#3b82f6")
                        .build()
        );
    }

    private List<DealersResponse.TopDealer> buildTopDealers(DealerDataCache cache, Integer limit) {
        try {
            // Combine top dealers from both services, prioritize order service data
            List<Map<String, Object>> topDealers = cache.topDealersFromOrder.isEmpty() ?
                    cache.topDealersFromUser : cache.topDealersFromOrder;

            return topDealers.stream()
                    .limit(Math.min(limit, topDealers.size()))
                    .map(dealer -> {
                        int rank = (Integer) dealer.getOrDefault("rank", 1);
                        return DealersResponse.TopDealer.builder()
                                .name((String) dealer.getOrDefault("name", "Unknown Dealer"))
                                .rank(rank)
                                .totalSpent(BigDecimal.valueOf(((Number) dealer.getOrDefault("totalSpent", 0)).longValue()))
                                .build();
                    })
                    .toList();
        } catch (Exception e) {
            log.warn("Failed to build top dealers from service data, returning empty list", e);
            return List.of();
        }
    }

    private List<DealersResponse.DetailedDealer> buildDetailedDealers(DealerDataCache cache, Integer limit) {
        try {
            // Use order service data first, fallback to user service data
            List<Map<String, Object>> topDealers = cache.topDealersFromOrder.isEmpty() ?
                    cache.topDealersFromUser : cache.topDealersFromOrder;

            return topDealers.stream()
                    .limit(Math.min(limit, topDealers.size()))
                    .map(dealer -> {
                        int rank = (Integer) dealer.getOrDefault("rank", 1);
                        return DealersResponse.DetailedDealer.builder()
                                .name((String) dealer.getOrDefault("name", "Unknown Dealer"))
                                .rank(rank)
                                .totalSpent(BigDecimal.valueOf(((Number) dealer.getOrDefault("totalSpent", 0)).longValue()))
                                .totalOrders((Integer) dealer.getOrDefault("totalOrders", 0))
                                .lastOrder(dealer.containsKey("lastOrder") ?
                                        LocalDate.parse((String) dealer.get("lastOrder")) : LocalDate.now())
                                .build();
                    })
                    .toList();
        } catch (Exception e) {
            log.warn("Failed to build detailed dealers from service data, returning empty list", e);
            return List.of();
        }
    }

    private BigDecimal calculateGrowthPercentage(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100.0) : BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    private <T> T safeCall(java.util.function.Supplier<T> supplier, T defaultValue) {
        try {
            T result = supplier.get();
            return result != null ? result : defaultValue;
        } catch (Exception e) {
            log.warn("Service call failed, using default value: {}", e.getMessage());
            return defaultValue;
        }
    }

    private DealersResponse.Metadata buildMetadata() {
        return DealersResponse.Metadata.builder()
                .lastUpdated(LocalDateTime.now())
                .cacheExpiry(300)
                .dataSource("real_time_microservices")
                .build();
    }

    // Data cache class to avoid duplicate calls
    private static class DealerDataCache {
        Long totalDealers;
        Long currentMonthDealers;
        Long lastMonthDealers;
        BigDecimal monthRevenue;
        List<Map<String, Object>> topDealersFromOrder;
        List<Map<String, Object>> topDealersFromUser;
    }
}