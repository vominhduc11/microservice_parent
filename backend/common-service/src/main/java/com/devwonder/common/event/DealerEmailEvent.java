package com.devwonder.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealerEmailEvent {
    private Long accountId;
    private String username;
    private String password;
    private String companyName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String district;
    private LocalDateTime registrationTime;
}