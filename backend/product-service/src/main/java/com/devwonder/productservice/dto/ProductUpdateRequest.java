package com.devwonder.productservice.dto;

import com.devwonder.productservice.entity.Product;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {
    
    private String sku;
    
    private String name;

    private String shortDescription;

    private String image;

    private String descriptions;

    private String videos;

    private String specifications;

    @Min(value = 1, message = "Price must be greater than 0")
    private Long price;

    private String wholesalePrice;
    
    
    private Boolean showOnHomepage;
    
    private Boolean isFeatured;
}