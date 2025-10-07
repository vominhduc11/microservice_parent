package com.devwonder.userservice.repository;

import com.devwonder.userservice.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    java.util.Optional<Admin> findByEmail(String email);
}