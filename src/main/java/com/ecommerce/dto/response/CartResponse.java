package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartResponse {
    private Long id;
    private List<CartItemResponse> items;
    private BigDecimal totalPrice;
    private int totalItems;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String imageUrl;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal subtotal;
    }
}
