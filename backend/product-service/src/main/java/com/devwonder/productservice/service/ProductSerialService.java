package com.devwonder.productservice.service;

import com.devwonder.common.exception.ResourceAlreadyExistsException;
import com.devwonder.common.exception.ResourceNotFoundException;
import com.devwonder.productservice.exception.ProductNotFoundException;
import com.devwonder.productservice.dto.ProductSerialCreateRequest;
import com.devwonder.productservice.dto.ProductSerialResponse;
import com.devwonder.productservice.dto.ProductSerialBulkCreateRequest;
import com.devwonder.productservice.dto.ProductSerialBulkCreateResponse;
import com.devwonder.productservice.dto.ProductSerialStatusUpdateRequest;
import com.devwonder.productservice.dto.ProductInventoryResponse;
import com.devwonder.productservice.dto.OrderItemResponse;
import com.devwonder.productservice.enums.ProductSerialStatus;
import com.devwonder.productservice.entity.Product;
import com.devwonder.productservice.entity.ProductSerial;
import com.devwonder.productservice.mapper.ProductSerialMapper;
import com.devwonder.productservice.repository.ProductRepository;
import com.devwonder.productservice.repository.ProductSerialRepository;
import com.devwonder.productservice.client.OrderServiceClient;
import com.devwonder.common.enums.OrderItemStatus;
import com.devwonder.common.dto.BaseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductSerialService {
    
    private final ProductSerialRepository productSerialRepository;
    private final ProductRepository productRepository;
    private final ProductSerialMapper productSerialMapper;
    private final OrderServiceClient orderServiceClient;
    private final ProductStockService productStockService;
    
    @Transactional
    public ProductSerialResponse createProductSerial(ProductSerialCreateRequest request) {
        log.info("Creating new product serial: {}", request.getSerial());
        
        // Check if serial already exists
        if (productSerialRepository.existsBySerial(request.getSerial())) {
            throw new ResourceAlreadyExistsException("Product serial '" + request.getSerial() + "' already exists");
        }
        
        // Check if product exists
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + request.getProductId()));
        
        ProductSerial productSerial = ProductSerial.builder()
                .serial(request.getSerial())
                .product(product)
                .status(request.getStatus())
                .build();
        
        ProductSerial savedProductSerial = productSerialRepository.save(productSerial);
        log.info("Successfully created product serial with ID: {}", savedProductSerial.getId());

        // Update product stock automatically if status is IN_STOCK
        if (request.getStatus() == ProductSerialStatus.IN_STOCK) {
            productStockService.updateProductStock(request.getProductId());
        }

        return productSerialMapper.toProductSerialResponse(savedProductSerial);
    }

    public List<ProductSerialResponse> getProductSerialsByProductId(Long productId) {
        log.info("Fetching product serials for product ID: {}", productId);

        // Check if product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));

        List<ProductSerial> productSerials = productSerialRepository.findByProduct(product);

        return productSerials.stream()
                .map(productSerialMapper::toProductSerialResponse)
                .toList();
    }

    @Transactional
    public ProductSerialBulkCreateResponse createProductSerialsBulk(ProductSerialBulkCreateRequest request) {
        log.info("Creating bulk product serials for product ID: {} with {} serial numbers",
                request.getProductId(), request.getSerialNumbers().size());

        // Check if product exists
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + request.getProductId()));

        // Get existing serials to avoid duplicates
        Set<String> existingSerials = new HashSet<>(productSerialRepository.findSerialsByProduct(product));

        List<ProductSerial> serialsToCreate = new ArrayList<>();
        List<String> skippedSerials = new ArrayList<>();

        // Process each serial number
        for (String serialNumber : request.getSerialNumbers()) {
            if (existingSerials.contains(serialNumber)) {
                skippedSerials.add(serialNumber);
                log.debug("Skipping duplicate serial: {}", serialNumber);
            } else {
                serialsToCreate.add(ProductSerial.builder()
                        .serial(serialNumber)
                        .product(product)
                        .status(ProductSerialStatus.IN_STOCK)
                        .build());
            }
        }

        // Batch insert new serials
        List<ProductSerial> savedSerials = productSerialRepository.saveAll(serialsToCreate);
        log.info("Successfully created {} product serials, skipped {} duplicates for product ID: {}",
                savedSerials.size(), skippedSerials.size(), request.getProductId());

        // Update product stock automatically
        if (!savedSerials.isEmpty()) {
            productStockService.updateProductStock(request.getProductId());
        }

        // Map to response DTOs
        List<ProductSerialResponse> createdSerials = savedSerials.stream()
                .map(productSerialMapper::toProductSerialResponse)
                .toList();

        return ProductSerialBulkCreateResponse.builder()
                .productId(request.getProductId())
                .totalRequested(request.getSerialNumbers().size())
                .totalCreated(savedSerials.size())
                .totalSkipped(skippedSerials.size())
                .createdSerials(createdSerials)
                .skippedSerials(skippedSerials)
                .build();
    }

    @Transactional
    public void deleteProductSerial(Long serialId) {
        log.info("Deleting product serial with ID: {}", serialId);

        // Check if serial exists
        ProductSerial productSerial = productSerialRepository.findById(serialId)
                .orElseThrow(() -> new ProductNotFoundException("Product serial not found with ID: " + serialId));

        // Only allow deletion if status is IN_STOCK
        if (productSerial.getStatus() != ProductSerialStatus.IN_STOCK) {
            throw new IllegalStateException("Cannot delete product serial with ID: " + serialId +
                ". Only serials with IN_STOCK status can be deleted. Current status: " + productSerial.getStatus());
        }

        Long productId = productSerial.getProduct().getId();

        productSerialRepository.delete(productSerial);

        // Update product stock automatically
        productStockService.updateProductStock(productId);

        log.info("Successfully deleted product serial with ID: {}", serialId);
    }

    @Transactional
    public void deleteProductSerialsBulk(List<Long> serialIds) {
        log.info("Deleting {} product serials in bulk", serialIds.size());

        Set<Long> affectedProductIds = new HashSet<>();
        List<Long> deletedIds = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long serialId : serialIds) {
            try {
                ProductSerial productSerial = productSerialRepository.findById(serialId)
                        .orElseThrow(() -> new ProductNotFoundException("Product serial not found with ID: " + serialId));

                // Only allow deletion if status is IN_STOCK
                if (productSerial.getStatus() != ProductSerialStatus.IN_STOCK) {
                    String error = "Serial ID " + serialId + " cannot be deleted (Status: " + productSerial.getStatus() + ")";
                    errors.add(error);
                    log.warn(error);
                    continue;
                }

                Long productId = productSerial.getProduct().getId();

                productSerialRepository.delete(productSerial);
                deletedIds.add(serialId);
                affectedProductIds.add(productId);

                log.debug("Deleted product serial with ID: {}", serialId);
            } catch (Exception e) {
                String error = "Failed to delete serial ID " + serialId + ": " + e.getMessage();
                errors.add(error);
                log.error(error);
            }
        }

        // Update stock for all affected products
        for (Long productId : affectedProductIds) {
            productStockService.updateProductStock(productId);
        }

        log.info("Successfully deleted {} out of {} product serials", deletedIds.size(), serialIds.size());

        if (!errors.isEmpty()) {
            log.warn("Bulk deletion completed with {} errors: {}", errors.size(), String.join("; ", errors));
        }
    }

    @Transactional
    public ProductSerialResponse updateProductSerialStatus(Long serialId, ProductSerialStatusUpdateRequest request) {
        log.info("Updating status for product serial with ID: {} to {}", serialId, request.getStatus());

        // Check if serial exists
        ProductSerial productSerial = productSerialRepository.findById(serialId)
                .orElseThrow(() -> new ProductNotFoundException("Product serial not found with ID: " + serialId));

        productSerial.setStatus(request.getStatus());
        ProductSerial savedProductSerial = productSerialRepository.save(productSerial);

        // Update product stock automatically since status changed
        productStockService.updateProductStock(productSerial.getProduct().getId());

        log.info("Successfully updated status for product serial with ID: {} to {}", serialId, request.getStatus());

        return productSerialMapper.toProductSerialResponse(savedProductSerial);
    }

    public ProductInventoryResponse getProductInventory(Long productId) {
        log.info("Getting inventory for product ID: {}", productId);

        // Check if product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));

        // Count by status
        Long availableCount = productSerialRepository.countByProductAndStatus(product, ProductSerialStatus.IN_STOCK);
        Long soldCount = productSerialRepository.countByProductAndStatus(product, ProductSerialStatus.ALLOCATED_TO_DEALER);
        Long assignedCount = productSerialRepository.countByProductAndStatus(product, ProductSerialStatus.ASSIGN_TO_ORDER_ITEM);
        Long soldToCustomerCount = productSerialRepository.countByProductAndStatus(product, ProductSerialStatus.SOLD_TO_CUSTOMER);
        Long totalCount = productSerialRepository.countByProduct(product);

        log.info("Inventory for product ID {}: {} available, {} allocated to dealer, {} assigned to order, {} sold to customer, {} total",
                productId, availableCount, soldCount, assignedCount, soldToCustomerCount, totalCount);

        return ProductInventoryResponse.builder()
                .productId(productId)
                .productName(product.getName())
                .availableCount(availableCount)
                .soldCount(soldCount)
                .assignedCount(assignedCount)
                .soldToCustomerCount(soldToCustomerCount)
                .totalCount(totalCount)
                .build();
    }

    public Long getAvailableProductSerialCount(Long productId) {
        log.info("Getting available product serial count for product ID: {}", productId);

        // Check if product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));

        Long availableCount = productSerialRepository.countByProductAndStatus(product, ProductSerialStatus.IN_STOCK);

        log.info("Available product serial count for product ID {}: {}", productId, availableCount);

        return availableCount;
    }

    @Transactional(readOnly = true)
    public List<ProductSerialResponse> getProductSerialsByProductIdAndStatus(Long productId, ProductSerialStatus status) {
        log.info("Fetching product serials for product ID: {} with status: {}", productId, status);

        // Check if product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));

        List<ProductSerial> productSerials = productSerialRepository.findByProductAndStatus(product, status);

        List<ProductSerialResponse> responses = productSerials.stream()
                .map(productSerialMapper::toProductSerialResponse)
                .collect(Collectors.toList());

        log.info("Found {} product serials for product ID {} with status {}", responses.size(), productId, status);

        return responses;
    }

    @Transactional(readOnly = true)
    public Long getProductSerialIdBySerial(String serial) {
        log.info("Looking up product serial ID for serial: {}", serial);

        ProductSerial productSerial = productSerialRepository.findBySerial(serial)
                .orElseThrow(() -> new ResourceNotFoundException("Product serial not found: " + serial));

        log.info("Found product serial ID: {} for serial: {}", productSerial.getId(), serial);
        return productSerial.getId();
    }

    @Transactional
    public int updateProductSerialsToSoldToCustomer(List<String> serialNumbers) {
        log.info("Updating {} product serials to SOLD_TO_CUSTOMER status", serialNumbers.size());

        int updatedCount = 0;
        for (String serial : serialNumbers) {
            try {
                ProductSerial productSerial = productSerialRepository.findBySerial(serial)
                    .orElseThrow(() -> new ResourceNotFoundException("Product serial not found: " + serial));

                productSerial.setOrderItemId(null);
                productSerial.setDealerId(null);
                productSerial.setStatus(ProductSerialStatus.SOLD_TO_CUSTOMER);
                productSerialRepository.save(productSerial);
                updatedCount++;

                log.debug("Updated product serial {} to SOLD_TO_CUSTOMER", serial);
            } catch (Exception e) {
                log.error("Failed to update product serial {}: {}", serial, e.getMessage());
            }
        }

        log.info("Successfully updated {} out of {} product serials to SOLD_TO_CUSTOMER",
                updatedCount, serialNumbers.size());
        return updatedCount;
    }

    @Transactional
    public void assignSerialToOrderItem(Long serialId, Long orderItemId) {
        log.info("Assigning product serial {} to order item {}", serialId, orderItemId);

        ProductSerial productSerial = productSerialRepository.findById(serialId)
                .orElseThrow(() -> new ResourceNotFoundException("Product serial not found with ID: " + serialId));

        // Check if serial is available for assignment
        if (productSerial.getStatus() != ProductSerialStatus.IN_STOCK) {
            throw new IllegalStateException("Product serial " + serialId + " is not available for assignment. Current status: " + productSerial.getStatus());
        }

        // Check if serial is not already assigned
        if (productSerial.getOrderItemId() != null || productSerial.getDealerId() != null) {
            throw new IllegalStateException("Product serial " + serialId + " is already assigned");
        }

        productSerial.setOrderItemId(orderItemId);
        productSerial.setStatus(ProductSerialStatus.ASSIGN_TO_ORDER_ITEM);
        productSerialRepository.save(productSerial);

        log.info("Successfully assigned product serial {} to order item {} with status ASSIGN_TO_ORDER_ITEM",
                serialId, orderItemId);
    }

    @Transactional
    public void assignSerialsToOrderItem(List<Long> serialIds, Long orderItemId) {
        log.info("Assigning {} product serials to order item {}", serialIds.size(), orderItemId);

        // Validate assignment won't exceed order item quantity
        try {
            BaseResponse<OrderItemResponse> response = orderServiceClient.getOrderItem(orderItemId, "INTER_SERVICE_KEY");
            OrderItemResponse orderItem = response.getData();

            if (orderItem == null) {
                throw new ResourceNotFoundException("Order item not found with ID: " + orderItemId);
            }

            // Count all serials currently linked to this order item (both assigned and allocated)
            Long currentTotalCount = (long) productSerialRepository.findAllByOrderItemId(orderItemId).size();
            Long totalAfterAssignment = currentTotalCount + serialIds.size();

            if (totalAfterAssignment > orderItem.getQuantity()) {
                throw new IllegalArgumentException(
                    String.format("Cannot assign %d more serials to order item %d. Current total: %d, Max: %d",
                        serialIds.size(), orderItemId, currentTotalCount, orderItem.getQuantity())
                );
            }

            log.info("Assignment validation passed for order item {}: {} current total + {} new = {} (max: {})",
                orderItemId, currentTotalCount, serialIds.size(), totalAfterAssignment, orderItem.getQuantity());

        } catch (Exception e) {
            if (e instanceof ResourceNotFoundException || e instanceof IllegalArgumentException) {
                throw e;
            }
            log.error("Failed to validate assignment for order item {}: {}", orderItemId, e.getMessage());
            throw new RuntimeException("Failed to validate assignment: " + e.getMessage(), e);
        }

        // Proceed with assignment after validation
        Set<Long> affectedProductIds = new HashSet<>();
        for (Long serialId : serialIds) {
            ProductSerial serial = productSerialRepository.findById(serialId)
                    .orElseThrow(() -> new ProductNotFoundException("Product serial not found with ID: " + serialId));
            affectedProductIds.add(serial.getProduct().getId());
            assignSerialToOrderItem(serialId, orderItemId);
        }

        // Update stock for all affected products
        for (Long productId : affectedProductIds) {
            productStockService.updateProductStock(productId);
        }

        log.info("Successfully assigned {} product serials to order item {}", serialIds.size(), orderItemId);
    }

    public void unassignSerialFromOrderItem(Long serialId, Long orderItemId) {
        log.info("Unassigning product serial {} from order item {}", serialId, orderItemId);

        ProductSerial productSerial = productSerialRepository.findById(serialId)
                .orElseThrow(() -> new ResourceNotFoundException("Product serial not found with ID: " + serialId));

        // Check if serial is assigned to the specified order item
        if (productSerial.getStatus() != ProductSerialStatus.ASSIGN_TO_ORDER_ITEM) {
            throw new IllegalStateException("Product serial " + serialId + " is not assigned to order item. Current status: " + productSerial.getStatus());
        }

        if (!orderItemId.equals(productSerial.getOrderItemId())) {
            throw new IllegalStateException("Product serial " + serialId + " is not assigned to order item " + orderItemId);
        }

        productSerial.setOrderItemId(null);
        productSerial.setStatus(ProductSerialStatus.IN_STOCK);
        productSerialRepository.save(productSerial);

        log.info("Successfully unassigned product serial {} from order item {} with status IN_STOCK",
                serialId, orderItemId);
    }

    @Transactional
    public void unassignSerialsFromOrderItem(List<Long> serialIds, Long orderItemId) {
        log.info("Unassigning {} product serials from order item {}", serialIds.size(), orderItemId);

        Set<Long> affectedProductIds = new HashSet<>();
        for (Long serialId : serialIds) {
            ProductSerial serial = productSerialRepository.findById(serialId)
                    .orElseThrow(() -> new ProductNotFoundException("Product serial not found with ID: " + serialId));
            affectedProductIds.add(serial.getProduct().getId());
            unassignSerialFromOrderItem(serialId, orderItemId);
        }

        // Update stock for all affected products (serials become IN_STOCK again)
        for (Long productId : affectedProductIds) {
            productStockService.updateProductStock(productId);
        }

        log.info("Successfully unassigned {} product serials from order item {}", serialIds.size(), orderItemId);
    }


    @Transactional
    public void allocateSerialsToDealer(List<Long> serialIds, Long dealerId) {
        log.info("Allocating {} product serials to dealer {}", serialIds.size(), dealerId);

        // Validate allocation won't exceed order item requirements
        Map<Long, Integer> orderItemAllocationCount = new HashMap<>();

        // Pre-validate all serials and count allocations per order item
        for (Long serialId : serialIds) {
            ProductSerial productSerial = productSerialRepository.findById(serialId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product serial not found with ID: " + serialId));

            // Check if serial is assigned to order item
            if (productSerial.getStatus() != ProductSerialStatus.ASSIGN_TO_ORDER_ITEM) {
                throw new IllegalStateException("Product serial " + serialId + " is not assigned to order item. Current status: " + productSerial.getStatus());
            }

            Long orderItemId = productSerial.getOrderItemId();
            if (orderItemId != null) {
                orderItemAllocationCount.merge(orderItemId, 1, Integer::sum);
            }
        }

        // Validate against order item quantities
        for (Map.Entry<Long, Integer> entry : orderItemAllocationCount.entrySet()) {
            Long orderItemId = entry.getKey();
            Integer newAllocations = entry.getValue();

            try {
                BaseResponse<OrderItemResponse> response = orderServiceClient.getOrderItem(orderItemId, "INTER_SERVICE_KEY");
                OrderItemResponse orderItem = response.getData();

                if (orderItem == null) {
                    throw new ResourceNotFoundException("Order item not found with ID: " + orderItemId);
                }

                // Count currently allocated serials
                Long currentAllocatedCount = productSerialRepository.countAllocatedSerialsByOrderItem(orderItemId);
                Long totalAfterAllocation = currentAllocatedCount + newAllocations;

                if (totalAfterAllocation > orderItem.getQuantity()) {
                    throw new IllegalArgumentException(
                        String.format("Cannot allocate %d more serials to order item %d. Current: %d, Max: %d",
                            newAllocations, orderItemId, currentAllocatedCount, orderItem.getQuantity())
                    );
                }

                log.info("Allocation validation passed for order item {}: {} current + {} new = {} (max: {})",
                    orderItemId, currentAllocatedCount, newAllocations, totalAfterAllocation, orderItem.getQuantity());

            } catch (Exception e) {
                if (e instanceof ResourceNotFoundException || e instanceof IllegalArgumentException) {
                    throw e;
                }
                log.error("Failed to validate allocation for order item {}: {}", orderItemId, e.getMessage());
                throw new RuntimeException("Failed to validate allocation: " + e.getMessage(), e);
            }
        }

        // Proceed with allocation (validation already done)
        Set<Long> affectedOrderItems = new HashSet<>();
        Set<Long> affectedProductIds = new HashSet<>();

        for (Long serialId : serialIds) {
            ProductSerial productSerial = productSerialRepository.findById(serialId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product serial not found with ID: " + serialId));

            // Track the order item for completion checking
            if (productSerial.getOrderItemId() != null) {
                affectedOrderItems.add(productSerial.getOrderItemId());
            }

            // Track affected products for stock update
            affectedProductIds.add(productSerial.getProduct().getId());

            // Keep order item ID and set dealer ID
            productSerial.setDealerId(dealerId);
            productSerial.setStatus(ProductSerialStatus.ALLOCATED_TO_DEALER);
            productSerialRepository.save(productSerial);

            log.debug("Allocated product serial {} to dealer {} with status ALLOCATED_TO_DEALER", serialId, dealerId);
        }

        // Update stock for all affected products (ensure consistency)
        for (Long productId : affectedProductIds) {
            productStockService.updateProductStock(productId);
        }

        // Check each affected order item for completion
        for (Long orderItemId : affectedOrderItems) {
            checkAndUpdateOrderItemCompletion(orderItemId);
        }

        log.info("Successfully allocated {} product serials to dealer {}", serialIds.size(), dealerId);
    }

    @Transactional(readOnly = true)
    public List<ProductSerialResponse> getAssignedSerialsByOrderItemId(Long orderItemId) {
        log.info("Getting assigned product serials for order item ID: {}", orderItemId);

        List<ProductSerial> productSerials = productSerialRepository.findByOrderItemIdAndStatus(orderItemId, ProductSerialStatus.ASSIGN_TO_ORDER_ITEM);

        List<ProductSerialResponse> responses = productSerials.stream()
                .map(productSerialMapper::toProductSerialResponse)
                .collect(Collectors.toList());

        log.info("Found {} assigned product serials for order item ID {}", responses.size(), orderItemId);

        return responses;
    }

    @Transactional(readOnly = true)
    public List<ProductSerialResponse> getAllocatedSerialsByOrderItemId(Long orderItemId) {
        log.info("Getting allocated product serials for order item ID: {}", orderItemId);

        List<ProductSerial> productSerials = productSerialRepository.findByOrderItemIdAndStatus(orderItemId, ProductSerialStatus.ALLOCATED_TO_DEALER);

        List<ProductSerialResponse> responses = productSerials.stream()
                .map(productSerialMapper::toProductSerialResponse)
                .collect(Collectors.toList());

        log.info("Found {} allocated product serials for order item ID {}", responses.size(), orderItemId);

        return responses;
    }

    @Transactional(readOnly = true)
    public com.devwonder.productservice.dto.ProductSerialDetailsResponse getProductSerialDetails(Long productSerialId) {
        log.info("Getting product serial details for ID: {}", productSerialId);

        ProductSerial productSerial = productSerialRepository.findById(productSerialId)
                .orElseThrow(() -> new ResourceNotFoundException("Product serial not found with ID: " + productSerialId));

        Product product = productSerial.getProduct();

        com.devwonder.productservice.dto.ProductSerialDetailsResponse response =
            com.devwonder.productservice.dto.ProductSerialDetailsResponse.builder()
                .id(productSerial.getId())
                .serialNumber(productSerial.getSerial())
                .productName(product.getName())
                .productSku(product.getSku())
                .status(productSerial.getStatus().toString())
                .image(product.getImage())
                .build();

        log.info("Retrieved product serial details for ID: {} - serial: {}, product: {}",
                productSerialId, productSerial.getSerial(), product.getName());

        return response;
    }

    private void checkAndUpdateOrderItemCompletion(Long orderItemId) {
        log.debug("Checking completion status for order item: {}", orderItemId);

        try {
            // Get order item details to check required quantity
            BaseResponse<OrderItemResponse> response = orderServiceClient.getOrderItem(orderItemId, "INTER_SERVICE_KEY");
            OrderItemResponse orderItem = response.getData();

            if (orderItem == null) {
                log.error("Order item not found with ID: {}", orderItemId);
                return;
            }

            // Count allocated serials for this order item
            Long allocatedCount = productSerialRepository.countAllocatedSerialsByOrderItem(orderItemId);

            log.debug("Order item {} has {} allocated serials out of {} required",
                orderItemId, allocatedCount, orderItem.getQuantity());

            // If allocated count equals required quantity, mark order item as completed
            if (allocatedCount.equals(orderItem.getQuantity().longValue())) {
                log.info("All required serials ({}/{}) allocated for order item {}. Updating status to COMPLETED.",
                    allocatedCount, orderItem.getQuantity(), orderItemId);

                // Call order service to update status
                orderServiceClient.updateOrderItemStatus(orderItemId, OrderItemStatus.COMPLETED, "INTER_SERVICE_KEY");

                log.info("Successfully updated order item {} status to COMPLETED", orderItemId);
            } else {
                log.debug("Order item {} has {}/{} serials allocated, keeping status as PENDING",
                    orderItemId, allocatedCount, orderItem.getQuantity());
            }

        } catch (Exception e) {
            log.error("Failed to check/update completion status for order item {}: {}", orderItemId, e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<Long> getProductIdsWithSerialsByDealer(Long dealerId) {
        log.info("Getting product IDs with serials for dealer: {}", dealerId);

        List<Long> productIds = productSerialRepository.findDistinctProductIdsByDealerId(dealerId);

        log.info("Found {} distinct product IDs with serials for dealer: {}", productIds.size(), dealerId);

        return productIds;
    }

    @Transactional(readOnly = true)
    public List<ProductSerialResponse> getProductSerialsByProductIdAndDealerId(Long productId, Long dealerId) {
        log.info("Getting product serials for product ID: {} and dealer ID: {}", productId, dealerId);

        // Validate product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));

        List<ProductSerial> productSerials = productSerialRepository.findByProductIdAndDealerId(productId, dealerId);

        List<ProductSerialResponse> responses = productSerials.stream()
                .map(productSerialMapper::toProductSerialResponse)
                .collect(Collectors.toList());

        log.info("Found {} product serials for product ID: {} and dealer ID: {}", responses.size(), productId, dealerId);

        return responses;
    }
}