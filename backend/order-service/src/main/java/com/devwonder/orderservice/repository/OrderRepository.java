package com.devwonder.orderservice.repository;

import com.devwonder.orderservice.entity.Order;
import com.devwonder.orderservice.dto.DealerOrderStatsDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByIdDealerOrderByCreatedAtDesc(Long idDealer);

    // Find non-deleted orders
    List<Order> findByIsDeletedFalseOrderByCreatedAtDesc();

    List<Order> findByIdDealerAndIsDeletedFalseOrderByCreatedAtDesc(Long idDealer);

    List<Order> findByIdDealerAndPaymentStatusAndIsDeletedFalseOrderByCreatedAtDesc(Long idDealer, com.devwonder.orderservice.enums.PaymentStatus paymentStatus);

    List<Order> findByIdDealerAndPaymentStatusOrderByCreatedAtDesc(Long idDealer, com.devwonder.orderservice.enums.PaymentStatus paymentStatus);

    Optional<Order> findByIdAndIsDeletedFalse(Long id);

    // Find deleted orders (for admin)
    List<Order> findByIsDeletedTrueOrderByCreatedAtDesc();

    // Check if order exists and is not deleted
    boolean existsByIdAndIsDeletedFalse(Long id);

    // Count deleted orders
    long countByIsDeletedTrue();

    // Get unique dealer IDs from orders
    @Query("SELECT DISTINCT o.idDealer FROM Order o WHERE o.isDeleted = false")
    List<Long> findDistinctDealerIds();

    // Dashboard queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate AND o.isDeleted = false")
    Long countOrdersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Count only PAID orders (consistent with revenue calculation)
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
           "AND o.isDeleted = false AND o.paymentStatus = com.devwonder.orderservice.enums.PaymentStatus.PAID")
    Long countPaidOrdersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Count distinct dealers who placed PAID orders in date range (consistent with revenue calculation)
    @Query("SELECT COUNT(DISTINCT o.idDealer) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
           "AND o.isDeleted = false AND o.paymentStatus = com.devwonder.orderservice.enums.PaymentStatus.PAID")
    Long countDistinctDealersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Get dealer order statistics - Using native query to avoid JPQL validation issues
    @Query(value = "SELECT o.id_dealer as dealerId, " +
           "COALESCE(o.dealer_name, 'Unknown') as dealerName, " +
           "COUNT(DISTINCT o.id) as totalOrders, " +
           "SUM(oi.unit_price * oi.quantity) as totalRevenue " +
           "FROM orders o JOIN order_items oi ON o.id = oi.order_id " +
           "WHERE o.is_deleted = false AND o.payment_status = 'PAID' " +
           "GROUP BY o.id_dealer, o.dealer_name " +
           "ORDER BY totalRevenue DESC",
           nativeQuery = true)
    List<Object[]> getDealerOrderStats();

    // Search orders by order code only
    @Query("SELECT DISTINCT o FROM Order o WHERE o.isDeleted = false AND " +
           "LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Order> searchOrders(@Param("query") String query);
}