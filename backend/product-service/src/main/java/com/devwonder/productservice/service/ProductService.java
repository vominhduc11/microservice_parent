package com.devwonder.productservice.service;

import com.devwonder.common.exception.ResourceAlreadyExistsException;
import com.devwonder.common.exception.ResourceNotFoundException;
import com.devwonder.common.exception.ProductNotDeletedException;
import com.devwonder.common.util.RepositoryUtil;
import com.devwonder.common.util.LoggingUtil;
import com.devwonder.common.constants.ErrorMessages;
import com.devwonder.productservice.dto.ProductCreateRequest;
import com.devwonder.productservice.dto.ProductResponse;
import com.devwonder.productservice.dto.ProductUpdateRequest;
import com.devwonder.productservice.dto.ProductInfo;
import com.devwonder.productservice.entity.Product;
import com.devwonder.productservice.mapper.ProductMapper;
import com.devwonder.productservice.repository.ProductRepository;
import com.devwonder.productservice.util.FieldFilterUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final FieldFilterUtil fieldFilterUtil;
    
    public List<ProductResponse> getHomepageProducts(String fields, int limit) {
        LoggingUtil.logFetchWithFieldsAndLimit(log, "homepage products", fields, limit);
        
        List<Product> products = productRepository.findByShowOnHomepageTrueAndIsDeletedFalse();
        
        return products.stream()
                .limit(limit)
                .map(product -> fieldFilterUtil.applyFieldFiltering(productMapper.toProductResponse(product), fields))
                .toList();
    }
    
    public ProductResponse getProductById(Long id, String fields) {
        LoggingUtil.logFetchWithFields(log, "product", fields, id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        ProductResponse response = productMapper.toProductResponse(product);
        return fieldFilterUtil.applyFieldFiltering(response, fields);
    }

    public ProductResponse getProductById(Long id) {
        return getProductById(id, null);
    }
    
    public List<ProductResponse> getFeaturedProducts(String fields, int limit) {
        LoggingUtil.logFetchWithFieldsAndLimit(log, "featured products", fields, limit);
        
        List<Product> products = productRepository.findByIsFeaturedTrueAndIsDeletedFalse();
        
        return products.stream()
                .limit(limit)
                .map(product -> fieldFilterUtil.applyFieldFiltering(productMapper.toProductResponse(product), fields))
                .toList();
    }
    
    public List<ProductResponse> getAllProducts(String fields) {
        LoggingUtil.logFetchWithFields(log, "products", fields, "all active");

        List<Product> products = productRepository.findByIsDeletedFalse();

        return products.stream()
                .map(product -> fieldFilterUtil.applyFieldFiltering(productMapper.toProductResponse(product), fields))
                .toList();
    }

    public List<ProductResponse> getRelatedProducts(Long productId, int limit, String fields) {
        log.info("Fetching related products for product ID: {} with limit: {}, fields: {}", productId, limit, fields);

        // First check if the product exists
        Product product = findProductByIdOrThrow(productId);

        // Get related products (excluding the current product and deleted products)
        List<Product> relatedProducts = productRepository.findByIsDeletedFalseAndIdNot(productId);

        return relatedProducts.stream()
                .limit(limit)
                .map(p -> fieldFilterUtil.applyFieldFiltering(productMapper.toProductResponse(p), fields))
                .toList();
    }
    
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        log.info("Creating new product with SKU: {}", request.getSku());

        if (productRepository.existsBySkuAndIsDeletedFalse(request.getSku())) {
            throw new ResourceAlreadyExistsException(ErrorMessages.format(ErrorMessages.PRODUCT_SKU_EXISTS, request.getSku()));
        }

        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .shortDescription(request.getShortDescription())
                .image(request.getImage())
                .descriptions(request.getDescriptions())
                .videos(request.getVideos())
                .specifications(request.getSpecifications())
                .price(BigDecimal.valueOf(request.getPrice()))
                .wholesalePrice(request.getWholesalePrice())
                .showOnHomepage(request.getShowOnHomepage())
                .isFeatured(request.getIsFeatured())
                .isDeleted(false)
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Successfully created product with ID: {} and SKU: {}", savedProduct.getId(), savedProduct.getSku());

        return productMapper.toProductResponse(savedProduct);
    }
    
    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        log.info("Updating product with ID: {}", id);

        Product existingProduct = findProductByIdOrThrow(id);
        validateAndUpdateSku(request, existingProduct);
        updateProductFields(request, existingProduct);

        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Successfully updated product with ID: {} and SKU: {}", updatedProduct.getId(), updatedProduct.getSku());

        return productMapper.toProductResponse(updatedProduct);
    }

    private Product findProductByIdOrThrow(Long id) {
        return RepositoryUtil.findByIdOrThrow(productRepository, id, "Product");
    }

    private void validateAndUpdateSku(ProductUpdateRequest request, Product existingProduct) {
        if (request.getSku() != null && !request.getSku().equals(existingProduct.getSku())) {
            if (productRepository.existsBySkuAndIsDeletedFalse(request.getSku())) {
                throw new ResourceAlreadyExistsException(ErrorMessages.format(ErrorMessages.PRODUCT_SKU_EXISTS, request.getSku()));
            }
            existingProduct.setSku(request.getSku());
        }
    }

    private void updateProductFields(ProductUpdateRequest request, Product existingProduct) {
        updateBasicFields(request, existingProduct);
        updateContentFields(request, existingProduct);
        updatePricingFields(request, existingProduct);
        updateDisplayFields(request, existingProduct);
    }

    private void updateBasicFields(ProductUpdateRequest request, Product existingProduct) {
        if (request.getName() != null) {
            existingProduct.setName(request.getName());
        }
        if (request.getShortDescription() != null) {
            existingProduct.setShortDescription(request.getShortDescription());
        }
        if (request.getImage() != null) {
            existingProduct.setImage(request.getImage());
        }
    }

    private void updateContentFields(ProductUpdateRequest request, Product existingProduct) {
        if (request.getDescriptions() != null) {
            existingProduct.setDescriptions(request.getDescriptions());
        }
        if (request.getVideos() != null) {
            existingProduct.setVideos(request.getVideos());
        }
        if (request.getSpecifications() != null) {
            existingProduct.setSpecifications(request.getSpecifications());
        }
    }

    private void updatePricingFields(ProductUpdateRequest request, Product existingProduct) {
        if (request.getPrice() != null) {
            existingProduct.setPrice(BigDecimal.valueOf(request.getPrice()));
        }
        if (request.getWholesalePrice() != null) {
            existingProduct.setWholesalePrice(request.getWholesalePrice());
        }
    }

    private void updateDisplayFields(ProductUpdateRequest request, Product existingProduct) {
        if (request.getShowOnHomepage() != null) {
            existingProduct.setShowOnHomepage(request.getShowOnHomepage());
        }
        if (request.getIsFeatured() != null) {
            existingProduct.setIsFeatured(request.getIsFeatured());
        }
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("Soft deleting product with ID: {}", id);

        Product existingProduct = findProductByIdOrThrow(id);
        existingProduct.setIsDeleted(true);
        productRepository.save(existingProduct);
        log.info("Successfully soft deleted product with ID: {} and SKU: {}", existingProduct.getId(), existingProduct.getSku());
    }

    @Transactional
    public void hardDeleteProduct(Long id) {
        log.info("Hard deleting product with ID: {}", id);

        Product existingProduct = findProductByIdOrThrow(id);
        productRepository.delete(existingProduct);
        log.info("Successfully hard deleted product with ID: {} and SKU: {}", existingProduct.getId(), existingProduct.getSku());
    }

    @Transactional
    public ProductResponse restoreProduct(Long id) {
        log.info("Restoring product with ID: {}", id);

        Product existingProduct = findProductByIdOrThrow(id);

        if (!existingProduct.getIsDeleted()) {
            throw new ProductNotDeletedException(ErrorMessages.format(ErrorMessages.PRODUCT_NOT_DELETED, id));
        }

        existingProduct.setIsDeleted(false);
        Product restoredProduct = productRepository.save(existingProduct);
        log.info("Successfully restored product with ID: {} and SKU: {}", restoredProduct.getId(), restoredProduct.getSku());

        return productMapper.toProductResponse(restoredProduct);
    }

    public List<ProductResponse> getDeletedProducts() {
        log.info("Fetching all deleted products");

        List<Product> products = productRepository.findByIsDeletedTrue();

        return products.stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    public String getProductName(Long productId) {
        log.info("Getting product name for ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        return product.getName();
    }

    public ProductInfo getProductInfo(Long productId) {
        log.info("Getting product info for ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        return ProductInfo.builder()
                .id(product.getId())
                .name(product.getName())
                .build();
    }

    public List<ProductResponse> searchProducts(String query, int limit, String fields) {
        log.info("Searching products with query: '{}', limit: {}, fields: {}", query, limit, fields);

        if (query == null || query.trim().isEmpty()) {
            log.warn("Search query is empty, returning empty list");
            return List.of();
        }

        List<Product> products = productRepository.searchProducts(query.trim());
        log.info("Found {} products matching query: '{}'", products.size(), query);

        return products.stream()
                .limit(limit)
                .map(product -> fieldFilterUtil.applyFieldFiltering(productMapper.toProductResponse(product), fields))
                .toList();
    }


}