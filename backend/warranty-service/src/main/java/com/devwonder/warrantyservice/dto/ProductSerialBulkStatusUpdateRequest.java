package com.devwonder.warrantyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSerialBulkStatusUpdateRequest {

    private List<String> serialNumbers;
    private String status;
}