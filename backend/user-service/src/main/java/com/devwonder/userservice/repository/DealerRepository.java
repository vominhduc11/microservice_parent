package com.devwonder.userservice.repository;

import com.devwonder.userservice.entity.Dealer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DealerRepository extends JpaRepository<Dealer, Long> {

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    java.util.Optional<Dealer> findByEmail(String email);

    // Search dealers by keyword in company name, phone, email or city
    @Query("SELECT d FROM Dealer d WHERE " +
           "LOWER(d.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.city) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Dealer> searchDealers(@Param("query") String query);
}