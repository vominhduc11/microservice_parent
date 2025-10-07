package com.devwonder.productservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.productservice.dto.ProductCreateRequest;
import com.devwonder.productservice.dto.ProductResponse;
import com.devwonder.productservice.dto.ProductUpdateRequest;
import com.devwonder.productservice.dto.ProductInfo;
import com.devwonder.productservice.service.ProductService;
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
@RequestMapping("/product")
@Tag(name = "Products", description = "📦 Product catalog management - Public browsing & Admin operations")
@RequiredArgsConstructor
@Slf4j
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping("/products/homepage")
    @Operation(
        summary = "Get Homepage Products",
        description = "Retrieve products to display on homepage with show_on_homepage=true. Default limit is 4 but can be customized via limit parameter.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Products retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductResponse>>> getHomepageProducts(
            @RequestParam(defaultValue = "4") int limit,
            @RequestParam(required = false) String fields) {
        
        log.info("Requesting homepage products - limit: {}, fields: {}", limit, fields);

        List<ProductResponse> products = productService.getHomepageProducts(fields, limit);
        
        log.info("Retrieved {} homepage products", products.size());
        
        return ResponseEntity.ok(BaseResponse.success("Products retrieved successfully", products));
    }
    
    @GetMapping("/{id}")
    @Operation(
        summary = "Get Product Details",
        description = "Retrieve detailed information about a specific product by ID with optional field filtering",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product details retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductResponse>> getProductById(
            @PathVariable Long id,
            @RequestParam(required = false) String fields) {

        log.info("Requesting product details for ID: {} - fields: {}", id, fields);

        ProductResponse product = productService.getProductById(id, fields);

        log.info("Retrieved product details for ID: {}", id);

        return ResponseEntity.ok(BaseResponse.success("Product details retrieved successfully", product));
    }
    
    @GetMapping("/products/featured")
    @Operation(
        summary = "Get Featured Products",
        description = "Retrieve featured products with is_featured=true. Default limit is 1 but can be customized via limit parameter.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Featured products retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductResponse>>> getFeaturedProducts(
            @RequestParam(defaultValue = "1") int limit,
            @RequestParam(required = false) String fields) {
        
        log.info("Requesting featured products - limit: {}, fields: {}", limit, fields);

        List<ProductResponse> products = productService.getFeaturedProducts(fields, limit);
        
        log.info("Retrieved {} featured products", products.size());
        
        return ResponseEntity.ok(BaseResponse.success("Featured products retrieved successfully", products));
    }

    @GetMapping("/products/related/{productId}")
    @Operation(
        summary = "Get Related Products",
        description = "Retrieve related products for a specific product. Public access - no authentication required.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Related products retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductResponse>>> getRelatedProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "4") int limit,
            @RequestParam(required = false) String fields) {

        log.info("Requesting related products for product ID: {} with limit: {}, fields: {}", productId, limit, fields);

        List<ProductResponse> products = productService.getRelatedProducts(productId, limit, fields);

        log.info("Retrieved {} related products for product ID: {}", products.size(), productId);

        return ResponseEntity.ok(BaseResponse.success("Related products retrieved successfully", products));
    }

    @GetMapping("/products/search")
    @Operation(
        summary = "Search Products",
        description = "Search products by keyword in name, description, or SKU. Public access - no authentication required.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Products search completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductResponse>>> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String fields) {

        log.info("Searching products with query: '{}', limit: {}, fields: {}", q, limit, fields);

        List<ProductResponse> products = productService.searchProducts(q, limit, fields);

        log.info("Found {} products matching query: '{}'", products.size(), q);

        return ResponseEntity.ok(BaseResponse.success("Products search completed successfully", products));
    }

    @GetMapping("/products")
    @Operation(
        summary = "Get All Products",
        description = "Retrieve all active products in the catalog (not deleted). Requires ADMIN or DEALER role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Products retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN or DEALER role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) String fields) {

        log.info("Requesting all active products by ADMIN/DEALER user - fields: {}", fields);

        List<ProductResponse> products = productService.getAllProducts(fields);

        log.info("Retrieved {} active products", products.size());

        return ResponseEntity.ok(BaseResponse.success("Active products retrieved successfully", products));
    }

    @GetMapping("/products/deleted")
    @Operation(
        summary = "Get All Deleted Products",
        description = "Retrieve all soft deleted products in the catalog. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Deleted products retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<ProductResponse>>> getDeletedProducts() {

        log.info("Requesting all deleted products by ADMIN user");

        List<ProductResponse> products = productService.getDeletedProducts();

        log.info("Retrieved {} deleted products", products.size());

        return ResponseEntity.ok(BaseResponse.success("Deleted products retrieved successfully", products));
    }
    
    @PostMapping("/products")
    @Operation(
        summary = "Create New Product",
        description = "Create a new product in the catalog. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Product created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid product data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "409", description = "Conflict - Product SKU already exists"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        
        log.info("Creating new product with SKU: {} by ADMIN user", request.getSku());
        
        ProductResponse product = productService.createProduct(request);
        
        log.info("Successfully created product with ID: {} and SKU: {}", product.getId(), product.getSku());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success("Product created successfully", product));
    }
    
    @PatchMapping("/{id}")
    @Operation(
        summary = "Update Product",
        description = "Update an existing product by ID. Only provided fields will be updated (PATCH behavior). Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid product data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "409", description = "Conflict - Product SKU already exists"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductResponse>> updateProduct(
            @PathVariable Long id, 
            @Valid @RequestBody ProductUpdateRequest request) {
        
        log.info("Updating product with ID: {} by ADMIN user", id);
        
        ProductResponse product = productService.updateProduct(id, request);
        
        log.info("Successfully updated product with ID: {} and SKU: {}", product.getId(), product.getSku());
        
        return ResponseEntity.ok(BaseResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Soft Delete Product",
        description = "Soft delete an existing product by ID (sets isDeleted=true). Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product soft deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<String>> deleteProduct(@PathVariable Long id) {

        log.info("Soft deleting product with ID: {} by ADMIN user", id);

        productService.deleteProduct(id);

        log.info("Successfully soft deleted product with ID: {}", id);

        return ResponseEntity.ok(BaseResponse.success("Product soft deleted successfully", null));
    }

    @DeleteMapping("/{id}/hard")
    @Operation(
        summary = "Hard Delete Product",
        description = "Permanently delete an existing product by ID from database. Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product permanently deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<String>> hardDeleteProduct(@PathVariable Long id) {

        log.info("Hard deleting product with ID: {} by ADMIN user", id);

        productService.hardDeleteProduct(id);

        log.info("Successfully hard deleted product with ID: {}", id);

        return ResponseEntity.ok(BaseResponse.success("Product permanently deleted successfully", null));
    }

    @PatchMapping("/{id}/restore")
    @Operation(
        summary = "Restore Deleted Product",
        description = "Restore a soft deleted product by ID (sets isDeleted=false). Requires ADMIN role authentication via API Gateway.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product restored successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "400", description = "Product is not deleted"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductResponse>> restoreProduct(@PathVariable Long id) {

        log.info("Restoring product with ID: {} by ADMIN user", id);

        ProductResponse product = productService.restoreProduct(id);

        log.info("Successfully restored product with ID: {}", id);

        return ResponseEntity.ok(BaseResponse.success("Product restored successfully", product));
    }

    @GetMapping("/products/{productId}/name")
    @Operation(
        summary = "Get Product Name",
        description = "Get product name by ID for inter-service communication. Requires API key authentication.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product name retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid API key"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<String>> getProductName(
            @PathVariable Long productId,
            @RequestHeader("X-API-Key") String apiKey) {

        // Simple API key validation for inter-service communication
        if (!"INTER_SERVICE_KEY".equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(BaseResponse.error("Invalid API key"));
        }

        log.info("Getting product name for ID: {} via inter-service call", productId);

        try {
            String productName = productService.getProductName(productId);
            return ResponseEntity.ok(BaseResponse.success("Product name retrieved successfully", productName));
        } catch (Exception e) {
            log.error("Failed to get product name for ID: {}", productId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve product name"));
        }
    }

    @GetMapping("/products/{productId}/info")
    @Operation(
        summary = "Get Product Info",
        description = "Get product ID and name by ID for inter-service communication. Requires API key authentication.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product info retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid API key"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ProductInfo>> getProductInfo(
            @PathVariable Long productId,
            @RequestHeader("X-API-Key") String apiKey) {

        // Simple API key validation for inter-service communication
        if (!"INTER_SERVICE_KEY".equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(BaseResponse.error("Invalid API key"));
        }

        log.info("Getting product info for ID: {} via inter-service call", productId);

        try {
            ProductInfo productInfo = productService.getProductInfo(productId);
            return ResponseEntity.ok(BaseResponse.success("Product info retrieved successfully", productInfo));
        } catch (Exception e) {
            log.error("Failed to get product info for ID: {}", productId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BaseResponse.error("Failed to retrieve product info"));
        }
    }

}