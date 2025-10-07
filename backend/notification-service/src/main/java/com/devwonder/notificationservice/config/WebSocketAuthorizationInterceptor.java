package com.devwonder.notificationservice.config;

import com.devwonder.common.service.JwtService;
import com.devwonder.common.exception.AuthenticationException;
import com.devwonder.common.exception.AuthorizationException;
import com.nimbusds.jwt.JWTClaimsSet;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthorizationInterceptor implements ChannelInterceptor {
    
    private final JwtService jwtService;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor == null) {
            return message;
        }
        
        StompCommand command = accessor.getCommand();
        
        // Only handle SEND and SUBSCRIBE commands, skip CONNECT
        if (StompCommand.CONNECT.equals(command)) {
            log.debug("🔄 CONNECT command detected - skipping authorization (handled by authentication interceptor)");
            return message;
        }
        
        if (StompCommand.SEND.equals(command)) {
            handleSendCommand(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            handleSubscribeCommand(accessor);
        }
        
        return message;
    }
    
    private void handleSendCommand(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        List<String> userRoles = getUserRoles(accessor);
        
        log.info("🔒 Processing SEND command authorization");
        log.info("📍 Destination: {}", destination);
        log.info("👥 User roles: {}", userRoles);
        
        // Check if user has ADMIN role
        boolean isAdmin = userRoles.stream().anyMatch("ADMIN"::equalsIgnoreCase);
        
        // Broadcast messages - Only ADMIN can send
        if ("/app/broadcast".equals(destination)) {
            log.info("📢 Broadcast permission check - Is Admin: {}", isAdmin);
            if (!isAdmin) {
                log.error("❌ SEND ACCESS DENIED - Only ADMIN can send broadcast messages");
                throw new AccessDeniedException("Access denied: Only ADMIN can send broadcast messages");
            }
            log.info("✅ SEND ACCESS GRANTED - ADMIN authorized to broadcast");
            return;
        }
        
        // Private messages - Only ADMIN can send
        if (destination != null && destination.startsWith("/app/private/")) {
            log.info("📧 Private message permission check - Is Admin: {}", isAdmin);
            if (!isAdmin) {
                log.error("❌ SEND ACCESS DENIED - Only ADMIN can send private messages (roles: {})", userRoles);
                throw new AccessDeniedException("Access denied: Only ADMIN can send private messages");
            }
            log.info("✅ SEND ACCESS GRANTED - ADMIN authorized to send private message");
            return;
        }
        
        // Unknown destinations
        log.warn("⚠️ Unknown destination: {} - Access denied", destination);
        throw new AccessDeniedException("Access denied to unknown destination: " + destination);
    }
    
    private void handleSubscribeCommand(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        List<String> userRoles = getUserRoles(accessor);
        
        log.info("🔒 Processing SUBSCRIBE command authorization");
        log.info("📍 Destination: {}", destination);
        log.info("👥 User roles: {}", userRoles);
        
        // Check user roles
        boolean isAdmin = userRoles.stream().anyMatch("ADMIN"::equalsIgnoreCase);

        log.info("👤 Role check - Is Admin: {}", isAdmin);
        
        // Public topic subscriptions - All authenticated users can subscribe
        if ("/topic/notifications".equals(destination)) {
            log.info("✅ SUBSCRIBE ACCESS GRANTED - Public notifications topic accessible to all");
            return;
        }
        
        // Private message queue - All authenticated users can subscribe to their own queue
        if (destination != null && (destination.startsWith("/user/queue/private") || destination.contains("/queue/private"))) {
            log.info("✅ SUBSCRIBE ACCESS GRANTED - User authorized to subscribe to their own private queue");
            return;
        }

        // Login confirmed queue - ADMIN only (only ADMIN has login email confirmation feature)
        if (destination != null && (destination.startsWith("/user/queue/login-confirmed") || destination.contains("/queue/login-confirmed"))) {
            log.info("🔐 Login confirmation queue subscription check - Is Admin: {}", isAdmin);
            if (!isAdmin) {
                log.error("❌ SUBSCRIBE ACCESS DENIED - Only ADMIN can subscribe to login confirmation queue (roles: {})", userRoles);
                throw new AccessDeniedException("Access denied: Only ADMIN can subscribe to login confirmation queue");
            }
            log.info("✅ SUBSCRIBE ACCESS GRANTED - ADMIN authorized to subscribe to login confirmation queue");
            return;
        }
        
        // Dealer registration topic - ADMIN only (optional feature)
        if ("/topic/dealer-registrations".equals(destination)) {
            log.info("🏪 Dealer registrations subscription check - Is Admin: {}", isAdmin);
            if (!isAdmin) {
                log.error("❌ SUBSCRIBE ACCESS DENIED - Only ADMIN can subscribe to dealer registrations (roles: {})", userRoles);
                throw new AccessDeniedException("Access denied: Only ADMIN can subscribe to dealer registrations");
            }
            log.info("✅ SUBSCRIBE ACCESS GRANTED - ADMIN authorized to subscribe to dealer registrations");
            return;
        }

        // Order notifications topic - ADMIN only
        if ("/topic/order-notifications".equals(destination)) {
            log.info("📦 Order notifications subscription check - Is Admin: {}", isAdmin);
            if (!isAdmin) {
                log.error("❌ SUBSCRIBE ACCESS DENIED - Only ADMIN can subscribe to order notifications (roles: {})", userRoles);
                throw new AccessDeniedException("Access denied: Only ADMIN can subscribe to order notifications");
            }
            log.info("✅ SUBSCRIBE ACCESS GRANTED - ADMIN authorized to subscribe to order notifications");
            return;
        }

        // Unknown destinations
        log.warn("⚠️ Unknown subscription destination: {} - Access denied", destination);
        throw new AccessDeniedException("Access denied to unknown subscription destination: " + destination);
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
        
        return null;
    }
    
    private List<String> getUserRoles(StompHeaderAccessor accessor) {
        try {
            // Extract and validate JWT token for role extraction
            String token = extractTokenFromHeaders(accessor);

            if (token == null || token.isEmpty()) {
                log.warn("⚠️ No JWT token found in headers for role extraction - using empty roles");
                return List.of();
            }

            // Validate JWT token and extract fresh roles
            JWTClaimsSet claimsSet = jwtService.validateToken(token);
            List<String> roles = jwtService.extractRoles(claimsSet);

            if (roles != null && !roles.isEmpty()) {
                log.debug("✅ Extracted roles from JWT token: {}", roles);
                return roles;
            }

            // No roles found
            log.warn("⚠️ No roles found in JWT token");
            return List.of();

        } catch (Exception e) {
            log.error("❌ Error during role extraction (non-fatal): {}", e.getMessage());
            // Return empty roles instead of throwing - let specific authorization logic handle it
            return List.of();
        }
    }
}