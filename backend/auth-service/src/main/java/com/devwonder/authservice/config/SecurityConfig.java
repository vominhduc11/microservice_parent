package com.devwonder.authservice.config;

import com.devwonder.common.config.BaseSecurityConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;

@Configuration
public class SecurityConfig extends BaseSecurityConfig {

    @Override
    protected void configureServiceEndpoints(AuthorizeHttpRequestsConfigurer<org.springframework.security.config.annotation.web.builders.HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth
            // JWKS endpoint - PUBLIC access (no authentication required)
            .requestMatchers("/auth/.well-known/jwks.json").permitAll()

            // Lookup endpoints for inter-service calls - API key required
            .requestMatchers("/auth-service/**").access(authApiKeyRequired())

            // All auth endpoints - ONLY accessible via API Gateway
            .requestMatchers("/auth/**").access(gatewayHeaderRequired());
    }
    
}