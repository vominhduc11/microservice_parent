package com.devwonder.blogservice.util;

import com.devwonder.blogservice.dto.BlogResponse;
import org.springframework.stereotype.Component;

@Component
public class FieldFilterUtil {

    public BlogResponse applyFieldFiltering(BlogResponse response, String fields) {
        if (fields == null || fields.trim().isEmpty()) {
            return response;
        }

        String[] fieldArray = fields.split(",");
        BlogResponse.BlogResponseBuilder builder = BlogResponse.builder();

        for (String field : fieldArray) {
            String trimmedField = field.trim();
            switch (trimmedField) {
                case "id" -> builder.id(response.getId());
                case "title" -> builder.title(response.getTitle());
                case "description" -> builder.description(response.getDescription());
                case "image" -> builder.image(response.getImage());
                case "category" -> builder.category(response.getCategory());
                case "createdAt" -> builder.createdAt(response.getCreatedAt());
                case "introduction" -> builder.introduction(response.getIntroduction());
                case "showOnHomepage" -> builder.showOnHomepage(response.getShowOnHomepage());
                case "updateAt" -> builder.updateAt(response.getUpdateAt());
            }
        }

        return builder.build();
    }
}