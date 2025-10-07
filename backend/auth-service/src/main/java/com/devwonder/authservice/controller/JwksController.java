package com.devwonder.authservice.controller;

import com.devwonder.authservice.service.JwksService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth/.well-known")
@Tag(name = "JWKS", description = "JSON Web Key Set endpoints for JWT verification")
@RequiredArgsConstructor
public class JwksController {

    private final JwksService jwksService;

    @GetMapping(value = "/jwks.json", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
        summary = "Get JSON Web Key Set",
        description = "Returns the JSON Web Key Set (JWKS) containing public keys used for JWT verification. " +
                     "This endpoint is used by other services to verify JWT tokens issued by the auth service.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "JWKS retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getJwks() {
        Map<String, Object> jwks = jwksService.getJwks();
        return ResponseEntity.ok(jwks);
    }
}