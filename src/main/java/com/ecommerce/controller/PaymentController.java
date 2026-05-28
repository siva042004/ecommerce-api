package com.ecommerce.controller;

import com.ecommerce.dto.request.PaymentRequest;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Payments", description = "Payment processing")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Process payment for an order")
    public ResponseEntity<PaymentResponse> processPayment(@AuthenticationPrincipal UserDetails userDetails,
                                                           @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.processPayment(request, userDetails.getUsername()));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment details for an order")
    public ResponseEntity<PaymentResponse> getPayment(@AuthenticationPrincipal UserDetails userDetails,
                                                       @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId, userDetails.getUsername()));
    }
}
