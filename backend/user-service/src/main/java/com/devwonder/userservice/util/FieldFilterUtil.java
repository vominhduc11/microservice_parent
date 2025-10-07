package com.devwonder.userservice.util;

import com.devwonder.userservice.dto.DealerResponse;
import org.springframework.stereotype.Component;

@Component
public class FieldFilterUtil {

    public DealerResponse applyFieldFiltering(DealerResponse response, String fields) {
        if (fields == null || fields.trim().isEmpty()) {
            return response;
        }

        String[] fieldArray = fields.split(",");
        DealerResponse.DealerResponseBuilder builder = DealerResponse.builder();

        for (String field : fieldArray) {
            String trimmedField = field.trim();
            switch (trimmedField) {
                case "accountId" -> builder.accountId(response.getAccountId());
                case "companyName" -> builder.companyName(response.getCompanyName());
                case "address" -> builder.address(response.getAddress());
                case "phone" -> builder.phone(response.getPhone());
                case "email" -> builder.email(response.getEmail());
                case "district" -> builder.district(response.getDistrict());
                case "city" -> builder.city(response.getCity());
            }
        }

        return builder.build();
    }
}