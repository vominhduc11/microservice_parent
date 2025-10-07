package com.devwonder.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealerInfo {
    private Long accountId;
    private String companyName;
    private String email;
    private String phone;
    private String city;
}