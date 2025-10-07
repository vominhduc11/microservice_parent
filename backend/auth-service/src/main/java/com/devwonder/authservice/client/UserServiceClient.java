package com.devwonder.authservice.client;

import com.devwonder.common.dto.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "user-service", url = "http://user-service:8082")
public interface UserServiceClient {

    @GetMapping("/auth-lookup/admin/{accountId}/require-login-email-confirmation")
    ResponseEntity<BaseResponse<Boolean>> getAdminRequireLoginEmailConfirmation(
            @PathVariable Long accountId,
            @RequestHeader("X-API-Key") String apiKey
    );

    @GetMapping("/auth-lookup/admin/{accountId}/email")
    ResponseEntity<BaseResponse<String>> getAdminEmail(
            @PathVariable Long accountId,
            @RequestHeader("X-API-Key") String apiKey
    );

    @GetMapping("/auth-lookup/email/{email}/account-id")
    ResponseEntity<BaseResponse<Long>> getAccountIdByEmail(
            @PathVariable String email,
            @RequestHeader("X-API-Key") String apiKey
    );
}
