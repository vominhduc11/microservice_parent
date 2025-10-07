package com.devwonder.reportservice.client;

// Using Map<String, Object> instead of DTOs to avoid cross-service dependencies
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

@FeignClient(name = "product-service", url = "${services.product-service.url:http://product-service:8083}", path = "/product-service/dashboard")
public interface ProductServiceClient {

    @GetMapping("/inventory-alerts")
    Map<String, Object> getInventoryAlerts(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/low-stock-count")
    Integer getLowStockCount(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/total-products")
    Integer getTotalProducts(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/urgent-product")
    String getUrgentProduct(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/top-products")
    List<Map<String, Object>> getTopProducts(@RequestHeader("X-API-Key") String apiKey);
}