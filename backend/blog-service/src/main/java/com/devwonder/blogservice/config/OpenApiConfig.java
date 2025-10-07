package com.devwonder.blogservice.config;

import com.devwonder.common.config.BaseOpenApiConfig;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig extends BaseOpenApiConfig {

    @Override
    protected String getServiceDescription() {
        return "Blog and content management service for NexHub platform";
    }
}
