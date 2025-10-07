package com.devwonder.productservice.repository;

import com.devwonder.productservice.entity.Product;
import com.devwonder.productservice.entity.ProductSerial;
import com.devwonder.productservice.enums.ProductSerialStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductSerialRepository extends JpaRepository<ProductSerial, Long> {
    boolean existsBySerial(String serial);
    Optional<ProductSerial> findBySerial(String serial);
    List<ProductSerial> findByProduct(Product product);

    @Query("SELECT ps.serial FROM ProductSerial ps WHERE ps.product = :product")
    List<String> findSerialsByProduct(@Param("product") Product product);

    @Query("SELECT COUNT(ps) FROM ProductSerial ps WHERE ps.product = :product AND ps.status = :status")
    Long countByProductAndStatus(@Param("product") Product product, @Param("status") ProductSerialStatus status);

    @Query("SELECT COUNT(ps) FROM ProductSerial ps WHERE ps.product = :product")
    Long countByProduct(@Param("product") Product product);

    @Query("SELECT ps FROM ProductSerial ps WHERE ps.product = :product AND ps.status = :status")
    List<ProductSerial> findByProductAndStatus(@Param("product") Product product, @Param("status") ProductSerialStatus status);

    @Query("SELECT ps FROM ProductSerial ps WHERE ps.dealerId = :dealerId")
    List<ProductSerial> findByDealerId(@Param("dealerId") Long dealerId);

    @Query("SELECT COUNT(ps) FROM ProductSerial ps WHERE ps.dealerId = :dealerId AND ps.status = :status")
    Long countByDealerIdAndStatus(@Param("dealerId") Long dealerId, @Param("status") ProductSerialStatus status);

    @Query("SELECT ps FROM ProductSerial ps WHERE ps.orderItemId = :orderItemId")
    List<ProductSerial> findByOrderItemId(@Param("orderItemId") Long orderItemId);

    @Query("SELECT ps FROM ProductSerial ps WHERE ps.orderItemId = :orderItemId")
    List<ProductSerial> findAllByOrderItemId(@Param("orderItemId") Long orderItemId);

    @Query("SELECT COUNT(ps) FROM ProductSerial ps WHERE ps.dealerId = :dealerId AND ps.status = 'ALLOCATED_TO_DEALER'")
    Long countAllocatedSerialsByDealer(@Param("dealerId") Long dealerId);

    @Query("SELECT COUNT(ps) FROM ProductSerial ps WHERE ps.orderItemId = :orderItemId AND ps.status = 'ALLOCATED_TO_DEALER'")
    Long countAllocatedSerialsByOrderItem(@Param("orderItemId") Long orderItemId);

    @Query("SELECT ps FROM ProductSerial ps WHERE ps.orderItemId = :orderItemId AND ps.status = :status")
    List<ProductSerial> findByOrderItemIdAndStatus(@Param("orderItemId") Long orderItemId, @Param("status") ProductSerialStatus status);

    @Query("SELECT DISTINCT ps.product.id FROM ProductSerial ps WHERE ps.dealerId = :dealerId")
    List<Long> findDistinctProductIdsByDealerId(@Param("dealerId") Long dealerId);

    @Query("SELECT ps FROM ProductSerial ps WHERE ps.product.id = :productId AND ps.dealerId = :dealerId")
    List<ProductSerial> findByProductIdAndDealerId(@Param("productId") Long productId, @Param("dealerId") Long dealerId);

    // Dashboard queries
    @Query("SELECT p.id, p.name, COUNT(ps) FROM ProductSerial ps JOIN ps.product p " +
           "WHERE ps.status = 'IN_STOCK' GROUP BY p.id, p.name")
    List<Object[]> getProductStockCounts();

    @Query("SELECT COUNT(ps) FROM ProductSerial ps WHERE ps.status = :status")
    Integer countByStatus(@Param("status") ProductSerialStatus status);

    @Query("SELECT COUNT(ps) FROM ProductSerial ps WHERE ps.product.id = :productId AND ps.status = :status")
    Integer countByProductIdAndStatus(@Param("productId") Long productId, @Param("status") ProductSerialStatus status);

    @Query("SELECT COUNT(ps) FROM ProductSerial ps WHERE ps.product.id = :productId")
    Long countByProductId(@Param("productId") Long productId);

    // Get top products by sales (sold quantity)
    @Query("SELECT p.id, p.name, COUNT(ps) as soldCount FROM ProductSerial ps " +
           "JOIN ps.product p WHERE ps.status = 'SOLD_TO_CUSTOMER' " +
           "GROUP BY p.id, p.name ORDER BY soldCount DESC")
    List<Object[]> getTopProductsBySales();
}