package com.devwonder.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthAccountCreateRequest {
    
    private String username;
    private String password;
    private Set<String> roleNames;
}