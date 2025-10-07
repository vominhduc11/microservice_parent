package com.devwonder.reportservice.service;

import com.devwonder.reportservice.client.OrderServiceClient;
import com.devwonder.reportservice.client.ProductServiceClient;
import com.devwonder.reportservice.dto.RevenueResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevenueService {

    private final OrderServiceClient orderServiceClient;
    private final ProductServiceClient productServiceClient;

    @Value("${auth.api.key:INTER_SERVICE_KEY}")
    private String apiKey;

    public RevenueResponse getRevenueData(String from, String to) {
        log.info("Fetching revenue data from {} to {}", from, to);

        try {
            // Fetch revenue data from Order Service
            RevenueDataCache cache = fetchRevenueDataOnce();

            // Build Revenue KPIs
            RevenueResponse.RevenueKpis revenueKpis = buildRevenueKpis(cache);

            // Build Charts
            RevenueResponse.Charts charts = buildRevenueCharts(cache);

            // Build Product Revenue
            List<RevenueResponse.ProductRevenue> productRevenue = buildProductRevenue();

            // Build Metadata
            RevenueResponse.Metadata metadata = RevenueResponse.Metadata.builder()
                    .lastUpdated(LocalDateTime.now())
                    .cacheExpiry(300)
                    .dataSource("real_time_microservices")
                    .build();

            return RevenueResponse.builder()
                    .revenueKpis(revenueKpis)
                    .charts(charts)
                    .productRevenue(productRevenue)
                    .metadata(metadata)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching revenue data", e);
            throw new RuntimeException("Failed to fetch revenue data: " + e.getMessage());
        }
    }

    private RevenueDataCache fetchRevenueDataOnce() {
        RevenueDataCache cache = new RevenueDataCache();

        // Order Service calls
        cache.todayRevenue = safeCall(() -> orderServiceClient.getTodayRevenue(apiKey), BigDecimal.ZERO);
        cache.yesterdayRevenue = safeCall(() -> orderServiceClient.getYesterdayRevenue(apiKey), BigDecimal.ZERO);
        cache.monthRevenue = safeCall(() -> orderServiceClient.getMonthRevenue(apiKey), BigDecimal.ZERO);
        cache.lastMonthRevenue = safeCall(() -> orderServiceClient.getLastMonthRevenue(apiKey), BigDecimal.ZERO);
        cache.totalOrdersToday = safeCall(() -> orderServiceClient.getTotalOrdersToday(apiKey), 0L);
        cache.totalOrdersMonth = safeCall(() -> orderServiceClient.getTotalOrdersMonth(apiKey), 0L);
        cache.completedOrdersToday = safeCall(() -> orderServiceClient.getCompletedOrdersToday(apiKey), 0L);

        return cache;
    }

    private RevenueResponse.RevenueKpis buildRevenueKpis(RevenueDataCache cache) {
        // Month Revenue
        BigDecimal monthGrowth = calculateGrowthPercentage(cache.monthRevenue, cache.lastMonthRevenue);
        RevenueResponse.MetricCard monthRevenue = RevenueResponse.MetricCard.builder()
                .value(cache.monthRevenue)
                .growth(monthGrowth.doubleValue())
                .totalOrders(cache.totalOrdersMonth)
                .label(String.format("%.1f%% vs tháng trước", monthGrowth))
                .build();

        // Today Revenue
        BigDecimal todayGrowth = calculateGrowthPercentage(cache.todayRevenue, cache.yesterdayRevenue);
        RevenueResponse.MetricCard todayRevenue = RevenueResponse.MetricCard.builder()
                .value(cache.todayRevenue)
                .growth(todayGrowth.doubleValue())
                .totalOrders(cache.totalOrdersToday)
                .label(String.format("%.1f%% vs hôm qua", todayGrowth))
                .build();

        // Average Order Value (month revenue / total orders this month)
        BigDecimal avgOrderValue = cache.totalOrdersMonth > 0 ?
                cache.monthRevenue.divide(BigDecimal.valueOf(cache.totalOrdersMonth), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;
        RevenueResponse.MetricCard avgOrderCard = RevenueResponse.MetricCard.builder()
                .value(avgOrderValue)
                .totalOrders(cache.totalOrdersMonth)
                .label(String.format("%d đơn hàng tháng này", cache.totalOrdersMonth))
                .build();

        return RevenueResponse.RevenueKpis.builder()
                .monthRevenue(monthRevenue)
                .todayRevenue(todayRevenue)
                .avgOrderValue(avgOrderCard)
                .build();
    }

    private RevenueResponse.Charts buildRevenueCharts(RevenueDataCache cache) {
        // Revenue Comparison
        List<RevenueResponse.RevenueComparisonItem> comparison = Arrays.asList(
                RevenueResponse.RevenueComparisonItem.builder()
                        .period("Hôm qua")
                        .current(cache.yesterdayRevenue)
                        .label("Hôm qua")
                        .build(),
                RevenueResponse.RevenueComparisonItem.builder()
                        .period("Hôm nay")
                        .current(cache.todayRevenue)
                        .label("Hôm nay")
                        .build(),
                RevenueResponse.RevenueComparisonItem.builder()
                        .period("Tháng trước")
                        .current(cache.lastMonthRevenue)
                        .label("Tháng trước")
                        .build(),
                RevenueResponse.RevenueComparisonItem.builder()
                        .period("Tháng này")
                        .current(cache.monthRevenue)
                        .label("Tháng này")
                        .build()
        );

        // Revenue Growth
        BigDecimal todayGrowth = calculateGrowthPercentage(cache.todayRevenue, cache.yesterdayRevenue);
        BigDecimal monthGrowth = calculateGrowthPercentage(cache.monthRevenue, cache.lastMonthRevenue);

        List<RevenueResponse.GrowthItem> growth = Arrays.asList(
                RevenueResponse.GrowthItem.builder()
                        .period("Ngày")
                        .growth(todayGrowth.doubleValue())
                        .label("Hôm nay vs Hôm qua")
                        .build(),
                RevenueResponse.GrowthItem.builder()
                        .period("Tháng")
                        .growth(monthGrowth.doubleValue())
                        .label("Tháng này vs Tháng trước")
                        .build()
        );

        return RevenueResponse.Charts.builder()
                .comparison(comparison)
                .growth(growth)
                .build();
    }

    private List<RevenueResponse.ProductRevenue> buildProductRevenue() {
        try {
            // Get top products from Product Service
            List<Map<String, Object>> topProducts = productServiceClient.getTopProducts(apiKey);

            return topProducts.stream()
                    .limit(8) // Top 8 products for revenue view
                    .map(product -> RevenueResponse.ProductRevenue.builder()
                            .productName((String) product.get("name"))
                            .soldQuantity((Integer) product.get("soldQuantity"))
                            .revenue(BigDecimal.valueOf(((Number) product.get("revenue")).longValue()))
                            .growth((Double) product.get("growth"))
                            .build())
                    .toList();
        } catch (Exception e) {
            log.warn("Failed to fetch product revenue data", e);
            return List.of(); // Return empty list if failed
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

    // Data cache class to avoid duplicate calls
    private static class RevenueDataCache {
        BigDecimal todayRevenue;
        BigDecimal yesterdayRevenue;
        BigDecimal monthRevenue;
        BigDecimal lastMonthRevenue;
        Long totalOrdersToday;
        Long totalOrdersMonth;
        Long completedOrdersToday;
    }
}