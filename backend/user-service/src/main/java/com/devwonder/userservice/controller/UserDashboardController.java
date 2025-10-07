package com.devwonder.userservice.controller;

import com.devwonder.userservice.service.UserDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user-service/dashboard")
@RequiredArgsConstructor
@Slf4j
public class UserDashboardController {

    private final UserDashboardService dashboardService;

    @GetMapping("/dealer-counts")
    public Map<String, Long> getDealerCounts(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting dealer counts");
        return dashboardService.getDealerCounts();
    }

    @GetMapping("/monthly-dealer-growth")
    public Map<String, Double> getMonthlyDealerGrowth(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting monthly dealer growth");
        return dashboardService.getMonthlyDealerGrowth();
    }

    @GetMapping("/dealer-count")
    public Long getTotalDealers(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting total dealers");
        return dashboardService.getTotalDealers();
    }

    @GetMapping("/top-dealers")
    public List<Map<String, Object>> getTopDealers(@RequestHeader("X-API-Key") String apiKey) {
        log.debug("Getting top dealers");
        return dashboardService.getTopDealers();
    }
}