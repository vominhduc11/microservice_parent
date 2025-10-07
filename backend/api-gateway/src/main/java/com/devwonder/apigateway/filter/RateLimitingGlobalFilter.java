package com.devwonder.apigateway.filter;

// Update the import to the correct package, for example:
import com.devwonder.apigateway.util.RequestUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
public class RateLimitingGlobalFilter implements GlobalFilter, Ordered {
    
    private static final int MAX_REQUESTS_PER_MINUTE = 300;
    private static final long WINDOW_SIZE_MILLIS = 60 * 1000L; // 1 minute in milliseconds
    
    private final ConcurrentHashMap<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String clientId = RequestUtil.getClientIpAddress(request);
        String path = request.getPath().value();
        
        // Skip rate limiting for health checks, static resources, and API documentation
        if (path.contains("/actuator/") ||
            path.contains("/health") ||
            path.contains("/swagger-ui/") ||
            path.contains("/v3/api-docs") ||
            path.contains("/swagger-resources/") ||
            path.contains("/webjars/")) {
            return chain.filter(exchange);
        }
        
        RequestCounter counter = requestCounts.computeIfAbsent(clientId, k -> new RequestCounter());
        
        long now = Instant.now().toEpochMilli();
        
        synchronized (counter) {
            // Reset counter if window has passed
            if (now - counter.windowStart > WINDOW_SIZE_MILLIS) {
                counter.reset(now);
            }
            
            if (counter.count.get() >= MAX_REQUESTS_PER_MINUTE) {
                log.warn("Rate limit exceeded for client: {}", clientId);
                return handleRateLimitExceeded(exchange);
            }
            
            counter.count.incrementAndGet();
        }
        
        return chain.filter(exchange);
    }

    private Mono<Void> handleRateLimitExceeded(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().add("Content-Type", MediaType.APPLICATION_JSON_VALUE);
        response.getHeaders().add("Retry-After", "60");
        
        String body = String.format(
            "{\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests. Try again later.\",\"timestamp\":\"%s\"}",
            Instant.now()
        );
        
        var buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -200; // Execute before authentication
    }

    private static class RequestCounter {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart;
        
        public RequestCounter() {
            this.windowStart = Instant.now().toEpochMilli();
        }
        
        public void reset(long newWindowStart) {
            this.count.set(0);
            this.windowStart = newWindowStart;
        }
    }
}