package com.devwonder.orderservice.client;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.orderservice.dto.DealerResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "user-service", url = "${services.user-service.url:http://user-service:8082}")
public interface UserServiceClient {

    @GetMapping("/dealer-service/dealers/{dealerId}?fields=companyName,email,phone,city")
    BaseResponse<DealerResponse> getDealerInfo(
            @PathVariable("dealerId") Long dealerId,
            @RequestHeader("X-API-Key") String apiKey
    );
}
