package com.devwonder.cartservice.service;

import com.devwonder.cartservice.dto.AddToCartRequest;
import com.devwonder.cartservice.dto.CartResponse;
import com.devwonder.cartservice.entity.ProductOfCart;
import com.devwonder.cartservice.mapper.CartMapper;
import com.devwonder.cartservice.repository.ProductOfCartRepository;
import com.devwonder.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DealerCartService {

    private final ProductOfCartRepository productOfCartRepository;
    private final CartMapper cartMapper;

    @Transactional
    public CartResponse addProductToCart(AddToCartRequest request) {
        log.info("Adding product {} to dealer {} cart with quantity {}",
                request.getProductId(), request.getDealerId(), request.getQuantity());

        // Check if dealer already has this exact product with same price in cart
        Optional<ProductOfCart> existingCart = productOfCartRepository.findByDealerIdAndProductIdAndUnitPrice(
                request.getDealerId(), request.getProductId(), request.getUnitPrice());

        if (existingCart.isPresent()) {
            // Update quantity only (same product, same price)
            ProductOfCart cart = existingCart.get();
            int newQuantity = cart.getQuantity() + request.getQuantity();

            // Validate total quantity doesn't exceed limit
            if (newQuantity > 999) {
                throw new IllegalArgumentException("Total quantity cannot exceed 999. Current: " + cart.getQuantity() + ", Adding: " + request.getQuantity());
            }

            cart.setQuantity(newQuantity);
            productOfCartRepository.save(cart);
            log.info("Updated existing cart item for dealer {} product {}, new quantity: {}, price: {}",
                    request.getDealerId(), request.getProductId(), cart.getQuantity(), request.getUnitPrice());
        } else {
            // Create new cart item (different price or new product)
            ProductOfCart newCart = ProductOfCart.builder()
                    .dealerId(request.getDealerId())
                    .productId(request.getProductId())
                    .quantity(request.getQuantity())
                    .unitPrice(request.getUnitPrice())
                    .build();
            productOfCartRepository.save(newCart);
            log.info("Created new cart item for dealer {} product {} with quantity {} and price {}",
                    request.getDealerId(), request.getProductId(), request.getQuantity(), request.getUnitPrice());
        }

        return getDealerCart(request.getDealerId());
    }

    @Transactional(readOnly = true)
    public CartResponse getDealerCart(Long dealerId) {
        log.info("Retrieving cart for dealer {}", dealerId);

        List<ProductOfCart> cartItems = productOfCartRepository.findByDealerId(dealerId);

        List<CartResponse.CartItemResponse> items = cartMapper.toCartItemResponseList(cartItems);

        // Calculate totals in a single pass
        int totalItems = cartItems.stream()
                .mapToInt(ProductOfCart::getQuantity)
                .sum();

        BigDecimal totalPrice = cartItems.stream()
                .map(cart -> cart.getUnitPrice().multiply(BigDecimal.valueOf(cart.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .dealerId(dealerId)
                .items(items)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .lastUpdated(cartItems.stream()
                        .map(ProductOfCart::getUpdatedAt)
                        .max(java.time.LocalDateTime::compareTo)
                        .orElse(null))
                .build();
    }

    @Transactional
    public void removeCartItem(Long cartId) {
        log.info("Removing cart item with ID: {}", cartId);

        ProductOfCart cartItem = productOfCartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartId));

        productOfCartRepository.delete(cartItem);
        log.info("Removed cart item with ID: {} (dealerId: {}, productId: {})",
                cartId, cartItem.getDealerId(), cartItem.getProductId());
    }


    @Transactional
    public CartResponse incrementProductQuantity(Long cartId, Integer increment) {
        log.info("Incrementing cart item {} quantity by {}", cartId, increment);

        ProductOfCart cart = productOfCartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartId));

        int newQuantity = cart.getQuantity() + increment;

        // Validate quantity doesn't exceed limit
        if (newQuantity > 999) {
            throw new IllegalArgumentException("Total quantity cannot exceed 999. Current: " + cart.getQuantity() + ", Increment: " + increment);
        }

        cart.setQuantity(newQuantity);
        productOfCartRepository.save(cart);
        log.info("Incremented cart item {} quantity from {} to {} for dealer {} product {}",
                cartId, cart.getQuantity() - increment, newQuantity, cart.getDealerId(), cart.getProductId());

        return getDealerCart(cart.getDealerId());
    }

    @Transactional
    public CartResponse decrementProductQuantity(Long cartId, Integer decrement) {
        log.info("Decrementing cart item {} quantity by {}", cartId, decrement);

        ProductOfCart cart = productOfCartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartId));

        int newQuantity = cart.getQuantity() - decrement;

        if (newQuantity < 0) {
            throw new IllegalArgumentException("Cannot decrement below 0. Current quantity: " + cart.getQuantity() + ", Decrement: " + decrement);
        }

        if (newQuantity == 0) {
            productOfCartRepository.delete(cart);
            log.info("Removed cart item {} (dealer {} product {}) - quantity reached 0", cartId, cart.getDealerId(), cart.getProductId());
        } else {
            cart.setQuantity(newQuantity);
            productOfCartRepository.save(cart);
            log.info("Decremented cart item {} quantity from {} to {} for dealer {} product {}",
                    cartId, cart.getQuantity() + decrement, newQuantity, cart.getDealerId(), cart.getProductId());
        }

        return getDealerCart(cart.getDealerId());
    }

    @Transactional
    public CartResponse setProductQuantity(Long cartId, Integer newQuantity) {
        log.info("Setting cart item {} quantity to {}", cartId, newQuantity);

        ProductOfCart cart = productOfCartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartId));

        if (newQuantity == 0) {
            productOfCartRepository.delete(cart);
            log.info("Removed cart item {} (dealer {} product {}) - quantity set to 0", cartId, cart.getDealerId(), cart.getProductId());
        } else {
            cart.setQuantity(newQuantity);
            productOfCartRepository.save(cart);
            log.info("Set cart item {} quantity to {} for dealer {} product {}",
                    cartId, newQuantity, cart.getDealerId(), cart.getProductId());
        }

        return getDealerCart(cart.getDealerId());
    }

    @Transactional
    public void clearDealerCart(Long dealerId) {
        log.info("Clearing all cart items for dealer {}", dealerId);

        // Count items before deletion for logging
        List<ProductOfCart> cartItems = productOfCartRepository.findByDealerId(dealerId);
        int itemCount = cartItems.size();

        if (itemCount == 0) {
            log.info("No cart items found for dealer {}", dealerId);
            return;
        }

        // Delete all cart items for the dealer
        productOfCartRepository.deleteByDealerId(dealerId);

        log.info("Cleared {} cart items for dealer {}", itemCount, dealerId);
    }
}