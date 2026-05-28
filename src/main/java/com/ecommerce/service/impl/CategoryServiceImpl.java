package com.ecommerce.service.impl;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor @Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName()))
            throw new BadRequestException("Category already exists: " + request.getName());
        Category cat = Category.builder().name(request.getName()).description(request.getDescription()).build();
        return toResponse(categoryRepository.save(cat));
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category cat = findById(id);
        cat.setName(request.getName());
        cat.setDescription(request.getDescription());
        return toResponse(categoryRepository.save(cat));
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.delete(findById(id));
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId()).name(c.getName()).description(c.getDescription())
                .productCount(c.getProducts() != null ? c.getProducts().size() : 0)
                .build();
    }
}
