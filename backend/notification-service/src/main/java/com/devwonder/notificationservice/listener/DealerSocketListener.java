package com.devwonder.notificationservice.listener;

import com.devwonder.notificationservice.entity.Notification;
import com.devwonder.common.event.DealerRegistrationEvent;
import com.devwonder.notificationservice.service.NotificationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DealerSocketListener {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    
    @KafkaListener(
        topics = "dealer-registration-notifications",
        groupId = "notification-service-group-dealer-registration",
        containerFactory = "websocketNotificationKafkaListenerContainerFactory"
    )
    public void consumeWebSocketNotification(DealerRegistrationEvent event) throws Exception {
        
        log.info("Received websocket notification event for accountId: {} and company: {}", 
            event.getAccountId(), event.getCompanyName());
        
        // Save notification to database
        Notification notification = notificationService.createDealerRegistrationNotification(event);
        
        // Send saved notification via WebSocket (ADMIN only subscription)
        messagingTemplate.convertAndSend("/topic/dealer-registrations", notification);
        
        log.info("Successfully processed websocket notification for accountId: {} with notificationId: {}", 
            event.getAccountId(), notification.getId());
    }
}