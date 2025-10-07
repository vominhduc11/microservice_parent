package com.devwonder.notificationservice.listener;

import com.devwonder.common.event.OrderNotificationEvent;
import com.devwonder.notificationservice.constant.KafkaTopics;
import com.devwonder.notificationservice.entity.Notification;
import com.devwonder.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationListener {

    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(
        topics = KafkaTopics.ORDER_NOTIFICATIONS,
        groupId = "notification-service-group-order",
        containerFactory = "orderNotificationKafkaListenerContainerFactory"
    )
    public void consumeOrderNotification(OrderNotificationEvent event) {
        try {
            log.info("Received order notification event for orderId: {} and dealerId: {}",
                event.getOrderId(), event.getDealerId());

            // Save notification to database
            Notification notification = notificationService.createOrderNotification(event);

            // Send saved notification via WebSocket (ADMIN only subscription)
            messagingTemplate.convertAndSend("/topic/order-notifications", notification);

            log.info("Successfully processed order notification for orderId: {} with notificationId: {}",
                event.getOrderId(), notification.getId());
        } catch (Exception e) {
            log.error("Error processing order notification for orderId: {}",
                event.getOrderId(), e);
        }
    }
}