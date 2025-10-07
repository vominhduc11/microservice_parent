package com.devwonder.notificationservice.service;

import com.devwonder.notificationservice.entity.Notification;
import com.devwonder.common.event.DealerRegistrationEvent;
import com.devwonder.common.event.OrderNotificationEvent;
import com.devwonder.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    public Notification createDealerRegistrationNotification(DealerRegistrationEvent event) {
        Notification notification = Notification.builder()
            .title("New Dealer Registration")
            .message(String.format("New dealer '%s' has been registered successfully", event.getCompanyName()))
            .type("DEALER_REGISTRATION")
            .read(false)
            .build();

        return notificationRepository.save(notification);
    }

    public Notification createOrderNotification(OrderNotificationEvent event) {
        String dealerInfo = buildDealerInfo(event);
        String message = String.format("New order %s created by %s. Total amount: $%.2f",
            event.getOrderCode(), dealerInfo, event.getTotalAmount());

        Notification notification = Notification.builder()
            .title("New Order Created")
            .message(message)
            .type("ORDER_CREATED")
            .read(false)
            .build();

        return notificationRepository.save(notification);
    }

    private String buildDealerInfo(OrderNotificationEvent event) {
        StringBuilder info = new StringBuilder();

        if (event.getDealerName() != null && !event.getDealerName().isEmpty() && !"Unknown".equals(event.getDealerName())) {
            info.append(event.getDealerName());
        } else {
            info.append("Dealer ID ").append(event.getDealerId());
        }

        if (event.getDealerCity() != null && !event.getDealerCity().isEmpty()) {
            info.append(" (").append(event.getDealerCity()).append(")");
        }

        if (event.getDealerEmail() != null && !event.getDealerEmail().isEmpty()) {
            info.append(" - ").append(event.getDealerEmail());
        }

        if (event.getDealerPhone() != null && !event.getDealerPhone().isEmpty()) {
            info.append(" - ").append(event.getDealerPhone());
        }

        return info.toString();
    }
    
    public List<Notification> getAllNotifications() {
        log.info("Fetching all notifications ordered by creation time");
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public Notification markAsRead(Long notificationId) {
        log.info("Marking notification {} as read", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        
        if (notification.getRead()) {
            log.warn("Notification {} is already marked as read", notificationId);
        } else {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
            log.info("Successfully marked notification {} as read", notificationId);
        }
        
        return notification;
    }
}