package com.devwonder.orderservice.client;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.orderservice.dto.ProductInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "product-service", url = "${services.product-service.url:http://product-service:8083}")
public interface ProductServiceClient {

    @GetMapping("/product/products/{productId}/name")
    BaseResponse<String> getProductName(
            @PathVariable("productId") Long productId,
            @RequestHeader("X-API-Key") String apiKey
    );

    @GetMapping("/product/products/{productId}/info")
    BaseResponse<ProductInfo> getProductInfo(
            @PathVariable("productId") Long productId,
            @RequestHeader("X-API-Key") String apiKey
    );

    @GetMapping("/product/product-serials/dealer/{dealerId}/product-ids")
    BaseResponse<List<Long>> getProductIdsWithSerialsByDealer(
            @PathVariable("dealerId") Long dealerId,
            @RequestHeader("X-API-Key") String apiKey
    );
}