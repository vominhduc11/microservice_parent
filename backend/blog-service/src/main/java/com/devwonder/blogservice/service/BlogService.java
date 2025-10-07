package com.devwonder.blogservice.service;

import com.devwonder.blogservice.dto.BlogCreateRequest;
import com.devwonder.blogservice.dto.BlogResponse;
import com.devwonder.blogservice.dto.BlogUpdateRequest;
import com.devwonder.blogservice.entity.Blog;
import com.devwonder.blogservice.entity.CategoryBlog;
import com.devwonder.blogservice.mapper.BlogMapper;
import com.devwonder.blogservice.repository.BlogRepository;
import com.devwonder.blogservice.repository.CategoryBlogRepository;
import com.devwonder.blogservice.util.FieldFilterUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogService {
    
    private final BlogRepository blogRepository;
    private final CategoryBlogRepository categoryBlogRepository;
    private final BlogMapper blogMapper;
    private final FieldFilterUtil fieldFilterUtil;
    
    public List<BlogResponse> getAllBlogs(String fields) {
        log.info("Fetching all blogs with fields: {}", fields);

        List<Blog> blogs = blogRepository.findByIsDeletedFalse();

        return blogs.stream()
                .map(blog -> fieldFilterUtil.applyFieldFiltering(blogMapper.toBlogResponse(blog), fields))
                .toList();
    }

    public List<BlogResponse> getHomepageBlogs(String fields, int limit) {
        log.info("Fetching homepage blogs with fields: {}, limit: {}", fields, limit);

        List<Blog> blogs = blogRepository.findByShowOnHomepageTrueAndIsDeletedFalse();

        return blogs.stream()
                .limit(limit)
                .map(blog -> fieldFilterUtil.applyFieldFiltering(blogMapper.toBlogResponse(blog), fields))
                .toList();
    }

    public List<BlogResponse> getRelatedBlogs(Long blogId, int limit, String fields) {
        log.info("Fetching related blogs for blog ID: {} with limit: {}, fields: {}", blogId, limit, fields);

        // First check if the blog exists
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found with ID: " + blogId));

        // Get related blogs (excluding the current blog and deleted blogs)
        List<Blog> relatedBlogs = blogRepository.findByIsDeletedFalseAndIdNot(blogId);

        return relatedBlogs.stream()
                .limit(limit)
                .map(b -> fieldFilterUtil.applyFieldFiltering(blogMapper.toBlogResponse(b), fields))
                .toList();
    }

    public BlogResponse getBlogById(Long id) {
        log.info("Fetching blog details for ID: {}", id);
        
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with ID: " + id));
        
        return blogMapper.toBlogResponse(blog);
    }
    
    @Transactional
    public BlogResponse createBlog(BlogCreateRequest request) {
        log.info("Creating new blog with title: {}", request.getTitle());
        
        // Find category by ID
        CategoryBlog categoryBlog = categoryBlogRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));
        
        Blog blog = Blog.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .image(request.getImage())
                .introduction(request.getIntroduction())
                .showOnHomepage(request.getShowOnHomepage())
                .isDeleted(false)
                .categoryBlog(categoryBlog)
                .build();
        
        Blog savedBlog = blogRepository.save(blog);
        log.info("Successfully created blog with ID: {} and title: {}", savedBlog.getId(), savedBlog.getTitle());
        
        return blogMapper.toBlogResponse(savedBlog);
    }
    
    @Transactional
    public BlogResponse updateBlog(Long id, BlogUpdateRequest request) {
        log.info("Updating blog with ID: {}", id);
        
        Blog existingBlog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with ID: " + id));
        
        // Update only non-null fields (PATCH behavior)
        if (request.getTitle() != null) {
            existingBlog.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            existingBlog.setDescription(request.getDescription());
        }
        if (request.getImage() != null) {
            existingBlog.setImage(request.getImage());
        }
        if (request.getIntroduction() != null) {
            existingBlog.setIntroduction(request.getIntroduction());
        }
        if (request.getShowOnHomepage() != null) {
            existingBlog.setShowOnHomepage(request.getShowOnHomepage());
        }
        
        // Update category if provided
        if (request.getCategoryId() != null) {
            CategoryBlog categoryBlog = categoryBlogRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));
            existingBlog.setCategoryBlog(categoryBlog);
        }
        
        Blog updatedBlog = blogRepository.save(existingBlog);
        log.info("Successfully updated blog with ID: {} and title: {}", updatedBlog.getId(), updatedBlog.getTitle());
        
        return blogMapper.toBlogResponse(updatedBlog);
    }

    @Transactional
    public void deleteBlog(Long id) {
        log.info("Soft deleting blog with ID: {}", id);

        Blog existingBlog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with ID: " + id));

        existingBlog.setIsDeleted(true);
        blogRepository.save(existingBlog);
        log.info("Successfully soft deleted blog with ID: {} and title: {}", existingBlog.getId(), existingBlog.getTitle());
    }

    @Transactional
    public void hardDeleteBlog(Long id) {
        log.info("Hard deleting blog with ID: {}", id);

        Blog existingBlog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with ID: " + id));

        blogRepository.delete(existingBlog);
        log.info("Successfully hard deleted blog with ID: {} and title: {}", existingBlog.getId(), existingBlog.getTitle());
    }

    @Transactional
    public BlogResponse restoreBlog(Long id) {
        log.info("Restoring blog with ID: {}", id);

        Blog existingBlog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with ID: " + id));

        if (!existingBlog.getIsDeleted()) {
            throw new RuntimeException("Blog with ID: " + id + " is not deleted");
        }

        existingBlog.setIsDeleted(false);
        Blog restoredBlog = blogRepository.save(existingBlog);
        log.info("Successfully restored blog with ID: {} and title: {}", restoredBlog.getId(), restoredBlog.getTitle());

        return blogMapper.toBlogResponse(restoredBlog);
    }

    public List<BlogResponse> getDeletedBlogs() {
        log.info("Fetching all deleted blogs");

        List<Blog> blogs = blogRepository.findByIsDeletedTrue();

        return blogs.stream()
                .map(blogMapper::toBlogResponse)
                .toList();
    }

    public List<BlogResponse> getBlogsByCategory(Long categoryId, String fields) {
        log.info("Fetching blogs by category ID: {} with fields: {}", categoryId, fields);

        // Validate category exists
        categoryBlogRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));

        List<Blog> blogs = blogRepository.findByCategoryBlogIdAndIsDeletedFalse(categoryId);

        log.info("Found {} blogs for category ID: {}", blogs.size(), categoryId);

        return blogs.stream()
                .map(blog -> fieldFilterUtil.applyFieldFiltering(blogMapper.toBlogResponse(blog), fields))
                .toList();
    }

    public List<BlogResponse> searchBlogs(String query, int limit, String fields) {
        log.info("Searching blogs with query: '{}', limit: {}, fields: {}", query, limit, fields);

        if (query == null || query.trim().isEmpty()) {
            log.warn("Search query is empty, returning empty list");
            return List.of();
        }

        List<Blog> blogs = blogRepository.searchBlogs(query.trim());
        log.info("Found {} blogs matching query: '{}'", blogs.size(), query);

        return blogs.stream()
                .limit(limit)
                .map(blog -> fieldFilterUtil.applyFieldFiltering(blogMapper.toBlogResponse(blog), fields))
                .toList();
    }
}