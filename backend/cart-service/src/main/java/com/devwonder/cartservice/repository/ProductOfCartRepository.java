package com.devwonder.cartservice.repository;

import com.devwonder.cartservice.entity.ProductOfCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductOfCartRepository extends JpaRepository<ProductOfCart, Long> {

    List<ProductOfCart> findByDealerId(Long dealerId);

    Optional<ProductOfCart> findByDealerIdAndProductId(Long dealerId, Long productId);

    Optional<ProductOfCart> findByDealerIdAndProductIdAndUnitPrice(Long dealerId, Long productId, BigDecimal unitPrice);

    void deleteByDealerIdAndProductId(Long dealerId, Long productId);

    void deleteByDealerId(Long dealerId);
}