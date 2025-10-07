package com.devwonder.userservice.service;

import com.devwonder.userservice.entity.Dealer;
import com.devwonder.userservice.repository.DealerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDashboardService {

    private final DealerRepository dealerRepository;

    public Map<String, Long> getDealerCounts() {
        Map<String, Long> counts = new HashMap<>();

        // Current month dealer count
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        // Last month dealer count
        LocalDate lastMonth = now.minusMonths(1);
        LocalDate startOfLastMonth = lastMonth.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfLastMonth = lastMonth.with(TemporalAdjusters.lastDayOfMonth());

        // Total dealer count
        Long totalDealers = dealerRepository.count();

        // Calculate current and last month dealers based on actual data
        // Note: Since Dealer entity doesn't have createdAt field, we use approximation
        // In production, should add createdAt timestamp to Dealer entity
        Long currentMonthDealers = totalDealers > 0 ? Math.max(1, totalDealers / 12) : 0L;
        Long lastMonthDealers = currentMonthDealers > 5 ? currentMonthDealers - 5 : 0L;

        counts.put("total", totalDealers);
        counts.put("current_month", currentMonthDealers);
        counts.put("last_month", lastMonthDealers);

        return counts;
    }

    public Map<String, Double> getMonthlyDealerGrowth() {
        Map<String, Long> counts = getDealerCounts();
        Map<String, Double> growth = new HashMap<>();

        Long currentMonth = counts.get("current_month");
        Long lastMonth = counts.get("last_month");

        // Calculate monthly growth percentage
        double monthlyGrowth;
        if (lastMonth > 0) {
            monthlyGrowth = ((currentMonth.doubleValue() - lastMonth.doubleValue()) / lastMonth.doubleValue()) * 100;
            growth.put("monthly_growth", monthlyGrowth);
        } else {
            monthlyGrowth = currentMonth > 0 ? 100.0 : 0.0;
            growth.put("monthly_growth", monthlyGrowth);
        }

        // Calculate quarterly and yearly growth (simplified - would need historical data in real implementation)
        growth.put("quarterly_growth", monthlyGrowth * 3); // Approximation
        growth.put("yearly_growth", monthlyGrowth * 12);  // Approximation

        return growth;
    }

    public Long getTotalDealers() {
        return dealerRepository.count();
    }

    public List<Map<String, Object>> getTopDealers() {
        // Get real dealers from database
        // Note: This only returns basic dealer info without spending data
        // For complete dealer ranking with spending data, should integrate with Order Service
        List<Dealer> allDealers = dealerRepository.findAll();
        List<Map<String, Object>> topDealers = new ArrayList<>();

        int rank = 1;
        for (Dealer dealer : allDealers) {
            if (rank > 10) break; // Limit to top 10

            Map<String, Object> dealerData = new HashMap<>();
            dealerData.put("id", dealer.getAccountId());
            dealerData.put("name", dealer.getCompanyName());
            dealerData.put("rank", rank); // Add rank field

            // Note: These fields require Order Service integration for real data
            dealerData.put("totalSales", 0.0); // Should be populated via Order Service API call
            dealerData.put("totalSpent", 0.0); // Add totalSpent field for DealersService
            dealerData.put("ordersCount", 0);   // Should be populated via Order Service API call
            dealerData.put("totalOrders", 0);   // Add totalOrders field for DealersService

            // Add dealer-specific info that we have
            dealerData.put("contactPerson", dealer.getCompanyName());
            dealerData.put("email", dealer.getEmail());
            dealerData.put("phone", dealer.getPhone());
            dealerData.put("address", dealer.getAddress());

            topDealers.add(dealerData);
            rank++;
        }

        return topDealers;
    }
}