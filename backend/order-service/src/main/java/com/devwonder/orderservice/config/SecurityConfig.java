package com.devwonder.orderservice.config;

import com.devwonder.common.config.BaseSecurityConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;

@Configuration
public class SecurityConfig extends BaseSecurityConfig {

    @Override
    protected void configureServiceEndpoints(AuthorizeHttpRequestsConfigurer<org.springframework.security.config.annotation.web.builders.HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth
            // Inter-service endpoints - allow API key authentication
            .requestMatchers("/order/order-service/**").access(authApiKeyRequired())
            // Dashboard endpoints for Report Service - API key required
            .requestMatchers("/order-service/dashboard/**").access(authApiKeyRequired())
            // Other order endpoints - ONLY accessible via API Gateway
            .requestMatchers("/order/**").access(gatewayHeaderRequired());
    }
}
