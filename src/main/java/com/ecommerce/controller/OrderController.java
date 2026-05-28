package com.ecommerce.controller;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Orders", description = "Order management")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place a new order from cart")
    public ResponseEntity<OrderResponse> placeOrder(@AuthenticationPrincipal UserDetails userDetails,
                                                     @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(userDetails.getUsername(), request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<OrderResponse> getOrder(@AuthenticationPrincipal UserDetails userDetails,
                                                   @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id, userDetails.getUsername()));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get current user's orders")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getUserOrders(userDetails.getUsername(),
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders (Admin only)")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status (Admin only)")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                       @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order")
    public ResponseEntity<OrderResponse> cancelOrder(@AuthenticationPrincipal UserDetails userDetails,
                                                      @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id, userDetails.getUsername()));
    }
}
