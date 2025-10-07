package com.devwonder.blogservice.repository;

import com.devwonder.blogservice.entity.CategoryBlog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryBlogRepository extends JpaRepository<CategoryBlog, Long> {
    
}