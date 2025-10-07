package com.devwonder.productservice.repository;

import com.devwonder.productservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByShowOnHomepageTrueAndIsDeletedFalse();

    List<Product> findByIsFeaturedTrueAndIsDeletedFalse();

    List<Product> findByIsDeletedFalse();

    List<Product> findByIsDeletedTrue();

    List<Product> findByIsDeletedFalseAndIdNot(Long id);

    boolean existsBySkuAndIsDeletedFalse(String sku);

    @Query("SELECT p FROM Product p WHERE p.isDeleted = false AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.shortDescription) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("query") String query);
}