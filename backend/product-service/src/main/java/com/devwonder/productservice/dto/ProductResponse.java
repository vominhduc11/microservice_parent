package com.devwonder.productservice.dto;

import com.devwonder.productservice.entity.Product;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String shortDescription;
    private String image;
    private String descriptions;
    private String videos;
    private String specifications;
    private BigDecimal price;
    private String wholesalePrice;
    private Boolean showOnHomepage;
    private Boolean isFeatured;
    private Long stock;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;
}