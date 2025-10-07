package com.devwonder.productservice.util;

import com.devwonder.productservice.dto.ProductResponse;
import org.springframework.stereotype.Component;

@Component
public class FieldFilterUtil {
    
    public ProductResponse applyFieldFiltering(ProductResponse response, String fields) {
        if (fields == null || fields.trim().isEmpty()) {
            return response;
        }
        
        String[] fieldArray = fields.split(",");
        ProductResponse.ProductResponseBuilder builder = ProductResponse.builder();
        
        for (String field : fieldArray) {
            String trimmedField = field.trim();
            switch (trimmedField) {
                case "id" -> builder.id(response.getId());
                case "name" -> builder.name(response.getName());
                case "sku" -> builder.sku(response.getSku());
                case "shortDescription" -> builder.shortDescription(response.getShortDescription());
                case "image" -> builder.image(response.getImage());
                case "descriptions" -> builder.descriptions(response.getDescriptions());
                case "price" -> builder.price(response.getPrice());
            }
        }
        
        return builder.build();
    }
}