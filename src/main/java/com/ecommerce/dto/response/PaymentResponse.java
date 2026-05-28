package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private BigDecimal amount;
    private String status;
    private String method;
    private String transactionId;
    private LocalDateTime createdAt;
}
