package com.devwonder.userservice.mapper;

import com.devwonder.userservice.dto.DealerRequest;
import com.devwonder.userservice.dto.DealerResponse;
import com.devwonder.userservice.entity.Dealer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DealerMapper {
    
    DealerResponse toResponse(Dealer dealer);
    
    @Mapping(target = "accountId", ignore = true)
    Dealer toEntity(DealerRequest dealerRequest);
}