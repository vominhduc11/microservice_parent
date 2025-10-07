package com.devwonder.productservice.controller;

import com.devwonder.productservice.service.ProductDashboardService;
import com.devwonder.productservice.dto.InventoryAlertsDto;
import com.devwonder.productservice.dto.ProductStockDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/product-service/dashboard")
@RequiredArgsConstructor
@Slf4j
public class ProductDashboardController {

    private final ProductDashboardService dashboardService;

    @GetMapping("/inventory-alerts")
    public Map<String, Object> getInventoryAlerts(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting inventory alerts");
        InventoryAlertsDto alerts = dashboardService.getInventoryAlerts();
        Map<String, Object> alertsMap = new HashMap<>();
        alertsMap.put("lowStockCount", alerts.getLowStockCount());
        alertsMap.put("overstockCount", alerts.getOverstockCount());
        alertsMap.put("urgentProduct", alerts.getUrgentProduct());
        return alertsMap;
    }

    @GetMapping("/low-stock-products")
    public List<ProductStockDto> getLowStockProducts(
            @RequestHeader("X-API-Key") String apiKey,
            @RequestParam(defaultValue = "10") int threshold) {
        log.debug("Getting low stock products with threshold: {}", threshold);
        return dashboardService.getLowStockProducts(threshold);
    }

    @GetMapping("/product-counts")
    public Map<String, Integer> getProductCounts(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting product counts");
        return dashboardService.getProductCounts();
    }

    @GetMapping("/urgent-product")
    public String getUrgentProduct(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting urgent product");
        return dashboardService.getUrgentProduct();
    }

    @GetMapping("/low-stock-count")
    public Integer getLowStockCount(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting low stock count");
        return dashboardService.getLowStockCount();
    }

    @GetMapping("/total-products")
    public Integer getTotalProducts(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting total products");
        return dashboardService.getTotalProducts();
    }

    @GetMapping("/top-products")
    public List<Map<String, Object>> getTopProducts(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting top products");
        return dashboardService.getTopProducts();
    }
}