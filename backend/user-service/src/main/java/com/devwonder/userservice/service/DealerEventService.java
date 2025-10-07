package com.devwonder.userservice.service;

import com.devwonder.userservice.entity.Dealer;
import com.devwonder.common.event.DealerEmailEvent;
import com.devwonder.common.event.DealerRegistrationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DealerEventService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishDealerEmailEvent(Dealer dealer, String username, String password) throws Exception {
        DealerEmailEvent emailEvent = DealerEmailEvent.builder()
                .accountId(dealer.getAccountId())
                .username(username)
                .password(password)
                .companyName(dealer.getCompanyName())
                .email(dealer.getEmail())
                .phone(dealer.getPhone())
                .address(dealer.getAddress())
                .city(dealer.getCity())
                .district(dealer.getDistrict())
                .registrationTime(LocalDateTime.now())
                .build();
        
        kafkaTemplate.send("email-notifications", dealer.getAccountId().toString(), emailEvent);
        log.info("Published dealer email event for accountId: {}", dealer.getAccountId());
    }
    
    public void publishDealerRegistrationEvent(Dealer dealer) throws Exception {
        DealerRegistrationEvent registrationEvent = DealerRegistrationEvent.builder()
                .accountId(dealer.getAccountId())
                .companyName(dealer.getCompanyName())
                .email(dealer.getEmail())
                .phone(dealer.getPhone())
                .city(dealer.getCity())
                .district(dealer.getDistrict())
                .registrationTime(LocalDateTime.now())
                .build();
        
        kafkaTemplate.send("dealer-registration-notifications", dealer.getAccountId().toString(), registrationEvent);
        log.info("Published dealer registration event for accountId: {}", dealer.getAccountId());
    }
}