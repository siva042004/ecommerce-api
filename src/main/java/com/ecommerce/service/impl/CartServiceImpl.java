package com.ecommerce.service.impl;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import com.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override @Transactional(readOnly = true)
    public CartResponse getCart(String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        return toResponse(cart);
    }

    @Override
    public CartResponse addItem(String userEmail, CartItemRequest request) {
        Cart cart = getOrCreateCart(userEmail);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));
        if (!product.getActive()) throw new BadRequestException("Product is not available");
        if (product.getStockQuantity() < request.getQuantity())
            throw new BadRequestException("Insufficient stock. Available: " + product.getStockQuantity());

        cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .ifPresentOrElse(
                        item -> item.setQuantity(item.getQuantity() + request.getQuantity()),
                        () -> cart.getItems().add(CartItem.builder().cart(cart).product(product).quantity(request.getQuantity()).build())
                );
        return toResponse(cartRepository.save(cart));
    }

    @Override
    public CartResponse updateItem(String userEmail, Long itemId, Integer quantity) {
        Cart cart = getOrCreateCart(userEmail);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (item.getProduct().getStockQuantity() < quantity)
                throw new BadRequestException("Insufficient stock");
            item.setQuantity(quantity);
        }
        return toResponse(cartRepository.save(cart));
    }

    @Override
    public CartResponse removeItem(String userEmail, Long itemId) {
        Cart cart = getOrCreateCart(userEmail);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        return toResponse(cartRepository.save(cart));
    }

    @Override
    public void clearCart(String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> items = cart.getItems().stream().map(item ->
                CartResponse.CartItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .imageUrl(item.getProduct().getImageUrl())
                        .price(item.getProduct().getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build()
        ).toList();
        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .totalPrice(cart.getTotalPrice())
                .totalItems(items.stream().mapToInt(CartResponse.CartItemResponse::getQuantity).sum())
                .build();
    }
}
