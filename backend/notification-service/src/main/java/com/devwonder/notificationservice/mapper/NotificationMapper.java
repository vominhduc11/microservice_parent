package com.devwonder.notificationservice.mapper;

import com.devwonder.notificationservice.dto.NotificationResponse;
import com.devwonder.notificationservice.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NotificationMapper {

    /**
     * Convert Notification entity to NotificationResponse DTO
     */
    NotificationResponse toNotificationResponse(Notification notification);

    /**
     * Convert list of Notification entities to list of NotificationResponse DTOs
     */
    List<NotificationResponse> toNotificationResponseList(List<Notification> notifications);
}