package com.devwonder.notificationservice.listener;

import com.devwonder.common.event.LoginConfirmationNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoginConfirmedListener {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(
        topics = "login-confirmed-notifications",
        groupId = "notification-service-group-login-confirmed",
        containerFactory = "loginConfirmedKafkaListenerContainerFactory"
    )
    public void consumeLoginConfirmed(LoginConfirmationNotificationEvent event) {
        try {
            log.info("Received login confirmed event for accountId: {}, username: {}",
                event.getAccountId(), event.getUsername());

            // Send WebSocket notification to specific user (identified by username as Principal)
            String username = event.getUsername();
            String destination = "/queue/login-confirmed";
            messagingTemplate.convertAndSendToUser(username, destination, event);

            log.info("✅ WebSocket notification sent to user: {} at destination: /user/{}/{}",
                username, username, destination);

        } catch (Exception e) {
            log.error("Error sending WebSocket notification for username: {}, accountId: {}",
                event.getUsername(), event.getAccountId(), e);
        }
    }
}
