package com.devwonder.orderservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DealerResponse {
    private Long accountId;
    private String companyName;
    private String address;
    private String phone;
    private String email;
    private String district;
    private String city;
}