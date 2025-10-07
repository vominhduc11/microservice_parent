package com.devwonder.orderservice.service;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.common.event.OrderNotificationEvent;
import com.devwonder.orderservice.client.UserServiceClient;
import com.devwonder.orderservice.constant.KafkaTopics;
import com.devwonder.orderservice.dto.DealerResponse;
import com.devwonder.orderservice.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserServiceClient userServiceClient;

    @Value("${auth.api.key:INTER_SERVICE_KEY}")
    private String authApiKey;

    public void publishOrderNotificationEvent(Order order, BigDecimal totalAmount) {
        try {
            // Get dealer information from user-service
            DealerResponse dealerInfo = getDealerInfo(order.getIdDealer());

            OrderNotificationEvent event = OrderNotificationEvent.builder()
                    .orderId(order.getId())
                    .orderCode(order.getOrderCode())
                    .dealerId(order.getIdDealer())
                    .dealerName(dealerInfo != null ? dealerInfo.getCompanyName() : "Unknown")
                    .dealerEmail(dealerInfo != null ? dealerInfo.getEmail() : "")
                    .dealerPhone(dealerInfo != null ? dealerInfo.getPhone() : "")
                    .dealerCity(dealerInfo != null ? dealerInfo.getCity() : "")
                    .totalAmount(totalAmount)
                    .paymentStatus(order.getPaymentStatus().toString())
                    .orderTime(order.getCreatedAt())
                    .build();

            kafkaTemplate.send(KafkaTopics.ORDER_NOTIFICATIONS, order.getId().toString(), event);
            log.info("Published order notification event for orderId: {} from dealer: {}",
                order.getId(), dealerInfo != null ? dealerInfo.getCompanyName() : "Unknown");
        } catch (Exception e) {
            log.error("Error publishing order notification event for orderId: {}", order.getId(), e);
        }
    }

    private DealerResponse getDealerInfo(Long dealerId) {
        try {
            BaseResponse<DealerResponse> response = userServiceClient.getDealerInfo(dealerId, authApiKey);
            if (response != null && response.isSuccess() && response.getData() != null) {
                return response.getData();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch dealer info for dealerId: {}, using fallback values", dealerId, e);
        }
        return null;
    }
}