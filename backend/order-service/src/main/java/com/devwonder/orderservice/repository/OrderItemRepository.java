package com.devwonder.orderservice.repository;

import com.devwonder.orderservice.entity.OrderItem;
import com.devwonder.orderservice.dto.ProductSalesDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);

    List<OrderItem> findByIdProduct(Long idProduct);

    @Modifying
    @Query("DELETE FROM OrderItem oi WHERE oi.order.id = :orderId")
    void deleteByOrderId(@Param("orderId") Long orderId);

    // Dashboard queries for revenue calculation
    @Query("SELECT SUM(oi.unitPrice * oi.quantity) FROM OrderItem oi " +
           "WHERE oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "AND oi.order.isDeleted = false AND oi.order.paymentStatus = com.devwonder.orderservice.enums.PaymentStatus.PAID")
    Optional<BigDecimal> calculateRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT oi.order.id) FROM OrderItem oi " +
           "WHERE oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "AND oi.order.isDeleted = false AND oi.order.paymentStatus = com.devwonder.orderservice.enums.PaymentStatus.PAID " +
           "AND oi.status = 'COMPLETED'")
    Long countCompletedOrdersByDateRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);


    // Get top products by sales (using native query for LIMIT support)
    @Query(value = "SELECT oi.id_product, " +
           "COALESCE(oi.product_name, 'Unknown Product') as product_name, " +
           "CAST(SUM(oi.quantity) AS integer) as sold_quantity, " +
           "SUM(oi.unit_price * oi.quantity) as revenue, " +
           "0.0 as growth " +
           "FROM order_item oi " +
           "JOIN order_table o ON oi.order_id = o.id " +
           "WHERE o.is_deleted = false AND o.payment_status = 'PAID' " +
           "GROUP BY oi.id_product, oi.product_name " +
           "ORDER BY SUM(oi.unit_price * oi.quantity) DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getTopProductsSalesRaw(@Param("limit") int limit);

}