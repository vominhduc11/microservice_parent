package com.devwonder.productservice.mapper;

import com.devwonder.productservice.dto.ProductSerialResponse;
import com.devwonder.productservice.entity.ProductSerial;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductSerialMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    ProductSerialResponse toProductSerialResponse(ProductSerial productSerial);
}