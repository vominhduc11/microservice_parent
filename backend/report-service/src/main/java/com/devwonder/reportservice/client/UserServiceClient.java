package com.devwonder.reportservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

@FeignClient(name = "user-service", url = "${services.user-service.url:http://user-service:8082}", path = "/user-service/dashboard")
public interface UserServiceClient {

    @GetMapping("/dealer-count")
    Long getTotalDealers(@RequestHeader("X-API-Key") String apiKey);

    @GetMapping("/top-dealers")
    List<Map<String, Object>> getTopDealers(@RequestHeader("X-API-Key") String apiKey);
}