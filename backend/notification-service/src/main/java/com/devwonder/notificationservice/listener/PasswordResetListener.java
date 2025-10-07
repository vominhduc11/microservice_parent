package com.devwonder.notificationservice.listener;

import com.devwonder.common.event.PasswordResetEvent;
import com.devwonder.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PasswordResetListener {

    private final EmailService emailService;

    @KafkaListener(
        topics = "password-reset-notifications",
        groupId = "notification-service-group-password-reset",
        containerFactory = "passwordResetKafkaListenerContainerFactory"
    )
    public void consumePasswordReset(PasswordResetEvent event) {
        try {
            log.info("Received password reset event for accountId: {} and username: {}",
                event.getAccountId(), event.getUsername());

            log.info("Processing password reset email for user: {}", event.getUsername());

            // Send password reset email
            emailService.sendPasswordResetEmail(event);

            log.info("Successfully processed password reset for accountId: {}",
                event.getAccountId());
        } catch (Exception e) {
            log.error("Error processing password reset for accountId: {}",
                event.getAccountId(), e);
        }
    }
}
