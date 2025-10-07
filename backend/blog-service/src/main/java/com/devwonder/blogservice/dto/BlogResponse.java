package com.devwonder.blogservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BlogResponse {
    private Long id;
    private String title;
    private String description;
    private String image;
    private String category;
    private LocalDateTime createdAt;
    private String introduction;
    private Boolean showOnHomepage;
    private LocalDateTime updateAt;
}