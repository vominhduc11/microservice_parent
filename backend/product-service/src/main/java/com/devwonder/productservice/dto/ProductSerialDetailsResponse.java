package com.devwonder.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSerialDetailsResponse {

    private Long id;
    private String serialNumber;
    private String productName;
    private String productSku;
    private String status;
    private String image;
}