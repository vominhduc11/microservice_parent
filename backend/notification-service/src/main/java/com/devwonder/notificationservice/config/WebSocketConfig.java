package com.devwonder.notificationservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    private final WebSocketAuthenticationInterceptor authenticationInterceptor;
    private final WebSocketAuthorizationInterceptor authorizationInterceptor;
    
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // Enable simple broker for /topic and /queue destinations
        config.enableSimpleBroker("/topic", "/queue");
        
        // Set application destination prefix
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Register SockJS endpoint with WebSocket fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:9000")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        // Add JWT authentication interceptor for STOMP CONNECT frames
        // Add role-based authorization interceptor for STOMP SEND frames
        registration.interceptors(authenticationInterceptor, authorizationInterceptor);
    }
}