package com.devwonder.blogservice.repository;

import com.devwonder.blogservice.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    
    List<Blog> findByShowOnHomepageTrueAndIsDeletedFalse();

    List<Blog> findByIsDeletedFalse();

    List<Blog> findByIsDeletedTrue();

    List<Blog> findByIsDeletedFalseAndIdNot(Long id);

    List<Blog> findByCategoryBlogIdAndIsDeletedFalse(Long categoryId);

    @Query("SELECT b FROM Blog b WHERE b.isDeleted = false AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Blog> searchBlogs(@Param("query") String query);

}