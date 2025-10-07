package com.devwonder.productservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateRequest {
    
    @NotBlank(message = "SKU is required")
    private String sku;
    
    @NotBlank(message = "Product name is required")
    private String name;

    private String shortDescription;

    private String image;

    private String descriptions;

    private String videos;

    private String specifications;

    @NotNull(message = "Price is required")
    @Min(value = 1, message = "Price must be greater than 0")
    private Long price;

    @NotNull(message = "Wholesale price is required")
    private String wholesalePrice;
    
    
    private Boolean showOnHomepage = false;
    
    private Boolean isFeatured = false;
}