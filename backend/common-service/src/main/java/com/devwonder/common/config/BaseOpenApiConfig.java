package com.devwonder.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public abstract class BaseOpenApiConfig {
    
    public static final String JWT_SECURITY_NAME = "bearerAuth";
    public static final String GATEWAY_HEADER_NAME = "gatewayAuth";
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Value("${spring.application.name:nexhub-service}")
    private String serviceName;
    
    @Value("${openapi.gateway.url:http://localhost:8080/api}")
    private String gatewayUrl;
    
    protected abstract String getServiceDescription();
    
    protected String getServiceVersion() {
        return "1.0.0";
    }
    
    protected String getServiceTitle() {
        String[] words = serviceName.replace("-", " ").split(" ");
        StringBuilder title = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                title.append(Character.toUpperCase(word.charAt(0)))
                     .append(word.substring(1).toLowerCase())
                     .append(" ");
            }
        }
        return title.toString().trim() + " API";
    }
    
    protected Contact getContact() {
        return new Contact()
            .name("DevWonder Team")
            .email("support@devwonder.com")
            .url("https://devwonder.com");
    }
    
    protected License getLicense() {
        return new License()
            .name("MIT License")
            .url("https://opensource.org/licenses/MIT");
    }
    
    protected List<Server> getServers() {
        return List.of(
            new Server()
                .url(gatewayUrl)
                .description("Via API Gateway"),
            new Server()
                .url("http://localhost:" + serverPort)
                .description("Direct access (dev only)")
        );
    }
    
    protected Components getSecurityComponents() {
        return new Components()
            .addSecuritySchemes(JWT_SECURITY_NAME, new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT Bearer Token - Login via /api/auth/login to get token"))
            .addSecuritySchemes(GATEWAY_HEADER_NAME, new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.HEADER)
                .name("X-Gateway-Request")
                .description("Internal Gateway Header (automatically added by API Gateway)"));
    }
    
    protected List<SecurityRequirement> getSecurityRequirements() {
        // Return empty list - let individual endpoints define their security requirements
        // This provides better control and clearer documentation
        return List.of();
    }
    
    @Bean
    public OpenAPI customOpenAPI() {
        OpenAPI openAPI = new OpenAPI()
            .info(new Info()
                .title(getServiceTitle())
                .description(getServiceDescription())
                .version(getServiceVersion())
                .contact(getContact())
                .license(getLicense()))
            .servers(getServers())
            .components(getSecurityComponents());
            
        // Add security requirements
        getSecurityRequirements().forEach(openAPI::addSecurityItem);
        
        // Allow subclasses to customize
        return customizeOpenAPI(openAPI);
    }
    
    protected OpenAPI customizeOpenAPI(OpenAPI openAPI) {
        return openAPI;
    }

    // Convenience methods for controllers to use in @SecurityRequirement annotations
    public static String getBearerAuthName() {
        return JWT_SECURITY_NAME;
    }

    public static String getGatewayAuthName() {
        return GATEWAY_HEADER_NAME;
    }
}