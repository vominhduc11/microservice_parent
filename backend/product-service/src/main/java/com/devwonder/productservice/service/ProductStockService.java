package com.devwonder.productservice.service;

import com.devwonder.common.exception.ResourceNotFoundException;
import com.devwonder.productservice.entity.Product;
import com.devwonder.productservice.enums.ProductSerialStatus;
import com.devwonder.productservice.repository.ProductRepository;
import com.devwonder.productservice.repository.ProductSerialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductStockService {

    private final ProductRepository productRepository;
    private final ProductSerialRepository productSerialRepository;

    @Transactional
    public void updateProductStock(Long productId) {
        log.info("Updating stock for product ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        Long inStockCount = productSerialRepository.countByProductAndStatus(product, ProductSerialStatus.IN_STOCK);
        product.setStock(inStockCount);

        productRepository.save(product);

        log.info("Updated stock for product ID: {} to {} units", productId, inStockCount);
    }

    @Transactional
    public void updateAllProductsStock() {
        log.info("Updating stock for all products");

        List<Product> allProducts = productRepository.findAll();

        for (Product product : allProducts) {
            Long inStockCount = productSerialRepository.countByProductAndStatus(product, ProductSerialStatus.IN_STOCK);
            product.setStock(inStockCount);
        }

        productRepository.saveAll(allProducts);

        log.info("Updated stock for {} products", allProducts.size());
    }
}