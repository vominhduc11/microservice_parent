package com.devwonder.orderservice.controller;

import com.devwonder.orderservice.service.OrderDashboardService;
import com.devwonder.orderservice.dto.DealerOrderStatsDto;
import com.devwonder.orderservice.dto.ProductSalesDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order-service/dashboard")
@RequiredArgsConstructor
@Slf4j
public class OrderDashboardController {

    private final OrderDashboardService dashboardService;

    @GetMapping("/revenue-today")
    public BigDecimal getTodayRevenue(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting today revenue");
        return dashboardService.getTodayRevenue();
    }

    @GetMapping("/revenue-yesterday")
    public BigDecimal getYesterdayRevenue(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting yesterday revenue");
        return dashboardService.getYesterdayRevenue();
    }

    @GetMapping("/revenue-month")
    public BigDecimal getMonthRevenue(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting month revenue");
        return dashboardService.getMonthRevenue();
    }

    @GetMapping("/revenue-last-month")
    public BigDecimal getLastMonthRevenue(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting last month revenue");
        return dashboardService.getLastMonthRevenue();
    }

    @GetMapping("/completed-orders-today")
    public Long getCompletedOrdersToday(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting completed orders today");
        return dashboardService.getCompletedOrdersToday();
    }

    @GetMapping("/total-orders-today")
    public Long getTotalOrdersToday(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting total orders today");
        return dashboardService.getTotalOrdersToday();
    }

    @GetMapping("/revenue-by-period")
    public Map<String, BigDecimal> getRevenueByPeriod(
            @RequestHeader("X-API-Key") String apiKey,
            @RequestParam List<String> periods) {
        log.debug("Getting revenue by periods: {}", periods);
        return dashboardService.getRevenueByPeriod(periods);
    }

    @GetMapping("/orders-today")
    public Map<String, Long> getTodayOrderStats(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting today order stats");
        return dashboardService.getTodayOrderStats();
    }

    @GetMapping("/dealer-stats")
    public List<DealerOrderStatsDto> getDealerOrderStats(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting dealer order stats");
        return dashboardService.getDealerOrderStats();
    }

    @GetMapping("/top-products")
    public List<ProductSalesDto> getTopProducts(
            @RequestHeader("X-API-Key") String apiKey,
            @RequestParam(defaultValue = "5") int limit) {
        log.debug("Getting top products with limit: {}", limit);
        return dashboardService.getTopProducts(limit);
    }

    @GetMapping("/revenue-growth")
    public Map<String, Double> getRevenueGrowth(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting revenue growth");
        return dashboardService.getRevenueGrowth();
    }

    @GetMapping("/top-dealers")
    public List<Map<String, Object>> getTopDealers(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting top dealers");
        return dashboardService.getTopDealers();
    }


    @GetMapping("/product-sales")
    public List<Map<String, Object>> getProductSales(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting product sales");
        return dashboardService.getProductSales();
    }

    @GetMapping("/dealer-count-this-month")
    public Long getCurrentMonthDealers(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting current month dealers");
        return dashboardService.getCurrentMonthDealers();
    }

    @GetMapping("/dealer-count-last-month")
    public Long getLastMonthDealers(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting last month dealers");
        return dashboardService.getLastMonthDealers();
    }

    @GetMapping("/total-orders-month")
    public Long getTotalOrdersMonth(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting total orders this month");
        return dashboardService.getTotalOrdersMonth();
    }
}