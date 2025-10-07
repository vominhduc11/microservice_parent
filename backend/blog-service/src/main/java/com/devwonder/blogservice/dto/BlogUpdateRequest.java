package com.devwonder.blogservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogUpdateRequest {
    
    private String title;
    
    private String description;
    
    private String image;
    
    private String introduction;
    
    private Long categoryId;
    
    private Boolean showOnHomepage;
}