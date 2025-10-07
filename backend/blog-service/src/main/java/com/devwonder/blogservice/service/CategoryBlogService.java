package com.devwonder.blogservice.service;

import com.devwonder.blogservice.dto.CategoryBlogCreateRequest;
import com.devwonder.blogservice.dto.CategoryBlogResponse;
import com.devwonder.blogservice.entity.CategoryBlog;
import com.devwonder.blogservice.mapper.CategoryBlogMapper;
import com.devwonder.blogservice.repository.CategoryBlogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryBlogService {

    private final CategoryBlogRepository categoryBlogRepository;
    private final CategoryBlogMapper categoryBlogMapper;

    public List<CategoryBlogResponse> getAllCategoryBlogs() {
        log.info("Retrieving all category blogs");

        List<CategoryBlog> categoryBlogs = categoryBlogRepository.findAll();

        log.info("Found {} category blogs", categoryBlogs.size());

        return categoryBlogs.stream()
                .map(categoryBlogMapper::toCategoryBlogResponse)
                .collect(Collectors.toList());
    }

    public CategoryBlogResponse createCategoryBlog(CategoryBlogCreateRequest request) {
        log.info("Creating new category blog with name: {}", request.getName());

        CategoryBlog categoryBlog = CategoryBlog.builder()
                .name(request.getName())
                .build();

        CategoryBlog savedCategoryBlog = categoryBlogRepository.save(categoryBlog);

        log.info("Successfully created category blog with ID: {} and name: {}",
                savedCategoryBlog.getId(), savedCategoryBlog.getName());

        return categoryBlogMapper.toCategoryBlogResponse(savedCategoryBlog);
    }

    public void deleteCategoryBlog(Long id) {
        log.info("Deleting category blog with ID: {}", id);

        CategoryBlog categoryBlog = categoryBlogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category blog not found with id: " + id));

        categoryBlogRepository.delete(categoryBlog);

        log.info("Successfully deleted category blog with ID: {} and name: {}",
                categoryBlog.getId(), categoryBlog.getName());
    }
}