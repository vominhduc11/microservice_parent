package com.devwonder.userservice.config;

import com.devwonder.userservice.entity.Admin;
import com.devwonder.userservice.entity.Dealer;
import com.devwonder.userservice.repository.AdminRepository;
import com.devwonder.userservice.repository.DealerRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader {

    private final AdminRepository adminRepository;
    private final DealerRepository dealerRepository;

    @PostConstruct
    public void loadInitialData() {
        log.info("Starting user data initialization...");
        
        // Create admin profile for accountId = 1 (admin account from auth-service)
        createAdminIfNotExists(1L, "System Administrator", "admin@devwonder.com", "+1234567890", "DevWonder Technology");

        // Create dealer profile for accountId = 2 (dealer account from auth-service)
        createDealerIfNotExists(2L, "ABC Trading Company", "123 Business St", "+1987654321",
                                "dealer@abc-trading.com", "Business District", "Ho Chi Minh City");

        log.info("User data initialization completed successfully!");
    }

    private void createAdminIfNotExists(Long accountId, String name, String email, String phone, String companyName) {
        if (!adminRepository.existsById(accountId) && !adminRepository.existsByEmail(email)) {
            Admin admin = Admin.builder()
                    .accountId(accountId)
                    .name(name)
                    .email(email)
                    .phone(phone)
                    .companyName(companyName)
                    .build();
            adminRepository.save(admin);
            log.info("Created admin profile for accountId: {}", accountId);
        } else {
            log.info("Admin already exists with accountId: {} or email: {}", accountId, email);
        }
    }


    private void createDealerIfNotExists(Long accountId, String companyName, String address,
                                       String phone, String email, String district, String city) {
        if (!dealerRepository.existsById(accountId) && !dealerRepository.existsByEmail(email)) {
            Dealer dealer = Dealer.builder()
                    .accountId(accountId)
                    .companyName(companyName)
                    .address(address)
                    .phone(phone)
                    .email(email)
                    .district(district)
                    .city(city)
                    .build();
            dealerRepository.save(dealer);
            log.info("Created dealer profile for accountId: {}", accountId);
        } else {
            log.info("Dealer already exists with accountId: {} or email: {}", accountId, email);
        }
    }
}