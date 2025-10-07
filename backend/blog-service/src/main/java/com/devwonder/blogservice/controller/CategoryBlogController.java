package com.devwonder.blogservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.blogservice.dto.CategoryBlogCreateRequest;
import com.devwonder.blogservice.dto.CategoryBlogResponse;
import com.devwonder.blogservice.service.CategoryBlogService;
import com.devwonder.blogservice.service.BlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/blog/categories")
@Tag(name = "Blog Categories", description = "📁 Blog category organization & management")
@RequiredArgsConstructor
@Slf4j
public class CategoryBlogController {

    private final CategoryBlogService categoryBlogService;
    private final BlogService blogService;

    @GetMapping
    @Operation(
        summary = "Get All Category Blogs",
        description = "Retrieve all category blogs. Public access - no authentication required.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category blogs retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<CategoryBlogResponse>>> getAllCategoryBlogs() {

        log.info("Requesting all category blogs");

        List<CategoryBlogResponse> categoryBlogs = categoryBlogService.getAllCategoryBlogs();

        log.info("Retrieved {} category blogs", categoryBlogs.size());

        return ResponseEntity.ok(BaseResponse.success("Category blogs retrieved successfully", categoryBlogs));
    }

    @PostMapping
    @Operation(
        summary = "Create New Category Blog",
        description = "Create a new category blog. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Category blog created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid category blog data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<CategoryBlogResponse>> createCategoryBlog(@Valid @RequestBody CategoryBlogCreateRequest request) {

        log.info("Creating new category blog with name: {} by ADMIN user", request.getName());

        CategoryBlogResponse categoryBlog = categoryBlogService.createCategoryBlog(request);

        log.info("Successfully created category blog with ID: {} and name: {}", categoryBlog.getId(), categoryBlog.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success("Category blog created successfully", categoryBlog));
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete Category Blog",
        description = "Delete a category blog by ID. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category blog deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Category blog not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> deleteCategoryBlog(@PathVariable Long id) {

        log.info("Deleting category blog with ID: {} by ADMIN user", id);

        categoryBlogService.deleteCategoryBlog(id);

        log.info("Successfully deleted category blog with ID: {}", id);

        return ResponseEntity.ok(BaseResponse.success("Category blog deleted successfully", null));
    }

    @GetMapping("/{categoryId}/blogs")
    @Operation(
        summary = "Get Blogs by Category ID",
        description = "Retrieve all blogs for a specific category. Public access - no authentication required.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blogs retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Category not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<com.devwonder.blogservice.dto.BlogResponse>>> getBlogsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) String fields) {

        log.info("Requesting blogs for category ID: {} with fields: {}", categoryId, fields);

        List<com.devwonder.blogservice.dto.BlogResponse> blogs = blogService.getBlogsByCategory(categoryId, fields);

        log.info("Retrieved {} blogs for category ID: {}", blogs.size(), categoryId);

        return ResponseEntity.ok(BaseResponse.success("Blogs retrieved successfully", blogs));
    }
}