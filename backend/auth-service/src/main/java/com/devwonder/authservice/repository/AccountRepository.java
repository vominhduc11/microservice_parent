package com.devwonder.authservice.repository;

import com.devwonder.authservice.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.roles WHERE a.username = :username")
    Optional<Account> findByUsername(@Param("username") String username);

    @Query("SELECT a FROM Account a WHERE a.username = :username")
    Optional<Account> findByUsernameSimple(@Param("username") String username);

    boolean existsByUsername(String username);

    @Query("SELECT DISTINCT a FROM Account a JOIN a.roles r WHERE r.name = :roleName")
    List<Account> findAccountsByRoleName(@Param("roleName") String roleName);

    @Query("SELECT DISTINCT a FROM Account a JOIN a.roles r1 WHERE r1.name = :roleName AND NOT EXISTS (SELECT 1 FROM Account a2 JOIN a2.roles r2 WHERE a2.id = a.id AND r2.name = :excludeRoleName)")
    List<Account> findAccountsByRoleNameExcluding(@Param("roleName") String roleName, @Param("excludeRoleName") String excludeRoleName);
}