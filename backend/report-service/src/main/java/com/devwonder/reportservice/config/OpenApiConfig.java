package com.devwonder.reportservice.config;

import com.devwonder.common.config.BaseOpenApiConfig;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig extends BaseOpenApiConfig {

    @Override
    protected String getServiceDescription() {
        return "Reporting and analytics service for NexHub platform";
    }
}
