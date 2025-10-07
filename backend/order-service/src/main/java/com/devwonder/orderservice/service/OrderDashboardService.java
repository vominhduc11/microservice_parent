package com.devwonder.orderservice.service;

import com.devwonder.orderservice.repository.OrderRepository;
import com.devwonder.orderservice.repository.OrderItemRepository;
import com.devwonder.orderservice.dto.DealerOrderStatsDto;
import com.devwonder.orderservice.dto.ProductSalesDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderDashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public BigDecimal getTodayRevenue() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        return orderItemRepository.calculateRevenueByDateRange(startOfDay, endOfDay)
            .orElse(BigDecimal.ZERO);
    }


    public BigDecimal getYesterdayRevenue() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfDay = yesterday.atStartOfDay();
        LocalDateTime endOfDay = yesterday.atTime(23, 59, 59);

        return orderItemRepository.calculateRevenueByDateRange(startOfDay, endOfDay)
            .orElse(BigDecimal.ZERO);
    }

    public Map<String, BigDecimal> getRevenueByPeriod(List<String> periods) {
        Map<String, BigDecimal> result = new HashMap<>();
        LocalDate now = LocalDate.now();

        for (String period : periods) {
            BigDecimal revenue = switch (period.toLowerCase()) {
                case "today" -> getTodayRevenue();
                case "yesterday" -> getYesterdayRevenue();
                case "this_week" -> getWeekRevenue(now);
                case "last_week" -> getWeekRevenue(now.minusWeeks(1));
                case "this_month" -> getMonthRevenue(now);
                case "last_month" -> getMonthRevenue(now.minusMonths(1));
                case "this_year" -> getYearRevenue(now);
                case "last_year" -> getYearRevenue(now.minusYears(1));
                default -> BigDecimal.ZERO;
            };
            result.put(period, revenue);
        }

        return result;
    }

    public Map<String, Long> getTodayOrderStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        // Use PAID orders to be consistent with revenue calculation
        Long totalOrders = orderRepository.countPaidOrdersByDateRange(startOfDay, endOfDay);
        Long completedOrders = orderItemRepository.countCompletedOrdersByDateRange(startOfDay, endOfDay);

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", totalOrders);
        stats.put("completed", completedOrders);
        stats.put("pending", Math.max(0L, totalOrders - completedOrders));

        return stats;
    }

    public List<DealerOrderStatsDto> getDealerOrderStats() {
        // Get real dealer order statistics from database using native query
        List<Object[]> rawResults = orderRepository.getDealerOrderStats();

        List<DealerOrderStatsDto> result = new ArrayList<>();
        for (Object[] row : rawResults) {
            result.add(new DealerOrderStatsDto(
                ((Number) row[0]).longValue(),                          // dealerId
                (String) row[1],                                         // dealerName
                ((Number) row[2]).longValue(),                          // totalOrders
                BigDecimal.valueOf(((Number) row[3]).doubleValue())     // totalRevenue
            ));
        }
        return result;
    }

    public List<ProductSalesDto> getTopProducts(int limit) {
        // Get real product sales statistics from database
        List<Object[]> rawResults = orderItemRepository.getTopProductsSalesRaw(limit);

        return rawResults.stream()
            .map(row -> {
                ProductSalesDto dto = new ProductSalesDto();
                dto.productId = ((Number) row[0]).longValue();
                dto.productName = (String) row[1];
                dto.soldQuantity = (Integer) row[2];
                dto.revenue = (BigDecimal) row[3];
                dto.growth = ((Number) row[4]).doubleValue();
                return dto;
            })
            .toList();
    }

    public Map<String, Double> getRevenueGrowth() {
        Map<String, Double> growth = new HashMap<>();

        BigDecimal todayRevenue = getTodayRevenue();
        BigDecimal yesterdayRevenue = getYesterdayRevenue();
        growth.put("daily", calculateGrowthPercentage(todayRevenue, yesterdayRevenue));

        BigDecimal thisWeekRevenue = getWeekRevenue(LocalDate.now());
        BigDecimal lastWeekRevenue = getWeekRevenue(LocalDate.now().minusWeeks(1));
        growth.put("weekly", calculateGrowthPercentage(thisWeekRevenue, lastWeekRevenue));

        BigDecimal thisMonthRevenue = getMonthRevenue(LocalDate.now());
        BigDecimal lastMonthRevenue = getMonthRevenue(LocalDate.now().minusMonths(1));
        growth.put("monthly", calculateGrowthPercentage(thisMonthRevenue, lastMonthRevenue));

        BigDecimal thisYearRevenue = getYearRevenue(LocalDate.now());
        BigDecimal lastYearRevenue = getYearRevenue(LocalDate.now().minusYears(1));
        growth.put("yearly", calculateGrowthPercentage(thisYearRevenue, lastYearRevenue));

        return growth;
    }

    private BigDecimal getWeekRevenue(LocalDate date) {
        LocalDateTime startOfWeek = date.with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime endOfWeek = date.with(java.time.DayOfWeek.SUNDAY).atTime(23, 59, 59);

        return orderItemRepository.calculateRevenueByDateRange(startOfWeek, endOfWeek)
            .orElse(BigDecimal.ZERO);
    }

    private BigDecimal getMonthRevenue(LocalDate date) {
        LocalDateTime startOfMonth = date.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfMonth = date.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

        return orderItemRepository.calculateRevenueByDateRange(startOfMonth, endOfMonth)
            .orElse(BigDecimal.ZERO);
    }

    private BigDecimal getYearRevenue(LocalDate date) {
        LocalDateTime startOfYear = date.with(TemporalAdjusters.firstDayOfYear()).atStartOfDay();
        LocalDateTime endOfYear = date.with(TemporalAdjusters.lastDayOfYear()).atTime(23, 59, 59);

        return orderItemRepository.calculateRevenueByDateRange(startOfYear, endOfYear)
            .orElse(BigDecimal.ZERO);
    }

    private double calculateGrowthPercentage(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        return current.subtract(previous)
            .divide(previous, 4, BigDecimal.ROUND_HALF_UP)
            .multiply(BigDecimal.valueOf(100))
            .doubleValue();
    }

    public BigDecimal getMonthRevenue() {
        return getMonthRevenue(LocalDate.now());
    }

    public BigDecimal getLastMonthRevenue() {
        return getMonthRevenue(LocalDate.now().minusMonths(1));
    }

    public Long getCompletedOrdersToday() {
        Map<String, Long> stats = getTodayOrderStats();
        return stats.get("completed");
    }

    public Long getTotalOrdersToday() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        // Use PAID orders to be consistent with revenue calculation
        return orderRepository.countPaidOrdersByDateRange(startOfDay, endOfDay);
    }

    public List<Map<String, Object>> getTopDealers() {
        List<DealerOrderStatsDto> dealerStats = getDealerOrderStats();
        return dealerStats.stream()
                .map(dealer -> Map.<String, Object>of(
                        "rank", dealerStats.indexOf(dealer) + 1,
                        "name", dealer.companyName,
                        "totalSpent", dealer.totalRevenue.longValue(),
                        "totalOrders", dealer.totalOrders
                ))
                .toList();
    }

    public Long getDealerCountThisMonth() {
        // Get unique dealers who placed orders this month
        LocalDateTime startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

        return orderRepository.countDistinctDealersByDateRange(startOfMonth, endOfMonth);
    }

    public Long getDealerCountLastMonth() {
        // Get unique dealers who placed orders last month
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        LocalDateTime startOfLastMonth = lastMonth.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfLastMonth = lastMonth.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

        return orderRepository.countDistinctDealersByDateRange(startOfLastMonth, endOfLastMonth);
    }

    public List<Map<String, Object>> getProductSales() {
        List<ProductSalesDto> productSales = getTopProducts(10);
        return productSales.stream()
                .map(product -> Map.<String, Object>of(
                        "productId", product.productId,
                        "productName", product.productName,
                        "soldCount", product.soldQuantity,
                        "revenue", product.revenue.longValue(),
                        "growth", product.growth
                ))
                .toList();
    }

    // Alias methods for Report Service compatibility
    public Long getCurrentMonthDealers() {
        return getDealerCountThisMonth();
    }

    public Long getLastMonthDealers() {
        return getDealerCountLastMonth();
    }

    public Long getTotalOrdersMonth() {
        LocalDate now = LocalDate.now();
        LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

        // Use PAID orders to be consistent with revenue calculation
        return orderRepository.countPaidOrdersByDateRange(startOfMonth, endOfMonth);
    }
}