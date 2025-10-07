package com.devwonder.authservice.config;

import com.devwonder.authservice.entity.Account;
import com.devwonder.authservice.entity.Role;
import com.devwonder.authservice.repository.AccountRepository;
import com.devwonder.authservice.repository.RoleRepository;

import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DataLoader {

    private final RoleRepository roleRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void loadInitialData() {
        log.info("Starting data initialization...");
        
        // Create roles if they don't exist
        Role systemRole = createRoleIfNotExists("SYSTEM");
        Role adminRole = createRoleIfNotExists("ADMIN");
        Role dealerRole = createRoleIfNotExists("DEALER");

        // Create accounts if they don't exist
        createAccountIfNotExists("admin", "password123", Set.of(systemRole, adminRole));
        createAccountIfNotExists("dealer", "password123", Set.of(dealerRole));

        log.info("Data initialization completed successfully!");
    }

    private Role createRoleIfNotExists(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .name(name)
                            .build();
                    role = roleRepository.save(role);
                    log.info("Created role: {}", name);
                    return role;
                });
    }

    private void createAccountIfNotExists(String username, String password, Set<Role> roles) {
        if (!accountRepository.existsByUsername(username)) {
            Account account = Account.builder()
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .roles(roles)
                    .build();
            
            accountRepository.save(account);
            log.info("Created account: {} with roles: {}", username, 
                    roles.stream().map(Role::getName).toList());
        }
    }
}