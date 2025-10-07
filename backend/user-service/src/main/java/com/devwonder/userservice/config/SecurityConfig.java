package com.devwonder.userservice.config;

import com.devwonder.common.config.BaseSecurityConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;

@Configuration
public class SecurityConfig extends BaseSecurityConfig {

    @Override
    protected void configureServiceEndpoints(AuthorizeHttpRequestsConfigurer<org.springframework.security.config.annotation.web.builders.HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth
            // Inter-service lookup endpoints - API key required
            .requestMatchers("/dealer-service/**").access(authApiKeyRequired())
            // Dashboard endpoints for Report Service - API key required
            .requestMatchers("/user-service/dashboard/**").access(authApiKeyRequired())
            // Auth service lookup endpoints - API key required
            .requestMatchers("/auth-lookup/**").access(authApiKeyRequired())

            // Gateway endpoints - ONLY accessible via API Gateway
            .requestMatchers("/user/dealer/**").access(gatewayHeaderRequired())
            .requestMatchers("/user/admin/**").access(gatewayHeaderRequired());
    }
}
