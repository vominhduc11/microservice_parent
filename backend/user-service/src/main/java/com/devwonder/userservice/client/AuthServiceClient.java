package com.devwonder.userservice.client;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.userservice.dto.AuthAccountCreateRequest;
import com.devwonder.userservice.dto.AuthAccountCreateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auth-service", url = "${services.auth-service.url:http://auth-service:8081}")
public interface AuthServiceClient {
    
    @PostMapping("/auth-service/accounts")
    BaseResponse<AuthAccountCreateResponse> createAccount(
            @RequestBody AuthAccountCreateRequest request,
            @RequestHeader("X-API-Key") String apiKey
    );

    @GetMapping("/auth-service/accounts/check-username/{username}")
    BaseResponse<Boolean> checkUsernameExists(
            @PathVariable String username,
            @RequestHeader("X-API-Key") String apiKey
    );

    @DeleteMapping("/auth-service/accounts/{accountId}")
    BaseResponse<String> deleteAccount(
            @PathVariable Long accountId,
            @RequestHeader("X-API-Key") String apiKey
    );

    @GetMapping("/auth-service/accounts/by-role")
    BaseResponse<java.util.List<Long>> getAccountIdsByRoleExcluding(
            @RequestParam String roleName,
            @RequestParam String excludeRoleName,
            @RequestHeader("X-API-Key") String apiKey
    );
}