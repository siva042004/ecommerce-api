package com.ecommerce.service.impl;

import com.ecommerce.dto.request.PaymentRequest;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import com.ecommerce.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    public PaymentResponse processPayment(PaymentRequest request, String userEmail) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        if (!order.getUser().getId().equals(user.getId()))
            throw new BadRequestException("Access denied");
        if (order.getStatus() != Order.OrderStatus.PENDING)
            throw new BadRequestException("Order is not in PENDING state");
        if (paymentRepository.findByOrderId(order.getId()).isPresent())
            throw new BadRequestException("Payment already processed for this order");

        String txnId = request.getTransactionId() != null
                ? request.getTransactionId()
                : "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .method(request.getMethod())
                .status(Payment.PaymentStatus.COMPLETED)
                .transactionId(txnId)
                .build();

        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setPaymentId(txnId);
        orderRepository.save(order);

        return toResponse(paymentRepository.save(payment));
    }

    @Override @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN)
            throw new BadRequestException("Access denied");
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
        return toResponse(payment);
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrder().getId())
                .amount(p.getAmount())
                .status(p.getStatus().name())
                .method(p.getMethod().name())
                .transactionId(p.getTransactionId())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
