package com.devwonder.notificationservice.config;

import com.devwonder.common.config.BaseSecurityConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;

@Configuration
public class SecurityConfig extends BaseSecurityConfig {

    @Override
    protected void configureServiceEndpoints(AuthorizeHttpRequestsConfigurer<org.springframework.security.config.annotation.web.builders.HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth
            // WebSocket endpoint - Allow direct access for SockJS handshake
            .requestMatchers("/ws/**").permitAll()
            // All notification endpoints - ONLY accessible via API Gateway
            .requestMatchers("/notification/**").access(gatewayHeaderRequired());
    }
}
