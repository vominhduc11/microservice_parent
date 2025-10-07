package com.devwonder.apigateway.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class RequestUtil {

    public static String getClientIpAddress(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        var remoteAddress = request.getRemoteAddress();
        return remoteAddress != null ?
            remoteAddress.getAddress().getHostAddress() : "unknown";
    }
}