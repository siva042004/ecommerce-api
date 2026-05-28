package com.ecommerce.service.impl;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable).map(this::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.searchProducts(keyword, minPrice, maxPrice, pageable).map(this::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .imageUrl(request.getImageUrl())
                .category(category)
                .active(true)
                .build();
        return toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findById(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);
        return toResponse(productRepository.save(product));
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = findById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stockQuantity(p.getStockQuantity())
                .imageUrl(p.getImageUrl())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
