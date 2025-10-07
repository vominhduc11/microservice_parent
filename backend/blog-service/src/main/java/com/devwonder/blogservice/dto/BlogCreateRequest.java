package com.devwonder.blogservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogCreateRequest {
    
    @NotBlank(message = "Blog title is required")
    private String title;
    
    private String description;
    
    private String image;
    
    private String introduction;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private Boolean showOnHomepage = false;
}