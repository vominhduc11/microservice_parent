package com.devwonder.reportservice.service;

import com.devwonder.reportservice.client.OrderServiceClient;
import com.devwonder.reportservice.client.ProductServiceClient;
import com.devwonder.reportservice.client.UserServiceClient;
import com.devwonder.reportservice.dto.OverviewResponse;
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
public class OverviewService {

    private final OrderServiceClient orderServiceClient;
    private final ProductServiceClient productServiceClient;
    private final UserServiceClient userServiceClient;

    @Value("${auth.api.key:INTER_SERVICE_KEY}")
    private String apiKey;

    public OverviewResponse getOverviewData(String from, String to) {
        log.info("Fetching overview data from {} to {}", from, to);

        try {
            // Fetch data from all services
            OverviewDataCache cache = fetchAllDataOnce();

            // Build KPI Cards
            OverviewResponse.KpiCards kpiCards = buildKpiCards(cache);

            // Build Essential Stats
            OverviewResponse.EssentialStats essentialStats = buildEssentialStats(cache);

            // Build Dealer Segments
            List<OverviewResponse.DealerSegment> dealerSegments = buildDealerSegments(cache);

            // Build Charts
            OverviewResponse.Charts charts = buildCharts(cache);

            // Build Metadata
            OverviewResponse.Metadata metadata = OverviewResponse.Metadata.builder()
                    .lastUpdated(LocalDateTime.now())
                    .cacheExpiry(300)
                    .dataSource("real_time_microservices")
                    .build();

            return OverviewResponse.builder()
                    .kpiCards(kpiCards)
                    .essentialStats(essentialStats)
                    .dealerSegments(dealerSegments)
                    .charts(charts)
                    .metadata(metadata)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching overview data", e);
            throw new RuntimeException("Failed to fetch overview data: " + e.getMessage());
        }
    }

    private OverviewDataCache fetchAllDataOnce() {
        OverviewDataCache cache = new OverviewDataCache();

        // Order Service calls
        cache.todayRevenue = safeCall(() -> orderServiceClient.getTodayRevenue(apiKey), BigDecimal.ZERO);
        cache.monthRevenue = safeCall(() -> orderServiceClient.getMonthRevenue(apiKey), BigDecimal.ZERO);
        cache.lastMonthRevenue = safeCall(() -> orderServiceClient.getLastMonthRevenue(apiKey), BigDecimal.ZERO);
        cache.completedOrdersToday = safeCall(() -> orderServiceClient.getCompletedOrdersToday(apiKey), 0L);
        cache.totalOrdersToday = safeCall(() -> orderServiceClient.getTotalOrdersToday(apiKey), 0L);
        cache.currentMonthDealers = safeCall(() -> orderServiceClient.getCurrentMonthDealers(apiKey), 0L);
        cache.lastMonthDealers = safeCall(() -> orderServiceClient.getLastMonthDealers(apiKey), 0L);

        // Product Service calls
        cache.lowStockCount = safeCall(() -> productServiceClient.getLowStockCount(apiKey), 0);
        cache.totalProducts = safeCall(() -> productServiceClient.getTotalProducts(apiKey), 0);

        // User Service calls
        cache.totalDealers = safeCall(() -> userServiceClient.getTotalDealers(apiKey), 0L);

        return cache;
    }

    private OverviewResponse.KpiCards buildKpiCards(OverviewDataCache cache) {
        // Month Revenue
        BigDecimal monthGrowth = calculateGrowthPercentage(cache.monthRevenue, cache.lastMonthRevenue);
        OverviewResponse.MetricCard monthRevenue = OverviewResponse.MetricCard.builder()
                .value(cache.monthRevenue)
                .growth(monthGrowth.doubleValue())
                .label(String.format("Tăng %.1f%% vs tháng trước", monthGrowth))
                .build();

        // Completed Orders
        Double fulfillmentRate = cache.totalOrdersToday > 0 ?
                (cache.completedOrdersToday.doubleValue() / cache.totalOrdersToday.doubleValue()) * 100 : 0.0;
        OverviewResponse.MetricCard completedOrders = OverviewResponse.MetricCard.builder()
                .value(BigDecimal.valueOf(cache.completedOrdersToday))
                .fulfillmentRate(fulfillmentRate)
                .total(cache.totalOrdersToday)
                .label(String.format("%.1f%% tỷ lệ hoàn thành", fulfillmentRate))
                .build();

        // Active Dealers
        BigDecimal dealerGrowth = calculateGrowthPercentage(
                BigDecimal.valueOf(cache.currentMonthDealers),
                BigDecimal.valueOf(cache.lastMonthDealers)
        );
        OverviewResponse.MetricCard activeDealers = OverviewResponse.MetricCard.builder()
                .value(BigDecimal.valueOf(cache.currentMonthDealers))
                .growth(dealerGrowth.doubleValue())
                .label(String.format("Tăng %.1f%% vs tháng trước", dealerGrowth))
                .build();

        // Low Stock Products
        OverviewResponse.MetricCard lowStockProducts = OverviewResponse.MetricCard.builder()
                .value(BigDecimal.valueOf(cache.lowStockCount))
                .total((long) cache.totalProducts)
                .label(String.format("Trên tổng %d sản phẩm", cache.totalProducts))
                .build();

        return OverviewResponse.KpiCards.builder()
                .monthRevenue(monthRevenue)
                .completedOrders(completedOrders)
                .activeDealers(activeDealers)
                .lowStockProducts(lowStockProducts)
                .build();
    }

    private OverviewResponse.EssentialStats buildEssentialStats(OverviewDataCache cache) {
        // Average Order Value (month revenue / total dealers)
        BigDecimal avgOrderValue = cache.totalDealers > 0 ?
                cache.monthRevenue.divide(BigDecimal.valueOf(cache.totalDealers), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        // Order Fulfillment Rate
        Double fulfillmentRate = cache.totalOrdersToday > 0 ?
                (cache.completedOrdersToday.doubleValue() / cache.totalOrdersToday.doubleValue()) * 100 : 0.0;

        return OverviewResponse.EssentialStats.builder()
                .avgOrderValue(avgOrderValue)
                .orderFulfillmentRate(fulfillmentRate)
                .lowStockCount((long) cache.lowStockCount)
                .build();
    }

    private List<OverviewResponse.DealerSegment> buildDealerSegments(OverviewDataCache cache) {
        // Simple segmentation: assume 20% are VIP dealers
        long vipDealers = Math.round(cache.totalDealers * 0.2);
        long regularDealers = cache.totalDealers - vipDealers;

        double vipPercentage = cache.totalDealers > 0 ? (vipDealers * 100.0 / cache.totalDealers) : 0.0;
        double regularPercentage = cache.totalDealers > 0 ? (regularDealers * 100.0 / cache.totalDealers) : 0.0;

        return Arrays.asList(
                OverviewResponse.DealerSegment.builder()
                        .name("Đại lý VIP")
                        .count(vipDealers)
                        .percentage(vipPercentage)
                        .color("#ffd700")
                        .build(),
                OverviewResponse.DealerSegment.builder()
                        .name("Đại lý thường")
                        .count(regularDealers)
                        .percentage(regularPercentage)
                        .color("#3b82f6")
                        .build()
        );
    }

    private OverviewResponse.Charts buildCharts(OverviewDataCache cache) {
        // Revenue Comparison
        List<OverviewResponse.RevenueComparisonItem> revenueComparison = Arrays.asList(
                OverviewResponse.RevenueComparisonItem.builder()
                        .period("Tháng trước")
                        .current(cache.lastMonthRevenue)
                        .label("Tháng trước")
                        .build(),
                OverviewResponse.RevenueComparisonItem.builder()
                        .period("Tháng này")
                        .current(cache.monthRevenue)
                        .label("Tháng này")
                        .build(),
                OverviewResponse.RevenueComparisonItem.builder()
                        .period("Hôm nay")
                        .current(cache.todayRevenue)
                        .label("Hôm nay")
                        .build()
        );

        // Revenue Growth
        BigDecimal monthGrowth = calculateGrowthPercentage(cache.monthRevenue, cache.lastMonthRevenue);
        List<OverviewResponse.GrowthItem> revenueGrowth = Arrays.asList(
                OverviewResponse.GrowthItem.builder()
                        .period("Tháng")
                        .growth(monthGrowth.doubleValue())
                        .label("Tháng này vs Tháng trước")
                        .build()
        );

        return OverviewResponse.Charts.builder()
                .revenueComparison(revenueComparison)
                .revenueGrowth(revenueGrowth)
                .build();
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
    private static class OverviewDataCache {
        BigDecimal todayRevenue;
        BigDecimal monthRevenue;
        BigDecimal lastMonthRevenue;
        Long completedOrdersToday;
        Long totalOrdersToday;
        Long currentMonthDealers;
        Long lastMonthDealers;
        Integer lowStockCount;
        Integer totalProducts;
        Long totalDealers;
    }
}