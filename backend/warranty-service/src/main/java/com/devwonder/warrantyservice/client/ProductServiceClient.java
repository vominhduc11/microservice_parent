package com.devwonder.warrantyservice.client;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.warrantyservice.dto.ProductSerialBulkStatusUpdateRequest;
import com.devwonder.warrantyservice.dto.ProductSerialInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "product-service", url = "${services.product-service.url:http://product-service:8083}")
public interface ProductServiceClient {

    @GetMapping("/product/product-serial/serial/{serial}")
    BaseResponse<Long> getProductSerialIdBySerial(
            @PathVariable String serial,
            @RequestHeader("X-API-Key") String apiKey
    );

    @PostMapping("/product/product-serial/bulk-status")
    BaseResponse<String> updateProductSerialsToSoldToCustomer(
            @RequestBody ProductSerialBulkStatusUpdateRequest request,
            @RequestHeader("X-API-Key") String apiKey
    );

    @GetMapping("/product/product-serial/{productSerialId}/details")
    BaseResponse<ProductSerialInfo> getProductSerialDetails(
            @PathVariable Long productSerialId,
            @RequestHeader("X-API-Key") String apiKey
    );
}