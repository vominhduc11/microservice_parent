package com.devwonder.notificationservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.notificationservice.dto.NotificationResponse;
import com.devwonder.notificationservice.entity.Notification;
import com.devwonder.notificationservice.mapper.NotificationMapper;
import com.devwonder.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notification")
@Tag(name = "Notifications", description = "Notification management endpoints")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationMapper notificationMapper;
    
    @GetMapping("/notifies")
    public ResponseEntity<BaseResponse<List<NotificationResponse>>> getAllNotifications() {

        log.info("Requesting all notifications");

        List<Notification> notifications = notificationService.getAllNotifications();
        List<NotificationResponse> response = notificationMapper.toNotificationResponseList(notifications);

        log.info("Retrieved {} notifications", notifications.size());

        return ResponseEntity.ok(BaseResponse.success("Notifications retrieved successfully", response));
    }
    
    @PatchMapping("/{id}/read")
    public ResponseEntity<BaseResponse<NotificationResponse>> markNotificationAsRead(@PathVariable Long id) {

        log.info("Marking notification {} as read", id);

        Notification updatedNotification = notificationService.markAsRead(id);
        NotificationResponse response = notificationMapper.toNotificationResponse(updatedNotification);

        log.info("Successfully marked notification {} as read", id);

        return ResponseEntity.ok(BaseResponse.success("Notification marked as read", response));
    }
}