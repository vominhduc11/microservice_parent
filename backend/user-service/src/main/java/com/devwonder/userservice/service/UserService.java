package com.devwonder.userservice.service;

import com.devwonder.common.exception.AccountCreationException;
import com.devwonder.common.exception.ResourceAlreadyExistsException;
import com.devwonder.userservice.client.AuthServiceClient;
import com.devwonder.userservice.dto.*;
import com.devwonder.common.exception.ResourceNotFoundException;
import com.devwonder.userservice.entity.Dealer;
import com.devwonder.userservice.entity.Admin;
import com.devwonder.userservice.mapper.DealerMapper;
import com.devwonder.userservice.repository.DealerRepository;
import com.devwonder.userservice.util.AccountGeneratorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final DealerRepository dealerRepository;
    private final DealerMapper dealerMapper;
    private final AuthServiceClient authServiceClient;
    private final DealerEventService dealerEventService;
    private final com.devwonder.userservice.util.FieldFilterUtil fieldFilterUtil;
    private final com.devwonder.userservice.repository.AdminRepository adminRepository;

    @Transactional(readOnly = true)
    public List<DealerResponse> getAllDealers() {
        log.info("Fetching all dealers from database");

        List<Dealer> dealers = dealerRepository.findAll();

        log.info("Found {} dealers in system", dealers.size());

        return dealers.stream()
                .map(dealerMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DealerResponse getDealerById(Long dealerId, String fields) {
        log.info("Fetching dealer with ID: {} - fields: {}", dealerId, fields);

        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with ID: " + dealerId));

        log.info("Found dealer: {} with accountId: {}", dealer.getCompanyName(), dealer.getAccountId());

        DealerResponse response = dealerMapper.toResponse(dealer);
        return fieldFilterUtil.applyFieldFiltering(response, fields);
    }

    @Transactional(readOnly = true)
    public DealerResponse getDealerById(Long dealerId) {
        return getDealerById(dealerId, null);
    }

    @Transactional(readOnly = true)
    public List<DealerResponse> searchDealers(String query, int limit, String fields) {
        log.info("Searching dealers with query: '{}', limit: {}, fields: {}", query, limit, fields);

        if (query == null || query.trim().isEmpty()) {
            log.warn("Search query is empty, returning empty list");
            return List.of();
        }

        List<Dealer> dealers = dealerRepository.searchDealers(query.trim());
        log.info("Found {} dealers matching query: '{}'", dealers.size(), query);

        return dealers.stream()
                .limit(limit)
                .map(dealer -> fieldFilterUtil.applyFieldFiltering(dealerMapper.toResponse(dealer), fields))
                .toList();
    }

    @Transactional
    public DealerResponse createDealer(DealerRequest dealerRequest) {
        log.info("Creating new dealer for company: {}", dealerRequest.getCompanyName());
        
        // Check if phone already exists
        if (dealerRepository.existsByPhone(dealerRequest.getPhone())) {
            log.warn("Dealer with phone {} already exists", dealerRequest.getPhone());
            throw new ResourceAlreadyExistsException("Dealer with phone " + dealerRequest.getPhone() + " already exists");
        }
        
        // Check if email already exists
        if (dealerRepository.existsByEmail(dealerRequest.getEmail())) {
            log.warn("Dealer with email {} already exists", dealerRequest.getEmail());
            throw new ResourceAlreadyExistsException("Dealer with email " + dealerRequest.getEmail() + " already exists");
        }
        
        // Generate username and password automatically
        String username = AccountGeneratorUtil.generateUsername(dealerRequest.getCompanyName());
        String password = AccountGeneratorUtil.generateDealerPassword();
        
        log.info("Generated username: {} for dealer", username);
        
        // Create account in auth-service
        AuthAccountCreateRequest authRequest = AuthAccountCreateRequest.builder()
                .username(username)
                .password(password)
                .roleNames(Set.of("DEALER"))
                .build();
        
        try {
            var authResponse = authServiceClient.createAccount(authRequest, "INTER_SERVICE_KEY");
            log.info("Successfully created account with ID: {} for dealer", authResponse.getData().getId());
            
            // Map request to entity
            Dealer dealer = dealerMapper.toEntity(dealerRequest);
            dealer.setAccountId(authResponse.getData().getId());
            
            // Save dealer
            Dealer savedDealer = dealerRepository.save(dealer);
            log.info("Successfully created dealer with accountId: {}", savedDealer.getAccountId());
            
            // Publish dealer events to Kafka (email and socket notifications)
            dealerEventService.publishDealerEmailEvent(savedDealer, username, password);
            dealerEventService.publishDealerRegistrationEvent(savedDealer);
            
            // Return response
            return dealerMapper.toResponse(savedDealer);
            
        } catch (Exception e) {
            log.error("Failed to create account for dealer: {}", e.getMessage());
            throw new AccountCreationException("Failed to create dealer account: " + e.getMessage(), e);
        }
    }

    @Transactional
    public DealerResponse updateDealer(Long dealerId, DealerUpdateRequest updateRequest) {
        log.info("Updating dealer with ID: {}", dealerId);
        
        // Find existing dealer
        Dealer existingDealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with ID: " + dealerId));
        
        // Check if phone already exists for another dealer
        if (!updateRequest.getPhone().equals(existingDealer.getPhone()) &&
            dealerRepository.existsByPhone(updateRequest.getPhone())) {
            log.warn("Phone {} already exists for another dealer", updateRequest.getPhone());
            throw new ResourceAlreadyExistsException("Phone " + updateRequest.getPhone() + " already exists for another dealer");
        }
        
        // Check if email already exists for another dealer
        if (!updateRequest.getEmail().equals(existingDealer.getEmail()) &&
            dealerRepository.existsByEmail(updateRequest.getEmail())) {
            log.warn("Email {} already exists for another dealer", updateRequest.getEmail());
            throw new ResourceAlreadyExistsException("Email " + updateRequest.getEmail() + " already exists for another dealer");
        }
        
        // Full replacement - update ALL fields (PUT semantics)
        existingDealer.setCompanyName(updateRequest.getCompanyName());
        existingDealer.setAddress(updateRequest.getAddress());
        existingDealer.setPhone(updateRequest.getPhone());
        existingDealer.setEmail(updateRequest.getEmail());
        existingDealer.setDistrict(updateRequest.getDistrict());
        existingDealer.setCity(updateRequest.getCity());
        
        // Save updated dealer
        Dealer updatedDealer = dealerRepository.save(existingDealer);
        log.info("Successfully updated dealer with accountId: {}", updatedDealer.getAccountId());
        
        return dealerMapper.toResponse(updatedDealer);
    }

    @Transactional
    public void deleteDealer(Long dealerId) {
        log.info("Deleting dealer with ID: {}", dealerId);
        
        // Find existing dealer first to get accountId
        Dealer existingDealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with ID: " + dealerId));
        
        Long accountId = existingDealer.getAccountId();
        log.info("Found dealer with accountId: {}, proceeding to delete both dealer and account", accountId);
        
        try {
            // Delete dealer first (local transaction)
            dealerRepository.deleteById(dealerId);
            log.info("Successfully deleted dealer with ID: {}", dealerId);
            
            // Delete corresponding account in auth-service
            authServiceClient.deleteAccount(accountId, "INTER_SERVICE_KEY");
            log.info("Successfully deleted account with ID: {} in auth-service", accountId);
            
        } catch (Exception e) {
            log.error("Failed to delete dealer or account: {}", e.getMessage());
            throw new RuntimeException("Failed to delete dealer and associated account: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public AdminResponse getAdminInfo(Long accountId) {
        log.info("Fetching admin information for accountId: {}", accountId);

        Admin admin = adminRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with accountId: " + accountId));

        log.info("Found admin: {} with accountId: {}", admin.getName(), admin.getAccountId());

        return AdminResponse.builder()
                .accountId(admin.getAccountId())
                .name(admin.getName())
                .email(admin.getEmail())
                .phone(admin.getPhone())
                .companyName(admin.getCompanyName())
                .requireLoginEmailConfirmation(admin.getRequireLoginEmailConfirmation())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminResponse> getAllAdmins() {
        log.info("Fetching all admins with role ADMIN (excluding SYSTEM role)");

        try {
            // Get account IDs that have ADMIN role but NOT SYSTEM role
            var response = authServiceClient.getAccountIdsByRoleExcluding("ADMIN", "SYSTEM", "INTER_SERVICE_KEY");
            List<Long> accountIds = response.getData();

            log.info("Found {} admin account IDs from auth-service", accountIds.size());

            // Get admin details for these account IDs
            List<AdminResponse> admins = accountIds.stream()
                    .map(accountId -> {
                        try {
                            return adminRepository.findById(accountId)
                                    .map(admin -> AdminResponse.builder()
                                            .accountId(admin.getAccountId())
                                            .name(admin.getName())
                                            .email(admin.getEmail())
                                            .phone(admin.getPhone())
                                            .companyName(admin.getCompanyName())
                                            .requireLoginEmailConfirmation(admin.getRequireLoginEmailConfirmation())
                                            .build())
                                    .orElse(null);
                        } catch (Exception e) {
                            log.warn("Failed to fetch admin with accountId {}: {}", accountId, e.getMessage());
                            return null;
                        }
                    })
                    .filter(admin -> admin != null)
                    .toList();

            log.info("Successfully retrieved {} admin profiles", admins.size());
            return admins;

        } catch (Exception e) {
            log.error("Failed to retrieve admin list: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve admin list: " + e.getMessage(), e);
        }
    }

    @Transactional
    public AdminResponse updateAdmin(Long accountId, com.devwonder.userservice.dto.AdminUpdateRequest updateRequest) {
        log.info("Updating admin with accountId: {}", accountId);

        // Find existing admin
        Admin existingAdmin = adminRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with accountId: " + accountId));

        // Check if email already exists for another admin
        if (!updateRequest.getEmail().equals(existingAdmin.getEmail()) &&
            adminRepository.existsByEmail(updateRequest.getEmail())) {
            log.warn("Email {} already exists for another admin", updateRequest.getEmail());
            throw new ResourceAlreadyExistsException("Email " + updateRequest.getEmail() + " already exists for another admin");
        }

        // Check if phone already exists for another admin
        if (!updateRequest.getPhone().equals(existingAdmin.getPhone()) &&
            adminRepository.existsByPhone(updateRequest.getPhone())) {
            log.warn("Phone {} already exists for another admin", updateRequest.getPhone());
            throw new ResourceAlreadyExistsException("Phone " + updateRequest.getPhone() + " already exists for another admin");
        }

        // Full replacement - update ALL fields (PUT semantics)
        existingAdmin.setName(updateRequest.getName());
        existingAdmin.setEmail(updateRequest.getEmail());
        existingAdmin.setPhone(updateRequest.getPhone());
        existingAdmin.setCompanyName(updateRequest.getCompanyName());

        // Save updated admin
        Admin updatedAdmin = adminRepository.save(existingAdmin);
        log.info("Successfully updated admin with accountId: {}", updatedAdmin.getAccountId());

        return AdminResponse.builder()
                .accountId(updatedAdmin.getAccountId())
                .name(updatedAdmin.getName())
                .email(updatedAdmin.getEmail())
                .phone(updatedAdmin.getPhone())
                .companyName(updatedAdmin.getCompanyName())
                .requireLoginEmailConfirmation(updatedAdmin.getRequireLoginEmailConfirmation())
                .build();
    }

    @Transactional
    public void deleteAdmin(Long adminId) {
        log.info("Deleting admin with ID: {}", adminId);

        // Find existing admin first to get accountId
        Admin existingAdmin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        Long accountId = existingAdmin.getAccountId();
        log.info("Found admin with accountId: {}, proceeding to delete both admin and account", accountId);

        try {
            // Delete admin first (local transaction)
            adminRepository.deleteById(adminId);
            log.info("Successfully deleted admin with ID: {}", adminId);

            // Delete corresponding account in auth-service
            authServiceClient.deleteAccount(accountId, "INTER_SERVICE_KEY");
            log.info("Successfully deleted account with ID: {} in auth-service", accountId);

        } catch (Exception e) {
            log.error("Failed to delete admin or account: {}", e.getMessage());
            throw new RuntimeException("Failed to delete admin: " + e.getMessage(), e);
        }
    }

    @Transactional
    public java.util.Map<String, Object> deleteAdminsBatch(List<Long> adminIds) {
        log.info("Starting batch deletion for {} admins", adminIds.size());

        List<Long> successfulDeletes = new java.util.ArrayList<>();
        List<java.util.Map<String, Object>> failedDeletes = new java.util.ArrayList<>();

        for (Long adminId : adminIds) {
            try {
                // Find existing admin first to get accountId
                Admin existingAdmin = adminRepository.findById(adminId)
                        .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

                Long accountId = existingAdmin.getAccountId();

                // Delete admin first (local transaction)
                adminRepository.deleteById(adminId);
                log.info("Successfully deleted admin with ID: {}", adminId);

                // Delete corresponding account in auth-service
                authServiceClient.deleteAccount(accountId, "INTER_SERVICE_KEY");
                log.info("Successfully deleted account with ID: {} in auth-service", accountId);

                successfulDeletes.add(adminId);

            } catch (Exception e) {
                log.error("Failed to delete admin {}: {}", adminId, e.getMessage());
                java.util.Map<String, Object> failedItem = new java.util.HashMap<>();
                failedItem.put("adminId", adminId);
                failedItem.put("error", e.getMessage());
                failedDeletes.add(failedItem);
            }
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalRequested", adminIds.size());
        result.put("successCount", successfulDeletes.size());
        result.put("failCount", failedDeletes.size());
        result.put("successfulDeletes", successfulDeletes);
        result.put("failedDeletes", failedDeletes);

        log.info("Batch deletion completed: {} successful, {} failed", successfulDeletes.size(), failedDeletes.size());

        return result;
    }

    @Transactional
    public AdminResponse updateLoginEmailConfirmation(Long accountId, UpdateLoginEmailConfirmationRequest request) {
        log.info("Updating login email confirmation setting for admin with accountId: {}", accountId);

        // Find existing admin
        Admin existingAdmin = adminRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with accountId: " + accountId));

        // Update requireLoginEmailConfirmation
        existingAdmin.setRequireLoginEmailConfirmation(request.getRequireLoginEmailConfirmation());

        // Save updated admin
        Admin updatedAdmin = adminRepository.save(existingAdmin);
        log.info("Successfully updated login email confirmation to {} for accountId: {}",
                request.getRequireLoginEmailConfirmation(), accountId);

        return AdminResponse.builder()
                .accountId(updatedAdmin.getAccountId())
                .name(updatedAdmin.getName())
                .email(updatedAdmin.getEmail())
                .phone(updatedAdmin.getPhone())
                .companyName(updatedAdmin.getCompanyName())
                .requireLoginEmailConfirmation(updatedAdmin.getRequireLoginEmailConfirmation())
                .build();
    }

    @Transactional(readOnly = true)
    public Boolean getAdminRequireLoginEmailConfirmation(Long accountId) {
        log.info("Fetching requireLoginEmailConfirmation for admin with accountId: {}", accountId);

        return adminRepository.findById(accountId)
                .map(admin -> Boolean.TRUE.equals(admin.getRequireLoginEmailConfirmation()))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public String getAdminEmail(Long accountId) {
        log.info("Fetching email for admin with accountId: {}", accountId);

        return adminRepository.findById(accountId)
                .map(Admin::getEmail)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Long getAccountIdByEmail(String email) {
        log.info("Fetching account ID for email: {}", email);

        // Try to find in Admin first
        Long adminAccountId = adminRepository.findByEmail(email)
                .map(Admin::getAccountId)
                .orElse(null);

        if (adminAccountId != null) {
            log.info("Found account ID {} for email {} in Admin", adminAccountId, email);
            return adminAccountId;
        }

        // Try to find in Dealer
        Long dealerAccountId = dealerRepository.findByEmail(email)
                .map(Dealer::getAccountId)
                .orElse(null);

        if (dealerAccountId != null) {
            log.info("Found account ID {} for email {} in Dealer", dealerAccountId, email);
            return dealerAccountId;
        }

        log.info("No account found for email: {}", email);
        return null;
    }

    @Transactional
    public AdminResponse registerAdmin(AdminRegisterRequest registerRequest) {
        log.info("Registering new admin with username: {}", registerRequest.getUsername());

        // Check if phone already exists
        if (adminRepository.existsByPhone(registerRequest.getPhone())) {
            log.warn("Admin with phone {} already exists", registerRequest.getPhone());
            throw new ResourceAlreadyExistsException("Admin with phone " + registerRequest.getPhone() + " already exists");
        }

        // Check if email already exists
        if (adminRepository.existsByEmail(registerRequest.getEmail())) {
            log.warn("Admin with email {} already exists", registerRequest.getEmail());
            throw new ResourceAlreadyExistsException("Admin with email " + registerRequest.getEmail() + " already exists");
        }

        // Check if username already exists in auth-service
        try {
            var usernameCheckResponse = authServiceClient.checkUsernameExists(registerRequest.getUsername(), "INTER_SERVICE_KEY");
            if (Boolean.TRUE.equals(usernameCheckResponse.getData())) {
                log.warn("Username {} already exists", registerRequest.getUsername());
                throw new ResourceAlreadyExistsException("Username " + registerRequest.getUsername() + " already exists");
            }
        } catch (Exception e) {
            log.error("Failed to check username existence: {}", e.getMessage());
            throw new RuntimeException("Failed to validate username: " + e.getMessage(), e);
        }

        // Create account in auth-service with ADMIN role only
        AuthAccountCreateRequest authRequest = AuthAccountCreateRequest.builder()
                .username(registerRequest.getUsername())
                .password(registerRequest.getPassword())
                .roleNames(Set.of("ADMIN"))
                .build();

        try {
            var authResponse = authServiceClient.createAccount(authRequest, "INTER_SERVICE_KEY");
            log.info("Successfully created account with ID: {} for admin", authResponse.getData().getId());

            // Create admin entity
            Admin admin = Admin.builder()
                    .accountId(authResponse.getData().getId())
                    .name(registerRequest.getName())
                    .email(registerRequest.getEmail())
                    .phone(registerRequest.getPhone())
                    .companyName(registerRequest.getCompanyName())
                    .build();

            // Save admin
            Admin savedAdmin = adminRepository.save(admin);
            log.info("Successfully registered admin with accountId: {}", savedAdmin.getAccountId());

            // Return response
            return AdminResponse.builder()
                    .accountId(savedAdmin.getAccountId())
                    .name(savedAdmin.getName())
                    .email(savedAdmin.getEmail())
                    .phone(savedAdmin.getPhone())
                    .companyName(savedAdmin.getCompanyName())
                    .build();

        } catch (Exception e) {
            log.error("Failed to create account for admin: {}", e.getMessage());
            throw new AccountCreationException("Failed to create admin account: " + e.getMessage(), e);
        }
    }

}