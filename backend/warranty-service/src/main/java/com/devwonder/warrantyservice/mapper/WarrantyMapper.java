package com.devwonder.warrantyservice.mapper;

import com.devwonder.warrantyservice.dto.WarrantyResponse;
import com.devwonder.warrantyservice.entity.Warranty;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface WarrantyMapper {

    /**
     * Convert Warranty entity to WarrantyResponse DTO
     */
    WarrantyResponse toWarrantyResponse(Warranty warranty);

    /**
     * Convert list of Warranty entities to list of WarrantyResponse DTOs
     */
    List<WarrantyResponse> toWarrantyResponseList(List<Warranty> warranties);
}