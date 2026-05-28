package com.ecommerce.service.impl;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import com.ecommerce.service.CartService;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Override
    public OrderResponse placeOrder(String userEmail, OrderRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty"));
        if (cart.getItems().isEmpty()) throw new BadRequestException("Cart is empty");

        Order order = Order.builder()
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .status(Order.OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity())
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
            return OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();
        }).toList();

        order.setItems(orderItems);
        order.setTotalAmount(orderItems.stream()
                .map(i -> i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        Order saved = orderRepository.save(order);
        cartService.clearCart(userEmail);
        return toResponse(saved);
    }

    @Override @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, String userEmail) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN)
            throw new BadRequestException("Access denied");
        return toResponse(order);
    }

    @Override @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return orderRepository.findByUserId(user.getId(), pageable).map(this::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse cancelOrder(Long id, String userEmail) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        if (!order.getUser().getId().equals(user.getId()))
            throw new BadRequestException("Access denied");
        if (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED)
            throw new BadRequestException("Cannot cancel order in status: " + order.getStatus());
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.getItems().forEach(item -> {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        });
        return toResponse(orderRepository.save(order));
    }

    private OrderResponse toResponse(Order o) {
        List<OrderResponse.OrderItemResponse> items = o.getItems().stream().map(i ->
                OrderResponse.OrderItemResponse.builder()
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .quantity(i.getQuantity())
                        .priceAtPurchase(i.getPriceAtPurchase())
                        .subtotal(i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                        .build()
        ).toList();
        return OrderResponse.builder()
                .id(o.getId())
                .status(o.getStatus().name())
                .totalAmount(o.getTotalAmount())
                .shippingAddress(o.getShippingAddress())
                .items(items)
                .createdAt(o.getCreatedAt())
                .build();
    }
}
