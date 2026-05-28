package com.ecommerce.service;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse placeOrder(String userEmail, OrderRequest request);
    OrderResponse getOrderById(Long id, String userEmail);
    Page<OrderResponse> getUserOrders(String userEmail, Pageable pageable);
    Page<OrderResponse> getAllOrders(Pageable pageable);
    OrderResponse updateOrderStatus(Long id, Order.OrderStatus status);
    OrderResponse cancelOrder(Long id, String userEmail);
}
