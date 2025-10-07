package com.devwonder.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.expression.WebExpressionAuthorizationManager;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@EnableWebSecurity
public abstract class BaseSecurityConfig {

    public static final String GATEWAY_HEADER_EXPRESSION = "request.getHeader('X-Gateway-Request') == 'true'";
    
    @Value("${auth.api.key:INTER_SERVICE_KEY}")
    private String authApiKey;
    
    protected abstract void configureServiceEndpoints(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth);
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(AbstractHttpConfigurer::disable)
            .csrf(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                // Common endpoints for all services
                configureCommonEndpoints(auth);
                
                // Service-specific endpoints
                configureServiceEndpoints(auth);
                
                // Block all other direct access
                auth.anyRequest().denyAll();
            });

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow port 8080 for direct service access (if needed)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    protected void configureCommonEndpoints(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth
            // CORS preflight requests
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            
            // Actuator health check (always allow for Docker health checks)
            .requestMatchers("/actuator/health").permitAll()
            
            // Swagger docs (ONLY via API Gateway)
            .requestMatchers(
                "/swagger-ui.html",
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/webjars/**"
            ).access(gatewayHeaderRequired());
    }

    
    protected WebExpressionAuthorizationManager gatewayHeaderRequired() {
        return new WebExpressionAuthorizationManager(GATEWAY_HEADER_EXPRESSION);
    }
    
    protected WebExpressionAuthorizationManager authApiKeyRequired() {
        String expression = "request.getHeader('X-API-Key') == '" + authApiKey + "'";
        return new WebExpressionAuthorizationManager(expression);
    }

    protected WebExpressionAuthorizationManager authApiKeyOrGatewayRequired() {
        String expression = "request.getHeader('X-API-Key') == '" + authApiKey + "' or " + GATEWAY_HEADER_EXPRESSION;
        return new WebExpressionAuthorizationManager(expression);
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}