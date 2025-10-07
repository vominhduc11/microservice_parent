package com.devwonder.productservice.client;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.common.enums.OrderItemStatus;
import com.devwonder.productservice.dto.OrderItemResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service", url = "${services.order-service.url:http://order-service:8085}")
public interface OrderServiceClient {

    @GetMapping("/order/order-service/items/{orderItemId}")
    BaseResponse<OrderItemResponse> getOrderItem(
            @PathVariable("orderItemId") Long orderItemId,
            @RequestHeader("X-API-Key") String apiKey
    );

    @PostMapping("/order/order-service/items/{orderItemId}/status")
    BaseResponse<String> updateOrderItemStatus(
            @PathVariable("orderItemId") Long orderItemId,
            @RequestParam("status") OrderItemStatus status,
            @RequestHeader("X-API-Key") String apiKey
    );
}