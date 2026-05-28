package com.ecommerce.controller;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Cart", description = "Shopping cart management")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCart(userDetails.getUsername()));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal UserDetails userDetails,
                                                 @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(userDetails.getUsername(), request));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<CartResponse> updateItem(@AuthenticationPrincipal UserDetails userDetails,
                                                    @PathVariable Long itemId,
                                                    @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateItem(userDetails.getUsername(), itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<CartResponse> removeItem(@AuthenticationPrincipal UserDetails userDetails,
                                                    @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(userDetails.getUsername(), itemId));
    }

    @DeleteMapping
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
