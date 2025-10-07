package com.devwonder.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Account creation response")
public class AccountCreateResponse {
    
    @Schema(description = "Account ID", example = "1")
    private Long id;
    
    @Schema(description = "Username", example = "dealer001")
    private String username;
    
    @Schema(description = "Set of role names", example = "[\"DEALER\"]")
    private Set<String> roles;
}