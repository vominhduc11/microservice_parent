package com.devwonder.authservice.service;

import com.devwonder.common.event.LoginConfirmationEvent;
import com.devwonder.common.event.PasswordResetEvent;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthEventService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final AuthJwtService jwtService;

    public void publishLoginConfirmationEvent(Long accountId, String username, String email,
                                              String userType, HttpServletRequest request) {
        // Generate JWT confirmation token (15 minutes expiry)
        String confirmationToken = jwtService.generateConfirmationToken(accountId, email);

        LoginConfirmationEvent event = LoginConfirmationEvent.builder()
                .accountId(accountId)
                .username(username)
                .email(email)
                .userType(userType)
                .loginTime(LocalDateTime.now())
                .ipAddress(extractIpAddress(request))
                .userAgent(extractUserAgent(request))
                .confirmationToken(confirmationToken)
                .build();

        kafkaTemplate.send("login-confirmation-notifications", accountId.toString(), event);
        log.info("Published login confirmation event for accountId: {} to email: {} with token", accountId, email);
    }

    private String extractIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }

    private String extractUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent : "Unknown";
    }

    public void publishLoginConfirmedNotification(com.devwonder.common.event.LoginConfirmationNotificationEvent event) {
        kafkaTemplate.send("login-confirmed-notifications", event.getAccountId().toString(), event);
        log.info("Published login confirmed notification for accountId: {}", event.getAccountId());
    }

    public void publishPasswordResetEvent(Long accountId, String username, String email, String resetToken) {
        PasswordResetEvent event = PasswordResetEvent.builder()
                .accountId(accountId)
                .username(username)
                .email(email)
                .resetToken(resetToken)
                .build();

        kafkaTemplate.send("password-reset-notifications", accountId.toString(), event);
        log.info("Published password reset event for accountId: {} to email: {}", accountId, email);
    }
}
