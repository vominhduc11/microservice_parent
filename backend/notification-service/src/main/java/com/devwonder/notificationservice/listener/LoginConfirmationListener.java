package com.devwonder.notificationservice.listener;

import com.devwonder.common.event.LoginConfirmationEvent;
import com.devwonder.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoginConfirmationListener {

    private final EmailService emailService;

    @KafkaListener(
        topics = "login-confirmation-notifications",
        groupId = "notification-service-group-login",
        containerFactory = "loginConfirmationKafkaListenerContainerFactory"
    )
    public void consumeLoginConfirmation(LoginConfirmationEvent event) {
        try {
            log.info("Received login confirmation event for accountId: {} and username: {}",
                event.getAccountId(), event.getUsername());

            log.info("Processing login confirmation email for user: {}", event.getUsername());

            // Send login confirmation email
            emailService.sendLoginConfirmationEmail(event);

            log.info("Successfully processed login confirmation for accountId: {}",
                event.getAccountId());
        } catch (Exception e) {
            log.error("Error processing login confirmation for accountId: {}",
                event.getAccountId(), e);
        }
    }
}
