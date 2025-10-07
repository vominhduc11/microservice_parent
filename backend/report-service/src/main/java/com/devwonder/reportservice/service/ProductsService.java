package com.devwonder.reportservice.service;

import com.devwonder.reportservice.client.OrderServiceClient;
import com.devwonder.reportservice.client.ProductServiceClient;
import com.devwonder.reportservice.dto.ProductsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductsService {

    private final OrderServiceClient orderServiceClient;
    private final ProductServiceClient productServiceClient;

    @Value("${auth.api.key:INTER_SERVICE_KEY}")
    private String apiKey;

    public ProductsResponse getProductsData(String from, String to, String include) {
        log.info("Fetching products data from {} to {} with include {}", from, to, include);

        try {
            // Fetch data from microservices
            ProductDataCache cache = fetchProductDataOnce();

            // Build Product KPIs
            ProductsResponse.ProductKpis productKpis = buildProductKpis(cache);

            // Build Top Products
            List<ProductsResponse.TopProduct> topProducts = buildTopProducts(cache);

            // Build Low Stock Products (if inventory included)
            List<ProductsResponse.LowStockProduct> lowStockProducts = include.contains("inventory") ?
                    buildLowStockProducts(cache) : List.of();

            // Build Inventory Summary (if inventory included)
            ProductsResponse.InventorySummary inventorySummary = include.contains("inventory") ?
                    buildInventorySummary(cache) : null;

            // Build Metadata
            ProductsResponse.Metadata metadata = buildMetadata();

            return ProductsResponse.builder()
                    .productKpis(productKpis)
                    .topProducts(topProducts)
                    .lowStockProducts(lowStockProducts)
                    .inventorySummary(inventorySummary)
                    .metadata(metadata)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching products data", e);
            throw new RuntimeException("Failed to fetch products data: " + e.getMessage());
        }
    }

    private ProductDataCache fetchProductDataOnce() {
        ProductDataCache cache = new ProductDataCache();

        // Product Service calls
        cache.totalProducts = safeCall(() -> productServiceClient.getTotalProducts(apiKey), 0);
        cache.lowStockCount = safeCall(() -> productServiceClient.getLowStockCount(apiKey), 0);
        cache.topProducts = safeCall(() -> productServiceClient.getTopProducts(apiKey), List.of());
        cache.inventoryAlerts = safeCall(() -> productServiceClient.getInventoryAlerts(apiKey), Map.of());

        // Order Service calls for product sales
        cache.productSales = safeCall(() -> orderServiceClient.getProductSales(apiKey), List.of());

        return cache;
    }

    private ProductsResponse.ProductKpis buildProductKpis(ProductDataCache cache) {
        // Count growing products (products with positive growth)
        long growingProducts = cache.topProducts.stream()
                .mapToLong(product -> {
                    Number growth = (Number) product.getOrDefault("growth", 0);
                    return growth.doubleValue() > 0 ? 1 : 0;
                })
                .sum();

        // Calculate total revenue from top products
        BigDecimal totalRevenue = cache.topProducts.stream()
                .map(product -> {
                    Number revenue = (Number) product.getOrDefault("revenue", 0);
                    return BigDecimal.valueOf(revenue.longValue());
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ProductsResponse.ProductKpis.builder()
                .growingProducts(ProductsResponse.MetricCard.builder()
                        .value(growingProducts)
                        .label("Có tăng trưởng")
                        .build())
                .totalRevenue(ProductsResponse.MetricCard.builder()
                        .value(totalRevenue.longValue())
                        .revenueValue(totalRevenue)
                        .label("Tổng doanh thu")
                        .build())
                .build();
    }

    private List<ProductsResponse.TopProduct> buildTopProducts(ProductDataCache cache) {
        try {
            // Use top products from product service, enhanced with sales data from order service
            return cache.topProducts.stream()
                    .limit(5) // Top 5 products
                    .map(product -> {
                        int rank = (Integer) product.getOrDefault("rank", 0);
                        return ProductsResponse.TopProduct.builder()
                                .name((String) product.getOrDefault("name", "Unknown Product"))
                                .rank(rank)
                                .soldQuantity((Integer) product.getOrDefault("soldQuantity", 0))
                                .revenue(BigDecimal.valueOf(((Number) product.getOrDefault("revenue", 0)).longValue()))
                                .growth((Double) product.getOrDefault("growth", 0.0))
                                .build();
                    })
                    .toList();
        } catch (Exception e) {
            log.warn("Failed to build top products from service data, returning empty list", e);
            return List.of();
        }
    }

    private List<ProductsResponse.LowStockProduct> buildLowStockProducts(ProductDataCache cache) {
        try {
            // Extract low stock products from inventory alerts
            Map<String, Object> alerts = cache.inventoryAlerts;
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> lowStockList = (List<Map<String, Object>>) alerts.getOrDefault("lowStockProducts", List.of());

            return lowStockList.stream()
                    .map(product -> ProductsResponse.LowStockProduct.builder()
                            .id((String) product.getOrDefault("id", ""))
                            .name((String) product.getOrDefault("name", "Unknown Product"))
                            .currentStock((Integer) product.getOrDefault("currentStock", 0))
                            .minStock((Integer) product.getOrDefault("minStock", 0))
                            .status((String) product.getOrDefault("status", "Sắp hết"))
                            .build())
                    .toList();
        } catch (Exception e) {
            log.warn("Failed to build low stock products from service data, returning empty list", e);
            return List.of();
        }
    }

    private ProductsResponse.InventorySummary buildInventorySummary(ProductDataCache cache) {
        try {
            Map<String, Object> alerts = cache.inventoryAlerts;

            // Extract inventory summary from inventory alerts
            Long lowStock = ((Number) alerts.getOrDefault("lowStock", cache.lowStockCount)).longValue();
            Long normal = ((Number) alerts.getOrDefault("normal", Math.max(0, cache.totalProducts - lowStock))).longValue();
            Long overstock = ((Number) alerts.getOrDefault("overstock", 0)).longValue();

            String alertMessage = lowStock > 0 ?
                    String.format("⚠️ Cảnh báo: Có %d sản phẩm cần nhập kho ngay!", lowStock) :
                    "✅ Tình trạng tồn kho ổn định";

            return ProductsResponse.InventorySummary.builder()
                    .lowStock(lowStock)
                    .normal(normal)
                    .overstock(overstock)
                    .alertMessage(alertMessage)
                    .build();
        } catch (Exception e) {
            log.warn("Failed to build inventory summary from service data, using default values", e);

            // Fallback to basic calculation
            long lowStock = cache.lowStockCount;
            long normal = Math.max(0, cache.totalProducts - lowStock);

            return ProductsResponse.InventorySummary.builder()
                    .lowStock(lowStock)
                    .normal(normal)
                    .overstock(0L)
                    .alertMessage(lowStock > 0 ?
                            String.format("⚠️ Cảnh báo: Có %d sản phẩm cần nhập kho ngay!", lowStock) :
                            "✅ Tình trạng tồn kho ổn định")
                    .build();
        }
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

    private ProductsResponse.Metadata buildMetadata() {
        return ProductsResponse.Metadata.builder()
                .lastUpdated(LocalDateTime.now())
                .cacheExpiry(300)
                .dataSource("real_time_microservices")
                .build();
    }

    // Data cache class to avoid duplicate calls
    private static class ProductDataCache {
        Integer totalProducts;
        Integer lowStockCount;
        List<Map<String, Object>> topProducts;
        List<Map<String, Object>> productSales;
        Map<String, Object> inventoryAlerts;
    }
}