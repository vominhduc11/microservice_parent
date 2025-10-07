package com.devwonder.notificationservice.config;

import com.devwonder.common.service.JwtService;
import com.devwonder.common.exception.AuthenticationException;
import com.devwonder.common.exception.AuthorizationException;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthenticationInterceptor implements ChannelInterceptor {
    
    private final JwtService jwtService;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // This is a STOMP CONNECT frame - validate JWT token
            log.info("🔐 Processing STOMP CONNECT frame for authentication");
            
            String token = extractTokenFromHeaders(accessor);
            
            if (token == null || token.isEmpty()) {
                log.error("❌ No JWT token provided in STOMP CONNECT frame");
                throw new AuthenticationException("Authentication required");
            }
            
            log.info("🎟️ JWT token found, validating...");
            
            try {
                // Validate JWT token (includes expiration check)
                JWTClaimsSet claimsSet = jwtService.validateToken(token);
                log.info("✅ JWT token validation successful");
                
                // Extract user info (no role restriction - all authenticated users allowed)
                List<String> roles = jwtService.extractRoles(claimsSet);
                String username = jwtService.extractUsername(claimsSet);
                Long accountId = jwtService.extractAccountId(claimsSet);
                
                // Create a Principal and set it in the accessor
                Principal principal = createPrincipal(claimsSet);
                accessor.setUser(principal);
                
                log.info("✅ STOMP CONNECT authenticated successfully!");
                log.info("👤 User: {} (ID: {}) with roles: {}", username, accountId, roles);
                log.info("🔑 Principal created: {}", principal.getName());
                
            } catch (AuthenticationException | AuthorizationException e) {
                log.error("❌ Authentication/Authorization failed: {}", e.getMessage());
                throw e;
            } catch (Exception e) {
                log.error("❌ STOMP CONNECT authentication failed: {}", e.getMessage());
                e.printStackTrace();
                throw new AuthenticationException("Authentication failed: " + e.getMessage());
            }
        }
        
        return message;
    }

    private String extractTokenFromHeaders(StompHeaderAccessor accessor) {
        // Try to get token from Authorization header
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }
        
        // Try to get token from custom header
        List<String> tokenHeaders = accessor.getNativeHeader("token");
        if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
            return tokenHeaders.get(0);
        }
        
        return null;
    }

    private Principal createPrincipal(JWTClaimsSet claimsSet) {
        String username = jwtService.extractUsername(claimsSet);
        Long accountId = jwtService.extractAccountId(claimsSet);
        
        return new Principal() {
            @Override
            public String getName() {
                return username != null ? username : String.valueOf(accountId);
            }
        };
    }
}