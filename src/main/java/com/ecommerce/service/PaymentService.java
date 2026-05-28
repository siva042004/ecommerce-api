package com.ecommerce.service;

import com.ecommerce.dto.request.PaymentRequest;
import com.ecommerce.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request, String userEmail);
    PaymentResponse getPaymentByOrderId(Long orderId, String userEmail);
}
