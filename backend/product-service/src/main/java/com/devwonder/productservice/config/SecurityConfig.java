package com.devwonder.productservice.config;

import com.devwonder.common.config.BaseSecurityConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends BaseSecurityConfig {

    @Override
    protected void configureServiceEndpoints(AuthorizeHttpRequestsConfigurer<org.springframework.security.config.annotation.web.builders.HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth
            // Specific product endpoints for inter-service calls - API key required
            .requestMatchers("/product/product-serial/serial/*").access(authApiKeyRequired())       // Serial lookup calls
            .requestMatchers("/product/product-serial/bulk-status").access(authApiKeyRequired())    // Bulk status update calls
            .requestMatchers("/product/product-serial/*/details").access(authApiKeyRequired())      // Product serial details lookup
            .requestMatchers("/product/products/*/name").access(authApiKeyRequired())               // Product name lookup for inter-service
            .requestMatchers("/product/products/*/info").access(authApiKeyRequired())               // Product info lookup for inter-service
            .requestMatchers("/product/product-serials/dealer/*/product-ids").access(authApiKeyRequired()) // Product IDs by dealer
            // Dashboard endpoints for Report Service - API key required
            .requestMatchers("/product-service/dashboard/**").access(authApiKeyRequired())

            // Product serials endpoints - Gateway required (DEALER role for inventory management)
            .requestMatchers("/product/product-serials/**").access(gatewayHeaderRequired())

            // All other product endpoints - ONLY accessible via API Gateway
            .requestMatchers("/product/**").access(gatewayHeaderRequired());
    }
}
