package com.devwonder.blogservice.mapper;

import com.devwonder.blogservice.dto.CategoryBlogResponse;
import com.devwonder.blogservice.entity.CategoryBlog;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryBlogMapper {

    CategoryBlogResponse toCategoryBlogResponse(CategoryBlog categoryBlog);
}