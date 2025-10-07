package com.devwonder.productservice.service;

import com.devwonder.productservice.entity.Product;
import com.devwonder.productservice.repository.ProductRepository;
import com.devwonder.productservice.repository.ProductSerialRepository;
import com.devwonder.productservice.enums.ProductSerialStatus;
import com.devwonder.productservice.dto.InventoryAlertsDto;
import com.devwonder.productservice.dto.ProductStockDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductDashboardService {

    private final ProductRepository productRepository;
    private final ProductSerialRepository productSerialRepository;

    public InventoryAlertsDto getInventoryAlerts() {
        int lowStockThreshold = 10;
        int overstockThreshold = 100;

        List<Object[]> stockCounts = productSerialRepository.getProductStockCounts();

        int lowStockCount = 0;
        int overstockCount = 0;
        String urgentProduct = null;
        int lowestStock = Integer.MAX_VALUE;

        for (Object[] row : stockCounts) {
            Long productId = (Long) row[0];
            String productName = (String) row[1];
            Long inStockCountLong = (Long) row[2];
            int inStockCount = inStockCountLong.intValue();

            if (inStockCount < lowStockThreshold) {
                lowStockCount++;
                if (inStockCount < lowestStock) {
                    lowestStock = inStockCount;
                    urgentProduct = productName;
                }
            }

            if (inStockCount > overstockThreshold) {
                overstockCount++;
            }
        }

        InventoryAlertsDto alerts = new InventoryAlertsDto();
        alerts.lowStockCount = lowStockCount;
        alerts.overstockCount = overstockCount;
        alerts.urgentProduct = urgentProduct;

        return alerts;
    }

    public List<ProductStockDto> getLowStockProducts(int threshold) {
        List<Object[]> stockData = productSerialRepository.getProductStockCounts();
        List<ProductStockDto> lowStockProducts = new ArrayList<>();

        for (Object[] row : stockData) {
            Long productId = (Long) row[0];
            String productName = (String) row[1];
            Long inStockCountLong = (Long) row[2];
            int inStockCount = inStockCountLong.intValue();

            if (inStockCount < threshold) {
                ProductStockDto product = new ProductStockDto();
                product.productId = productId;
                product.productName = productName;
                product.inStockCount = inStockCount;

                // Get other counts
                int allocatedCount = productSerialRepository.countByProductIdAndStatus(productId, ProductSerialStatus.ALLOCATED_TO_DEALER);
                int soldCount = productSerialRepository.countByProductIdAndStatus(productId, ProductSerialStatus.SOLD_TO_CUSTOMER);

                product.allocatedCount = allocatedCount;
                product.soldCount = soldCount;

                lowStockProducts.add(product);
            }
        }

        return lowStockProducts;
    }

    public Map<String, Integer> getProductCounts() {
        Map<String, Integer> counts = new HashMap<>();

        int totalProducts = (int) productRepository.count();
        int lowStockProducts = getLowStockProducts(10).size();
        int inStockProducts = productSerialRepository.countByStatus(ProductSerialStatus.IN_STOCK);
        int allocatedProducts = productSerialRepository.countByStatus(ProductSerialStatus.ALLOCATED_TO_DEALER);

        counts.put("total_products", totalProducts);
        counts.put("low_stock", lowStockProducts);
        counts.put("in_stock_items", inStockProducts);
        counts.put("allocated_items", allocatedProducts);

        return counts;
    }

    public String getUrgentProduct() {
        List<Object[]> stockCounts = productSerialRepository.getProductStockCounts();

        String urgentProduct = null;
        int lowestStock = Integer.MAX_VALUE;

        for (Object[] row : stockCounts) {
            String productName = (String) row[1];
            Long inStockCountLong = (Long) row[2];
            int inStockCount = inStockCountLong.intValue();

            if (inStockCount < lowestStock) {
                lowestStock = inStockCount;
                urgentProduct = productName;
            }
        }

        return urgentProduct;
    }

    public Integer getLowStockCount() {
        return getLowStockProducts(10).size();
    }

    public Integer getTotalProducts() {
        return (int) productRepository.count();
    }

    public List<Map<String, Object>> getTopProducts() {
        // Get real top products based on sold quantities from product serials
        List<Object[]> salesData = productSerialRepository.getTopProductsBySales();
        List<Map<String, Object>> topProducts = new ArrayList<>();

        int rank = 1;
        for (Object[] row : salesData) {
            if (rank > 10) break; // Limit to top 10

            Long productId = (Long) row[0];
            String productName = (String) row[1];
            Long soldQuantity = (Long) row[2];

            // Calculate revenue (lookup product price from database)
            Product product = productRepository.findById(productId).orElse(null);
            if (product == null) continue;

            long revenue = soldQuantity * product.getPrice().longValue();

            // Calculate growth based on sell-through rate
            double growth = calculateProductGrowth(productId);

            Map<String, Object> productData = new HashMap<>();
            productData.put("rank", rank);
            productData.put("name", productName);
            productData.put("soldQuantity", soldQuantity.intValue());
            productData.put("revenue", revenue);
            productData.put("growth", growth);
            topProducts.add(productData);

            rank++;
        }

        return topProducts;
    }

    private double calculateProductGrowth(Long productId) {
        // Simple growth calculation - could be enhanced with time-based analysis
        // For now, return a calculated value based on product performance
        long totalSerials = productSerialRepository.countByProductId(productId);
        long soldSerials = productSerialRepository.countByProductIdAndStatus(productId, ProductSerialStatus.SOLD_TO_CUSTOMER);

        if (totalSerials == 0) return 0.0;
        double sellThroughRate = (double) soldSerials / totalSerials * 100;

        // Convert sell-through rate to growth percentage (simplified logic)
        return Math.min(sellThroughRate * 0.3, 50.0); // Cap at 50% growth
    }
}