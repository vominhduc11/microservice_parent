package com.devwonder.blogservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.blogservice.dto.BlogCreateRequest;
import com.devwonder.blogservice.dto.BlogResponse;
import com.devwonder.blogservice.dto.BlogUpdateRequest;
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
@RequestMapping("/blog")
@Tag(name = "Blogs", description = "📝 Blog content management - Public reading & Admin operations")
@RequiredArgsConstructor
@Slf4j
public class BlogController {
    
    private final BlogService blogService;

    @GetMapping("/blogs")
    @Operation(
        summary = "Get All Blogs",
        description = "Retrieve all blogs. Public access - no authentication required.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All blogs retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<BlogResponse>>> getAllBlogs(
            @RequestParam(required = false) String fields) {

        log.info("Requesting all blogs - fields: {}", fields);

        List<BlogResponse> blogs = blogService.getAllBlogs(fields);

        log.info("Retrieved {} blogs", blogs.size());

        return ResponseEntity.ok(BaseResponse.success("All blogs retrieved successfully", blogs));
    }

    @GetMapping("/blogs/deleted")
    @Operation(
        summary = "Get All Deleted Blogs",
        description = "Retrieve all soft deleted blogs. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Deleted blogs retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<BlogResponse>>> getDeletedBlogs() {

        log.info("Requesting all deleted blogs by ADMIN user");

        List<BlogResponse> blogs = blogService.getDeletedBlogs();

        log.info("Retrieved {} deleted blogs", blogs.size());

        return ResponseEntity.ok(BaseResponse.success("Deleted blogs retrieved successfully", blogs));
    }

    @GetMapping("/blogs/homepage")
    @Operation(
        summary = "Get Homepage Blogs",
        description = "Retrieve blogs to display on homepage with show_on_homepage=true. Default limit is 6 but can be customized via limit parameter. Public access - no authentication required.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blogs retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<BlogResponse>>> getHomepageBlogs(
            @RequestParam(defaultValue = "6") int limit,
            @RequestParam(required = false) String fields) {
        
        log.info("Requesting homepage blogs - limit: {}, fields: {}", limit, fields);

        List<BlogResponse> blogs = blogService.getHomepageBlogs(fields, limit);
        
        log.info("Retrieved {} homepage blogs", blogs.size());
        
        return ResponseEntity.ok(BaseResponse.success("Blogs retrieved successfully", blogs));
    }

    @GetMapping("/blogs/related/{blogId}")
    @Operation(
        summary = "Get Related Blogs",
        description = "Retrieve related blogs for a specific blog. Public access - no authentication required.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Related blogs retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Blog not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<BlogResponse>>> getRelatedBlogs(
            @PathVariable Long blogId,
            @RequestParam(defaultValue = "4") int limit,
            @RequestParam(required = false) String fields) {

        log.info("Requesting related blogs for blog ID: {} with limit: {}, fields: {}", blogId, limit, fields);

        List<BlogResponse> blogs = blogService.getRelatedBlogs(blogId, limit, fields);

        log.info("Retrieved {} related blogs for blog ID: {}", blogs.size(), blogId);

        return ResponseEntity.ok(BaseResponse.success("Related blogs retrieved successfully", blogs));
    }

    @GetMapping("/blogs/search")
    @Operation(
        summary = "Search Blogs",
        description = "Search blogs by keyword in title, content, or description. Public access - no authentication required.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blogs search completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<BlogResponse>>> searchBlogs(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String fields) {

        log.info("Searching blogs with query: '{}', limit: {}, fields: {}", q, limit, fields);

        List<BlogResponse> blogs = blogService.searchBlogs(q, limit, fields);

        log.info("Found {} blogs matching query: '{}'", blogs.size(), q);

        return ResponseEntity.ok(BaseResponse.success("Blogs search completed successfully", blogs));
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get Blog Details",
        description = "Retrieve detailed information about a specific blog by ID. Public access - no authentication required.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blog details retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Blog not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<BlogResponse>> getBlogById(@PathVariable Long id) {
        
        log.info("Requesting blog details for ID: {}", id);
        
        BlogResponse blog = blogService.getBlogById(id);
        
        log.info("Retrieved blog details for ID: {}", id);
        
        return ResponseEntity.ok(BaseResponse.success("Blog details retrieved successfully", blog));
    }
    
    @PostMapping("/blogs")
    @Operation(
        summary = "Create New Blog",
        description = "Create a new blog post. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Blog created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid blog data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Category not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<BlogResponse>> createBlog(@Valid @RequestBody BlogCreateRequest request) {
        
        log.info("Creating new blog with title: {} by ADMIN user", request.getTitle());
        
        BlogResponse blog = blogService.createBlog(request);
        
        log.info("Successfully created blog with ID: {} and title: {}", blog.getId(), blog.getTitle());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success("Blog created successfully", blog));
    }
    
    @PatchMapping("/{id}")
    @Operation(
        summary = "Update Blog",
        description = "Update an existing blog by ID. Only provided fields will be updated (PATCH behavior). Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blog updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid blog data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Blog or Category not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<BlogResponse>> updateBlog(
            @PathVariable Long id, 
            @Valid @RequestBody BlogUpdateRequest request) {
        
        log.info("Updating blog with ID: {} by ADMIN user", id);
        
        BlogResponse blog = blogService.updateBlog(id, request);
        
        log.info("Successfully updated blog with ID: {} and title: {}", blog.getId(), blog.getTitle());
        
        return ResponseEntity.ok(BaseResponse.success("Blog updated successfully", blog));
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Soft Delete Blog",
        description = "Soft delete a blog by ID (sets isDeleted=true). Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blog soft deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Blog not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> deleteBlog(@PathVariable Long id) {

        log.info("Soft deleting blog with ID: {} by ADMIN user", id);

        blogService.deleteBlog(id);

        log.info("Successfully soft deleted blog with ID: {}", id);

        return ResponseEntity.ok(BaseResponse.success("Blog soft deleted successfully", null));
    }

    @DeleteMapping("/{id}/hard")
    @Operation(
        summary = "Hard Delete Blog",
        description = "Permanently delete a blog by ID from database. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blog permanently deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Blog not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<Void>> hardDeleteBlog(@PathVariable Long id) {

        log.info("Hard deleting blog with ID: {} by ADMIN user", id);

        blogService.hardDeleteBlog(id);

        log.info("Successfully hard deleted blog with ID: {}", id);

        return ResponseEntity.ok(BaseResponse.success("Blog permanently deleted successfully", null));
    }

    @PatchMapping("/{id}/restore")
    @Operation(
        summary = "Restore Deleted Blog",
        description = "Restore a soft deleted blog by ID (sets isDeleted=false). Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blog restored successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Blog not found"),
        @ApiResponse(responseCode = "400", description = "Blog is not deleted"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<BlogResponse>> restoreBlog(@PathVariable Long id) {

        log.info("Restoring blog with ID: {} by ADMIN user", id);

        BlogResponse blog = blogService.restoreBlog(id);

        log.info("Successfully restored blog with ID: {}", id);

        return ResponseEntity.ok(BaseResponse.success("Blog restored successfully", blog));
    }
}