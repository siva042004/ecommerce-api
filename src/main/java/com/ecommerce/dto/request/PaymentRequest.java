package com.ecommerce.dto.request;

import com.ecommerce.entity.Payment;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull
    private Long orderId;
    @NotNull
    private Payment.PaymentMethod method;
    private String transactionId;
}
