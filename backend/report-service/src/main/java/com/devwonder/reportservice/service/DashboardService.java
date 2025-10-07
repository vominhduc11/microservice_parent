package com.devwonder.reportservice.service;

// Using Map<String, Object> instead of DTOs to avoid cross-service dependencies
import com.devwonder.reportservice.client.OrderServiceClient;
import com.devwonder.reportservice.client.ProductServiceClient;
import com.devwonder.reportservice.client.UserServiceClient;
import com.devwonder.reportservice.dto.DashboardResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DashboardService {

    @Autowired
    private OrderServiceClient orderServiceClient;

    @Autowired
    private ProductServiceClient productServiceClient;

    @Autowired
    private UserServiceClient userServiceClient;

    @Value("${auth.api.key:INTER_SERVICE_KEY}")
    private String apiKey;

    // Cache class to store all fetched data and avoid duplicate API calls
    private static class DashboardDataCache {
        // Order Service Data
        BigDecimal todayRevenue;
        BigDecimal yesterdayRevenue;
        BigDecimal monthRevenue;
        BigDecimal lastMonthRevenue;
        Long completedOrdersToday;
        Long totalOrdersToday;
        List<Map<String, Object>> topDealersFromOrders;
        List<Map<String, Object>> productSales;

        // Product Service Data
        Map<String, Object> inventoryAlerts;
        Integer lowStockCount;
        Integer totalProducts;
        String urgentProduct;
        List<Map<String, Object>> topProducts;

        // User Service Data
        Long totalDealers;
        List<Map<String, Object>> topDealersFromUsers;
    }

    public DashboardResponse getDashboardData() {
        try {
            log.info("Fetching real dashboard data from microservices");

            // Cache API calls to avoid duplicates
            DashboardDataCache cache = fetchAllDataOnce();

            return DashboardResponse.builder()
                    .kpiMetrics(calculateKpiMetrics(cache))
                    .inventoryAlerts(calculateInventoryAlerts(cache))
                    .topPerformers(calculateTopPerformers(cache))
                    .chartsData(calculateChartsData(cache))
                    .topLists(calculateTopLists(cache))
                    .metadata(generateMetadata())
                    .build();

        } catch (Exception e) {
            log.error("Error fetching dashboard data: {}", e.getMessage(), e);
            // Fallback to mock data on error
            return getFallbackData();
        }
    }

    private DashboardDataCache fetchAllDataOnce() {
        log.debug("Fetching all data from microservices once to avoid duplicates");

        DashboardDataCache cache = new DashboardDataCache();

        // Order Service calls
        cache.todayRevenue = safeCall(() -> orderServiceClient.getTodayRevenue(apiKey), BigDecimal.ZERO);
        cache.yesterdayRevenue = safeCall(() -> orderServiceClient.getYesterdayRevenue(apiKey), BigDecimal.ZERO);
        cache.monthRevenue = safeCall(() -> orderServiceClient.getMonthRevenue(apiKey), BigDecimal.ZERO);
        cache.lastMonthRevenue = safeCall(() -> orderServiceClient.getLastMonthRevenue(apiKey), BigDecimal.ZERO);
        cache.completedOrdersToday = safeCall(() -> orderServiceClient.getCompletedOrdersToday(apiKey), 0L);
        cache.totalOrdersToday = safeCall(() -> orderServiceClient.getTotalOrdersToday(apiKey), 0L);
        cache.topDealersFromOrders = safeCall(() -> orderServiceClient.getTopDealers(apiKey), List.of());
        cache.productSales = safeCall(() -> orderServiceClient.getProductSales(apiKey), List.of());

        // Product Service calls
        cache.inventoryAlerts = safeCall(() -> productServiceClient.getInventoryAlerts(apiKey), Map.of());
        cache.lowStockCount = safeCall(() -> productServiceClient.getLowStockCount(apiKey), 0);
        cache.totalProducts = safeCall(() -> productServiceClient.getTotalProducts(apiKey), 0);
        cache.urgentProduct = safeCall(() -> productServiceClient.getUrgentProduct(apiKey), "N/A");
        cache.topProducts = safeCall(() -> productServiceClient.getTopProducts(apiKey), List.of());

        // User Service calls
        cache.totalDealers = safeCall(() -> userServiceClient.getTotalDealers(apiKey), 0L);
        cache.topDealersFromUsers = safeCall(() -> userServiceClient.getTopDealers(apiKey), List.of());

        // Cross-service data enrichment
        enrichDealerDataWithOrderInfo(cache);

        return cache;
    }

    private void enrichDealerDataWithOrderInfo(DashboardDataCache cache) {
        // Enrich User Service dealer data with Order Service sales data
        log.debug("Enriching dealer data with order information");

        for (Map<String, Object> dealer : cache.topDealersFromUsers) {
            Long dealerId = getLongFromMap(dealer, "id", 0L);
            if (dealerId == 0L) continue;

            // Find this dealer in Order Service top dealers data
            for (Map<String, Object> orderDealer : cache.topDealersFromOrders) {
                Long orderDealerId = getLongFromMap(orderDealer, "id", 0L);
                if (dealerId.equals(orderDealerId)) {
                    // Merge spending data from Order Service
                    dealer.put("totalSales", getLongFromMap(orderDealer, "totalSpent", 0L));
                    dealer.put("ordersCount", getIntegerFromMap(orderDealer, "totalOrders", 0));
                    break;
                }
            }
        }
    }

    private DashboardResponse.KpiMetrics calculateKpiMetrics(DashboardDataCache cache) {
        log.debug("Calculating KPI metrics from cached data");

        // Today Revenue (from cache)
        Double revenueGrowth = calculateGrowthPercentage(cache.todayRevenue, cache.yesterdayRevenue);

        // Completed Orders (from cache)
        // Note: No monthly dealer count in KPI - this should be total dealers from User Service
        Long totalDealers = cache.totalDealers;

        // For growth calculation, we don't have historical dealer data, so using 0 for now
        // This should be enhanced to track dealer growth over time
        Double dealerGrowth = 0.0;

        return DashboardResponse.KpiMetrics.builder()
                .todayRevenue(DashboardResponse.RevenueMetric.builder()
                        .value(cache.todayRevenue.longValue())
                        .growth(revenueGrowth)
                        .comparison("so với hôm qua")
                        .build())
                .completedOrders(DashboardResponse.OrderMetric.builder()
                        .value(cache.completedOrdersToday)
                        .total(cache.totalOrdersToday)
                        .label("tổng đơn hôm nay")
                        .build())
                .monthDealers(DashboardResponse.DealerMetric.builder()
                        .value(totalDealers)
                        .growth(dealerGrowth)
                        .comparison("tổng dealers")
                        .build())
                .lowStockProducts(DashboardResponse.StockMetric.builder()
                        .value(cache.lowStockCount.longValue())
                        .total(cache.totalProducts.longValue())
                        .label("tổng sản phẩm")
                        .build())
                .build();
    }

    private DashboardResponse.InventoryAlerts calculateInventoryAlerts(DashboardDataCache cache) {
        log.debug("Calculating inventory alerts from cached data");

        return DashboardResponse.InventoryAlerts.builder()
                .lowStockCount(getIntegerFromMap(cache.inventoryAlerts, "lowStockCount", 0))
                .overstockCount(getIntegerFromMap(cache.inventoryAlerts, "overstockCount", 0))
                .urgentProduct(cache.urgentProduct)
                .build();
    }

    private DashboardResponse.TopPerformers calculateTopPerformers(DashboardDataCache cache) {
        log.debug("Calculating top performers from cached data");

        // Top Dealer - Use User Service data (more authoritative)
        Map<String, Object> topDealerData = cache.topDealersFromUsers.isEmpty() ? Map.of() : cache.topDealersFromUsers.get(0);

        // Top Product - Use Product Service data, but if empty, fallback to Order Service product sales
        Map<String, Object> topProductData;
        if (!cache.topProducts.isEmpty()) {
            topProductData = cache.topProducts.get(0);
        } else if (!cache.productSales.isEmpty()) {
            topProductData = cache.productSales.get(0);
        } else {
            topProductData = Map.of();
        }

        // Today Revenue Highlight (from cache)
        Double revenueGrowth = calculateGrowthPercentage(cache.todayRevenue, cache.yesterdayRevenue);

        return DashboardResponse.TopPerformers.builder()
                .topDealer(DashboardResponse.TopDealer.builder()
                        .name(getStringFromMap(topDealerData, "name", "N/A"))
                        .totalSpent(getLongFromMap(topDealerData, "totalSales", getLongFromMap(topDealerData, "totalSpent", 0L)))
                        .totalOrders(getIntegerFromMap(topDealerData, "ordersCount", getIntegerFromMap(topDealerData, "totalOrders", 0)))
                        .build())
                .topProduct(DashboardResponse.TopProduct.builder()
                        // Fix field mapping - use correct field names from services
                        .name(getStringFromMap(topProductData, "productName", getStringFromMap(topProductData, "name", "N/A")))
                        .soldQuantity(getIntegerFromMap(topProductData, "soldQuantity", getIntegerFromMap(topProductData, "soldCount", 0)))
                        .growth(getDoubleFromMap(topProductData, "growth", 15.0))
                        .build())
                .todayRevenueHighlight(DashboardResponse.RevenueMetric.builder()
                        .value(cache.todayRevenue.longValue())
                        .growth(revenueGrowth)
                        .comparison("so với hôm qua")
                        .build())
                .build();
    }

    private DashboardResponse.ChartsData calculateChartsData(DashboardDataCache cache) {
        log.debug("Calculating charts data from cached data");

        Double dailyGrowth = calculateGrowthPercentage(cache.todayRevenue, cache.yesterdayRevenue);
        Double monthlyGrowth = calculateGrowthPercentage(cache.monthRevenue, cache.lastMonthRevenue);

        return DashboardResponse.ChartsData.builder()
                .revenueComparison(List.of(
                        createRevenueComparison("Hôm qua", cache.yesterdayRevenue.longValue()),
                        createRevenueComparison("Hôm nay", cache.todayRevenue.longValue()),
                        createRevenueComparison("Tháng trước", cache.lastMonthRevenue.longValue()),
                        createRevenueComparison("Tháng này", cache.monthRevenue.longValue())
                ))
                .revenueGrowth(List.of(
                        createRevenueGrowth("Ngày", dailyGrowth, "Hôm nay vs Hôm qua"),
                        createRevenueGrowth("Tháng", monthlyGrowth, "Tháng này vs Tháng trước")
                ))
                .build();
    }

    private DashboardResponse.TopLists calculateTopLists(DashboardDataCache cache) {
        log.debug("Calculating top lists from cached data");

        // Use User Service for dealer list (more authoritative) but fallback to Order Service if needed
        List<Map<String, Object>> dealerData = !cache.topDealersFromUsers.isEmpty() ?
                cache.topDealersFromUsers : cache.topDealersFromOrders;

        // Use Product Service for product list but fallback to Order Service product sales
        List<Map<String, Object>> productData = !cache.topProducts.isEmpty() ?
                cache.topProducts : cache.productSales;

        return DashboardResponse.TopLists.builder()
                .dealers(mapToDealerList(dealerData))
                .products(mapToProductList(productData))
                .build();
    }

    private DashboardResponse.Metadata generateMetadata() {
        return DashboardResponse.Metadata.builder()
                .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z")
                .cacheExpiry(300)
                .dataSource("real_time_microservices")
                .build();
    }

    // Helper methods
    private Double calculateGrowthPercentage(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.equals(BigDecimal.ZERO)) {
            return current != null && current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private Double calculateGrowthPercentage(Long current, Long previous) {
        return calculateGrowthPercentage(
                BigDecimal.valueOf(current != null ? current : 0),
                BigDecimal.valueOf(previous != null ? previous : 0)
        );
    }

    private DashboardResponse.RevenueComparison createRevenueComparison(String period, Long current) {
        return DashboardResponse.RevenueComparison.builder()
                .period(period)
                .current(current)
                .label(period)
                .build();
    }

    private DashboardResponse.RevenueGrowth createRevenueGrowth(String period, Double growth, String label) {
        return DashboardResponse.RevenueGrowth.builder()
                .period(period)
                .growth(growth)
                .label(label)
                .build();
    }

    private List<DashboardResponse.RankedDealer> mapToDealerList(List<Map<String, Object>> dealers) {
        return dealers.stream()
                .map(dealer -> DashboardResponse.RankedDealer.builder()
                        .rank(getIntegerFromMap(dealer, "rank", 0))
                        .name(getStringFromMap(dealer, "name", "N/A"))
                        .totalSpent(getLongFromMap(dealer, "totalSales", getLongFromMap(dealer, "totalSpent", 0L)))
                        .build())
                .toList();
    }

    private List<DashboardResponse.RankedProduct> mapToProductList(List<Map<String, Object>> products) {
        return products.stream()
                .map(product -> DashboardResponse.RankedProduct.builder()
                        .rank(getIntegerFromMap(product, "rank", 0))
                        .name(getStringFromMap(product, "name", "N/A"))
                        .soldQuantity(getIntegerFromMap(product, "soldQuantity", 0))
                        .revenue(getLongFromMap(product, "revenue", 0L))
                        .growth(getDoubleFromMap(product, "growth", 0.0))
                        .build())
                .toList();
    }

    // Safe call wrapper for external service calls
    private <T> T safeCall(ServiceCall<T> call, T defaultValue) {
        try {
            return call.call();
        } catch (Exception e) {
            log.warn("Service call failed, using default value: {}", e.getMessage());
            return defaultValue;
        }
    }

    @FunctionalInterface
    private interface ServiceCall<T> {
        T call() throws Exception;
    }

    // Type-safe map getters
    private String getStringFromMap(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        return value != null ? value.toString() : defaultValue;
    }

    private Long getLongFromMap(Map<String, Object> map, String key, Long defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return defaultValue;
    }

    private Integer getIntegerFromMap(Map<String, Object> map, String key, Integer defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return defaultValue;
    }

    private Double getDoubleFromMap(Map<String, Object> map, String key, Double defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return defaultValue;
    }

    // Fallback method when all services fail
    private DashboardResponse getFallbackData() {
        log.warn("Using fallback mock data due to service failures");
        return DashboardResponse.builder()
                .kpiMetrics(DashboardResponse.KpiMetrics.builder()
                        .todayRevenue(DashboardResponse.RevenueMetric.builder()
                                .value(0L).growth(0.0).comparison("Dữ liệu tạm thời").build())
                        .completedOrders(DashboardResponse.OrderMetric.builder()
                                .value(0L).total(0L).label("Dữ liệu tạm thời").build())
                        .monthDealers(DashboardResponse.DealerMetric.builder()
                                .value(0L).growth(0.0).comparison("Dữ liệu tạm thời").build())
                        .lowStockProducts(DashboardResponse.StockMetric.builder()
                                .value(0L).total(0L).label("Dữ liệu tạm thời").build())
                        .build())
                .inventoryAlerts(DashboardResponse.InventoryAlerts.builder()
                        .lowStockCount(0).overstockCount(0).urgentProduct("N/A").build())
                .topPerformers(DashboardResponse.TopPerformers.builder()
                        .topDealer(DashboardResponse.TopDealer.builder()
                                .name("N/A").totalSpent(0L).totalOrders(0).build())
                        .topProduct(DashboardResponse.TopProduct.builder()
                                .name("N/A").soldQuantity(0).growth(0.0).build())
                        .todayRevenueHighlight(DashboardResponse.RevenueMetric.builder()
                                .value(0L).growth(0.0).comparison("Dữ liệu tạm thời").build())
                        .build())
                .chartsData(DashboardResponse.ChartsData.builder()
                        .revenueComparison(List.of())
                        .revenueGrowth(List.of())
                        .build())
                .topLists(DashboardResponse.TopLists.builder()
                        .dealers(List.of())
                        .products(List.of())
                        .build())
                .metadata(DashboardResponse.Metadata.builder()
                        .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z")
                        .cacheExpiry(300)
                        .dataSource("fallback_mode")
                        .build())
                .build();
    }
}