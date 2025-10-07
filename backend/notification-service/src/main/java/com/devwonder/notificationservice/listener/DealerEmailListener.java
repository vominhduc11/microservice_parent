package com.devwonder.notificationservice.listener;

import com.devwonder.common.event.DealerEmailEvent;
import com.devwonder.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DealerEmailListener {
    
    private final EmailService emailService;
    
    @KafkaListener(
        topics = "email-notifications",
        groupId = "notification-service-group-email",
        containerFactory = "emailNotificationKafkaListenerContainerFactory"
    )
    public void consumeEmailNotification(DealerEmailEvent event) {
        try {
            log.info("Received email notification event for accountId: {} and company: {}", 
                event.getAccountId(), event.getCompanyName());
            
            log.info("Processing email notification for dealer: {}", event.getCompanyName());
            
            // Send welcome email
            emailService.sendDealerWelcomeEmail(event);
            
            log.info("Successfully processed email notification for accountId: {}", 
                event.getAccountId());
        } catch (Exception e) {
            log.error("Error processing email notification for accountId: {}", 
                event.getAccountId(), e);
        }
    }
}