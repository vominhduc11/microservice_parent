package com.devwonder.reportservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@FeignClient(name = "order-service", url = "${services.order-service.url:http://order-service:8085}", path = "/order-service/dashboard")
public interface OrderServiceClient {

    @GetMapping("/revenue-today")
    BigDecimal getTodayRevenue(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/revenue-yesterday")
    BigDecimal getYesterdayRevenue(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/revenue-month")
    BigDecimal getMonthRevenue(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/revenue-last-month")
    BigDecimal getLastMonthRevenue(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/completed-orders-today")
    Long getCompletedOrdersToday(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/total-orders-today")
    Long getTotalOrdersToday(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/top-dealers")
    List<Map<String, Object>> getTopDealers(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/dealer-count-this-month")
    Long getCurrentMonthDealers(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/dealer-count-last-month")
    Long getLastMonthDealers(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/product-sales")
    List<Map<String, Object>> getProductSales(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/total-orders-month")
    Long getTotalOrdersMonth(@RequestHeader("X-API-Key") String apiKey);
}