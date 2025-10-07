package com.devwonder.warrantyservice.service;

import com.devwonder.common.exception.ResourceNotFoundException;
import com.devwonder.common.exception.ResourceAlreadyExistsException;
import com.devwonder.warrantyservice.client.ProductServiceClient;
import com.devwonder.warrantyservice.dto.*;
import com.devwonder.warrantyservice.entity.Warranty;
import com.devwonder.warrantyservice.enums.WarrantyStatus;
import com.devwonder.warrantyservice.exception.WarrantyAlreadyExistsException;
import com.devwonder.warrantyservice.exception.WarrantyNotFoundException;
import com.devwonder.warrantyservice.mapper.WarrantyMapper;
import com.devwonder.warrantyservice.repository.WarrantyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WarrantyService {

    private final WarrantyRepository warrantyRepository;
    private final ProductServiceClient productServiceClient;
    private final WarrantyMapper warrantyMapper;

    @Value("${auth.api.key:INTER_SERVICE_KEY}")
    private String authApiKey;

    public WarrantyBulkCreateResponse createWarranties(WarrantyCreateRequest request) {
        log.info("Creating warranties for product: {} with {} serials",
                request.getProductId(), request.getSerialNumbers().size());

        // 1. Get customer information from request
        CustomerInfo customerInfo = request.getCustomer();

        // 2. Create warranties for each serial
        List<WarrantyResponse> successfulWarranties = new ArrayList<>();
        List<String> failedSerials = new ArrayList<>();
        List<String> successfulSerials = new ArrayList<>();

        for (String serial : request.getSerialNumbers()) {
            try {
                WarrantyResponse warranty = createSingleWarranty(
                        serial,
                        customerInfo,
                        request.getPurchaseDate());
                successfulWarranties.add(warranty);
                successfulSerials.add(serial);
                log.info("Successfully created warranty for serial: {} with code: {}",
                        serial, warranty.getWarrantyCode());
            } catch (WarrantyAlreadyExistsException e) {
                log.warn("Warranty already exists for serial {}: {}", serial, e.getMessage());
                failedSerials.add(serial);
            } catch (ResourceAlreadyExistsException e) {
                log.warn("Customer already exists for serial {}: {}", serial, e.getMessage());
                failedSerials.add(serial);
            } catch (ResourceNotFoundException e) {
                log.warn("Product serial not found {}: {}", serial, e.getMessage());
                failedSerials.add(serial);
            } catch (Exception e) {
                log.error("Unexpected error creating warranty for serial {}: {}", serial, e.getMessage(), e);
                failedSerials.add(serial);
            }
        }

        // 4. Update product serials to SOLD_TO_CUSTOMER status
        if (!successfulSerials.isEmpty()) {
            updateProductSerialsStatus(successfulSerials);
        }

        return WarrantyBulkCreateResponse.builder()
                .customerName(customerInfo.getName())
                .warranties(successfulWarranties)
                .totalWarranties(successfulWarranties.size())
                .failedSerials(failedSerials)
                .build();
    }

    private WarrantyResponse createSingleWarranty(String serial, CustomerInfo customerInfo,
            java.time.LocalDate purchaseDate) {
        log.debug("Creating warranty for serial: {}, customer: {}, purchaseDate: {}", serial, customerInfo.getName(),
                purchaseDate);

        // Check if customer already exists by email or phone
        Optional<Warranty> existingByEmail = warrantyRepository.findByCustomerEmail(customerInfo.getEmail());
        if (existingByEmail.isPresent()) {
            log.warn("Customer already exists with email: {}", customerInfo.getEmail());
            throw new ResourceAlreadyExistsException("Customer with email " + customerInfo.getEmail() + " already exists");
        }

        Optional<Warranty> existingByPhone = warrantyRepository.findByCustomerPhone(customerInfo.getPhone());
        if (existingByPhone.isPresent()) {
            log.warn("Customer already exists with phone: {}", customerInfo.getPhone());
            throw new ResourceAlreadyExistsException("Customer with phone " + customerInfo.getPhone() + " already exists");
        }

        // Get product serial ID
        log.debug("Calling product service with API key: {}",
                authApiKey != null ? "***" + authApiKey.substring(Math.max(0, authApiKey.length() - 4)) : "null");
        var serialResponse = productServiceClient.getProductSerialIdBySerial(serial, authApiKey);
        if (!serialResponse.isSuccess() || serialResponse.getData() == null) {
            log.error("Failed to get product serial ID for serial: {}, response: {}, API key used: {}",
                    serial, serialResponse.getMessage(),
                    authApiKey != null ? "***" + authApiKey.substring(Math.max(0, authApiKey.length() - 4)) : "null");
            throw new ResourceNotFoundException("Product serial not found: " + serial);
        }

        Long productSerialId = serialResponse.getData();
        log.debug("Retrieved product serial ID: {} for serial: {}", productSerialId, serial);

        // Check if warranty already exists
        if (warrantyRepository.findActiveWarrantyByProductSerial(productSerialId).isPresent()) {
            log.warn("Active warranty already exists for product serial ID: {}, serial: {}", productSerialId, serial);
            throw new WarrantyAlreadyExistsException("Active warranty already exists for serial: " + serial);
        }

        // Generate warranty code
        String warrantyCode = generateWarrantyCode(serial);
        log.debug("Generated warranty code: {} for serial: {}", warrantyCode, serial);

        // Create warranty entity
        Warranty warranty = Warranty.builder()
                .idProductSerial(productSerialId)
                .customerName(customerInfo.getName())
                .customerEmail(customerInfo.getEmail())
                .customerPhone(customerInfo.getPhone())
                .customerAddress(customerInfo.getAddress())
                .warrantyCode(warrantyCode)
                .status(WarrantyStatus.ACTIVE)
                .purchaseDate(purchaseDate.atStartOfDay())
                .build();

        try {
            Warranty savedWarranty = warrantyRepository.save(warranty);
            log.info("Successfully saved warranty to database - ID: {}, Code: {}, Serial: {}",
                    savedWarranty.getId(), warrantyCode, serial);

            return mapToResponse(savedWarranty);
        } catch (Exception e) {
            log.error("Failed to save warranty to database for serial: {}, error: {}", serial, e.getMessage(), e);
            throw new RuntimeException("Failed to save warranty: " + e.getMessage(), e);
        }
    }

    private String generateWarrantyCode(String serial) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return String.format("WR-%s-%s-%s", timestamp, serial, randomSuffix);
    }

    @Transactional(readOnly = true)
    public WarrantyResponse getWarrantyByProductSerial(Long productSerialId) {
        log.info("Checking warranty for product serial: {}", productSerialId);

        Warranty warranty = warrantyRepository.findActiveWarrantyByProductSerial(productSerialId)
                .orElseThrow(() -> new WarrantyNotFoundException(
                        "No active warranty found for product serial: " + productSerialId));

        return mapToResponse(warranty);
    }

    @Transactional(readOnly = true)
    public WarrantyResponse getWarrantyBySerialNumber(String serialNumber) {
        log.info("Checking warranty for serial number: {}", serialNumber);

        // 1. Get product serial ID from product service
        var serialResponse = productServiceClient.getProductSerialIdBySerial(serialNumber, authApiKey);
        if (!serialResponse.isSuccess() || serialResponse.getData() == null) {
            log.warn("Product serial not found for serial number: {}", serialNumber);
            throw new WarrantyNotFoundException("Product serial not found: " + serialNumber);
        }

        Long productSerialId = serialResponse.getData();
        log.debug("Found product serial ID: {} for serial number: {}", productSerialId, serialNumber);

        // 2. Check warranty for this product serial ID
        Warranty warranty = warrantyRepository.findActiveWarrantyByProductSerial(productSerialId)
                .orElseThrow(() -> new WarrantyNotFoundException(
                        "No active warranty found for serial number: " + serialNumber));

        return mapToResponseWithDetails(warranty);
    }

    public boolean isWarrantyActive(Warranty warranty) {
        LocalDateTime endDate = warranty.getPurchaseDate().plusMonths(24); // Calculate end date: purchase + 24 months
        return warranty.getStatus() == WarrantyStatus.ACTIVE &&
                endDate.isAfter(LocalDateTime.now());
    }

    public boolean isWarrantyExpired(Warranty warranty) {
        LocalDateTime endDate = warranty.getPurchaseDate().plusMonths(24); // Calculate end date: purchase + 24 months
        return endDate.isBefore(LocalDateTime.now()) ||
                warranty.getStatus() == WarrantyStatus.EXPIRED;
    }

    private void updateProductSerialsStatus(List<String> serialNumbers) {
        try {
            ProductSerialBulkStatusUpdateRequest request = ProductSerialBulkStatusUpdateRequest.builder()
                    .serialNumbers(serialNumbers)
                    .status("SOLD_TO_CUSTOMER")
                    .build();

            var response = productServiceClient.updateProductSerialsToSoldToCustomer(request, authApiKey);

            if (response.isSuccess()) {
                log.info("Successfully updated {} product serials to SOLD_TO_CUSTOMER status", serialNumbers.size());
            } else {
                log.error("Failed to update product serials status: {}", response.getMessage());
            }
        } catch (Exception e) {
            log.error("Error updating product serials status: {}", e.getMessage());
        }
    }

    private WarrantyResponse mapToResponse(Warranty warranty) {
        return warrantyMapper.toWarrantyResponse(warranty);
    }

    private WarrantyResponse mapToResponseWithDetails(Warranty warranty) {
        // Start with basic mapping
        WarrantyResponse response = warrantyMapper.toWarrantyResponse(warranty);

        // Add customer information from warranty entity
        CustomerInfo customerInfo = CustomerInfo.builder()
                .name(warranty.getCustomerName())
                .email(warranty.getCustomerEmail())
                .phone(warranty.getCustomerPhone())
                .address(warranty.getCustomerAddress())
                .build();
        response.setCustomer(customerInfo);

        // Add product serial information
        ProductSerialInfo productSerialInfo = getProductSerialInfo(warranty.getIdProductSerial());
        response.setProductSerial(productSerialInfo);

        return response;
    }

    private ProductSerialInfo getProductSerialInfo(Long productSerialId) {
        try {
            var response = productServiceClient.getProductSerialDetails(productSerialId, authApiKey);
            if (response.isSuccess() && response.getData() != null) {
                return response.getData(); // Direct return since DTOs are now the same
            }
        } catch (Exception e) {
            log.warn("Could not get product serial details for ID {}: {}", productSerialId, e.getMessage());
        }

        // Fallback data
        return ProductSerialInfo.builder()
                .id(productSerialId)
                .serialNumber("Unknown")
                .productName("Unknown Product")
                .productSku("")
                .status("UNKNOWN")
                .image(null)
                .build();
    }
}