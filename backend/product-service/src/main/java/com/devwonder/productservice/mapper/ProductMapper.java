package com.devwonder.productservice.mapper;

import com.devwonder.productservice.dto.ProductResponse;
import com.devwonder.productservice.entity.Product;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    
    ProductResponse toProductResponse(Product product);
}