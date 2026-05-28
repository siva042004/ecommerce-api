package com.ecommerce.dto.response;

import com.ecommerce.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal priceAtPurchase;
        private BigDecimal subtotal;
    }
}
