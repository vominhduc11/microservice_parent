package com.devwonder.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.stream.Collectors;

@Component
public class JwtForwardingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .cast(org.springframework.security.core.context.SecurityContext.class)
                .map(securityContext -> securityContext.getAuthentication())
                .cast(Authentication.class)
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .cast(JwtAuthenticationToken.class)
                .map(jwtAuth -> {
                    Jwt jwt = jwtAuth.getToken();
                    
                    // Forward JWT claims as headers
                    ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate()
                            .header("X-Gateway-Request", "true")
                            .header("X-JWT-Subject", jwt.getSubject())
                            .header("X-JWT-Username", jwt.getClaimAsString("username"))
                            .header("X-JWT-Account-ID", jwt.getClaimAsString("accountId"));
                    
                    // Forward authorities/roles
                    String authorities = jwtAuth.getAuthorities().stream()
                            .map(auth -> auth.getAuthority())
                            .collect(Collectors.joining(","));
                    requestBuilder.header("X-JWT-Authorities", authorities);
                    
                    // Forward roles from JWT token
                    Object roles = jwt.getClaim("roles");
                    if (roles != null) {
                        if (roles instanceof java.util.List) {
                            @SuppressWarnings("unchecked")
                            String rolesStr = String.join(",", (java.util.List<String>) roles);
                            requestBuilder.header("X-User-Roles", rolesStr);
                        } else {
                            requestBuilder.header("X-User-Roles", roles.toString());
                        }
                    }
                    
                    // Forward permissions from JWT token
                    Object permissions = jwt.getClaim("permissions");
                    if (permissions != null) {
                        if (permissions instanceof java.util.List) {
                            @SuppressWarnings("unchecked")
                            String permsStr = String.join(",", (java.util.List<String>) permissions);
                            requestBuilder.header("X-User-Permissions", permsStr);
                        } else {
                            requestBuilder.header("X-User-Permissions", permissions.toString());
                        }
                    }
                    
                    return exchange.mutate()
                            .request(requestBuilder.build())
                            .build();
                })
                .defaultIfEmpty(
                    // For unauthenticated requests, just add Gateway header
                    exchange.mutate()
                            .request(exchange.getRequest().mutate()
                                    .header("X-Gateway-Request", "true")
                                    .build())
                            .build()
                )
                .flatMap(chain::filter);
    }

    @Override
    public int getOrder() {
        return -1; // Execute before other filters
    }
}